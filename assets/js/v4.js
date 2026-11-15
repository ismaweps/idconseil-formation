/* ID CONSEIL v4 · aucun appel réseau, aucune dépendance.
   1. Menu mobile   2. Cinématique d'ouverture   3. Tracés et apparitions au défilement
   4. Triangle des spécialités   5. Défilement des retours   6. Léger décalage du delta */
(function () {
  'use strict';

  var racine = document.documentElement;
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- 1. menu */
  var burger = q('.burger');
  var nav = q('.nav');
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

  /* ------------------------------------------- 3. tracés et apparitions */
  var anime = racine.classList.contains('js');

  function preparerTraits() {
    qa('.trait').forEach(function (t) {
      if (!anime || typeof t.getTotalLength !== 'function') { return; }
      var l = t.getTotalLength();
      t.style.strokeDasharray = l + ' ' + l;
      t.style.strokeDashoffset = l;
      t.setAttribute('data-l', l);
    });
  }

  function tracer(zone) {
    qa('.trait', zone).forEach(function (t) {
      var l = Number(t.getAttribute('data-l'));
      if (!l) { return; }
      var part = Number(t.getAttribute('data-part') || 1);
      t.style.strokeDashoffset = l * (1 - part);
    });
  }

  function observer() {
    var cibles = qa('.rev');
    if (!anime || !('IntersectionObserver' in window)) {
      cibles.forEach(function (c) { c.classList.add('vu'); tracer(c); });
      return;
    }
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        e.target.classList.add('vu');
        tracer(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.18 });
    cibles.forEach(function (c) { io.observe(c); });
  }

  preparerTraits();

  /* ---------------------------------------------------- 2. cinématique */
  function cinematique(fin) {
    var cine = q('.cine');
    var svg = q('#cine-svg');
    var logo = q('#logo');
    if (!cine || !svg || !svg.animate) { fin(); return; }

    var fini = false;
    var minuteries = [];
    var terminer = function () {
      if (fini) { return; }
      fini = true;
      minuteries.forEach(window.clearTimeout);
      racine.classList.remove('intro');
      fin();
    };

    var a = function (el, images, debut, duree, courbe) {
      if (!el) { return; }
      el.animate(images, { delay: debut, duration: duree, fill: 'forwards', easing: courbe || 'cubic-bezier(.6,.05,.2,1)' });
    };
    var apparait = [{ opacity: 0 }, { opacity: 1 }];
    var disparait = [{ opacity: 1 }, { opacity: 0 }];
    var pop = [{ transform: 'scale(0)' }, { transform: 'scale(1.5)', offset: 0.6 }, { transform: 'scale(1)' }];

    /* Les trois côtés se tracent l'un après l'autre, chaque sommet prend son nom. */
    ['#c1', '#c2', '#c3'].forEach(function (id, i) {
      var c = q(id);
      var l = c.getTotalLength();
      c.style.strokeDasharray = l + ' ' + l;
      c.style.strokeDashoffset = l;
      a(c, [{ strokeDashoffset: l }, { strokeDashoffset: 0 }], 350 + i * 520, 560);
    });
    a(q('#n1'), pop, 150, 380); a(q('#t1'), apparait, 300, 400);
    a(q('#n2'), pop, 850, 380); a(q('#t2'), apparait, 950, 400);
    a(q('#n3'), pop, 1370, 380); a(q('#t3'), apparait, 1470, 400);

    /* Le portrait se révèle au centre, un anneau s'élargit autour. */
    a(q('.photo'), [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], 1900, 700);
    a(q('.anneau'), [{ opacity: .9, transform: 'scale(.9)' }, { opacity: 0, transform: 'scale(1.35)' }], 2100, 900, 'ease-out');

    /* La barre ambre souligne, le nom s'inscrit. */
    a(q('.cine .barre'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 2500, 520);
    a(q('.cine-nom'), apparait, 2800, 450);
    a(q('.cine-base'), apparait, 3000, 450);

    /* Tout s'efface sauf le symbole, qui part se ranger dans le logo de l'en-tête. */
    var sortie = 3900;
    qa('.cine text, .cine .noeud, .cine .photo, .cine-nom, .cine-base, .cine .passer').forEach(function (el) {
      a(el, disparait, sortie, 300, 'ease');
    });

    minuteries.push(window.setTimeout(function () {
      if (fini) { return; }
      var s = svg.getBoundingClientRect();
      var cible = logo ? logo.getBoundingClientRect() : null;
      if (cible && cible.width) {
        var echelle = (cible.width * 0.7) / (s.width * 500 / 600);
        var dx = (cible.left + cible.width * 0.5) - (s.left + s.width * 0.5);
        var dy = (cible.top + cible.height * 0.56) - (s.top + s.height * 0.547);
        svg.style.transformOrigin = '50% 54.7%';
        a(svg, [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + echelle + ')', opacity: 1, offset: 0.85 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + echelle + ')', opacity: 0 }
        ], 0, 820);
      }
      a(q('.cine-fond'), disparait, 150, 650, 'ease');
    }, sortie + 250));

    minuteries.push(window.setTimeout(terminer, sortie + 1150));

    var passer = q('.cine .passer');
    if (passer) { passer.addEventListener('click', terminer); }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { terminer(); } });
  }

  if (racine.classList.contains('intro')) { cinematique(observer); } else { observer(); }

  /* -------------------------------------------- 4. triangle des spécialités */
  var onglets = qa('.sommet');
  var choisir = function (onglet) {
    onglets.forEach(function (o) {
      var actif = o === onglet;
      o.setAttribute('aria-selected', actif ? 'true' : 'false');
      var p = document.getElementById(o.getAttribute('aria-controls'));
      if (p) { p.hidden = !actif; }
    });
  };
  onglets.forEach(function (o) {
    o.addEventListener('mouseenter', function () { choisir(o); });
    o.addEventListener('focus', function () { choisir(o); });
    o.addEventListener('click', function () { choisir(o); });
  });
  var indice = qa('.tri .centre');
  if (indice.length && window.matchMedia('(hover: none)').matches) {
    indice[0].textContent = 'TOUCHEZ';
  }

  /* --------------------------------------------- 5. défilement des retours */
  var piste = document.getElementById('defile');
  qa('.fleches button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (piste) { piste.scrollBy({ left: Number(b.getAttribute('data-sens')) * 632, behavior: 'smooth' }); }
    });
  });

  /* --------------------------------- 6. le delta du haut de page glisse un peu */
  var delta = q('.h4-delta');
  if (delta && anime && window.matchMedia('(min-width: 861px)').matches) {
    var attente = false;
    window.addEventListener('scroll', function () {
      if (attente) { return; }
      attente = true;
      window.requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        delta.style.transform = 'translateY(' + (y * 0.14) + 'px) rotate(' + (y * 0.008) + 'deg)';
        attente = false;
      });
    }, { passive: true });
  }
})();
