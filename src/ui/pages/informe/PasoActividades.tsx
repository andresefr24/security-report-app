// Paso 2 del asistente — Situación y actividades. El cuerpo del informe.
//
// Sustituye a los tres pasos viejos (Fotos, Contenido e Incumplimientos) y calca
// la estructura de los informes reales: un calendario de la semana y una situación
// general (los dos opcionales), y debajo UNA O VARIAS ACTIVIDADES que se añaden
// libremente. Cada actividad es "dónde" + "qué" + sus fotos con comentario.
//
// Una incidencia no tiene pantalla propia: es una actividad más, se cuenta en su
// descripción. Ver docs/entity-informe.md y docs/maqueta-informe-real.md.
//
// Para finalizar hace falta al menos una actividad descrita (completitud.ts); el
// resto de campos nunca bloquean.

import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type Actividad } from "@/domain/informe/informe";
import { nuevoId } from "@/domain/shared/id";
import { CampoFotos } from "@/ui/pages/informe/campo-fotos";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";

export function PasoActividades({ informe, actualizar }: PropsPaso) {
  const actividades = informe.actividades ?? [];

  function cambiarActividad(id: string, parcial: Partial<Actividad>) {
    actualizar({
      actividades: actividades.map((a) => (a.id === id ? { ...a, ...parcial } : a)),
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <Label htmlFor="resumenSemana" className="text-[16px] font-semibold">
          Calendario de la semana (opcional)
        </Label>
        <p className="text-[15px] text-muted-foreground">
          Los días que visitaste y qué se estaba haciendo. Por ejemplo: «Semana del
          3 al 7 de agosto…».
        </p>
        <Textarea
          id="resumenSemana"
          value={informe.resumenSemana ?? ""}
          onChange={(e) => actualizar({ resumenSemana: e.target.value })}
          rows={3}
          className="text-[18px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="situacion" className="text-[16px] font-semibold">
          Situación general de la obra (opcional)
        </Label>
        <p className="text-[15px] text-muted-foreground">
          Cómo está la obra en conjunto. Si solo vas a contar actividades sueltas,
          puedes dejarlo en blanco.
        </p>
        <Textarea
          id="situacion"
          value={informe.situacion ?? ""}
          onChange={(e) => actualizar({ situacion: e.target.value })}
          rows={4}
          className="text-[18px]"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-[18px] font-semibold">Actividades</p>
          <p className="text-[15px] text-muted-foreground">
            Una por cada cosa que quieras dejar por escrito: un trabajo, una
            incidencia, una buena práctica. Necesitas al menos una para poder
            cerrar el informe.
          </p>
        </div>

        {actividades.length === 0 && (
          <p className="text-[18px] text-muted-foreground">Aún no has añadido actividades.</p>
        )}

        {actividades.map((actividad, indice) => (
          <Card key={actividad.id} className="space-y-4 p-4">
            <p className="text-[18px] font-semibold">Actividad {indice + 1}</p>

            <div className="space-y-1.5">
              <Label
                htmlFor={`actividad-${actividad.id}-ubicacion`}
                className="text-[16px] font-semibold"
              >
                Dónde (opcional)
              </Label>
              <p className="text-[15px] text-muted-foreground">
                El punto de la obra. Por ejemplo: «(M-103) PK 03+500 – Glorieta de
                Cobeña».
              </p>
              <Input
                id={`actividad-${actividad.id}-ubicacion`}
                value={actividad.ubicacion ?? ""}
                onChange={(e) => cambiarActividad(actividad.id, { ubicacion: e.target.value })}
                className="h-[52px] text-[18px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`actividad-${actividad.id}-descripcion`}
                className="text-[16px] font-semibold"
              >
                Qué pasó
              </Label>
              <Textarea
                id={`actividad-${actividad.id}-descripcion`}
                value={actividad.descripcion ?? ""}
                onChange={(e) => cambiarActividad(actividad.id, { descripcion: e.target.value })}
                rows={5}
                className="text-[18px]"
              />
            </div>

            <CampoFotos
              fotos={actividad.fotos ?? []}
              onChange={(fotos) => cambiarActividad(actividad.id, { fotos })}
              idPrefijo={`actividad-${actividad.id}`}
              numeroActividad={indice + 1}
            />

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                actualizar({ actividades: actividades.filter((a) => a.id !== actividad.id) })
              }
              className="h-[52px] w-full text-[18px]"
            >
              Quitar actividad {indice + 1}
            </Button>
          </Card>
        ))}

        <Button
          type="button"
          onClick={() => actualizar({ actividades: [...actividades, { id: nuevoId() }] })}
          className="h-[52px] w-full text-[18px]"
        >
          Añadir actividad
        </Button>
      </div>
    </div>
  );
}
