---
title: Nota de migración de datos — versionar el informe antes de Fase B
type: rolling
updated: 2026-08-18
validated: true
tags: [informe, datos, migracion, schema, fase-b]
---

# Nota de migración de datos — versionar el informe antes de Fase B

**Para Josune y su Claude.** Esto **no corrige nada tuyo**: arranca de un acierto tuyo (el fallback del presupuesto en la Fase A) y lo convierte en el patrón que necesitamos para que la Fase B no borre datos reales de Nicolás y Miren. Es un "afinado 4 mínimo" de [[decisions#d9-informe-v2]]: solo lo justo para desbloquear Fase B, sin traernos el hito de persistencia entero. Rama: `feat/nota-migracion-datos`. Tu visto bueno antes de tocar código.

## Lo que cambió bajo los pies

[[decisions#d9-informe-v2]] dice, literalmente, "sin migración porque F1 es local y aún sin datos reales — última ventana barata para cambiar el modelo". Esa frase **caducó el día del primer uso real**. Nicolás y Miren ya tienen informes guardados en sus móviles. Cambiar la forma de una ficha ya guardada dejó de ser gratis: ahora arrastra el riesgo de que, al abrir la app con la versión nueva, un dato que ellos escribieron aparezca en blanco.

El mecanismo es el de siempre con zod: cuando el adaptador **relee** una ficha, valida contra el esquema **actual** y descarta lo que no encaja. Si renombras un campo, la ficha vieja trae el nombre viejo, zod no lo reconoce, y el dato queda invisible. No es un bug de zod: es lo que hace cualquier lector estricto cuando la forma en disco y la forma en código dejan de coincidir. A esa diferencia la llamamos **drift**, y sobre datos locales es peligrosa porque no hay una base central que arreglar después: el dato vive en un dispositivo que no controlamos.

## Tu parche fue el primer escalón (en serio)

En la Fase A renombraste `presupuesto` a `presupuestoEjecucion` y metiste un fallback: "si el campo nuevo viene vacío, lee el viejo", con dos tests. Eso no es un apaño feo — es, textualmente, la fase **expand** del patrón **Expand / Contract** (también llamado *parallel change*, de la base de datos evolutiva de Fowler y Sadalage): primero añades lo nuevo conviviendo con lo viejo, luego migras, y solo al final retiras lo viejo. Tu instinto se adelantó al patrón.

Lo único que no escala es la **forma** de ese parche: un `if` suelto en el adaptador por cada campo. La Fase B no renombra un campo, **reestructura la ficha entera** (`Actividad` pasa a `Observacion`, desaparece `tipo`, aparecen `titulo` y `estado`). Con datos reales delante, eso pide un mecanismo, no un `if` por costura. La buena noticia: tu fallback se convierte en la primera pieza formal de ese mecanismo, sin tirar nada.

## El patrón, en cuatro piezas (afinado 4 mínimo)

**1 — Sellar cada ficha con su versión.** Añadimos `schemaVersion: 1, 2, 3…` al DTO que se guarda. Es **versionado de esquema**, el mismo mecanismo de las migraciones de Rails o Django, o del *upcasting* de eventos en event-sourcing. El sello es el linchpin: sin él no sabes de qué época es una ficha, y tendrías que adivinar olfateando campos (frágil). **La migración la dispara la versión, no la validación**: no preguntamos "¿cumple el contrato nuevo?" (una ficha vieja podría colar por casualidad), preguntamos "¿en qué versión nació?" y de ahí sabemos exactamente qué escalones le faltan.

**2 — Una función `migrate` en cadena, dentro del adaptador.** `migrate(raw)` mira la versión y aplica en cadena `v1→v2`, `v2→v3`… hasta dejar la ficha en la forma actual. Cada escalón es una función pura y pequeña (el rename del presupuesto es el escalón `v0→v1`). Vive en el **adaptador de persistencia** (la capa DTO/mapper del afinado 4), no repartida por el dominio: así el dominio nunca ve formas viejas. Esto es **migración perezosa (lazy migration / migrate-on-read)**: migras al leer, no en un barrido global.

**3 — Migrar antes de validar, y cuarentena en vez de descarte.** El orden correcto al leer es: coger el crudo, migrarlo, y **entonces** pasarlo por zod. Así zod solo ve la forma actual y nunca "tira a la basura" un campo. Regla añadida: si tras migrar una ficha **sigue** sin validar, no la descartamos — la dejamos en **cuarentena** (cruda, con aviso). Es el patrón **dead-letter**: un dato de un usuario real que no sabes parsear es un bug que hay que mirar, no basura. Esto también encaja con el **tolerant reader** (la ley de Postel: sé tolerante con lo que recibes).

**4 — "Sin versión" = versión 0.** Las fichas que ya están en los móviles no tienen `schemaVersion`. Regla de arranque: ausencia de sello significa la línea base pre-versionado (v0). La primera migración `v0→v1` es justo la de la Fase A (rename del presupuesto + campos de obra). Así el trabajo que ya hiciste queda absorbido como el primer escalón oficial, sin repetirlo.

## Por qué al leer y no en el arranque

Una alternativa razonable es un barrido al abrir la app: recorrer todas las fichas, migrar las atrasadas y reescribirlas (**migración anticipada / eager**). Ventaja real: después del arranque todo está en versión actual. La descartamos aquí por dos motivos: los volúmenes son minúsculos (un coordinador tiene un puñado de informes, no hay problema de rendimiento que justifique el barrido), y el barrido mete un paso global fuera del puerto, con escrituras en el arranque que no necesitamos y que, si petan a mitad, te dejan datos a medio migrar. La perezosa encaja limpia en la arquitectura hexagonal: es una responsabilidad del adaptador, invisible para el dominio y para la UI. Si algún día los volúmenes crecen, añadir el barrido eager encima es trivial — pero hoy no aporta.

## Lo que NO entra aquí

Las otras tres costuras del afinado 4 completo (el almacén de imágenes `MediaStore`, los read-models de lista, y el contrato explícito con ids en cliente e ISO) **no** entran en este mínimo. Solo hacen falta `schemaVersion` + `migrate` + migrar-antes-de-validar + la regla v0. El resto sigue viviendo en su hito, después de Fase B. Esto es a propósito: mantenemos el scope pequeño, igual que hicimos rebanando los ajustes del informe.

## Cómo guiarte con tu Claude

"Afinado 4 mínimo antes de Fase B: versionar el informe para no perder datos reales al cambiar el modelo. Primero define `schemaVersion` en el DTO de persistencia y la regla 'sin versión = 0'. Luego una función `migrate(raw)` en el adaptador que encadene escalones puros `vN→vN+1`; el primero (`v0→v1`) formaliza el fallback del presupuesto que ya existe, con sus tests. Cambia el orden de lectura a migrar-antes-de-validar, y en fallo de validación deja la ficha en cuarentena en vez de descartarla, con un test que lo demuestre. No toques `MediaStore` ni read-models: eso es el afinado 4 completo, va después. Un paso cada vez, cada uno con su test."

## Para tu revisión

Esto es una propuesta, no una orden: si ves mejor el orden de los pasos, o crees que algún escalón sobra o falta para lo que la Fase B necesita de verdad, dilo — como siempre. Lo que sí me gustaría cerrar contigo antes de arrancar Fase B es que el sello de versión y la migración perezosa entran **antes** de reestructurar la observación, no después.
