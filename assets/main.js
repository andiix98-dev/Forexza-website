(function () {
  var CFG = window.SITE_CONFIG || {};
  var ES = window.I18N_ES || {};
  var EN = {}; // captured from the page on load

  function store(k, v) { try { v === undefined ? 0 : localStorage.setItem(k, v); return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- Language toggle ---------- */
  function captureEnglish() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) { if (!(el.dataset.i18n in EN)) EN[el.dataset.i18n] = el.textContent; });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { EN[el.dataset.i18nHtml] = el.innerHTML; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { EN["ph:" + el.dataset.i18nPh] = el.placeholder; });
  }
  function msg(key, fallback) { return currentLang === "es" && ES[key] ? ES[key] : fallback; }
  var currentLang = "en";
  function setLang(lang) {
    currentLang = lang;
    var dict = lang === "es" ? ES : EN;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { var v = dict[el.dataset.i18n]; if (v != null) el.textContent = v; });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { var v = dict[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var v = lang === "es" ? ES[el.dataset.i18nPh] : EN["ph:" + el.dataset.i18nPh];
      if (v != null) el.placeholder = v;
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (b) { b.classList.toggle("on", b.dataset.lang === lang); });
    store("forexza-lang", lang);
  }

  /* ---------- Contact details from config ---------- */
  function fillConfig() {
    var pending = currentLang === "es" ? "Próximamente" : "Coming soon";
    document.querySelectorAll("[data-config]").forEach(function (el) {
      var key = el.dataset.config, val = (CFG[key] || "").trim();
      if (!val) { el.textContent = pending; el.removeAttribute("href"); return; }
      el.textContent = val;
      if (key === "email") el.href = "mailto:" + val;
      if (key === "phone") el.href = "tel:" + val.replace(/[^\d+]/g, "");
    });
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("form-status");
    var btn = form.querySelector("button[type=submit]");
    function show(type, text) { status.className = "form-status " + type; status.textContent = text; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        show("err", msg("ct.err", "Please fill in all required fields."));
        return;
      }
      if (form.botcheck && form.botcheck.checked) return;
      var d = Object.fromEntries(new FormData(form).entries());
      delete d.botcheck;

      if (CFG.web3formsKey) {
        var label = btn.innerHTML;
        btn.disabled = true; btn.textContent = msg("ct.sending", "Sending…");
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.assign({
            access_key: CFG.web3formsKey,
            subject: "New quote request: " + d.company + " (" + d.sector + ")",
            from_name: "Forexza website"
          }, d))
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res.success) { form.reset(); show("ok", msg("ct.ok", "Thank you! We’ve received your request and will be in touch shortly.")); }
            else throw new Error(res.message);
          })
          .catch(function () { show("err", msg("ct.fail", "Something went wrong. Please email us directly.")); })
          .finally(function () { btn.disabled = false; btn.innerHTML = label; });
        return;
      }

      // Fallback: open the visitor's email app, pre-filled
      var body = "Contact name: " + d.name + "\nCompany: " + d.company + "\nSector: " + d.sector +
        "\nEmail: " + d.email + "\nPhone: " + d.phone + "\n\n" + (d.message || "");
      window.location.href = "mailto:" + (CFG.email || "") + "?subject=" +
        encodeURIComponent("Quote request: " + d.company) + "&body=" + encodeURIComponent(body);
      show("ok", msg("ct.mailto", "Your email app has opened so you can send the request."));
    });
  }

  /* ---------- Nav, scroll effects ---------- */
  function initNav() {
    var btn = document.getElementById("menu-btn"), links = document.getElementById("nav-links");
    if (btn) btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    var header = document.querySelector(".site-header");
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  captureEnglish();
  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); fillConfig(); });
  });
  var saved = store("forexza-lang");
  var initial = saved || ((navigator.language || "").toLowerCase().indexOf("es") === 0 ? "es" : "en");
  setLang(initial);
  fillConfig();
  initNav();
  initForm();
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
