// Pantalla de PRUEBA de marca (M0 · pieza 3). Solo sirve para ver aplicados
// los tokens de color y la tipografía IBM Plex del design-system.
// En M1 empezaremos a sustituirla por pantallas reales.

const escalaTipografica = [
  { clase: 'text-[40px] font-bold', etiqueta: '40 / 700 — título grande' },
  { clase: 'text-[28px] font-semibold', etiqueta: '28 / 600 — título' },
  { clase: 'text-[22px] font-semibold', etiqueta: '22 / 600 — subtítulo' },
  { clase: 'text-[18px] font-normal', etiqueta: '18 / 400 — cuerpo' },
  { clase: 'text-[16px] font-semibold', etiqueta: '16 / 600 — etiqueta' },
]

const muestrasColor = [
  { nombre: 'primary', clase: 'bg-primary text-primary-foreground' },
  { nombre: 'destructive', clase: 'bg-destructive text-destructive-foreground' },
  { nombre: 'accent', clase: 'bg-accent text-accent-foreground' },
  { nombre: 'success', clase: 'bg-success text-white' },
  { nombre: 'secondary', clase: 'bg-secondary text-secondary-foreground' },
  { nombre: 'muted', clase: 'bg-muted text-muted-foreground' },
]

function App() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-[40px] font-bold text-foreground">
          Informes de seguridad
        </h1>
        <p className="text-muted-foreground">
          Pantalla de prueba de marca — tipografía IBM Plex y azul institucional.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-[22px] font-semibold">Escala tipográfica</h2>
        <ul className="space-y-2">
          {escalaTipografica.map((t) => (
            <li key={t.etiqueta} className={t.clase}>
              {t.etiqueta}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[22px] font-semibold">Colores de marca</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {muestrasColor.map((c) => (
            <div
              key={c.nombre}
              className={`${c.clase} flex h-20 items-center justify-center rounded-lg text-[16px] font-semibold`}
            >
              {c.nombre}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[22px] font-semibold">Área táctil grande (≥48px)</h2>
        <button className="h-[52px] w-full rounded-lg bg-primary px-6 text-[18px] font-semibold text-primary-foreground">
          Botón de ejemplo (52px de alto)
        </button>
      </section>
    </main>
  )
}

export default App
