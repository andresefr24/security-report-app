# infrastructure/ — adaptadores

Implementaciones concretas de los **puertos** del dominio. Aquí vive toda la
"volatilidad": persistencia, IA, PDF, compartir.

**Qué va dentro:**
- `persistence/localforage/`: repositorios sobre IndexedDB (localForage).
- `ai/openai/`: adaptadores de transcripción y composición (incremento 1.2).
- `pdf/`: adaptador de generación de PDF (pdfmake).
- `sharing/`: adaptador de Web Share API con descarga como alternativa.

**Regla de dependencias:** la infraestructura *implementa* interfaces de
`domain`. Si mañana cambiamos localForage por una API en la nube, solo cambia el
adaptador; el dominio y los casos de uso no se tocan.

Ver [tech-plan §5](../../docs/tech-plan-f1.md).
