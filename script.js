/* ===================================================
   Portfolio scripts - vanilla JavaScript only
   =================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Loader: fades out after ~1.5 seconds ---------- */
  window.addEventListener('load', function () {
    setTimeout(function () {
      document.getElementById('loader').classList.add('hide');
    }, 1500);
  });

  /* ---------- 2. Typing animation (loops forever) ---------- */
  // Edit the roles here
  var roles = ['Web Developer', 'Freelancer', 'Laravel Developer'];
  var typingEl = document.getElementById('typing');
  var roleIndex = 0, charIndex = 0, deleting = false;

  function type() {
    var word = roles[roleIndex];
    if (reduceMotion) { typingEl.textContent = roles.join(' | '); return; }
    charIndex += deleting ? -1 : 1;
    typingEl.textContent = word.substring(0, charIndex);
    var delay = deleting ? 50 : 100;
    if (!deleting && charIndex === word.length) { deleting = true; delay = 1400; }
    else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 400; }
    setTimeout(type, delay);
  }
  type();

  /* ---------- 3. Particle network background (canvas) ---------- */
  var canvas = document.getElementById('bg-canvas');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouse = { x: null, y: null };
  var colors = ['#00f5ff', '#8a2be2', '#ff2e93'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // fewer particles on small screens for performance
    var count = Math.min(90, Math.floor(canvas.width / 16));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.8 + 0.6, c: colors[i % 3]
      });
    }
  }
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', function () { mouse.x = null; mouse.y = null; });

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      // particles are gently pushed away from the mouse
      if (mouse.x !== null) {
        var mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 120 && md > 0) { p.x += (mdx / md) * 1.5; p.y += (mdy / md) * 1.5; }
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();
      // connect nearby particles with lines
      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.strokeStyle = 'rgba(0,245,255,' + (0.18 * (1 - d / 120)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  resizeCanvas();
  if (!reduceMotion) animateParticles();

  /* ---------- 4. Glowing cursor follower ---------- */
  var cursor = document.getElementById('cursor');
  if (!isTouch) {
    window.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, input, textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('big'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('big'); });
    });
  }

  /* ---------- 5. 3D tilt on cards ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 to 0.5
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(800px) rotateX(' + (-y * 14) + 'deg) rotateY(' + (x * 14) + 'deg) scale(1.03)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  /* ---------- 6. Scroll reveal, skill bars and counters ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10), n = 0;
    var step = Math.max(1, Math.ceil(target / 50));
    var timer = setInterval(function () {
      n = Math.min(n + step, target);
      el.textContent = n;
      if (n >= target) clearInterval(timer);
    }, 30);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('visible');
      el.querySelectorAll('.fill').forEach(function (f) { f.style.width = f.getAttribute('data-level') + '%'; });
      el.querySelectorAll('[data-target]').forEach(countUp);
      observer.unobserve(el); // run only once
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });

  /* ---------- 7. Scroll: progress bar, back-to-top, scroll-spy ---------- */
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    toTop.classList.toggle('show', window.scrollY > 400);

    var current = 'home';
    sections.forEach(function (s) { if (window.scrollY >= s.offsetTop - 140) current = s.id; });
    navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // close the mobile menu after clicking a link
  navLinks.forEach(function (l) {
    l.addEventListener('click', function () {
      var menu = document.getElementById('menu');
      if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });

  /* ---------- 8. Contact form: validation + mailto ---------- */
  var form = document.getElementById('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('.form-control').forEach(function (f) {
      var valid = f.checkValidity() && f.value.trim() !== '';
      f.classList.toggle('is-invalid', !valid);
      f.classList.toggle('is-valid', valid);
      if (!valid) ok = false;
    });
    if (!ok) return;

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var subject = document.getElementById('subject').value.trim();
    var message = document.getElementById('message').value.trim();
    var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;

    document.getElementById('formOk').classList.remove('d-none');
    window.location.href = 'mailto:syedahooriya030@gmail.com?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    form.reset();
    form.querySelectorAll('.form-control').forEach(function (f) { f.classList.remove('is-valid'); });
  });
})();
