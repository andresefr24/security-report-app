# application/ — casos de uso

Orquesta el dominio para cumplir **una acción** del usuario. Un caso de uso por
archivo (ej. `ConfigurarPerfil`, `CrearProyecto`), correspondiente a un comando
del event storm.

**Qué va dentro:**
- `use-cases/`: cada caso de uso recibe los **puertos** que necesita (por
  parámetro/constructor) y ejecuta la lógica llamando al dominio.

**Regla de dependencias:** `application` depende de `domain`, nunca al revés, y
no conoce a la infraestructura concreta (recibe puertos, no adaptadores). Por eso
se testea con **fakes en memoria** de los puertos.

Ver [tech-plan §6](../../docs/tech-plan-f1.md).
