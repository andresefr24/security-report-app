// Pantalla de perfil del coordinador.
//
// Formulario con react-hook-form + zod. Los campos de texto se generan desde la
// configuración de perfil-campos.ts (fáciles de modificar). La firma usa el
// componente CampoFirma (canvas). Recibe el caso de uso ConfigurarPerfil por
// props: no lo crea ella (eso lo hace el composition root en app/).

import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Button } from "@/ui/components/button";
import { CampoFirma } from "@/ui/components/campo-firma";
import {
  aDatosCoordinador,
  aFormulario,
  camposPerfil,
  esquemaPerfil,
  perfilVacio,
  type FormularioPerfil,
} from "@/ui/pages/perfil-campos";

// Lee el mensaje de error de un campo, incluso anidado ("contacto.correo").
function mensajeError(errors: FieldErrors<FormularioPerfil>, nombre: string): string | undefined {
  let actual: unknown = errors;
  for (const parte of nombre.split(".")) {
    actual = (actual as Record<string, unknown> | undefined)?.[parte];
    if (!actual) return undefined;
  }
  const mensaje = (actual as { message?: unknown }).message;
  return typeof mensaje === "string" ? mensaje : undefined;
}

export interface PerfilPageProps {
  configurarPerfil: ConfigurarPerfil;
}

export function PerfilPage({ configurarPerfil }: PerfilPageProps) {
  const [cargando, setCargando] = useState(true);
  const [guardado, setGuardado] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: perfilVacio,
  });

  // Al abrir, cargamos el perfil existente (si lo hay) ANTES de pintar el
  // formulario, para que la firma previa llegue en el primer render.
  useEffect(() => {
    let activo = true;
    configurarPerfil.cargar().then((coordinador) => {
      if (!activo) return;
      if (coordinador) reset(aFormulario(coordinador));
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [configurarPerfil, reset]);

  const firma = watch("firma");

  async function onSubmit(datos: FormularioPerfil) {
    setGuardado(false);
    const resultado = await configurarPerfil.ejecutar(aDatosCoordinador(datos));
    if (resultado.ok) setGuardado(true);
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
        <h1 className="text-[28px] font-semibold text-foreground">Tu perfil</h1>
        <p className="text-[18px] text-muted-foreground">
          Rellena tus datos una vez. Aparecerán en cada informe como prueba de tu
          presencia en la obra.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => setGuardado(false)}
        className="space-y-6"
        noValidate
      >
        {camposPerfil.map((campo) => {
          const error = mensajeError(errors, campo.nombre);
          return (
            <div key={campo.nombre} className="space-y-1.5">
              <Label htmlFor={campo.nombre} className="text-[16px] font-semibold">
                {campo.etiqueta}
                {campo.obligatorio && <span className="text-destructive"> *</span>}
              </Label>
              {campo.ayuda && (
                <p className="text-[15px] text-muted-foreground">{campo.ayuda}</p>
              )}
              <Input
                id={campo.nombre}
                type={campo.tipo ?? "text"}
                className="h-[52px] text-[18px]"
                aria-invalid={error ? true : undefined}
                {...register(campo.nombre)}
              />
              {error && <p className="text-[15px] text-destructive">{error}</p>}
            </div>
          );
        })}

        <div className="space-y-1.5">
          <CampoFirma
            valor={firma || undefined}
            onChange={(valor) =>
              setValue("firma", valor ?? "", { shouldValidate: true })
            }
          />
          {errors.firma && (
            <p className="text-[15px] text-destructive">{errors.firma.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-[52px] w-full text-[18px]">
          Guardar
        </Button>

        {guardado && (
          <p className="text-[16px] font-semibold text-success" role="status">
            Guardado en el dispositivo.
          </p>
        )}
      </form>
    </main>
  );
}
