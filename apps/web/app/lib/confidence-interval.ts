/** Wilson 95% interval for binary exact-match accuracy. */
export function wilsonInterval(successes: number, total: number) {
  if (!Number.isInteger(total) || total <= 0 || !Number.isInteger(successes) || successes < 0 || successes > total) return null;
  const z = 1.959963984540054;
  const p = successes / total;
  const denominator = 1 + z*z/total;
  const center = (p + z*z/(2*total)) / denominator;
  const halfWidth = z*Math.sqrt(p*(1-p)/total + z*z/(4*total*total))/denominator;
  return {lower: Math.max(0, center-halfWidth), upper: Math.min(1, center+halfWidth)};
}
