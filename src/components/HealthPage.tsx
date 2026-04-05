import { useState } from 'react';
import { Bird, HealthRecord } from '../types';
import { generateId, formatDate } from '../store';

interface Props {
  birds: Bird[];
  health: HealthRecord[];
  onUpdate: (health: HealthRecord[]) => void;
}

export default function HealthPage({ birds, health, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    birdId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'checkup' as HealthRecord['type'],
    description: '',
    treatment: '',
    weight: '',
    notes: '',
  });

  const activeBirds = birds.filter(b => b.status !== 'dead' && b.status !== 'sold');

  const handleSubmit = () => {
    if (!form.birdId || !form.description) return;

    const newRecord: HealthRecord = {
      id: generateId(),
      birdId: form.birdId,
      date: form.date,
      type: form.type,
      description: form.description,
      treatment: form.treatment || undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      notes: form.notes || undefined,
    };

    onUpdate([...health, newRecord]);
    setShowForm(false);
    setForm({
      birdId: '', date: new Date().toISOString().split('T')[0], type: 'checkup',
      description: '', treatment: '', weight: '', notes: '',
    });
  };

  const deleteRecord = (id: string) => {
    if (confirm('هل أنت متأكد؟')) {
      onUpdate(health.filter(h => h.id !== id));
    }
  };

  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    checkup: { icon: '🔍', label: 'فحص', color: 'text-blue-400 bg-blue-500/20' },
    illness: { icon: '🤒', label: 'مرض', color: 'text-red-400 bg-red-500/20' },
    treatment: { icon: '💊', label: 'علاج', color: 'text-green-400 bg-green-500/20' },
    vaccination: { icon: '💉', label: 'تطعيم', color: 'text-purple-400 bg-purple-500/20' },
    weight: { icon: '⚖️', label: 'وزن', color: 'text-amber-400 bg-amber-500/20' },
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🏥</span>
            السجل الصحي
          </h1>
          <p className="text-slate-400 mt-1">{health.length} سجل صحي</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-l from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
        >
          <span className="text-xl">💊</span> إضافة سجل صحي
        </button>
      </div>

      {/* Health Tips */}
      <div className="bg-gradient-to-l from-emerald-900/30 to-teal-900/30 rounded-2xl p-5 border border-emerald-700/30">
        <h3 className="text-emerald-400 font-bold mb-3">💡 نصائح صحية للبادجي</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { tip: 'تغيير الماء يومياً', icon: '💧' },
            { tip: 'تنظيف القفص أسبوعياً', icon: '🧹' },
            { tip: 'توفير الكالسيوم (عظم الحبار)', icon: '🦴' },
            { tip: 'فحص دوري كل شهر', icon: '🔍' },
          ].map((item, i) => (
            <div key={i} className="bg-emerald-500/10 rounded-xl p-3 flex items-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-emerald-300 text-sm">{item.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700/50 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">💊 سجل صحي جديد</h2>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الطائر</label>
                <select
                  value={form.birdId}
                  onChange={e => setForm({ ...form, birdId: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="">-- اختر الطائر --</option>
                  {activeBirds.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.gender === 'male' ? '♂' : '♀'} {b.name} - {b.color}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">النوع</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setForm({ ...form, type: key as HealthRecord['type'] })}
                      className={`rounded-xl p-2 text-center text-xs transition-all border ${
                        form.type === key ? `${config.color} border-current` : 'bg-slate-700/30 text-slate-400 border-slate-700/50'
                      }`}
                    >
                      <span className="text-lg block">{config.icon}</span>
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">التاريخ</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">الوصف</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="وصف الحالة..."
                />
              </div>

              {(form.type === 'illness' || form.type === 'treatment') && (
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">العلاج</label>
                  <input
                    type="text"
                    value={form.treatment}
                    onChange={e => setForm({ ...form, treatment: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    placeholder="العلاج المستخدم..."
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 text-sm mb-1 block">الوزن (جرام) - اختياري</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="الوزن بالجرام"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">ملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!form.birdId || !form.description}
                className="flex-1 bg-gradient-to-l from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all"
              >
                💾 حفظ السجل
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Records */}
      {health.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/30">
          <span className="text-6xl block mb-4">🏥</span>
          <p className="text-slate-400 text-lg">لا توجد سجلات صحية</p>
        </div>
      ) : (
        <div className="space-y-3">
          {health.sort((a, b) => b.date.localeCompare(a.date)).map((record, i) => {
            const b = birds.find(x => x.id === record.birdId);
            const tc = typeConfig[record.type] || typeConfig.checkup;
            return (
              <div
                key={record.id}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-start gap-4 card-hover animate-slideIn"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${tc.color}`}>
                  {tc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{b?.name || 'غير معروف'}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs ${tc.color}`}>{tc.label}</span>
                    <span className="text-slate-500 text-xs">{formatDate(record.date)}</span>
                  </div>
                  <p className="text-slate-300 text-sm mt-1">{record.description}</p>
                  {record.treatment && (
                    <p className="text-green-400/70 text-xs mt-1">💊 العلاج: {record.treatment}</p>
                  )}
                  {record.weight && (
                    <p className="text-amber-400/70 text-xs mt-1">⚖️ الوزن: {record.weight}g</p>
                  )}
                  {record.notes && (
                    <p className="text-slate-500 text-xs mt-1">📝 {record.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteRecord(record.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                >🗑️</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
