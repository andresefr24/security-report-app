import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { FUTURE_PROVIDER } from '@/app/opciones-router'

// Anfitrión de la app: arranca el enrutado definido en app/router.tsx.
function App() {
  return <RouterProvider router={router} future={FUTURE_PROVIDER} />
}

export default App
