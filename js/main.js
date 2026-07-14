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
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // -- Landing: hero content settles in on load -----------------------------
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

  // -- Reveals are entrance-only (once) so fast scrolling is never blocked ---

  // Section headers and standalone blocks: a clean lift.
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    if (el.classList.contains("card") || el.classList.contains("step")) return;
    gsap.set(el, { opacity: 0, y: 28 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true }
    });
  });

  // Cards and steps: staggered, with a subtle scale so grids feel composed.
  [".service-grid .card", ".steps .step"].forEach(function (sel) {
    var items = gsap.utils.toArray(sel);
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 46, scale: 0.985 });
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09
        });
      }
    });
  });

  // Feature card's fiber line draws itself in as the card appears.
  // pathLength normalisation avoids getTotalLength() returning 0 pre-layout.
  var featPath = document.querySelector(".card-feature .card-fiber path");
  if (featPath) {
    featPath.setAttribute("pathLength", "1");
    gsap.set(featPath, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(featPath, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: { trigger: ".card-feature", start: "top 82%", once: true }
    });
  }

  // -- Signature beat: the service-area map draws its network as you scroll --
  // Scrubbed (not pinned): fast scroll just fast-forwards the draw.
  var mapSvg = document.querySelector(".area-map svg");
  if (mapSvg) {
    var mapLines = gsap.utils.toArray(".map-lines path", mapSvg);
    var mapNodes = gsap.utils.toArray(".map-node", mapSvg);
    var mapHub = mapSvg.querySelector(".map-hub");

    mapLines.forEach(function (p) {
      p.setAttribute("pathLength", "1");
      gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 });
    });
    gsap.set(mapNodes, { opacity: 0, y: 6 });
    if (mapHub) gsap.set(mapHub, { opacity: 0 });

    var mapTl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".area-map", start: "top 78%", end: "bottom 62%", scrub: 0.6 }
    });
    if (mapHub) mapTl.to(mapHub, { opacity: 1, duration: 0.5 }, 0);
    mapLines.forEach(function (p, i) {
      var at = 0.35 + i * 0.5;
      mapTl.to(p, { strokeDashoffset: 0, duration: 1 }, at);
      if (mapNodes[i]) {
        mapTl.to(mapNodes[i], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, at + 0.35);
      }
    });
  }

  // -- Depth: step numbers drift gently against the scroll (parallax) --------
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

  ScrollTrigger.refresh();
})();
