// Fecha y hora local en el formato que usa <input type="datetime-local">:
// "AAAA-MM-DDTHH:mm". Igual que con las fechas del proyecto, trabajamos con texto
// y sin zonas horarias: lo que el coordinador ve es la hora de su reloj.

export function ahoraLocal(): string {
  const ahora = new Date();
  const dosDigitos = (n: number) => String(n).padStart(2, "0");
  const fecha = `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())}`;
  const hora = `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}`;
  return `${fecha}T${hora}`;
}
