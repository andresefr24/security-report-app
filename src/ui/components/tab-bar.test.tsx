import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LayoutConNav } from "@/ui/components/layout-con-nav";
import { FUTURE_COMPONENTE } from "@/app/opciones-router";

// Monta el layout con navegación en una ruta concreta y devuelve lo pintado.
function montarEn(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]} future={FUTURE_COMPONENTE}>
      <Routes>
        <Route element={<LayoutConNav />}>
          <Route path="/obras" element={<p>pantalla de obras</p>} />
          <Route path="/promotores" element={<p>pantalla de promotores</p>} />
        </Route>
        {/* Un flujo profundo, fuera del layout: no debe llevar barra. */}
        <Route path="/obras/nueva" element={<p>alta de obra</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TabBar / LayoutConNav", () => {
  it("muestra las tres secciones en una pantalla de sección", () => {
    montarEn("/obras");
    const nav = screen.getByRole("navigation", { name: /navegación principal/i });
    for (const etiqueta of ["Obras", "Promotores", "Perfil"]) {
      expect(nav).toHaveTextContent(etiqueta);
    }
  });

  it("ya no ofrece el atajo '+ Nuevo': las obras se crean desde Obras", () => {
    montarEn("/obras");
    const nav = screen.getByRole("navigation", { name: /navegación principal/i });

    expect(nav).not.toHaveTextContent("Nuevo");
  });

  it("cada sección enlaza a su ruta (incluida la salida a Obras)", () => {
    montarEn("/promotores");
    expect(screen.getByRole("link", { name: /Obras/i })).toHaveAttribute("href", "/obras");
    expect(screen.getByRole("link", { name: /Promotores/i })).toHaveAttribute(
      "href",
      "/promotores",
    );
    expect(screen.getByRole("link", { name: /Perfil/i })).toHaveAttribute("href", "/perfil");
  });

  it("no pinta la barra en un flujo profundo (fuera del layout)", () => {
    montarEn("/obras/nueva");
    expect(screen.queryByRole("navigation", { name: /navegación principal/i })).toBeNull();
  });
});
