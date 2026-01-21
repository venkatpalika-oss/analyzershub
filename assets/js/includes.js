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

  /* =====================================================
     GLOBAL SVG CLICK-TO-ZOOM (AUTO APPLY)
     - Does NOT affect pages without SVGs
     - Applies to all <svg> inside .card
     - Fully additive, safe
  ===================================================== */
  function ensureSvgModal() {
    if (document.getElementById("svgModal")) return;

    const modal = document.createElement("div");
    modal.id = "svgModal";
    modal.className = "svg-modal";
    modal.innerHTML = `
      <div class="svg-modal-close">✕</div>
      <div class="svg-modal-content" id="svgModalContent"></div>
    `;
    modal.addEventListener("click", closeSvgModal);
    document.body.appendChild(modal);

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeSvgModal();
    });
  }

  function openSvgModal(svg) {
    ensureSvgModal();
    const modal = document.getElementById("svgModal");
    const content = document.getElementById("svgModalContent");
    content.innerHTML = "";
    content.appendChild(svg.cloneNode(true));
    modal.classList.add("active");
  }

  function closeSvgModal() {
    const modal = document.getElementById("svgModal");
    if (modal) modal.classList.remove("active");
  }

  function autoWrapSvgs() {
    document.querySelectorAll(".card svg").forEach(svg => {
      if (svg.closest(".svg-zoom-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "svg-zoom-wrap";
      wrap.style.cursor = "zoom-in";

      svg.parentNode.insertBefore(wrap, svg);
      wrap.appendChild(svg);

      wrap.addEventListener("click", e => {
        e.stopPropagation();
        openSvgModal(svg);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", autoWrapSvgs);

})();
