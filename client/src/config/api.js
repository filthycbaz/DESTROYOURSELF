const configuredUrl = process.env.REACT_APP_API_URL;

if (!configuredUrl) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Falta configurar REACT_APP_API_URL. Define la URL de la API antes de " +
        "compilar el frontend (ver client/.env.example)."
    );
  }
  // eslint-disable-next-line no-console
  console.warn(
    "REACT_APP_API_URL no está definida — usando http://localhost:3001/api " +
      "(solo válido en desarrollo/test)."
  );
}

export const API_URL = configuredUrl || "http://localhost:3001/api";
