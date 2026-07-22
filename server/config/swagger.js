import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const renderUrl = process.env.RENDER_EXTERNAL_URL || "https://<web-service>.onrender.com";

const definition = {
  openapi: "3.0.3",
  info: {
    title: "DestroyYourself API",
    version: "1.0.0",
    description:
      "API REST del bazar de ropa urbana de segunda mano DestroyYourself. " +
      "Auth JWT (Bearer), catálogo de productos, carrito y órdenes.",
  },
  servers: [
    { url: `http://localhost:${env.PORT}/api`, description: "Local" },
    { url: `${renderUrl}/api`, description: "Render (producción)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  definition,
  apis: ["./routes/*.js", "./models/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
