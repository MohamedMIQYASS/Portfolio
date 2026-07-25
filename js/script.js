// Attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", function() {
    const nav = document.querySelector('nav');
    const navUl = nav.querySelector('ul');
    const navLinks = navUl.querySelectorAll('a');
    const blob = nav.querySelector('.nav-blob');

    // Fonction pour déplacer le blob sur un élément spécifique
    function moveBlob(element) {
        // Obtenir les coordonnées de l'élément par rapport à son parent (navUl)
        const rect = element.getBoundingClientRect();
        const navRect = navUl.getBoundingClientRect();

        // Calculer la position 'left' relative
        // Nous utilisons offsetLeft de l'élément parent <li> pour plus de précision sur la zone
        const parentLi = element.closest('li');
        const leftPosition = parentLi.offsetLeft;
        const elementWidth = parentLi.offsetWidth;

        // Appliquer les nouvelles dimensions et position au blob
        blob.style.left = `${leftPosition}px`;
        blob.style.width = `${elementWidth}px`;
        blob.style.opacity = '1'; // Rendre le blob visible
    }

    // Fonction pour réinitialiser le blob sur l'élément actif
    function resetBlobToActive() {
        const activeLink = navUl.querySelector('a.active');
        if (activeLink) {
            moveBlob(activeLink);
        } else {
            blob.style.opacity = '0'; // Cacher si aucun n'est actif
            blob.style.width = '0';
        }
    }

    // 1. Initialisation : Définir le premier lien comme actif et y placer le blob
    if (navLinks.length > 0) {
        navLinks[0].classList.add('active'); // Rend 'ACCUEIL' actif par défaut
        moveBlob(navLinks[0]); // Place le blob dessus immédiatement
    }

    // 2. Gestionnaires d'événements pour le survol (hover)
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            moveBlob(this);
        });
    });

    // 3. Gestionnaire d'événement quand la souris quitte la zone de nav
    navUl.addEventListener('mouseleave', function() {
        resetBlobToActive();
    });

    // 4. Gestionnaire d'événement pour le clic (optionnel, pour changer l'élément actif)
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Retirer 'active' de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            // Ajouter 'active' au lien cliqué
            this.classList.add('active');
        });
    });

    // Recalculer la position du blob si la fenêtre est redimensionnée
    window.addEventListener('resize', resetBlobToActive);
});