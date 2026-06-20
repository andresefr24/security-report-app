---
title: Tech plan — Fase 1 (incrementos 1.1 y 1.2)
type: strategic
updated: 2026-06-20
validated: true
tags: [engineering, plan, architecture]
---

# Tech plan — Fase 1

Plan de implementación de la Fase 1 sobre **React + TypeScript**, arquitectura **DDD / Clean / Hexagonal con patrón repository** ([[decisions#d4-architecture]]). F1 se construye en dos incrementos: **1.1 esqueleto sin IA** y **1.2 voz + IA** ([[decisions#d6-f1-increments]]). Audiencia: Josune (implementa) y Andrés (PM + guía). El detalle de campos del informe está bloqueado por la plantilla real ([[stakeholder-questions#q2-campos-informe]]); el formulario y el PDF se diseñan **configurables** para absorber esa confirmación sin reescritura.

## 1. Principio rector

El dominio no sabe que estamos en una PWA sin backend. Toda volatilidad —persistencia local hoy / nube mañana, IA, generación de PDF, compartir— vive **detrás de puertos**. Eso hace que: (a) F2 (backend) sea un cambio de adaptador, no de dominio; (b) la IA de 1.2 enchufe en una única costura sin tocar 1.1; (c) los casos de uso se testeen con repos falsos en memoria.

## 2. Stack concreto

- **Build / PWA:** Vite + `vite-plugin-pwa` (Workbox) para manifest, service worker y precache del app shell.
- **UI:** React 18 + TypeScript. Routing con React Router. **shadcn/ui + Tailwind + Radix** con los tokens, tipografía (IBM Plex Sans/Serif) y `globals.css` de [[design-system]]. Navegación: tab bar inferior de 4 secciones + barra lateral maestro-detalle en tablet/escritorio. Prototipos de referencia en `security-report-app/design/`. Respetar [[working-preferences#design-constraints]] (presbicia).
- **Estado:** Zustand para estado de UI/sesión; los datos persistentes se leen/escriben vía repositorios (no en el store).
- **Formularios y validación:** `react-hook-form` + `zod`. `zod` se reutiliza para invariantes de dominio y para generar el JSON Schema de Structured Outputs en 1.2.
- **Persistencia local:** `localForage` (IndexedDB) detrás de los repositorios.
- **Fotos:** `<input capture>` + `browser-image-compression` para reducir al capturar.
- **Firma:** `signature_pad` sobre canvas.
- **PDF:** `pdfmake` (layout estructurado, embebe imágenes base64 y firmas). Alternativa si el diseño exige fidelidad visual del HTML: `html2canvas` + `jsPDF`, peor para texto seleccionable.
- **IA (1.2):** SDK oficial `openai` (JS) con `dangerouslyAllowBrowser` o `fetch` directo. Ver seguridad en §9 y [[gotchas#g1-openai-key-client]].
- **Testing:** Vitest (dominio + casos de uso), React Testing Library (componentes), Playwright (e2e del flujo crítico).

## 3. Arquitectura por capas

```
src/
  domain/                # Sin dependencias externas. Entidades, VOs, reglas, puertos.
    coordinador/         # Coordinador (perfil), nº registro IRSST, firma
    promotor/            # Promotor (entidad de primer nivel, D5)
    proyecto/            # Proyecto (obra), lista de distribución
    informe/             # Informe + Foto, Firma, Incumplimiento (VOs)
    shared/              # Id, Email, Result, errores de dominio
    ports/               # Interfaces: repositorios + servicios (outbound)
  application/
    use-cases/           # Un caso de uso por comando del event storm
  infrastructure/
    persistence/localforage/   # Adaptadores repo (IndexedDB)
    ai/openai/                 # Adaptadores transcripción + composición (1.2)
    pdf/                       # Adaptador pdfmake
    sharing/                   # Adaptador Web Share / descarga
  ui/
    pages/  components/  hooks/  view-models/
  app/                   # Composition root (DI): cablea adaptadores reales
```

Regla de dependencias: `ui → application → domain`; `infrastructure` implementa puertos de `domain`; nadie importa hacia afuera de su capa. El **composition root** (`app/`) es el único sitio que conoce los adaptadores concretos.

## 4. Modelo de dominio (de [[domain-model]])

Agregados: **Coordinador** (perfil único en el dispositivo), **Promotor**, **Proyecto**, **Informe**. Jerarquía Coordinador → Promotor → Proyecto → Informe; referencias por id ([[decisions#d5-promotor-first-class]]). Value objects: `Id`, `Email`, `NumeroRegistroIRSST`, `Firma` (trazo), `Foto` (blob/base64 + metadatos), `Incumplimiento` (subcontrata + descripción), `FrecuenciaVisita`. La lista de distribución es subcolección del Proyecto. El informe **tipo** (fecha vs mes) queda como atributo provisional hasta resolver [[stakeholder-questions#q1-fecha-vs-mes]].

## 5. Puertos (interfaces de dominio)

- **Repositorios (outbound):** `CoordinadorRepository`, `PromotorRepository`, `ProyectoRepository`, `InformeRepository`. Métodos CRUD + consultas de read model (`listByProyecto`, etc.).
- **Servicios (outbound):**
  - `PdfPort` — `render(informe, proyecto, coordinador): Blob`.
  - `SharePort` — `share(pdf, destinatarios): Result` (Web Share API con fallback a descarga; valida `canShare({files})`, ver [[gotchas#g2-mailto-no-attach]]).
  - `TranscriptionPort` (1.2) — `transcribe(audio): string`.
  - `ReportCompositionPort` (1.2) — `compose(transcripcion, plantilla, ejemplos): InformeDraft` (Structured Outputs).

Cada puerto tiene un **fake en memoria** para tests de casos de uso, y un adaptador real en `infrastructure/`.

## 6. Casos de uso (= comandos del event storm)

1.1: `ConfigurarPerfil`, `AltaPromotor`, `CrearProyecto`, `SuscribirDistribucion`, `CrearInforme`, `AdjuntarFoto`, `RedactarContenido`, `MarcarIncumplimiento`, `FirmarInforme`, `GenerarPdf`, `CompartirInforme`.
1.2: `GrabarYTranscribirNota`, `ComponerConIA`, `AuditarInforme`. La política "incumplimiento → incluir subcontrata como firmante/destinatario" vive como regla en el agregado Informe.

## 7. Persistencia local

Colecciones en localForage: `coordinador` (perfil único), `promotores`, `proyectos`, `informes`. `proyecto.promotorId`, `informe.proyectoId`. Fotos como base64 reducido; vigilar cuota. Llamar `navigator.storage.persist()` al iniciar. Ver el gotcha de borrado a 7 días en iOS ([[gotchas#g3-ios-7-day-eviction]]): exigir instalación en pantalla de inicio.

## 8. Incremento 1.1 — esqueleto sin IA

**Objetivo:** flujo completo perfil → promotor → obra → informe manual → PDF → compartir, sin voz ni IA.

Hitos:

- **M0 — Andamiaje.** Vite + PWA, estructura hexagonal, composition root, routing, tokens del design system. Service worker básico.
- **M1 — Perfil.** Agregado Coordinador + `CoordinadorRepository` (localForage) + caso de uso + pantalla. `storage.persist()`. Tests de dominio y de repo.
- **M2 — Promotor + Obra.** CRUD de Promotor y Proyecto, selección de promotor en el alta de obra, lista de distribución, read models de listados.
- **M3 — Informe manual (wizard 5 pasos).** Editor en wizard modular (datos · fotos · contenido · incumplimientos · firmas) con **autoguardado por paso** y banda "Sin conexión"; adjuntar fotos (compresión), contenido a mano, incumplimientos (regla de firmantes), firmas (`signature_pad`). Cada paso es módulo independiente (campos provisionales, Q2). Ver [[design-system]].
- **M4 — PDF + compartir.** `PdfPort`/pdfmake con fotos y firmas embebidas; `SharePort` con Web Share + fallback descarga; copia conservada.
- **M5 — Endurecido PWA.** Offline del app shell, instalación, persistencia, **estados consistentes** (offline / guardado / error-validación / vacío con su copy de [[design-system#estados]]), pase de accesibilidad (presbicia), e2e Playwright del flujo entero.

**Criterio de salida (de [[roadmap]]):** el stakeholder puede reemplazar su flujo manual para una obra de principio a fin, con un PDF que enviaría al promotor.

## 9. Incremento 1.2 — voz + IA

**Objetivo:** sustituir "Redactar contenido" por nota de voz → transcripción → composición IA → auditoría humana, sin tocar el resto del flujo de 1.1.

Hitos:

- **M6 — Adaptadores OpenAI.** `TranscriptionPort` (`gpt-4o-transcribe`, `language:"es"`, prompt con jerga) y `ReportCompositionPort` con **Structured Outputs** (`zod` → JSON Schema, `strict:true`) para devolver los campos del informe de forma determinista. Ver [[tech-research#fill]].
- **M7 — Captura de voz.** UI de grabación (`MediaRecorder`), envío a transcripción, manejo de offline (encolar / avisar; la IA es online-only).
- **M8 — Composición + auditoría.** Inyectar transcripción + plantilla + ejemplos do/don't; volcar el borrador en el informe; pantalla de **auditoría** donde el coordinador corrige a mano y/o vuelve a pedir al agente.
- **M9 — Bucle de ajuste.** Soporte para iterar prompt/contexto con las observaciones de la auditoría dual (stakeholder + Miren), [[working-preferences#validation-discipline-project-specific]].

## 10. Transversales

- **Seguridad de la key (1.2):** en F1 la key viaja en el cliente (alpha interno asumido). Mitigar con key dedicada, **tope de gasto mensual**, rotación; nunca commitearla. Proxy en F2. Ver [[gotchas#g1-openai-key-client]], [[tech-research#seguridad-key]].
- **Lenguaje:** todo texto de UI y del PDF en español llano, sin anglicismos ([[working-preferences#outward-language]]).
- **Accesibilidad:** presbicia — tipografía grande, alto contraste, áreas táctiles amplias ([[working-preferences#design-constraints]]).
- **Testing por capa:** dominio puro (Vitest), casos de uso con fakes de puertos, adaptadores con tests de integración, e2e del flujo crítico (Playwright).
- **Distribución:** F1 = PWA instalable "Añadir a pantalla de inicio", sin empaquetar; TWA/Capacitor en F2 ([[tech-research#pwa-nativa]]). *(Pendiente de confirmación de Andrés.)*

## 11. Riesgos y dependencias

- **Q2 (campos del informe) bloquea el detalle del formulario y del PDF.** Mitigación: form e informe **configurables por esquema**; cerrar el esquema cuando llegue la plantilla real.
- **iOS:** formato de audio de `MediaRecorder` y `canShare({files:[pdf]})` — verificar en el alpha (5 min). Borrado a 7 días → instalar en inicio.
- **Q1 (fecha vs mes)** puede bifurcar `CrearInforme`; hoy se modela como atributo `tipo`.

## 12. Secuencia recomendada

Construir 1.1 entero hasta el criterio de salida (M0–M5) antes de empezar 1.2 (M6–M9). La costura de unión es el contenido del informe: 1.2 solo cambia cómo se rellena ese campo, no lo que cuelga de él.
