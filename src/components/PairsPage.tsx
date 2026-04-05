import { useState } from 'react';
import { Bird, Pair } from '../types';
import { generateId, formatDate, checkInbreeding } from '../store';

interface Props {
  birds: Bird[];
  pairs: Pair[];
  onUpdatePairs: (pairs: Pair[]) => void;
  onUpdateBirds: (birds: Bird[]) => void;
  onDeletePair?: (id: string) => void; // ✅ تم الإضافة بدقة
}

export default function PairsPage({ birds, pairs, onUpdatePairs, onUpdateBirds, onDeletePair }: Props) { // ✅ تم استقبال onDeletePair
  const [showForm, setShowForm] = useState(false);
  const [selectedMale, setSelectedMale] = useState('');
  const [selectedFemale, setSelectedFemale] = useState('');
  const [cageNumber, setCageNumber] = useState('');
  const [pairDate, setPairDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const availableMales = birds.filter(b => b.gender === 'male' && b.status === 'available');
  const availableFemales = birds.filter(b => b.gender === 'female' && b.status === 'available');

  const inbreedingCheck = selectedMale && selectedFemale ? checkInbreeding(selectedMale, selectedFemale, birds) : null;

  const handleSubmit = () => {
    if (!selectedMale || !selectedFemale) return;

    const newPair: Pair = {
      id: generateId(),
      maleId: selectedMale,
      femaleId: selectedFemale,
      pairDate,
      cageNumber,
      status: 'active',
      notes,
    };

    onUpdatePairs([...pairs, newPair]);

    // Update bird statuses
    const updatedBirds = birds.map(b => {
      if (b.id === selectedMale || b.id === selectedFemale) {
        return { ...b, status: 'paired' as const, cageNumber };
      }
      return b;
    });
    onUpdateBirds(updatedBirds);

    setShowForm(false);
    setSelectedMale('');
    setSelectedFemale('');
    setCageNumber('');
    setNotes('');
  };

  const separatePair = (pair: Pair) => {
    const updatedPairs = pairs.map(p => p.id === pair.id ? { ...p, status: 'separated' as const } : p);
    onUpdatePairs(updatedPairs);

    const updatedBirds = birds.map(b => {
      if (b.id === pair.maleId || b.id === pair.femaleId) {
        return { ...b, status: 'available' as const };
      }
      return b;
    });
    onUpdateBirds(updatedBirds);
  };

  // ✅ تم تعديل دالة الحذف لتتزامن مع السحابة قبل تحديث الواجهة
  const deletePair = async (pair: Pair) => {
    if (!confirm('هل أنت متأكد من حذف هذا الزوج؟ سيتم حذفه نهائياً من السحابة.')) return;
    
    // 1. احذف من Supabase أولاً
    if (onDeletePair) await onDeletePair(pair.id);
    
    // 2. حدّث الواجهة محلياً
    onUpdatePairs(pairs.filter(p => p.id !== pair.id));
    
    if (pair.status === 'active') {
      const updatedBirds = birds.map(b => {
        if (b.id === pair.maleId || b.id === pair.femaleId) {
          return { ...b, status: 'available' as const };
        }
        return b;
      });
      onUpdateBirds(updatedBirds);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; label: string }> = {
      active: { bg: 'bg-green-500/20 text-green-400', label: '🟢 نشط' },
      separated: { bg: 'bg-red-500/20 text-red-400', label: '🔴 منفصل' },
      resting: { bg: 'bg-amber-500/20 text-amber-400', label: '🟡 راحة' },
    };
    const c = config[status] || config.active;
    return <span className={`px-3 py-1 rounded-lg text-xs font-medium ${c.bg}`}>{c.label}</span>;
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">💕</span>
            إدارة الأزواج
          </h1>
          <p className="text-slate-400 mt-1">{pairs.filter(p => p.status === 'active').length} زوج نشط</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-l from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-pink-500/20"
        >
          <span className="text-xl">💑</span> تكوين زوج جديد
        </button>
      </div>

      {/* Pair Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700/50 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">💑 تكوين زوج جديد</h2>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">اختر الذكر ♂</label>
                <select
                  value={selectedMale}
                  onChange={e => setSelectedMale(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">-- اختر الذكر --</option>
                  {availableMales.map(b => (
                    <option key={b.id} value={b.id}>{b.name} - {b.color} ({b.ringNumber || 'بدون حلقة'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">اختر الأنثى ♀</label>
                <select
                  value={selectedFemale}
                  onChange={e => setSelectedFemale(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">-- اختر الأنثى --</option>
                  {availableFemales.map(b => (
                    <option key={b.id} value={b.id}>{b.name} - {b.color} ({b.ringNumber || 'بدون حلقة'})</option>
                  ))}
                </select>
              </div>

              {/* Inbreeding Warning */}
              {inbreedingCheck && inbreedingCheck.isRelated && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                    <span className="text-2xl">⚠️</span>
                    <span>تحذير: قرابة مكتشفة!</span>
                  </div>
                  <p className="text-red-300 text-sm">
                    نوع القرابة: <strong>{inbreedingCheck.relationship}</strong>
                  </p>
                  {inbreedingCheck.commonAncestors.length > 0 && (
                    <p className="text-red-300 text-sm mt-1">
                      أجداد مشتركين: {inbreedingCheck.commonAncestors.map(id => birds.find(b => b.id === id)?.name || id).join(', ')}
                    </p>
                  )}
                  <p className="text-red-300/70 text-xs mt-2">
                    ⚡ تزاوج الأقارب قد يسبب مشاكل صحية وتشوهات في الفراخ
                  </p>
                </div>
              )}

              {inbreedingCheck && !inbreedingCheck.isRelated && selectedMale && selectedFemale && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="text-xl">✅</span>
                    <span className="font-medium">لا توجد قرابة - زوج ممتاز!</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400 text-sm mb-1 block">تاريخ التزاوج</label>
                <input
                  type="date"
                  value={pairDate}
                  onChange={e => setPairDate(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">رقم القفص</label>
                <input
                  type="text"
                  value={cageNumber}
                  onChange={e => setCageNumber(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="رقم القفص"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">ملاحظات</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!selectedMale || !selectedFemale}
                className="flex-1 bg-gradient-to-l from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all"
              >
                💕 تكوين الزوج
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

      {/* Pairs List */}
      {pairs.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/30">
          <span className="text-6xl block mb-4">💕</span>
          <p className="text-slate-400 text-lg">لا توجد أزواج مسجلة</p>
          <p className="text-slate-500 text-sm mt-1">ابدأ بتكوين أول زوج</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pairs.map((pair, i) => {
            const male = birds.find(b => b.id === pair.maleId);
            const female = birds.find(b => b.id === pair.femaleId);
            return (
              <div
                key={pair.id}
                className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 card-hover animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💑</span>
                    <span className="text-white font-bold">قفص #{pair.cageNumber || '?'}</span>
                  </div>
                  {getStatusBadge(pair.status)}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {/* Male */}
                  <div className="flex-1 bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20">
                    <span className="text-2xl block mb-1">🐦</span>
                    <div className="text-blue-400 font-bold text-sm">{male?.name || 'غير معروف'}</div>
                    <div className="text-blue-300/60 text-xs">{male?.color}</div>
                    <div className="text-blue-300/40 text-xs">♂ ذكر</div>
                  </div>

                  <span className="text-2xl text-pink-400">❤️</span>

                  {/* Female */}
                  <div className="flex-1 bg-pink-500/10 rounded-xl p-3 text-center border border-pink-500/20">
                    <span className="text-2xl block mb-1">🐤</span>
                    <div className="text-pink-400 font-bold text-sm">{female?.name || 'غير معروف'}</div>
                    <div className="text-pink-300/60 text-xs">{female?.color}</div>
                    <div className="text-pink-300/40 text-xs">♀ أنثى</div>
                  </div>
                </div>

                <div className="text-slate-400 text-sm mb-3">
                  📅 تاريخ التزاوج: {formatDate(pair.pairDate)}
                </div>
                {pair.notes && (
                  <div className="text-slate-500 text-xs mb-3">📝 {pair.notes}</div>
                )}

                <div className="flex gap-2">
                  {pair.status === 'active' && (
                    <button
                      onClick={() => separatePair(pair)}
                      className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 py-2 rounded-xl text-sm transition-all"
                    >💔 فصل الزوج</button>
                  )}
                  <button
                    onClick={() => deletePair(pair)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 px-4 rounded-xl text-sm transition-all"
                  >🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}