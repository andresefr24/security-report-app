# Propuesta — Enviar el informe a los destinatarios

**Para:** Andrés (revisión de arquitectura).
**De:** Josune.
**Fecha:** 2026-10-08.
**Estado:** propuesta. No hay código escrito; esto es para decidir antes de construir.

---

## 1. Qué piden

los coordinadores piloto quieren **enviar el informe desde la app** a los 6-8 destinatarios de la
obra, desde el móvil o desde el ordenador. Hoy la lista de correos está guardada en la obra
y sale impresa en el documento ("Enviado por e-mail a:"), pero el envío lo hacen a mano:
descargan el PDF, abren su correo, lo adjuntan y escriben los destinatarios uno a uno.

## 2. Por qué no se puede resolver en el cliente

No es una limitación de cómo está hecha la app. Son dos muros del estándar:

- **`mailto:` no admite adjuntos** (ya estaba anotado en `gotchas.md#g2-mailto-no-attach`).
  Puede llevar destinatarios, asunto y cuerpo, pero no el archivo.
- **La Web Share API no tiene campo de destinatarios.** Lleva el archivo al selector del
  sistema, pero no puede decir a quién va.

Es decir: se puede mandar el PDF sin saber a quién, o decir a quién sin mandar el PDF.
Nunca las dos. **Enviar de verdad exige un tercero que lo haga por nosotros**, y eso toca
dos decisiones que son tuyas: `D1 — Local-only PWA` y `D4 — share-based delivery`.

