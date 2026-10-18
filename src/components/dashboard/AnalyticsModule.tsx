'use client';

import { useState } from 'react';
import * as T from './types';
import { Empty, Card, PageHeader, ui } from './ui';

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function AnalyticsModule({ analytics }: { analytics: T.AnalyticsData }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const maxPageCount = Math.max(...analytics.topPages.map((p) => p.count), 1);
  const chartData = analytics.chartData || [];

  // SVG Chart Config
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxViews = Math.max(...chartData.map((d) => d.count), 5);
  // Round up maxViews to a nice step value
  const gridMax = Math.ceil(maxViews / 5) * 5;

  const points = chartData.map((item, i) => {
    const x = paddingLeft + (i * (chartWidth / (chartData.length - 1 || 1)));
    const y = (svgHeight - paddingBottom) - ((item.count / gridMax) * chartHeight);
    return { x, y, date: item.date, count: item.count };
  });

  // SVG Line path string
  const linePath = points.length > 0 
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  // SVG Area under curve path string
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : '';

  return (
    <div className="space-y-6">
      <PageHeader title="İstatistikler" description="Ziyaretçi verileri" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Toplam', value: analytics.total },
          { label: 'Bugün', value: analytics.today },
          { label: 'Bu Hafta', value: analytics.week },
        ].map((s) => (
          <div key={s.label} className={`${ui.card} p-4`}>
            <p className="text-3xl font-semibold tracking-[-0.03em] text-ink">{s.value}</p>
            <p className={`${ui.sectionTitle} mt-1`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly views chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className={ui.sectionTitle}>Haftalık Trafik Eğilimi</h2>
              {hoveredIndex !== null && chartData[hoveredIndex] && (
                <div className="text-xs bg-surface-2 px-2 py-1 rounded-lg border border-line animate-in fade-in zoom-in duration-100">
                  <span className="text-ink-muted mr-1.5">{formatDateShort(chartData[hoveredIndex].date)}:</span>
                  <span className="font-bold text-ink">{chartData[hoveredIndex].count} sayfa gösterimi</span>
                </div>
              )}
            </div>

            {chartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-ink-muted">Veri bulunamadı.</div>
            ) : (
              <div className="relative w-full overflow-x-auto select-none">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                    const y = paddingTop + r * chartHeight;
                    const val = Math.round(gridMax * (1 - r));
                    return (
                      <g key={idx} className="text-ink opacity-20">
                        <line 
                          x1={paddingLeft} 
                          y1={y} 
                          x2={svgWidth - paddingRight} 
                          y2={y} 
                          stroke="currentColor" 
                          strokeWidth="1" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={paddingLeft - 8} 
                          y={y + 4} 
                          textAnchor="end" 
                          fill="currentColor" 
                          className="text-[9px] font-medium"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area under path */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#chartAreaGradient)" />
                  )}

                  {/* Line path */}
                  {linePath && (
                    <path 
                      d={linePath} 
                      fill="none" 
                      strokeWidth="2" 
                      className="stroke-accent" 
                    />
                  )}

                  {/* Data Points and Interaction Circles */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredIndex === idx;
                    return (
                      <g key={idx}>
                        {/* Invisible large hover handle */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="18"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />

                        {/* Visible Point outline */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? "5" : "3.5"}
                          strokeWidth="1.5"
                          className={`stroke-accent transition-all duration-100 pointer-events-none ${isHovered ? 'fill-accent' : 'fill-surface'}`}
                        />

                        {/* Date Label on X axis */}
                        <text
                          x={p.x}
                          y={svgHeight - 12}
                          textAnchor="middle"
                          className={`text-[9px] font-medium transition-colors ${isHovered ? 'fill-ink' : 'fill-ink-muted'}`}
                        >
                          {formatDateShort(p.date)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </Card>
        </div>

        {/* Top Pages list */}
        <div>
          <Card className="h-full">
            <h2 className={`${ui.sectionTitle} mb-4`}>En Çok Görüntülenen Sayfalar</h2>
            {analytics.topPages.length === 0 ? <Empty /> : (
              <div className="space-y-3">
                {analytics.topPages.map((p) => (
                  <div key={p.page}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-ink-soft truncate max-w-[170px]" title={p.page}>{p.page}</span>
                      <span className="text-ink-muted">{p.count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-accent transition-all" 
                        style={{ width: `${(p.count / maxPageCount) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
