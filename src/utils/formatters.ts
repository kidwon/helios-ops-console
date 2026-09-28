/**
 * Utility formatters for Helios Depot Operations Console
 */

export function formatCredits(val: number): string {
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(2)}B CR`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M CR`;
  }
  return `${val.toLocaleString()} CR`;
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(val));
}

export function formatPercent(val: number, decimals: number = 1): string {
  return `${(val * 100).toFixed(decimals)}%`;
}

export function formatSolTime(ms: number = Date.now()): string {
  // Sci-fi Sol timestamp format: SOL 2257.271 // 16:45:12 UTC
  const d = new Date(ms);
  const dayOfYear = Math.floor((ms - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const utcHours = String(d.getUTCHours()).padStart(2, '0');
  const utcMins = String(d.getUTCMinutes()).padStart(2, '0');
  const utcSecs = String(d.getUTCSeconds()).padStart(2, '0');
  return `SOL 2257.${dayOfYear} // ${utcHours}:${utcMins}:${utcSecs} UTC`;
}

export function getRegionColor(region: string): { bg: string; text: string; border: string } {
  switch (region) {
    case 'INNER':
      return { bg: 'rgba(0, 242, 255, 0.1)', text: '#00f2ff', border: 'rgba(0, 242, 255, 0.4)' };
    case 'BELT':
      return { bg: 'rgba(255, 176, 32, 0.1)', text: '#ffb020', border: 'rgba(255, 176, 32, 0.4)' };
    case 'OUTER':
      return { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
    default:
      return { bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff', border: 'rgba(255, 255, 255, 0.2)' };
  }
}

export function getStatusStyle(status: string): { bg: string; text: string; border: string; glow: string } {
  switch (status) {
    case 'NOMINAL':
      return {
        bg: 'rgba(0, 230, 118, 0.12)',
        text: '#00e676',
        border: 'rgba(0, 230, 118, 0.4)',
        glow: '0 0 12px rgba(0, 230, 118, 0.3)'
      };
    case 'WARNING':
      return {
        bg: 'rgba(255, 176, 32, 0.15)',
        text: '#ffb020',
        border: 'rgba(255, 176, 32, 0.5)',
        glow: '0 0 12px rgba(255, 176, 32, 0.3)'
      };
    case 'CRITICAL':
      return {
        bg: 'rgba(255, 56, 96, 0.18)',
        text: '#ff3860',
        border: 'rgba(255, 56, 96, 0.6)',
        glow: '0 0 16px rgba(255, 56, 96, 0.4)'
      };
    default:
      return {
        bg: 'rgba(148, 163, 184, 0.1)',
        text: '#94a3b8',
        border: 'rgba(148, 163, 184, 0.3)',
        glow: 'none'
      };
  }
}
