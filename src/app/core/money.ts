const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** "135.00" -> "R$ 135,00" */
export const formatBRL = (value: string | number): string => brl.format(Number(value)).replace(/ /g, ' ');

/** Aceita "135", "135,5" ou "135.50". Devolve "135.50" ou null se for inválido. */
export function parsePrice(input: string): string | null {
  const text = input.trim().replace(/^R\$\s*/i, '').replace(',', '.');
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(text)) return null;
  return Number(text).toFixed(2);
}
