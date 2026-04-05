import { Bird, Pair, BreedingRecord, HealthRecord, FinancialRecord, Alert } from './types';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // ← أ

// ⚠️ حط بيانات مشروعك هنا من لوحة تحكم Supabase
const SUPABASE_URL = 'https://kudvgmpdjuomrrhsisxu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iqg1X1A_71jEUf9ZbPxD-Q_RRosm5RF';


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= دوال التحويل بين camelCase و snake_case =================

function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

function toSnakeCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
  }
  return result;
}

// ================= دوال التحميل (من Supabase) =================

export async function loadBirds(): Promise<Bird[]> {
  const { data } = await supabase.from('birds').select('*').order('added_date', { ascending: false });
  return data ? data.map((item: any) => toCamelCase(item)) : [];
}

export async function loadPairs(): Promise<Pair[]> {
  const { data } = await supabase.from('pairs').select('*').order('pair_date', { ascending: false });
  return data ? data.map((item: any) => toCamelCase(item)) : [];
}

export async function loadBreeding(): Promise<BreedingRecord[]> {
  const { data } = await supabase.from('breeding').select('*').order('egg_date', { ascending: false });
  return data ? data.map((item: any) => toCamelCase(item)) : [];
}

export async function loadHealth(): Promise<HealthRecord[]> {
  const { data } = await supabase.from('health').select('*').order('date', { ascending: false });
  return data ? data.map((item: any) => toCamelCase(item)) : [];
}

export async function loadFinance(): Promise<FinancialRecord[]> {
  const { data } = await supabase.from('finance').select('*').order('date', { ascending: false });
  return data ? data.map((item: any) => toCamelCase(item)) : [];
}

export async function loadAlerts(): Promise<Alert[]> {
  const { data } = await supabase.from('alerts').select('*').order('date', { ascending: false });
  return data ? data.map((item: any) => toCamelCase(item)) : [];
}

// ================= دوال الحفظ والحذف (لـ Supabase) =================

// دالة الحفظ العامة (Upsert: إضافة أو تحديث)
async function saveToSupabase(table: string, data: any[]): Promise<boolean> {
  const snakeData = data.map((item: any) => toSnakeCase(item));
  const { error } = await supabase.from(table).upsert(snakeData, { onConflict: 'id' });
  
  if (error) {
    console.error(`❌ فشل حفظ ${table}:`, error.message);
    alert(`⚠️ فشل حفظ البيانات في ${table}!\n${error.message}`);
    return false;
  }
  return true;
}

// دالة الحذف العامة (حذف نهائي من قاعدة البيانات)
async function deleteFromSupabase(table: string, id: string): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  
  if (error) {
    console.error(`❌ فشل حذف من ${table}:`, error.message);
    alert(`⚠️ فشل الحذف من ${table}!\n${error.message}`);
    return false;
  }
  return true;
}

// دوال الحفظ لكل جدول
export async function saveBirds(data: Bird[]): Promise<void> { await saveToSupabase('birds', data); }
export async function savePairs(data: Pair[]): Promise<void> { await saveToSupabase('pairs', data); }
export async function saveBreeding(data: BreedingRecord[]): Promise<void> { await saveToSupabase('breeding', data); }
export async function saveHealth(data: HealthRecord[]): Promise<void> { await saveToSupabase('health', data); }
export async function saveFinance(data: FinancialRecord[]): Promise<void> { await saveToSupabase('finance', data); }
export async function saveAlerts(data: Alert[]): Promise<void> { await saveToSupabase('alerts', data); }

// دوال الحذف لكل جدول
export async function deleteBird(id: string): Promise<void> { await deleteFromSupabase('birds', id); }
export async function deletePair(id: string): Promise<void> { await deleteFromSupabase('pairs', id); }
export async function deleteBreeding(id: string): Promise<void> { await deleteFromSupabase('breeding', id); }
export async function deleteHealth(id: string): Promise<void> { await deleteFromSupabase('health', id); }
export async function deleteFinance(id: string): Promise<void> { await deleteFromSupabase('finance', id); }
export async function deleteAlert(id: string): Promise<void> { await deleteFromSupabase('alerts', id); }

// ================= الدوال المساعدة (ثابتة) =================

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
  return diff > 0 ? `بعد ${diff} يوم` : `منذ ${Math.abs(diff)} يوم`;
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