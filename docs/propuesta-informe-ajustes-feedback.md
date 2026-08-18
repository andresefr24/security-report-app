---
title: Propuesta — Ajustes del informe tras el primer uso real (feedback de Nicolás y Miren)
type: proposal
updated: 2026-08-18
validated: false
tags: [informe, propuesta, revisión, feedback, pdf]
---

# Propuesta de ajustes — Feedback del primer uso real

> **Para revisión de Andrés antes de escribir código.** Nicolás y Miren —los dos coordinadores, usuarios finales— han **usado la app de verdad y generado un informe real** de la obra CPD-SEGIPSA (Las Rozas). De ahí salen 15 peticiones. No se toca código hasta el OK. Rama: `feat/informe-ajustes-feedback`.
>
> Es el feedback más valioso que hemos tenido: ya no es "qué os parecería", es "esto me ha estorbado hoy".

## 1. Contexto y documentos

Cuatro documentos de referencia, **fuera del repositorio** (llevan datos de obras, personas y correos reales); están en el equipo de Josune:

| Documento | Qué es |
|---|---|
| `Informe CPD-SEGIPSA … (1).pdf` | **El que generó nuestra app** en la visita del 16/08/2026. |
| `Informe CPD-SEGIPSA … (2).pdf` | **El (1) pasado por ChatGPT y rediseñado.** Les ha gustado mucho más. |
| `20260722_…Los Molinos.pdf` y `20260805_…Los Molinos.pdf` | Dos visitas seguidas a la misma obra: el ejemplo de lo que piden en el punto 10. |
| `Punto 14.jpeg` | Nota manuscrita con los datos de obra que faltan. |

Lo esencial de su maqueta queda recogido, sin datos personales, en [[maqueta-informe-real]] (se ampliará con la versión nueva).

## 2. El feedback, tal cual llegó

1. Siempre pone foto 1 aunque sea foto 2 o 3. En el informe no presenta la numeración. Conviene enumerar las fotos para que salgan enumeradas.
2. No aparece el plazo de ejecución de la obra.
3. Sustituir el texto "Después de realizar la visita de coordinación…" por el párrafo de limitación de alcance (recogido en §4).
4. Quitar en las fotos: "situación de la actuación".
5. Sustituir "Descripción de la actividad" por **Observación Preventiva de Seguridad (OPS)**. Sustituir el título por **INFORME DE VISITA DEL COORDINADOR DE SEGURIDAD Y SALUD**.
6. Quitar abajo a la izquierda donde dice `R-IGO-SS-0001…`.
7. Al hacer el informe no pidió el logotipo.
8. A ambos lados del título: a la izquierda "PROMOTOR", a la derecha "ING. CSS MTXU/NJMP".
9. Listado de correos separados por `;`, no de forma individual.
10. Utilizar en la siguiente semana la plantilla del informe de la semana anterior.
11. Quitar del menú el "+ Nuevo".
12. En Promotor, poder poner logo si existe (no obligatorio).
13. Mejorar el botón de borrar informe con algo alusivo a rojo o una papelera roja.
14. Agregar ubicación de la obra en datos. Donde dice "situación de la obra" es **ubicación**.
15. Sistema de colores como en el informe mejorado por ChatGPT.

## 3. Qué implica de verdad (lo que la lista no dice)

El punto 15 **no es un retoque de color: es adoptar otro documento**. Al leer el PDF mejorado aparecen dos cosas que no están en la lista y que sí cambian el modelo:

- **Cada actividad pasa a ser una "OBSERVACIÓN N" con título propio y una etiqueta de estado de color.** Hoy la actividad solo tiene descripción; ahí lleva un titular corto ("Grupo electrógeno sin medios de extinción cercanos") separado del texto largo.
- **La misma observación aparece dos veces**: primero el hallazgo (`MEDIDA REQUERIDA`) y después, más abajo, otra vez con `SUBSANADO` y la foto de que se resolvió. Es decir, la observación tiene **estado**, y el estado cambia a lo largo del tiempo. Eso encaja directamente con el punto 10.

Los tres estados, con sus colores:

| Estado | Color | Cuándo |
|---|---|---|
| `MEDIDA REQUERIDA` | ámbar | Hay que corregir algo. |
| `OBSERVACIÓN PREVENTIVA` | ámbar | Aviso, sin incumplimiento. |
| `SUBSANADO` | verde | Ya resuelto (normalmente, algo que venía de la visita anterior). |

Y la nota manuscrita (punto 14) pide **más datos de los que dice el punto 2**: plazo de ejecución (18 meses), presupuesto de ejecución, presupuesto del material del Estudio de Seguridad y Salud, fecha de inicio y fin, CIF del contratista y la dirección de la obra.

