// Caché en memoria, por pestaña, para requests GET que no cambian seguido
// (catálogo de productos, categorías). Cachea la promesa (no solo el dato
// resuelto) para que llamadas concurrentes a la misma URL compartan un solo
// request en vez de disparar una por cada una.
//
// Deliberadamente no es una librería como TanStack Query: este proyecto
// tiene 2 endpoints que se benefician de esto (productos, categorías), sin
// necesidad de invalidación en background, paginación con cursores, ni
// mutaciones optimistas — agregar una dependencia nueva para esto sería
// más código y más superficie que el problema real. Ver docs/testing.md /
// el diagnóstico de performance para el detalle de esta decisión.
const store = new Map();

export function fetchJsonCached(url, { ttlMs = 60_000 } = {}) {
  const cached = store.get(url);
  const now = Date.now();

  if (cached && now - cached.time < ttlMs) {
    return cached.promise;
  }

  const promise = fetch(url).then((res) => res.json());

  // Si el fetch falla, no dejamos el rechazo cacheado — el próximo intento
  // debe volver a pegarle a la red, no repetir el mismo error de memoria.
  promise.catch(() => store.delete(url));

  store.set(url, { promise, time: now });
  return promise;
}

export function clearApiCache() {
  store.clear();
}
