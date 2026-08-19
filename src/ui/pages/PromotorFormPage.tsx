// Pantalla de alta y edición de un promotor.
//
// Una sola pantalla para ambas cosas: el formulario es idéntico y solo cambia si
// llega con datos precargados. Si la URL trae un id (/promotores/:id) edita ese
// promotor; si no (/promotores/nuevo) da de alta uno nuevo.
//
// Recibe los casos de uso por props: no los crea ella (eso es el composition root).

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { type AltaPromotor } from "@/application/use-cases/alta-promotor";
import { type EditarPromotor } from "@/application/use-cases/editar-promotor";
import { Button } from "@/ui/components/button";
import { CampoLogo } from "@/ui/components/campo-logo";
import { CamposTexto } from "@/ui/components/campos-formulario";
import {
  aDatosPromotor,
  aFormularioPromotor,
  camposPromotor,
  esquemaFormularioPromotor,
  promotorVacio,
  type FormularioPromotor,
} from "@/ui/pages/promotor-campos";

export interface PromotorFormPageProps {
  altaPromotor: AltaPromotor;
  editarPromotor: EditarPromotor;
}

export function PromotorFormPage({ altaPromotor, editarPromotor }: PromotorFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [cargando, setCargando] = useState(editando);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPromotor>({
    resolver: zodResolver(esquemaFormularioPromotor),
    defaultValues: promotorVacio,
  });

  // Al editar, cargamos el promotor antes de pintar el formulario.
  useEffect(() => {
    if (!id) return;
    let activo = true;
    editarPromotor.cargar(id).then((promotor) => {
      if (!activo) return;
      if (promotor) reset(aFormularioPromotor(promotor));
      else setErrorGeneral("Ese promotor ya no existe.");
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [id, editarPromotor, reset]);

  async function onSubmit(datos: FormularioPromotor) {
    setErrorGeneral(null);
    const valores = aDatosPromotor(datos);

    const resultado = id
      ? await editarPromotor.ejecutar({ ...valores, id })
      : await altaPromotor.ejecutar(valores);

    if (resultado.ok) {
      // Guardado: volvemos al listado, donde se ve el resultado.
      navegar("/promotores");
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-[28px] font-semibold text-foreground">
          {editando ? "Editar promotor" : "Nuevo promotor"}
        </h1>
        <p className="text-[18px] text-muted-foreground">
          El promotor es el dueño de la obra y quien recibe los informes.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <CamposTexto campos={camposPromotor} register={register} errors={errors} />

        <CampoLogo
          valor={watch("logo") || undefined}
          onChange={(logo) => setValue("logo", logo ?? "", { shouldDirty: true })}
        />

        {errorGeneral && (
          <p className="text-[15px] text-destructive" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navegar("/promotores")}
            className="h-[52px] flex-1 text-[18px]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[52px] flex-1 text-[18px]"
          >
            Guardar
          </Button>
        </div>
      </form>
    </main>
  );
}
