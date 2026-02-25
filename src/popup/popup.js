import { Chess } from '../../lib/chess.js';

let engine;
let board;
let fen_cache;
let config;

let is_calculating = false;
let prog = 0;
let last_eval = { fen: '', activeLines: 0, lines: [] };
let cachedVoices = [];

// Pre-load speech synthesis voices (they load asynchronously in Chrome)
if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
        console.log('Voices loaded:', cachedVoices.length);
    };
}
let turn = ''; // 'w' | 'b'

document.addEventListener('DOMContentLoaded', async function () {
    // load extension configurations from localStorage
    const computeTime = JSON.parse(localStorage.getItem('compute_time'));
    const fenRefresh = JSON.parse(localStorage.getItem('fen_refresh'));
    const thinkTime = JSON.parse(localStorage.getItem('think_time'));
    const thinkVariance = JSON.parse(localStorage.getItem('think_variance'));
    const moveTime = JSON.parse(localStorage.getItem('move_time'));
    const moveVariance = JSON.parse(localStorage.getItem('move_variance'));
    config = {
        // general settings
        engine: JSON.parse(localStorage.getItem('engine')) || 'stockfish-16-nnue-7',
        variant: JSON.parse(localStorage.getItem('variant')) || 'chess',
        compute_time: (computeTime != null) ? computeTime : 3000,
        fen_refresh: (fenRefresh != null) ? fenRefresh : 100,
        multiple_lines: Math.max(4, JSON.parse(localStorage.getItem('multiple_lines')) || 4),
        threads: JSON.parse(localStorage.getItem('threads')) || navigator.hardwareConcurrency - 1,
        memory: JSON.parse(localStorage.getItem('memory')) || 32,
        think_time: (thinkTime != null) ? thinkTime : 1000,
        think_variance: (thinkVariance != null) ? thinkVariance : 500,
        move_time: (moveTime != null) ? moveTime : 500,
        move_variance: (moveVariance != null) ? moveVariance : 250,
        computer_evaluation: JSON.parse(localStorage.getItem('computer_evaluation')) || false,
        threat_analysis: JSON.parse(localStorage.getItem('threat_analysis')) || false,
        simon_says_mode: JSON.parse(localStorage.getItem('simon_says_mode')) || false,
        autoplay: JSON.parse(localStorage.getItem('autoplay')) || false,
        human_mode: JSON.parse(localStorage.getItem('human_mode')) || false,
        puzzle_mode: JSON.parse(localStorage.getItem('puzzle_mode')) || false,
        python_autoplay_backend: JSON.parse(localStorage.getItem('python_autoplay_backend')) || false,
        voice_narration: JSON.parse(localStorage.getItem('voice_narration')) || false,
        voice_gender: JSON.parse(localStorage.getItem('voice_gender')) || 'male',
        narrate_eval: JSON.parse(localStorage.getItem('narrate_eval')) || false,
        move_display: JSON.parse(localStorage.getItem('move_display')) || 'arrows',
        // appearance settings
        pieces: JSON.parse(localStorage.getItem('pieces')) || 'wikipedia.svg',
        board: JSON.parse(localStorage.getItem('board')) || 'brown',
        coordinates: JSON.parse(localStorage.getItem('coordinates')) || false,
    };
    push_config();

    // init chess board
    document.getElementById('board').classList.add(config.board);
    const [pieceSet, ext] = config.pieces.split('.');
    board = ChessBoard('board', {
        position: 'start',
        pieceTheme: `/res/chesspieces/${pieceSet}/{piece}.${ext}`,
        appearSpeed: 'fast',
        moveSpeed: 'fast',
        showNotation: config.coordinates,
        draggable: false
    });

    const isDarkMode = JSON.parse(localStorage.getItem('dark_mode')) || false;
    if (isDarkMode) document.body.classList.add('dark-mode');

    // restore quick settings panel state from previous reload
    if (JSON.parse(localStorage.getItem('quick_settings_open'))) {
        document.body.classList.add('quick-settings-open');
        document.documentElement.classList.add('quick-settings-open');
        localStorage.removeItem('quick_settings_open');
    }

    // restore collapsed state
    const collapseToggle = document.getElementById('collapse-toggle');
    if (JSON.parse(localStorage.getItem('popup_collapsed'))) {
        document.body.classList.add('popup-collapsed');
        document.documentElement.classList.add('popup-collapsed');
        collapseToggle.textContent = 'visibility_off';
        collapseToggle.title = 'Expand popup';
    }

    document.getElementById('quick-config').addEventListener('click', () => {
        document.body.classList.toggle('quick-settings-open');
        document.documentElement.classList.toggle('quick-settings-open');
    });
    document.getElementById('close-quick-settings').addEventListener('click', () => {
        document.body.classList.remove('quick-settings-open');
        document.documentElement.classList.remove('quick-settings-open');
    });

    // collapse/expand toggle
    collapseToggle.addEventListener('click', () => {
        const isCollapsed = document.body.classList.toggle('popup-collapsed');
        document.documentElement.classList.toggle('popup-collapsed');
        collapseToggle.textContent = isCollapsed ? 'visibility_off' : 'visibility';
        collapseToggle.title = isCollapsed ? 'Expand popup' : 'Minimize popup';
        localStorage.setItem('popup_collapsed', JSON.stringify(isCollapsed));

        // close quick settings when collapsing
        if (isCollapsed) {
            document.body.classList.remove('quick-settings-open');
            document.documentElement.classList.remove('quick-settings-open');
        }
    });

    document.getElementById('dark_mode_toggle').checked = isDarkMode;
    document.getElementById('autoplay_toggle').checked = config.autoplay;
    document.getElementById('human_mode_toggle').checked = config.human_mode;
    document.getElementById('voice_narration_toggle').checked = config.voice_narration;
    document.getElementById('voice_gender_select').value = config.voice_gender;
    document.getElementById('puzzle_mode_toggle').checked = config.puzzle_mode;
    document.getElementById('engine_select').value = config.engine;
    document.getElementById('pieces_select').value = config.pieces;
    document.getElementById('board_select').value = config.board;
    document.getElementById('strength_preset_select').value = JSON.parse(localStorage.getItem('strength_preset')) || 'custom';

    document.getElementById('dark_mode_toggle').addEventListener('change', (e) => {
        localStorage.setItem('dark_mode', JSON.stringify(e.target.checked));
        if (e.target.checked) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
    });

    document.getElementById('autoplay_toggle').addEventListener('change', (e) => {
        config.autoplay = e.target.checked;
        localStorage.setItem('autoplay', JSON.stringify(config.autoplay));
        push_config();
    });

    document.getElementById('puzzle_mode_toggle').addEventListener('change', (e) => {
        config.puzzle_mode = e.target.checked;
        localStorage.setItem('puzzle_mode', JSON.stringify(config.puzzle_mode));
        push_config();
    });

    document.getElementById('voice_narration_toggle').addEventListener('change', (e) => {
        config.voice_narration = e.target.checked;
        localStorage.setItem('voice_narration', JSON.stringify(config.voice_narration));
        if (config.voice_narration) {
            narrate_move('Voice narration enabled.');
        } else {
            window.speechSynthesis.cancel();
        }
        push_config();
    });

    document.getElementById('voice_gender_select').addEventListener('change', (e) => {
        config.voice_gender = e.target.value;
        localStorage.setItem('voice_gender', JSON.stringify(config.voice_gender));
        if (config.voice_narration) {
            narrate_move(config.voice_gender === 'female' ? 'Female voice selected.' : 'Male voice selected.');
        }
    });

    document.getElementById('move_display_select').value = config.move_display;
    document.getElementById('move_display_select').addEventListener('change', (e) => {
        config.move_display = e.target.value;
        localStorage.setItem('move_display', JSON.stringify(config.move_display));
        clear_annotations();
        if (!config.simon_says_mode) {
            draw_moves();
            if (config.threat_analysis) draw_threat();
        }
        push_config();
    });

    document.getElementById('human_mode_toggle').addEventListener('change', (e) => {
        config.human_mode = e.target.checked;
        localStorage.setItem('human_mode', JSON.stringify(config.human_mode));

        let needsReload = false;

        if (config.human_mode) {
            if (!config.autoplay) {
                config.autoplay = true;
                document.getElementById('autoplay_toggle').checked = true;
                localStorage.setItem('autoplay', JSON.stringify(true));
            }

            if (config.engine !== 'lc0') {
                config.engine = 'lc0';
                document.getElementById('engine_select').value = 'lc0';
                localStorage.setItem('engine', JSON.stringify(config.engine));

                const currPreset = document.getElementById('strength_preset_select').value;
                if (currPreset !== 'custom') {
                    document.getElementById('strength_preset_select').value = 'custom';
                    localStorage.setItem('strength_preset', JSON.stringify('custom'));
                }

                needsReload = true;
            }
        }

        if (needsReload) {
            localStorage.setItem('quick_settings_open', JSON.stringify(true));
            push_config();
            window.location.reload();
        } else {
            push_config();
        }
    });

    document.getElementById('board_select').addEventListener('change', (e) => {
        document.getElementById('board').classList.remove(config.board);
        config.board = e.target.value;
        document.getElementById('board').classList.add(config.board);
        localStorage.setItem('board', JSON.stringify(config.board));
        push_config();
    });

    document.getElementById('pieces_select').addEventListener('change', (e) => {
        config.pieces = e.target.value;
        localStorage.setItem('pieces', JSON.stringify(config.pieces));
        push_config();
        localStorage.setItem('quick_settings_open', JSON.stringify(true));
        window.location.reload();
    });

    document.getElementById('engine_select').addEventListener('change', (e) => {
        config.engine = e.target.value;
        localStorage.setItem('engine', JSON.stringify(config.engine));
        const currPreset = document.getElementById('strength_preset_select').value;
        if (currPreset !== 'custom') {
            document.getElementById('strength_preset_select').value = 'custom';
            localStorage.setItem('strength_preset', JSON.stringify('custom'));
        }
        push_config();
        localStorage.setItem('quick_settings_open', JSON.stringify(true));
        window.location.reload();
    });

    document.getElementById('strength_preset_select').addEventListener('change', (e) => {
        const val = e.target.value;
        localStorage.setItem('strength_preset', JSON.stringify(val));
        const hc = navigator.hardwareConcurrency || 4;
        if (val === 'low') {
            localStorage.setItem('engine', JSON.stringify('stockfish-16-nnue-7'));
            localStorage.setItem('threads', JSON.stringify('1'));
            localStorage.setItem('memory', JSON.stringify('32'));
        } else if (val === 'medium') {
            localStorage.setItem('engine', JSON.stringify('stockfish-16-nnue-40'));
            localStorage.setItem('threads', JSON.stringify(String(Math.max(1, Math.floor(hc / 2)))));
            localStorage.setItem('memory', JSON.stringify('128'));
        } else if (val === 'max') {
            localStorage.setItem('engine', JSON.stringify('stockfish-17-nnue-79'));
            localStorage.setItem('threads', JSON.stringify(String(Math.min(32, hc))));
            localStorage.setItem('memory', JSON.stringify('512'));
        }
        if (val !== 'custom') {
            localStorage.setItem('quick_settings_open', JSON.stringify(true));
            window.location.reload();
        }
    });

    // init fen LRU cache
    fen_cache = new LRU(100);

    // init engine webworker
    await initialize_engine();

    // listen to messages from content-script
    chrome.runtime.onMessage.addListener(function (response) {
        if (response.fenresponse && response.dom !== 'no') {
            if (board.orientation() !== response.orient) {
                board.orientation(response.orient);
            }
            const { fen, startFen, moves } = parse_position_from_response(response.dom);
            if (last_eval.fen !== fen) {
                on_new_pos(fen, startFen, moves);
            }
        } else if (response.pullConfig) {
            push_config();
        } else if (response.click) {
            console.log(response);
            dispatch_click_event(response.x, response.y);
        }
    });

    // query fen periodically from content-script
    request_fen();
    setInterval(function () {
        request_fen();
    }, config.fen_refresh);

    // register button click listeners
    document.getElementById('analyze').addEventListener('click', () => {
        const variantNameMap = {
            'chess': 'standard',
            'fischerandom': 'chess960',
            'crazyhouse': 'crazyhouse',
            'kingofthehill': 'kingOfTheHill',
            '3check': 'threeCheck',
            'antichess': 'antichess',
            'atomic': 'atomic',
            'horde': 'horde',
            'racingkings': 'racingKings',
        }
        const variant = variantNameMap[config.variant];
        window.open(`https://lichess.org/analysis/${variant}?fen=${last_eval.fen}`, '_blank');
    });
    document.getElementById('config').addEventListener('click', () => {
        window.open('/src/options/options.html', '_blank');
    });

    // initialize materialize
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});

    // first time user check
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome');
    if (!hasSeenWelcome) {
        document.getElementById('welcome-tooltip').classList.remove('hidden');
    }

    document.getElementById('close-welcome').addEventListener('click', () => {
        document.getElementById('welcome-tooltip').classList.add('hidden');
        localStorage.setItem('has_seen_welcome', 'true');
    });

    document.getElementById('config').addEventListener('click', () => {
        localStorage.setItem('has_seen_welcome', 'true');
        document.getElementById('welcome-tooltip').classList.add('hidden');
    });
});

