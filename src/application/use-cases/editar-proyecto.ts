// Caso de uso EditarProyecto — "el coordinador corrige los datos de una obra".
//
// Faltaba: hasta ahora una obra solo se podía crear, así que un dedazo en el
// código o unos correos mal puestos no había forma de arreglarlos. Y las obras
// dadas de alta antes de que existieran la ubicación, el plazo o los
// presupuestos se quedaban sin ellos para siempre.
//
// Como en el promotor, se diferencia del alta en una regla: aquí la obra TIENE
// que existir ya. Sin esa comprobación, "editar" con un id inventado daría de
// alta una obra por la puerta de atrás.

import { crearProyecto, type DatosProyecto, type Proyecto } from "@/domain/proyecto/proyecto";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { fallo, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

export class EditarProyecto {
  constructor(
    private readonly proyectos: ProyectoRepository,
    private readonly promotores: PromotorRepository,
  ) {}

  /** Devuelve la obra a editar, o null si ya no existe (para rellenar el formulario). */
  async cargar(id: Id): Promise<Proyecto | null> {
    return this.proyectos.obtenerPorId(id);
  }

  async ejecutar(datos: DatosProyecto & { id: Id }): Promise<Result<Proyecto>> {
    const existente = await this.proyectos.obtenerPorId(datos.id);
    if (!existente) {
      return fallo(["Esa obra ya no existe. Puede que se haya borrado."]);
    }

    // El promotor se comprueba igual que al crear: el dominio no puede mirar el
    // repositorio, así que la comprobación vive aquí (ver CrearProyecto).
    const promotor = await this.promotores.obtenerPorId(datos.promotorId);
    if (!promotor) {
      return fallo(["El promotor elegido ya no existe."]);
    }

    const resultado = crearProyecto(datos);
    if (!resultado.ok) {
      return resultado;
    }

    await this.proyectos.guardar(resultado.valor);
    return resultado;
  }
}
