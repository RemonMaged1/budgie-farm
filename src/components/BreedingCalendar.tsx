// src/components/BreedingCalendar.tsx
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
    const startingDay = firstDay.getDay(); // 0 = Sunday

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDay = (date: Date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    
    return breeding
      .filter(b => {
        const isEggDate = b.eggDate === dateStr;
        const isHatchDate = b.expectedHatchDate === dateStr;
        const isWeanDate = b.expectedWeanDate === dateStr;
        return isEggDate || isHatchDate || isWeanDate;
      })
      .map(b => {
        const pair = pairs.find(p => p.id === b.pairId);
        const male = pair ? birds.find(bd => bd.id === pair.maleId) : null;
        const female = pair ? birds.find(bd => bd.id === pair.femaleId) : null;
        const pairName = `${male?.name || '?'} × ${female?.name || '?'}`;
        
        let type: 'egg' | 'hatch' | 'wean' = 'egg';
        let icon = '🥚';
        let color = 'bg-amber-500/20 text-amber-400';
        
        if (b.expectedHatchDate === dateStr) {
          type = 'hatch';
          icon = '🐣';
          color = 'bg-yellow-500/20 text-yellow-400';
        } else if (b.expectedWeanDate === dateStr) {
          type = 'wean';
          icon = '🐦';
          color = 'bg-green-500/20 text-green-400';
        }
        
        return { id: b.id, pairName, icon, color, type, status: b.status };
      });
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">📅</span>
          تقويم التفريخ
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-lg transition">◀️</button>
          <span className="text-white font-bold text-lg">{monthName}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-lg transition">▶️</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/20"></span> وضع البيض</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/20"></span> فقس متوقع</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20"></span> فطام متوقع</span>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[700px]">
          {/* Day Headers */}
          {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
            <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
              {day}
            </div>
          ))}
          
          {/* Days */}
          {days.map((day, i) => {
            const isToday = day?.toDateString() === today.toDateString();
            const events = day ? getEventsForDay(day) : [];
            
            return (
              <div
                key={i}
                className={`min-h-[100px] p-2 rounded-xl border transition-all ${
                  day
                    ? isToday
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-slate-700/20 border-slate-700/30 hover:bg-slate-700/40'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((evt, j) => (
                        <div
                          key={j}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate ${evt.color}`}
                          title={evt.pairName}
                        >
                          {evt.icon} {evt.pairName.split(' × ')[0]}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div className="text-[10px] text-slate-500 text-center">
                          +{events.length - 3} أكثر
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>🔜</span> أحداث قادمة (30 يوم)
        </h3>
        <div className="space-y-3">
          {breeding
            .filter(b => {
              const dates = [b.eggDate, b.expectedHatchDate, b.expectedWeanDate].filter(Boolean);
              return dates.some(d => {
                const eventDate = new Date(d!);
                const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diff >= 0 && diff <= 30;
              });
            })
            .sort((a, b) => {
              const aDate = [a.eggDate, a.expectedHatchDate, a.expectedWeanDate].filter(Boolean).sort()[0];
              const bDate = [b.eggDate, b.expectedHatchDate, b.expectedWeanDate].filter(Boolean).sort()[0];
              return new Date(aDate!).getTime() - new Date(bDate!).getTime();
            })
            .slice(0, 10)
            .map(record => {
              const pair = pairs.find(p => p.id === record.pairId);
              const male = pair ? birds.find(b => b.id === pair.maleId) : null;
              const female = pair ? birds.find(b => b.id === pair.femaleId) : null;
              const pairName = `${male?.name || '?'} × ${female?.name || '?'}`;
              
              const upcomingEvents = [];
              const todayStr = today.toISOString().split('T')[0];
              if (record.expectedHatchDate >= todayStr) upcomingEvents.push({ date: record.expectedHatchDate, type: 'فقس', icon: '🐣' });
              if (record.expectedWeanDate >= todayStr) upcomingEvents.push({ date: record.expectedWeanDate, type: 'فطام', icon: '🐦' });
              const nextEvent = upcomingEvents.sort((a, b) => a.date.localeCompare(b.date))[0];
              
              return (
                <div key={record.id} className="bg-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{pairName}</div>
                    <div className="text-slate-400 text-xs">
                      {nextEvent?.icon} {nextEvent?.type}: {formatDate(nextEvent?.date || '')}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    record.status === 'eggs' ? 'bg-amber-500/20 text-amber-400' :
                    record.status === 'feeding' ? 'bg-green-500/20 text-green-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {record.status === 'eggs' ? 'بيض' : record.status === 'feeding' ? 'تغذية' : 'مكتمل'}
                  </span>
                </div>
              );
            })}
          {breeding.filter(b => {
            const dates = [b.eggDate, b.expectedHatchDate, b.expectedWeanDate].filter(Boolean);
            return dates.some(d => {
              const eventDate = new Date(d!);
              const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return diff >= 0 && diff <= 30;
            });
          }).length === 0 && (
            <p className="text-slate-400 text-center py-4">لا توجد أحداث قادمة في الـ 30 يوم القادمة</p>
          )}
        </div>
      </div>
    </div>
  );
}