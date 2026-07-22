// Paso 1 del wizard — Datos de la visita.
//
// Módulo independiente: recibe el informe y una forma de actualizarlo (PropsPaso),
// y solo se ocupa de SUS campos. La fecha/hora viene puesta del borrador y aquí
// se puede corregir; las personas que atienden la visita se añaden y quitan.
//
// No valida por su cuenta: el guardado del wizard valida contra el dominio (una
// persona sin nombre, por ejemplo, no dejará avanzar).

import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type PersonaAtiende } from "@/domain/informe/informe";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Button } from "@/ui/components/button";

export function PasoDatos({ informe, actualizar }: PropsPaso) {
  const personas = informe.personasAtienden ?? [];

  function cambiarPersona(indice: number, parcial: Partial<PersonaAtiende>) {
    actualizar({
      personasAtienden: personas.map((p, i) => (i === indice ? { ...p, ...parcial } : p)),
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="fechaHora" className="text-[16px] font-semibold">
          Fecha y hora de la visita
        </Label>
        <Input
          id="fechaHora"
          type="datetime-local"
          value={informe.fechaHora ?? ""}
          onChange={(e) => actualizar({ fechaHora: e.target.value })}
          className="h-[52px] text-[18px]"
        />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-[16px] font-semibold">Personas que atienden la visita</Label>
          <p className="text-[15px] text-muted-foreground">
            Quién te acompaña y recibe las instrucciones.
          </p>
        </div>

        {personas.map((persona, indice) => (
          <Card key={indice} className="space-y-3 p-4">
            <div className="space-y-1.5">
              <Label htmlFor={`persona-${indice}-nombre`} className="text-[16px] font-semibold">
                Nombre
              </Label>
              <Input
                id={`persona-${indice}-nombre`}
                value={persona.nombre}
                onChange={(e) => cambiarPersona(indice, { nombre: e.target.value })}
                className="h-[52px] text-[18px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`persona-${indice}-cargo`} className="text-[16px] font-semibold">
                Cargo
              </Label>
              <Input
                id={`persona-${indice}-cargo`}
                value={persona.cargo ?? ""}
                onChange={(e) => cambiarPersona(indice, { cargo: e.target.value })}
                className="h-[52px] text-[18px]"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => actualizar({ personasAtienden: personas.filter((_, i) => i !== indice) })}
              className="h-[52px] w-full text-[18px]"
            >
              Quitar persona
            </Button>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => actualizar({ personasAtienden: [...personas, { nombre: "" }] })}
          className="h-[52px] w-full text-[18px]"
        >
          Añadir persona
        </Button>
      </div>
    </div>
  );
}
