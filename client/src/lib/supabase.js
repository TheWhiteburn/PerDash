import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function loadLocalData() {
  try {
    const raw = localStorage.getItem('personal-dashboard-data');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('loadLocalData:', e);
  }
  return null;
}

export function saveLocalData(data) {
  try {
    localStorage.setItem('personal-dashboard-data', JSON.stringify(data));
  } catch (e) {
    console.error('saveLocalData:', e);
  }
}

export function removeLocalData() {
  try {
    localStorage.removeItem('personal-dashboard-data');
  } catch (e) {
    console.error('removeLocalData:', e);
  }
}
