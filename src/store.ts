import { Bird, Pair, BreedingRecord, HealthRecord, FinancialRecord, Alert } from './types';

// ⚠️ استبدل القيم دي ببياناتك من JSONBin.io
const API_KEY = '$2a$10$1YWhVj4Umu/JA2q86VXLIu0C.RCi8fSx0VN20gnHSUsN.YNO2ntge';
const BIN_ID = '69d1cc52856a682189fe41e2';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// هيكل البيانات الكامل
interface FarmData {
  birds: Bird[];
  pairs: Pair[];
  breeding: BreedingRecord[];
  health: HealthRecord[];
  finance: FinancialRecord[];
  alerts: Alert[];
}

// دالة لجلب البيانات من النت
async function fetchData(): Promise<AllData> {
  try {
    const res = await fetch(BASE_URL, {
      method: 'GET',
      headers: { 
        'X-Access-Key': API_KEY,  // ⚠️ ده الاسم الصح للهيدر
        'X-Bin-Meta': 'false',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        console.error('❌ خطأ 401: المفتاح غير صحيح أو غير مرسل');
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const json = await res.json();
    return json.record || { birds: [], pairs: [], breeding: [], health: [], finance: [], alerts: [] };
  } catch (error) {
    console.error('❌ فشل جلب البيانات:', error);
    return { birds: [], pairs: [], breeding: [], health: [], finance: [], alerts: [] };
  }
}

// دالة لحفظ البيانات على النت
async function saveData( data: FarmData): Promise<void> {
  await fetch(BASE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': API_KEY
    },
    body: JSON.stringify(data)
  });
}

// دوال التحميل (كلها بتجيب من نفس المصدر)
export async function loadBirds(): Promise<Bird[]> { 
  const d = await fetchData(); 
  return d.birds; 
}
export async function loadPairs(): Promise<Pair[]> { 
  const d = await fetchData(); 
  return d.pairs; 
}
export async function loadBreeding(): Promise<BreedingRecord[]> { 
  const d = await fetchData(); 
  return d.breeding; 
}
export async function loadHealth(): Promise<HealthRecord[]> { 
  const d = await fetchData(); 
  return d.health; 
}
export async function loadFinance(): Promise<FinancialRecord[]> { 
  const d = await fetchData(); 
  return d.finance; 
}
export async function loadAlerts(): Promise<Alert[]> { 
  const d = await fetchData(); 
  return d.alerts; 
}

// دوال الحفظ (بتحمّل كل البيانات وتعدّل الجزء المطلوب)
// ================= دوال الحفظ (تم إصلاح الخطأ) =================
// ملاحظة: بنجيب كل البيانات، بنعدل الجزء المطلوب، ونعيد حفظ الكل
export async function saveBirds(data: Bird[]): Promise<void> { 
  const d = await fetchData(); 
  await saveData({ ...d, birds: data }); 
}

export async function savePairs(data: Pair[]): Promise<void> { 
  const d = await fetchData(); 
  await saveData({ ...d, pairs: data }); 
}

export async function saveBreeding(data: BreedingRecord[]): Promise<void> { 
  const d = await fetchData(); 
  await saveData({ ...d, breeding: data }); 
}

export async function saveHealth(data: HealthRecord[]): Promise<void> { 
  const d = await fetchData(); 
  await saveData({ ...d, health: data }); 
}

export async function saveFinance(data: FinancialRecord[]): Promise<void> { 
  const d = await fetchData(); 
  await saveData({ ...d, finance: data }); 
}

export async function saveAlerts(data: Alert[]): Promise<void> { 
  const d = await fetchData(); 
  await saveData({ ...d, alerts: data }); 
}

// =====================================================
// دوال المساعدة (نفسها زي ما هي - متلمسهاش)
// =====================================================
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function daysDiff(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'غداً';
  if (diff === -1) return 'أمس';
  if (diff > 0) return `بعد ${diff} يوم`;
  return `منذ ${Math.abs(diff)} يوم`;
}

export function getAncestors(birdId: string, birds: Bird[], depth: number = 5): Set<string> {
  const ancestors = new Set<string>();
  function traverse(id: string | undefined, currentDepth: number) {
    if (!id || currentDepth <= 0) return;
    const bird = birds.find(b => b.id === id);
    if (!bird) return;
    if (bird.fatherId) { ancestors.add(bird.fatherId); traverse(bird.fatherId, currentDepth - 1); }
    if (bird.motherId) { ancestors.add(bird.motherId); traverse(bird.motherId, currentDepth - 1); }
  }
  traverse(birdId, depth);
  return ancestors;
}

export function checkInbreeding(maleId: string, femaleId: string, birds: Bird[]): { isRelated: boolean; commonAncestors: string[]; relationship: string } {
  const maleAncestors = getAncestors(maleId, birds);
  const femaleAncestors = getAncestors(femaleId, birds);
  const commonAncestors: string[] = [];
  maleAncestors.forEach(ancestor => { if (femaleAncestors.has(ancestor)) commonAncestors.push(ancestor); });
  
  const male = birds.find(b => b.id === maleId);
  const female = birds.find(b => b.id === femaleId);
  if (!male || !female) return { isRelated: false, commonAncestors: [], relationship: '' };
  
  if (male.fatherId && male.fatherId === female.fatherId) return { isRelated: true, commonAncestors, relationship: 'أخوة (نفس الأب)' };
  if (male.motherId && male.motherId === female.motherId) return { isRelated: true, commonAncestors, relationship: 'أخوة (نفس الأم)' };
  if (male.fatherId === female.fatherId && male.motherId === female.motherId && male.fatherId && male.motherId) return { isRelated: true, commonAncestors, relationship: 'أخوة أشقاء' };
  if (maleId === female.fatherId || maleId === female.motherId) return { isRelated: true, commonAncestors, relationship: 'أب/أم وابن/ابنة' };
  if (femaleId === male.fatherId || femaleId === male.motherId) return { isRelated: true, commonAncestors, relationship: 'أب/أم وابن/ابنة' };
  
  if (commonAncestors.length > 0) return { isRelated: true, commonAncestors, relationship: `أقارب (${commonAncestors.length} جد/جدة مشتركة)` };
  return { isRelated: false, commonAncestors: [], relationship: 'لا توجد قرابة' };
}