async function initialize_engine() {
    const engineMap = {
        'stockfish-17-nnue-79': 'stockfish-17-79/sf17-79.js',
        'stockfish-16-nnue-40': 'stockfish-16-40/stockfish.js',
        'stockfish-16-nnue-7': 'stockfish-16-7/sf16-7.js',
        'stockfish-11-hce': 'stockfish-11-hce/sfhce.js',
        'stockfish-6': 'stockfish-6/stockfish.js',
        'lc0': 'lc0/lc0.js',
        'fairy-stockfish-14-nnue': 'fairy-stockfish-14/fsf14.js',
    }
    const enginePath = `/lib/engine/${engineMap[config.engine]}`;
    const engineBasePath = enginePath.substring(0, enginePath.lastIndexOf('/'));
    if (['stockfish-16-nnue-40', 'stockfish-6'].includes(config.engine)) {
        engine = new Worker(enginePath);
        engine.onmessage = (event) => on_engine_response(event.data);
    } else if (['stockfish-17-nnue-79', 'stockfish-16-nnue-7', 'fairy-stockfish-14-nnue', 'stockfish-11-hce'].includes(config.engine)) {
        const module = await import(enginePath);
        engine = await module.default();
        if (config.engine.includes('nnue')) {
            async function fetchNnueModels(engine, engineBasePath) {
                if (config.engine !== 'fairy-stockfish-14-nnue') {
                    const nnues = [];
                    for (let i = 0; ; i++) {
                        let nnue = engine.getRecommendedNnue(i);
                        if (!nnue || nnues.includes(nnue)) break;
                        nnues.push(nnue);
                    }
                    const nnue_responses = await Promise.all(nnues.map(nnue => fetch(`${engineBasePath}/${nnue}`)));
                    return await Promise.all(nnue_responses.map(res => res.arrayBuffer()));
                } else {
                    const variantNnueMap = {
                        'chess': 'nn-46832cfbead3.nnue',
                        'fischerandom': 'nn-46832cfbead3.nnue',
                        'crazyhouse': 'crazyhouse-8ebf84784ad2.nnue',
                        'kingofthehill': 'kingofthehill-978b86d0e6a4.nnue',
                        '3check': '3check-cb5f517c228b.nnue',
                        'antichess': 'antichess-dd3cbe53cd4e.nnue',
                        'atomic': 'atomic-2cf13ff256cc.nnue',
                        'horde': 'horde-28173ddccabe.nnue',
                        'racingkings': 'racingkings-636b95f085e3.nnue',
                    };
                    const variantNnue = variantNnueMap[config.variant];
                    const nnue_response = await fetch(`${engineBasePath}/nnue/${variantNnue}`);
                    return [await nnue_response.arrayBuffer()];
                }
            }

            if (config.engine === 'fairy-stockfish-14-nnue') {
                send_engine_uci(`setoption name UCI_Variant value ${config.variant}`);
            }
            const nnues = await fetchNnueModels(engine, engineBasePath);
            nnues.forEach((model, i) => engine.setNnueBuffer(new Uint8Array(model), i))
        }
        engine.listen = (message) => on_engine_response(message);
    } else if (['lc0'].includes(config.engine)) {
        const lc0Frame = document.createElement('iframe');
        lc0Frame.src = `${engineBasePath}/lc0.html`;
        lc0Frame.style.display = 'none';
        document.body.appendChild(lc0Frame);
        engine = lc0Frame.contentWindow;

        let poll_startup = true
        window.onmessage = () => poll_startup = false;
        while (poll_startup) {
            await promise_timeout(100);
        }

        window.onmessage = event => on_engine_response(event.data);
        let weights = await fetch(`${engineBasePath}/weights/weights_32195.dat.gz`).then(res => res.arrayBuffer());
        engine.postMessage({ type: 'weights', data: { name: 'weights_32195.dat.gz', weights: weights } }, '*');
    }

    if (config.engine === 'remote') {
        request_remote_configure({
            "Hash": config.memory,
            "Threads": config.threads,
            "MultiPV": config.multiple_lines,
        });
    } else {
        if (config.engine !== 'stockfish-16-nnue-40' && config.engine !== 'stockfish-6') { // crashes for some reason
            send_engine_uci(`setoption name Hash value ${config.memory}`);
        }
        if (config.engine !== 'stockfish-6') {
            send_engine_uci(`setoption name Threads value ${config.threads}`);
        }
        send_engine_uci(`setoption name MultiPV value ${config.multiple_lines}`);
        send_engine_uci('ucinewgame');
        send_engine_uci('isready');
    }
    console.log('Engine ready!', engine);
}

