export type AccuracyGroup = { label: string; count: number; accuracy: number };
export type LatencyRecord = { latency_ms: number };
export type LatencyBin = { label: string; count: number; lower: number; upper: number };

export function buildAccuracyGroups(matches: readonly boolean[], maxGroups = 3): AccuracyGroup[] {
  if (matches.length === 0 || !Number.isInteger(maxGroups) || maxGroups < 1) return [];
  const groupCount = Math.min(maxGroups, matches.length);

  return Array.from({ length: groupCount }, (_, index) => {
    const start = Math.floor(index * matches.length / groupCount);
    const end = Math.floor((index + 1) * matches.length / groupCount);
    const batch = matches.slice(start, end);
    return {
      label: `Lote ${index + 1}`,
      count: batch.length,
      accuracy: batch.filter(Boolean).length / batch.length,
    };
  });
}

function formatBoundary(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

export function buildLatencyHistogram(records: readonly LatencyRecord[], binCount = 5): LatencyBin[] {
  if (!Number.isInteger(binCount) || binCount < 1) return [];
  const values = records
    .map(record => record.latency_ms)
    .filter(value => Number.isFinite(value) && value >= 0);
  if (values.length === 0) return [];

  const max = values.reduce((highest, value) => Math.max(highest, value), 1);
  const binSize = max / binCount;

  return Array.from({ length: binCount }, (_, index) => {
    const lower = index * binSize;
    const upper = (index + 1) * binSize;
    const lastBin = index === binCount - 1;
    const count = values.filter(value =>
      value >= lower && (lastBin ? value <= max : value < upper),
    ).length;

    return {
      label: `${formatBoundary(lower)}–${formatBoundary(upper)} ms`,
      count,
      lower,
      upper,
    };
  });
}
