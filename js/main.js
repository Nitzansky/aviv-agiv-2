/* ==========================================================================
   Aviv Agiv — interactions
   ========================================================================== */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const body = document.body;

  /* ---- Sticky header state on scroll ---- */
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      body.style.overflow = open ? "hidden" : "";
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        body.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
        body.style.overflow = "";
      })
    );
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

  /* ---- Build randomized-but-stable podcast waveform bars ---- */
  const wave = document.querySelector(".waveform");
  if (wave) {
    const bars = 28;
    for (let i = 0; i < bars; i++) {
      const s = document.createElement("span");
      s.style.animationDelay = (i * 0.06).toFixed(2) + "s";
      s.style.height = 14 + Math.abs(Math.sin(i * 0.9)) * 40 + "px";
      wave.appendChild(s);
    }
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
      if (btn) {
        btn.disabled = true;
        btn.textContent = done;
      }
    });
  }
})();
