# domain/ — el corazón de las reglas

Reglas de negocio **puras**, sin dependencias externas. Nada de aquí sabe que
existe React, localForage, OpenAI o un PDF.

**Qué va dentro:**
- Entidades y agregados: `coordinador/`, `promotor/`, `proyecto/`, `informe/`.
- Value objects y utilidades compartidas en `shared/` (ej. `Id`, `Email`, `Result`).
- **Puertos** en `ports/`: interfaces que el dominio *pide* (repositorios y
  servicios). La infraestructura los implementa; el dominio solo los declara.

**Regla de dependencias:** el dominio no importa de ninguna otra capa.
Todos apuntan hacia aquí. Ver [tech-plan §3](../../docs/tech-plan-f1.md).

> Las subcarpetas se crean cuando hay algo real que meter (M1 en adelante).
