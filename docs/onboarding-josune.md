---
title: Onboarding — Josune
type: strategic
updated: 2026-06-20
validated: true
tags: [onboarding, process]
---

# Onboarding — Josune 👋

¡Bienvenida! Esta página es tu punto de partida. Está escrita para que la leas con calma, sin prisa y sin dar nada por sabido. Si algo no se entiende, **no es culpa tuya: es que no lo hemos explicado bien todavía**. Pregunta sin miedo — preguntar aquí es trabajar bien, no quedar mal.

## Lo primero: cómo es trabajar en este proyecto

Este proyecto es un poco distinto a lo habitual. **Gran parte del material ya viene preparado con ayuda de IA**: el diseño, el plan técnico, esta documentación e incluso los tickets de las tareas. Eso suena cómodo, y lo es, pero hay tres cosas importantes que conviene que tengas claras desde el día uno:

1. **La IA se equivoca.** Lo que recibes es un punto de partida muy bueno, no una verdad absoluta. Si algo te chirría, probablemente tengas razón. Dilo.
2. **Tu trabajo no es solo "teclear lo que dice el plan".** Es entenderlo, implementarlo bien y avisar cuando algo no encaje con la realidad del código. Eres la persona que convierte el plan en algo que funciona de verdad.
3. **No tienes que entenderlo todo de golpe.** Nadie espera eso. Lee, pregunta, prueba. El objetivo de las primeras semanas es que te sientas orientada, no que lo domines todo.

Andrés es el PM (lleva el alcance y las decisiones, y te acompaña en el diseño técnico). El stakeholder y **Miren** son los expertos del mundo real (coordinadores de seguridad) y quienes probarán la app. Tú eres quien la construye.

## Qué estamos construyendo (en cristiano)

Una **aplicación para coordinadores de seguridad y salud en obras de construcción**. Estos profesionales, por ley, tienen que visitar las obras y dejar por escrito un **informe de cada visita** (es su prueba de que estuvieron allí, y vale como evidencia legal).

Hoy lo hacen a mano y es engorroso. Nuestra app les deja: dar de alta sus obras, crear el informe de una visita (con fotos y firmas), y **generar un PDF** que comparten con los implicados. El toque diferencial llega después: poder **contar la visita hablando** y que la IA redacte el borrador del informe, que ellos revisan y firman.

Detalle importante: **la app la usa solo el coordinador**. Los demás (el promotor, etc.) solo reciben el PDF; no entran en la app.

## Cómo va a funcionar la infraestructura (sin tecnicismos primero)

Imagina la app como una caja con cuatro capas, de dentro hacia fuera:

- **El dominio** — las "reglas del negocio" puras (qué es una Obra, un Informe, una Firma). No sabe nada de pantallas ni de bases de datos. Es el corazón.
- **Los casos de uso** — las acciones que el coordinador puede hacer ("crear informe", "firmar", "generar PDF"). Orquestan el dominio.
- **La infraestructura** — los "enchufes" al mundo real: dónde se guardan los datos, cómo se llama a la IA, cómo se hace el PDF.
- **La interfaz (UI)** — lo que se ve y se toca, hecho con React.

La idea clave (se llama **arquitectura hexagonal** con **puertos y adaptadores**) es esta analogía: el dominio define **enchufes** (puertos), y la infraestructura pone los **aparatos** que encajan en ellos (adaptadores). Hoy el "aparato de guardar datos" guarda en el propio móvil; mañana podremos cambiarlo por uno que guarde en la nube **sin tocar el corazón de la app**. Eso es todo lo que significa "hexagonal + repository" para el día a día: cambiar piezas sin romper el resto.

Para la **Fase 1 no hay servidor propio**: todo vive en el dispositivo del coordinador (con una base de datos del navegador llamada IndexedDB). Las únicas llamadas "fuera" son a la IA de OpenAI (para la voz y el texto), y eso solo en el incremento 1.2.

El detalle técnico completo está en [[tech-plan-f1]] — no hace falta que lo memorices, pero tenlo a mano.

## Las decisiones que ya tomamos (y por qué)

Estas son las decisiones grandes ya cerradas. Cada una está explicada a fondo en [[decisions]]; aquí va la versión corta y humana:

