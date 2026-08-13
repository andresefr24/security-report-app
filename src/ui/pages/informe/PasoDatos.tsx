// Paso 1 del wizard — Datos de la visita.
//
// Módulo independiente: recibe el informe y una forma de actualizarlo (PropsPaso),
// y solo se ocupa de SUS campos: la fecha/hora (que viene puesta del borrador y
// aquí se puede corregir) y quién recibe el informe en obra.
//
// El RECEPTOR sustituye a la antigua lista de "personas que atienden la visita":
// en los 8 informes reales solo aparece una persona receptora, con su empresa, en
// la cabecera del documento. Vive en el informe y no en la obra porque cambia en
// cada visita (docs/decisions.md#d9-informe-v2, afinado 2).
//
// No valida por su cuenta: el guardado del wizard valida contra el dominio.

import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type Receptor } from "@/domain/informe/informe";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

export function PasoDatos({ informe, actualizar }: PropsPaso) {
  const receptor = informe.receptor ?? {};

  function cambiarReceptor(parcial: Partial<Receptor>) {
    actualizar({ receptor: { ...receptor, ...parcial } });
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
          <Label className="text-[16px] font-semibold">Quién recibe el informe</Label>
          <p className="text-[15px] text-muted-foreground">
            La persona de la obra que te atiende y recibe las instrucciones. Puedes
            dejarlo en blanco.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="receptor-nombre" className="text-[16px] font-semibold">
            Nombre
          </Label>
          <Input
            id="receptor-nombre"
            value={receptor.nombre ?? ""}
            onChange={(e) => cambiarReceptor({ nombre: e.target.value })}
            className="h-[52px] text-[18px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="receptor-empresa" className="text-[16px] font-semibold">
            Empresa o entidad
          </Label>
          <Input
            id="receptor-empresa"
            value={receptor.empresa ?? ""}
            onChange={(e) => cambiarReceptor({ empresa: e.target.value })}
            className="h-[52px] text-[18px]"
          />
        </div>
      </div>
    </div>
  );
}
