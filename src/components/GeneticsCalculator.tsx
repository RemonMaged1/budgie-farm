import { useState, useMemo } from 'react';
import { Bird } from '../types';

interface Genetics {
  base: 'green' | 'blue';
  dark: 0 | 1 | 2;
  grey: boolean;
  spangle: 'none' | 'single' | 'double';
  recPied: boolean;
  opaline: boolean; // Sex-linked
  cinnamon: boolean; // Sex-linked
  ino: boolean; // Sex-linked (Lutino/Albino)
}

interface Prediction {
  sex: 'ذكر' | 'أنثى';
  phenotype: string;
  percent: number;
  genotype: string;
  warning?: string;
}

const TRAIT_NAMES: Record<string, string> = {
  opaline: 'أوبالين',
  cinnamon: 'سينامون',
  ino: 'لوتينو/ألبينو',
  grey: 'رمادي',
  spangle_single: 'سبانجل مفرد',
  spangle_double: 'سبانجل مزدوج',
  recPied: 'بييد متنحي',
};

const DARK_NAMES = { 0: '', 1: 'داكنة مفردة', 2: 'داكنة مزدوجة' };

export default function GeneticsCalculator({ birds }: { birds?: Bird[] }) {
  const [selectedMale, setSelectedMale] = useState<string>('');
  const [selectedFemale, setSelectedFemale] = useState<string>('');
  const [manualMode, setManualMode] = useState(true);

  const [male, setMale] = useState<Genetics>({
    base: 'green', dark: 0, grey: false, spangle: 'none',
    recPied: false, opaline: false, cinnamon: false, ino: false,
  });
  const [female, setFemale] = useState<Genetics>({
    base: 'green', dark: 0, grey: false, spangle: 'none',
    recPied: false, opaline: false, cinnamon: false, ino: false,
  });

  const [results, setResults] = useState<Prediction[]>([]);
  const [showTips, setShowTips] = useState(false);

  // 🧮 محرك الحساب الجيني الديناميكي
  const calculate = () => {
    const preds: Prediction[] = [];
    
    // 1. حساب اللون الأساسي + عامل الدكنة
    const mGreen = male.base === 'green';
    const fGreen = female.base === 'green';
    const baseCombos = [];
    
    if (mGreen && fGreen) {
      baseCombos.push({ green: 0.75, blue: 0.25 });
    } else if (mGreen !== fGreen) {
      baseCombos.push({ green: 0.5, blue: 0.5 });
    } else {
      baseCombos.push({ green: 0, blue: 1 });
    }

    // عامل الدكنة (سيادة غير تامة)
    const totalDark = male.dark + female.dark;
    const darkDist = totalDark === 0 ? { 0: 1, 1: 0, 2: 0 } :
                     totalDark === 1 ? { 0: 0.5, 1: 0.5, 2: 0 } :
                     totalDark === 2 ? { 0: 0.25, 1: 0.5, 2: 0.25 } :
                     totalDark === 3 ? { 0: 0, 1: 0.5, 2: 0.5 } :
                     { 0: 0, 1: 0, 2: 1 };

    // 2. الطفرات المرتبطة بالجنس (ZW System)
    // الذكر ZZ، الأنثى ZW. الأنثى تظهر الطفرة لو ورثت Z الحامل لها.
    const mSL = [male.opaline, male.cinnamon, male.ino].filter(Boolean).length;
    const fSL = [female.opaline, female.cinnamon, female.ino].filter(Boolean).length;

    // حساب الاحتمالات حسب الجنس
    const addPred = (sex: 'ذكر' | 'أنثى', baseProb: number, darkProb: number, traits: string[], warning?: string) => {
      if (baseProb * darkProb < 0.03) return; // تجاهل النتائج أقل من 3%
      const baseName = baseProb > 0.5 ? 'أخضر' : 'أزرق';
      const darkName = DARK_NAMES[Object.keys(darkDist).find(k => Math.round(darkProb * 100) === Math.round((darkDist as any)[k] * 100)) || '0'];
      const traitStr = traits.filter(Boolean).join(' ');
      const phenotype = [darkName, baseName, traitStr].filter(Boolean).join(' ');
      
      preds.push({
        sex,
        phenotype: phenotype || 'طبيعي',
        percent: Math.round(baseProb * darkProb * 100),
        genotype: `Base:${baseName} | Dark:${darkName || '0'} | SL:${traits.join(',') || 'لا'}`,
        warning
      });
    };

    // ذكور (ZZ)
    for (const [darkKey, darkP] of Object.entries(darkDist)) {
      const d = Number(darkKey);
      const isGreen = baseCombos[0].green > baseCombos[0].blue;
      addPred('ذكر', isGreen ? 0.5 : 0.5, darkP as number, [], mSL === 2 ? 'ذكر حامل مزدوج للصفات المرتبطة بالجنس' : undefined);
    }

    // إناث (ZW)
    const femaleSLChance = mSL > 0 ? 1 : fSL > 0 ? 0.5 : 0;
    const femaleTraits = [];
    if (male.opaline) femaleTraits.push('أوبالين');
    if (male.cinnamon) femaleTraits.push('سينامون');
    if (male.ino) femaleTraits.push('لوتينو');
    
    for (const [darkKey, darkP] of Object.entries(darkDist)) {
      const d = Number(darkKey);
      const isGreen = baseCombos[0].green > baseCombos[0].blue;
      const p = isGreen ? 0.5 : 0.5;
      addPred('أنثى', p * (femaleSLChance || 0.5), darkP as number, femaleTraits, 
              fSL > 0 && mSL === 0 ? '⚠️ الأنثى تظهر الصفة، الذكور ستكون حاملة فقط' : undefined);
    }

    // 🚨 تحذيرات التزاوج الخطرة
    if (male.ino && female.ino) preds.push({ sex: 'كلاهما', phenotype: '⛔ تزاوج خطير', percent: 100, genotype: 'لا تنتج فراخ حية بنسبة عالية', warning: 'تزاوج لوتينو/ألبينو × لوتينو/ألبينو ينتج فراخ ميتة أو ضعيفة جداً' });
    if (male.spangle === 'double' && female.spangle === 'double') preds.push({ sex: 'كلاهما', phenotype: '⛔ تزاوج خطير', percent: 100, genotype: 'سبانجل مزدوج × سبانجل مزدوج = فراخ ميتة', warning: 'السبانجل المزدوج عامل مميت، تجنب هذا التزاوج' });
    if (male.recPied && female.recPied) preds.push({ sex: 'كلاهما', phenotype: '✅ بييد متنحي نقي', percent: 100, genotype: 'كل الفراخ ستظهر البييد', warning: 'تزاوج ممتاز لإنتاج بييد نقي' });

    // ترتيب النتائج حسب النسبة
    const sorted = preds.sort((a, b) => b.percent - a.percent);
    setResults(sorted.filter(r => r.percent >= 3));
    setShowTips(true);
  };

  // تحميل بيانات طائر من المزرعة
  const loadBirdData = (bird: Bird, isMale: boolean) => {
    const target = isMale ? setMale : setFemale;
    target({
      base: bird.color?.toLowerCase().includes('أزرق') || bird.color?.toLowerCase().includes('blue') ? 'blue' : 'green',
      dark: bird.mutation?.includes('داكنة') ? 1 : 0,
      grey: bird.mutation?.includes('رمادي') || false,
      spangle: bird.mutation?.includes('سبانجل') ? 'single' : 'none',
      recPied: bird.mutation?.includes('بييد') || false,
      opaline: bird.mutation?.includes('أوبالين') || false,
      cinnamon: bird.mutation?.includes('سينامون') || false,
      ino: bird.color?.toLowerCase().includes('لوتينو') || bird.color?.toLowerCase().includes('ألبينو') || false,
    });
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🧬</span>
            حاسبة الوراثة المتقدمة
          </h1>
          <p className="text-slate-400 mt-1">توقع ألوان الطفرات ونسب الفقس بدقة علمية</p>
        </div>
        <button
          onClick={() => setManualMode(!manualMode)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            manualMode ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {manualMode ? '🔄 استخدام طيور من المزرعة' : '✏️ إدخال يدوي'}
        </button>
      </div>

      {!manualMode && birds && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={selectedMale}
            onChange={e => {
              setSelectedMale(e.target.value);
              const b = birds.find(x => x.id === e.target.value);
              if (b) loadBirdData(b, true);
            }}
            className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="">-- اختر الذكر من المزرعة --</option>
            {birds.filter(b => b.gender === 'male').map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.color})</option>
            ))}
          </select>
          <select
            value={selectedFemale}
            onChange={e => {
              setSelectedFemale(e.target.value);
              const b = birds.find(x => x.id === e.target.value);
              if (b) loadBirdData(b, false);
            }}
            className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="">-- اختر الأنثى من المزرعة --</option>
            {birds.filter(b => b.gender === 'female').map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.color})</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(['male', 'female'] as const).map(sex => {
          const isMale = sex === 'male';
          const data = isMale ? male : female;
          const set = isMale ? setMale : setFemale;
          const color = isMale ? 'blue' : 'pink';
          
          return (
            <div key={sex} className={`bg-slate-800/50 rounded-2xl p-5 border border-${color}-500/30 space-y-4`}>
              <div className={`flex items-center gap-2 text-${color}-400 font-bold text-lg`}>
                <span>{isMale ? '♂ الذكر' : '♀ الأنثى'}</span>
                <span className={`text-xs bg-${color}-500/20 px-2 py-1 rounded`}>{isMale ? 'ZZ' : 'ZW'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="text-slate-400 text-sm">اللون الأساسي</label>
                <select value={data.base} onChange={e => set({...data, base: e.target.value as any})} className="col-span-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="green">أخضر (سائد)</option>
                  <option value="blue">أزرق (متنحي)</option>
                </select>

                <label className="text-slate-400 text-sm">عامل الدكنة</label>
                <select value={data.dark} onChange={e => set({...data, dark: Number(e.target.value) as any})} className="col-span-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                  <option value={0}>0 (عادي / فاتح)</option>
                  <option value={1}>1 (مفرد / كوبالت)</option>
                  <option value={2}>2 (مزدوج / غامق)</option>
                </select>

                {(['grey', 'recPied'] as const).map(t => (
                  <div key={t} className="col-span-2 flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <span className="text-slate-300 text-sm">{TRAIT_NAMES[t] || t}</span>
                    <input type="checkbox" checked={(data as any)[t]} onChange={e => set({...data, [t]: e.target.checked})} className="w-5 h-5 accent-blue-500" />
                  </div>
                ))}

                {(['spangle'] as const).map(t => (
                  <div key={t} className="col-span-2">
                    <label className="text-slate-400 text-sm mb-1 block">سبانجل</label>
                    <select value={data.spangle} onChange={e => set({...data, spangle: e.target.value as any})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                      <option value="none">طبيعي</option>
                      <option value="single">مفرد (ظاهر)</option>
                      <option value="double">مزدوج (نادر/خطير)</option>
                    </select>
                  </div>
                ))}

                {(['opaline', 'cinnamon', 'ino'] as const).map(t => (
                  <div key={t} className="col-span-2 flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-amber-500/20">
                    <span className="text-amber-300 text-sm">{TRAIT_NAMES[t]}</span>
                    <input type="checkbox" checked={(data as any)[t]} onChange={e => set({...data, [t]: e.target.checked})} className="w-5 h-5 accent-amber-500" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-l from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
      >
        🔍 حساب النسب المتوقعة
      </button>

      {results.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 animate-fadeIn space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><span>📊</span> النتائج المتوقعة</h3>
          
          {results.filter(r => r.warning).map((r, i) => (
            <div key={`warn-${i}`} className={`p-4 rounded-xl border ${r.warning.includes('خطير') ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-green-500/10 border-green-500/30 text-green-300'}`}>
              <strong>⚠️ {r.phenotype}</strong>
              <p className="text-sm mt-1 opacity-90">{r.warning}</p>
            </div>
          ))}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600/50 text-slate-400">
                  <th className="text-right py-3 px-2">الطراز الظاهري</th>
                  <th className="text-center py-3 px-2">النسبة</th>
                  <th className="text-center py-3 px-2">الجنس</th>
                  <th className="text-right py-3 px-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {results.filter(r => !r.warning).map((r, i) => (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                    <td className="py-3 px-2 text-white font-medium">{r.phenotype}</td>
                    <td className="py-3 px-2 text-center text-blue-400 font-bold">{r.percent}%</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        r.sex === 'ذكر' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                      }`}>{r.sex}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">{r.genotype}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTips && results.length > 0 && (
        <div className="bg-gradient-to-l from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4">📘 نصائح التزاوج الذكية</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>🔹 لتوليد إناث ملونة، استخدم ذكراً يحمل الطفرة المرتبطة بالجنس أو يظهرها.</li>
            <li>🔹 الذكور لا تظهر الطفرات المرتبطة بالجنس إلا إذا كانت مزدوجة، لكنها تنقلها للإناث بنسبة 100%.</li>
            <li>🔹 تجنب تزاوج الطيور المتنحية النقية مع بعضها إلا إذا كان هدفك تثبيت الصفة.</li>
            <li>🔹 عامل الدكنة يعمل بشكل تراكمي: 1+0=مفرد، 1+1=50% مزدوج، 2+2=100% مزدوج.</li>
          </ul>
        </div>
      )}
    </div>
  );
}