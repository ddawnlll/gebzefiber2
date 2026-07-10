"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SiteScripts() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector(".site-header");
    const yearEl = document.getElementById("year");

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
    // pairs with the max-width:700px font bump in globals.css.
    const areaMapSvg = document.querySelector(".area-map svg");
    const mapMedia = window.matchMedia("(max-width: 700px)");
    function fitAreaMap() {
      if (!areaMapSvg) return;
      areaMapSvg.setAttribute("viewBox", mapMedia.matches ? "30 60 740 340" : "0 0 800 440");
    }
    if (areaMapSvg) {
      fitAreaMap();
      mapMedia.addEventListener("change", fitAreaMap);
    }

    function blurOnClick(this: HTMLAnchorElement) {
      this.blur();
    }
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.site-nav a[href^="#"]');
    navLinks.forEach((link) => link.addEventListener("click", blurOnClick));

    let cleanupGsap: (() => void) | undefined;

    if (!prefersReduced && gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero]");
      if (heroItems.length) {
        gsap.set(heroItems, { opacity: 0, y: 34 });
        gsap.to(heroItems, {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.09,
          delay: 0.15,
        });
      }

      const revealItems = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      let batchTriggers: ScrollTrigger[] = [];
      if (revealItems.length) {
        gsap.set(revealItems, { opacity: 0, y: 42 });
        batchTriggers = ScrollTrigger.batch(revealItems, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.1,
            });
          },
        });
        ScrollTrigger.refresh();
      }

      const stepNumTweens = gsap.utils.toArray<HTMLElement>(".step-num").map((el) =>
        gsap.fromTo(
          el,
          { yPercent: 14 },
          {
            yPercent: -14,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
          }
        )
      );

      cleanupGsap = () => {
        batchTriggers.forEach((trigger) => trigger.kill());
        stepNumTweens.forEach((tween) => tween.scrollTrigger?.kill());
        stepNumTweens.forEach((tween) => tween.kill());
      };
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      mapMedia.removeEventListener("change", fitAreaMap);
      navLinks.forEach((link) => link.removeEventListener("click", blurOnClick));
      cleanupGsap?.();
    };
  }, []);

  return null;
}
