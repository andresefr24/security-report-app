import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'

// Anfitrión de la app: arranca el enrutado definido en app/router.tsx.
function App() {
  return <RouterProvider router={router} />
}

export default App
