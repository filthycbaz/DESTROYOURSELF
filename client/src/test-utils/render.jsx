import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";

// Renders a component wrapped with the same provider tree App.jsx uses
// (AuthProvider > AppProvider > Router), so hooks like useAuth/useApp/
// useNavigate work exactly as they do in the real app.
//
// Auth state is derived from localStorage on mount (same as AuthProvider
// does in production) — set authToken/userData before calling this helper
// to render as a logged-in user.
//
// Pass `path` (a route pattern like "/product/:id") when the component
// reads route params via useParams(); it defaults to `route` for pages
// that don't need param matching.
export function renderWithProviders(ui, { route = "/", path } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path={path || route} element={ui} />
            {/* Swallows in-app navigation to routes this helper doesn't
                render, so tests that trigger a redirect (e.g. after
                login) don't spam "No routes matched" console warnings. */}
            <Route path="*" element={null} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

export function loginAsMockUser(user) {
  localStorage.setItem("authToken", "fake-jwt-token");
  localStorage.setItem("userData", JSON.stringify(user));
}
