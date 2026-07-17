// Composition root — el ÚNICO sitio que conoce los adaptadores concretos.
//
// Aquí se "cablea" la app: se crean los adaptadores reales (infrastructure) y se
// inyectan en los casos de uso (application). El resto de la app (las pantallas)
// recibe casos de uso ya montados y no sabe qué hay por debajo (localForage, una
// API…). Si mañana cambia el adaptador, solo cambia este archivo.

import { ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { EditarPromotor } from "@/application/use-cases/editar-promotor";
import { ListarPromotores } from "@/application/use-cases/listar-promotores";
import { LocalForageCoordinadorRepository } from "@/infrastructure/persistence/localforage/coordinador-repository.localforage";
import { LocalForagePromotorRepository } from "@/infrastructure/persistence/localforage/promotor-repository.localforage";

// Adaptadores reales de persistencia (IndexedDB vía localForage).
const coordinadorRepository = new LocalForageCoordinadorRepository();
const promotorRepository = new LocalForagePromotorRepository();

// Casos de uso ya cableados, listos para dárselos a las pantallas.
export const casosDeUso = {
  configurarPerfil: new ConfigurarPerfil(coordinadorRepository),
  altaPromotor: new AltaPromotor(promotorRepository),
  editarPromotor: new EditarPromotor(promotorRepository),
  listarPromotores: new ListarPromotores(promotorRepository),
};
