import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { FUTURE_PROVIDER } from '@/app/opciones-router'
import { BandaSinConexion } from '@/ui/components/banda-sin-conexion'

// Anfitrión de la app: la banda "Sin conexión" (global) sobre el enrutado.
function App() {
  return (
    <>
      <BandaSinConexion />
      <RouterProvider router={router} future={FUTURE_PROVIDER} />
    </>
  )
}

export default App
