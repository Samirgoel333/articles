(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("site-menu");
  var searchForm = document.getElementById("search-form");
  var searchInput = document.getElementById("article-search");
  var searchClear = document.getElementById("search-clear");
  var searchStatus = document.getElementById("search-status");
  var searchEmpty = document.getElementById("search-empty");

  var searchableItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-search]")
  );
  var sections = Array.prototype.slice.call(
    document.querySelectorAll(".panel")
  );

  function setMenuOpen(isOpen) {
    if (!header || !menuBtn) return;
    header.classList.toggle("is-open", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenuOpen(!header.classList.contains("is-open"));
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a") && window.matchMedia("(max-width: 899px)").matches) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });
  }

  function normalizeQuery(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function itemMatches(item, query) {
    if (!query) return true;

    var haystack = (
      (item.getAttribute("data-search") || "") +
      " " +
      (item.textContent || "")
    ).toLowerCase();

    return query.split(" ").every(function (token) {
      return token && haystack.indexOf(token) !== -1;
    });
  }

  function updateSearch(query) {
    var visibleCount = 0;

    searchableItems.forEach(function (item) {
      var show = itemMatches(item, query);
      item.classList.toggle("is-hidden", !show);
      if (show) visibleCount += 1;
    });

    sections.forEach(function (section) {
      var sectionItems = section.querySelectorAll("[data-search]");
      var sectionVisible = Array.prototype.some.call(sectionItems, function (item) {
        return !item.classList.contains("is-hidden");
      });
      section.classList.toggle("is-hidden", query.length > 0 && !sectionVisible);
    });

    if (searchClear) {
      searchClear.hidden = query.length === 0;
    }

    if (searchStatus) {
      if (!query) {
        searchStatus.textContent = "";
      } else {
        searchStatus.textContent =
          visibleCount === 1
            ? "Showing 1 guide"
            : "Showing " + visibleCount + " guides";
      }
    }

    if (searchEmpty) {
      searchEmpty.hidden = visibleCount > 0 || query.length === 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      updateSearch(normalizeQuery(searchInput.value));
    });
  }

  if (searchClear && searchInput) {
    searchClear.addEventListener("click", function () {
      searchInput.value = "";
      searchInput.focus();
      updateSearch("");
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      updateSearch(normalizeQuery(searchInput.value));
      searchInput.focus();
    });
  }

  var initialQuery = normalizeQuery(
    new URLSearchParams(window.location.search).get("q")
  );
  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
    updateSearch(initialQuery);
  }
})();
