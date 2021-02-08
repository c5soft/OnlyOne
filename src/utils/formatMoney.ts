export function formatMoney(n: number | string | null):string {
  if (n === null)
    return '';
  const s = ((typeof n === "number") ? n : parseFloat(n)).toFixed(2);
  if (s === "NaN")
    return "";
  return s.slice(0, -3).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + s.slice(-3);
}
