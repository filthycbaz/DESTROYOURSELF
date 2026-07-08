# Definition of Done — Frontend

Checklist que el `frontend-builder` debe completar antes de considerar un feature o bugfix listo.

---

## Funcionalidad

- [ ] Todos los CAs del spec están verificados manualmente en el navegador
- [ ] El flujo happy path funciona end-to-end (sin errores en consola)
- [ ] Los estados de carga (loading) están manejados y son visibles al usuario
- [ ] Los estados de error están manejados y muestran un mensaje útil (no un stack trace)
- [ ] El flujo sin autenticación redirige correctamente si la ruta es protegida

## Correctitud técnica

- [ ] No hay `http://localhost:3001` hardcodeado — todo usa `API_URL` de `config/api.js`
- [ ] Los IDs de items del carrito usan `item._id ?? item.id` (no solo `item.id`)
- [ ] Los datos entre páginas se pasan con `navigate()` + `state`, no con `localStorage`
- [ ] No hay `console.log` de debug que no se quitaron
- [ ] No hay variables declaradas pero no usadas

## Autenticación y autorización

- [ ] Las rutas privadas usan `<PrivateRoute>` en `App.jsx`
- [ ] Los requests autenticados usan `getAuthHeader()` de `authService.js`
- [ ] El logout limpia todo el estado de sesión

## Convenciones

- [ ] Componentes en PascalCase, funciones y variables en camelCase
- [ ] Archivos de componentes en `client/src/components/` o `client/src/pages/` según corresponda
- [ ] Estilos en el archivo CSS correspondiente o inline, no en un archivo nuevo sin justificación
- [ ] Los imports de `lucide-react` usan destructuring: `import { Icon } from "lucide-react"`

## Testing

- [ ] Al menos un test de renderizado para componentes nuevos
- [ ] Tests de interacción para flujos críticos (agregar al carrito, checkout, login)
- [ ] `npm test -- --watchAll=false` pasa sin errores

## Calidad

- [ ] `npm run build` pasa sin errores
- [ ] La pantalla se ve correctamente en viewport de 375px (móvil) y 1280px (desktop)
- [ ] El feature no rompe ninguna página que ya funcionaba (smoke test manual de rutas principales)
