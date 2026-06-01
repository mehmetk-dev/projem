import * as T from './types';
import { Empty, Card } from './ui';

export default function AnalyticsModule({ analytics }: { analytics: T.AnalyticsData }) {
  const maxCount = Math.max(...analytics.topPages.map((p) => p.count), 1);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">İstatistikler</h1><p className="text-sm text-neutral-500 mt-1">Ziyaretçi verileri</p></div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Toplam', value: analytics.total },
          { label: 'Bugün', value: analytics.today },
          { label: 'Bu Hafta', value: analytics.week },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-neutral-900/30 border border-white/5">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[11px] text-neutral-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <h2 className="font-bold text-sm mb-4">En Çok Görüntülenen Sayfalar</h2>
        {analytics.topPages.length === 0 ? <Empty /> : (
          <div className="space-y-3">
            {analytics.topPages.map((p) => (
              <div key={p.page}>
                <div className="flex justify-between text-sm mb-1.5"><span className="text-neutral-300">{p.page}</span><span className="text-neutral-500">{p.count}</span></div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-white/20 transition-all" style={{ width: `${(p.count / maxCount) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
