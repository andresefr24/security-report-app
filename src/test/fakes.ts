// Fakes en memoria de los puertos, compartidos por todos los tests.
//
// Implementan la misma interfaz que los adaptadores reales, pero guardando en un
// Map: sin localForage ni IndexedDB. Así los casos de uso y las pantallas se
// prueban rápido y sin tocar disco.
//
// Viven aquí (y no copiados en cada archivo de test) para que, al añadir un
// método a un puerto, solo haya que tocar un sitio.

import { type Coordinador } from "@/domain/coordinador/coordinador";
import { type Promotor } from "@/domain/promotor/promotor";
import { type Proyecto } from "@/domain/proyecto/proyecto";
import { type CoordinadorRepository } from "@/domain/ports/coordinador-repository";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type Id } from "@/domain/shared/id";

/** El coordinador es un perfil único: basta una variable. */
export class CoordinadorRepositoryEnMemoria implements CoordinadorRepository {
  guardado: Coordinador | null = null;

  async guardar(coordinador: Coordinador): Promise<void> {
    this.guardado = coordinador;
  }
  async obtener(): Promise<Coordinador | null> {
    return this.guardado;
  }
}

export class PromotorRepositoryEnMemoria implements PromotorRepository {
  readonly guardados = new Map<Id, Promotor>();

  async guardar(promotor: Promotor): Promise<void> {
    this.guardados.set(promotor.id, promotor);
  }
  async obtenerPorId(id: Id): Promise<Promotor | null> {
    return this.guardados.get(id) ?? null;
  }
  async listar(): Promise<Promotor[]> {
    return [...this.guardados.values()];
  }
}

export class ProyectoRepositoryEnMemoria implements ProyectoRepository {
  readonly guardados = new Map<Id, Proyecto>();

  async guardar(proyecto: Proyecto): Promise<void> {
    this.guardados.set(proyecto.id, proyecto);
  }
  async obtenerPorId(id: Id): Promise<Proyecto | null> {
    return this.guardados.get(id) ?? null;
  }
  async listar(): Promise<Proyecto[]> {
    return [...this.guardados.values()];
  }
  async listarPorPromotor(promotorId: Id): Promise<Proyecto[]> {
    return [...this.guardados.values()].filter((p) => p.promotorId === promotorId);
  }
}
