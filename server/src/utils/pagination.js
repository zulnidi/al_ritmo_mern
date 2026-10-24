/** Calcula metadatos de paginación a partir de total, página y límite. */
function buildPageMeta({ total, page, limit }) {
  return { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Escapa caracteres especiales de RegExp para búsquedas literales. */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { buildPageMeta, escapeRegex };
