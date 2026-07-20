// Pantalla de listado de promotores.
//
// Tarjetas grandes y legibles (design-system). Incluye el estado vacío con salida
// directa: nunca una pantalla vacía sin acción. Ver design-system#estados.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type ListarPromotores } from "@/application/use-cases/listar-promotores";
import { type Promotor } from "@/domain/promotor/promotor";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";

export interface PromotoresPageProps {
  listarPromotores: ListarPromotores;
}

export function PromotoresPage({ listarPromotores }: PromotoresPageProps) {
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    listarPromotores.ejecutar().then((lista) => {
      if (!activo) return;
      setPromotores(lista);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [listarPromotores]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-[28px] font-semibold text-foreground">Promotores</h1>
        <p className="text-[18px] text-muted-foreground">
          Los dueños de las obras. Se registran una vez y se reutilizan en todas sus obras.
        </p>
      </header>

      {cargando ? (
        <p className="text-[18px] text-muted-foreground">Cargando…</p>
      ) : promotores.length === 0 ? (
        <Card className="space-y-4 p-6">
          <p className="text-[18px]">Aún no tienes promotores. Crea el primero.</p>
          <Button asChild className="h-[52px] w-full text-[18px]">
            <Link to="/promotores/nuevo">Nuevo promotor</Link>
          </Button>
        </Card>
      ) : (
        <>
          <Button asChild className="h-[52px] w-full text-[18px]">
            <Link to="/promotores/nuevo">Nuevo promotor</Link>
          </Button>

          <ul className="space-y-3">
            {promotores.map((promotor) => (
              <li key={promotor.id}>
                {/* La tarjeta entera es el enlace: área táctil grande. */}
                <Link to={`/promotores/${promotor.id}`} className="block">
                  <Card className="space-y-1 p-5">
                    <p className="text-[22px] font-semibold">{promotor.nombreRazonSocial}</p>
                    {promotor.nif && (
                      <p className="text-[16px] text-muted-foreground">{promotor.nif}</p>
                    )}
                    {promotor.contacto?.persona && (
                      <p className="text-[16px] text-muted-foreground">
                        {promotor.contacto.persona}
                      </p>
                    )}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
