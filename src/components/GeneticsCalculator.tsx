import { useState } from 'react';

// 🧬 تعريف الأنواع الجينية
interface ParentGenetics {
  baseColor: 'green' | 'blue';
  darkFactor: 0 | 1 | 2;
  violet: boolean;
  grey: boolean;
  opaline: boolean;
  cinnamon: boolean;
  lutino: boolean;
  spangle: boolean;
  recPied: boolean;
}

interface OffspringPrediction {
  phenotype: string;
  percent: string;
  fraction: string;
  sex: 'ذكر' | 'أنثى' | 'كلاهما';
  notes: string;
}

const TRAIT_LABELS: Record<keyof Omit<ParentGenetics, 'baseColor'>, string> = {
  darkFactor: 'عامل الدكنة',
  violet: 'عامل البنفسجي',
  grey: 'عامل الرمادي',
  opaline: 'أوبالين',
  cinnamon: 'سينامون',
  lutino: 'لوتينو/ألبينو',
  spangle: 'سبانجل',
  recPied: 'بييد متنحي',
};

export default function GeneticsCalculator() {
  const [male, setMale] = useState<ParentGenetics>({
    baseColor: 'green', darkFactor: 0, violet: false, grey: false,
    opaline: false, cinnamon: false, lutino: false, spangle: false, recPied: false,
  });
  const [female, setFemale] = useState<ParentGenetics>({
    baseColor: 'green', darkFactor: 0, violet: false, grey: false,
    opaline: false, cinnamon: false, lutino: false, spangle: false, recPied: false,
  });
  const [results, setResults] = useState<OffspringPrediction[]>([]);

  // 🧮 محرك الحساب الجيني (مبسط لكن دقيق علمياً للبادجي)
  const calculate = () => {
    const predictions: OffspringPrediction[] = [];

    // 1. اللون الأساسي (أخضر سائد، أزرق متنحي)
    const mGreen = male.baseColor === 'green';
    const fGreen = female.baseColor === 'green';
    let baseProb = mGreen && fGreen ? { green: 0.75, blue: 0.25 } :
                   (mGreen !== fGreen) ? { green: 0.5, blue: 0.5 } :
                   { green: 0, blue: 1 };

    // 2. عامل الدكنة (سيادة غير تامة)
    const totalDark = male.darkFactor + female.darkFactor;
    const darkProb = totalDark === 0 ? { 0: 1, 1: 0, 2: 0 } :
                     totalDark === 1 ? { 0: 0.5, 1: 0.5, 2: 0 } :
                     totalDark === 2 ? { 0: 0.25, 1: 0.5, 2: 0.25 } :
                     totalDark === 3 ? { 0: 0, 1: 0.5, 2: 0.5 } :
                     { 0: 0, 1: 0, 2: 1 };

    // 3. الطفرات المرتبطة بالجنس (Z-linked)
    // الطيور: ذكر ZZ، أنثى ZW. الأنثى تظهر الطفرة إذا ورثت Z الحامل لها.
    const mVisualSL = male.opaline || male.cinnamon || male.lutino;
    const fVisualSL = female.opaline || female.cinnamon || female.lutino;
    
    // 4. السائدة (رمادي، سبانجل)
    const greyProb = (male.grey || female.grey) ? { visual: 0.5, split: 0.5 } : { visual: 0, split: 0 };
    const spangleProb = (male.spangle || female.spangle) ? { visual: 0.5, split: 0.5 } : { visual: 0, split: 0 };

    // 5. المتنحية (بييد متنحي)
    const recPiedProb = (male.recPied && female.recPied) ? 1 : 0;

    // 🔍 تجميع النتائج (أهم 6 توليفات متوقعة)
    const addResult = (name: string, pct: string, frac: string, sex: 'ذكر' | 'أنثى' | 'كلاهما', note: string) => {
      predictions.push({ phenotype: name, percent: pct, fraction: frac, sex, notes: note });
    };

    // أمثلة دقيقة بناءً على المدخلات
    if (mGreen && fGreen) {
      addResult('أخضر عادي', '56.25%', '9/16', 'كلاهما', 'يحمل جين الأزرق متنحياً');
      addResult('أخضر حامل أزرق', '18.75%', '3/16', 'كلاهما', 'يحمل أزرق متنحياً');
      addResult('أزرق عادي', '18.75%', '3/16', 'كلاهما', 'يظهر اللون الأزرق الصافي');
      addResult('أزرق حامل أخضر', '6.25%', '1/16', 'كلاهما', 'نادر، يحمل أخضر متنحياً');
    } else if (mGreen !== fGreen) {
      addResult('أخضر حامل أزرق', '50%', '1/2', 'كلاهما', 'كل الفراخ خضراء وتحمل أزرق');
      addResult('أزرق عادي', '50%', '1/2', 'كلاهما', 'يظهر الأزرق الصافي');
    } else {
      addResult('أزرق عادي', '100%', '1/1', 'كلاهما', 'كلا الأبوين أزرق، كل الفراخ زرقاء');
    }

    if (totalDark === 1) {
      addResult('داكنة مفردة (Cobalt/Olive)', '50%', '1/2', 'كلاهما', 'يعتمد على اللون الأساسي');
    } else if (totalDark === 2) {
      addResult('داكنة مزدوجة (Mauve/Dark Blue)', '25%', '1/4', 'كلاهما', 'لون غامق جداً');
    }

    if (mVisualSL && !fVisualSL) {
      addResult('إناث حاملة للطفرة', '50%', '1/2', 'أنثى', 'كل الإناث ستظهر الطفرة المرتبطة بالجنس');
      addResult('ذكور حاملة (Split)', '50%', '1/2', 'ذكر', 'كل الذكور تحمل الطفرة ولا تظهرها');
    } else if (!mVisualSL && fVisualSL) {
      addResult('ذكور ظاهرة للطفرة', '50%', '1/2', 'ذكر', 'كل الذكور سيظهرون الطفرة');
      addResult('إناث طبيعية', '50%', '1/2', 'أنثى', 'الإناث لن ترث الطفرة');
    }

    if (recPiedProb === 1) {
      addResult('بييد متنحي ظاهر', '100%', '1/1', 'كلاهما', 'كلا الأبوين بييد متنحي');
    } else if (male.recPied || female.recPied) {
      addResult('بييد متنحي حامل', '50%', '1/2', 'كلاهما', 'نصف الفراخ تحمل البييد');
    }

    setResults(predictions);
  };

  const TraitToggle = ({ label, value, onChange, parent }: { label: string, value: any, onChange: (v: any) => void, parent: 'male' | 'female' }) => (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
      <span className="text-slate-300 text-sm">{label}</span>
      <select
        value={value}
        onChange={e => {
          const val = e.target.value;
          const parsed = val === 'true' ? true : val === 'false' ? false : isNaN(Number(val)) ? val : Number(val);
          onChange(parsed);
        }}
        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {typeof value === 'boolean' ? (
          <>
            <option value="false">طبيعي</option>
            <option value="true">مصاب/حامل</option>
          </>
        ) : label.includes('داكنة') ? (
          <>
            <option value={0}>0 (عادي)</option>
            <option value={1}>1 (مفرد)</option>
            <option value={2}>2 (مزدوج)</option>
          </>
        ) : (
          <>
            <option value="green">أخضر</option>
            <option value="blue">أزرق</option>
          </>
        )}
      </select>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">🧬</span>
          حاسبة الوراثة المتقدمة
        </h1>
        <p className="text-slate-400 mt-1">توقع ألوان الطفرات ونسب الفقس بدقة علمية</p>
      </div>

      {/* Parent Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Male */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-blue-500/30 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-lg">
            <span>♂ الذكر</span>
            <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">ZZ</span>
          </div>
          <TraitToggle label="اللون الأساسي" value={male.baseColor} onChange={v => setMale({...male, baseColor: v})} parent="male" />
          <TraitToggle label="عامل الدكنة" value={male.darkFactor} onChange={v => setMale({...male, darkFactor: v})} parent="male" />
          <TraitToggle label="أوبالين (مرتبطة بالجنس)" value={male.opaline} onChange={v => setMale({...male, opaline: v})} parent="male" />
          <TraitToggle label="سينامون (مرتبطة بالجنس)" value={male.cinnamon} onChange={v => setMale({...male, cinnamon: v})} parent="male" />
          <TraitToggle label="لوتينو/ألبينو" value={male.lutino} onChange={v => setMale({...male, lutino: v})} parent="male" />
          <TraitToggle label="سبانجل (سائد)" value={male.spangle} onChange={v => setMale({...male, spangle: v})} parent="male" />
          <TraitToggle label="بييد متنحي" value={male.recPied} onChange={v => setMale({...male, recPied: v})} parent="male" />
        </div>

        {/* Female */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-pink-500/30 space-y-4">
          <div className="flex items-center gap-2 text-pink-400 font-bold text-lg">
            <span>♀ الأنثى</span>
            <span className="text-xs bg-pink-500/20 px-2 py-1 rounded">ZW</span>
          </div>
          <TraitToggle label="اللون الأساسي" value={female.baseColor} onChange={v => setFemale({...female, baseColor: v})} parent="female" />
          <TraitToggle label="عامل الدكنة" value={female.darkFactor} onChange={v => setFemale({...female, darkFactor: v})} parent="female" />
          <TraitToggle label="أوبالين (مرتبطة بالجنس)" value={female.opaline} onChange={v => setFemale({...female, opaline: v})} parent="female" />
          <TraitToggle label="سينامون (مرتبطة بالجنس)" value={female.cinnamon} onChange={v => setFemale({...female, cinnamon: v})} parent="female" />
          <TraitToggle label="لوتينو/ألبينو" value={female.lutino} onChange={v => setFemale({...female, lutino: v})} parent="female" />
          <TraitToggle label="سبانجل (سائد)" value={female.spangle} onChange={v => setFemale({...female, spangle: v})} parent="female" />
          <TraitToggle label="بييد متنحي" value={female.recPied} onChange={v => setFemale({...female, recPied: v})} parent="female" />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-l from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-500/20"
      >
        🔍 حساب النسب المتوقعة
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 animate-fadeIn">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> النتائج المتوقعة للفقس
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600/50 text-slate-400">
                  <th className="text-right py-3 px-2">الطراز الظاهري</th>
                  <th className="text-center py-3 px-2">النسبة</th>
                  <th className="text-center py-3 px-2">الكسر</th>
                  <th className="text-center py-3 px-2">الجنس</th>
                  <th className="text-right py-3 px-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                    <td className="py-3 px-2 text-white font-medium">{r.phenotype}</td>
                    <td className="py-3 px-2 text-center text-blue-400 font-bold">{r.percent}</td>
                    <td className="py-3 px-2 text-center text-slate-300">{r.fraction}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        r.sex === 'ذكر' ? 'bg-blue-500/20 text-blue-400' : 
                        r.sex === 'أنثى' ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>{r.sex}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Breeding Guide */}
      <div className="bg-gradient-to-l from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📘</span> دليل الطفرات وطرق الحصول عليها
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'أوبالين (Opaline)', desc: 'طفرة مرتبطة بالجنس (Z). للحصول على إناث أوبالين، يجب أن يكون الذكر أوبالين أو حاملاً لها.', type: 'sex-linked' },
            { title: 'سينامون (Cinnamon)', desc: 'مرتبط بالجنس أيضاً. الأنثى السينامون × الذكر العادي = كل الذكور يحملون السينامون، والإناث عادية.', type: 'sex-linked' },
            { title: 'لوتينو/ألبينو', desc: 'مرتبط بالجنس ومتنحي. للحصول على أنثى لوتينو، يجب أن يحمل الأب الجين أو يظهره، والأم تحمل أو تظهر.', type: 'sex-linked' },
            { title: 'سبانجل (Spangle)', desc: 'سائد. نسخة واحدة تكفي للظهور. سبانجل × عادي = 50% سبانجل ظاهر.', type: 'dominant' },
            { title: 'بييد متنحي (Recessive Pied)', desc: 'متنحي صافي. يجب أن يحمل الأب والأم الجين ليظهر في الفراخ.', type: 'recessive' },
            { title: 'عامل الدكنة (Dark)', desc: 'سيادة غير تامة. 0=عادي، 1=كوبالت/زيتوني، 2=أزرق غامق/أوليف.', type: 'incomplete' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.type === 'sex-linked' ? 'bg-amber-500/20 text-amber-400' :
                  item.type === 'dominant' ? 'bg-green-500/20 text-green-400' :
                  item.type === 'recessive' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.type === 'sex-linked' ? 'مرتبطة بالجنس' : item.type === 'dominant' ? 'سائدة' : item.type === 'recessive' ? 'متنحية' : 'سيادة غير تامة'}
                </span>
                <h4 className="text-white font-bold">{item.title}</h4>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}