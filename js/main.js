/* ==========================================================================
   Aviv Agiv — interactions
   ========================================================================== */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- Smooth momentum scrolling (Lenis, progressive enhancement) ---- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ---- In-page anchor navigation ---- */
  const HEADER_OFFSET = 90;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -HEADER_OFFSET });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ---- Scroll-driven UI: header state, progress bar, hero parallax ---- */
  const progress = document.querySelector(".scroll-progress");
  const glow = document.querySelector(".hero-glow");
  const hero = document.querySelector(".hero");

  const onScroll = (scrollY) => {
    const y = typeof scrollY === "number" ? scrollY : window.scrollY;

    header.classList.toggle("scrolled", y > 24);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }
    if (glow && hero && y < hero.offsetHeight) {
      glow.style.setProperty("--py", y * 0.2 + "px");
    }
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(), { passive: true });
  onScroll(0);

  /* ---- Mobile menu ---- */
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const setMenu = (open) => {
    body.classList.toggle("menu-open", open);
    if (menuToggle) menuToggle.setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
    body.style.overflow = open ? "hidden" : "";
  };
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
    navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---- Count-up stats ---- */
  const counters = document.querySelectorAll(".stat .n[data-count]");
  const runCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1500;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      }),
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ---- Podcast waveform bars ---- */
  const wave = document.querySelector(".waveform");
  if (wave) {
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("span");
      s.style.animationDelay = (i * 0.06).toFixed(2) + "s";
      s.style.height = 14 + Math.abs(Math.sin(i * 0.9)) * 40 + "px";
      wave.appendChild(s);
    }
  }

  /* ---- Magnetic buttons (hover-capable pointers only) ---- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });

    /* ---- Subtle 3D tilt + glass reflection on service cards ---- */
    document.querySelectorAll(".service").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const rx = e.clientX - r.left;
        const ry = e.clientY - r.top;
        const px = rx / r.width - 0.5;
        const py = ry / r.height - 0.5;
        card.style.transform = `rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateZ(6px)`;
        card.style.transitionDuration = "0.08s";
        card.style.setProperty("--mx", rx + "px");
        card.style.setProperty("--my", ry + "px");
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.style.transitionDuration = "";
      });
    });

    /* ---- Cursor light that follows the pointer ---- */
    const cursorGlow = document.createElement("div");
    cursorGlow.className = "cursor-glow";
    document.body.appendChild(cursorGlow);
    let cx = 0, cy = 0, glowRaf = null;
    window.addEventListener("pointermove", (e) => {
      cx = e.clientX; cy = e.clientY;
      cursorGlow.classList.add("on");
      if (!glowRaf) {
        glowRaf = requestAnimationFrame(() => {
          cursorGlow.style.transform = `translate(${cx}px, ${cy}px)`;
          glowRaf = null;
        });
      }
    }, { passive: true });
    window.addEventListener("pointerleave", () => cursorGlow.classList.remove("on"));
  }

  /* ---- Footer year ---- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Graceful contact form (no backend) ---- */
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const done = form.getAttribute("data-thanks") || "Thank you — I'll be in touch.";
      if (btn) { btn.disabled = true; btn.textContent = done; }
    });
  }
})();
