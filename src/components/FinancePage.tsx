import { useState } from 'react';
import { FinancialRecord } from '../types';
import { generateId, formatDate } from '../store';

interface Props {
  finance: FinancialRecord[];
  onUpdate: (finance: FinancialRecord[]) => void;
}

const EXPENSE_CATEGORIES = ['أعلاف', 'أقفاص', 'أدوية', 'فيتامينات', 'أدوات', 'كهرباء', 'إيجار', 'نقل', 'أخرى'];
const INCOME_CATEGORIES = ['بيع طيور', 'بيع فراخ', 'بيع بيض', 'بيع أعشاش', 'أخرى'];

export default function FinancePage({ finance, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = () => {
    if (!form.amount || !form.category) return;

    const record: FinancialRecord = {
      id: generateId(),
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      description: form.description,
    };

    onUpdate([...finance, record]);
    setShowForm(false);
    setForm({ type: 'expense', category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const deleteRecord = (id: string) => {
    if (confirm('هل أنت متأكد؟')) {
      onUpdate(finance.filter(f => f.id !== id));
    }
  };

  const filtered = finance.filter(f => {
    const matchType = filterType === 'all' || f.type === filterType;
    const matchMonth = !filterMonth || f.date.startsWith(filterMonth);
    return matchType && matchMonth;
  });

  const totalIncome = finance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Monthly breakdown
  const monthlyData = finance.reduce((acc, f) => {
    const month = f.date.substring(0, 7);
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    if (f.type === 'income') acc[month].income += f.amount;
    else acc[month].expense += f.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">💰</span>
            الإدارة المالية
          </h1>
          <p className="text-slate-400 mt-1">{finance.length} عملية مالية</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <span className="text-xl">💵</span> إضافة عملية
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-5 card-hover">
          <div className="text-green-100/60 text-sm">الإيرادات</div>
          <div className="text-3xl font-bold text-white mt-2">{totalIncome.toLocaleString()}</div>
          <div className="text-green-100/40 text-sm">ج.م</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-5 card-hover">
          <div className="text-red-100/60 text-sm">المصروفات</div>
          <div className="text-3xl font-bold text-white mt-2">{totalExpense.toLocaleString()}</div>
          <div className="text-red-100/40 text-sm">ج.م</div>
        </div>
        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-emerald-600 to-emerald-800' : 'from-rose-600 to-rose-800'} rounded-2xl p-5 card-hover`}>
          <div className="text-white/60 text-sm">صافي الربح</div>
          <div className="text-3xl font-bold text-white mt-2">{netProfit.toLocaleString()}</div>
          <div className="text-white/40 text-sm">ج.م</div>
        </div>
      </div>

      {/* Monthly Chart */}
      {Object.keys(monthlyData).length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span>📊</span> ملخص شهري</h3>
          <div className="space-y-3">
            {Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0])).map(([month, data]) => (
              <div key={month} className="bg-slate-700/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">
                    {new Date(month + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                  </span>
                  <span className={`font-bold text-sm ${data.income - data.expense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(data.income - data.expense).toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-400">↑ {data.income.toLocaleString()}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-red-400">↓ {data.expense.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700/50 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">💵 عملية مالية جديدة</h2>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">النوع</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, type: 'expense', category: '' })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${form.type === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
                  >📤 مصروف</button>
                  <button
                    onClick={() => setForm({ ...form, type: 'income', category: '' })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${form.type === 'income' ? 'bg-green-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
                  >📥 إيراد</button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">التصنيف</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">-- اختر التصنيف --</option>
                  {(form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">المبلغ (ج.م)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">التاريخ</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">الوصف</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="وصف العملية..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!form.amount || !form.category}
                className="flex-1 bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all"
              >
                💾 حفظ
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

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none"
        >
          <option value="all">الكل</option>
          <option value="income">إيرادات</option>
          <option value="expense">مصروفات</option>
        </select>
        <input
          type="month"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none"
        />
        {filterMonth && (
          <button onClick={() => setFilterMonth('')} className="text-slate-400 hover:text-white text-sm transition-colors">
            ✕ إلغاء الفلتر
          </button>
        )}
      </div>

      {/* Records List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/30">
          <span className="text-5xl block mb-3">💰</span>
          <p className="text-slate-400">لا توجد عمليات مالية</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.sort((a, b) => b.date.localeCompare(a.date)).map((record, i) => (
            <div
              key={record.id}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4 card-hover animate-slideIn"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                record.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {record.type === 'income' ? '📥' : '📤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{record.category}</span>
                  <span className="text-slate-500 text-xs">{formatDate(record.date)}</span>
                </div>
                {record.description && <p className="text-slate-400 text-xs mt-0.5">{record.description}</p>}
              </div>
              <div className={`font-bold text-sm shrink-0 ${record.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString()} ج.م
              </div>
              <button
                onClick={() => deleteRecord(record.id)}
                className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
              >🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
