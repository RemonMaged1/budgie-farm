import { Bird, Pair, BreedingRecord, HealthRecord, FinancialRecord, Alert } from './types';
import { createClient } from '@supabase/supabase-js';

// ⚠️ حط بيانات مشروعك هنا
const SUPABASE_URL = 'https://kudvgmpdjuomrrhsisxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZHZnbXBkanVvbXJyaHNpc3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDc1MTIsImV4cCI6MjA5MDg4MzUxMn0.-xRLvCQg_ypEln4zJtR4cIL_vFpSPZNpvhPcpWJryTA';


// دالة لتحويل الأسماء من snake_case (قاعدة البيانات) لـ camelCase (الكود)
function toCamelCase<T>(obj: any): T {
  const result: any = {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  return result as T;
}

// دالة لتحويل الأسماء من camelCase لـ snake_case
function toSnakeCase<T>(obj: any): T {
  const result: any = {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  return result as T;
}

// ================= دوال التحميل (Async) =================
export async function loadBirds(): Promise<Bird[]> {
  const { data, error } = await supabase.from('birds').select('*').order('added_date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ? data.map((item: any) => toCamelCase<Bird>(item)) : [];
}

export async function loadPairs(): Promise<Pair[]> {
  const { data, error } = await supabase.from('pairs').select('*').order('pair_date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ? data.map((item: any) => toCamelCase<Pair>(item)) : [];
}

export async function loadBreeding(): Promise<BreedingRecord[]> {
  const { data, error } = await supabase.from('breeding').select('*').order('egg_date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ? data.map((item: any) => toCamelCase<BreedingRecord>(item)) : [];
}

export async function loadHealth(): Promise<HealthRecord[]> {
  const { data, error } = await supabase.from('health').select('*').order('date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ? data.map((item: any) => toCamelCase<HealthRecord>(item)) : [];
}

export async function loadFinance(): Promise<FinancialRecord[]> {
  const { data, error } = await supabase.from('finance').select('*').order('date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ? data.map((item: any) => toCamelCase<FinancialRecord>(item)) : [];
}

export async function loadAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase.from('alerts').select('*').order('date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ? data.map((item: any) => toCamelCase<Alert>(item)) : [];
}

// ================= دوال الحفظ (Async) =================
export async function saveBirds( Bird[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase.from('birds').upsert(snakeData, { onConflict: 'id' });
  if (error) console.error('Error saving birds:', error);
}

export async function savePairs( Pair[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase.from('pairs').upsert(snakeData, { onConflict: 'id' });
  if (error) console.error('Error saving pairs:', error);
}

export async function saveBreeding( BreedingRecord[]): Promise<void> {
  const snakeData = data.map(item => toSnakeCase(item));
  const { error } = await supabase.from('breeding').upsert(snakeData, { onConflict: 'id' });
  if (error) console.error('Error saving breeding:',