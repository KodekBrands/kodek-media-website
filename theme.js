(function () {
  function applyTheme(theme) {
    var link = document.getElementById('theme-light');
    if (!link) return;
    if (theme === 'dark') {
      link.disabled = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      link.disabled = false;
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function currentTheme() {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  }

  function bindToggles() {
    var buttons = document.querySelectorAll('.theme-toggle');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
      });
    });
  }

  applyTheme(currentTheme());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggles);
  } else {
    bindToggles();
  }
})();