function send_engine_uci(message) {
    if (config.engine === 'lc0') {
        engine.postMessage(message, '*');
    } else if (engine instanceof Worker) {
        engine.postMessage(message);
    } else if (engine && 'uci' in engine) {
        engine.uci(message);
    }
}

function on_engine_best_move(best, threat, isTerminal = false) {
    if (config.engine === 'remote') {
        last_eval.activeLines = last_eval.lines.length;
    }

    console.log('EVALUATION:', JSON.parse(JSON.stringify(last_eval)));
    const piece_name_map = { P: 'Pawn', R: 'Rook', N: 'Knight', B: 'Bishop', Q: 'Queen', K: 'King' };
    const toplay = (turn === 'w') ? 'White' : 'Black';
    const next = (turn === 'w') ? 'Black' : 'White';
    if (best === '(none)') {
        const pvLine = last_eval.lines[0] || '';
        if ('mate' in pvLine) {
            update_evaluation('Checkmate!');
            if (config.variant === 'antichess') {
                update_best_move(`${toplay} Wins`, '');
            } else {
                update_best_move(`${next} Wins`, '');
            }
            if (isTerminal) narrate_move('Checkmate!');
        } else {
            update_evaluation('Stalemate!');
            if (config.variant === 'antichess') {
                update_best_move(`${toplay} Wins`, '');
            } else {
                update_best_move('Draw', '');
            }
            if (isTerminal) narrate_move('Stalemate. Draw.');
        }
    } else if (config.simon_says_mode) {
        if (toplay.toLowerCase() === board.orientation()) {
            const startSquare = best.substring(0, 2);
            const startPiece = board.position()[startSquare];
            const startPieceType = (startPiece) ? startPiece.substring(1) : null;
            if (startPieceType) {
                update_best_move(piece_name_map[startPieceType]);
            }
        } else {
            update_best_move('');
        }
    } else {
        if (threat && threat !== '(none)') {
            update_best_move(`${toplay}'s turn, best: ${best}`, `${next}'s best play: ${threat}`);
        } else {
            update_best_move(`${toplay}'s turn, best: ${best}`, '');
        }
    }

    if (toplay.toLowerCase() === board.orientation()) {
        last_eval.bestmove = best;
        last_eval.threat = threat;
        if (config.simon_says_mode) {
            const startSquare = best.substring(0, 2);
            if (board.position()[startSquare] == null) {
                // The current best move is stale so abort! This happens when the opponent makes a move in
                // the middle of continuous evaluation: the engine isn't done evaluating the opponent's
                // position and ends up returning the opponent's best move on our turn.
                return;
            }
            const startPiece = board.position()[startSquare].substring(1);
            if (last_eval.lines[0] != null) {
                if ('mate' in last_eval.lines[0]) {
                    request_console_log(`${piece_name_map[startPiece]} ==> #${last_eval.lines[0].mate}`);
                } else {
                    request_console_log(`${piece_name_map[startPiece]} ==> ${last_eval.lines[0].score / 100.0}`);
                }
            }
            if (config.threat_analysis) {
                clear_annotations();
                draw_threat();
            }
        }

        // Voice narration — only on terminal (final) best move
        if (isTerminal && best !== '(none)') {
            const narration = build_narration(best, piece_name_map);
            narrate_move(narration);
        }

        if (config.autoplay && isTerminal) {
            if (config.human_mode) {
                // Random delay: weighted towards shorter times, occasionally longer
                const weights = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18];
                const delay = weights[Math.floor(Math.random() * weights.length)] * 1000;
                console.log(`Human mode: waiting ${delay}ms before move`);
                setTimeout(() => request_automove(best), delay);
            } else {
                request_automove(best);
            }
        }
    }

    if (!config.simon_says_mode) {
        draw_moves();
        if (config.threat_analysis) {
            draw_threat()
        }
    }

    toggle_calculating(false);
}

