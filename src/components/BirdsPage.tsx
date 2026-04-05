import { useState } from 'react';
import { Bird } from '../types';
import { generateId } from '../store';

interface Props {
  birds: Bird[];
  onUpdate: (birds: Bird[]) => void;
  onDelete?: (id: string) => void; // ✅ تم الإضافة بدقة
}

const COLORS = ['أخضر', 'أزرشق', 'أبيض', 'أصفر', 'رمادي', 'بنفسجي', 'أبيض وأزرق', 'لوتينو', 'ألبينو', 'سباينل', 'كوبالت', 'كريمينو', 'ريمبو', 'أوبالين', 'سيدلت', 'كلير وينج'];

export default function BirdsPage({ birds, onUpdate, onDelete }: Props) { // ✅ تم استقبال onDelete
  const [showForm, setShowForm] = useState(false);
  const [editingBird, setEditingBird] = useState<Bird | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [form, setForm] = useState<Partial<Bird>>({
    gender: 'male',
    status: 'available',
    color: '',
    mutation: '',
    name: '',
    ringNumber: '',
    birthDate: '',
    cageNumber: '',
    notes: '',
    weight: undefined,
    fatherId: '',
    motherId: '',
  });

  const resetForm = () => {
    setForm({
      gender: 'male', status: 'available', color: '', mutation: '', name: '',
      ringNumber: '', birthDate: '', cageNumber: '', notes: '', weight: undefined,
      fatherId: '', motherId: '',
    });
    setEditingBird(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    
    if (editingBird) {
      const updated = birds.map(b => b.id === editingBird.id ? { ...b, ...form } as Bird : b);
      onUpdate(updated);
    } else {
      const newBird: Bird = {
        id: generateId(),
        name: form.name || '',
        ringNumber: form.ringNumber || '',
        gender: form.gender as 'male' | 'female',
        color: form.color || '',
        mutation: form.mutation || '',
        birthDate: form.birthDate || '',
        status: form.status as Bird['status'],
        fatherId: form.fatherId || undefined,
        motherId: form.motherId || undefined,
        weight: form.weight,
        notes: form.notes || '',
        cageNumber: form.cageNumber || '',
        addedDate: new Date().toISOString().split('T')[0],
      };
      onUpdate([...birds, newBird]);
    }
    resetForm();
  };

  // ✅ تم تعديل دالة الحذف لتتزامن مع السحابة قبل تحديث الواجهة
  const deleteBird = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطائر؟ سيتم حذفه نهائياً من السحابة.')) {
      if (onDelete) await onDelete(id);
      onUpdate(birds.filter(b => b.id !== id));
    }
  };

  const editBird = (bird: Bird) => {
    setForm({ ...bird });
    setEditingBird(bird);
    setShowForm(true);
  };

  const filteredBirds = birds.filter(b => {
    const matchSearch = !searchTerm || 
      b.name.includes(searchTerm) || 
      b.ringNumber.includes(searchTerm) || 
      b.color.includes(searchTerm) ||
      b.cageNumber?.includes(searchTerm);
    const matchGender = filterGender === 'all' || b.gender === filterGender;
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchGender && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-500/20 text-green-400',
      paired: 'bg-pink-500/20 text-pink-400',
      sick: 'bg-red-500/20 text-red-400',
      sold: 'bg-amber-500/20 text-amber-400',
      dead: 'bg-slate-500/20 text-slate-400',
    };
    const labels: Record<string, string> = {
      available: 'متاح',
      paired: 'متزوج',
      sick: 'مريض',
      sold: 'مباع',
      dead: 'نافق',
    };
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const getAge = (birthDate: string) => {
    if (!birthDate) return 'غير محدد';
    const diff = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 30) return `${diff} يوم`;
    if (diff < 365) return `${Math.floor(diff / 30)} شهر`;
    return `${Math.floor(diff / 365)} سنة و ${Math.floor((diff % 365) / 30)} شهر`;
  };

  const maleBirds = birds.filter(b => b.gender === 'male' && b.status !== 'dead' && b.status !== 'sold');
  const femaleBirds = birds.filter(b => b.gender === 'female' && b.status !== 'dead' && b.status !== 'sold');

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🐦</span>
            سجل الطيور
          </h1>
          <p className="text-slate-400 mt-1">{birds.length} طائر مسجل</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <span className="text-xl">➕</span> إضافة طائر
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="🔍 بحث بالاسم أو رقم الحلقة أو اللون..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">كل الأجناس</option>
            <option value="male">ذكور ♂</option>
            <option value="female">إناث ♀</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">كل الحالات</option>
            <option value="available">متاح</option>
            <option value="paired">متزوج</option>
            <option value="sick">مريض</option>
            <option value="sold">مباع</option>
            <option value="dead">نافق</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-3 py-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
            >▦ شبكة</button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
            >☰ قائمة</button>
          </div>
        </div>
      </div>

      {/* Bird Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700/50 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              {editingBird ? '✏️ تعديل طائر' : '➕ إضافة طائر جديد'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الاسم *</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="اسم الطائر"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">رقم الحلقة</label>
                <input
                  type="text"
                  value={form.ringNumber || ''}
                  onChange={e => setForm({ ...form, ringNumber: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="رقم الحلقة"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الجنس</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, gender: 'male' })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${form.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
                  >♂ ذكر</button>
                  <button
                    onClick={() => setForm({ ...form, gender: 'female' })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${form.gender === 'female' ? 'bg-pink-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
                  >♀ أنثى</button>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">اللون</label>
                <select
                  value={form.color || ''}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">اختر اللون</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الطفرة / الميوتيشن</label>
                <input
                  type="text"
                  value={form.mutation || ''}
                  onChange={e => setForm({ ...form, mutation: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="نوع الطفرة"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={form.birthDate || ''}
                  onChange={e => setForm({ ...form, birthDate: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الحالة</label>
                <select
                  value={form.status || 'available'}
                  onChange={e => setForm({ ...form, status: e.target.value as Bird['status'] })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="available">متاح</option>
                  <option value="paired">متزوج</option>
                  <option value="sick">مريض</option>
                  <option value="sold">مباع</option>
                  <option value="dead">نافق</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">رقم القفص</label>
                <input
                  type="text"
                  value={form.cageNumber || ''}
                  onChange={e => setForm({ ...form, cageNumber: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="رقم القفص"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الوزن (جرام)</label>
                <input
                  type="number"
                  value={form.weight || ''}
                  onChange={e => setForm({ ...form, weight: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="الوزن بالجرام"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الأب</label>
                <select
                  value={form.fatherId || ''}
                  onChange={e => setForm({ ...form, fatherId: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">غير محدد</option>
                  {maleBirds.map(b => <option key={b.id} value={b.id}>{b.name} ({b.ringNumber || 'بدون حلقة'})</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الأم</label>
                <select
                  value={form.motherId || ''}
                  onChange={e => setForm({ ...form, motherId: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">غير محدد</option>
                  {femaleBirds.map(b => <option key={b.id} value={b.id}>{b.name} ({b.ringNumber || 'بدون حلقة'})</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-400 text-sm mb-1 block">ملاحظات</label>
                <textarea
                  value={form.notes || ''}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  rows={2}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl font-medium transition-all"
              >
                {editingBird ? '💾 حفظ التعديلات' : '➕ إضافة الطائر'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Birds List */}
      {filteredBirds.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/30">
          <span className="text-6xl block mb-4">🐦</span>
          <p className="text-slate-400 text-lg">لا توجد طيور مسجلة</p>
          <p className="text-slate-500 text-sm mt-1">ابدأ بإضافة أول طائر في مزرعتك</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBirds.map((bird, i) => {
            const father = birds.find(b => b.id === bird.fatherId);
            const mother = birds.find(b => b.id === bird.motherId);
            return (
              <div
                key={bird.id}
                className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 card-hover animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bird.gender === 'male' ? 'bg-blue-500/20' : 'bg-pink-500/20'}`}>
                      {bird.gender === 'male' ? '🐦' : '🐤'}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{bird.name}</h3>
                      {bird.ringNumber && <p className="text-slate-400 text-xs">#{bird.ringNumber}</p>}
                    </div>
                  </div>
                  {getStatusBadge(bird.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">الجنس:</span>
                    <span className={bird.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}>
                      {bird.gender === 'male' ? '♂ ذكر' : '♀ أنثى'}
                    </span>
                  </div>
                  {bird.color && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">اللون:</span>
                      <span className="text-white">{bird.color}</span>
                    </div>
                  )}
                  {bird.mutation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">الطفرة:</span>
                      <span className="text-white">{bird.mutation}</span>
                    </div>
                  )}
                  {bird.birthDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">العمر:</span>
                      <span className="text-white">{getAge(bird.birthDate)}</span>
                    </div>
                  )}
                  {bird.cageNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">القفص:</span>
                      <span className="text-white">#{bird.cageNumber}</span>
                    </div>
                  )}
                  {bird.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">الوزن:</span>
                      <span className="text-white">{bird.weight}g</span>
                    </div>
                  )}
                  {(father || mother) && (
                    <div className="border-t border-slate-700/50 pt-2 mt-2">
                      {father && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">الأب:</span>
                          <span className="text-blue-400">{father.name}</span>
                        </div>
                      )}
                      {mother && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">الأم:</span>
                          <span className="text-pink-400">{mother.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editBird(bird)}
                    className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-sm transition-all"
                  >✏️ تعديل</button>
                  <button
                    onClick={() => deleteBird(bird.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 px-4 rounded-xl text-sm transition-all"
                  >🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-right text-slate-400 text-sm font-medium p-4">الطائر</th>
                  <th className="text-right text-slate-400 text-sm font-medium p-4">الجنس</th>
                  <th className="text-right text-slate-400 text-sm font-medium p-4">اللون</th>
                  <th className="text-right text-slate-400 text-sm font-medium p-4">العمر</th>
                  <th className="text-right text-slate-400 text-sm font-medium p-4">القفص</th>
                  <th className="text-right text-slate-400 text-sm font-medium p-4">الحالة</th>
                  <th className="text-right text-slate-400 text-sm font-medium p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredBirds.map(bird => (
                  <tr key={bird.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span>{bird.gender === 'male' ? '🐦' : '🐤'}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{bird.name}</div>
                          {bird.ringNumber && <div className="text-slate-500 text-xs">#{bird.ringNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 text-sm ${bird.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                      {bird.gender === 'male' ? '♂ ذكر' : '♀ أنثى'}
                    </td>
                    <td className="p-4 text-white text-sm">{bird.color || '-'}</td>
                    <td className="p-4 text-slate-300 text-sm">{bird.birthDate ? getAge(bird.birthDate) : '-'}</td>
                    <td className="p-4 text-slate-300 text-sm">{bird.cageNumber || '-'}</td>
                    <td className="p-4">{getStatusBadge(bird.status)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => editBird(bird)} className="text-slate-400 hover:text-white p-1 transition-colors">✏️</button>
                        <button onClick={() => deleteBird(bird.id)} className="text-slate-400 hover:text-red-400 p-1 transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}