// "Future flags" de React Router: activan ya el comportamiento de la v7.
//
// No cambian nada visible; adelantan el cambio y evitan los avisos de migración
// que ensuciaban la salida de los tests (los avisos de verdad se ven mejor así).
// Viven aquí para que la app y los tests usen exactamente la misma configuración.

// Ojo al reparto en React Router v6: `v7_relativeSplatPath` va al crear el router
// (createBrowserRouter/createMemoryRouter) y `v7_startTransition` va en el
// <RouterProvider>. Por eso son dos constantes y no una.
export const FUTURE_ROUTER = {
  v7_relativeSplatPath: true,
} as const;

/** Para el <RouterProvider>. */
export const FUTURE_PROVIDER = {
  v7_startTransition: true,
} as const;

/**
 * Para los routers "de componente" (<MemoryRouter>, <BrowserRouter>), que sí
 * aceptan las dos flags juntas. Lo usan los tests.
 */
export const FUTURE_COMPONENTE = { ...FUTURE_ROUTER, ...FUTURE_PROVIDER } as const;

export const OPCIONES_ROUTER = { future: FUTURE_ROUTER } as const;
