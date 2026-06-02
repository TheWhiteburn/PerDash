export function getOverallProgress(data) {
  const goals = data.goals;
  const fyProgress = goals.fiveYear.reduce((s, g) => s + g.progress, 0) / Math.max(goals.fiveYear.length, 1);
  const yProgress = goals.yearly.reduce((s, g) => s + g.progress, 0) / Math.max(goals.yearly.length, 1);
  const mProgress = goals.monthly.reduce((s, g) => s + g.progress, 0) / Math.max(goals.monthly.length, 1);
  return Math.round((fyProgress * 0.5 + yProgress * 0.3 + mProgress * 0.2));
}

export function getWeeklyWorkoutStreak(data) {
  const logs = data.workouts.logs;
  const dates = Object.keys(logs).sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (logs[key] && logs[key].length > 0) {
      streak++;
    }
  }
  return streak;
}

export function getSleepTrend(data) {
  const logs = data.sleep.logs;
  const dates = Object.keys(logs).sort().reverse().slice(0, 7);
  return dates.map(d => ({ date: d, hours: logs[d] }));
}

export function getSleepAverage(data) {
  const trend = getSleepTrend(data);
  if (trend.length === 0) return 0;
  return Math.round((trend.reduce((s, t) => s + t.hours, 0) / trend.length) * 10) / 10;
}

export function getWorkoutDaysThisWeek(data) {
  return getWeeklyWorkoutStreak(data);
}

export function getChecklistCompletionRate(data) {
  const logs = data.dailyChecklist.logs;
  const dates = Object.keys(logs).sort().reverse().slice(0, 7);
  if (dates.length === 0) return 0;
  let total = 0;
  let done = 0;
  dates.forEach(d => {
    logs[d].forEach(item => {
      total++;
      if (item.done) done++;
    });
  });
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function getGoalDeadlineStatus(goal) {
  if (goal.progress >= 100) return 'completed';
  if (goal.progress > 50) return 'on-track';
  if (goal.progress > 20) return 'behind';
  return 'at-risk';
}

export function getWorkoutCalendarData(data, days = 35) {
  const logs = data.workouts.logs;
  const today = new Date();
  const grid = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    grid.push({
      date: key,
      day: d.getDay(),
      workedOut: logs[key] && logs[key].length > 0,
    });
  }
  return grid;
}

export function getTodaySummary(data, todayKey) {
  const sleep = data.sleep.logs[todayKey];
  const workout = data.workouts.logs[todayKey];
  const checklist = data.dailyChecklist.logs[todayKey];
  const checklistDone = checklist ? checklist.filter(i => i.done).length : 0;
  const checklistTotal = checklist ? checklist.length : 0;
  const workoutsDone = workout ? workout.length : 0;
  return { sleep, workoutsDone, checklistDone, checklistTotal };
}
