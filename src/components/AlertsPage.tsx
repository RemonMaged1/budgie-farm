import { Alert } from '../types';
import { formatDate } from '../store';

interface Props {
  alerts: Alert[];
  onUpdate: (alerts: Alert[]) => void;
  onDelete?: (id: string) => void; // ✅ تم الإضافة بدقة
}

export default function AlertsPage({ alerts, onUpdate, onDelete }: Props) { // ✅ تم استقبال onDelete
  const markAsRead = (id: string) => {
    onUpdate(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    onUpdate(alerts.map(a => ({ ...a, read: true })));
  };

  // ✅ تم تعديل دالة الحذف لتتزامن مع السحابة قبل تحديث الواجهة
  const deleteAlert = async (id: string) => {
    if (onDelete) await onDelete(id);
    onUpdate(alerts.filter(a => a.id !== id));
  };

  // ✅ تم تعديل دالة الحذف الكل لتتزامن مع السحابة
  const clearAll = async () => {
    if (confirm('هل أنت متأكد من حذف جميع التنبيهات؟ سيتم حذفها نهائياً من السحابة.')) {
      // حذف كل التنبيهات من السحابة واحدة بواحدة
      if (onDelete) {
        for (const alert of alerts) {
          await onDelete(alert.id);
        }
      }
      onUpdate([]);
    }
  };

  const priorityConfig: Record<string, { color: string; icon: string; label: string }> = {
    low: { color: 'border-slate-500/30 bg-slate-500/10', icon: 'ℹ️', label: 'منخفض' },
    medium: { color: 'border-blue-500/30 bg-blue-500/10', icon: '📢', label: 'متوسط' },
    high: { color: 'border-amber-500/30 bg-amber-500/10', icon: '⚠️', label: 'عالي' },
    critical: { color: 'border-red-500/30 bg-red-500/10', icon: '🚨', label: 'حرج' },
  };

  const typeIcons: Record<string, string> = {
    hatch: '🐣',
    wean: '🐦',
    inbreeding: '⛔',
    health: '🏥',
    general: '📋',
  };

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🔔</span>
            التنبيهات
          </h1>
          <p className="text-slate-400 mt-1">{unread} تنبيه غير مقروء من {alerts.length}</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-sm transition-all"
            >
              ✓ تعليم الكل كمقروء
            </button>
          )}
          {alerts.length > 0 && (
            <button
              onClick={clearAll}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm transition-all"
            >
              🗑️ حذف الكل
            </button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/30">
          <span className="text-6xl block mb-4">🔕</span>
          <p className="text-slate-400 text-lg">لا توجد تنبيهات</p>
          <p className="text-slate-500 text-sm mt-1">ستظهر التنبيهات تلقائياً عند اقتراب مواعيد الفقس والفطام</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            const p = { critical: 0, high: 1, medium: 2, low: 3 };
            return (p[a.priority] || 3) - (p[b.priority] || 3);
          }).map((alert, i) => {
            const pc = priorityConfig[alert.priority] || priorityConfig.low;
            return (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border transition-all animate-slideIn ${pc.color} ${
                  alert.read ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{typeIcons[alert.type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      )}
                      <p className={`font-medium text-sm ${alert.read ? 'text-slate-400' : 'text-white'}`}>
                        {alert.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-500 text-xs">{formatDate(alert.date)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${pc.color}`}>{pc.icon} {pc.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!alert.read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                        title="تعليم كمقروء"
                      >✓</button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors p-1"
                      title="حذف"
                    >✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}