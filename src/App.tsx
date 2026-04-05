import { useState, useEffect, useCallback } from 'react';
import { Bird, Pair, BreedingRecord, HealthRecord, FinancialRecord, Alert, Page } from './types';
import {
  loadBirds, saveBirds, loadPairs, savePairs, loadBreeding, saveBreeding,
  loadHealth, saveHealth, loadFinance, saveFinance, loadAlerts, saveAlerts,
  generateId,
} from './store';
import Dashboard from './components/Dashboard';
import BirdsPage from './components/BirdsPage';
import PairsPage from './components/PairsPage';
import BreedingPage from './components/BreedingPage';
import FamilyTree from './components/FamilyTree';
import HealthPage from './components/HealthPage';
import FinancePage from './components/FinancePage';
import AlertsPage from './components/AlertsPage';

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'dashboard', icon: '📊', label: 'لوحة التحكم' },
  { page: 'birds', icon: '🐦', label: 'الطيور' },
  { page: 'pairs', icon: '💕', label: 'الأزواج' },
  { page: 'breeding', icon: '🥚', label: 'التفريخ' },
  { page: 'family', icon: '🌳', label: 'شجرة العائلة' },
  { page: 'health', icon: '🏥', label: 'السجل الصحي' },
  { page: 'finance', icon: '💰', label: 'المالية' },
  { page: 'alerts', icon: '🔔', label: 'التنبيهات' },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [breeding, setBreeding] = useState<BreedingRecord[]>([]);
  const [health, setHealth] = useState<HealthRecord[]>([]);
  const [finance, setFinance] = useState<FinancialRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load data on mount
  // استبدل الـ useEffect القديم بهذا:
