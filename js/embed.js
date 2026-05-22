/** Load Excel Online embed for live charts from OneDrive */
document.addEventListener('DOMContentLoaded', initExcelEmbed);
document.addEventListener('jij:submitted', refreshExcelEmbed);

function initExcelEmbed() {
  if (!EXCEL_EMBED_URL) return;

  const iframe = document.getElementById('excel-embed');
  const placeholder = document.getElementById('embed-placeholder');
  if (!iframe) return;

  iframe.src = EXCEL_EMBED_URL;
  iframe.classList.remove('hidden');
  placeholder?.classList.add('hidden');
}

function refreshExcelEmbed() {
  const iframe = document.getElementById('excel-embed');
  if (!iframe?.src) return;
  /* Reload embed so new submissions appear in pivot charts */
  iframe.src = iframe.src;
}
