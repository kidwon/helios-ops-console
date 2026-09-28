import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  rawValue?: number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  icon: React.ReactNode;
  variant?: 'cyan' | 'gold' | 'emerald' | 'crimson' | 'purple';
  alertBadge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  rawValue,
  subtext,
  trend,
  trendText,
  icon,
  variant = 'cyan',
  alertBadge
}) => {
  const [flash, setFlash] = useState<'flash-up' | 'flash-down' | null>(null);

  useEffect(() => {
    if (rawValue !== undefined) {
      setFlash('flash-up');
      const t = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(t);
    }
  }, [value, rawValue]);

  return (
    <div className={`metric-card glass-card variant-${variant} ${flash || ''}`}>
      <div className="card-top">
        <span className="card-title">{title}</span>
        <div className="card-icon-box">{icon}</div>
      </div>

      <div className="card-middle">
        <div className="metric-value font-mono">{value}</div>
        {alertBadge && (
          <span className="metric-alert-badge">{alertBadge}</span>
        )}
      </div>

      <div className="card-bottom">
        {trendText && (
          <div className={`trend-indicator trend-${trend}`}>
            {trend === 'up' && <ArrowUpRight size={14} />}
            {trend === 'down' && <ArrowDownRight size={14} />}
            <span>{trendText}</span>
          </div>
        )}
        {subtext && <span className="card-subtext">{subtext}</span>}
      </div>
    </div>
  );
};
