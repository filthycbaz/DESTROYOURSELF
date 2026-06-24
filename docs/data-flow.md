# Flujo de datos y persistencia

## Fuentes de verdad

| Dato | Almacenamiento | Archivo clave |
|------|---------------|---------------|
| Token JWT | `localStorage.authToken` | `authService.js` |
| Datos del usuario autenticado | `localStorage.userData` | `authService.js` |
| Carrito (sesión autenticada) | MongoDB — colección `carts` | `AppContext.jsx` + `cartController.js` |
| Carrito (sesión anónima) | `localStorage.cartData` | `AppContext.jsx` |
| Productos | MongoDB — colección `products` | `productController.js` |
| Órdenes | MongoDB — colección `orders` | `orderController.js` |

## Flujo del carrito

```
Usuario anónimo:
  addToCart → localStorage.cartData

Usuario hace login:
  AppContext detecta auth = true
  → Lee localStorage.cartData
  → POST /api/cart por cada item (merge con carrito del backend)
  → Borra localStorage.cartData
  → Carga carrito desde GET /api/cart

Usuario autenticado:
  addToCart  → POST /api/cart    → setCart(response.items)
  updateQty  → PUT  /api/cart/:itemId → setCart(response.items)
  removeItem → DELETE /api/cart/:itemId → setCart(response.items)
  clearCart  → DELETE /api/cart  → setCart([])

Usuario hace logout:
  AppContext detecta auth = false
  → setCart([]) — el carrito de DB sigue guardado para el próximo login
```

## Flujo de checkout

```
CheckoutPage (requiere auth) →
  POST /api/orders {items, shippingAddress, paymentMethod}
  El servidor:
    1. Verifica que cada producto exista y esté disponible
    2. Verifica stock suficiente
    3. Calcula el total (no confía en el total del cliente)
    4. Decrementa stock
    5. Crea la orden
  →
  clearCart() → DELETE /api/cart
  →
  navigate("/confirmation", { state: { order, customerName } })

ConfirmationPage →
  Lee location.state.order (pasado por navigate)
  NO lee localStorage
```

## Flujo de confirmación / historial

```
Después de la compra:
  /confirmation — muestra la orden recién creada (desde location.state)
  /orders       — lista todas las órdenes del usuario (GET /api/orders/me)
  /orders/:id   — detalle de una orden específica (GET /api/orders/:id)
```

## Claves de localStorage en uso

| Clave | Contenido | Cuándo se escribe | Cuándo se lee | Cuándo se borra |
|-------|-----------|-------------------|---------------|-----------------|
| `authToken` | JWT string | login / register | cada request autenticado | logout |
| `userData` | objeto User (sin password) | login / register | AuthContext.useEffect | logout |
| `cartData` | array de items | AppContext (solo sin auth) | AppContext init + sync en login | al hacer login |

`lastOrder` fue eliminado. Ya no se usa localStorage como canal entre CheckoutPage y ConfirmationPage.

## Gaps abiertos

- El token JWT en localStorage es vulnerable a XSS. Migrar a httpOnly cookies es la mejora de seguridad más importante pendiente.
- No existe integración con pasarela de pago. El `paymentMethod` se registra en la orden como intención; el cobro real se coordina manualmente.
- No existe decremento de stock atómico con rollback si la creación de la orden falla después del decremento. Si `Order.create` falla, el stock queda decrementado. Requiere transacción MongoDB.
