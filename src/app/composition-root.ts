// Composition root — el ÚNICO sitio que conoce los adaptadores concretos.
//
// Aquí se "cablea" la app: se crean los adaptadores reales (infrastructure) y se
// inyectan en los casos de uso (application). El resto de la app (las pantallas)
// recibe casos de uso ya montados y no sabe qué hay por debajo (localForage, una
// API…). Si mañana cambia el adaptador, solo cambia este archivo.

import { ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { LocalForageCoordinadorRepository } from "@/infrastructure/persistence/localforage/coordinador-repository.localforage";

// Adaptador real de persistencia (IndexedDB vía localForage).
const coordinadorRepository = new LocalForageCoordinadorRepository();

// Casos de uso ya cableados, listos para dárselos a las pantallas.
export const casosDeUso = {
  configurarPerfil: new ConfigurarPerfil(coordinadorRepository),
};
