(function () {
  async function inject(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      el.innerHTML = "<!-- include failed: " + url + " -->";
      return;
    }
    el.innerHTML = await res.text();
  }

  function setActiveNav() {
    // Set <body data-page="home|kb|learn|community|blog|contact|disclaimer">
    const key = (document.body.dataset.page || "").trim();
    if (!key) return;

    const link = document.querySelector(`[data-nav="${key}"]`);
    if (link) link.classList.add("active");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    // These resolve correctly with your <base href="/analyzershub/">
    await inject("#siteHeader", "includes/header.html");
    await inject("#siteFooter", "includes/footer.html");
    setActiveNav();
  });
})();
