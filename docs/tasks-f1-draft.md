---
title: Tareas F1 (M0–M9)
type: rolling
updated: 2026-06-20
validated: true
tags: [tasks, plan]
---

# Tareas F1 — M0 a M9

Esta es tu hoja de ruta de la Fase 1, Josune. Cada hito es un trozo de trabajo que puedes terminar y dar por hecho antes de pasar al siguiente. Léelo sin agobio: no hace falta entenderlo todo de una; cuando vayas a por un hito, lees **solo su sección** y trabajas con tu Claude paso a paso (ver [[onboarding-josune#configura-tu-claude]]).

**Cómo leer el estado de cada hito:**
- 🟢 **Definitiva** — depende de decisiones de arquitectura ya cerradas. No va a cambiar por lo que digan los stakeholders. Puedes construirla con confianza.
- 🟡 **Estructura definitiva, detalle provisional** — la forma de la tarea está clara, pero algunos campos/textos concretos dependen del informe real ([[stakeholder-questions#q2-campos-informe]]) o de la revisión de prototipos ([[decisions#d8-prototype-review-gate]]). Construye la estructura; deja flexible lo que se marca como provisional.

**Orden:** termina **todo el incremento 1.1 (M0–M5)** antes de empezar el 1.2 (M6–M9) — [[decisions#d6-f1-increments]]. Base técnica completa: [[tech-plan-f1]]. Diseño: [[design-system]].

> **Recordatorio de vocabulario:** en pantalla decimos "obra", pero en el código la entidad se llama `Proyecto`. En pantalla "informe" = entidad `Informe`. El operador único es el coordinador.

---

# Incremento 1.1 — el esqueleto (sin IA)

La meta del 1.1 es que un coordinador pueda hacer **todo el recorrido a mano**: configurar su perfil → dar de alta un promotor y una obra → crear un informe con fotos y firmas → generar el PDF → compartirlo. Sin voz, sin IA. Cuando esto funcione de punta a punta, ya tenemos algo útil de verdad.

## M0 · Montar el esqueleto del proyecto 🟢 Definitiva

**Por qué.** Antes de construir nada, necesitamos el "andamio": el proyecto creado, las herramientas configuradas y las carpetas que reflejan nuestra arquitectura. Hacerlo bien aquí hace que todo lo demás sea ordenado.

**Qué construyes.**
- Proyecto **Vite + React + TypeScript**.
- **PWA** con `vite-plugin-pwa` (esto nos da el service worker y el manifiesto para que sea instalable).
- **shadcn/ui + Tailwind**, con los tokens de color, la tipografía (IBM Plex Sans/Serif) y el `globals.css` que ya están definidos en [[design-system]]. Cópialos tal cual.
- **React Router** para navegar entre pantallas.
- La **estructura de carpetas hexagonal** ([[tech-plan-f1#3-arquitectura-por-capas]]):
  ```
  src/
    domain/        (reglas puras: entidades, value objects, y los "puertos")
    application/   (casos de uso: una acción por archivo)
    infrastructure/(adaptadores: localForage, OpenAI, PDF, compartir)
    ui/            (componentes y pantallas React)
    app/           (composition root: el sitio que conecta todo)
  ```
- **Vitest** configurado con un test de ejemplo que pase.

**Cómo guiarte con tu Claude.** Pídele, en este orden: (1) "crea un proyecto Vite con React + TS y deja el `npm run dev` funcionando"; (2) "añade vite-plugin-pwa con una configuración mínima"; (3) "instala y configura shadcn/ui y pega estos tokens" (le pegas el bloque `globals.css` de [[design-system]]); (4) "crea las carpetas `domain/ application/ infrastructure/ ui/ app/` con un README corto en cada una explicando qué va dentro"; (5) "configura Vitest con un test de ejemplo". Ve confirmando cada paso antes del siguiente.

**Hecho cuando.** `npm run dev` levanta la app, ves una pantalla con los estilos de marca aplicados, `npm test` pasa, y la estructura de carpetas está creada.

**Trampas.** Aún no metas lógica de negocio. Este hito es solo el esqueleto vacío y limpio.

---

## M1 · Perfil del coordinador 🟢 Definitiva

**Por qué.** El coordinador, la primera vez que abre la app, rellena sus datos **una sola vez** (no hay login ni cuenta: todo es local). Esos datos —sobre todo su número de registro y su firma— aparecen luego en cada informe como prueba legal. Este hito es además tu **primer recorrido completo** de la arquitectura: pantalla → caso de uso → puerto → guardado. Si entiendes este, el resto es repetir el patrón.

**Qué construyes.**
- **Entidad `Coordinador`** en `domain/`: nombre, número de registro IRSST (el de la Comunidad de Madrid, no el de colegiado), correo, y su firma. Con sus reglas básicas (p. ej. el registro no puede ir vacío).
- **Puerto `CoordinadorRepository`** (una interfaz en `domain/`): métodos `guardar(coordinador)` y `obtener()`.
- **Adaptador** en `infrastructure/persistence/localforage/`: implementa ese puerto guardando en el dispositivo con **localForage**.
- **Caso de uso** `ConfigurarPerfil` en `application/`.
- **Pantalla de perfil** en `ui/`: formulario (con `react-hook-form` + `zod`) y un **campo de firma** con el dedo (librería `signature_pad` sobre un `<canvas>`), con opción de borrar y rehacer.
- Llamar a `navigator.storage.persist()` al iniciar la app (para que iOS no borre los datos — ver [[gotchas#g3-ios-7-day-eviction]]).

**Cómo guiarte con tu Claude.** "Vamos a hacer el M1 paso a paso siguiendo la arquitectura hexagonal de docs/tech-plan-f1.md. Empieza por la entidad `Coordinador` en domain/ con sus tests. Luego el puerto `CoordinadorRepository`. Luego el adaptador con localForage y su test. Luego el caso de uso. Y al final la pantalla con el campo de firma. Explícame cada pieza antes de escribirla y no avances hasta que yo confirme." Cuando llegues a la firma, pídele que use `signature_pad` y que exporte la firma a una imagen (dataURL) para poder meterla luego en el PDF.

**Hecho cuando.** Puedo abrir la app por primera vez, rellenar mi perfil con mi firma, cerrar la app, reabrirla y mis datos siguen ahí. Hay tests del dominio y del repositorio en verde.

**Trampas.** El patrón "entidad → puerto → adaptador → caso de uso → pantalla" es el que repetirás en casi todos los hitos. Tómate tu tiempo en entenderlo aquí.

---

## M2 · Promotores y obras 🟡 Estructura definitiva, campos provisionales

**Por qué.** Antes de poder hacer informes, el coordinador necesita registrar **a quién pertenece la obra (el promotor)** y **la obra en sí**. Un promotor puede tener muchas obras, por eso el promotor se da de alta primero y la obra lo referencia.

**Qué construyes.**
- **Entidad `Promotor`** (nombre/razón social, datos fiscales, contactos) con su repositorio + adaptador localForage + casos de uso (alta, editar) + pantallas de alta y listado.
- **Entidad `Proyecto`** (la obra) con su repositorio, casos de uso y pantallas. En el **alta de obra**: se **selecciona un promotor ya existente** (no se teclea de nuevo), se rellenan los datos de la obra, la frecuencia de visita (diaria/semanal), y la **lista de distribución** (cada destinatario con su correo y su rol: promotor, dirección facultativa, técnico PRL, contratista, subcontrata).
- **Listados** (read models) de promotores y de obras, siguiendo las pantallas de [[design-system]] (tarjetas grandes, legibles).

**🟡 Provisional:** el **conjunto exacto de campos** del promotor y del alta de obra no está confirmado (depende de la plantilla real y de SIAC — [[stakeholder-questions#q3-alta-obra]]). Construye los formularios de forma que **añadir o quitar un campo sea fácil**; no los hardcodees de forma rígida.

**Cómo guiarte con tu Claude.** Reutiliza el patrón del M1: "Haz el M2 igual que hicimos el M1: primero `Promotor` (entidad, puerto, adaptador, casos de uso, pantallas), luego `Proyecto`. En el alta de obra, el promotor se selecciona de los ya registrados y se guarda por su id, no copiando sus datos. Deja los campos del formulario en una estructura fácil de modificar porque aún no están confirmados."

**Hecho cuando.** Puedo crear un promotor, crear una obra suya (eligiendo ese promotor) con su lista de distribución, y ver ambos en sus listados. Todo persiste.

**Trampas.** La obra guarda el **id** del promotor, no una copia de sus datos. Si el promotor cambia de correo, no quieres tener copias desactualizadas por todos lados.

---

## M3 · El informe — asistente de 5 pasos 🟡 Estructura definitiva, campos provisionales

**Por qué.** Este es el corazón de la app: crear el informe de una visita. El diseño ya decidió que sea un **asistente por pasos (wizard)**: una cosa por pantalla, con botones grandes de avanzar/atrás y una barra de progreso. Así no abrumamos a un usuario mayor con un formulario gigante.

**Qué construyes.**
- **Entidad `Informe`** con sus piezas: fotos, firmas, incumplimientos. Vive colgando de una obra (`proyectoId`).
- **El wizard de 5 pasos**, cada uno como **módulo independiente**:
  1. **Datos de la visita** — fecha/hora (automática), quién atiende la visita.
  2. **Fotos** — desde la cámara, **reducidas al capturar** (librería `browser-image-compression`); rejilla con opción de borrar.
  3. **Contenido** — texto de la visita (en el 1.1 se escribe a mano; en el 1.2 lo rellenará la voz+IA, pero el hueco es el mismo).
  4. **Incumplimientos** — por subcontrata afectada; si hay uno, esa subcontrata pasará a tener que firmar.
  5. **Firmas** — del coordinador (siempre), de quien atiende la visita, y de la subcontrata si hubo incumplimiento. Con `signature_pad`.
- **Autoguardado por paso** + la banda "Sin conexión — se guarda en el dispositivo" cuando no hay red.

**🟡 Provisional:** los **campos exactos dentro de cada paso** dependen del informe real ([[stakeholder-questions#q2-campos-informe]]). Por eso **cada paso debe ser un módulo independiente**: cuando llegue la plantilla real, añadir/reordenar campos no debe romper el resto.

**Cómo guiarte con tu Claude.** "Vamos a montar el editor de informe como un wizard de 5 pasos, siguiendo docs/design-system.md y los prototipos. Primero la entidad `Informe` y su repositorio. Luego un contenedor de wizard reutilizable con barra de progreso y autoguardado por paso. Después construimos los 5 pasos uno a uno como módulos separados. Empezamos por el paso 1." Pídele que cada paso guarde su parte en cuanto la completas, para no perder trabajo.

**Hecho cuando.** Puedo crear un informe completo de una obra, recorrer los 5 pasos, y queda guardado como borrador. Si cierro a media, al volver sigue donde lo dejé.

**Trampas.** El paso "Contenido" es la **bisagra** donde luego enchufa la IA del 1.2. Hazlo de forma que su contenido se pueda rellenar tanto a mano (ahora) como desde fuera (después) sin reescribir el paso.

---

## M4 · Generar el PDF y compartir 🟢 Definitiva (salvo el detalle visual del PDF)

**Por qué.** El informe terminado tiene que convertirse en un **PDF** (el documento que vale como evidencia) y poder **compartirse** con los destinatarios de la obra. Este es el entregable final del coordinador.

**Qué construyes.**
- **Puerto `PdfPort`** + adaptador con **`pdfmake`**: genera el PDF en el propio navegador, embebiendo las **fotos** y las **firmas**, con la tipografía IBM Plex Serif.
- **Puerto `SharePort`** + adaptador con la **Web Share API** (`navigator.share({files})`), con **descarga directa como alternativa** si compartir no está disponible.
- Vista previa del PDF antes de compartir, con los **destinatarios precargados** de la lista de distribución de la obra.

**🟡 Provisional:** el **maquetado exacto** del PDF (qué secciones, en qué orden) depende de la plantilla real. La mecánica (generarlo en cliente, embeber fotos/firmas, compartir) es definitiva; el layout fino se ajusta cuando llegue el modelo real.

**Cómo guiarte con tu Claude.** "Hagamos el PdfPort con pdfmake: una función que recibe un informe + obra + coordinador y devuelve el PDF, con fotos y firmas. Hazlo detrás de un puerto para poder cambiar la librería si hace falta. Luego el SharePort con Web Share y fallback a descarga. Antes de ofrecer 'compartir', comprueba siempre `navigator.canShare({files})`."

**Hecho cuando.** Desde un informe firmado obtengo un PDF correcto (con fotos y firmas) y puedo compartirlo o descargarlo en el móvil.

**Trampas.** `mailto:` **no puede adjuntar archivos** — no lo uses para enviar el PDF ([[gotchas#g2-mailto-no-attach]]). En iOS, comprueba que `canShare({files:[pdf]})` devuelve `true` antes de mostrar el botón de compartir.

---

## M5 · Dejar la PWA fina 🟢 Definitiva

**Por qué.** Que el recorrido funcione es una cosa; que se sienta una app sólida y aguante el uso real en una obra (sin señal, con prisa) es otra. Este hito es el pulido que convierte el esqueleto en algo que el stakeholder querría usar de verdad.

**Qué construyes.**
- **Funcionamiento offline** del "esqueleto" de la app (service worker con caché del shell).
- **Instalable** ("Añadir a pantalla de inicio") con un buen manifiesto (icono, nombre, color).
- **Estados consistentes** en toda la app, con su copy en español llano de [[design-system#estados]]: sin conexión, guardado, error de validación, y estado vacío ("Aún no tienes obras. Crea la primera.").
- **Repaso de accesibilidad** (presbicia): tamaños, contraste y áreas táctiles según [[working-preferences#design-constraints]].
- **Prueba de extremo a extremo** (Playwright) del recorrido completo perfil → obra → informe → PDF → compartir.

**Cómo guiarte con tu Claude.** "Repasemos la app para dejarla redonda: configura el service worker para que funcione offline, revisa que el manifiesto permita instalarla, e implementa los estados (offline/guardado/error/vacío) con el copy de design-system. Luego escribe un test e2e con Playwright que recorra todo el flujo." Pídele también una pasada de accesibilidad revisando tamaños y contraste.

**Hecho cuando.** El recorrido completo funciona de punta a punta, **offline**, la app se instala, y un coordinador podría usarla para reemplazar su flujo manual en una obra (este es el **criterio de salida del 1.1**, [[roadmap]]).

**Trampas.** Recuerda insistir en que el coordinador **instale la app** (no usarla en pestaña), o iOS le borrará los datos a los 7 días ([[gotchas#g3-ios-7-day-eviction]]).

---

# Incremento 1.2 — voz + IA

La meta del 1.2 es sustituir el paso "Contenido" del informe (que en el 1.1 se escribe a mano) por: **el coordinador cuenta la visita hablando → se transcribe → la IA redacta un borrador → él lo revisa y firma**. Todo lo demás del flujo (fotos, incumplimientos, firmas, PDF) no cambia.

## M6 · Conectar OpenAI (detrás de puertos) 🟢 Definitiva

**Por qué.** Antes de tocar la interfaz de voz, dejamos listos y aislados los dos "aparatos" de IA. Al estar detrás de puertos, el resto de la app no sabe (ni le importa) que por dentro hay OpenAI.

**Qué construyes.**
- **Puerto `TranscriptionPort`** + adaptador que llama a `gpt-4o-transcribe` (con `language:"es"` y un prompt con vocabulario técnico de obra) — convierte audio en texto.
- **Puerto `ReportCompositionPort`** + adaptador que llama al modelo de texto con **Structured Outputs / JSON Schema** (`strict:true`), para que el borrador del informe salga **siempre con los mismos campos**. Detalle en [[tech-research#fill]].
- La clave de OpenAI configurada como variable de entorno (no en el código), con un **tope de gasto** puesto en la cuenta.

**Cómo guiarte con tu Claude.** "Crea los dos puertos de IA con sus adaptadores de OpenAI, siguiendo docs/tech-research.md. Para la composición usa Structured Outputs con un esquema zod. Déjalo todo detrás de puertos para poder probarlo con fakes. Y enséñame cómo poner la clave en variable de entorno sin commitearla."

**Hecho cuando.** Desde un test o una prueba manual, puedo mandar un audio y recibir su transcripción, y mandar un texto y recibir un borrador estructurado.

**Trampas.** La clave viaja en el cliente solo porque es alpha interno; nunca la subas al repo y ten el tope de gasto puesto ([[gotchas#g1-openai-key-client]]). La IA necesita internet: piensa qué pasa sin señal.

---

## M7 · Grabar voz y transcribir 🟢 Definitiva (en enfoque)

**Por qué.** Es la entrada del flujo de IA: el coordinador habla, y eso se convierte en texto que servirá de base.

**Qué construyes.**
- **Grabador de voz** en la UI (`MediaRecorder`) con onda visual y cronómetro, siguiendo el prototipo del flujo de voz.
- Envío del audio al `TranscriptionPort` y mostrar la **transcripción** cuando llega, con su estado de progreso.
- Manejo del **offline**: como la transcripción necesita internet, avisar con claridad o dejar la nota guardada para cuando vuelva la señal.

**Cómo guiarte con tu Claude.** "Monta la pantalla de grabación con MediaRecorder según el prototipo 'Flujo voz e IA'. Al detener, manda el audio al TranscriptionPort y muestra la transcripción. Maneja el caso de que no haya internet."

**Hecho cuando.** Grabo una nota hablando, veo su transcripción en pantalla, y queda lista para alimentar el borrador.

**Trampas.** El formato de audio que graba el navegador varía entre móviles (sobre todo iPhone). Pruébalo pronto en un iPhone real.

---

## M8 · Redacción por IA + pantalla de revisión 🟡 Estructura definitiva, contenido provisional

**Por qué.** Aquí la IA propone, pero **manda la persona**. El coordinador tiene que ver de dónde sale cada frase, poder corregir, y firmar con confianza. Este es el diferenciador del producto, y también lo más delicado: que se sienta una ayuda, no una caja negra.

**Qué construyes.**
- Llamar al `ReportCompositionPort` con la transcripción + la plantilla del organismo + ejemplos, y volcar el resultado en el informe.
- **Pantalla de auditoría**: el borrador editable **campo a campo**, con opción de **ver la transcripción de origen**, **rehacer** un apartado, o **pedirle un cambio al asistente** (acciones rápidas: "más formal", "más breve", "añadir la hora"). Los apartados de baja confianza salen marcados **"⚠ Revisar"**. Sustituye el paso "Contenido" manual del M3.

**🟡 Provisional:** la **plantilla, los ejemplos y el esquema exacto** del informe dependen del modelo real ([[stakeholder-questions#q2-campos-informe]]) y se afinan en el M9. La **estructura de la pantalla** (revisión campo a campo, ver fuente, rehacer, asistente) sí es definitiva.

**Cómo guiarte con tu Claude.** "Construye la pantalla de auditoría del flujo de voz: toma la transcripción, llama al ReportCompositionPort, y muestra el borrador editable campo a campo, con 'ver nota de voz', 'rehacer apartado' y un asistente de reescritura con acciones rápidas. Marca lo dudoso con '⚠ Revisar'. El coordinador edita y confirma; nada se firma sin su OK."

**Hecho cuando.** Desde una nota de voz llego a un informe con el contenido redactado, lo reviso/corrijo campo a campo, y queda listo para firmar.

**Trampas.** Principio de oro del diseño: **la IA propone, el coordinador confirma y firma**. Nunca des un texto por bueno sin que la persona pueda verlo y cambiarlo.

---

## M9 · Afinar la IA con el feedback 🟡 Provisional (es un proceso, no una pantalla)

**Por qué.** Que la IA funcione no es lo mismo que que escriba informes fiables. Este hito es el **bucle de ajuste**: el stakeholder y Miren usan la app por separado, auditan los informes que salen, y nosotros vamos mejorando el prompt y los ejemplos hasta que la calidad sea de fiar.

**Qué construyes.** Más que código nuevo, es soporte para iterar: una forma cómoda de cambiar la plantilla/ejemplos/instrucciones que usa la IA, y de recoger las observaciones de la auditoría dual ([[working-preferences#validation-discipline-project-specific]]) para incorporarlas.

**Cómo guiarte con tu Claude.** "Ayúdame a dejar el prompt y los ejemplos de la IA en un sitio fácil de editar, para poder iterarlos rápido con el feedback de los usuarios sin tocar el resto del código."

**Hecho cuando.** Es un objetivo de calidad, no una casilla: los informes generados salen lo bastante bien como para enviarlos sin reescribirlos.

**Trampas.** Aquí el trabajo es de ajuste fino y paciencia, no de construir funciones nuevas. No esperes "terminarlo" de golpe; mejora con cada ronda de feedback.
