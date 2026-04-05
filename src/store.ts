import { Bird, Pair, BreedingRecord, HealthRecord, FinancialRecord, Alert } from './types';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // ← أ

// ⚠️ حط بيانات مشروعك هنا من لوحة تحكم Supabase
const SUPABASE_URL = 'https://kudvgmpdjuomrrhsisxu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iqg1X1A_71jEUf9ZbPxD-Q_RRosm5RF';


if (!SUPABASE_URL.includes('supabase.co')) {
  console.error('❌ خطأ: لم يتم إدخال رابط Supabase الصحيح');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= دوال التحويل =================
function toCamelCase(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (let key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

function toSnakeCase(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (let key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
  }
  return result;
}

// ================= دوال التحميل =================
export async function loadBirds(): Promise<Bird[]> {
  const { data } = await supabase.from('birds').select('*').order('added_date', { ascending: false });
  return data ? data.map(toCamelCase) : [];
}
export async function loadPairs(): Promise<Pair[]> {
  const { data } = await supabase.from('pairs').select('*').order('pair_date', { ascending: false });
  return data ? data.map(toCamelCase) : [];
}
export async function loadBreeding(): Promise<BreedingRecord[]> {
  const { data } = await supabase.from('breeding').select('*').order('egg_date', { ascending: false });
  return data ? data.map(toCamelCase) : [];
}
export async function loadHealth(): Promise<HealthRecord[]> {
  const { data } = await supabase.from('health').select('*').order('date', { ascending: false });
  return data ? data.map(toCamelCase) : [];
}
export async function loadFinance(): Promise<FinancialRecord[]> {
  const { data } = await supabase.from('finance').select('*').order('date', { ascending: false });
  return data ? data.map(toCamelCase) : [];
}
export async function loadAlerts(): Promise<Alert[]> {
  const { data } = await supabase.from('alerts').select('*').order('date', { ascending: false });
  return data ? data.map(toCamelCase) : [];
}

// ================= دوال الحفظ =================
async function saveToSupabase(table: string,  any[]): Promise<boolean> {
  const snakeData = data.map(toSnakeCase);
  const { error } = await supabase.from(table).upsert(snakeData, { onConflict: 'id' });
  
  if (error) {
    console.error(`❌ فشل حفظ ${table}:`, error.message);
    alert(`⚠️ فشل الحفظ في ${table}!\n${error.message}`);
    return false;
  }
  console.log(`✅ تم حفظ ${table} بنجاح`);
  return true;
}

export async function saveBirds( Bird[]): Promise<void> { await saveToSupabase('birds', data); }
export async function savePairs( Pair[]): Promise<void> { await saveToSupabase('pairs', data); }
export async function saveBreeding( BreedingRecord[]): Promise<void> { await saveToSupabase('breeding', data); }
export async function saveHealth( HealthRecord[]): Promise<void> { await saveToSupabase('health', data); }
export async function saveFinance( FinancialRecord[]): Promise<void> { await saveToSupabase('finance', data); }
export async function saveAlerts( Alert[]): Promise<void> { await saveToSupabase('alerts', data); }

// ================= الدوال المساعدة =================
// ✅ دالة توليد معرفات بصيغة UUID صحيحة لـ Supabase
export function generateId(): string {
  return uuidv4();
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
export function daysDiff(date1: string, date2: string): number {
  return Math.ceil((new Date(date2).getTime() - new Date(date1).getTime()) / (1000 * 60 * 60 * 24));
}
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}
export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'غداً';
  if (diff === -1) return 'أمس';
  return diff > 0 ? `بعد ${diff} يوم` : `منذ ${Math.abs(diff)} يوم`;
}
export function getAncestors(birdId: string, birds: Bird[], depth: number = 5): Set<string> {
  const ancestors = new Set<string>();
  function traverse(id: string | undefined, cur: number) {
    if (!id || cur <= 0) return;
    const b = birds.find(x => x.id === id);
    if (!b) return;
    if (b.fatherId) { ancestors.add(b.fatherId); traverse(b.fatherId, cur-1); }
    if (b.motherId) { ancestors.add(b.motherId); traverse(b.motherId, cur-1); }
  }
  traverse(birdId, depth);
  return ancestors;
}
export function checkInbreeding(maleId: string, femaleId: string, birds: Bird[]): { isRelated: boolean; commonAncestors: string[]; relationship: string } {
  const mA = getAncestors(maleId, birds);
  const fA = getAncestors(femaleId, birds);
  const c: string[] = [];
  mA.forEach(a => { if (fA.has(a)) c.push(a); });
  const m = birds.find(b => b.id === maleId);
  const f = birds.find(b => b.id === femaleId);
  if (!m || !f) return { isRelated: false, commonAncestors: [], relationship: '' };
  if (m.fatherId && m.fatherId === f.fatherId) return { isRelated: true, commonAncestors: c, relationship: 'أخوة (نفس الأب)' };
  if (m.motherId && m.motherId === f.motherId) return { isRelated: true, commonAncestors: c, relationship: 'أخوة (نفس الأم)' };
  if (m.fatherId === f.fatherId && m.motherId === f.motherId && m.fatherId && m.motherId) return { isRelated: true, commonAncestors: c, relationship: 'أخوة أشقاء' };
  if (maleId === f.fatherId || maleId === f.motherId) return { isRelated: true, commonAncestors: c, relationship: 'أب/أم وابن/ابنة' };
  if (femaleId === m.fatherId || femaleId === m.motherId) return { isRelated: true, commonAncestors: c, relationship: 'أب/أم وابن/ابنة' };
  return c.length > 0 ? { isRelated: true, commonAncestors: c, relationship: `أقارب (${c.length} جد/جدة مشتركة)` } : { isRelated: false, commonAncestors: [], relationship: 'لا توجد قرابة' };
}