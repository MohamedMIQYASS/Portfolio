"use strict";
function initTypewriter() {
    const targets = [...document.querySelectorAll(".typewriter")];
    if (!targets.length) return;

    // Respecte le réglage "réduire les animations" du système
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const terminal = targets[0].closest(".terminal");
    const texts = targets.map(el => el.textContent);

    // On fige la hauteur du terminal pour éviter que la page saute pendant la frappe
    if (terminal) terminal.style.minHeight = `${terminal.offsetHeight}px`;
    targets.forEach(el => { el.textContent = ""; });

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const speeds = [70, 15]; // ms par caractère : commande, puis texte de présentation

    async function run() {
        for (let i = 0; i < targets.length; i++) {
            const el = targets[i];
            el.classList.add("typing");
            await wait(i === 0 ? 600 : 500);

            for (const char of texts[i]) {
                el.textContent += char;
                await wait(speeds[i] ?? 15);
            }

            // Le curseur ne reste que sur la dernière ligne
            if (i < targets.length - 1) el.classList.remove("typing");
        }
        if (terminal) terminal.style.minHeight = "";
    }

    run();
}

function initNav() {
    const nav = document.querySelector("nav");
    if (!nav) return;

    const navUl = nav.querySelector("ul");
    const allLinks = navUl.querySelectorAll("a");
    const sectionLinks = navUl.querySelectorAll('a[href^="#"]');
    const blob = nav.querySelector(".nav-blob");
    const burger = nav.querySelector(".burger");

    const isMobile = () => window.innerWidth <= 768;

    function closeMenu() {
        navUl.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
    }

    function moveBlob(link) {
        if (isMobile()) return;
        const li = link.closest("li");
        blob.style.left = `${li.offsetLeft}px`;
        blob.style.top = `${li.offsetTop}px`;
        blob.style.width = `${li.offsetWidth}px`;
        blob.style.height = `${li.offsetHeight}px`;
        blob.style.opacity = "1";
    }

    function resetBlobToActive() {
        const active = navUl.querySelector("a.active");
        if (active) {
            moveBlob(active);
        } else {
            blob.style.opacity = "0";
            blob.style.width = "0";
        }
    }

    function setActive(link) {
        sectionLinks.forEach(l => l.classList.toggle("active", l === link));
        if (!navUl.matches(":hover")) resetBlobToActive();
    }

    burger.addEventListener("click", () => {
        const open = navUl.classList.toggle("open");
        burger.setAttribute("aria-expanded", String(open));
    });
    allLinks.forEach(link => link.addEventListener("click", closeMenu));
    nav.querySelectorAll("[data-popup-target]").forEach(btn => btn.addEventListener("click", closeMenu));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeMenu();
    });

    allLinks.forEach(link => {
        link.addEventListener("mouseenter", () => moveBlob(link));
        link.addEventListener("focus", () => moveBlob(link));
    });
    navUl.addEventListener("mouseleave", resetBlobToActive);
    navUl.addEventListener("focusout", resetBlobToActive);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const link = navUl.querySelector(`a[href="#${entry.target.id}"]`);
            if (link) setActive(link);
        });
    }, { rootMargin: "-40% 0px -55% 0px" });

    sectionLinks.forEach(link => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) observer.observe(target);
    });

    if (sectionLinks.length) setActive(sectionLinks[0]);
    document.fonts.ready.then(resetBlobToActive);

    window.addEventListener("scroll", () => {
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom && sectionLinks.length) setActive(sectionLinks[sectionLinks.length - 1]);
    }, { passive: true });

    window.addEventListener("resize", () => {
        if (!isMobile()) closeMenu();
        resetBlobToActive();
    });
}

const popupOverlay = document.getElementById("popup-overlay");
let activePopup = null;
let lastTrigger = null;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

function openPopup(id, trigger) {
    const popup = document.getElementById(id);
    if (!popup) return;
    if (activePopup) closePopup(false);

    activePopup = popup;
    lastTrigger = trigger || null;

    popup.classList.add("open-popup");
    popupOverlay.classList.add("open-popup");
    document.body.classList.add("popup-open");

    const first = popup.querySelector("[data-autofocus]") || popup.querySelector(FOCUSABLE);
    if (first) first.focus({ preventScroll: true });
}

function closePopup(restoreFocus = true) {
    if (!activePopup) return;
    activePopup.classList.remove("open-popup");
    popupOverlay.classList.remove("open-popup");
    document.body.classList.remove("popup-open");
    activePopup = null;

    if (restoreFocus && lastTrigger) lastTrigger.focus({ preventScroll: true });
    lastTrigger = null;
}

function initPopups() {
    if (!popupOverlay) return;

    document.addEventListener("click", e => {
        const opener = e.target.closest("[data-popup-target]");
        if (opener) {
            openPopup(opener.dataset.popupTarget, opener);
            return;
        }
        if (e.target.closest("[data-popup-close]")) closePopup();
    });

    document.addEventListener("keydown", e => {
        if (!activePopup) return;

        if (e.key === "Escape") {
            closePopup();
            return;
        }

        if (e.key === "Tab") {
            const items = [...activePopup.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

function initContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    if (!form || !status) return;

    const submitButton = form.querySelector("button[type='submit']");

    function setStatus(message, type = "") {
        status.textContent = message;
        status.className = type;
    }

    form.addEventListener("submit", async e => {
        e.preventDefault();
        submitButton.disabled = true;
        setStatus("Envoi en cours...");

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            setStatus("Merci ! Votre message a bien été envoyé.", "success");
            form.reset();
            setTimeout(() => {
                closePopup();
                setStatus("");
            }, 2500);
        } catch {
            setStatus("Une erreur est survenue. Réessayez ou contactez-moi via LinkedIn.", "error");
        } finally {
            submitButton.disabled = false;
        }
    });
}

function initVeilleSlider() {
    const track = document.querySelector(".veille-track");
    if (!track) return;

    const step = () => {
        const card = track.querySelector(".veille-card");
        const gap = parseFloat(getComputedStyle(track).gap) || 16;
        return card ? card.offsetWidth + gap : 300;
    };

    const scrollTrack = direction => track.scrollBy({ left: direction * step(), behavior: "smooth" });
    document.querySelector(".veille-btn.prev")?.addEventListener("click", () => scrollTrack(-1));
    document.querySelector(".veille-btn.next")?.addEventListener("click", () => scrollTrack(1));
}

function initTheme() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    const root = document.documentElement;

    function updateButton() {
        const isDark = root.classList.contains("dark-mode");
        toggle.textContent = isDark ? "☀️ Mode clair" : "🌙 Mode sombre";
        toggle.setAttribute("aria-label", isDark ? "Activer le mode clair" : "Activer le mode sombre");
    }

    toggle.addEventListener("click", () => {
        const isDark = root.classList.toggle("dark-mode");
        try {
            localStorage.setItem("theme", isDark ? "dark" : "light");
        } catch {  }
        updateButton();
    });

    updateButton();
}

initNav();
initPopups();
initContactForm();
initVeilleSlider();
initTheme();
initTypewriter();