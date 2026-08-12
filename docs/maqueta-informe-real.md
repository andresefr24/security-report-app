---
title: Maqueta — Cómo son los informes reales (TPF/Getinsa)
type: reference
updated: 2026-08-12
validated: true
tags: [informe, pdf, maqueta, referencia, v2]
---

# Maqueta — Cómo son los informes reales

> **Qué es esto.** Los 8 informes reales que envió el stakeholder **no viven en el repositorio**: llevan nombres, empresas, correos y firmas de personas reales ([[propuesta-informe-estructura-real|propuesta §4b]]). Este documento es su sustituto: describe **la estructura visual** del documento —rótulos, orden, cajas, tipografías— **sin ningún dato personal**. Es la entrada de la **fase 6 (PDF)**.
>
> Los originales están en el equipo de Josune. Todo lo que aparece aquí entre `<corchetes angulares>` es un hueco que rellena la app.

## 1. De dónde sale

8 documentos, de 5 obras distintas, emitidos entre febrero y agosto de 2026 por TPF Ingeniería / TPF Getinsa Euroestudios. Al leerlos aparece algo que no sabíamos: **no hay un formato, hay tres**.

| Formato | Título de cabecera | Código | Cuántos | Para qué |
|---|---|---|---|---|
| **A — Semanal** | INFORME SEMANAL DE VISITAS DE COORDINACIÓN DE S. Y S. | `02_03 G13a-SSFE` | 4 | La visita de la semana en obras lineales (carreteras): varias ubicaciones en un mismo informe. |
| **B — Visita** | INFORME DE VISITA DE COORDINACIÓN DE S. Y S. | `02_03 G13-SSFE` | 3 | La visita puntual a una obra de edificación: observaciones sobre una sola obra. |
| **C — Mensual** | INFORME RESUMEN MENSUAL DE LA COORDINACIÓN DE SEGURIDAD Y SALUD Nº \<n\> | `02_06 G13-SSFE` | 1 | Resumen del mes. **Fuera del alcance de F1** ([[stakeholder-questions#q1-informe-mensual]]). |

**A y B se parecen mucho** (misma banda superior, misma lógica de "texto + fotos con comentario", mismo pie de firmas) pero **no son el mismo documento**: cambian los campos de cabecera y los rótulos de sección. Justo por esto el PDF se genera desde plantilla ([[decisions#d9-informe-v2|D9, afinado 3]]).

## 2. Lo común a todos

### Banda superior (se repite en TODAS las páginas)

Una tabla de 3 celdas con borde negro fino, pegada arriba:

```
┌──────────────┬────────────────────────────────┬──────────────────┐
│  <logotipos> │   INFORME SEMANAL DE VISITAS   │ Formato 02_03    │
│  getinsa/tpf │   DE COORDINACIÓN DE S. Y S.   │ G13a- SSFE       │
│              │        (centrado, negrita)     │ Revisión: 0      │
└──────────────┴────────────────────────────────┴──────────────────┘
```

- Izquierda: los logotipos (unos llevan getinsa-euroestudios + TPF, otros solo TPF).
- Centro: el título en **mayúsculas, negrita, centrado**, en dos líneas.
- Derecha: código de formato y revisión, letra pequeña, alineado a la izquierda de su celda.

### Pie (todas las páginas)

Línea fina de texto pequeño gris/negro: a la izquierda la referencia del documento (`R-IGO-SS-0001 Mod.8 Rev.2`), a la derecha **`<n> de <total>`**. En el formato B a veces solo aparece la numeración.

### Tipografía y color

Arial (o equivalente de palo seco) en todo el documento. **Sin color**: negro sobre blanco, salvo algún rótulo puntual resaltado en **amarillo** y las marcas rojas dibujadas encima de las fotos (ver §6). Los rótulos de sección van en **mayúsculas + negrita**, muchas veces **subrayados**, y encerrados en una caja de borde fino que ocupa el ancho de la página.

### Las fotos

- Van **centradas**, con un borde fino o sin él, ocupando entre media página y el ancho completo.
- **En los informes reales van casi siempre una por fila** (por eso ocupan 3 páginas para 3 fotos). El stakeholder ha pedido expresamente **2 por fila** para ahorrar hojas: eso es una **mejora deliberada nuestra**, no una copia (§6).
- Debajo de la foto, su **comentario**: centrado o justificado, **en negrita**, a veces subrayando la parte importante. Puede ocupar varios párrafos. **Muchas fotos no llevan comentario.**

## 3. Formato A — Semanal (el que calcamos primero)

### Tabla de cabecera

Fondo gris muy claro, sin bordes visibles, rótulo a la izquierda y valor en **negrita**:

```
Obra:                      <nombre largo de la obra, MAYÚSCULAS, varias líneas>
Entidad Promotora:         <promotor>
Contratista:               <contratista>
Identificación Documento:  <ref>              Fecha:            <dd/mm/aaaa>
Tipo Documento:            INFORMATIVO        Nº. Pág.:         <total>
Emisor:    <coordinador>   Empresa:           <empresa del coordinador>
Receptor:  <receptor>      Empresa/Entidad:   <empresa del receptor>
```

Variantes vistas: el rótulo es `Entidad Promotora:` o `Promotor:`; `Tipo Documento`/`Nº. Pág.` faltan en alguno; `Identificación Documento` unas veces es un código de calidad (`R-IGO-SS-0001 Mod.08 Rev.2`) y otras un correlativo por fecha (`20260723/54`).

### Cuerpo

Después de la cabecera, **una frase de contexto** de plantilla, por ejemplo: *"Después de realizar la visita de coordinación en materia de seguridad y salud en fecha \<fecha en letra\> para regular las prácticas y acciones para la seguridad en la obra, se definen las acciones observadas."*

Luego, en este orden:

**1) Calendario de la semana** — caja con el rótulo `CALENDARIO DE VISITAS Y TRABAJOS EN EJECUCIÓN`, y dentro:

```
Semana <03 al 07 de agosto de 2026>, los servicios y la situación de la zona ha sido la sig.:
┌────────────┬──────────────────────────────────────────────────────┐
│ 06/08/2026 │ <trabajo realizado ese día>                          │
└────────────┴──────────────────────────────────────────────────────┘
```

Es una **minitabla de fecha → trabajo**, con una fila por día visitado (de una a cuatro filas). A veces la celda de la derecha es una lista con guiones.

**2) Bloques de actividad, repetidos** — cada uno abre con una caja de rótulos subrayados:

```
┌──────────────────────────────────────────────────────────────────┐
│ SITUACIÓN DE LA ACTUACIÓN: <ubicación: (M-300) PK 31+400 – ZONA> │
│ DESCRIPCIÓN DE LA ACTIVIDAD: <qué se está haciendo>              │
└──────────────────────────────────────────────────────────────────┘
        <fotos con su comentario en negrita debajo>
```

El primer rótulo aparece también como `SITUACIÓN DE LA OBRA:`. La segunda línea (`DESCRIPCIÓN DE LA ACTIVIDAD`) **no siempre está**: en varios informes la caja lleva solo la ubicación y el texto descriptivo va suelto debajo, antes de las fotos. **Este bloque se repite tantas veces como ubicaciones/actividades tenga la visita** — es la pieza que se multiplica.

**3) Observaciones finales** (opcional) — caja `OBSERVACIONES/ INSTRUCCIONES DEL CSS:` con una lista de viñetas: la instrucción y la norma que la respalda.

**4) Firma y distribución** (última página) — ver §5.

## 4. Formato B — Visita puntual

Cambia la cabecera y los rótulos; el resto es igual.

```
Código Servicio:      <código>
Denominación Obra:    <nombre de la obra>
Ubicación Obra:       <calle o emplazamiento>
CSSFE:                <coordinador>          Fecha:  <dd/mm/aaaa>
```

Debajo, **un párrafo legal fijo** (siempre el mismo, es plantilla pura): la visita se hace *"en cumplimiento de lo indicado en el artículo 9 del Real Decreto 1627/97"*, se detallan las observaciones que deberá tratar el Recurso Preventivo o el jefe de Obra, etc.

Luego una caja con el **estado de la obra**: `ESTADO EN EL QUE SE ENCUENTRA LA OBRA Y TRABAJOS QUE SE ESTÁN REALIZANDO SEGÚN PROGRAMACIÓN SEMANA N.º <27> (del <29/06> al <03/07/2026>):`

Y a partir de ahí, **bloques con rótulo propio**, cada uno con su texto y sus fotos. Los rótulos que aparecen en los informes reales:

| Rótulo | Qué es |
|---|---|
| `OBSERVACIONES PREVENTIVAS DE SEGURIDAD (OPS):` | Lo detectado en la visita. Puede llevar `SUBSANADO (ver pág. sig.)` añadido al rótulo. |
| `Medidas Correctoras:` / `Charla del CSS:` | Subapartados **dentro** del texto de una OPS, en la misma línea. |
| `NOTA POSITIVA DEL CSS:` | Lo que se está haciendo bien. |
| `PENDIENTE DESDE ÚLTIMA VISITA DEL CSS A LA OBRA:` | Lo que sigue sin resolverse. |
| `INSTRUCCIONES DE SEGURIDAD, COMPORTAMIENTOS SEGUROS DE OBLIGADO CUMPLIMIENTO:` | Rótulo **resaltado en amarillo**. |
| `OBSERVACIONES/ INSTRUCCIONES DEL CSS` | Igual que en el formato A. |

Dentro del texto se usa mucho la **negrita + subrayado** para señalar lo grave (*"genera un riesgo intolerable de accidente"*) y las comillas para citar la señal o la norma.

## 5. El bloque de firmas

En el formato B, al final de la última página, una **tabla de dos columnas con borde**:

```
┌───────────────────────────────┬───────────────────────────────┐
│ Informe realizado por:        │ Recibido por:                 │
│ CSS-FE                        │                               │
│      <imagen de la firma>     │                               │
│  Fdo. ITOP <nombre>           │   Fdo: <nombre>               │
│  Coordinador de Seguridad y   │   <empresa>                   │
│  Salud - IRSST <número>       │                               │
│  <empresa del coordinador>    │                               │
└───────────────────────────────┴───────────────────────────────┘
```

- La izquierda lleva **la firma dibujada** del coordinador y, debajo, tres líneas centradas en letra pequeña: nombre con titulación, cargo **con el nº IRSST**, y empresa. Confirma lo que ya modelamos en M1.
- La derecha, en los informes vistos, lleva **solo el nombre y la empresa mecanografiados**, sin trazo de firma.
- En el **formato A no hay tabla**: la firma va suelta, alineada a la izquierda (`Fdo: <nombre>` / `<cargo>` / `<empresa>`), y el receptor aparece únicamente **en la cabecera**, sin firmar.

Debajo, la **lista de distribución**:

```
Enviado por e-mail a:
 • <nombre>, <cargo>.
   <correo>
 Contratista: <contratista>.
```

## 6. Lo que hacemos distinto a propósito

| Del informe real | Qué haremos | Por qué |
|---|---|---|
| 1 foto por fila | **2 fotos por fila** | Lo pidió el stakeholder: ocupa la mitad de hojas. |
| Círculos y flechas rojas dibujados sobre la foto | **No se hace** | Se dibujan a mano en el ordenador. Fuera del alcance de F1; anotarlo como idea futura. |
| Nº de documento tecleado a mano | **Se genera** a partir de la fecha | Ya acordado en la propuesta §5. |
| Cada informe con su plantilla | **Formato A primero**, con los rótulos y el orden en config | Es el más frecuente (4 de 8) y el que encaja con el modelo v2. |

## 7. Preguntas que abre esta lectura

Recogidas para decidir antes de las fases 3 y 6 — ver el hilo con Josune del 2026-08-12:

1. **La "situación" no es única del informe: se repite por actividad.** En el modelo v2 el informe tiene una `situacion` y las actividades solo `descripcion`. En los informes reales, cada bloque abre con `SITUACIÓN DE LA ACTUACIÓN: <ubicación>` y opcionalmente `DESCRIPCIÓN DE LA ACTIVIDAD: <texto>`. Es decir, **la ubicación es un campo de la actividad**.
2. **Los tipos de bloque son más de dos.** El afinado 1 propone `normal | incidencia`; la realidad usa OPS, nota positiva, pendiente de visita anterior, instrucción obligatoria…
3. **La lista de distribución se imprime en el PDF** ("Enviado por e-mail a"). El dominio ya tiene destinatarios en la obra; falta decidir si entran en la fase 6.
4. **Campos de cabecera que la app no captura:** identificación de documento, tipo (`INFORMATIVO`), código de servicio, ubicación de la obra.
5. **El emisor no siempre es la misma persona** (hay tres coordinadores distintos entre los 8). No afecta a F1 (un solo operador), pero el PDF debe tomar el emisor del perfil, nunca fijarlo.
