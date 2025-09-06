/* Loads header/footer partials into pages and highlights active nav */
export async function mountLayout(active) {
  const head = await fetch('/partials/header.html').then(r => r.text());
  const foot = await fetch('/partials/footer.html').then(r => r.text());
  const headerMount = document.getElementById('sra-header');
  const footerMount = document.getElementById('sra-footer');
  if (headerMount) headerMount.innerHTML = head;
  if (footerMount) footerMount.innerHTML = foot;

  // After injection, wire existing main.js to set links + toggles
  // Highlight active nav
  document.querySelectorAll(`[data-nav="${active}"]`).forEach(a => {
    a.classList.add('text-white', 'font-semibold');
  });
}
