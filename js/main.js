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

  /* ---- Scroll-driven UI: header state, progress bar, traveling halo ---- */
  const progress = document.querySelector(".scroll-progress");
  const halo = document.querySelector(".page-halo");
  const TAU = Math.PI * 2;

  const onScroll = (scrollY) => {
    const y = typeof scrollY === "number" ? scrollY : window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;

    header.classList.toggle("scrolled", y > 24);

    if (progress) progress.style.transform = "scaleX(" + p + ")";

    /* Halo drifts top -> bottom while swaying gently left/right, with a soft scale pulse */
    if (halo && !reduceMotion && !document.documentElement.classList.contains("a11y-stop-motion")) {
      const x = Math.sin(p * TAU * 1.5) * 20;              // vw sway
      const yy = -26 + p * 42 + Math.sin(p * TAU * 2) * 7; // vh drift
      const s = 1 + Math.sin(p * TAU) * 0.06;              // scale pulse
      halo.style.transform = `translate(${x}vw, ${yy}vh) scale(${s})`;
    }
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(), { passive: true });
  window.addEventListener("resize", () => onScroll(), { passive: true });
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
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && body.classList.contains("menu-open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });
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
  }

  /* ---- Floating contact launcher (mobile) ---- */
  const fab = document.querySelector("[data-fab]");
  if (fab) {
    const fabToggle = fab.querySelector(".fab-toggle");
    const setFab = (open) => {
      fab.classList.toggle("open", open);
      fabToggle.setAttribute("aria-expanded", String(open));
    };
    fabToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setFab(!fab.classList.contains("open"));
    });
    fab.querySelectorAll(".fab-action").forEach((a) =>
      a.addEventListener("click", () => setFab(false))
    );
    document.addEventListener("click", (e) => {
      if (!fab.contains(e.target)) setFab(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && fab.classList.contains("open")) {
        setFab(false);
        fabToggle.focus();
      }
    });
  }

  /* ---- Accessibility widget (text size, contrast, spacing, etc.) ---- */
  (function initA11y() {
    const root = document.documentElement;
    const widget = document.querySelector("[data-a11y]");
    if (!widget) return;
    const trigger = widget.querySelector(".a11y-trigger");
    const panel = widget.querySelector(".a11y-panel");
    const closeBtn = widget.querySelector(".a11y-close");
    const sizeLabel = widget.querySelector("[data-a11y-size]");
    const KEY = "avivagiv-a11y";
    const SIZES = [100, 112, 125, 140, 160, 180];
    const MODES = {
      contrast: "a11y-contrast",
      links: "a11y-links",
      spacing: "a11y-spacing",
      readable: "a11y-readable",
      "stop-motion": "a11y-stop-motion",
      "big-cursor": "a11y-big-cursor",
    };

    let state = { size: 0, modes: {} };
    try { state = Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
    state.modes = state.modes || {};

    const apply = () => {
      root.style.fontSize = SIZES[state.size] + "%";
      if (sizeLabel) sizeLabel.textContent = SIZES[state.size] + "%";
      Object.keys(MODES).forEach((k) => {
        const on = !!state.modes[k];
        root.classList.toggle(MODES[k], on);
        const btn = widget.querySelector('[data-a11y-toggle="' + k + '"]');
        if (btn) btn.setAttribute("aria-pressed", String(on));
      });
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    };

    const open = () => {
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      closeBtn.focus();
    };
    const close = (returnFocus) => {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) trigger.focus();
    };

    trigger.addEventListener("click", () => (panel.hidden ? open() : close(true)));
    closeBtn.addEventListener("click", () => close(true));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) close(true);
    });
    document.addEventListener("click", (e) => {
      if (!widget.contains(e.target) && !panel.hidden) close(false);
    });

    widget.querySelector("[data-a11y-inc]").addEventListener("click", () => {
      state.size = Math.min(state.size + 1, SIZES.length - 1); apply();
    });
    widget.querySelector("[data-a11y-dec]").addEventListener("click", () => {
      state.size = Math.max(state.size - 1, 0); apply();
    });
    widget.querySelectorAll("[data-a11y-toggle]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const k = btn.getAttribute("data-a11y-toggle");
        state.modes[k] = !state.modes[k]; apply();
      })
    );
    widget.querySelector("[data-a11y-reset]").addEventListener("click", () => {
      state = { size: 0, modes: {} }; apply();
    });

    apply();
  })();

  /* ---- Theme toggle (dark by default, light opt-in, persisted) ---- */
  (function initTheme() {
    const root = document.documentElement;
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;
    const KEY = "avivagiv-theme";
    const meta = document.querySelector('meta[name="theme-color"]');
    const COLORS = { dark: "#07121c", light: "#f0f6f9" };
    const isHe = root.lang === "he";
    const LABEL = {
      dark: isHe ? "מעבר לתצוגה בהירה" : "Switch to light view",
      light: isHe ? "מעבר לתצוגה כהה" : "Switch to dark view",
    };

    const apply = (theme) => {
      if (theme === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
      toggle.setAttribute("aria-pressed", String(theme === "light"));
      toggle.setAttribute("aria-label", LABEL[theme]);
      if (meta) meta.setAttribute("content", COLORS[theme]);
    };

    let theme = "dark";
    try { if (localStorage.getItem(KEY) === "light") theme = "light"; } catch (e) {}
    apply(theme);

    toggle.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      apply(theme);
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    });
  })();

  /* ---- Footer year ---- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Accessible contact form (client-side validation, no backend) ---- */
  const form = document.querySelector(".contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const fields = Array.from(form.querySelectorAll("input, textarea"));
    const isHe = document.documentElement.lang === "he";
    const T = {
      required: isHe ? "נא למלא שדה זה." : "Please fill in this field.",
      email: isHe ? "נא להזין כתובת אימייל תקינה." : "Please enter a valid email address.",
    };
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const errEl = (f) => document.getElementById(f.getAttribute("aria-describedby"));
    const showError = (f, msg) => {
      f.setAttribute("aria-invalid", "true");
      const el = errEl(f);
      if (el) { el.textContent = msg; el.hidden = false; }
    };
    const clearError = (f) => {
      f.removeAttribute("aria-invalid");
      const el = errEl(f);
      if (el) { el.textContent = ""; el.hidden = true; }
    };
    const validateField = (f) => {
      const val = f.value.trim();
      if (!val) { showError(f, T.required); return false; }
      if (f.type === "email" && !emailRe.test(val)) { showError(f, T.email); return false; }
      clearError(f);
      return true;
    };

    // Re-validate a field as the user corrects it (only once it's been flagged)
    fields.forEach((f) =>
      f.addEventListener("input", () => {
        if (f.getAttribute("aria-invalid") === "true") validateField(f);
      })
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstInvalid = null;
      fields.forEach((f) => {
        if (!validateField(f) && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) {
        if (status) status.textContent = "";
        firstInvalid.focus();
        return;
      }
      if (status) status.textContent = form.getAttribute("data-thanks") || "Thank you — I'll be in touch.";
      form.reset();
      fields.forEach(clearError);
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
    });
  }
})();
