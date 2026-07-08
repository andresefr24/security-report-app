# app/ — composition root

El **único** sitio que conoce las piezas concretas y las conecta entre sí
(inyección de dependencias): qué adaptador real implementa cada puerto, y cómo se
enrutan las pantallas.

**Qué va dentro:**
- `router.tsx`: definición de rutas (React Router) → qué página se muestra en cada dirección.
- (Más adelante) el cableado de adaptadores reales con los casos de uso, para
  entregárselos a la UI.

**Por qué existe:** mantener el "cableado" en un solo lugar deja el resto de
capas limpias e independientes. Cambiar una implementación (ej. un repositorio)
se hace aquí, sin tocar dominio, aplicación ni UI.

Ver [tech-plan §3](../../docs/tech-plan-f1.md).
