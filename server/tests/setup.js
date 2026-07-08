import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod;

// Arranca MongoDB en memoria antes de todos los tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  process.env.JWT_SECRET = "test-secret-key-destroyourself";
  process.env.NODE_ENV = "test";
});

// Limpia todas las colecciones entre suites
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Cierra conexión al finalizar
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
