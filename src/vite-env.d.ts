/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Los inyecta vite.config.ts al compilar: la versión del package.json y el
// commit con el que se construyó. Salen en el pie de la pantalla de Obras.
declare const __VERSION__: string;
declare const __COMMIT__: string;
