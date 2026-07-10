(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Below 700px the area map viewBox is cropped so labels render larger;
  // pairs with the max-width:700px font bump in style.css.
  var areaMapSvg = document.querySelector(".area-map svg");
  var mapMedia = window.matchMedia("(max-width: 700px)");
  function fitAreaMap() {
    if (!areaMapSvg) return;
    areaMapSvg.setAttribute("viewBox", mapMedia.matches ? "30 60 740 340" : "0 0 800 440");
  }
  if (areaMapSvg) {
    fitAreaMap();
    if (typeof mapMedia.addEventListener === "function") {
      mapMedia.addEventListener("change", fitAreaMap);
    } else if (typeof mapMedia.addListener === "function") {
      mapMedia.addListener(fitAreaMap);
    }
  }

  document.querySelectorAll('.site-nav a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      link.blur();
    });
  });

  if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  var heroItems = gsap.utils.toArray("[data-hero]");
  if (heroItems.length) {
    gsap.set(heroItems, { opacity: 0, y: 34 });
    gsap.to(heroItems, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.09,
      delay: 0.15
    });
  }

  var revealItems = gsap.utils.toArray("[data-reveal]");
  if (revealItems.length) {
    gsap.set(revealItems, { opacity: 0, y: 42 });
    ScrollTrigger.batch(revealItems, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1
        });
      }
    });
    ScrollTrigger.refresh();
  }

  gsap.utils.toArray(".step-num").forEach(function (el) {
    gsap.fromTo(
      el,
      { yPercent: 14 },
      {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 }
      }
    );
  });
})();
