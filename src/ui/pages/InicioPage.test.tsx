import { render, screen } from '@testing-library/react'
import { InicioPage } from '@/ui/pages/InicioPage'

// Test de ejemplo (M0): comprueba que el stack de tests funciona de punta a
// punta (Vitest + jsdom + React Testing Library + alias @/). En M1 empezaremos
// con tests de dominio de verdad.
describe('InicioPage', () => {
  it('muestra el título de la app', () => {
    render(<InicioPage />)
    expect(
      screen.getByRole('heading', { name: 'Informes de seguridad' }),
    ).toBeInTheDocument()
  })
})
