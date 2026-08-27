import React from "react";
import { logEvent } from "../services/logService";

// Red de seguridad genérica: cualquier error de render que escape al try/catch
// de un useEffect (ej. un crash inesperado, no solo un fetch fallido) cae acá
// en vez de dejar la pantalla en blanco. El fallback es específico por sección
// (se pasa como prop), el logging es siempre el mismo formato estructurado y
// se manda al backend con logEvent (además de la consola, para debug local).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const payload = logEvent("client.error_boundary", {
      section: this.props.section,
      message: error.message,
      componentStack: info.componentStack,
    });
    console.error(JSON.stringify(payload));
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
