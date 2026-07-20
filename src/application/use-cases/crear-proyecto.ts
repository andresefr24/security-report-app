// Caso de uso CrearProyecto — "el coordinador da de alta una obra".
//
// Recibe DOS puertos, y esa es la gracia: además de validar los datos con el
// dominio, comprueba contra el repositorio de promotores que el promotor elegido
// EXISTE de verdad. El dominio no puede hacerlo (no consulta repositorios), pero
// dejar una obra apuntando a un promotor inexistente sería un dato roto.
//
// La obra guarda el promotorId, nunca una copia de los datos del promotor
// (decisions#d5).

import { crearProyecto, type DatosProyecto, type Proyecto } from "@/domain/proyecto/proyecto";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { fallo, type Result } from "@/domain/shared/result";

export class CrearProyecto {
  constructor(
    private readonly proyectos: ProyectoRepository,
    private readonly promotores: PromotorRepository,
  ) {}

  async ejecutar(datos: DatosProyecto): Promise<Result<Proyecto>> {
    const resultado = crearProyecto(datos);
    if (!resultado.ok) {
      return resultado;
    }

    // Integridad de la referencia: el promotor tiene que estar registrado.
    const promotor = await this.promotores.obtenerPorId(resultado.valor.promotorId);
    if (!promotor) {
      return fallo(["El promotor seleccionado ya no existe. Elija otro."]);
    }

    await this.proyectos.guardar(resultado.valor);
    return resultado;
  }
}
