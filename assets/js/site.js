/* ==========================================================================
   ID CONSEIL — script unique. Aucune dépendance, aucun appel réseau.
   1. Menu mobile
   2. Calculateur de potentiel
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------- menu mobile */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      burger.textContent = ouvert ? 'Fermer' : 'Menu';
    });
  }

  /* ----------------------------------------------------------- calculateur

     Formule : techniciens x ventes par semaine x semaines x gain unitaire
     36 semaines = 52 semaines moins congés, formations, absences et
     saisonnalité. Hypothèse conservatrice, affichée comme telle.
  */
  var SEMAINES = 36;

  var champs = {
    tech: document.getElementById('c-tech'),
    gain: document.getElementById('c-gain'),
    freq: document.getElementById('c-freq')
  };

  if (champs.tech && champs.gain && champs.freq) {
    var sorties = {
      tech: document.getElementById('v-tech'),
      gain: document.getElementById('v-gain'),
      freq: document.getElementById('v-freq'),
      total: document.getElementById('v-total'),
      detail: document.getElementById('v-detail')
    };

    var euro = function (n) {
      return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
    };

    /* --------------------------------------------------- le graphique
       Douze barres, une par mois, hauteur proportionnelle au chiffre
       d'affaires récurrent cumulé depuis janvier. Construites une seule
       fois au chargement, puis seulement redimensionnées à chaque
       déplacement de curseur : pas de re-création d'élément à chaque
       frappe. */
    var groupeBarres = document.getElementById('v-barres');
    var barres = [];
    var MOIS = 12, LARGEUR = 22, ECART = 8, HAUT_MAX = 100, BASE = 119;

    if (groupeBarres) {
      var depart = (360 - (MOIS * LARGEUR + (MOIS - 1) * ECART)) / 2;
      for (var i = 0; i < MOIS; i++) {
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', depart + i * (LARGEUR + ECART));
        rect.setAttribute('width', LARGEUR);
        rect.setAttribute('y', BASE);
        rect.setAttribute('height', 0);
        rect.setAttribute('rx', 2);
        groupeBarres.appendChild(rect);
        barres.push(rect);
      }
    }

    var calculer = function () {
      var tech = parseInt(champs.tech.value, 10);
      var gain = parseInt(champs.gain.value, 10);
      var freq = parseInt(champs.freq.value, 10) / 4; // le curseur est en quarts

      var ventes = tech * freq * SEMAINES;
      var total = ventes * gain;

      sorties.tech.textContent = tech;
      sorties.gain.textContent = euro(gain);
      sorties.freq.textContent = freq.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
      sorties.total.textContent = euro(total);
      sorties.detail.textContent =
        tech + ' techniciens × ' +
        freq.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' vente/semaine × ' +
        SEMAINES + ' semaines × ' + euro(gain) + ' = ' +
        Math.round(ventes).toLocaleString('fr-FR') + ' ventes par an';

      if (barres.length) {
        barres.forEach(function (rect, idx) {
          var cumul = total * (idx + 1) / MOIS;
          var h = Math.max(2, (cumul / total) * HAUT_MAX);
          rect.setAttribute('height', h);
          rect.setAttribute('y', BASE - h);
        });
      }
    };

    ['input', 'change'].forEach(function (ev) {
      champs.tech.addEventListener(ev, calculer);
      champs.gain.addEventListener(ev, calculer);
      champs.freq.addEventListener(ev, calculer);
    });

    calculer();
  }

  /* ------------------------------------------------------ compteurs

     Les chiffres clés s'incrémentent quand ils entrent dans l'écran.
     Trois garde-fous : la valeur finale est écrite en dur dans le HTML
     (donc lisible sans JavaScript et par un robot d'indexation),
     l'animation ne se joue qu'une fois, et elle est désactivée si le
     visiteur a demandé moins d'animations dans son système.
  */
  var compteurs = document.querySelectorAll('[data-compte]');

  if (compteurs.length) {
    var reduit = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var animer = function (el) {
      var cible = parseInt(el.getAttribute('data-compte'), 10);
      if (isNaN(cible) || reduit) return;
      var duree = 1200;
      var debut = null;
      el.textContent = '0';
      var pas = function (t) {
        if (debut === null) debut = t;
        var p = Math.min((t - debut) / duree, 1);
        var adouci = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(cible * adouci);
        if (p < 1) requestAnimationFrame(pas);
        else el.textContent = cible;
      };
      requestAnimationFrame(pas);
    };

    if ('IntersectionObserver' in window && !reduit) {
      var vigie = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (e.isIntersecting) { animer(e.target); vigie.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(compteurs, function (c) { vigie.observe(c); });
    }
  }

  /* ------------------------------------------- indice de défilement

     Un tableau ou une frise plus large que l'écran se fait scroller
     horizontalement. Sur mobile, rien ne le signale et le lecteur croit
     que la colonne de droite n'existe pas. On affiche un indice, et
     uniquement quand il y a réellement quelque chose à faire défiler.
  */
  var zones = document.querySelectorAll('.tab-scroll, .frise, .matrice');

  Array.prototype.forEach.call(zones, function (z) {
    var indice = document.createElement('p');
    indice.className = 'indice';
    indice.textContent = z.classList.contains('frise')
      ? 'Faites défiler la frise vers la droite →'
      : 'Faites défiler vers la droite pour voir toutes les colonnes →';
    z.parentNode.insertBefore(indice, z.nextSibling);

    var verifier = function () {
      var deborde = z.scrollWidth - z.clientWidth > 8;
      var reste = z.scrollWidth - z.clientWidth - z.scrollLeft > 8;
      indice.classList.toggle('visible', deborde && reste);
    };

    z.addEventListener('scroll', verifier, { passive: true });
    window.addEventListener('resize', verifier);
    verifier();
  });
})();
