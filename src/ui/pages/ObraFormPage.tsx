// Pantalla de alta de obra ("formulario de obra nueva").
//
// El promotor se SELECCIONA de los ya registrados (decisions#d5): se guarda su
// id, nunca una copia de sus datos.
//
// Nota de diseño: el selector de promotor y el de rol usan <select> NATIVO en vez
// del Select de shadcn. Motivo: en el iPhone abre la ruleta nativa de iOS, con
// texto grande y familiar, que encaja mejor con usuarios de ~63 años a pie de
// obra. Desviación consciente del design-system.

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { type CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { type ListarPromotores } from "@/application/use-cases/listar-promotores";
import { type Promotor } from "@/domain/promotor/promotor";
import { FRECUENCIAS_VISITA, ROLES_DESTINATARIO } from "@/domain/proyecto/esquema-proyecto";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { CamposTexto, mensajeError } from "@/ui/components/campos-formulario";
import {
  aDatosProyecto,
  camposObra,
  esquemaFormularioObra,
  ETIQUETAS_FRECUENCIA,
  ETIQUETAS_ROL,
  obraVacia,
  type FormularioObra,
} from "@/ui/pages/obra-campos";

// Estilo de los <select> nativos: mismo alto y tamaño de letra que los demás
// campos (52px, 18px). Los <input> usan el componente Input, que ya los trae.
const CLASES_SELECT =
  "h-[52px] w-full rounded-md border border-input bg-background px-3 text-[18px]";

export interface ObraFormPageProps {
  crearProyecto: CrearProyecto;
  listarPromotores: ListarPromotores;
}

export function ObraFormPage({ crearProyecto, listarPromotores }: ObraFormPageProps) {
  const navegar = useNavigate();
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormularioObra>({
    resolver: zodResolver(esquemaFormularioObra),
    defaultValues: obraVacia,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "listaDistribucion" });
  const frecuencia = watch("frecuenciaVisita");

  // Cargamos los promotores para poder elegir uno.
  useEffect(() => {
    let activo = true;
    listarPromotores.ejecutar().then((lista) => {
      if (!activo) return;
      setPromotores(lista);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [listarPromotores]);

  async function onSubmit(datos: FormularioObra) {
    setErrorGeneral(null);
    const resultado = await crearProyecto.ejecutar(aDatosProyecto(datos));
    if (resultado.ok) {
      navegar("/obras");
      return;
    }
    setErrorGeneral(resultado.errores.join(" "));
  }

  if (cargando) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-[18px] text-muted-foreground">Cargando…</p>
      </main>
    );
  }

  // Sin promotores no se puede crear una obra: hay que registrarlos antes (D5).
  if (promotores.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <h1 className="text-[28px] font-semibold text-foreground">Nueva obra</h1>
        <Card className="space-y-4 p-6">
          <p className="text-[18px]">
            Antes de crear una obra necesitas registrar a su promotor.
          </p>
          <Button asChild className="h-[52px] w-full text-[18px]">
            <Link to="/promotores/nuevo">Crear el primer promotor</Link>
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-[28px] font-semibold text-foreground">Nueva obra</h1>
        <p className="text-[18px] text-muted-foreground">
          Elige el promotor, rellena los datos y añade quién recibirá los informes.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Promotor: se elige, no se teclea. */}
        <div className="space-y-1.5">
          <Label htmlFor="promotorId" className="text-[16px] font-semibold">
            Promotor<span className="text-destructive"> *</span>
          </Label>
          <select id="promotorId" className={CLASES_SELECT} {...register("promotorId")}>
            <option value="">Elige un promotor…</option>
            {promotores.map((promotor) => (
              <option key={promotor.id} value={promotor.id}>
                {promotor.nombreRazonSocial}
              </option>
            ))}
          </select>
          {mensajeError(errors, "promotorId") && (
            <p className="text-[15px] text-destructive">{mensajeError(errors, "promotorId")}</p>
          )}
        </div>

        <CamposTexto campos={camposObra} register={register} errors={errors} />

        {/* Frecuencia: dos opciones grandes, no un desplegable. */}
        <div className="space-y-1.5">
          <Label className="text-[16px] font-semibold">Frecuencia de visita</Label>
          <div className="flex gap-3">
            {FRECUENCIAS_VISITA.map((opcion) => (
              <Button
                key={opcion}
                type="button"
                variant={frecuencia === opcion ? "default" : "outline"}
                aria-pressed={frecuencia === opcion}
                onClick={() => setValue("frecuenciaVisita", opcion)}
                className="h-[52px] flex-1 text-[18px]"
              >
                {ETIQUETAS_FRECUENCIA[opcion]}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de distribución: quién recibe los informes de esta obra. */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[16px] font-semibold">Lista de distribución</Label>
            <p className="text-[15px] text-muted-foreground">
              Quién recibirá los informes de esta obra. Puedes añadirlos ahora o más tarde.
            </p>
          </div>

          {fields.map((campo, indice) => (
            <Card key={campo.id} className="space-y-3 p-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor={`listaDistribucion.${indice}.correo`}
                  className="text-[16px] font-semibold"
                >
                  Correo
                </Label>
                <Input
                  id={`listaDistribucion.${indice}.correo`}
                  type="email"
                  className="h-[52px] text-[18px]"
                  {...register(`listaDistribucion.${indice}.correo`)}
                />
                {mensajeError(errors, `listaDistribucion.${indice}.correo`) && (
                  <p className="text-[15px] text-destructive">
                    {mensajeError(errors, `listaDistribucion.${indice}.correo`)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`listaDistribucion.${indice}.rol`}
                  className="text-[16px] font-semibold"
                >
                  Rol
                </Label>
                <select
                  id={`listaDistribucion.${indice}.rol`}
                  className={CLASES_SELECT}
                  {...register(`listaDistribucion.${indice}.rol`)}
                >
                  {ROLES_DESTINATARIO.map((rol) => (
                    <option key={rol} value={rol}>
                      {ETIQUETAS_ROL[rol]}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => remove(indice)}
                className="h-[52px] w-full text-[18px]"
              >
                Quitar destinatario
              </Button>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ correo: "", rol: "promotor" })}
            className="h-[52px] w-full text-[18px]"
          >
            Añadir destinatario
          </Button>
        </div>

        {errorGeneral && (
          <p className="text-[15px] text-destructive" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navegar("/obras")}
            className="h-[52px] flex-1 text-[18px]"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-[52px] flex-1 text-[18px]">
            Guardar
          </Button>
        </div>
      </form>
    </main>
  );
}
