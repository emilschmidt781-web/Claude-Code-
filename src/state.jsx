import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { loadState, saveState, helpers, REWARDS, levelFromXp } from './lib/store.js'

const { uid, todayISO, freshProfileData } = helpers

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)
  const saveTimer = useRef(null)

  // Persistenz (leicht entprellt)
  useEffect(() => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveState(state), 150)
    return () => clearTimeout(saveTimer.current)
  }, [state])

  const activeId = state.activeProfileId
  const profile = state.profiles.find((p) => p.id === activeId) || state.profiles[0]
  const data = state.dataByProfile[activeId] || freshProfileData()

  // ---- Helfer zum gezielten Ändern der aktiven Profil-Daten ----
  function mutateData(fn) {
    setState((s) => {
      const cur = s.dataByProfile[s.activeProfileId] || freshProfileData()
      const next = fn(structuredCloneSafe(cur))
      return { ...s, dataByProfile: { ...s.dataByProfile, [s.activeProfileId]: next } }
    })
  }

  // ---- Aufgaben ----
  function addTask(t) {
    mutateData((d) => {
      d.tasks.push({
        id: uid(),
        title: t.title.trim(),
        notes: t.notes || '',
        time: t.time || '',
        duration: t.duration || 15,
        category: t.category || 'work',
        energy: t.energy || 'med',
        priority: !!t.priority,
        done: false,
        steps: t.steps || [],
        createdAt: Date.now(),
        date: t.date || todayISO(),
      })
      return d
    })
  }

  function updateTask(id, patch) {
    mutateData((d) => {
      const i = d.tasks.findIndex((x) => x.id === id)
      if (i >= 0) d.tasks[i] = { ...d.tasks[i], ...patch }
      return d
    })
  }

  function toggleTask(id) {
    mutateData((d) => {
      const t = d.tasks.find((x) => x.id === id)
      if (!t) return d
      t.done = !t.done
      if (t.done) {
        d.coins += 3
        d.xp += 8
      }
      return d
    })
  }

  function removeTask(id) {
    mutateData((d) => {
      d.tasks = d.tasks.filter((x) => x.id !== id)
      return d
    })
  }

  function reorderTasks(orderedIds) {
    mutateData((d) => {
      const map = new Map(d.tasks.map((t) => [t.id, t]))
      const reordered = orderedIds.map((id) => map.get(id)).filter(Boolean)
      const rest = d.tasks.filter((t) => !orderedIds.includes(t.id))
      d.tasks = [...reordered, ...rest]
      return d
    })
  }

  function toggleStep(taskId, stepId) {
    mutateData((d) => {
      const t = d.tasks.find((x) => x.id === taskId)
      if (t) {
        const st = t.steps.find((s) => s.id === stepId)
        if (st) st.done = !st.done
      }
      return d
    })
  }

  function setSteps(taskId, titles) {
    mutateData((d) => {
      const t = d.tasks.find((x) => x.id === taskId)
      if (t) t.steps = titles.map((title) => ({ id: uid(), title, done: false }))
      return d
    })
  }

  // ---- Fokus-Session abschließen: Belohnungen + Streak ----
  function completeFocus({ minutes, taskId }) {
    mutateData((d) => {
      d.focusSessions.push({ id: uid(), minutes, taskId: taskId || null, completedAt: Date.now() })
      const coins = Math.max(5, Math.round(minutes * 0.8))
      const xp = Math.max(10, Math.round(minutes * 1.2))
      d.coins += coins
      d.xp += xp
      // Streak: einmal pro Tag hochzählen
      const today = todayISO()
      if (d.streak.lastDate !== today) {
        const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
        d.streak.count = d.streak.lastDate === y ? d.streak.count + 1 : 1
        d.streak.lastDate = today
      }
      return d
    })
  }

  // ---- Belohnungs-Shop ----
  function buyReward(rewardId) {
    const reward = REWARDS.find((r) => r.id === rewardId)
    if (!reward) return
    mutateData((d) => {
      if (d.ownedRewards.includes(rewardId) || d.coins < reward.cost) return d
      d.coins -= reward.cost
      d.ownedRewards.push(rewardId)
      d.equipped[reward.type] = rewardId // gleich anlegen
      return d
    })
  }

  function equipReward(rewardId) {
    const reward = REWARDS.find((r) => r.id === rewardId)
    if (!reward) return
    mutateData((d) => {
      if (!d.ownedRewards.includes(rewardId)) return d
      d.equipped[reward.type] = d.equipped[reward.type] === rewardId ? null : rewardId
      return d
    })
  }

  // ---- Profile ----
  function addProfile(p) {
    setState((s) => {
      if (s.profiles.length >= 5) return s
      const id = uid()
      return {
        ...s,
        profiles: [...s.profiles, { id, name: p.name || 'Neu', avatar: p.avatar || '🐨', color: p.color || '#5fd0c5' }],
        dataByProfile: { ...s.dataByProfile, [id]: freshProfileData() },
        activeProfileId: id,
      }
    })
  }

  function switchProfile(id) {
    setState((s) => ({ ...s, activeProfileId: id }))
  }

  function updateProfile(id, patch) {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }

  function removeProfile(id) {
    setState((s) => {
      if (s.profiles.length <= 1) return s
      const profiles = s.profiles.filter((p) => p.id !== id)
      const dataByProfile = { ...s.dataByProfile }
      delete dataByProfile[id]
      const activeProfileId = s.activeProfileId === id ? profiles[0].id : s.activeProfileId
      return { ...s, profiles, dataByProfile, activeProfileId }
    })
  }

  function finishOnboarding(name, avatar, color) {
    setState((s) => ({
      ...s,
      onboarded: true,
      profiles: s.profiles.map((p, i) => (i === 0 ? { ...p, name: name || p.name, avatar: avatar || p.avatar, color: color || p.color } : p)),
    }))
  }

  const level = useMemo(() => levelFromXp(data.xp), [data.xp])

  const value = {
    state,
    profile,
    profiles: state.profiles,
    data,
    level,
    // actions
    addTask, updateTask, toggleTask, removeTask, reorderTasks, toggleStep, setSteps,
    completeFocus, buyReward, equipReward,
    addProfile, switchProfile, updateProfile, removeProfile, finishOnboarding,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp muss innerhalb von <AppProvider> benutzt werden')
  return ctx
}

function structuredCloneSafe(obj) {
  try {
    return structuredClone(obj)
  } catch {
    return JSON.parse(JSON.stringify(obj))
  }
}