function build_narration(best, piece_name_map) {
    const file_names = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', h: 'H' };
    const fromSquare = best.substring(0, 2);
    const toSquare = best.substring(2, 4);
    const promotion = best[4];

    // Identify the piece
    const position = board.position();
    const piece = position[fromSquare];
    let pieceName = 'Piece';
    if (piece) {
        const pieceType = piece.substring(1); // e.g. 'N', 'P'
        pieceName = piece_name_map[pieceType] || 'Piece';
    }

    // Build source and destination strings
    const srcFile = file_names[fromSquare[0]] || fromSquare[0];
    const srcRank = fromSquare[1];
    const destFile = file_names[toSquare[0]] || toSquare[0];
    const destRank = toSquare[1];

    // "Move the Knight which is at E2 to F3"
    let text = `Move the ${pieceName} which is at ${srcFile} ${srcRank} to ${destFile} ${destRank}`;

    // Promotion
    if (promotion) {
        const promoNames = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };
        text += `, promotes to ${promoNames[promotion] || promotion}`;
    }

    // Evaluation — only if narrate_eval is enabled (read live from localStorage)
    const shouldNarrateEval = JSON.parse(localStorage.getItem('narrate_eval')) || false;
    if (shouldNarrateEval) {
        const lineInfo = last_eval.lines[0];
        if (lineInfo) {
            if ('mate' in lineInfo) {
                text += ` and its evaluation is mate in ${Math.abs(lineInfo.mate)}`;
            } else if ('score' in lineInfo) {
                const score = lineInfo.score / 100.0;
                const sign = score > 0 ? 'plus' : score < 0 ? 'minus' : '';
                text += ` and its evaluation is ${sign} ${Math.abs(score).toFixed(1)}`;
            }
        }
    }

    return text;
}

