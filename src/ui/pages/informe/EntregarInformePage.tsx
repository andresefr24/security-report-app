// Pantalla de entrega del informe: cerrar, ver el PDF y compartirlo.
//
// Es donde acaba el wizard. Al llegar: intenta finalizar el informe (si falta
// algo, lo dice y deja volver a arreglarlo), genera el PDF y lo muestra.
//
// IMPORTANTE (gotchas#g2): la app NO envía correos — `mailto:` no puede adjuntar
// archivos. Los destinatarios de la obra se muestran para tenerlos a mano; el
// envío lo hace el coordinador compartiendo el archivo o descargándolo.
//
// Usa el SharePort directamente: compartir no tiene nada que orquestar (es una
// llamada al puerto), así que un caso de uso alrededor sería un envoltorio vacío.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type FinalizarInforme } from "@/application/use-cases/finalizar-informe";
import {
  FALTA_EL_PERFIL,
  type GenerarPdfDelInforme,
} from "@/application/use-cases/generar-pdf-del-informe";
import { type SharePort } from "@/domain/ports/share-port";
import { type Proyecto } from "@/domain/proyecto/proyecto";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { ETIQUETAS_ROL } from "@/ui/pages/obra-campos";

interface PdfListo {
  blob: Blob;
  nombre: string;
  url: string;
}

export interface EntregarInformePageProps {
  finalizarInforme: FinalizarInforme;
  generarPdfDelInforme: GenerarPdfDelInforme;
  compartir: SharePort;
}

export function EntregarInformePage({
  finalizarInforme,
  generarPdfDelInforme,
  compartir,
}: EntregarInformePageProps) {
  const { id } = useParams<{ id: string }>();
  const navegar = useNavigate();

  const [trabajando, setTrabajando] = useState(true);
  const [problemas, setProblemas] = useState<string[]>([]);
  const [incompleto, setIncompleto] = useState(false);
  const [pdf, setPdf] = useState<PdfListo | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  // Cerrar y generar tiene efecto: que no se lance dos veces (StrictMode).
  const yaLanzado = useRef(false);

  useEffect(() => {
    if (!id || yaLanzado.current) return;
    yaLanzado.current = true;

    (async () => {
      try {
        const cierre = await finalizarInforme.ejecutar(id);
        if (!cierre.ok) {
          setProblemas(cierre.errores);
          setIncompleto(true);
          return;
        }

        const generado = await generarPdfDelInforme.ejecutar(id);
        if (!generado.ok) {
          setProblemas(generado.errores);
          return;
        }

        setPdf({
          blob: generado.valor.pdf,
          nombre: generado.valor.nombreArchivo,
          url: URL.createObjectURL(generado.valor.pdf),
        });
        setProyecto(generado.valor.proyecto);
      } catch (error) {
        // Si algo revienta (p. ej. la librería del PDF), lo decimos en vez de
        // dejar la pantalla esperando para siempre.
        console.error("No se pudo preparar el informe:", error);
        setProblemas(["No se pudo preparar el informe. Inténtalo de nuevo."]);
      } finally {
        // Pase lo que pase, dejamos de "estar trabajando".
        setTrabajando(false);
      }
    })();
  }, [id, finalizarInforme, generarPdfDelInforme]);

  // Liberamos la memoria del PDF al salir de la pantalla.
  useEffect(() => {
    return () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    };
  }, [pdf]);

  async function alCompartir() {
    if (!pdf) return;
    setAviso(null);
    const resultado = await compartir.compartir(pdf.blob, pdf.nombre);
    if (resultado.tipo === "descargado") {
      setAviso("No se pudo compartir, así que se ha descargado el archivo.");
    }
  }

  if (trabajando) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-[18px] text-muted-foreground">Preparando el informe…</p>
      </main>
    );
  }

  // Falta algo para poder cerrar: se lo decimos y le dejamos volver a arreglarlo.
  if (incompleto) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <h1 className="text-[28px] font-semibold text-foreground">Aún no se puede cerrar</h1>
        <Card className="space-y-2 p-5">
          {problemas.map((problema) => (
            <p key={problema} className="text-[18px]">
              {problema}
            </p>
          ))}
        </Card>
        <Button
          onClick={() => navegar(`/informes/${id}`)}
          className="h-[52px] w-full text-[18px]"
        >
          Volver al informe
        </Button>
      </main>
    );
  }

  if (!pdf) {
    // Si lo que falta es el perfil, no basta con decirlo: hay que llevarle allí
    // (design-system: nunca una pantalla sin salida).
    const faltaElPerfil = problemas.includes(FALTA_EL_PERFIL);
    return (
      <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <p className="text-[18px] text-destructive" role="alert">
          {problemas.join(" ")}
        </p>
        {faltaElPerfil && (
          <Button onClick={() => navegar("/perfil")} className="h-[52px] w-full text-[18px]">
            Ir a mi perfil
          </Button>
        )}
        <Button
          variant={faltaElPerfil ? "secondary" : "default"}
          onClick={() => navegar("/obras")}
          className="h-[52px] w-full text-[18px]"
        >
          Volver a las obras
        </Button>
      </main>
    );
  }

  const destinatarios = proyecto?.listaDistribucion ?? [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-[28px] font-semibold text-foreground">Informe listo</h1>
        <p className="text-[18px] text-muted-foreground">
          El informe queda cerrado y guardado. Revísalo y compártelo.
        </p>
      </header>

      {/* Vista previa. Si el navegador no sabe mostrarla (pasa en iOS), los
          botones de abajo siguen funcionando igual. */}
      <Card className="overflow-hidden p-0">
        <iframe src={pdf.url} title="Vista previa del informe" className="h-[420px] w-full" />
      </Card>

      <div className="space-y-3">
        {compartir.sePuedeCompartir(pdf.blob, pdf.nombre) && (
          <Button onClick={alCompartir} className="h-[52px] w-full text-[18px]">
            Compartir
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => compartir.descargar(pdf.blob, pdf.nombre)}
          className="h-[52px] w-full text-[18px]"
        >
          Descargar
        </Button>
      </div>

      {aviso && (
        <p className="text-[16px] text-muted-foreground" role="status">
          {aviso}
        </p>
      )}

      <Card className="space-y-2 p-5">
        <p className="text-[16px] font-semibold">Destinatarios de esta obra</p>
        <p className="text-[15px] text-muted-foreground">
          La aplicación no envía correos. Comparte el archivo o descárgalo y adjúntalo tú.
        </p>
        {destinatarios.length === 0 ? (
          <p className="text-[18px]">Esta obra aún no tiene destinatarios.</p>
        ) : (
          <ul className="space-y-1">
            {destinatarios.map((destinatario) => (
              <li key={destinatario.correo} className="text-[18px]">
                {destinatario.correo}{" "}
                <span className="text-[16px] text-muted-foreground">
                  ({ETIQUETAS_ROL[destinatario.rol]})
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Button
        variant="secondary"
        onClick={() => navegar("/obras")}
        className="h-[52px] w-full text-[18px]"
      >
        Volver a las obras
      </Button>
    </main>
  );
}
