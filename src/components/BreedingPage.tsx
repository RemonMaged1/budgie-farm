import { useState } from 'react';
import { Bird, Pair, BreedingRecord } from '../types';
import { generateId, formatDate, addDays, getRelativeTime } from '../store';

interface Props {
  birds: Bird[];
  pairs: Pair[];
  breeding: BreedingRecord[];
  onUpdate: (breeding: BreedingRecord[]) => void;
}

const INCUBATION_DAYS = 18;
const WEAN_DAYS = 35;

export default function BreedingPage({ birds, pairs, breeding, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPair, setSelectedPair] = useState('');
  const [eggDate, setEggDate] = useState(new Date().toISOString().split('T')[0]);
  const [eggCount, setEggCount] = useState(4);
  const [notes, setNotes] = useState('');

  const activePairs = pairs.filter(p => p.status === 'active');

  const handleSubmit = () => {
    if (!selectedPair) return;

    const newRecord: BreedingRecord = {
      id: generateId(),
      pairId: selectedPair,
      eggDate,
      eggCount,
      fertileEggs: eggCount,
      expectedHatchDate: addDays(eggDate, INCUBATION_DAYS),
      hatchedCount: 0,
      expectedWeanDate: addDays(eggDate, INCUBATION_DAYS + WEAN_DAYS),
      chickIds: [],
      status: 'eggs',
      notes,
    };

    onUpdate([...breeding, newRecord]);
    setShowForm(false);
    setSelectedPair('');
    setNotes('');
  };

  const updateStatus = (id: string, status: BreedingRecord['status'], hatchedCount?: number) => {
    const updated = breeding.map(b => {
      if (b.id === id) {
        const updates: Partial<BreedingRecord> = { status };
        if (status === 'hatching' || status === 'feeding') {
          updates.actualHatchDate = new Date().toISOString().split('T')[0];
          if (hatchedCount !== undefined) updates.hatchedCount = hatchedCount;
          updates.expectedWeanDate = addDays(new Date().toISOString().split('T')[0], WEAN_DAYS);
        }
        if (status === 'weaned') {
          updates.actualWeanDate = new Date().toISOString().split('T')[0];
        }
        return { ...b, ...updates };
      }
      return b;
    });
    onUpdate(updated);
  };

  const deleteRecord = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      onUpdate(breeding.filter(b => b.id !== id));
    }
  };

  const [hatchInput, setHatchInput] = useState<Record<string, number>>({});

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; label: string; bg: string; color: string }> = {
      eggs: { icon: '🥚', label: 'بيض', bg: 'bg-amber-500/20', color: 'text-amber-400' },
      hatching: { icon: '🐣', label: 'فقس', bg: 'bg-yellow-500/20', color: 'text-yellow-400' },
      feeding: { icon: '🐥', label: 'تغذية', bg: 'bg-green-500/20', color: 'text-green-400' },
      weaned: { icon: '🐦', label: 'مفطوم', bg: 'bg-blue-500/20', color: 'text-blue-400' },
      failed: { icon: '❌', label: 'فاشل', bg: 'bg-red-500/20', color: 'text-red-400' },
    };
    return configs[status] || configs.eggs;
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🥚</span>
            إدارة التفريخ
          </h1>
          <p className="text-slate-400 mt-1">{breeding.filter(b => b.status !== 'weaned' && b.status !== 'failed').length} عش نشط</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-l from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <span className="text-xl">🥚</span> تسجيل بيض جديد
        </button>
      </div>

      {/* Timeline Info */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2"><span>📋</span> معلومات التفريخ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <span className="text-2xl block">🥚</span>
            <div className="text-amber-400 font-bold mt-1">فترة الحضانة</div>
            <div className="text-amber-300/70 text-sm">{INCUBATION_DAYS} يوم</div>
          </div>
          <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
            <span className="text-2xl block">🐥</span>
            <div className="text-green-400 font-bold mt-1">فترة التغذية</div>
            <div className="text-green-300/70 text-sm">{WEAN_DAYS} يوم</div>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20">
            <span className="text-2xl block">🐦</span>
            <div className="text-blue-400 font-bold mt-1">إجمالي</div>
            <div className="text-blue-300/70 text-sm">{INCUBATION_DAYS + WEAN_DAYS} يوم</div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700/50 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">🥚 تسجيل بيض جديد</h2>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">اختر الزوج</label>
                <select
                  value={selectedPair}
                  onChange={e => setSelectedPair(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">-- اختر الزوج --</option>
                  {activePairs.map(p => {
                    const male = birds.find(b => b.id === p.maleId);
                    const female = birds.find(b => b.id === p.femaleId);
                    return (
                      <option key={p.id} value={p.id}>
                        {male?.name || '?'} × {female?.name || '?'} (قفص #{p.cageNumber || '?'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">تاريخ وضع البيض</label>
                <input
                  type="date"
                  value={eggDate}
                  onChange={e => setEggDate(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">عدد البيض</label>
                <input
                  type="number"
                  value={eggCount}
                  onChange={e => setEggCount(Number(e.target.value))}
                  min={1}
                  max={12}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {selectedPair && eggDate && (
                <div className="bg-slate-700/30 rounded-xl p-3 space-y-1">
                  <div className="text-slate-400 text-sm flex justify-between">
                    <span>📅 تاريخ الفقس المتوقع:</span>
                    <span className="text-amber-400 font-medium">{formatDate(addDays(eggDate, INCUBATION_DAYS))}</span>
                  </div>
                  <div className="text-slate-400 text-sm flex justify-between">
                    <span>📅 تاريخ الفطام المتوقع:</span>
                    <span className="text-green-400 font-medium">{formatDate(addDays(eggDate, INCUBATION_DAYS + WEAN_DAYS))}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400 text-sm mb-1 block">ملاحظات</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!selectedPair}
                className="flex-1 bg-gradient-to-l from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all"
              >
                🥚 تسجيل البيض
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
      {breeding.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/30">
          <span className="text-6xl block mb-4">🥚</span>
          <p className="text-slate-400 text-lg">لا توجد سجلات تفريخ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {breeding.sort((a, b) => b.eggDate.localeCompare(a.eggDate)).map((record, i) => {
            const pair = pairs.find(p => p.id === record.pairId);
            const male = pair ? birds.find(b => b.id === pair.maleId) : null;
            const female = pair ? birds.find(b => b.id === pair.femaleId) : null;
            const statusConfig = getStatusConfig(record.status);
            const today = new Date().toISOString().split('T')[0];

            return (
              <div
                key={record.id}
                className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 card-hover animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{statusConfig.icon}</span>
                    <div>
                      <h3 className="text-white font-bold">
                        {male?.name || '?'} × {female?.name || '?'}
                      </h3>
                      <p className="text-slate-400 text-sm">قفص #{pair?.cageNumber || '?'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>بيض</span>
                    <span>فقس</span>
                    <span>تغذية</span>
                    <span>فطام</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        record.status === 'failed' ? 'bg-red-500' :
                        record.status === 'eggs' ? 'bg-amber-500 w-1/4' :
                        record.status === 'hatching' ? 'bg-yellow-500 w-2/4' :
                        record.status === 'feeding' ? 'bg-green-500 w-3/4' :
                        'bg-blue-500 w-full'
                      }`}
                      style={{
                        width: record.status === 'failed' ? '100%' :
                          record.status === 'eggs' ? '25%' :
                          record.status === 'hatching' ? '50%' :
                          record.status === 'feeding' ? '75%' : '100%'
                      }}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-700/30 rounded-xl p-2.5 text-center">
                    <div className="text-slate-400 text-xs">عدد البيض</div>
                    <div className="text-white font-bold">{record.eggCount}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-2.5 text-center">
                    <div className="text-slate-400 text-xs">تاريخ البيض</div>
                    <div className="text-white font-bold text-xs">{formatDate(record.eggDate)}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-2.5 text-center">
                    <div className="text-slate-400 text-xs">فقس متوقع</div>
                    <div className={`font-bold text-xs ${record.status === 'eggs' && record.expectedHatchDate <= today ? 'text-red-400' : 'text-amber-400'}`}>
                      {record.status === 'eggs' ? getRelativeTime(record.expectedHatchDate) : (record.actualHatchDate ? formatDate(record.actualHatchDate) : '-')}
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-2.5 text-center">
                    <div className="text-slate-400 text-xs">فطام متوقع</div>
                    <div className={`font-bold text-xs ${record.status === 'feeding' && record.expectedWeanDate && record.expectedWeanDate <= today ? 'text-red-400' : 'text-green-400'}`}>
                      {record.expectedWeanDate ? (record.status === 'weaned' ? formatDate(record.actualWeanDate || '') : getRelativeTime(record.expectedWeanDate)) : '-'}
                    </div>
                  </div>
                </div>

                {record.hatchedCount > 0 && (
                  <div className="text-green-400 text-sm mb-3">🐥 عدد الفراخ: {record.hatchedCount}</div>
                )}

                {record.notes && (
                  <div className="text-slate-500 text-xs mb-3">📝 {record.notes}</div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {record.status === 'eggs' && (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={hatchInput[record.id] ?? record.eggCount}
                          onChange={e => setHatchInput({ ...hatchInput, [record.id]: Number(e.target.value) })}
                          min={0}
                          max={record.eggCount}
                          className="w-16 bg-slate-700/50 border border-slate-600/50 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none"
                          placeholder="عدد"
                        />
                        <button
                          onClick={() => updateStatus(record.id, 'feeding', hatchInput[record.id] ?? record.eggCount)}
                          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 py-1.5 px-4 rounded-xl text-sm transition-all"
                        >🐣 تم الفقس</button>
                      </div>
                      <button
                        onClick={() => updateStatus(record.id, 'failed')}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 px-4 rounded-xl text-sm transition-all"
                      >❌ فشل</button>
                    </>
                  )}
                  {record.status === 'feeding' && (
                    <button
                      onClick={() => updateStatus(record.id, 'weaned')}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-1.5 px-4 rounded-xl text-sm transition-all"
                    >🐦 تم الفطام</button>
                  )}
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 px-4 rounded-xl text-sm transition-all mr-auto"
                  >🗑️ حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
