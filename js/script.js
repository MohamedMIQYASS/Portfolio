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

    burger.addEventListener('click', () => {
        const open = navUl.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
    });

    allLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    function moveBlob(link) {
        if (isMobile()) return;
        const li = link.closest('li');
        blob.style.left = `${li.offsetLeft}px`;
        blob.style.width = `${li.offsetWidth}px`;
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

    allLinks.forEach(link => {
        link.addEventListener('mouseenter', () => moveBlob(link));
        link.addEventListener('focus', () => moveBlob(link));
    });
    navUl.addEventListener('mouseleave', resetBlobToActive);
    navUl.addEventListener('focusout', resetBlobToActive);

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
    window.addEventListener('resize', resetBlobToActive);
});