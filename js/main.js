(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Cursor glow (CSS variable driven radial spotlight)                  */
  /* ------------------------------------------------------------------ */
  const glow = document.querySelector(".cursor-glow");
  if (glow) {
    window.addEventListener("pointermove", (e) => {
      glow.style.setProperty("--x", `${e.clientX}px`);
      glow.style.setProperty("--y", `${e.clientY}px`);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Mouse-reactive particle network background                          */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById("bg-canvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let width, height, particles;
    const mouse = { x: null, y: null, radius: 140 };

    const isSmall = () => window.innerWidth < 700;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = prefersReducedMotion ? 0 : isSmall() ? 45 : 95;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x += (dx / dist) * force * 1.6;
            p.y += (dy / dist) * force * 1.6;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 200, 255, 0.65)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124, 92, 255, ${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(step);
    }

    resize();
    createParticles();
    if (!prefersReducedMotion) requestAnimationFrame(step);

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    window.addEventListener("pointermove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener("pointerleave", () => {
      mouse.x = null;
      mouse.y = null;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Navbar: scrolled state, mobile toggle, scroll-spy                   */
  /* ------------------------------------------------------------------ */
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navAnchors = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
    toggleBackToTop();
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });

    navAnchors.forEach((a) =>
      a.addEventListener("click", () => {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
      })
    );
  }

  const sections = document.querySelectorAll("section[id]");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navAnchors.forEach((a) => {
            a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ------------------------------------------------------------------ */
  /* Reveal-on-scroll                                                     */
  /* ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------ */
  /* Typing effect                                                        */
  /* ------------------------------------------------------------------ */
  const typingEl = document.getElementById("typing");
  if (typingEl) {
    const roles = [
      "IT Technical Officer",
      "IT Support Specialist",
      "AWS & Office 365 Admin",
      "ASP.NET MVC Developer",
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function type() {
      const current = roles[roleIndex];
      typingEl.textContent = deleting
        ? current.substring(0, charIndex--)
        : current.substring(0, charIndex++);

      let delay = deleting ? 45 : 90;

      if (!deleting && charIndex === current.length + 1) {
        deleting = true;
        delay = 1400;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 300;
      }

      setTimeout(type, delay);
    }
    type();
  }

  /* ------------------------------------------------------------------ */
  /* Back to top                                                          */
  /* ------------------------------------------------------------------ */
  const backToTop = document.querySelector(".back-to-top");
  function toggleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle("show", window.scrollY > 500);
  }
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Project lightbox                                                     */
  /* ------------------------------------------------------------------ */
  const cards = Array.from(document.querySelectorAll(".project-card[data-img]"));
  const lightbox = document.querySelector(".lightbox");
  if (lightbox && cards.length) {
    const lightboxImg = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-nav.prev");
    const nextBtn = lightbox.querySelector(".lightbox-nav.next");
    let current = 0;

    function openLightbox(index) {
      current = index;
      const card = cards[current];
      lightboxImg.src = card.dataset.img;
      lightboxImg.alt = card.dataset.title;
      lightboxCaption.textContent = card.dataset.title;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }

    function step(dir) {
      current = (current + dir + cards.length) % cards.length;
      openLightbox(current);
    }

    cards.forEach((card, i) => {
      card.addEventListener("click", () => openLightbox(i));
      card.addEventListener("keypress", (e) => {
        if (e.key === "Enter") openLightbox(i);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Footer year                                                          */
  /* ------------------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
