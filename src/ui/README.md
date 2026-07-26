# ui/ — React (lo que ve el coordinador)

Componentes y pantallas. Todo el texto en **español llano** y accesible para
presbicia (tipografía grande, alto contraste, áreas táctiles ≥48px).

**Qué va dentro:**
- `pages/`: pantallas completas asociadas a una ruta (ej. `PerfilPage`).
- `components/`: piezas reutilizables (incluye los componentes de shadcn/ui en
  `components/`, según `components.json`).
- `hooks/`: hooks de React propios.
- `view-models/`: adaptación de datos del dominio a lo que la pantalla necesita.

**Regla de dependencias:** `ui` depende de `application` (invoca casos de uso),
que a su vez usa `domain`. La UI no habla directamente con la infraestructura.

Ver [design-system](../../docs/design-system.md) y [tech-plan §3](../../docs/tech-plan-f1.md).
