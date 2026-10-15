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

function togglePopup(popupId, overlayId, show) {
    const popup = document.getElementById(popupId);
    const overlay = document.getElementById(overlayId);
    popup.classList.toggle("open-popup", show);
    overlay.classList.toggle("open-popup", show);
    popup.setAttribute("aria-hidden", String(!show));
}

function openPopup()   { togglePopup("popup",  "popup-overlay",  true);  }
function openPopup2()  { togglePopup("popup2", "popup-overlay2", true);  }
function closePopup()  { togglePopup("popup",  "popup-overlay",  false); }
function closePopup2() { togglePopup("popup2", "popup-overlay2", false); }

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closePopup();
        closePopup2();
    }
});

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const button = form.querySelector("button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  button.disabled = true;
  status.className = "";
  status.textContent = "Envoi en cours...";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });

    if (response.ok) {
      status.textContent = "Merci ! Votre message a bien été envoyé.";
      status.className = "success";
      form.reset();
    } else {
      throw new Error();
    }
  } catch {
    status.textContent = "Une erreur est survenue. Réessayez ou contactez-moi via LinkedIn.";
    status.className = "error";
  } finally {
    button.disabled = false;
  }
});