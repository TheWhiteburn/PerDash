import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, loadLocalData, saveLocalData } from './lib/supabase';

function getDefaultData() {
  return {
    profile: { name: '', age: '', gender: '' },
    goals: { fiveYear: [], yearly: [], monthly: [] },
    dailyChecklist: { presets: [], logs: {} },
    todos: [],
    workouts: { logs: {}, challenges: [] },
    sleep: { logs: {} },
    settings: { sleepTarget: 8, installDate: new Date().toISOString() },
  };
}

function mergeDefaults(cloudData) {
  const defaults = getDefaultData();
  return { ...defaults, ...cloudData, goals: { ...defaults.goals, ...cloudData.goals }, profile: { ...defaults.profile, ...cloudData.profile } };
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(getDefaultData);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const syncTimerRef = useRef(null);

  async function loadCloudData(userId) {
    try {
      const { data: row } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();

      if (row) {
        const merged = mergeDefaults(row.data);
        setData(merged);
        if (!merged.profile?.name) {
          setShowOnboarding(true);
          setSyncing(false);
          setLoading(false);
          return;
        }
      } else {
        const local = loadLocalData();
        if (local) {
          setData(mergeDefaults(local));
        } else {
          setShowOnboarding(true);
          setSyncing(false);
          setLoading(false);
          return;
        }
        await supabase.from('user_data').upsert({ user_id: userId, data: local || getDefaultData() }, { onConflict: 'user_id' });
      }
    } catch (e) {
      console.error('Supabase load failed, falling back to localStorage:', e);
      const local = loadLocalData();
      if (local) {
        setData(mergeDefaults(local));
      } else {
        setShowOnboarding(true);
        setSyncing(false);
        setLoading(false);
        return;
      }
    }
    setSyncing(false);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        loadCloudData(s.user.id);
      } else {
        const local = loadLocalData();
        if (local) setData(mergeDefaults(local));
        setSyncing(false);
        setLoading(false);
      }
    }).catch(e => {
      console.error('getSession error:', e);
      const local = loadLocalData();
      if (local) setData(mergeDefaults(local));
      setSyncing(false);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_IN') {
        setSession(s);
        loadCloudData(s.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setShowOnboarding(false);
        const local = loadLocalData();
        if (local) setData(mergeDefaults(local));
        setSyncing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  // Safety net: if user is logged in, done loading, but has no profile name → show onboarding
  useEffect(() => {
    if (!syncing && !loading && session && data && !data.profile?.name) {
      setShowOnboarding(true);
    }
  }, [data, syncing, loading, session]);

  const syncToCloud = useCallback(async (dataToSync) => {
    if (!session) return;
    try {
      await supabase.from('user_data').upsert({ user_id: session.user.id, data: dataToSync }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('syncToCloud:', e);
    }
  }, [session]);

  // Debounced cloud sync
  useEffect(() => {
    if (!session || syncing) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => syncToCloud(data), 2000);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [data, session, syncing, syncToCloud]);

  const finishOnboarding = useCallback(async (onboardingData) => {
    let merged;
    setData(prev => {
      merged = {
        ...prev,
        profile: { ...prev.profile, ...onboardingData.profile },
        dailyChecklist: { ...prev.dailyChecklist, ...onboardingData.dailyChecklist },
        goals: { ...prev.goals, fiveYear: [...prev.goals.fiveYear, ...(onboardingData.goals?.fiveYear || [])] },
        settings: { ...prev.settings, ...onboardingData.settings },
      };
      return merged;
    });
    setShowOnboarding(false);
    saveLocalData(merged);
    if (session) {
      await supabase.from('user_data').upsert({ user_id: session.user.id, data: merged }, { onConflict: 'user_id' });
    }
  }, [session]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data: banned, error: banError } = await supabase.rpc('is_email_banned', { check_email: email });
    if (banError) throw banError;
    if (banned) throw new Error('This email is banned. Contact support.');
    const { data: exists, error: checkErr } = await supabase.rpc('is_email_registered', { check_email: email });
    if (checkErr) throw checkErr;
    if (exists) throw new Error('Email already in use.');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(() => {
    supabase.auth.signOut();
  }, []);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  const getTodayKey = useCallback(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const getTodayChecklist = useCallback(() => {
    const todayKey = getTodayKey();
    const log = data.dailyChecklist.logs[todayKey];
    if (log) return log;
    return data.dailyChecklist.presets.filter(p => p.active).map(p => ({ id: p.id, text: p.text, done: false }));
  }, [data.dailyChecklist, getTodayKey]);

  const setTodayChecklist = useCallback((items) => {
    const todayKey = getTodayKey();
    updateData(prev => ({ ...prev, dailyChecklist: { ...prev.dailyChecklist, logs: { ...prev.dailyChecklist.logs, [todayKey]: items } } }));
  }, [getTodayKey, updateData]);

  const getTodayWorkout = useCallback(() => {
    return data.workouts.logs[getTodayKey()] || [];
  }, [data.workouts.logs, getTodayKey]);

  const logWorkout = useCallback((entry) => {
    const todayKey = getTodayKey();
    updateData(prev => {
      const today = prev.workouts.logs[todayKey] || [];
      return { ...prev, workouts: { ...prev.workouts, logs: { ...prev.workouts.logs, [todayKey]: [...today, { id: Date.now().toString(), ...entry }] } } };
    });
  }, [getTodayKey, updateData]);

  const logSleep = useCallback((hours) => {
    const todayKey = getTodayKey();
    updateData(prev => ({ ...prev, sleep: { ...prev.sleep, logs: { ...prev.sleep.logs, [todayKey]: hours } } }));
  }, [getTodayKey, updateData]);

  const exportData = useCallback(() => data, [data]);

  const importData = useCallback((newData) => { setData(newData); }, []);

  const value = {
    data, session, loading, syncing,
    showOnboarding, finishOnboarding,
    signIn, signUp, signOut,
    updateData, getTodayChecklist, setTodayChecklist,
    getTodayWorkout, logWorkout, logSleep, exportData, importData, getTodayKey,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
