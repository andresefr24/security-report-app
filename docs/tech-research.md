---
title: Tech research — OpenAI & PWA packaging
type: reference
updated: 2026-06-20
validated: true
expires_on: 2026-12-20
tags: [reference, engineering, ai, pwa]
---

# Tech research — OpenAI & PWA packaging

> Investigación del 2026-06-20 sobre fuentes oficiales. `type: reference` — los **precios y nombres de modelo cambian con frecuencia**; reverificar antes de presupuestar. Lo estructural (endpoints, structured outputs, ruta de empaquetado, gotchas) es estable.

## OpenAI — transcripción de voz {#stt}

- **Modelo recomendado:** `gpt-4o-transcribe` (mejor precisión en español que el Whisper clásico, ~0,006 $/min). Alternativa más barata: `gpt-4o-mini-transcribe` (~0,003 $/min). `whisper-1` solo si se necesitan timestamps/SRT.
- **Endpoint:** `POST /v1/audio/transcriptions` (multipart). Fijar `language: "es"` y usar `prompt` para sesgar vocabulario técnico (EPI, andamio, arnés, RD 1627/1997…).
- **Límites:** 25 MB/archivo (≈ horas de voz comprimida; sobra para notas de minutos). Acepta webm/m4a/mp3/wav — justo lo que graba `MediaRecorder` en el móvil.
- **Realtime/streaming:** existe pero ~3× más caro y más complejo (WebSocket, claves efímeras). No merece la pena en F1.

## OpenAI — composición del informe {#fill}

- Modelo pequeño de la familia GPT (la tarea es sencilla: transcripción + plantilla → informe). El nombre/precio exacto del modelo vigente debe reconfirmarse; el coste a nuestro volumen es trivial de todos modos.
- **Structured Outputs (JSON Schema, `strict: true`)** es la pieza clave: fuerza al modelo a devolver exactamente los campos del informe → el PDF se renderiza de forma determinista. Requisitos del esquema: `additionalProperties: false` y todos los campos en `required`.
- Contexto: la plantilla del organismo en el `system` + 1-2 ejemplos few-shot (transcripción → JSON ideal) + reglas do/don't ("no inventes hallazgos; si falta un dato, deja el campo vacío").
- **Function calling NO es necesario** aquí; sería para F2 si el informe debiera disparar acciones en otros sistemas.

## Seguridad de la key + CORS {#seguridad-key}

Ver el gotcha [[gotchas#g1-openai-key-client]]. Resumen: key en cliente desaconsejada por OpenAI; aceptada en F1 por ser alpha interno con mitigaciones (tope de gasto, key dedicada, rotación); proxy/backend ligero en F2. Las llamadas a OpenAI son `fetch` HTTPS normales; el proxy de F2 también neutraliza cualquier fricción de CORS.

## Coste estimado {#coste}

~20 informes/mes con notas de pocos minutos: **< 1 $/mes** (transcripción + composición). El factor decisivo NO es el precio, es la arquitectura de seguridad de la key.

## PWA → app nativa {#pwa-nativa}

- **F1 (alpha, 2 usuarios, Android + iPhone): no empaquetar.** PWA instalable vía "Añadir a pantalla de inicio". Fricción cero: sin Mac, sin Xcode, sin cuentas de developer, sin review de Apple, e iteras con cada deploy. Cubre cámara, audio, firma en canvas, IndexedDB, offline y compartir PDF en ambas plataformas.
- **Obligatorio en F1:** service worker con fallback offline, `navigator.storage.persist()`, y `canShare({files})` con fallback a descarga. Instruir a instalar en pantalla de inicio (ver [[gotchas#g3-ios-7-day-eviction]]).
- **Android (F2):** empaquetar con **TWA** (Bubblewrap o PWABuilder) → Google Play. Casi automático; requiere Digital Asset Links (`assetlinks.json` con el fingerprint correcto de Play App Signing).
- **iOS App Store (F2/3):** la App Store **no acepta PWAs directas** y rechaza wrappers "pelados" (guideline 4.2). Vía realista = **Capacitor**, que además unifica Android+iOS y da plugins nativos para blindar cámara/audio/storage.
- **Cautelas iOS a verificar en el alpha (5 min):** formato exacto de audio de `MediaRecorder` en su Safari, y que `canShare({files:[pdf]})` devuelva true.

## Fuentes

- OpenAI: [speech-to-text](https://developers.openai.com/api/docs/guides/speech-to-text), [pricing](https://developers.openai.com/api/docs/pricing), [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety).
- PWA→nativa: [TWA (web.dev)](https://web.dev/articles/using-a-pwa-in-your-android-app), [Capacitor PWA](https://capacitorjs.com/docs/web/progressive-web-apps), [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/), [Web Share API](https://web.dev/web-share/), [App Review 4.2](https://developer.apple.com/app-store/review/guidelines/).
