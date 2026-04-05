import { useState } from 'react'; // ✅ تم إضافة هذا السطر
import { Pair, BreedingRecord, Bird } from '../types';
import { formatDate } from '../store';

interface Props {
  birds: Bird[];
  pairs: Pair[];
  breeding: BreedingRecord[];
}

export default function BreedingCalendar({ birds, pairs, breeding }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getEventsForDay = (date: Date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    
    return breeding
      .filter(b => b.eggDate === dateStr || b.expectedHatchDate === dateStr || b.expectedWeanDate === dateStr)
      .map(b => {
        const pair = pairs.find(p => p.id === b.pairId);
        const male = pair ? birds.find(bd => bd.id === pair.maleId) : null;
        const female = pair ? birds.find(bd => bd.id === pair.femaleId) : null;
        const pairName = `${male?.name || '?'} × ${female?.name || '?'}`;
        
        let icon = '🥚', color = 'bg-amber-500/20 text-amber-400';
        if (b.expectedHatchDate === dateStr) { icon = '🐣'; color = 'bg-yellow-500/20 text-yellow-400'; }
        else if (b.expectedWeanDate === dateStr) { icon = '🐦'; color = 'bg-green-500/20 text-green-400'; }
        
        return { id: b.id, pairName, icon, color, status: b.status };
      });
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">📅</span> تقويم التفريخ
        </h1>
        <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
          <button onClick={prevMonth} className="text-slate-400 hover:text-white transition p-1">◀️</button>
          <span className="text-white font-bold min-w-[140px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="text-slate-400 hover:text-white transition p-1">▶️</button>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/20"></span> وضع البيض</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/20"></span> فقس متوقع</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20"></span> فطام متوقع</span>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[700px]">
          {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
            <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">{day}</div>
          ))}
          
          {days.map((day, i) => {
            const isToday = day?.toDateString() === today.toDateString();
            const events = day ? getEventsForDay(day) : [];
            
            return (
              <div key={i} className={`min-h-[90px] p-2 rounded-xl border transition-all ${
                day ? isToday ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-700/20 border-slate-700/30 hover:bg-slate-700/40' : 'bg-transparent border-transparent'
              }`}>
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>{day.getDate()}</div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map((evt, j) => (
                        <div key={j} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${evt.color}`} title={evt.pairName}>
                          {evt.icon} {evt.pairName.split(' × ')[0]}
                        </div>
                      ))}
                      {events.length > 2 && <div className="text-[10px] text-slate-500 text-center">+{events.length - 2}</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span>🔜</span> أحداث قادمة (30 يوم)</h3>
        <div className="space-y-3">
          {breeding
            .filter(b => {
              const dates = [b.expectedHatchDate, b.expectedWeanDate].filter(Boolean) as string[];
              return dates.some(d => {
                const diff = Math.ceil((new Date(d).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diff >= 0 && diff <= 30;
              });
            })
            .sort((a, b) => {
              const aDate = [a.expectedHatchDate, a.expectedWeanDate].filter(Boolean).sort()[0] || '';
              const bDate = [b.expectedHatchDate, b.expectedWeanDate].filter(Boolean).sort()[0] || '';
              return aDate.localeCompare(bDate);
            })
            .slice(0, 10)
            .map(record => {
              const pair = pairs.find(p => p.id === record.pairId);
              const male = pair ? birds.find(b => b.id === pair.maleId) : null;
              const female = pair ? birds.find(b => b.id === pair.femaleId) : null;
              const pairName = `${male?.name || '?'} × ${female?.name || '?'}`;
              
              const nextHatch = record.expectedHatchDate;
              const nextWean = record.expectedWeanDate;
              const todayStr = today.toISOString().split('T')[0];
              
              let eventDate = nextHatch, eventType = 'فقس متوقع', icon = '🐣', color = 'bg-yellow-500/20 text-yellow-400';
              if (!nextHatch || nextHatch < todayStr) {
                eventDate = nextWean; eventType = 'فطام متوقع'; icon = '🐦'; color = 'bg-green-500/20 text-green-400';
              }
              
              return (
                <div key={record.id} className="bg-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{pairName}</div>
                    <div className={`text-xs mt-1 ${color.replace('bg-', 'text-')}`}>
                      {icon} {eventType}: {formatDate(eventDate || '')}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    record.status === 'eggs' ? 'bg-amber-500/20 text-amber-400' :
                    record.status === 'feeding' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {record.status === 'eggs' ? 'بيض' : record.status === 'feeding' ? 'تغذية' : 'مكتمل'}
                  </span>
                </div>
              );
            })}
          {breeding.filter(b => {
            const dates = [b.expectedHatchDate, b.expectedWeanDate].filter(Boolean) as string[];
            return dates.some(d => Math.ceil((new Date(d).getTime() - today.getTime()) / (1000*60*60*24)) >= 0 && Math.ceil((new Date(d).getTime() - today.getTime()) / (1000*60*60*24)) <= 30);
          }).length === 0 && <p className="text-slate-400 text-center py-4">لا توجد أحداث قادمة في الـ 30 يوم القادمة</p>}
        </div>
      </div>
    </div>
  );
}