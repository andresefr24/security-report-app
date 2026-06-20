---
title: Gotchas
type: rolling
updated: 2026-06-20
validated: true
tags: [gotcha, engineering]
---

# Gotchas

Trampas técnicas descubiertas y cómo se sortean. Léelo antes de tocar el área afectada. Newest first.

## G3 — iOS borra el almacenamiento local a los 7 días {#g3-ios-7-day-eviction}

**Área:** persistencia (IndexedDB / localForage), F1 local-only.

Safari/iOS aplica un *cap de 7 días*: si el origen no recibe interacción del usuario en 7 días, **borra el storage de script** (IndexedDB, service worker, Cache API). Como en F1 el dato vive **solo** en el dispositivo ([[decisions#d1-local-only-pwa]]), esto puede destruir informes no compartidos.

**Mitigación:** la regla **no aplica a PWAs instaladas en pantalla de inicio**. Por tanto: (a) instruir a los usuarios a **instalar la app** (no usarla en pestaña de Safari), y (b) llamar a `navigator.storage.persist()`. Si el dato fuera verdaderamente crítico a largo plazo, un wrapper con storage nativo (Capacitor) lo evita — pero eso es F2 ([[tech-research#pwa-nativa]]). Fuente: WebKit, *Updates to Storage Policy*.

## G2 — `mailto:` no adjunta archivos {#g2-mailto-no-attach}

**Área:** entrega del informe.

El esquema `mailto:` abre el cliente de correo pero **no puede adjuntar ficheros** — es una limitación dura del estándar. Por eso el envío del PDF en F1 va por **Web Share API y/o descarga + adjuntar a mano**, no por un `mailto` con adjunto. La lista de distribución sirve para pre-cargar destinatarios, no para enviar. Ver [[decisions#d4-architecture]], [[flows#relleno-del-informe]].

**Cautela iOS:** valida siempre con `navigator.canShare({files:[pdf]})` antes de ofrecer compartir, con descarga como fallback; el soporte de compartir-con-archivo no es uniforme entre versiones.

## G1 — La API key de OpenAI queda expuesta en el cliente {#g1-openai-key-client}

**Área:** IA, arquitectura F1 sin backend.

OpenAI **desaconseja explícitamente** poner la key en código de cliente; el SDK obliga a `dangerouslyAllowBrowser: true` (el propio nombre es la advertencia). Cualquiera con DevTools la ve → cargos y agotamiento de cuota.

**Mitigación F1 (alpha interno asumido):** key dedicada al proyecto, **tope de gasto mensual** en billing + alerta, nunca commitearla, rotarla al pasar a F2. **F2:** mover las llamadas a un proxy ligero (Edge Function) que guarde la key en servidor. Ver [[decisions#d4-architecture]], [[tech-research#seguridad-key]].
