// assets/js/includes.js
(async function () {
  async function loadInto(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      el.innerHTML = "";
      console.warn("Include failed:", url, res.status);
      return;
    }
    el.innerHTML = await res.text();
  }

  // Load header/footer
  await loadInto("siteHeader", "includes/header.html");
  await loadInto("siteFooter", "includes/footer.html");

  // Highlight active nav
  const path = (location.pathname || "").toLowerCase();

  // With <base href="/analyzershub/">, our pages are under /analyzershub/
  // Examples:
  // /analyzershub/index.html
  // /analyzershub/analyzers.html
  // /analyzershub/learn/index.html
  // /analyzershub/analyzers/yokogawa/gc8000/gc8000.html

  let key = "home";
  if (path.includes("/analyzers.html")) key = "kb";
  else if (path.includes("/learn/")) key = "learn";
  else if (path.includes("/community/")) key = "community";
  else if (path.includes("/blog/")) key = "blog";
  else if (path.includes("/contact")) key = "contact";
  else if (path.includes("/disclaimer")) key = "disclaimer";
  else if (path.endsWith("/analyzershub/") || path.endsWith("/analyzershub/index.html")) key = "home";

  document.querySelectorAll('.site-nav a[data-nav]').forEach(a => {
    a.classList.toggle("active", a.getAttribute("data-nav") === key);
  });
})();