function narrate_move(text) {
    if (!config.voice_narration) return;
    if (!('speechSynthesis' in window)) {
        console.warn('Voice narration: speechSynthesis not supported in this browser.');
        return;
    }
    window.speechSynthesis.cancel(); // stop any in-progress narration
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.volume = 0.85;

    // Read gender fresh from localStorage so General/Quick Settings changes apply immediately
    const gender = JSON.parse(localStorage.getItem('voice_gender')) || 'male';

    // Use cached voices (pre-loaded on startup via onvoiceschanged)
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    console.log(`Voice narration: gender=${gender}, available voices=${enVoices.length}`);

    let preferred;
    if (gender === 'female') {
        utterance.pitch = 1.15;
        // Try to find a female voice explicitly
        preferred = enVoices.find(v => /female/i.test(v.name))
            || enVoices.find(v => /zira|samantha|karen|fiona|victoria|hazel|susan|linda/i.test(v.name))
            || enVoices[1]  // second voice is often female
            || enVoices[0];
    } else {
        utterance.pitch = 0.9;
        // Try to find a male voice — exclude any voice with "female" in the name
        preferred = enVoices.find(v => /\bmale\b/i.test(v.name) && !/female/i.test(v.name))
            || enVoices.find(v => /david|james|daniel|mark|richard/i.test(v.name))
            || enVoices[0];
    }

    if (preferred) {
        utterance.voice = preferred;
        console.log(`Voice narration: using voice "${preferred.name}"`);
    }
    window.speechSynthesis.speak(utterance);
}

function on_engine_evaluation(info) {
    if (!info.lines[0]) return;
    update_multipv_display(info);
}

function on_engine_response(message) {
    console.log('on_engine_response', message);
    if (config.engine === 'remote') {
        last_eval = Object.assign(last_eval, message);
        on_engine_evaluation(last_eval);
        on_engine_best_move(last_eval.bestmove, last_eval.threat, true);
        return;
    }

    if (message.includes('lowerbound') || message.includes('upperbound') || message.includes('currmove')) {
        return; // ignore these messages
    } else if (message.startsWith('bestmove')) {
        const arr = message.split(' ');
        const best = arr[1];
        const threat = arr[3];
        on_engine_best_move(best, threat, true);
    } else if (message.startsWith('info depth')) {
        const lineInfo = {};
        const tokens = message.split(' ').slice(1);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token === 'score') {
                lineInfo.rawScore = `${tokens[i + 1]} ${tokens[i + 2]}`;
                i += 2; // take 2 tokens
            } else if (token === 'pv') {
                lineInfo['move'] = tokens[i + 1];
                lineInfo[token] = tokens.slice(i + 1).join(' '); // take rest of tokens
                break;
            } else {
                const num = parseInt(tokens[i + 1]);
                lineInfo[token] = isNaN(num) ? tokens[i + 1] : num;
                i++; // take 1 token
            }
        }

        const scoreNumber = Number(lineInfo.rawScore.substring(lineInfo.rawScore.indexOf(' ') + 1));
        const scoreType = lineInfo.rawScore.includes('cp') ? 'score' : 'mate';
        lineInfo[scoreType] = (turn === 'w' ? 1 : -1) * scoreNumber;

        const pvIdx = (lineInfo.multipv - 1) || 0;
        last_eval.activeLines = Math.max(last_eval.activeLines, lineInfo.multipv);
        if (pvIdx === 0) {
            // continuously show the best move for each depth
            if (last_eval.lines[0] != null) {
                const arr = last_eval.lines[0].pv.split(' ');
                const best = arr[0];
                const threat = arr[1];
                on_engine_best_move(best, threat);
            }
            // reset lines
            last_eval.lines = new Array(config.multiple_lines);
            // trigger an evaluation update
            last_eval.lines[pvIdx] = lineInfo;
            on_engine_evaluation(last_eval);
        } else {
            last_eval.lines[pvIdx] = lineInfo;
            on_engine_evaluation(last_eval);
        }
    }

    if (is_calculating) {
        prog++;
        let progMapping = 100 * (1 - Math.exp(-prog / 30));
        document.getElementById('progBar')?.setAttribute('value', `${Math.round(progMapping)}`);
    }
}

function on_new_pos(fen, startFen, moves) {
    console.log("on_new_pos", fen, startFen, moves);
    toggle_calculating(true);
    if (config.engine === 'remote') {
        if (moves) {
            request_remote_analysis(startFen, config.compute_time, moves).then(on_engine_response);
        } else {
            request_remote_analysis(fen, config.compute_time).then(on_engine_response);
        }
    } else {
        send_engine_uci('stop');
        if (moves) {
            send_engine_uci(`position fen ${startFen} moves ${moves}`);
        } else {
            send_engine_uci(`position fen ${fen}`);
        }
        send_engine_uci(`go movetime ${config.compute_time}`);
    }

    board.position(fen);
    clear_annotations();
    if (config.simon_says_mode) {
        const toplay = (turn === 'w') ? 'White' : 'Black';
        if (toplay.toLowerCase() !== board.orientation()) {
            draw_moves();
            request_console_log('Best Move: ' + last_eval.bestmove);
        }
    }
    last_eval = { fen, activeLines: 0, lines: new Array(config.multiple_lines) }; // new evaluation
}

