import { require } from "./framework/require.js";

let registerPageScript;

document.addEventListener('DOMContentLoaded', function () {
    let activeScrollspies;

    // init materialize
    const mCollapsible = M.Collapsible.init(document.querySelectorAll('.collapsible'), {
        onOpenStart: elem => elem.classList.add('open'),
        onCloseStart: elem => elem.classList.remove('open')
    });
    const mSidenav = M.Sidenav.init(document.querySelectorAll('.sidenav'), {});

    // page injection logic
    const contentElem = document.querySelector('#content .container');
    const titleElem = document.getElementById('title');
    const headElem = document.getElementById('header');
    const stylesheetsElem = document.querySelector('head');

    function onClick(e) {
        injectPage(e.target.hash.substring(1));
        if (e.target.id === 'logo-container') {
            e.target.parentElement.classList.remove('active');
            document.getElementById('about').parentElement.classList.add('active');
        }
    }

    // Handle TOC clicks
    contentElem.addEventListener('click', (e) => {
        const tocItem = e.target.closest('.toc-list li');
        if (tocItem) {
            const pageNumText = tocItem.querySelector('.toc-page-num')?.innerText;
            if (pageNumText) {
                const targetPage = parseInt(pageNumText, 10);
                if (!isNaN(targetPage)) {
                    const checksNeeded = Math.ceil((targetPage - 1) / 2);
                    const checkboxes = contentElem.querySelectorAll('.page-checkbox');
                    checkboxes.forEach((cb, index) => {
                        cb.checked = (index < checksNeeded);
                    });
                }
            }
        }
    });

    function updateActiveTab(elem) {
        location.hash = elem.hash;
        document.querySelectorAll('#nav-mobile li').forEach(elem => {
            if (!elem.classList.contains('open')) {
                elem.classList.remove('active');
            }
        });
        while (elem.id !== 'nav-mobile') {
            if (elem.tagName === 'LI') {
                elem.classList.add('active');
            } else if (elem.classList.contains('collapsible') && !elem.children[0].classList.contains('open')) {
                elem.M_Collapsible.close();
                elem.M_Collapsible.open();
            }
            elem = elem.parentElement;
        }
    }

    async function injectPage(pagePath) {
        updateActiveTab(document.getElementById(pagePath));
        const title = pagePath.substring(pagePath.lastIndexOf('/') + 1);
        const path = pagePath.substring(0, pagePath.lastIndexOf('/') + 1) + title;
        const componentPath = `pages/${path}/${title}`;

        // fade out
        contentElem.classList.add('fade-out');
        await new Promise(r => setTimeout(r, 200));

        // inject html
        const pageBody = await require(componentPath, 'html');
        contentElem.innerHTML = pageBody.innerHTML;

        // fade back in
        requestAnimationFrame(() => {
            contentElem.classList.remove('fade-out');
        });
        activeScrollspies?.forEach(scrollspy => scrollspy.destroy());
        activeScrollspies = M.ScrollSpy.init(document.querySelectorAll('.scrollspy'), {});
        headElem.scrollIntoView(true);

        // disable cached stylesheets
        Array.from(document.getElementsByClassName('page-stylesheet'))
            .forEach((stylesheet) => stylesheet.disabled = true);

        // inject css OR re-enable cached css
        const pageStylesheet = document.getElementById(`${componentPath}-stylesheet`);
        if (pageStylesheet) {
            pageStylesheet.disabled = false;
        } else {
            const pageStyle = await require(componentPath, 'css');
            stylesheetsElem.appendChild(pageStyle);
        }

        // inject js
        const pageModule = await require(componentPath);
        pageModule.page?.onInit();

        // inject page title
        titleElem.innerText = pageModule.title;
    }

    document.querySelectorAll('#nav-mobile a.menu-item').forEach(elem => {
        elem.addEventListener('click', e => onClick(e));
    });

    injectPage(location.hash.substring(1) || 'settings/general');
});