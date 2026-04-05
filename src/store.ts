import { Bird, Pair, BreedingRecord, HealthRecord, FinancialRecord, Alert } from './types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ⚠️ حط بيانات مشروعك هنا من لوحة تحكم Supabase
const SUPABASE_URL = 'https://kudvgmpdjuomrrhsisxu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iqg1X1A_71jEUf9ZbPxD-Q_RRosm5RF';

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= دوال التحويل بين camelCase و snake_case =================

// تحويل من قاعدة البيانات (snake_case) للكود (camelCase)
function toCamelCase<T>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase) as unknown as T;
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result as T;
}

// تحويل من الكود (camelCase) لقاعدة البيانات (snake_case)
function toSnakeCase<T>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase) as unknown as T;
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
  }
  return result as T;
}

// ================= دوال التحميل (Async) =================

export async function loadBirds(): Promise<Bird[]> {
  const { data, error } = await supabase
    .from('birds')
    .select('*')
    .order('added_date', { ascending: false });
  
  if (error) {
    console.error('Error loading birds:', error);
    return [];
  }
  return data ? data.map(item => toCamelCase<Bird>(item)) : [];
}

export async function loadPairs(): Promise<Pair[]> {
  const { data, error } = await supabase
    .from('pairs')
    .select('*')
    .order('pair_date', { ascending: false });
  
  if (error) {
    console.error('Error loading pairs:', error);
    return [];
  }
  return data ? data.map(item => toCamelCase<Pair>(item)) : [];
}

export async function loadBreeding(): Promise<BreedingRecord[]> {
  const { data, error } = await supabase
    .from('breeding')
    .select('*')
    .order('egg_date', { ascending: false });
  
  if (error) {
    console.error('Error loading breeding:', error);
    return [];
  }
  return data ? data.map(item => toCamelCase<BreedingRecord>(item)) : [];
}

export async function loadHealth(): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from('health')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error loading health:', error);
    return [];
  }
  return data ? data.map(item => toCamelCase<HealthRecord>(item)) : [];
}

export async function loadFinance(): Promise<FinancialRecord[]> {
  const { data, error } = await supabase
    .from('finance')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error loading finance:', error);
    return [];
  }
  return data ? data.map(item => toCamelCase<FinancialRecord>(item)) : [];
}

export async function loadAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error loading alerts:', error);
    return [];
  }
  return data ? data.map(item => toCamelCase<Alert>(item)) : [];
}

// ================= دوال الحفظ (Async) =================

export async function saveBirds(data: Bird[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase
    .from('birds')
    .upsert(snakeData, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.error('Error saving birds:', error);
}

export async function savePairs(data: Pair[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase
    .from('pairs')
    .upsert(snakeData, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.error('Error saving pairs:', error);
}

export async function saveBreeding(data: BreedingRecord[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase
    .from('breeding')
    .upsert(snakeData, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.error('Error saving breeding:', error);
}

export async function saveHealth(data: HealthRecord[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase
    .from('health')
    .upsert(snakeData, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.error('Error saving health:', error);
}

export async function saveFinance(data: FinancialRecord[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase
    .from('finance')
    .upsert(snakeData, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.error('Error saving finance:', error);
}

export async function saveAlerts(data: Alert[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase
    .from('alerts')
    .upsert(snakeData, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.error('Error saving alerts:', error);
}

// ================= الدوال المساعدة (نفسها زي ما هي - بدون تغيير) =================

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