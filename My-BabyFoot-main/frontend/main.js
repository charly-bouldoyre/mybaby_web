/**************************************************
 * MYBABY - main.js
 * Gère :
 *  - chargement Header / Footer
 *  - navigation SPA
 *  - chargement dynamique des pages
 **************************************************/

const app = document.getElementById("app");
const header = document.getElementById("header");
const footer = document.getElementById("footer");

/* ==============================
   CONFIGURATION DES ROUTES
================================ */

const routes = {
    home: "HomePage.html",
    map: "MapPage.html",
    profile: "ProfilePage.html",
    login: "LoginPage.html",
    register: "RegisterPage.html",
    events: "EventsPage.html",
    match: "MatchPage.html"
};

/* ==============================
   CHARGEMENT DES COMPOSANTS
================================ */

async function loadComponent(container, path) {
    try {
        const response = await fetch(path);
        container.innerHTML = await response.text();
    } catch (error) {
        console.error(`Erreur chargement ${path}`, error);
    }
}

async function loadHeaderFooter() {
    await loadComponent(header, "components/Header.html");
    await loadComponent(footer, "components/Footer.html");
}

/* ==============================
   CHARGEMENT DES PAGES
================================ */

async function loadPage(page) {
    const file = routes[page];

    if (!file) {
        app.innerHTML = "<h2>Page introuvable</h2>";
        return;
    }

    try {
        const response = await fetch(`pages/${file}`);
        app.innerHTML = await response.text();
        window.scrollTo(0, 0);
    } catch (error) {
        app.innerHTML = "<h2>Erreur de chargement</h2>";
        console.error(error);
    }
}

/* ==============================
   NAVIGATION (SPA)
================================ */

function handleNavigation() {
    document.body.addEventListener("click", (e) => {
        const link = e.target.closest("[data-link]");

        if (!link) return;

        e.preventDefault();
        const page = link.getAttribute("data-link");
        navigateTo(page);
    });
}

function navigateTo(page) {
    history.pushState({ page }, "", `#${page}`);
    loadPage(page);
}

/* ==============================
   GESTION URL / REFRESH
================================ */

function getPageFromURL() {
    const hash = window.location.hash.replace("#", "");
    return hash || "home";
}

window.addEventListener("popstate", () => {
    const page = getPageFromURL();
    loadPage(page);
});

/* ==============================
   INITIALISATION
================================ */

async function init() {
    await loadHeaderFooter();

    const page = getPageFromURL();
    loadPage(page);

    handleNavigation();
}

init();

/* ==============================
   EXPORTS (optionnel)
================================ */

export {
    loadPage,
    navigateTo
};