- **Es una PWA (aplicación web instalable), y en la Fase 1 guarda todo en el móvil, sin servidor.** ¿Por qué? Los informes llevan datos sensibles de terceros; no custodiarlos nosotros nos quita encima un problema legal y hace la primera versión más pequeña. ([[decisions#d1-local-only-pwa]])
- **La hacemos en React + TypeScript**, con la arquitectura hexagonal de arriba. ([[tech-plan-f1]], [[decisions#d4-architecture]])
- **La salida es un PDF que se comparte** con la hoja de "compartir" del móvil o descargándolo. *No* mandamos correos automáticos (el truco de `mailto:` no puede adjuntar archivos — ojo con esto). ([[decisions#d4-architecture]], [[gotchas#g2-mailto-no-attach]])
- **El "promotor" (el dueño de la obra) es una entidad propia** que se da de alta antes que las obras. ([[decisions#d5-promotor-first-class]])
- **La IA (voz → texto → borrador) usa la API de OpenAI desde el cliente, solo online.** En esta fase de pruebas internas la clave de OpenAI viaja en la app; es un riesgo asumido temporal (lo blindamos en Fase 2). ([[decisions#d4-architecture]], [[gotchas#g1-openai-key-client]])
- **El diseño usa shadcn/ui** (componentes de React) con los tokens y pantallas que ya están definidos en [[design-system]]. Un matiz de vocabulario: en la pantalla decimos **"obra"**, pero en el código la entidad se llama **`Proyecto`** (no la renombramos). ([[decisions#d7-design-system-adopted]])
- **Antes de programar, los prototipos se revisan con los stakeholders.** Es una pausa a propósito. ([[decisions#d8-prototype-review-gate]])

## Cómo se organiza el trabajo: fases e incrementos

Cuidado con dos palabras que se parecen:

- **Fases** = grandes etapas del producto. **F1** = app local en el móvil (lo de ahora). **F2** = nube y sincronización (más adelante, depende de una consulta legal). **F3** = documentos extra.
- **Incrementos** = trozos en los que partimos *dentro* de la Fase 1. **1.1** = el "esqueleto" sin IA (crear el informe a mano → PDF → compartir). **1.2** = añadir encima la voz y la IA. Los dos son parte de la F1. ([[decisions#d6-f1-increments]], [[roadmap]])

La idea es construir **primero el 1.1 entero** (que ya sea útil), y solo después enchufarle la IA del 1.2. La IA cambia un único paso del flujo (el de redactar el contenido), no todo lo demás.

## Las tareas que vas a ver (M0–M9)

El trabajo está partido en hitos pequeños. Aquí el mapa; el detalle (qué incluye cada uno y cuándo está "hecho") está en [[tasks-f1-draft]], y son **borradores** porque pueden cambiar tras la revisión con stakeholders.

Incremento 1.1: **M0** montar el esqueleto del proyecto · **M1** perfil del coordinador · **M2** promotores y obras · **M3** el informe (asistente de 5 pasos) · **M4** generar el PDF y compartir · **M5** dejar la PWA fina (offline, instalar, estados).
Incremento 1.2: **M6** conectar OpenAI · **M7** grabar voz y transcribir · **M8** redacción por IA + pantalla de revisión · **M9** afinar la IA con el feedback.

## Reglas que importan para el frontend

- **Todo el texto que ve el usuario, en español llano, sin anglicismos.** Los usuarios son dos coordinadores de ~63 años. ([[working-preferences#outward-language]])
- **Legibilidad para presbicia**: tipografía grande (≥18px), buen contraste, botones grandes (≥48px). ([[working-preferences#design-constraints]])
- **Trampas técnicas ya conocidas** (léelas antes de tocar su zona): [[gotchas]] — el borrado de datos a los 7 días en iOS, el `mailto` que no adjunta, y la clave de OpenAI en el cliente.

## Configura tu Claude (para que te guíe paso a paso) {#configura-tu-claude}

En este proyecto vas a trabajar con **Claude Code** como copiloto: es un asistente que vive en la terminal, dentro de la carpeta del proyecto, y que te puede ir guiando hito a hito. Lo bueno es que el repo ya trae preparado el contexto para que "tu Claude" sepa qué hacer. Pasos:

1. **Consigue acceso al repositorio y clónalo.** Pídele a Andrés que te dé acceso al repo `security-report-app`. Luego, en tu ordenador:
   ```
   git clone https://github.com/andresefr24/security-report-app.git
   cd security-report-app
   ```
2. **Instala Claude Code** (sigue la guía oficial de Anthropic para instalarlo) y **ábrelo dentro de la carpeta del repo** (`claude` desde esa carpeta).
3. **Las instrucciones base ya están puestas.** En la raíz del repo hay un archivo `CLAUDE.md` que tu Claude **lee solo, automáticamente**. Le dice quién eres (junior, primera vez con todo hecho por IA), que te explique en pasos pequeños, que lea el vault de `docs/` antes de tocar nada, que siga la arquitectura y las reglas, y que **te proponga un plan antes de escribir código**. No tienes que activarlo: con que el archivo esté en el repo, ya funciona.
4. **Cómo arrancar un hito.** Cuando vayas a por una tarea (por ejemplo el M0), pégale algo así:
   > "Vamos a trabajar el hito **M0** de `docs/tasks-f1-draft.md`. Primero lee esa sección, más `docs/tech-plan-f1.md` y `docs/design-system.md`. Explícamelo en pasos pequeños y vamos uno a uno. **No escribas código** hasta que confirmemos juntos el plan."
   
   A partir de ahí, ve confirmando cada pieza. Cada hito de `tasks-f1-draft` trae un bloque **"Cómo guiarte con tu Claude"** con el guion concreto que puedes usar.
5. **Reglas de oro al trabajar con tu Claude:**
   - **Lee y entiende lo que genera** antes de aceptarlo. Si no lo entiendes, pídele que te lo explique. No pasa nada por preguntar tres veces.
   - **Commits pequeños** y corre los tests antes de dar algo por hecho.
   - Si algo que propone **choca con una decisión del vault o con algo pendiente de los stakeholders**, para y coméntalo con Andrés.
   - La IA se equivoca: tú eres el control de calidad, no su secretaria.

(Opcional, para dudas **conceptuales** y no de código: puedes crear también un *Proyecto* en Claude.ai y subir la carpeta `docs/` como conocimiento, para preguntarle "¿por qué decidimos X?" en lenguaje natural.)

## Por dónde empezar (tu primera semana)

1. Lee esta página entera, sin prisa.
2. Lee [[product-overview]] (qué es el producto) y [[active-context]] (en qué punto estamos hoy).
3. Échale un ojo a [[design-system]] y abre los prototipos publicados para verlos en vivo: **https://andresefr24.github.io/security-report-app/**
4. Lee [[tech-plan-f1]] y los bocetos de [[tasks-f1-draft]]. Quédate con el M0; es por donde se arranca.
5. Apunta todo lo que no entiendas y lo vemos. En serio: esa lista de dudas es oro, no un problema.

El vault completo (toda la documentación del proyecto) está en `docs/`, y el [[README]] es el índice. Bienvenida al equipo. 🙂
