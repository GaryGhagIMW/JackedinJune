/** Refresh Excel embed after new submissions */
document.addEventListener('jij:submitted', refreshExcelEmbed);

document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('excel-embed');
  const url = window.EXCEL_EMBED_URL || (typeof EXCEL_EMBED_URL !== 'undefined' ? EXCEL_EMBED_URL : '');
  if (iframe && url && !iframe.src) {
    iframe.src = url;
  }
});

function refreshExcelEmbed() {
  const iframe = document.getElementById('excel-embed');
  if (!iframe?.src) return;
  iframe.src = iframe.src;
}
