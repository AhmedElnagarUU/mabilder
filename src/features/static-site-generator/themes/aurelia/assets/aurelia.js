/* AURELIA — small interactions. Everything is readable without this file. */
(function () {
  "use strict";

  function init() {
    var nav = document.getElementById("site-nav");
    if (nav) {
      var setNav = function () {
        nav.classList.toggle("au-nav-scrolled", window.scrollY > 40);
      };
      setNav();
      window.addEventListener("scroll", setNav, { passive: true });
    }

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

    var revealEls = document.querySelectorAll(".au-reveal");
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
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("visible");
      });
    }

    /* Counters: the real number is in the page; with JavaScript it counts up once when seen */
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (!("IntersectionObserver" in window) || target === 0) return;
      var started = false;
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || started) return;
            started = true;
            observer.disconnect();
            var current = 0;
            var step = Math.max(1, Math.ceil(target / 45));
            var timer = setInterval(function () {
              current = Math.min(target, current + step);
              el.textContent = current;
              if (current >= target) clearInterval(timer);
            }, 28);
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
    });

    /* Quote / site visit / review tabs: without JavaScript all forms stay stacked */
    document.querySelectorAll("[data-contact-tabs]").forEach(function (group) {
      var tablist = group.querySelector("[data-tablist]");
      var tabs = group.querySelectorAll("[role=tab]");
      var panels = group.querySelectorAll("[data-panel]");
      if (!tablist || tabs.length === 0) return;

      tablist.classList.remove("hidden");
      tablist.classList.add("flex");
      group.querySelectorAll("[data-panel-title]").forEach(function (title) {
        title.classList.add("hidden");
      });

      function select(kind, focus) {
        tabs.forEach(function (tab) {
          var active = tab.getAttribute("data-tab") === kind;
          tab.setAttribute("aria-selected", active ? "true" : "false");
          tab.setAttribute("tabindex", active ? "0" : "-1");
          if (active && focus) tab.focus();
        });
        panels.forEach(function (item) {
          item.classList.toggle("hidden", item.getAttribute("data-panel") !== kind);
        });
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
          select(tab.getAttribute("data-tab"), false);
        });
        tab.addEventListener("keydown", function (event) {
          var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
          if (!step) return;
          var rtl = document.documentElement.dir === "rtl";
          var next = tabs[(index + (rtl ? -step : step) + tabs.length) % tabs.length];
          select(next.getAttribute("data-tab"), true);
          event.preventDefault();
        });
      });

      select(tabs[0].getAttribute("data-tab"), false);
    });

    /* "Ask about this project": the contact link carries ?project=<slug> */
    var projectParam = /[?&]project=([a-z0-9-]+)(&|#|$)/.exec(window.location.search + "&");
    var askedProject = null;
    if (projectParam) {
      document.querySelectorAll("[data-project-slug]").forEach(function (option) {
        if (!askedProject && option.getAttribute("data-project-slug") === projectParam[1]) {
          askedProject = {
            slug: option.getAttribute("data-project-slug"),
            title: option.getAttribute("data-project-title") || "",
          };
        }
      });
    }

    function fillProject(form) {
      if (!askedProject) return;
      var field = form.elements.projectSlug;
      var note = form.querySelector("[data-project-note]");
      if (field) field.value = askedProject.slug;
      if (note) {
        note.textContent = (note.getAttribute("data-about-label") || "") + " " + askedProject.title;
        note.classList.remove("hidden");
      }
    }

    function localDay(date) {
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var day = String(date.getDate()).padStart(2, "0");
      return date.getFullYear() + "-" + month + "-" + day;
    }
    document.querySelectorAll("input[data-visit-day]").forEach(function (input) {
      var today = new Date();
      input.min = localDay(today);
      input.max = localDay(new Date(today.getFullYear(), today.getMonth() + 12, today.getDate()));
    });

    document.querySelectorAll("form[data-form]").forEach(function (form) {
      fillProject(form);
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

      if (/[?&]sent=1(&|$)/.test(window.location.search)) {
        show(success);
      }

      form.addEventListener("submit", function (event) {
        var endpoint = document.body.getAttribute("data-endpoint");
        if (!endpoint) return;
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
            if (!response.ok) throw new Error("request failed");
            form.reset();
            fillProject(form);
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