function parse_position_from_response(txt) {
    const prefixMap = {
        li: 'Connected: Lichess.org',
        cc: 'Connected: Chess.com',
        bt: 'Connected: BlitzTactics.com'
    };

    function parse_position_from_moves(txt, startFen = null) {
        const directKey = (startFen) ? `${startFen}_${txt}` : txt;
        const directHit = fen_cache.get(directKey);
        if (directHit) { // reuse position
            console.log('DIRECT');
            turn = directHit.fen.charAt(directHit.fen.indexOf(' ') + 1);
            return directHit;
        }

        let record;
        const lastMoveRegex = /([\w-+=#]+[*]+)$/;
        const indirectKey = directKey.replace(lastMoveRegex, '');
        const indirectHit = fen_cache.get(indirectKey);
        if (indirectHit) { // append newest move
            console.log('INDIRECT');
            const chess = new Chess(config.variant, indirectHit.fen);
            const moveReceipt = chess.move(txt.match(lastMoveRegex)[0].split('*****')[0]);
            turn = chess.turn();
            record = { fen: chess.fen(), startFen: indirectHit.startFen, moves: indirectHit.moves + ' ' + moveReceipt.lan }
        } else { // perform all moves
            console.log('FULL');
            const chess = new Chess(config.variant, startFen);
            const sans = txt.split('*****').slice(0, -1);
            let moves = '';
            for (const san of sans) {
                const moveReceipt = chess.move(san);
                moves += moveReceipt.lan + ' ';
            }
            turn = chess.turn();
            record = { fen: chess.fen(), startFen: chess.startFen(), moves: moves.trim() };
        }

        fen_cache.set(directKey, record);
        return record;
    }

    function parse_position_from_pieces(txt) {
        const directHit = fen_cache.get(txt);
        if (directHit) { // reuse position
            console.log('DIRECT');
            turn = directHit.fen.charAt(directHit.fen.indexOf(' ') + 1);
            return directHit;
        }

        console.log('FULL');
        const chess = new Chess(config.variant);
        chess.clear(); // clear the board so we can place our pieces
        const [playerTurn, ...pieces] = txt.split('*****').slice(0, -1);
        for (const piece of pieces) {
            const attributes = piece.split('-');
            chess.put({ type: attributes[1], color: attributes[0] }, attributes[2]);
        }
        chess.setTurn(playerTurn);
        turn = chess.turn();

        const record = { fen: chess.fen() };
        fen_cache.set(txt, record);
        return record;
    }

    const metaTag = txt.substring(3, 8);
    const prefix = metaTag.substring(0, 2);
    document.getElementById('game-detection').innerText = prefixMap[prefix];
    txt = txt.substring(11);

    if (metaTag.includes('var')) {
        if (config.variant === 'fischerandom') {
            const puzTxt = txt.substring(0, txt.indexOf('&'));
            const fenTxt = txt.substring(txt.indexOf('&') + 6);
            const startFen = parse_position_from_pieces(puzTxt).fen.replace('-', 'KQkq');
            return parse_position_from_moves(fenTxt, startFen);
        }
        return parse_position_from_moves(txt);
    } else if (metaTag.includes('puz')) { // chess.com & blitztactics.com puzzle pages
        return parse_position_from_pieces(txt);
    } else { // chess.com and lichess.org pages
        return parse_position_from_moves(txt);
    }
}

const MULTIPV_DISPLAY_COUNT = 4;
const PV_MOVES_LIMIT = 6;

function format_pv_score(lineInfo) {
    if ('mate' in lineInfo) {
        const mateVal = lineInfo.mate;
        return { text: `#${mateVal}`, cssClass: 'mate' };
    } else {
        const score = lineInfo.score / 100.0;
        const sign = score > 0 ? '+' : '';
        let cssClass = 'neutral';
        if (score > 0.1) cssClass = 'positive';
        else if (score < -0.1) cssClass = 'negative';
        return { text: `${sign}${score.toFixed(2)}`, cssClass };
    }
}

function format_pv_moves(pvString) {
    if (!pvString) return '';
    const moves = pvString.split(' ').slice(0, PV_MOVES_LIMIT);
    // Format moves as numbered pairs: 1. e2e4 e7e5 2. g1f3 b8c6
    let formatted = '';
    for (let i = 0; i < moves.length; i++) {
        if (i % 2 === 0) {
            const moveNum = Math.floor(i / 2) + 1;
            formatted += `${moveNum}.`;
        }
        formatted += `${moves[i]} `;
    }
    return formatted.trim();
}

function update_multipv_display(info) {
    if (!config.computer_evaluation) return;

    const mateStatusEl = document.getElementById('mate-status');
    if (mateStatusEl) {
        if (info.lines[0] && 'mate' in info.lines[0] && Math.abs(info.lines[0].mate) <= 10) {
            mateStatusEl.innerText = `Checkmate in ${info.lines[0].mate}`;
            mateStatusEl.style.display = 'block';
        } else {
            mateStatusEl.style.display = 'none';
        }
    }

    for (let i = 0; i < MULTIPV_DISPLAY_COUNT; i++) {
        const el = document.getElementById(`pv-line-${i + 1}`);
        if (!el) continue;

        const lineInfo = info.lines[i];
        if (!lineInfo) {
            el.innerHTML = '';
            el.classList.remove('best-line');
            continue;
        }

        const { text: scoreText, cssClass: scoreCss } = format_pv_score(lineInfo);
        const movesText = format_pv_moves(lineInfo.pv);

        el.innerHTML = `<span class="pv-rank">${i + 1}</span>` +
            `<span class="pv-score ${scoreCss}">${scoreText}</span>` +
            `<span class="pv-moves">${movesText}</span>`;

        if (i === 0) {
            el.classList.add('best-line');
        } else {
            el.classList.remove('best-line');
        }
    }
}

function update_evaluation(eval_string) {
    // Legacy function - now handled by update_multipv_display
    // Still used for terminal states (checkmate/stalemate)
    if (eval_string != null && config.computer_evaluation) {
        const el = document.getElementById('pv-line-1');
        if (el) {
            el.innerHTML = `<span style="font-size: 13px; font-weight: 600; color: var(--text-color);">${eval_string}</span>`;
            el.classList.remove('best-line');
        }
        for (let i = 1; i < MULTIPV_DISPLAY_COUNT; i++) {
            const pvEl = document.getElementById(`pv-line-${i + 1}`);
            if (pvEl) pvEl.innerHTML = '';
        }
    }
}

function update_best_move(line1, line2) {
    if (line1 != null) {
        document.getElementById('chess_line_1').innerHTML = line1;
    }
    if (line2 != null) {
        document.getElementById('chess_line_2').innerHTML = line2;
    }
}

function request_fen() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { queryfen: true });
    });
}

function request_automove(move) {
    const message = (config.puzzle_mode)
        ? { automove: true, pv: last_eval.lines[0].pv.split(' ') || [move] }
        : { automove: true, move: move };
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

function request_console_log(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { consoleMessage: message });
    });
}

function push_config() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { pushConfig: true, config: config });
    });
}

