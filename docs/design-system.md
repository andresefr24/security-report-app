---
title: Design system (F1)
type: strategic
updated: 2026-06-20
validated: true
tags: [design, normative, frontend]
---

# Design system — F1

Normativo de diseño para F1, destilado de la entrega de Claude design (2026-06-20). Léelo antes de construir UI. Las piezas originales (sistema de diseño, prototipos móvil/tablet/escritorio, flujo voz e IA, handoff) viven en `security-report-app/design/*.dc.html`. Sobre **shadcn/ui · React · Tailwind · Radix**, afinado para uso a pie de obra y presbicia. Ver [[tech-plan-f1]], [[decisions#d7-design-system-adopted]].

## Personalidad

Institucional y seria; transmite peso de evidencia legal. Azul institucional como marca, geometría sobria, **sin gradientes ni decoración**. La pantalla pesa lo justo para que el contenido (foto, firma, texto) mande.

## Decisiones de diseño cerradas

- **Navegación:** tab bar inferior de 4 secciones (**Obras · Promotores · Nuevo · Yo/Perfil**) + jerárquico lista→detalle. En tablet/escritorio pasa a **barra lateral fija con maestro-detalle**. Elegido por alcance del pulgar a una mano (con guantes) y para no ocultar funciones a usuarios mayores.
- **Editor de informe = wizard de 5 pasos** (datos de la visita · fotos · contenido · incumplimientos · firmas), un bloque por pantalla, avanzar/atrás grandes, barra de progreso. Cada paso es **módulo independiente** (los campos exactos aún no están confirmados, [[stakeholder-questions#q2-campos-informe]]).
- **Voz → IA → auditoría:** transcripción visible + borrador editable campo a campo + asistente de reescritura (acciones rápidas: *Más formal · Más breve · Añadir la hora*). La IA propone; el coordinador confirma y firma. Apartados de baja confianza salen marcados **«⚠ Revisar»**.

## Tokens

**Color** (todos los pares texto/fondo cumplen AA+). `globals.css` para theming shadcn (HSL):

```css
:root {
  --background: 0 0% 100%;      --foreground: 222 47% 11%;
  --primary: 222 76% 48%;       --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96%;     --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 98%;         --muted-foreground: 215 25% 35%;
  --accent: 38 92% 50%;         --accent-foreground: 222 47% 11%;
  --destructive: 0 72% 51%;     --destructive-foreground: 0 0% 100%;
  --success: 142 72% 29%;       --warning: 32 94% 35%;
  --border: 214 32% 85%;        --input: 214 32% 85%;  --ring: 222 76% 48%;
  --radius: 0.75rem;
}
```

Semánticos: `--primary #1D4ED8` (marca/acciones, 6.4:1) · `--foreground #0F172A` (texto, 17:1) · `--muted-foreground #475569` (secundario, 7:1) · `--destructive #DC2626` (incumplimiento/error) · `--accent #F59E0B` (revisar IA, solo con texto oscuro) · `--success #15803D` (guardado/firmado) · aviso `#B45309` (firma pendiente) · offline `#64748B`.

**Tipografía:** **IBM Plex Sans** (interfaz) · **IBM Plex Serif** (PDF). Base **18px**, mínimo 15px, interlineado ≥1.5, peso mínimo 400, sin mayúsculas largas. Escala: 40/700 · 28/600 · 22/600 · 18/400 (cuerpo) · 16/600 (etiqueta) · 15/500 (auxiliar).

**Espaciado/radios/sombras:** escala 4px (8/12/16/24/32/48). Radios 6 (chips) / 12 (inputs, botones) / 16 (tarjetas, hojas). **Áreas táctiles ≥48px** (botones 52px). Sombras sm (tarjeta) / md (menú) / lg (hoja, diálogo).

## Inventario de componentes → shadcn

Cada elemento mapea **1:1 a shadcn**; lo que no exista, como composición de primitivas (no librerías ajenas).

- Botones → `Button` (default/secondary/destructive/ghost, 52px).
- Campos → `Input` · `Label` (16/600) · `Textarea`.
- Selección → `Select` · `RadioGroup` · `Switch` · `Checkbox` (frecuencia y "¿hay incumplimiento?" como switch/segmented).
- Contenedores → `Card` · `Tabs` · `Sheet` (compartir) · `Dialog` (confirmaciones).
- Feedback → `Badge` (estado) · `Toast`/Sonner (guardado) · `Progress` (wizard).

**Compuestos propios:** captura de foto (`Card+Button+Dialog`, reduce al capturar), campo de firma (`Canvas+Card`, borrar/rehacer), grabador de voz (`Button+Progress`, onda + cronómetro + estado de transcripción), visor/compartir PDF (`Card+Sheet`).

## Estados (copy en español llano)

- **Offline:** banda discreta «Sin conexión — se guarda en el dispositivo». La captura **nunca se bloquea**; el PDF se comparte al recuperar señal.
- **Guardado:** autoguardado por paso + toast «Guardado en el dispositivo» + marca de tiempo en cabecera.
- **Error/validación:** mensaje bajo el campo, en rojo, con qué falta y cómo resolverlo; el paso no avanza hasta cumplir lo obligatorio (p. ej. firma del coordinador).
- **Vacío:** mensaje + acción directa («Aún no tienes obras. Crea la primera.»). Nunca pantallas vacías sin salida.

## Notas que reconcilian con el dominio

- El término de UI es **«obra»**; el agregado de dominio sigue siendo **`Proyecto`** (no se renombra). Ver [[decisions#d7-design-system-adopted]].
- El copy del flujo de voz debe reflejar **D4** (transcripción/IA en **servidor**, OpenAI), no «en el dispositivo». Frase de privacidad tipo «se procesa de forma segura». Ver [[legal-context#privacidad-ia]], [[decisions#d4-architecture]].

## Preguntas abiertas del diseño

01 marca/nombre (placeholder azul institucional) · 02 campos del informe ([[stakeholder-questions#q2-campos-informe]]) · 03 ¿firma exige geo+sello para valer como evidencia? ([[stakeholder-questions#q5-geo]]) · 04 ¿modo de contraste/texto extra como ajuste, o basta la base grande?