Josune ya ha dado el visto bueno de producto a cruzar esa línea ("así sea conectarlo a un
servidor o a un servicio de correo"). Lo que queda es decidir **cómo**, y hay tres
preguntas que pesan más que la elección de proveedor.

## 3. Las tres decisiones de fondo

### 3.1 ¿De quién llega el correo?

Es la más importante y la que no es técnica. Un informe de coordinación es un documento con
valor legal que el destinatario archiva. No es lo mismo recibirlo de
la dirección corporativa del propio coordinador que de un `informes@nuestra-app.com`.

| | A favor | En contra |
|---|---|---|
| **Remitente propio de la app** | Simple: una clave de API y listo. | Parece un aviso automático; más probable que acabe en spam; el destinatario no puede responder al coordinador; su empresa pierde el rastro del envío (no queda en "Enviados"). |
| **La cuenta del coordinador** (OAuth con Google/Microsoft) | Llega de su dirección real, queda en sus "Enviados", pueden responderle. Es lo que ya hacen hoy a mano. | Más trabajo: flujo OAuth, consentimiento, renovación de tokens, y la empresa del coordinador tendría que autorizar la app en su tenant. |

Variante intermedia: remitente propio pero con **`Reply-To` del coordinador** y su nombre en
el `From` ("Ana García (vía Informes SyS)"). Resuelve el "poder responder", no resuelve
el "queda en mis enviados" ni del todo el spam.

**Lo que no sabemos y conviene preguntar a los coordinadores piloto:** si el destinatario necesita
que conste que lo envió el coordinador desde su cuenta corporativa. Si la respuesta es sí,
el OAuth deja de ser un lujo.

### 3.2 ¿Adjunto o enlace?

Es lo que decide si necesitamos almacenar el PDF en algún sitio o no, y es donde está el
límite técnico duro.

**El dato:** una función serverless de Vercel **acepta como mucho 4,5 MB de cuerpo de
petición**. No es configurable: el límite está en la infraestructura, y por encima devuelve
`FUNCTION_PAYLOAD_TOO_LARGE`
([doc](https://vercel.com/docs/error/application/FUNCTION_PAYLOAD_TOO_LARGE)).

Nuestras fotos se comprimen a **~1 MB como objetivo** (`comprimir-foto.ts`). **Lo hemos
medido**, generando PDF reales con el adaptador de pdfmake y fotos de ese peso (al enviarlo,
base64 infla un tercio más):

| Fotos | PDF | Al enviarlo | |
|---|---|---|---|
| 2 | 1,98 MB | 2,63 MB | cabe |
| 4 | 3,93 MB | 5,24 MB | **no cabe** |
| 6 | 5,89 MB | 7,85 MB | **no cabe** |
| 8 | 7,84 MB | 10,45 MB | **no cabe** |

**A partir de cuatro fotos el informe no se puede enviar por la vía directa**, y cuatro
fotos es un informe normal suyo.

Ahora, la misma tabla aligerando las fotos **a 300 KB solo para la copia que se envía**:

| Fotos | PDF | Al enviarlo | |
|---|---|---|---|
| 4 | 1,20 MB | 1,60 MB | cabe |
| 8 | 2,37 MB | 3,17 MB | cabe |

Con ocho fotos se queda en 3,17 MB, por debajo del límite y con margen. Tres salidas:

1. **Adelgazar el PDF que se envía**: generar la copia de correo con las fotos a menor
   calidad (~300 KB). Un informe de ocho fotos cabría de sobra. El PDF que descargan para su
   archivo puede seguir siendo el bueno.
2. **Subida directa a almacenamiento** (Vercel Blob y similares): el navegador sube el PDF
   directamente, la función solo firma el permiso. Esquiva el límite, pero **el PDF queda
   almacenado** en un tercero.
3. **Enviar un enlace en vez del archivo**: resuelve el tamaño y no llena buzones, pero el
   PDF tiene que vivir en algún sitio y con un enlace que caduque; y muchos organismos
   bloquean enlaces en el correo. Para un documento que archivan como evidencia, el adjunto
   es lo que esperan.

**Lo que dice la medición: la opción 1 basta.** Aligerando las fotos de la copia que viaja
por correo, un informe de ocho fotos cabe de sobra; y nos ahorramos el almacenamiento
entero, con él media conversación de protección de datos, y que el PDF quede en reposo en
ningún sitio. Queda por comprobar una cosa: que a 300 KB **las fotos sigan sirviendo como
evidencia** —en sus informes se aprecia una barandilla sin rodapié o un arnés sin anclar— y
eso lo tienen que decir los coordinadores piloto mirando una, no nosotros.

(La medición se hizo con imágenes de ruido, que es el peor caso: no comprimen nada. Con
fotos reales de obra el PDF pesará algo menos.)

### 3.3 ¿Qué ve el tercero, y bajo qué condiciones?

El PDF lleva **nombres y apellidos, números de registro profesional, firmas manuscritas y
fotografías de obra en las que se reconoce a trabajadores**. Al enviarlo desde un servicio
de correo, ese servicio pasa a tratar datos personales por cuenta de la empresa del coordinador.

Lo que habría que fijar, y no es negociable por comodidad:

- **El proveedor es encargado del tratamiento**: hace falta contrato (DPA) y conviene exigir
  **residencia de los datos en la UE**.
- **La clave de API nunca en el cliente.** Es el mismo problema que ya anotamos para OpenAI
  (`gotchas.md#g1-openai-key-client`): cualquiera puede leerla desde el navegador. Vive en
  la función, como variable de entorno.
- **Propuesta de diseño: no almacenar nada.** Que la función reciba el PDF, se lo pase al
  proveedor y lo olvide; sin copia en nuestro lado, sin base de datos. Cuanto menos guardemos,
  menos tenemos que proteger. (Ojo: esto choca con la salida 2 del punto anterior. Es otra
  razón para intentar que el PDF quepa.)

## 4. Qué cambia en la arquitectura

Poco, si se hace por donde toca:

- **Un puerto nuevo en el dominio**, `EnvioPort` (`enviar(pdf, destinatarios, asunto)`), con
  su fake en memoria. El dominio no se entera de que hay red.
- **Un adaptador en infraestructura** que llama a nuestra función. Cambiar de proveedor =
  cambiar el adaptador.
- **Una función serverless** en el mismo despliegue de Vercel que ya tenemos (hito MI). Es
  el primer trozo de servidor del proyecto: deja de ser cierto que la app es *local-only*, y
  `D1` y `D4` habría que redactarlas de nuevo.
- **Nada del informe cambia de forma** salvo lo del punto siguiente.

Dos apuntes de operación que no son nuestros pero conviene no descubrir tarde: el plan de
Vercel en el que está desplegado (si es Hobby, su licencia no cubre uso comercial), y quién
paga la cuenta del proveedor de correo.

## 5. Trazabilidad: hay que dejar constancia del envío

Si la app envía, la app tiene que poder demostrar que envió. Propongo guardar en el informe
un registro de envíos:

```
envios?: { fecha: string; destinatarios: string[]; estado: "enviado" | "falló" }[]
```

Campo opcional nuevo, sin escalón de migración, y la pantalla de entrega muestra "Enviado el
25/08/2026 a 7 destinatarios". Sin esto, el coordinador no sabe si lo mandó, y volverá a
enviarlo por si acaso.

**Lo que no cubre:** que el correo *llegue*. Un acuse de entrega real exige leer los webhooks
del proveedor, y eso sí necesitaría guardar estado. Propongo dejarlo fuera de esta fase y
que la app sea honesta: "enviado" significa "entregado al servicio de correo", no "leído".

## 6. Sin cobertura, que es como trabajan

Media app está pensada para funcionar sin red; esto no puede. En obra hay sitios sin
cobertura, y el momento natural de enviar es al terminar la visita, allí mismo.

- **Safari no implementa Background Sync**, así que no podemos prometer "se enviará solo
  cuando vuelvas a tener cobertura" en iPhone.
- Lo honesto: si no hay red, decirlo y dejar el envío **pendiente en el informe**, con un
  botón de reintentar visible al abrir la app. Nunca un "enviado" que no sea verdad.

## 7. Recomendación

Por fases, y midiendo antes de comprometernos:

1. **Enseñarles una foto a 300 KB** y que confirmen que se sigue viendo lo que tiene que
   verse. Es lo único que puede tirar abajo el plan.
2. **Función serverless en Vercel + proveedor de correo con residencia UE**, remitente propio
   con `Reply-To` del coordinador, **adjunto** (adelgazando las fotos de la copia que se
   envía si hace falta) y **sin almacenar nada**. Registro de envíos en el informe.
3. **OAuth con la cuenta del coordinador** como fase siguiente, *si* al preguntarles resulta
   que necesitan que salga de su dirección corporativa.

## 8. Lo que te pedimos decidir

1. ¿Damos por buena la línea: la app deja de ser estrictamente local y aparece un primer
   trozo de servidor? Si sí, hay que reescribir `D1` y `D4`.
2. ¿Remitente propio con `Reply-To`, o vamos directamente a OAuth con su cuenta?
3. ¿Adjunto adelgazado (sin almacenar) o almacenamiento + enlace?
4. ¿El registro de envíos en el informe te parece el sitio, o lo quieres fuera (sería el
   primer dato que no es del informe y tendría su propio repositorio)?
5. ¿Proveedor de correo con alguna preferencia, o lo elegimos por residencia UE y precio?
