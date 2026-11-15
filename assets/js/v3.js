/* ID CONSEIL v3 · aucun appel réseau, aucune dépendance.
   1. Menu mobile   2. Fin de l'ouverture   3. Spécialités au toucher   4. Défilement des retours */
(function () {
  'use strict';

  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      burger.textContent = ouvert ? 'Fermer' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('ouvert');
        burger.setAttribute('aria-expanded', 'false');
        burger.textContent = 'Menu';
      }
    });
  }

  var racine = document.documentElement;
  if (racine.classList.contains('intro')) {
    var fini = false;
    var fermer = function () {
      if (fini) { return; }
      fini = true;
      racine.classList.remove('intro');
    };
    var passer = document.querySelector('.ouv .passer');
    if (passer) { passer.addEventListener('click', fermer); }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fermer(); } });
    window.setTimeout(fermer, 4200);
  }

  /* Spécialités : le survol suffit sur ordinateur, le toucher ouvre et referme sur mobile. */
  var tactile = window.matchMedia('(hover: none)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('.spe'), function (carte) {
    var signe = carte.querySelector('.signe');
    if (signe && tactile) { signe.textContent = 'Touchez pour le détail'; }
    carte.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { return; }
      carte.classList.toggle('ouvert');
    });
    carte.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); carte.classList.toggle('ouvert'); }
    });
  });

  var piste = document.getElementById('defile');
  Array.prototype.forEach.call(document.querySelectorAll('.fleches button'), function (b) {
    b.addEventListener('click', function () {
      if (!piste) { return; }
      piste.scrollBy({ left: Number(b.getAttribute('data-sens')) * 632, behavior: 'smooth' });
    });
  });
})();
