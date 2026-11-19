export function formatCop(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$ 0 COP';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2
  }).format(val);
}

export function formatPercent(val: number): string {
  if (isNaN(val) || val === null || val === undefined) {
    return '0%';
  }
  return `${val.toLocaleString('es-CO', { maximumFractionDigits: 2 })}%`;
}

export function formatDateSpanish(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}
