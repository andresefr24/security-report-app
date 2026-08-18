——áí——éñóá·—ñóóóáóííóóóóóóúóó·—ñóñóíáóíáóííéíáíííñáéó——óéíóé—éáááá---
title: Plan en fases — Ajustes del informe (respuesta a la propuesta de Josune)
type: rolling
updated: 2026-08-18
validated: true
tags: [informe, plan, fases, feedback]
---

# Plan en fases — Ajustes del informe (post primer uso)

Josune, gracias por el brief del primer uso real: es el feedback más valioso que hemos tenido. Esto no corrige tu propuesta, la ordena en rebanadas entregables para no morir de scope creep. La plantilla del PDF ya es parametrizable, así que repintarla en dos pasadas sale barato.

## El recorte, de un vistazo

**Fase A — Alivio del primer uso (YA):** los retoques que estorban hoy, sin tocar el modelo del informe.

**Fase B — Observaciones con estado y color (después de A):** el rediseño que os gustó.

**Fase C — Partir del informe anterior (DIFERIDA a propósito):** la bola de nieve.

## Fase A · Alivio del primer uso — lista para arrancar

**Objetivo:** quitar de en medio, en una entrega pequeña y de riesgo casi cero, todo lo que os estorbó en el uso real. Solo PDF, textos, datos de la obra y dos detalles de UI.

**PDF:** fotos numeradas correlativas; quitar "situación de la actuación" bajo las fotos; párrafo de limitación de alcance en vez del texto de contexto; título "INFORME DE VISITA DEL COORDINADOR DE SEGURIDAD Y SALUD"; a la derecha del título "ING. CSS " + empresa del perfil; fuera la referencia R-IGO-SS del pie; etiqueta de sección a "OPS".

**Datos de la obra:** ubicación, plazo de ejecución, presupuesto de ejecución (renombrando el actual), presupuesto del ESS y CIF del contratista, sacados a la cabecera del PDF. Renombrar "situación de la obra" a "Ubicación".

**Compartir y UI:** correos separados por ";"; fuera "+ Nuevo" del menú; botón de borrar en rojo con papelera.

No depende de ninguna decisión pendiente: arranca ya.

## Fase B · Observaciones con estado y color — el rediseño que les gustó

**Objetivo:** adoptar lo bueno del PDF que rediseñasteis con ChatGPT. Cada actividad pasa a ser una observación con título y un estado con color. Es el salto que empieza a dar trazabilidad al informe.

**Dominio:** Actividad pasa a Observacion, con titulo y estado (medida-requerida, observacion-preventiva, subsanado). El tipo invisible de D9 desaparece: lo sustituye estado (misma idea, ahora visible y con el catálogo real). Completitud exige una observación con título más la firma del coordinador; la descripción larga queda opcional.

**Asistente, PDF y promotor:** título y tres botones de estado (el coordinador elige; la app pinta color y etiqueta); bandas de color por estado en el PDF; logo del promotor a la izquierda del título (campo opcional en el promotor).

**Caveat honesto:** sin la Fase C (copiar el informe anterior), el estado "subsanado" casi no se usa; los otros dos aportan solos. Dejamos el campo con los tres, a prueba de futuro.

## Fase C · Partir del informe anterior — DIFERIDA a propósito

**Qué sería:** un botón que crea el borrador de la semana copiando las observaciones (con texto y fotos) del informe anterior, para actualizar su estado. Requiere sacar antes las fotos a un almacén propio, porque copiarlas de semana en semana multiplica lo que ocupa cada informe.

**Por qué se difiere:** es la bola de nieve. Arrastra el hito de persistencia y crece justo cuando necesitamos agilidad. La retomamos con más madurez del producto: al menos un backend, la UI/UX más refinada y aprobada por los stakeholders, y quizá los primeros pasos de la IA. Entonces encaja sin prisa y con la información que hoy no tenemos.

## Por qué rebanado y no todo de una vez

Todo junto sería un PR enorme y arriesgado, mezclando lo fácil con lo difícil y metiendo la persistencia en el camino crítico con main ya en vivo. Rebanado: el alivio sale en días, el riesgo queda aislado, y siempre hay algo funcionando. Entregar pronto y a menudo algo pequeño que funciona, en vez de tardar mucho en algo grande que quizá se rompa.

## Formato de trabajo

Cada fase, como los M(n) de siempre: objetivo, qué toca, cómo guiarte con tu Claude, hecho cuando, trampas. El detalle por hito se baja a este documento al arrancar cada fase. Si ves mejor orden dentro de A o B, dilo — como siempre.
