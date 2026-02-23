import { define } from "../../../framework/require.js";
import { SettingsPage } from "../../../util/SettingsPage.js";

class GeneralSettings extends SettingsPage {
    init() {
        M.FormSelect.init(document.querySelectorAll('select'), {});
        M.Range.init(document.querySelectorAll('input[type=range]'), {});
        M.Tooltip.init(document.querySelectorAll('.tooltipped'), { enterDelay: 1000 });
        const strength_preset = this.registerFormElement('strength_preset', 'Strength Preset:', 'select', 'custom');
        const engine_select = this.registerFormElement('engine', 'Engine:', 'select', 'stockfish-16-nnue-7');
        const variant_select = this.registerFormElement('variant', 'Variant:', 'select', 'chess');
        this.registerFormElement('compute_time', 'Stockfish Compute Time (ms):', 'input', 3000);
        this.registerFormElement('fen_refresh', 'Fen Refresh Interval (ms):', 'input', 100);
        const multipv_range = this.registerFormElement('multiple_lines', 'Multiple Lines:', 'range', 1);
        const threads_range = this.registerFormElement('threads', 'Threads:', 'range', navigator.hardwareConcurrency - 1);
        const memory_range = this.registerFormElement('memory', 'Memory:', 'range', 32);
        this.registerFormElement('computer_evaluation', 'Show Computer Evaluation:', 'checkbox', true);
        this.registerFormElement('threat_analysis', 'Show Threat Analysis', 'checkbox', true);
        this.registerFormElement('move_display', 'Move Display:', 'select', 'arrows');
        this.registerFormElement('simon_says_mode', '"Hand and Brain" Mode:', 'checkbox', false);
        const autoplay = this.registerFormElement('autoplay', 'Autoplay:', 'checkbox', false);
        const human_mode = this.registerFormElement('human_mode', 'Human Mode:', 'checkbox', false);
        human_mode.registerChangeListener(() => {
            if (human_mode.getValue()) {
                if (engine_select.getValue() !== 'lc0') {
                    engine_select.setValue('lc0');
                }
                if (!autoplay.getValue()) {
                    autoplay.setValue(true);
                }
            }
        });
        this.registerFormElement('puzzle_mode', 'Puzzle Mode:', 'checkbox', false);
        this.registerFormElement('python_autoplay_backend', 'Python Autoplay Backend:', 'checkbox', false);
        this.registerFormElement('think_time', 'Simulated Think Time (ms):', 'input', 1000);
        this.registerFormElement('think_variance', 'Simulated Think Variance (ms):', 'input', 500);
        this.registerFormElement('move_time', 'Simulated Move Time (ms):', 'input', 500);
        this.registerFormElement('move_variance', 'Simulated Move Variance (ms):', 'input', 250);
        const engineLabelTooltiped = document.querySelector('#engine-label-tooltiped');
        const engineLabelUntooltiped = document.querySelector('#engine-label-untooltiped');

        let isApplyingPreset = false;

        strength_preset.registerChangeListener(() => {
            if (isApplyingPreset) return;
            isApplyingPreset = true;

            const val = strength_preset.getValue();
            if (val === 'low') {
                engine_select.setValue('stockfish-16-nnue-7');
                threads_range.setValue("1");
                memory_range.setValue("32");
            } else if (val === 'medium') {
                engine_select.setValue('stockfish-16-nnue-40');
                threads_range.setValue(String(Math.max(1, Math.floor(navigator.hardwareConcurrency / 2))));
                memory_range.setValue("128"); // memory step is 32, 128 is valid
            } else if (val === 'max') {
                engine_select.setValue('stockfish-17-nnue-79');
                threads_range.setValue(String(Math.min(32, navigator.hardwareConcurrency)));
                memory_range.setValue("512");
            }

            isApplyingPreset = false;
        });

        const checkIfCustom = () => {
            if (isApplyingPreset) return;
            const currentPreset = strength_preset.getValue();
            if (currentPreset === 'custom') return;

            const engineVal = engine_select.getValue();
            const threadsVal = Number(threads_range.getValue());
            const memoryVal = Number(memory_range.getValue());

            let isMatch = false;
            if (currentPreset === 'low') {
                isMatch = (engineVal === 'stockfish-16-nnue-7' && threadsVal === 1 && memoryVal === 32);
            } else if (currentPreset === 'medium') {
                isMatch = (engineVal === 'stockfish-16-nnue-40' && threadsVal === Math.max(1, Math.floor(navigator.hardwareConcurrency / 2)) && memoryVal === 128);
            } else if (currentPreset === 'max') {
                isMatch = (engineVal === 'stockfish-17-nnue-79' && threadsVal === Math.min(32, navigator.hardwareConcurrency) && memoryVal === 512);
            }

            if (!isMatch) {
                isApplyingPreset = true;
                strength_preset.setValue('custom');
                isApplyingPreset = false;
            }
        };

        for (const range of [multipv_range, threads_range, memory_range]) {
            range.registerChangeListener(() => {
                let section = range.elem;
                while (!section.classList.contains('section')) {
                    section = section.parentElement
                }
                section.querySelector('.value').innerText = range.getValue();
                if (range !== multipv_range) checkIfCustom();
            });
        }
        engine_select.registerChangeListener(() => {
            checkIfCustom();
            let section = variant_select.elem;
            while (!section.classList.contains('section')) {
                section = section.parentElement
            }
            if (engine_select.getValue() === 'fairy-stockfish-14-nnue') {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
                variant_select.setValue('chess');
            }
            if (engine_select.getValue() === 'remote') {
                engineLabelTooltiped.classList.remove('hidden');
                engineLabelUntooltiped.classList.add('hidden');
            } else {
                engineLabelTooltiped.classList.add('hidden');
                engineLabelUntooltiped.classList.remove('hidden');
            }
        })
    }
}

define({
    title: 'General Settings',
    page: new GeneralSettings()
});
