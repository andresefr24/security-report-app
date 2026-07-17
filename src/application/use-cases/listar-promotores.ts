// Caso de uso ListarPromotores — "el coordinador ve sus promotores".
//
// Alimenta la pantalla de listado y el selector de promotor del alta de obra.
// Es un "read model": solo lee, no cambia nada.

import { type Promotor } from "@/domain/promotor/promotor";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";

export class ListarPromotores {
  constructor(private readonly repositorio: PromotorRepository) {}

  /** Todos los promotores registrados (el repositorio los devuelve ordenados). */
  async ejecutar(): Promise<Promotor[]> {
    return this.repositorio.listar();
  }
}
