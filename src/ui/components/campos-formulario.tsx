// Campos de texto de un formulario, generados desde una configuración.
//
// Lo usan todos los formularios de la app (perfil, promotor, obra…): así el
// andamiaje —etiqueta, texto de ayuda, input, error debajo del campo— y los
// tamaños de accesibilidad (52px, ≥18px) existen UNA sola vez.
//
// Los campos se declaran como DATOS en cada pantalla (un array), no como JSX,
// porque los campos aún no están cerrados con el stakeholder: añadir, quitar o
// reordenar es editar el array.

import {
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

export interface CampoTexto<T extends FieldValues> {
  /** Nombre del campo en el formulario. Admite anidados: "contacto.correo". */
  nombre: FieldPath<T>;
  etiqueta: string;
  ayuda?: string;
  tipo?: "text" | "email" | "tel";
  obligatorio?: boolean;
}

/** Lee el mensaje de error de un campo, incluso anidado ("contacto.correo"). */
export function mensajeError<T extends FieldValues>(
  errors: FieldErrors<T>,
  nombre: string,
): string | undefined {
  let actual: unknown = errors;
  for (const parte of nombre.split(".")) {
    actual = (actual as Record<string, unknown> | undefined)?.[parte];
    if (!actual) return undefined;
  }
  const mensaje = (actual as { message?: unknown }).message;
  return typeof mensaje === "string" ? mensaje : undefined;
}

interface CamposTextoProps<T extends FieldValues> {
  campos: CampoTexto<T>[];
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

export function CamposTexto<T extends FieldValues>({
  campos,
  register,
  errors,
}: CamposTextoProps<T>) {
  return (
    <>
      {campos.map((campo) => {
        const error = mensajeError(errors, campo.nombre);
        return (
          <div key={campo.nombre} className="space-y-1.5">
            <Label htmlFor={campo.nombre} className="text-[16px] font-semibold">
              {campo.etiqueta}
              {campo.obligatorio && <span className="text-destructive"> *</span>}
            </Label>
            {campo.ayuda && <p className="text-[15px] text-muted-foreground">{campo.ayuda}</p>}
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
    </>
  );
}
