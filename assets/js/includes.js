(async function () {
  async function load(id, file) {
    const el = document.getElementById(id);
    if (!el) return;
    const res = await fetch(file);
    el.innerHTML = await res.text();
  }

  await load("siteHeader", "includes/header.html");
  await load("siteFooter", "includes/footer.html");

  // Auto-active menu highlight
  const page = document.body.getAttribute("data-page");
  if (!page) return;

  const link = document.querySelector(`[data-nav="${page}"]`);
  if (link) link.classList.add("active");
})();
