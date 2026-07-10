import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(env.PORT, "0.0.0.0", () =>
      console.log(`Servidor en puerto ${env.PORT}`)
    );
  })
  .catch((err) => console.error("Error conectando MongoDB:", err));
