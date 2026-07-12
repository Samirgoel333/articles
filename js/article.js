(function () {
  var root = document.documentElement;

  function updateReadProgress() {
    var bar = document.getElementById('readProgressBar');
    if (!bar) {
      return;
    }

    var scrollTop = window.scrollY || root.scrollTop;
    var scrollable = root.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }

  window.addEventListener('scroll', updateReadProgress, { passive: true });
  window.addEventListener('resize', updateReadProgress);
  updateReadProgress();

  function initTocPager() {
    var pager = document.querySelector('.article-page--map-input .toc.toc--pager');
    if (!pager) {
      return;
    }

    var links = pager.querySelectorAll('a[href^="#"]');
    if (!links.length) {
      return;
    }

    var tracked = [];
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) {
        tracked.push({ link: link, section: section });
      }
    });

    if (!tracked.length) {
      return;
    }

    function setActive(activeLink) {
      links.forEach(function (link) {
        link.classList.toggle('is-active', link === activeLink);
      });

      if (activeLink && typeof activeLink.scrollIntoView === 'function') {
        activeLink.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }

    function updateActive() {
      var current = tracked[0];
      var marker = window.innerHeight * 0.28;
      tracked.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= marker) {
          current = item;
        }
      });
      setActive(current.link);
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
  }

  function isPhoneDevice() {
    return (
      window.matchMedia('(max-width: 900px)').matches ||
      /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  function isEditorialPhoneSession() {
    var page = document.querySelector('.article-page--editorial');
    if (!page) {
      return false;
    }

    try {
      if (sessionStorage.getItem('ed-phone-ui') === '1') {
        return true;
      }
    } catch (e) {}

    if (isPhoneDevice()) {
      try {
        sessionStorage.setItem('ed-phone-ui', '1');
      } catch (e) {}
      return true;
    }

    return false;
  }

  function getViewportMeta() {
    return document.querySelector('meta[name="viewport"]');
  }

  function setDesktopView(enabled) {
    var meta = getViewportMeta();
    if (meta) {
      meta.setAttribute(
        'content',
        enabled ? 'width=1100' : 'width=device-width, initial-scale=1.0'
      );
    }

    root.classList.toggle('ed-force-desktop', enabled);

    try {
      sessionStorage.setItem('ed-view-mode', enabled ? 'desktop' : 'mobile');
    } catch (e) {}
  }

  function initViewToggle() {
    var page = document.querySelector('.article-page--editorial');
    if (!page || document.querySelector('.view-toggle-fab')) {
      return;
    }

    if (!isEditorialPhoneSession()) {
      return;
    }

    page.classList.add('has-view-toggle');

    /* Ensure phones start in responsive mobile view on each load */
    if (!root.classList.contains('ed-force-desktop')) {
      setDesktopView(false);
    }

    var desktopOn = root.classList.contains('ed-force-desktop');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'view-toggle-fab';
    btn.setAttribute('aria-pressed', desktopOn ? 'true' : 'false');

    function renderLabel() {
      var on = root.classList.contains('ed-force-desktop');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        on ? 'Switch to mobile view' : 'Switch to desktop view'
      );
      btn.innerHTML =
        '<span class="view-toggle-fab__icon" aria-hidden="true">' +
        (on
          ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>'
          : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>') +
        '</span>' +
        '<span class="view-toggle-fab__label">' +
        (on ? 'Mobile' : 'Desktop') +
        '</span>';
    }

    renderLabel();

    btn.addEventListener('click', function () {
      var next = !root.classList.contains('ed-force-desktop');
      setDesktopView(next);
      renderLabel();
      window.dispatchEvent(new Event('resize'));
    });

    page.appendChild(btn);
  }

  function initMobileToc() {
    if (document.querySelector('.article-page--editorial')) {
      return;
    }

    // Map-input pager TOC already works on mobile — skip FAB.
    if (document.querySelector('.article-page--map-input .toc.toc--pager')) {
      return;
    }

    var mobileQuery = window.matchMedia('(max-width: 900px)');
    var sourceToc = document.querySelector('.layout .toc');

    if (!sourceToc || document.querySelector('.toc-fab') || !mobileQuery.matches) {
      return;
    }

    var sourceList = sourceToc.querySelector('ul');
    if (!sourceList) {
      return;
    }

    var articlePage = document.querySelector('.article-page');
    if (!articlePage) {
      return;
    }

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'toc-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'tocMobilePanel');
    fab.setAttribute('aria-label', 'Open page index');
    fab.innerHTML =
      '<span class="toc-fab__icon" aria-hidden="true">☰</span>' +
      '<span class="toc-fab__label">On this page</span>';

    var panel = document.createElement('div');
    panel.className = 'toc-panel';
    panel.id = 'tocMobilePanel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="toc-panel__backdrop" data-toc-close></div>' +
      '<div class="toc-panel__sheet" role="dialog" aria-modal="true" aria-labelledby="tocPanelTitle">' +
      '  <div class="toc-panel__header">' +
      '    <p id="tocPanelTitle" class="toc-panel__title">On this page</p>' +
      '    <button type="button" class="toc-panel__close" aria-label="Close table of contents" data-toc-close>&times;</button>' +
      '  </div>' +
      '  <nav class="toc-panel__nav" aria-label="Table of contents"></nav>' +
      '</div>';

    var panelNav = panel.querySelector('.toc-panel__nav');
    panelNav.appendChild(sourceList.cloneNode(true));

    articlePage.appendChild(fab);
    articlePage.appendChild(panel);

    var panelLinks = panel.querySelectorAll('.toc-panel__nav a[href^="#"]');
    var trackedSections = [];

    panelLinks.forEach(function (link) {
      var targetId = link.getAttribute('href').slice(1);
      var section = document.getElementById(targetId);
      if (section) {
        trackedSections.push({ link: link, section: section });
      }

      link.addEventListener('click', function () {
        closePanel();
      });
    });

    function setActiveLink(activeLink) {
      panelLinks.forEach(function (link) {
        link.classList.toggle('is-active', link === activeLink);
      });
    }

    function updateActiveSection() {
      if (!trackedSections.length) {
        return;
      }

      var viewportMiddle = window.innerHeight * 0.35;
      var current = trackedSections[0];

      trackedSections.forEach(function (item) {
        var rect = item.section.getBoundingClientRect();
        if (rect.top <= viewportMiddle) {
          current = item;
        }
      });

      setActiveLink(current.link);
    }

    if ('IntersectionObserver' in window && trackedSections.length) {
      var observer = new IntersectionObserver(
        function () {
          updateActiveSection();
        },
        {
          root: null,
          rootMargin: '-35% 0px -55% 0px',
          threshold: [0, 0.25, 0.5, 1]
        }
      );

      trackedSections.forEach(function (item) {
        observer.observe(item.section);
      });
    }

    function openPanel() {
      panel.classList.add('is-open');
      root.classList.add('toc-panel-open');
      fab.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      updateActiveSection();
    }

    function closePanel() {
      panel.classList.remove('is-open');
      root.classList.remove('toc-panel-open');
      fab.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }

    fab.addEventListener('click', function () {
      if (panel.classList.contains('is-open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    panel.querySelectorAll('[data-toc-close]').forEach(function (el) {
      el.addEventListener('click', closePanel);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        closePanel();
      }
    });

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();
  }

  function boot() {
    initViewToggle();
    initTocPager();
    initMobileToc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