## 4. Decisiones ya acordadas con Josune

| # | Pregunta | Decisión |
|---|---|---|
| 1 | Título del documento | **INFORME DE VISITA DEL COORDINADOR DE SEGURIDAD Y SALUD** (singular "visita"). |
| 2 | Los lados del título | Izquierda: **logotipo del promotor** (imagen, opcional, se sube en la ficha del promotor). Derecha: **texto** "ING. CSS " + la empresa del perfil del coordinador (hoy `MTXU/NJMP`), nunca fijado en la plantilla. |
| 3 | Numeración de fotos | **Correlativa en todo el informe**: Foto 1, 2, 3… sin reiniciar por observación. |
| 4 | Estados | Exactamente esos **tres**. Los elige el coordinador con **tres botones** en el asistente; la etiqueta y el color los pinta la app (no se teclean). |
| 5 | Informe de la semana siguiente | Se copian **todas** las observaciones, con su texto y sus fotos. |
| 6 | Datos nuevos | Entran **todos**: plazo de ejecución, presupuesto, presupuesto del ESS, CIF del contratista y fechas de inicio/fin. |
| 7 | "Situación de la actuación" | Se **renombra a "Ubicación"**, no se elimina el campo. |
| 8 | Bloque "Formato 02_03 / G13a-SSFE / Revisión 0" | **Se mantiene** (el documento de ChatGPT lo quita; nosotros no, de momento). |
| 9 | Menú | Fuera "+ Nuevo"; quedan **Obras · Promotores · Perfil**. Las obras se crean desde la pantalla de Obras. |
| 10 | Alcance del rediseño | **Sustituye** al PDF actual: se conserva lo bueno de nuestro informe y se integran las mejoras del de ChatGPT. |

El **párrafo nuevo** que sustituye a la frase de contexto (punto 3), literal:

> Las observaciones recogidas en el presente informe se limitan a las condiciones y situaciones detectadas durante la visita realizada, por lo que no tienen carácter exhaustivo. La ausencia de referencia a otras posibles deficiencias no implica su inexistencia ni exime a las empresas intervinientes del cumplimiento de la normativa vigente en materia de seguridad y salud, así como de las medidas preventivas establecidas en el Plan de Seguridad y Salud y demás documentación preventiva aplicable.

## 5. Lo que NO copiamos del documento de ChatGPT, y por qué

- **Una foto por fila.** Su documento las pone sueltas y grandes; nosotros **mantenemos dos por fila**, porque ahorrar hojas fue una petición expresa suya hace dos semanas y sigue en pie. Con la numeración correlativa se sigue entendiendo igual.
- **El bloque de formato y revisión** de la esquina superior derecha: ellos lo quitan, nosotros lo mantenemos (decisión 8).
- **Los estados no se deducen del texto.** Se pidió que fueran "automáticos"; lo que se automatiza es la etiqueta y el color, pero **quién decide el estado es el coordinador**: adivinarlo leyendo la descripción acertaría a veces, y en un documento con valor legal un estado equivocado es peor que no tenerlo.

## 6. Impacto por capa

### Dominio (`domain/informe/`)
- **`Actividad` pasa a llamarse `Observacion`** y gana dos campos: **`titulo`** (el encabezado corto) y **`estado`** (`medida-requerida | observacion-preventiva | subsanado`). El campo `tipo` (`normal|incidencia`), que D9 dejó invisible "para el futuro", **desaparece: lo sustituye `estado`**, que es lo mismo pero visible y con el catálogo real.
- **Completitud**: finalizar pasaría a exigir **al menos una observación con título** (hoy exige "con descripción"), más la firma del coordinador. La descripción larga queda opcional. ⚠️ Ver §7.

### Obra (`domain/proyecto/`)
- Nuevos: **`ubicacion?`** (la dirección — punto 14), **`plazoEjecucion?`**, **`presupuestoEss?`**, **`cifContratista?`**.
- `fechaInicio`, `fechaFin` y `presupuesto` **ya existen**: solo hay que sacarlos a la cabecera del PDF. Conviene renombrar `presupuesto` → `presupuestoEjecucion` para que no se confunda con el del ESS.
- El PDF deja de imprimir "SITUACIÓN DE LA OBRA" con un texto tecleado en el informe: pasa a ser **"Ubicación", tomada de la obra**.

### Promotor (`domain/promotor/`)
- **`logo?`** opcional (imagen reducida, como las fotos). Es lo que va a la izquierda del título del PDF y responde a los puntos 7 y 12.

