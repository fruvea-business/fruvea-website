(function () {
  const body = document.body;
  if (!body || !body.classList.contains("home-page")) {
    return;
  }

  body.classList.add("reveal-ready");

  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!parallaxItems.length) {
    return;
  }

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY || window.pageYOffset;
    parallaxItems.forEach(function (item) {
      const speed = Number(item.dataset.parallax) || 0.08;
      const offset = Math.min(scrollY * speed, 42);
      item.style.setProperty("--parallax-offset", offset + "px");
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  updateParallax();
  window.addEventListener("scroll", onScroll, { passive: true });
})();
