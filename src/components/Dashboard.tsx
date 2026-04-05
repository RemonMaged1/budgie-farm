import { Bird, Pair, BreedingRecord, FinancialRecord, Alert } from '../types';
import { formatDate, getRelativeTime } from '../store';

interface Props {
  birds: Bird[];
  pairs: Pair[];
  breeding: BreedingRecord[];
  finance: FinancialRecord[];
  alerts: Alert[];
  onNavigate: (page: string) => void;
  onDelete?: (id: string) => void;
}

export default function Dashboard({ birds, pairs, breeding, finance, alerts, onNavigate, onDelete }: Props) {
  const totalBirds = birds.filter(b => b.status !== 'dead' && b.status !== 'sold').length;
  const males = birds.filter(b => b.gender === 'male' && b.status !== 'dead' && b.status !== 'sold').length;
  const females = birds.filter(b => b.gender === 'female' && b.status !== 'dead' && b.status !== 'sold').length;
  const activePairs = pairs.filter(p => p.status === 'active').length;
  const sickBirds = birds.filter(b => b.status === 'sick').length;
  const activeBreeding = breeding.filter(b => b.status !== 'weaned' && b.status !== 'failed').length;
  const totalEggs = breeding.filter(b => b.status === 'eggs').reduce((sum, b) => sum + b.eggCount, 0);
  const totalChicks = breeding.filter(b => b.status === 'feeding').reduce((sum, b) => sum + b.hatchedCount, 0);
  
  const totalIncome = finance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const netProfit = totalIncome - totalExpense;
  
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const today = new Date().toISOString().split('T')[0];
  const upcomingHatches = breeding.filter(b => b.status === 'eggs' && b.expectedHatchDate >= today)
    .sort((a, b) => a.expectedHatchDate.localeCompare(b.expectedHatchDate))
    .slice(0, 5);

  const statCards = [
    { label: 'إجمالي الطيور', value: totalBirds, icon: '🐦', color: 'from-blue-600 to-blue-800', sub: `♂ ${males} | ♀ ${females}` },
    { label: 'الأزواج النشطة', value: activePairs, icon: '💕', color: 'from-pink-600 to-pink-800', sub: `${pairs.length} إجمالي` },
    { label: 'تفريخ نشط', value: activeBreeding, icon: '🥚', color: 'from-amber-600 to-amber-800', sub: `${totalEggs} بيضة | ${totalChicks} فرخ` },
    { label: 'طيور مريضة', value: sickBirds, icon: '🏥', color: 'from-red-600 to-red-800', sub: sickBirds > 0 ? 'تحتاج متابعة!' : 'الحمد لله' },
    { label: 'الإيرادات', value: `${totalIncome}`, icon: '💰', color: 'from-green-600 to-green-800', sub: `ج.م`, isFinance: true },
    { label: 'صافي الربح', value: `${netProfit}`, icon: '📊', color: netProfit >= 0 ? 'from-emerald-600 to-emerald-800' : 'from-red-600 to-red-800', sub: `ج.م`, isFinance: true },
  ];

  const colorStats = birds.filter(b => b.status !== 'dead' && b.status !== 'sold').reduce((acc, bird) => {
    const color = bird.color || 'غير محدد';
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl animate-float">🐦</span>
            لوحة التحكم
          </h1>
          <p className="text-slate-400 mt-1">{formatDate(today)} - مرحباً بك في مزرعتك</p>
        </div>
        {unreadAlerts > 0 && (
          <button
            onClick={() => onNavigate('alerts')}
            className="relative bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <span className="text-xl">🔔</span>
            <span>{unreadAlerts} تنبيه جديد</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 card-hover cursor-pointer relative overflow-hidden`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 rounded-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{card.icon}</span>
                <span className="text-white/60 text-sm font-medium">{card.label}</span>
              </div>
              <div className="text-3xl font-bold text-white">{card.value}</div>
              <div className="text-white/70 text-sm mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hatches */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🐣</span> فقس قادم
          </h3>
          {upcomingHatches.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-4xl block mb-2">🥚</span>
              لا يوجد فقس قادم حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingHatches.map(record => {
                const pair = pairs.find(p => p.id === record.pairId);
                const maleBird = pair ? birds.find(b => b.id === pair.maleId) : null;
                const femaleBird = pair ? birds.find(b => b.id === pair.femaleId) : null;
                return (
                  <div key={record.id} className="bg-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">
                        {maleBird?.name || '?'} × {femaleBird?.name || '?'}
                      </div>
                      <div className="text-slate-400 text-xs">{record.eggCount} بيضة</div>
                    </div>
                    <div className="text-left">
                      <div className="text-amber-400 text-sm font-medium">{getRelativeTime(record.expectedHatchDate)}</div>
                      <div className="text-slate-400 text-xs">{formatDate(record.expectedHatchDate)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Color Distribution */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🎨</span> توزيع الألوان
          </h3>
          {Object.keys(colorStats).length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-4xl block mb-2">🎨</span>
              لا توجد طيور مسجلة
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(colorStats).sort((a, b) => b[1] - a[1]).map(([color, count]) => (
                <div key={color} className="flex items-center gap-3">
                  <span className="text-slate-300 text-sm w-24 truncate">{color}</span>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-l from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end px-2 transition-all duration-500"
                      style={{ width: `${Math.max((count / totalBirds) * 100, 15)}%` }}
                    >
                      <span className="text-white text-xs font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>⚡</span> إجراءات سريعة
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'إضافة طائر', icon: '➕', page: 'birds' },
            { label: 'تكوين زوج', icon: '💑', page: 'pairs' },
            { label: 'تسجيل بيض', icon: '🥚', page: 'breeding' },
            { label: 'سجل صحي', icon: '💊', page: 'health' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate(action.page)}
              className="bg-slate-700/30 hover:bg-slate-700/60 rounded-xl p-4 text-center transition-all card-hover"
            >
              <span className="text-3xl block mb-2">{action.icon}</span>
              <span className="text-slate-300 text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
