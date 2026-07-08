import { http, HttpResponse } from "msw";
import { API_URL } from "../../config/api";

// Fixtures used by the default (happy-path) handlers. Individual tests
// override these with server.use(...) for loading/error/edge-case states.
export const mockCategories = [
  { _id: "cat-tops", name: "Tops", slug: "tops", isActive: true },
  { _id: "cat-bottoms", name: "Bottoms", slug: "bottoms", isActive: true },
];

export const mockProduct = {
  _id: "prod-1",
  name: "Playera destruida",
  category: "tops",
  price: 350,
  image: "https://example.com/playera.jpg",
  description: "Playera vintage",
  sizes: ["S", "M", "L"],
  condition: "Bueno",
  brand: "Marca X",
  stock: 5,
  isAvailable: true,
};

export const mockProduct2 = {
  _id: "prod-2",
  name: "Pantalón cargo",
  category: "bottoms",
  price: 500,
  image: "https://example.com/cargo.jpg",
  description: "Pantalón cargo negro",
  sizes: ["28", "30", "32"],
  condition: "Excelente",
  brand: "Marca Y",
  stock: 3,
  isAvailable: true,
};

export const mockProducts = [mockProduct, mockProduct2];

export const mockUser = {
  _id: "user-1",
  name: "Usuario Prueba",
  email: "usuario@example.com",
  role: "user",
  isActive: true,
};

export const mockOrder = {
  _id: "order-abc12345",
  items: [
    { _id: "item-1", name: mockProduct.name, image: mockProduct.image, price: 350, size: "M", quantity: 2 },
  ],
  total: 700,
  status: "pending",
  paymentMethod: "tarjeta",
  shippingAddress: { street: "Av. Reforma 1", city: "CDMX", state: "CDMX", zip: "01000" },
  createdAt: "2026-07-01T12:00:00.000Z",
};

export const handlers = [
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json({
      products: mockProducts,
      pagination: { total: mockProducts.length, page: 1, limit: 10, totalPages: 1 },
    });
  }),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p._id === params.id);
    if (!product) {
      return HttpResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  http.get(`${API_URL}/categories`, () => {
    return HttpResponse.json(mockCategories);
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === mockUser.email && body.password === "Test1234!") {
      return HttpResponse.json({ token: "fake-jwt-token", user: mockUser });
    }
    return HttpResponse.json({ message: "Email o contraseña incorrectos" }, { status: 401 });
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { token: "fake-jwt-token", user: { ...mockUser, name: body.name, email: body.email } },
      { status: 201 }
    );
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.get(`${API_URL}/cart`, () => {
    return HttpResponse.json({ items: [] });
  }),

  http.post(`${API_URL}/cart`, () => {
    return HttpResponse.json({ items: [] });
  }),

  http.put(`${API_URL}/cart/:itemId`, () => {
    return HttpResponse.json({ items: [] });
  }),

  http.delete(`${API_URL}/cart/:itemId`, () => {
    return HttpResponse.json({ items: [] });
  }),

  http.delete(`${API_URL}/cart`, () => {
    return HttpResponse.json({ items: [] });
  }),

  http.post(`${API_URL}/orders`, async ({ request }) => {
    const body = await request.json();
    const total = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return HttpResponse.json(
      { _id: "order-1", items: body.items, total, status: "pending" },
      { status: 201 }
    );
  }),

  http.get(`${API_URL}/orders/me`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_URL}/orders/:id`, ({ params }) => {
    if (params.id !== mockOrder._id) {
      return HttpResponse.json({ message: "Orden no encontrada" }, { status: 404 });
    }
    return HttpResponse.json(mockOrder);
  }),
];
