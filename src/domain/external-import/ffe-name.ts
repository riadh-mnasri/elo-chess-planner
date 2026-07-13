// FFE prints names as "NOM Prénom" while the app stores "Prénom Nom", so
// names are compared as an order-independent set of accent-stripped words.
export function normalizeFfeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase()
    .split(" ")
    .sort()
    .join(" ");
}