function draw_moves() {
    if (last_eval.lines[0] == null) return;

    function strokeFunc(line) {
        const MATE_SCORE = 20;
        const WINNING_THRESHOLD = 4;
        const MAX_STROKE = 0.225, MIN_STROKE = 0.075;
        const STROKE_SHIM = 0.0125;

        const top_line = last_eval.lines[0];
        const top_score = (turn === 'w' ? 1 : -1) * top_line.score / 100;
        const score = (turn === 'w' ? 1 : -1) * line.score / 100;
        if (top_line.move === line.move) { // is best move?
            console.log(`0 => ${MAX_STROKE + 2 * STROKE_SHIM}`);
            return MAX_STROKE + 2 * STROKE_SHIM; // accentuate the best move
        } else if (isNaN(top_score) || top_score >= WINNING_THRESHOLD) { // is winning?
            if (isNaN(score)) {
                console.log(`winning: #${line.mate} => ${MAX_STROKE - STROKE_SHIM}`);
                return MAX_STROKE - STROKE_SHIM; // moves that checkmate are necessarily good
            } else if (score < WINNING_THRESHOLD) {
                console.log(`winning: ${score} => losing`);
                return 0; // hide moves that are not winning
            } else {
                const delta = (isNaN(top_score) ? MATE_SCORE : top_score) - score;
                console.log(`winning: ${score} => ok ${delta}`);
                if (delta <= 0) {
                    return MAX_STROKE - 2 * STROKE_SHIM; // moves that are still winning are good
                } else {
                    const stroke = MAX_STROKE - 2 * STROKE_SHIM - delta / 150;
                    return Math.min(MAX_STROKE, Math.max(MIN_STROKE, stroke));
                }
            }
        } else { // is roughly equal?
            const delta = top_score - score;
            if (isNaN(score) || delta >= WINNING_THRESHOLD) {
                console.log(`${delta} => 0`);
                return 0; // hide moves that are too losing or get us checkmated
            } else {
                const stroke = MAX_STROKE - delta / 15;
                console.log(`${delta} => ${stroke}`);
                return Math.min(MAX_STROKE, Math.max(MIN_STROKE, stroke))
            }
        }
    }

    clear_annotations();

    const showArrows = config.move_display === 'arrows' || config.move_display === 'both';
    const showHeatmap = config.move_display === 'heatmap' || config.move_display === 'both';

    if (showArrows) {
        for (let i = 0; i < last_eval.activeLines; i++) {
            if (!last_eval.lines[i]) continue;

            const arrow_color = (i === 0) ? '#004db8' : '#4a4a4a';
            const stroke_width = strokeFunc(last_eval.lines[i]);
            draw_move(last_eval.lines[i].move, arrow_color, document.getElementById('move-annotations'), stroke_width);
        }
    }

    if (showHeatmap) {
        draw_heatmap();
    }
}

function draw_threat() {
    if (last_eval.threat) {
        draw_move(last_eval.threat, '#bf0000', document.getElementById('response-annotations'));
    }
}

function draw_heatmap() {
    if (last_eval.lines[0] == null) return;

    const overlay = document.getElementById('heatmap-annotations');
    const top_line = last_eval.lines[0];
    const top_score_raw = ('mate' in top_line) ? null : (turn === 'w' ? 1 : -1) * top_line.score / 100;

    // Collect heatmap data for each evaluated line
    const squares = [];

    for (let i = 0; i < last_eval.activeLines; i++) {
        const line = last_eval.lines[i];
        if (!line || !line.move || line.move === '(none)') continue;

        // Determine destination square
        const move = line.move;
        let destSquare;
        if (move.includes('@')) {
            destSquare = move.substring(2, 4);
        } else {
            destSquare = move.substring(2, 4);
        }

        // Calculate the quality of this move relative to the best
        let quality; // 'good', 'okay', 'blunder'

        if (i === 0) {
            quality = 'good'; // best move is always good
        } else {
            const isMate = 'mate' in line;
            const score = isMate ? null : (turn === 'w' ? 1 : -1) * line.score / 100;

            if (isMate && line.mate > 0) {
                // We deliver checkmate: good
                quality = 'good';
            } else if (isMate && line.mate <= 0) {
                // We get checkmated: blunder
                quality = 'blunder';
            } else if (top_score_raw === null) {
                // Best move is a forced mate for us
                if (score === null) {
                    quality = 'good';
                } else {
                    // Any non-mate move when mate is available is a blunder
                    quality = 'blunder';
                }
            } else {
                const cpLoss = top_score_raw - score;
                if (cpLoss <= 0.5) {
                    quality = 'good';
                } else if (cpLoss <= 2.0) {
                    quality = 'okay';
                } else {
                    quality = 'blunder';
                }
            }
        }

        squares.push({ square: destSquare, quality });
    }

    if (squares.length === 0) return;

    // Map quality to colors
    const colorMap = {
        'good': 'rgba(76, 175, 80, 0.45)',   // green
        'okay': 'rgba(255, 193, 7, 0.45)',    // yellow/amber
        'blunder': 'rgba(244, 67, 54, 0.45)',    // red
    };

    // Build SVG for heatmap squares
    let svgContent = '';
    for (const { square, quality } of squares) {
        const fileIdx = square[0].charCodeAt(0) - 'a'.charCodeAt(0);
        const rankIdx = parseInt(square[1]) - 1;

        let x, y;
        if (board.orientation() === 'white') {
            x = fileIdx;
            y = 7 - rankIdx;
        } else {
            x = 7 - fileIdx;
            y = rankIdx;
        }

        svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colorMap[quality]}" />`;
    }

    overlay.innerHTML = `
        <svg style="position: absolute; z-index: -1; left: 0; top: 0;" width="344px" height="344px" viewBox="0, 0, 8, 8">
            ${svgContent}
        </svg>
    `;
}

