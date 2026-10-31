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
      var shownAt = Date.now();
      var success = form.querySelector("[data-form-message]");
      var failure = form.querySelector("[data-form-error]");
      var button = form.querySelector("button[type=submit]");
      var buttonLabel = form.querySelector("[data-submit-label]");
      var idleLabel = buttonLabel ? buttonLabel.textContent : "";

      function show(element) {
        if (success) success.classList.add("hidden");
        if (failure) failure.classList.add("hidden");
        if (element) element.classList.remove("hidden");
      }

      function setLoading(loading) {
        if (button) {
          button.disabled = loading;
          button.setAttribute("aria-busy", loading ? "true" : "false");
        }
        if (buttonLabel) {
          buttonLabel.textContent = loading
            ? form.getAttribute("data-sending-label") || idleLabel
            : idleLabel;
        }
      }

      /* A visitor who came back from the no-JS form post sees the thank-you message */
      if (/[?&]sent=1(&|$)/.test(window.location.search)) {
        show(success);
      }

      form.addEventListener("submit", function (event) {
        var endpoint = document.body.getAttribute("data-endpoint");
        if (!endpoint) {
          return;
        }
        event.preventDefault();

        var payload = {};
        new FormData(form).forEach(function (value, key) {
          if (typeof value === "string" && value.trim() !== "") {
            payload[key] = value;
          }
        });
        if (form.elements.website) {
          payload.website = form.elements.website.value;
        }
        payload.elapsedMs = Date.now() - shownAt;

        show(null);
        setLoading(true);

        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "omit",
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("request failed");
            }
            form.reset();
            shownAt = Date.now();
            show(success);
          })
          .catch(function () {
            show(failure);
          })
          .then(function () {
            setLoading(false);
          });
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
