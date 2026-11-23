"use strict";

const MOBILE_BREAKPOINT = 768;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

const popupOverlay = document.getElementById("popup-overlay");
let activePopup = null;
let lastTrigger = null;

function openPopup(id, trigger) {
    const popup = document.getElementById(id);
    if (!popup || !popupOverlay) return;
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

function trapFocus(e) {
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
        } else if (e.key === "Tab") {
            trapFocus(e);
        }
    });
}

function initTypewriter() {
    const targets = [...document.querySelectorAll(".typewriter")];
    if (!targets.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const terminal = targets[0].closest(".terminal");
    const texts = targets.map(el => el.textContent);
    const speeds = [70, 15];
    const delays = [600, 500];

    if (terminal) terminal.style.minHeight = `${terminal.offsetHeight}px`;
    targets.forEach(el => { el.textContent = ""; });

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function run() {
        for (let i = 0; i < targets.length; i++) {
            const el = targets[i];
            el.classList.add("typing");
            await wait(delays[i] ?? 500);

            for (const char of texts[i]) {
                el.textContent += char;
                await wait(speeds[i] ?? 15);
            }

            if (i < targets.length - 1) el.classList.remove("typing");
        }
        if (terminal) terminal.style.minHeight = "";
    }

    run();
}

function initTerminalWindow() {
    const terminal = document.getElementById("terminal");
    const reopen = document.getElementById("terminal-reopen");
    if (!terminal || !reopen) return;

    function setMaximized(state) {
        terminal.classList.toggle("maximized", state);
        document.body.classList.toggle("terminal-maximized", state);
    }

    function closeTerminal() {
        setMaximized(false);
        terminal.classList.add("closed");
        reopen.hidden = false;
    }

    function reopenTerminal() {
        terminal.classList.remove("closed", "minimized");
        reopen.hidden = true;
    }

    function toggleMinimize() {
        setMaximized(false);
        terminal.style.minHeight = ""; // évite le conflit avec l'effet typewriter
        terminal.classList.toggle("minimized");
    }

    function toggleMaximize() {
        terminal.classList.remove("minimized");
        setMaximized(!terminal.classList.contains("maximized"));
    }

    const actions = {
        close: closeTerminal,
        minimize: toggleMinimize,
        maximize: toggleMaximize
    };

    terminal.addEventListener("click", e => {
        const btn = e.target.closest("[data-terminal-action]");
        if (btn) actions[btn.dataset.terminalAction]?.();
    });

    reopen.addEventListener("click", reopenTerminal);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && terminal.classList.contains("maximized")) {
            setMaximized(false);
        }
    });
}

function initNav() {
    const nav = document.querySelector("nav");
    const navUl = nav?.querySelector("ul");
    const blob = nav?.querySelector(".nav-blob");
    const burger = nav?.querySelector(".burger");
    if (!nav || !navUl || !blob || !burger) return;

    const allLinks = navUl.querySelectorAll("a");
    const sectionLinks = navUl.querySelectorAll('a[href^="#"]');
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

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

    allLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
        link.addEventListener("mouseenter", () => moveBlob(link));
        link.addEventListener("focus", () => moveBlob(link));
    });

    nav.querySelectorAll("[data-popup-target]").forEach(btn => btn.addEventListener("click", closeMenu));
    navUl.addEventListener("mouseleave", resetBlobToActive);
    navUl.addEventListener("focusout", resetBlobToActive);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeMenu();
    });

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

    window.addEventListener("scroll", () => {
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom && sectionLinks.length) setActive(sectionLinks[sectionLinks.length - 1]);
    }, { passive: true });

    window.addEventListener("resize", () => {
        if (!isMobile()) closeMenu();
        resetBlobToActive();
    });

    if (sectionLinks.length) setActive(sectionLinks[0]);
    document.fonts.ready.then(resetBlobToActive);
}

function initContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    if (!form || !status) return;

    const submitButton = form.querySelector("button[type='submit']");
    let closeTimer = null;

    function setStatus(message, type = "") {
        status.textContent = message;
        status.className = type;
    }

    form.addEventListener("submit", async e => {
        e.preventDefault();
        clearTimeout(closeTimer);
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
            closeTimer = setTimeout(() => {
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
        } catch {
            updateButton();
            return;
        }
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
initTerminalWindow();