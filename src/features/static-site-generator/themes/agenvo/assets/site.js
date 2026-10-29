/* ============================================================
   AGENVO — shared interactions
   ============================================================ */
(function () {
  "use strict";

  function init() {
    if (window.lucide) {
      window.lucide.createIcons();
    }

    /* Sticky navigation background */
    var nav = document.getElementById("site-nav");
    if (nav) {
      var setNav = function () {
        if (window.scrollY > 40) nav.classList.add("nav-scrolled");
        else nav.classList.remove("nav-scrolled");
      };
      setNav();
      window.addEventListener("scroll", setNav, { passive: true });
    }

    /* Mobile menu */
    var toggle = document.getElementById("menu-toggle");
    var panel = document.getElementById("mobile-menu");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      panel.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          panel.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    /* Scroll reveals */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });

      var lineObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              lineObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      document.querySelectorAll("[data-line]").forEach(function (el) {
        lineObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("visible");
      });
    }

    /* Counters */
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var started = false;

      var run = function () {
        if (started) return;
        started = true;
        var current = 0;
        var step = Math.max(1, Math.ceil(target / 45));
        var timer = setInterval(function () {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current;
        }, 28);
      };

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) run();
            });
          },
          { threshold: 0.5 }
        ).observe(el);
      } else {
        run();
      }
    });

    /* Current year */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* Forms */
    document.querySelectorAll("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var message = form.querySelector("[data-form-message]");
        if (message) {
          message.classList.remove("hidden");
          window.setTimeout(function () {
            message.classList.add("hidden");
          }, 8000);
        }
        form.reset();
      });
    });

    /* Portfolio filtering */
    var filterButtons = document.querySelectorAll("[data-filter]");
    if (filterButtons.length) {
      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          filterButtons.forEach(function (b) {
            b.classList.remove("active");
          });
          button.classList.add("active");

          var filter = button.getAttribute("data-filter");
          document.querySelectorAll("[data-category]").forEach(function (card) {
            var show = filter === "all" || card.getAttribute("data-category") === filter;
            card.classList.toggle("hide", !show);
          });

          var count = document.querySelector("[data-project-count]");
          if (count) {
            var visible = document.querySelectorAll(
              "[data-category]:not(.hide)"
            ).length;
            count.textContent = visible;
          }
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
