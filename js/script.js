document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector('nav');
    const navUl = nav.querySelector('ul');
    const allLinks = navUl.querySelectorAll('a');
    const sectionLinks = navUl.querySelectorAll('a[href^="#"]');
    const blob = nav.querySelector('.nav-blob');
    const burger = nav.querySelector('.burger');

    const isMobile = () => window.innerWidth <= 768;

    function closeMenu() {
        navUl.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
    }

    function moveBlob(link) {
        if (isMobile()) return;
        const li = link.closest('li');
        blob.style.left = `${li.offsetLeft}px`;
        blob.style.top = `${li.offsetTop}px`;
        blob.style.width = `${li.offsetWidth}px`;
        blob.style.height = `${li.offsetHeight}px`;
        blob.style.opacity = '1';
    }

    function resetBlobToActive() {
        const active = navUl.querySelector('a.active');
        if (active) {
            moveBlob(active);
        } else {
            blob.style.opacity = '0';
            blob.style.width = '0';
        }
    }

    function setActive(link) {
        sectionLinks.forEach(l => l.classList.toggle('active', l === link));
        if (!navUl.matches(':hover')) resetBlobToActive();
    }

    // Menu burger
    burger.addEventListener('click', () => {
        const open = navUl.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
    });
    allLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    // Bulle de survol
    allLinks.forEach(link => {
        link.addEventListener('mouseenter', () => moveBlob(link));
        link.addEventListener('focus', () => moveBlob(link));
    });
    navUl.addEventListener('mouseleave', resetBlobToActive);
    navUl.addEventListener('focusout', resetBlobToActive);

    // Lien actif selon la section visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const link = navUl.querySelector(`a[href="#${entry.target.id}"]`);
                if (link) setActive(link);
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sectionLinks.forEach(link => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) observer.observe(target);
    });

    if (sectionLinks.length) setActive(sectionLinks[0]);
    document.fonts.ready.then(resetBlobToActive);

    // Bas de page : activer le dernier lien (la section Contact est trop courte pour être détectée)
    window.addEventListener('scroll', () => {
        const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (bottom && sectionLinks.length) setActive(sectionLinks[sectionLinks.length - 1]);
    }, { passive: true });

    // Un seul écouteur resize
    window.addEventListener('resize', () => {
        if (!isMobile()) closeMenu();
        resetBlobToActive();
    });
});

function openPopup() {
    document.getElementById("popup").classList.add("open-popup");
    document.getElementById("popup-overlay").classList.add("open-popup");
}

function openPopup2() {
    document.getElementById("popup2").classList.add("open-popup2");
    document.getElementById("popup-overlay2").classList.add("open-popup2");
}

function closePopup() {
    document.getElementById("popup").classList.remove("open-popup");
    document.getElementById("popup-overlay").classList.remove("open-popup");
}

function closePopup2() {
    document.getElementById("popup2").classList.remove("open-popup2");
    document.getElementById("popup-overlay2").classList.remove("open-popup2");
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePopup();
});
