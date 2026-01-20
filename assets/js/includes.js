// assets/js/includes.js
(async function () {

  async function loadInto(id, url) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.warn("Include failed:", url, res.status);
        return;
      }
      el.innerHTML = await res.text();
    } catch (err) {
      console.warn("Include error:", url, err);
    }
  }

  // ===============================
  // LOAD HEADER & FOOTER
  // ===============================
  await loadInto("siteHeader", "includes/header.html");
  await loadInto("siteFooter", "includes/footer.html");

  // ===============================
  // ACTIVE NAV HIGHLIGHT
  // ===============================
  const path = (location.pathname || "").toLowerCase();

  let key = "home";
  if (path.includes("/analyzers.html")) key = "kb";
  else if (path.includes("/learn/")) key = "learn";
  else if (path.includes("/community/")) key = "community";
  else if (path.includes("/blog/")) key = "blog";
  else if (path.includes("/contact")) key = "contact";
  else if (path.includes("/disclaimer")) key = "disclaimer";
  else if (
    path.endsWith("/analyzershub/") ||
    path.endsWith("/analyzershub/index.html")
  ) key = "home";

  document.querySelectorAll(".site-nav a[data-nav]").forEach(a => {
    a.classList.toggle("active", a.getAttribute("data-nav") === key);
  });

  // ===============================
  // TAWK.TO CHAT (GLOBAL LOAD)
  // ===============================
  if (!window.Tawk_API) {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/696fcb3342ecbe197dd05907/1jfeb3gfu";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    document.head.appendChild(s1);
  }

})();
