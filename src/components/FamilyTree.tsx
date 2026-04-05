import { useState } from 'react';
import { Bird } from '../types';
import { checkInbreeding } from '../store';

interface Props {
  birds: Bird[];
}

export default function FamilyTree({ birds }: Props) {
  const [selectedBird, setSelectedBird] = useState('');
  const [checkMale, setCheckMale] = useState('');
  const [checkFemale, setCheckFemale] = useState('');

  const activeBirds = birds.filter(b => b.status !== 'dead' && b.status !== 'sold');
  const males = activeBirds.filter(b => b.gender === 'male');
  const females = activeBirds.filter(b => b.gender === 'female');

  const bird = birds.find(b => b.id === selectedBird);

  const getChildren = (birdId: string): Bird[] => {
    return birds.filter(b => b.fatherId === birdId || b.motherId === birdId);
  };

  const getSiblings = (b: Bird): Bird[] => {
    if (!b.fatherId && !b.motherId) return [];
    return birds.filter(
      x => x.id !== b.id && ((b.fatherId && x.fatherId === b.fatherId) || (b.motherId && x.motherId === b.motherId))
    );
  };

  const inbreedingResult = checkMale && checkFemale ? checkInbreeding(checkMale, checkFemale, birds) : null;

  const renderAncestorTree = (birdId: string | undefined, depth: number, label: string): React.ReactNode => {
    if (depth > 3) return null;
    const b = birdId ? birds.find(x => x.id === birdId) : null;

    const bgColors = [
      'border-blue-500/40 bg-blue-500/10',
      'border-green-500/40 bg-green-500/10',
      'border-purple-500/40 bg-purple-500/10',
      'border-amber-500/40 bg-amber-500/10',
    ];

    return (
      <div className="flex flex-col items-center">
        <div className={`rounded-xl p-2 sm:p-3 border ${bgColors[depth] || bgColors[0]} min-w-[80px] sm:min-w-[120px] text-center`}>
          <div className="text-slate-400 text-[10px] sm:text-xs">{label}</div>
          {b ? (
            <>
              <div className={`font-bold text-xs sm:text-sm ${b.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                {b.gender === 'male' ? '♂' : '♀'} {b.name}
              </div>
              <div className="text-slate-500 text-[10px]">{b.color}</div>
            </>
          ) : (
            <div className="text-slate-600 text-xs">غير محدد</div>
          )}
        </div>
        {b && depth < 3 && (b.fatherId || b.motherId) && (
          <>
            <div className="w-px h-3 bg-slate-600" />
            <div className="flex gap-1 sm:gap-2">
              {renderAncestorTree(b.fatherId, depth + 1, 'الأب')}
              {renderAncestorTree(b.motherId, depth + 1, 'الأم')}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">🌳</span>
          شجرة العائلة
        </h1>
        <p className="text-slate-400 mt-1">تتبع الأنساب وفحص القرابة</p>
      </div>

      {/* Inbreeding Checker */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🔍</span> فحص القرابة قبل التزاوج
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">اختر الذكر ♂</label>
            <select
              value={checkMale}
              onChange={e => setCheckMale(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- اختر ذكر --</option>
              {males.map(b => (
                <option key={b.id} value={b.id}>{b.name} - {b.color}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">اختر الأنثى ♀</label>
            <select
              value={checkFemale}
              onChange={e => setCheckFemale(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- اختر أنثى --</option>
              {females.map(b => (
                <option key={b.id} value={b.id}>{b.name} - {b.color}</option>
              ))}
            </select>
          </div>
        </div>

        {inbreedingResult && (
          <div className={`rounded-xl p-4 animate-fadeIn ${
            inbreedingResult.isRelated
              ? 'bg-red-500/10 border border-red-500/30'
              : 'bg-green-500/10 border border-green-500/30'
          }`}>
            {inbreedingResult.isRelated ? (
              <div>
                <div className="flex items-center gap-2 text-red-400 font-bold text-lg mb-2">
                  <span className="text-3xl">⛔</span>
                  <span>تحذير: يوجد قرابة!</span>
                </div>
                <p className="text-red-300">نوع القرابة: <strong>{inbreedingResult.relationship}</strong></p>
                {inbreedingResult.commonAncestors.length > 0 && (
                  <p className="text-red-300/70 text-sm mt-1">
                    أجداد مشتركين: {inbreedingResult.commonAncestors.map(id => birds.find(b => b.id === id)?.name || 'غير معروف').join(', ')}
                  </p>
                )}
                <div className="mt-3 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                  <p className="text-red-300/80 text-sm">
                    ⚠️ <strong>تنبيه مهم:</strong> تزاوج الأقارب في البادجي قد يؤدي إلى:
                  </p>
                  <ul className="text-red-300/60 text-xs mt-2 space-y-1 pr-4">
                    <li>• ضعف المناعة في الفراخ</li>
                    <li>• تشوهات جسدية</li>
                    <li>• مشاكل في الخصوبة</li>
                    <li>• ضعف في الريش والألوان</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <p className="text-green-400 font-bold text-lg">لا توجد قرابة - آمن للتزاوج!</p>
                  <p className="text-green-300/60 text-sm">يمكنك تزاوج هذا الزوج بأمان</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Family Tree Viewer */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🌲</span> عرض شجرة عائلة طائر
        </h3>

        <div className="mb-4">
          <select
            value={selectedBird}
            onChange={e => setSelectedBird(e.target.value)}
            className="w-full sm:w-96 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">-- اختر طائر --</option>
            {birds.map(b => (
              <option key={b.id} value={b.id}>
                {b.gender === 'male' ? '♂' : '♀'} {b.name} - {b.color} ({b.ringNumber || 'بدون حلقة'})
              </option>
            ))}
          </select>
        </div>

        {bird && (
          <div className="animate-fadeIn space-y-6">
            {/* Bird Info Card */}
            <div className={`rounded-xl p-4 border ${bird.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-pink-500/10 border-pink-500/30'}`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{bird.gender === 'male' ? '🐦' : '🐤'}</span>
                <div>
                  <h3 className={`text-xl font-bold ${bird.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                    {bird.name}
                  </h3>
                  <p className="text-slate-400 text-sm">{bird.color} | {bird.mutation || 'بدون طفرة'}</p>
                  {bird.ringNumber && <p className="text-slate-500 text-xs">حلقة: #{bird.ringNumber}</p>}
                </div>
              </div>
            </div>

            {/* Ancestor Tree */}
            <div>
              <h4 className="text-white font-bold mb-3">📊 شجرة الأجداد</h4>
              <div className="overflow-x-auto pb-4">
                <div className="flex justify-center min-w-[600px]">
                  {renderAncestorTree(bird.id, 0, 'الطائر')}
                </div>
              </div>
            </div>

            {/* Children */}
            <div>
              <h4 className="text-white font-bold mb-3">👶 الأبناء ({getChildren(bird.id).length})</h4>
              {getChildren(bird.id).length === 0 ? (
                <p className="text-slate-500 text-sm">لا يوجد أبناء مسجلين</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {getChildren(bird.id).map(child => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedBird(child.id)}
                      className={`rounded-xl p-3 border text-center transition-all hover:scale-105 ${
                        child.gender === 'male' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-pink-500/10 border-pink-500/20'
                      }`}
                    >
                      <span className="text-xl">{child.gender === 'male' ? '🐦' : '🐤'}</span>
                      <div className={`font-medium text-sm mt-1 ${child.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                        {child.name}
                      </div>
                      <div className="text-slate-500 text-xs">{child.color}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Siblings */}
            <div>
              <h4 className="text-white font-bold mb-3">👫 الأخوة ({getSiblings(bird).length})</h4>
              {getSiblings(bird).length === 0 ? (
                <p className="text-slate-500 text-sm">لا يوجد أخوة مسجلين</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {getSiblings(bird).map(sibling => (
                    <button
                      key={sibling.id}
                      onClick={() => setSelectedBird(sibling.id)}
                      className={`rounded-xl p-3 border text-center transition-all hover:scale-105 ${
                        sibling.gender === 'male' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-pink-500/10 border-pink-500/20'
                      }`}
                    >
                      <span className="text-xl">{sibling.gender === 'male' ? '🐦' : '🐤'}</span>
                      <div className={`font-medium text-sm mt-1 ${sibling.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                        {sibling.name}
                      </div>
                      <div className="text-slate-500 text-xs">{sibling.color}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!bird && selectedBird === '' && (
          <div className="text-center py-12 text-slate-400">
            <span className="text-6xl block mb-4">🌳</span>
            <p className="text-lg">اختر طائراً لعرض شجرة عائلته</p>
          </div>
        )}
      </div>
    </div>
  );
}