function draw_move(move, color, overlay, stroke_width = 0.225) {
    if (!move || move === '(none)') {
        overlay.lastElementChild?.remove();
        return; // hide overlay on win/loss
    } else if (stroke_width === 0) {
        return; // hide losing moves
    }

    function get_coord(square) {
        const x = square[0].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
        const y = parseInt(square[1]);
        return (board.orientation() === 'white') ? { x, y } : { x: 9 - x, y: 9 - y };
    }

    function get_coords(move) {
        const { x: x0, y: y0 } = get_coord(move.substring(0, 2));
        const { x: x1, y: y1 } = get_coord(move.substring(2, 4));
        return { x0, y0, x1, y1 }
    }

    if (move.includes('@')) {
        const coord = get_coord(move.substring(2, 4));
        const x = 0.5 + (coord.x - 1);
        const y = 8 - (0.5 + (coord.y - 1));
        const imgX = 43 * (coord.x - 1);
        const imgY = 43 * (8 - coord.y);

        const MAX_STROKE = 0.25;
        stroke_width = 0.1 * stroke_width / MAX_STROKE;
        const stroke_diff = (MAX_STROKE - stroke_width) / 10;
        console.log("STROKE_DIFF:", MAX_STROKE, "-", stroke_width, "=", stroke_diff);

        const pieceIdentifier = turn + move[0];
        const [pieceSet, ext] = config.pieces.split('.');
        const piecePath = `/res/chesspieces/${pieceSet}/${pieceIdentifier}.${ext}`
        overlay.innerHTML += `
            <img style='position: absolute; z-index: -1; left: ${imgX}px; top: ${imgY}px; opacity: 0.4;' width='43px'
                height='43px' src='${piecePath}' alt='${pieceIdentifier}'>
            <svg style='position: absolute; z-index: -1; left: 0; top: 0;' width='344px' height='344px' viewBox='0, 0, 8, 8'>
                <circle cx='${x}' cy='${y}' r='${0.45 + stroke_diff}' fill='transparent' opacity='0.4' stroke='${color}' stroke-width='${stroke_width}' />
            </svg>
        `;
    } else {
        const coords = get_coords(move);
        const x0 = 0.5 + (coords.x0 - 1);
        const y0 = 8 - (0.5 + (coords.y0 - 1));
        const x1 = 0.5 + (coords.x1 - 1);
        const y1 = 8 - (0.5 + (coords.y1 - 1));

        const dx = x1 - x0;
        const dy = y1 - y0;
        const d = Math.sqrt(dx * dx + dy * dy);
        const ax0 = x0 + 0.1 * ((x1 - x0) / d);
        const ay0 = y0 + 0.1 * (dy / d);
        const ax1 = x1 - 0.4 * ((x1 - x0) / d);
        const ay1 = y1 - 0.4 * (dy / d);

        const marker_id = color.replace(/[ ,()]/g, '-');
        overlay.innerHTML += `
            <svg style='position: absolute; z-index: -1; left: 0; top: 0;' width='344px' height='344px' viewBox='0, 0, 8, 8'>
                <defs>
                    <marker id='arrow-${marker_id}' markerWidth='13' markerHeight='13' refX='1' refY='7' orient='auto'>
                        <path d='M1,5.75 L3,7 L1,8.25' fill='${color}' />
                    </marker>
                </defs>
                <line x1='${ax0}' y1='${ay0}' x2='${ax1}' y2='${ay1}' stroke='${color}' fill=${color}' opacity='0.4'
                    stroke-width='${stroke_width}' marker-end='url(#arrow-${marker_id})'/>
            </svg>
        `;

        if (move.length === 5) {
            const imgX = 43 * (coords.x1 - 1);
            const imgY = 43 * (8 - coords.y1);
            const pieceIdentifier = turn + move[4];
            const [pieceSet, ext] = config.pieces.split('.');
            const piecePath = `/res/chesspieces/${pieceSet}/${pieceIdentifier}.${ext}`;
            overlay.innerHTML += `
                <img style='position: absolute; z-index: -1; left: ${imgX}px; top: ${imgY}px; opacity: 0.4;' width='43px'
                    height='43px' src='${piecePath}' alt='${pieceIdentifier}'>
            `;
        }
    }
}

function clear_annotations() {
    let move_annotation = document.getElementById('move-annotations');
    while (move_annotation.childElementCount) {
        move_annotation.lastElementChild.remove();
    }
    let response_annotation = document.getElementById('response-annotations');
    while (response_annotation.childElementCount) {
        response_annotation.lastElementChild.remove();
    }
    let heatmap_annotation = document.getElementById('heatmap-annotations');
    while (heatmap_annotation.childElementCount) {
        heatmap_annotation.lastElementChild.remove();
    }
}

function toggle_calculating(on) {
    prog = 0;
    is_calculating = on;
    if (is_calculating) {
        update_best_move(`<div>Calculating...<div><progress id='progBar' value='2' max='100'>`, '');
    }
}

async function dispatch_click_event(x, y) {
    if (config.python_autoplay_backend) {
        await request_backend_click(x, y);
    } else {
        await request_debugger_click(x, y);
    }
}

async function request_debugger_click(x, y) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const debugee = { tabId: tabs[0].id };
        chrome.debugger.attach(debugee, '1.3', async () => {
            await dispatch_mouse_event(debugee, 'Input.dispatchMouseEvent', {
                type: 'mousePressed',
                button: 'left',
                clickCount: 1,
                x: x,
                y: y,
            });
            await dispatch_mouse_event(debugee, 'Input.dispatchMouseEvent', {
                type: 'mouseReleased',
                button: 'left',
                clickCount: 1,
                x: x,
                y: y,
            });
        });
    });
}

async function dispatch_mouse_event(debugee, mouseEvent, mouseEventOpts) {
    return new Promise(resolve => {
        chrome.debugger.sendCommand(debugee, mouseEvent, mouseEventOpts, resolve);
    });
}

async function request_backend_click(x, y) {
    return call_backend(`http://localhost:8080/performClick`, { x: x, y: y });
}

async function request_backend_move(x0, y0, x1, y1) {
    return call_backend('http://localhost:8080/performMove', { x0: x0, y0: y0, x1: x1, y1: y1 });
}

async function request_remote_configure(options) {
    return call_backend('http://localhost:9090/configure', options).then(res => res.json());
}

async function request_remote_analysis(fen, time, moves = null) {
    return call_backend('http://localhost:9090/analyse', {
        fen: fen,
        moves: moves,
        time: time,
    }).then(res => res.json());
}

async function call_backend(url, data) {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

function promise_timeout(time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(time), time);
    });
}
