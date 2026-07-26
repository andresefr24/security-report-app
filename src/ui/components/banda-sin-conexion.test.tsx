import { describe, it, expect, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { BandaSinConexion } from "@/ui/components/banda-sin-conexion";

function ponerConexion(enLinea: boolean) {
  act(() => {
    Object.defineProperty(navigator, "onLine", { value: enLinea, configurable: true });
    window.dispatchEvent(new Event(enLinea ? "online" : "offline"));
  });
}

describe("BandaSinConexion", () => {
  afterEach(() => {
    // Dejamos "con conexión" para no afectar a otros tests.
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });

  it("no muestra nada cuando hay conexión", () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    render(<BandaSinConexion />);

    expect(screen.queryByText(/Sin conexión/i)).not.toBeInTheDocument();
  });

  it("muestra el aviso cuando se pierde la red y lo quita al recuperarla", () => {
    render(<BandaSinConexion />);

    ponerConexion(false);
    expect(screen.getByText(/Sin conexión — se guarda en el dispositivo/i)).toBeInTheDocument();

    ponerConexion(true);
    expect(screen.queryByText(/Sin conexión/i)).not.toBeInTheDocument();
  });
});
