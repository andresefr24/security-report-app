import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Une clases de Tailwind con seguridad: clsx resuelve condicionales y
// twMerge deshace conflictos (p. ej. dos paddings distintos). Lo usan
// todos los componentes de shadcn/ui.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
