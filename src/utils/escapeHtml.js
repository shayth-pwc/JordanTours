const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };

module.exports = function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => entities[character]);
};
