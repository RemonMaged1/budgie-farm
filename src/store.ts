import { Bird, Pair, BreedingRecord, HealthRecord, FinancialRecord, Alert } from './types';
import { db } from './firebase'; // تأكد إن الملف ده موجود ومفيش خطأ فيه
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';

const COLLECTIONS = {
  birds: 'birds',
  pairs: 'pairs',
  breeding: 'breeding',
  health: 'health',
  finance: 'finance',
  alerts: 'alerts',
} as const;

// دالة لجلب البيانات من النت (أصبحت async)
async function loadCollection<T>(colName: string): Promise<T[]> {
  try {
    const q = query(collection(db, colName), orderBy('addedDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
  } catch (error) {
    console.error(`Error loading ${colName}:`, error);
    return [];
  }
}

// دوال التحميل (بتستنى النت)
export async function loadBirds(): Promise<Bird[]> { return loadCollection<Bird>(COLLECTIONS.birds); }
export async function loadPairs(): Promise<Pair[]> { return loadCollection<Pair>(COLLECTIONS.pairs); }
export async function loadBreeding(): Promise<BreedingRecord[]> { return loadCollection<BreedingRecord>(COLLECTIONS.breeding); }
export async function loadHealth(): Promise<HealthRecord[]> { return loadCollection<HealthRecord>(COLLECTIONS.health); }
export async function loadFinance(): Promise<FinancialRecord[]> { return loadCollection<FinancialRecord>(COLLECTIONS.finance); }
export async function loadAlerts(): Promise<Alert[]> { return loadCollection<Alert>(COLLECTIONS.alerts); }

// دوال الحفظ
async function saveCollection<T extends { id: string }>(colName: string, data: T[]): Promise<void> {
  for (const item of data) {
    await setDoc(doc(db, colName, item.id), item, { merge: true });
  }
}

export async function saveBirds( Bird[]): Promise<void> { await saveCollection(COLLECTIONS.birds, data); }
export async function savePairs( Pair[]): Promise<void> { await saveCollection(COLLECTIONS.pairs, data); }
export async function saveBreeding( BreedingRecord[]): Promise<void> { await saveCollection(COLLECTIONS.breeding, data); }
export async function saveHealth( HealthRecord[]): Promise<void> { await saveCollection(COLLECTIONS.health, data); }
export async function saveFinance( FinancialRecord[]): Promise<void> { await saveCollection(COLLECTIONS.finance, data); }
export async function saveAlerts( Alert[]): Promise<void> { await saveCollection(COLLECTIONS.alerts, data); }

// باقي الدوال المساعدة (نفسها زي ما هي)
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