### Asistente (`ui/pages/informe/`)
- El paso "Situación y actividades" pasa a **"Observaciones"**: cada bloque gana **título** y los **tres botones de estado**.
- Nuevo botón en la obra: **"Partir del informe anterior"** (punto 10) → crea el borrador copiando las observaciones del último informe de esa obra.

### PDF (`infrastructure/pdf/`)
- Plantilla nueva: título nuevo, banda con el logotipo del promotor y el texto del CSS, tabla de cabecera con etiquetas destacadas y los campos nuevos, párrafo de limitación de alcance, bandas de sección, **`OBSERVACIÓN N` + título + etiqueta de estado de color**, "Ubicación:", fotos numeradas correlativas, correos separados por `;` y **fuera la referencia del pie**.
- La plantilla parametrizable de la vuelta anterior **aguanta el golpe**: cambian los rótulos y se añaden bloques nuevos (banda de color, etiqueta de estado), no se reescribe el programa. Es exactamente para lo que Andrés pidió el afinado 3.

### Navegación y detalles
- Fuera el **"+ Nuevo"** de la barra (punto 11).
- El botón de borrar borrador, en **rojo y con papelera** (punto 13).

## 7. ⚠️ Choques con decisiones ya tomadas — para Andrés

1. **La observación necesita título.** En la vuelta anterior decidimos expresamente *"cada actividad lleva solo descripción, sin título"* (decisión 4, ratificada en [[decisions#d9-informe-v2]]) porque los informes reales de entonces no lo tenían. El documento que ahora quieren adoptar sí lo lleva, y es lo que encabeza cada bloque.
2. **`tipo` invisible → `estado` visible.** El afinado 1 de D9 guardaba `normal|incidencia` "sin complicar la pantalla, para no perder la señal". Los usuarios piden justo lo contrario: que la señal se vea, con colores. La intención de D9 se cumple igual (mejor, incluso: el catálogo es el real), pero el campo cambia de nombre y de valores.
3. **La regla de finalizar se mueve otra vez.** Acabas de ratificar "una actividad **descrita** + firma". Si el título es lo que encabeza el bloque en el PDF, lo coherente es exigir **título** y dejar la descripción opcional. Es un cambio pequeño pero toca `completitud.ts` y la doc que actualizaste en `f241040`.
4. **Duplicar fotos al copiar el informe anterior** (punto 10) multiplica lo que ocupa cada informe, porque hoy las imágenes viajan en base64 dentro del documento. No lo bloquea, pero es **un argumento más para el hito de persistencia** (`MediaStore`, afinado 4): conviene decidir si ese hito se adelanta.

## 8. Lo que NO cambia

Perfil del coordinador, alta de promotores (salvo el logo) y de obras (salvo los campos nuevos), la mecánica de generar el PDF con pdfmake y compartir, el offline, el despliegue en Vercel y toda la arquitectura hexagonal. El modelo v2 (situación + observaciones con fotos) se mantiene: esto lo afina, no lo tumba.

## 9. Riesgos

- **Es el segundo rediseño del PDF en dos semanas.** Se sostiene porque la plantilla ya está parametrizada, pero el adaptador de pdfmake sí se toca a fondo (bandas de color, etiquetas de estado, logotipo).
- **Cuota de almacenamiento**: copiar el informe anterior con sus fotos duplica el peso en el dispositivo. Ver §7.4.
- **Arrastrar de más**: al copiar todas las observaciones, el informe nuevo empieza con cosas ya resueltas. Se mitiga porque se pueden borrar una a una, pero conviene mirarlo cuando lo usen.

## 10. Fases propuestas (cuando Andrés apruebe)

| # | Fase | Qué toca |
|---|---|---|
| 1 | **KB** | Este documento + ampliar [[maqueta-informe-real]] con la maqueta nueva. Sin código. |
| 2 | **Datos** | Campos nuevos de obra (ubicación, plazo, presupuestos, CIF) y logo del promotor. |
| 3 | **Dominio** | `Actividad` → `Observacion` con `titulo` y `estado`; fuera `tipo`; completitud. |
| 4 | **Asistente** | Título y los tres botones de estado; numeración de fotos. |
| 5 | **Retoques de UI** | Fuera el "+ Nuevo" del menú; botón de borrar en rojo con papelera. |
| 6 | **PDF** | La maqueta nueva completa. La fase más grande. |
| 7 | **Partir del informe anterior** | Caso de uso y botón en la obra. |
| 8 | **Flujo completo** | e2e y tests de flujo al camino nuevo. |

---

**¿Visto bueno, Andrés?** Nos interesa sobre todo tu lectura del §7: son tres decisiones tuyas que este feedback mueve, y la cuarta es si adelantamos el hito de persistencia.