useEffect(() => {
  const loadData = async () => {
    try {
      setBirds(await loadBirds());
      setPairs(await loadPairs());
      setBreeding(await loadBreeding());
      setHealth(await loadHealth());
      setFinance(await loadFinance());
      setAlerts(await loadAlerts());
    } catch (error) {
      console.error("فشل تحميل البيانات من Firestore:", error);
    }
  };
  loadData();
}, []);

  // Save handlers
  const updateBirds = useCallback(async (data: Bird[]) => {
    setBirds(data);
    await saveBirds(data);
  }, []);


  const updatePairs = useCallback(async(data: Pair[]) => {
    setPairs(data);
    await savePairs(data);
  }, []);

  const updateBreeding = useCallback(async(data: BreedingRecord[]) => {
    setBreeding(data);
   await  saveBreeding(data);
  }, []);

  const updateHealth = useCallback(async(data: HealthRecord[]) => {
    setHealth(data);
  await saveHealth(data);
  }, []);

  const updateFinance = useCallback(async(data: FinancialRecord[]) => {
    setFinance(data);
    await saveFinance(data);
  }, []);

  const updateAlerts = useCallback(async(data: Alert[]) => {
    setAlerts(data);
  await  saveAlerts(data);
  }, []);

  // Generate automatic alerts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const newAlerts: Alert[] = [];

    breeding.forEach(record => {
      if (record.status === 'eggs') {
        const daysToHatch = Math.ceil(
          (new Date(record.expectedHatchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const pair = pairs.find(p => p.id === record.pairId);
        const male = pair ? birds.find(b => b.id === pair.maleId) : null;
        const female = pair ? birds.find(b => b.id === pair.femaleId) : null;
        const pairName = `${male?.name || '?'} × ${female?.name || '?'}`;

        if (daysToHatch <= 3 && daysToHatch >= 0) {
          const existingAlert = alerts.find(a => a.relatedId === record.id && a.type === 'hatch');
          if (!existingAlert) {
            newAlerts.push({
              id: generateId(),
              type: 'hatch',
              message: `🐣 موعد الفقس قريب! ${pairName} - بعد ${daysToHatch} يوم`,
              date: today,
              relatedId: record.id,
              read: false,
              priority: daysToHatch === 0 ? 'critical' : 'high',
            });
          }
        }
        if (daysToHatch < 0) {
          const existingAlert = alerts.find(a => a.relatedId === record.id + '_overdue' && a.type === 'hatch');
          if (!existingAlert) {
            newAlerts.push({
              id: generateId(),
              type: 'hatch',
              message: `⚠️ تجاوز موعد الفقس! ${pairName} - كان المفروض ${Math.abs(daysToHatch)} يوم`,
              date: today,
              relatedId: record.id + '_overdue',
              read: false,
              priority: 'critical',
            });
          }
        }
      }

      if (record.status === 'feeding' && record.expectedWeanDate) {
        const daysToWean = Math.ceil(
          (new Date(record.expectedWeanDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const pair = pairs.find(p => p.id === record.pairId);
        const male = pair ? birds.find(b => b.id === pair.maleId) : null;
        const female = pair ? birds.find(b => b.id === pair.femaleId) : null;
        const pairName = `${male?.name || '?'} × ${female?.name || '?'}`;

        if (daysToWean <= 5 && daysToWean >= 0) {
          const existingAlert = alerts.find(a => a.relatedId === record.id + '_wean' && a.type === 'wean');
          if (!existingAlert) {
            newAlerts.push({
              id: generateId(),
              type: 'wean',
              message: `🐦 موعد الفطام قريب! ${pairName} - بعد ${daysToWean} يوم`,
              date: today,
              relatedId: record.id + '_wean',
              read: false,
              priority: daysToWean <= 2 ? 'high' : 'medium',
            });
          }
        }
      }
    });

    if (newAlerts.length > 0) {
      const updated = [...alerts, ...newAlerts];
      setAlerts(updated);
      saveAlerts(updated);
    }
  }, [breeding, pairs, birds]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (page: string) => {
    setCurrentPage(page as Page);
    setSidebarOpen(false);
  };

  const unreadAlerts = alerts.filter(a => !a.read).length;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard birds={birds} pairs={pairs} breeding={breeding} finance={finance} alerts={alerts} onNavigate={navigate} />;
      case 'birds':
        return <BirdsPage birds={birds} onUpdate={updateBirds} />;
      case 'pairs':
        return <PairsPage birds={birds} pairs={pairs} onUpdatePairs={updatePairs} onUpdateBirds={updateBirds} />;
      case 'breeding':
        return <BreedingPage birds={birds} pairs={pairs} breeding={breeding} onUpdate={updateBreeding} />;
      case 'family':
        return <FamilyTree birds={birds} />;
      case 'health':
        return <HealthPage birds={birds} health={health} onUpdate={updateHealth} />;
      case 'finance':
        return <FinancePage finance={finance} onUpdate={updateFinance} />;
      case 'alerts':
        return <AlertsPage alerts={alerts} onUpdate={updateAlerts} />;
      default:
        return <Dashboard birds={birds} pairs={pairs} breeding={breeding} finance={finance} alerts={alerts} onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-slate-800/90 backdrop-blur-xl border-l border-slate-700/50 z-50 transition-transform duration-300 flex flex-col overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
              🐦
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">مزرعتي</h1>
              <p className="text-slate-400 text-xs">إدارة البادجي</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                currentPage === item.page
                  ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-500/5'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.page === 'alerts' && unreadAlerts > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Stats Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-slate-700/30 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">إجمالي الطيور</span>
              <span className="text-white font-bold">{birds.filter(b => b.status !== 'dead' && b.status !== 'sold').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">أزواج نشطة</span>
              <span className="text-white font-bold">{pairs.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">أعشاش نشطة</span>
              <span className="text-white font-bold">{breeding.filter(b => b.status !== 'weaned' && b.status !== 'failed').length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-4 sm:px-6 py-3 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors p-2 -mr-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mr-auto">
              {/* Data export/import */}
              <button
                onClick={() => {
                  const data = {
                    birds, pairs, breeding, health, finance, alerts,
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `budgie-farm-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-slate-400 hover:text-white transition-colors p-2 text-sm flex items-center gap-1"
                title="تصدير البيانات"
              >
                <span>📥</span>
                <span className="hidden sm:inline">تصدير</span>
              </button>

              <label className="text-slate-400 hover:text-white transition-colors p-2 text-sm flex items-center gap-1 cursor-pointer" title="استيراد البيانات">
                <span>📤</span>
                <span className="hidden sm:inline">استيراد</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const data = JSON.parse(ev.target?.result as string);
                        if (data.birds) { updateBirds(data.birds); }
                        if (data.pairs) { updatePairs(data.pairs); }
                        if (data.breeding) { updateBreeding(data.breeding); }
                        if (data.health) { updateHealth(data.health); }
                        if (data.finance) { updateFinance(data.finance); }
                        if (data.alerts) { updateAlerts(data.alerts); }
                        alert('تم استيراد البيانات بنجاح! ✅');
                      } catch {
                        alert('خطأ في قراءة الملف! ❌');
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
              </label>

              {unreadAlerts > 0 && (
                <button
                  onClick={() => navigate('alerts')}
                  className="relative text-slate-400 hover:text-white transition-colors p-2"
                >
                  <span className="text-xl">🔔</span>
                  <span className="absolute top-0 left-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
