import { useState, useEffect, useRef } from 'react'

// ── グローバルスタイル ────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

    .iron-btn { transition: filter 0.15s ease, transform 0.15s ease; }
    .iron-btn:hover { filter: brightness(0.9); transform: translateY(-1px); }
    .iron-btn:active { transform: translateY(0); filter: brightness(0.85); }

    .iron-nav-btn { transition: all 0.2s ease; }

    .iron-day { transition: background 0.1s ease; }
    .iron-day:hover { background: #eef2ff !important; color: #6366f1 !important; }

    .iron-item { transition: background 0.12s ease; }
    .iron-item:hover { background: #f8fafc !important; }

    .iron-input:focus {
      outline: none;
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
    }

    select.iron-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      cursor: pointer;
    }
    select.iron-select:focus {
      outline: none;
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .iron-fadein { animation: fadeIn 0.2s ease; }
  `}</style>
)

// ── テーマ ────────────────────────────────────────────────────
const T = {
  primary:      '#6366f1',
  primaryLight: '#eef2ff',
  success:      '#22c55e',
  danger:       '#ef4444',
  warning:      '#f59e0b',
  neutral:      '#64748b',
  bg:           '#f1f5f9',
  card:         '#ffffff',
  border:       '#e2e8f0',
  text:         '#1e293b',
  textSub:      '#64748b',
  textMuted:    '#94a3b8',
}

const card = {
  background: T.card,
  padding: '20px',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
  marginBottom: '16px',
  border: `1px solid ${T.border}`,
}

const btn = (bg, color = '#fff') => ({
  padding: '10px 18px',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  background: bg,
  color,
  lineHeight: '1',
})

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: `1.5px solid ${T.border}`,
  fontSize: '14px',
  color: T.text,
  background: '#fff',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const labelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: T.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '6px',
  display: 'block',
}

// ── ステッパー ────────────────────────────────────────────────
function Stepper({ value, onDec, onInc, unit, size = 'md' }) {
  const isLg = size === 'lg'
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isLg ? '16px' : '10px' }}>
      <button onClick={onDec} className="iron-btn" style={{
        width: isLg ? '44px' : '36px', height: isLg ? '44px' : '36px',
        border: `1.5px solid ${T.border}`, borderRadius: '10px',
        background: '#fff', color: T.text, fontSize: isLg ? '20px' : '16px',
        cursor: 'pointer', fontWeight: '600',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>−</button>
      <span style={{
        fontSize: isLg ? '28px' : '22px', fontWeight: '700', color: T.text,
        minWidth: isLg ? '90px' : '56px', textAlign: 'center',
      }}>
        {value}{unit}
      </span>
      <button onClick={onInc} className="iron-btn" style={{
        width: isLg ? '44px' : '36px', height: isLg ? '44px' : '36px',
        border: `1.5px solid ${T.border}`, borderRadius: '10px',
        background: '#fff', color: T.text, fontSize: isLg ? '20px' : '16px',
        cursor: 'pointer', fontWeight: '600',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>＋</button>
    </div>
  )
}

// ── カレンダー ────────────────────────────────────────────────
function CalendarTab({ savedWorkouts, onDeleteWorkout }) {
  const today = new Date()
  const [year, setYear]         = useState(today.getFullYear())
  const [month, setMonth]       = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  const workoutDateSet = new Set(savedWorkouts.map(w => w.date))

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const toDateStr   = (d) => `${year}/${month + 1}/${d}`

  const selectedRecords = selectedDate
    ? savedWorkouts.filter(w => w.date === toDateStr(selectedDate))
    : []

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="iron-fadein">
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={prevMonth} className="iron-btn" style={{ ...btn('#f1f5f9', T.text), padding: '8px 16px', fontSize: '18px' }}>‹</button>
          <span style={{ fontSize: '17px', fontWeight: '700', color: T.text }}>{year}年 {month + 1}月</span>
          <button onClick={nextMonth} className="iron-btn" style={{ ...btn('#f1f5f9', T.text), padding: '8px 16px', fontSize: '18px' }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
          {['日','月','火','水','木','金','土'].map((d, i) => (
            <div key={d} style={{
              fontSize: '11px', fontWeight: '700', padding: '4px 0', letterSpacing: '0.03em',
              color: i === 0 ? '#f87171' : i === 6 ? T.primary : T.textMuted,
            }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />
            const dateStr   = toDateStr(day)
            const hasRecord = workoutDateSet.has(dateStr)
            const isToday   = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
            const isSelected = selectedDate === day
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={isSelected || isToday ? '' : 'iron-day'}
                style={{
                  padding: '7px 0', textAlign: 'center', borderRadius: '10px', cursor: 'pointer',
                  background: isSelected ? T.primary : isToday ? T.primaryLight : 'transparent',
                  color: isSelected ? '#fff' : isToday ? T.primary : T.text,
                  fontWeight: isToday || isSelected ? '700' : '400',
                  fontSize: '14px',
                  outline: isToday && !isSelected ? `2px solid ${T.primary}` : 'none',
                  outlineOffset: '-2px',
                }}
              >
                {day}
                {hasRecord && (
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: isSelected ? '#fff' : T.primary,
                    margin: '2px auto 0',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {selectedDate && (
        <section style={card} className="iron-fadein">
          <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '700', color: T.text }}>
            {year}/{month + 1}/{selectedDate} の記録
          </h3>
          {selectedRecords.length === 0 ? (
            <p style={{ color: T.textMuted, fontSize: '14px', margin: 0 }}>この日の記録はありません</p>
          ) : (
            selectedRecords.map(record => (
              <div key={record.id} style={{ borderBottom: `1px solid ${T.border}`, padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: T.primaryLight, color: T.primary, fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' }}>
                    {record.duration}
                  </span>
                  <button onClick={() => onDeleteWorkout(record.id)} className="iron-btn" style={{ ...btn(T.danger), padding: '5px 12px', fontSize: '12px' }}>削除</button>
                </div>
                {record.timers && record.timers.length > 0 && (
                  <div style={{ fontSize: '13px', color: T.primary, fontWeight: '600', marginBottom: '4px' }}>
                    {record.timers.map(t => `${t.minutes}分`).join(' · ')} 完走
                  </div>
                )}
                {record.exercises && record.exercises.length > 0 && (
                  <div style={{ fontSize: '13px', color: T.textSub, lineHeight: '1.6' }}>
                    {record.exercises.map(e => `${e.name} ${e.weight}kg`).join(' · ')}
                  </div>
                )}
                {record.note && (
                  <div style={{ fontSize: '12px', color: T.textMuted, marginTop: '6px', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                    {record.note}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}
    </div>
  )
}

// ── メイン ────────────────────────────────────────────────────
function App() {
  const [activeMainTab, setActiveMainTab] = useState('calendar')
  const [activeSubTab,  setActiveSubTab]  = useState('record')

  const [savedWorkouts, setSavedWorkouts] = useState(() => {
    const stored = localStorage.getItem('ironNoteWorkouts')
    return stored ? JSON.parse(stored) : []
  })

  const [menus, setMenus] = useState([
    { name: 'ベンチプレス', defaultWeight: 60 },
    { name: 'スクワット',   defaultWeight: 80 },
    { name: 'デッドリフト', defaultWeight: 100 },
  ])
  const [selectedMenu,      setSelectedMenu]      = useState(menus[0].name)
  const [weight,            setWeight]            = useState(60)
  const [workoutList,       setWorkoutList]       = useState([])
  const [diary,             setDiary]             = useState('')
  const [newMenuName,       setNewMenuName]       = useState('')
  const [newMenuWeight,     setNewMenuWeight]     = useState(20)
  const [reps,              setReps]              = useState(10)
  const [sets,              setSets]              = useState(1)
  const [isMenuListOpen,    setIsMenuListOpen]    = useState(false)
  const [isEditingMenus,    setIsEditingMenus]    = useState(false)
  const [isEditingWorkout,  setIsEditingWorkout]  = useState(false)
  const [dragOverId,        setDragOverId]        = useState(null)
  const dragItemId                                = useRef(null)
  const [menuDragOverName,  setMenuDragOverName]  = useState(null)
  const menuDragItemName                          = useRef(null)

  const [timeLeft,                setTimeLeft]                = useState(1200)
  const [isTimerRunning,          setIsTimerRunning]          = useState(false)
  const [inputMinutes,            setInputMinutes]            = useState(20)
  const [countdownInitialSeconds, setCountdownInitialSeconds] = useState(1200)
  const [timerLogs,               setTimerLogs]               = useState([])
  const [celebration,             setCelebration]             = useState(null)
  const cdInitRef = useRef(null)

  useEffect(() => { cdInitRef.current = countdownInitialSeconds }, [countdownInitialSeconds])

  useEffect(() => {
    let interval = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            const mins = Math.round(cdInitRef.current / 60)
            setCelebration({ minutes: mins })
            setTimerLogs(logs => [...logs, { id: Date.now(), minutes: mins }])
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    return `${m}:${(s % 60).toString().padStart(2, '0')}`
  }

  const handleMenuChange = (e) => {
    const name = e.target.value
    setSelectedMenu(name)
    const m = menus.find(menu => menu.name === name)
    if (m) setWeight(m.defaultWeight)
  }

  const addToList = () => {
    setWorkoutList([...workoutList, { id: Date.now(), name: selectedMenu, weight, reps, sets }])
  }

  const removeFromList = (id) => setWorkoutList(workoutList.filter(item => item.id !== id))

  const handleMenuDragStart = (name) => { menuDragItemName.current = name }
  const handleMenuDragOver  = (e, name) => { e.preventDefault(); setMenuDragOverName(name) }
  const handleMenuDrop      = (targetName) => {
    const from = menus.findIndex(m => m.name === menuDragItemName.current)
    const to   = menus.findIndex(m => m.name === targetName)
    if (from === to) return
    const updated = [...menus]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setMenus(updated)
    setMenuDragOverName(null)
    menuDragItemName.current = null
  }

  const handleDragStart = (id) => { dragItemId.current = id }
  const handleDragOver  = (e, id) => { e.preventDefault(); setDragOverId(id) }
  const handleDrop      = (targetId) => {
    const from = workoutList.findIndex(i => i.id === dragItemId.current)
    const to   = workoutList.findIndex(i => i.id === targetId)
    if (from === to) return
    const updated = [...workoutList]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setWorkoutList(updated)
    setDragOverId(null)
    dragItemId.current = null
  }

  const addMenu = () => {
    const trimmed = newMenuName.trim()
    if (!trimmed || menus.find(m => m.name === trimmed)) return
    setMenus([...menus, { name: trimmed, defaultWeight: newMenuWeight }])
    setNewMenuName('')
    setNewMenuWeight(20)
  }

  const deleteMenu = (name) => {
    const updated = menus.filter(m => m.name !== name)
    setMenus(updated)
    if (selectedMenu === name && updated.length > 0) {
      setSelectedMenu(updated[0].name)
      setWeight(updated[0].defaultWeight)
    }
    if (updated.length === 0) setIsEditingMenus(false)
  }

  const setTimer = (minutes) => {
    const secs = minutes * 60
    setIsTimerRunning(false)
    setCountdownInitialSeconds(secs)
    setTimeLeft(secs)
    setInputMinutes(minutes)
  }

  const saveWorkout = () => {
    if (workoutList.length === 0 && timerLogs.length === 0) { alert('記録がありません'); return }
    const totalMins = timerLogs.reduce((sum, t) => sum + t.minutes, 0)
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ja-JP'),
      duration: totalMins > 0 ? `${totalMins}分` : '--',
      exercises: workoutList,
      timers: timerLogs,
      note: diary,
    }
    const updated = [...savedWorkouts, newRecord]
    setSavedWorkouts(updated)
    localStorage.setItem('ironNoteWorkouts', JSON.stringify(updated))
    setWorkoutList([])
    setTimerLogs([])
    setDiary('')
    setTimeLeft(countdownInitialSeconds)
    setIsTimerRunning(false)
    alert('保存しました！')
  }

  const deleteWorkout = (id) => {
    const updated = savedWorkouts.filter(w => w.id !== id)
    setSavedWorkouts(updated)
    localStorage.setItem('ironNoteWorkouts', JSON.stringify(updated))
  }

  return (
    <>
      <GlobalStyles />
      <div style={{
        padding: '20px 16px 40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        width: '100%', maxWidth: '420px', margin: '0 auto',
        backgroundColor: T.bg, minHeight: '100vh',
      }}>

        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: T.text, letterSpacing: '-0.03em' }}>
            IRON <span style={{ color: T.primary }}>NOTE</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: T.textMuted, fontWeight: '500' }}>
            あなただけのトレーニング記録
          </p>
        </div>

        {/* メインナビ */}
        <div style={{
          display: 'flex', background: '#fff', borderRadius: '14px', padding: '4px',
          marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: `1px solid ${T.border}`,
        }}>
          {[
            { key: 'calendar', label: 'カレンダー' },
            { key: 'workout',  label: 'ワークアウト' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveMainTab(key)}
              className="iron-nav-btn"
              style={{
                flex: 1, padding: '11px', border: 'none', borderRadius: '10px',
                background: activeMainTab === key ? T.primary : 'transparent',
                color: activeMainTab === key ? '#fff' : T.textSub,
                fontWeight: '600', cursor: 'pointer', fontSize: '14px',
              }}
            >{label}</button>
          ))}
        </div>

        {/* カレンダー */}
        {activeMainTab === 'calendar' && (
          <CalendarTab savedWorkouts={savedWorkouts} onDeleteWorkout={deleteWorkout} />
        )}

        {/* ワークアウト */}
        {activeMainTab === 'workout' && (
          <div className="iron-fadein">
            {/* サブナビ */}
            <div style={{
              display: 'flex', background: T.primaryLight,
              borderRadius: '12px', padding: '4px', marginBottom: '16px',
            }}>
              {[
                { key: 'record', label: '記録' },
                { key: 'timer',  label: 'タイマー' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveSubTab(key)}
                  className="iron-nav-btn"
                  style={{
                    flex: 1, padding: '9px', border: 'none', borderRadius: '8px',
                    background: activeSubTab === key ? T.primary : 'transparent',
                    color: activeSubTab === key ? '#fff' : T.primary,
                    fontWeight: '600', cursor: 'pointer', fontSize: '13px',
                  }}
                >{label}</button>
              ))}
            </div>

            {/* 記録タブ */}
            {activeSubTab === 'record' && (
              <div className="iron-fadein">

                {/* 種目選択 */}
                <section style={card}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '700', color: T.text }}>種目選択</h3>
                  <select
                    value={selectedMenu} onChange={handleMenuChange}
                    className="iron-select iron-input"
                    style={{ ...inputStyle, marginBottom: '18px', paddingRight: '36px' }}
                  >
                    {menus.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>

                  <div style={{ marginBottom: '14px' }}>
                    <span style={labelStyle}>重量</span>
                    <Stepper
                      value={weight}
                      onDec={() => setWeight(w => w - 2.5)}
                      onInc={() => setWeight(w => w + 2.5)}
                      unit="kg" size="lg"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={labelStyle}>回数</span>
                      <Stepper value={reps} onDec={() => setReps(r => Math.max(1, r - 1))} onInc={() => setReps(r => r + 1)} unit="回" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={labelStyle}>セット数</span>
                      <Stepper value={sets} onDec={() => setSets(s => Math.max(1, s - 1))} onInc={() => setSets(s => s + 1)} unit="セット" />
                    </div>
                  </div>

                  <button onClick={addToList} className="iron-btn" style={{ ...btn(T.primary), width: '100%', padding: '13px', marginTop: '16px', fontSize: '15px' }}>
                    リストに追加
                  </button>
                </section>

                {/* 今日のメニュー */}
                <section style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: T.text }}>
                      今日のメニュー
                      {timerLogs.length > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: T.primary, fontWeight: '600', background: T.primaryLight, padding: '2px 8px', borderRadius: '20px' }}>
                          {timerLogs.length}セット
                        </span>
                      )}
                    </h3>
                    {workoutList.length > 0 && (
                      <button
                        onClick={() => setIsEditingWorkout(e => !e)}
                        className="iron-btn"
                        style={{ ...btn(isEditingWorkout ? T.neutral : T.warning), padding: '5px 12px', fontSize: '12px' }}
                      >{isEditingWorkout ? '完了' : '編集'}</button>
                    )}
                  </div>
                  {workoutList.length === 0 && timerLogs.length === 0
                    ? <p style={{ color: T.textMuted, fontSize: '14px', margin: 0, textAlign: 'center', padding: '16px 0' }}>まだ記録がありません</p>
                    : <>
                        {timerLogs.map(log => (
                          <div key={log.id} style={{
                            display: 'flex', alignItems: 'center',
                            padding: '10px 6px', borderBottom: `1px solid ${T.border}`,
                          }}>
                            <span style={{ flex: 1, fontSize: '14px', color: T.primary, fontWeight: '600' }}>
                              タイマー　{log.minutes}分 完走
                            </span>
                            <button
                              onClick={() => setTimerLogs(logs => logs.filter(l => l.id !== log.id))}
                              className="iron-btn"
                              style={{ ...btn('#f1f5f9', T.textMuted), padding: '4px 10px', fontSize: '12px' }}
                            >✕</button>
                          </div>
                        ))}
                        {workoutList.map(item => (
                          <div
                            key={item.id}
                            draggable={isEditingWorkout}
                            onDragStart={() => handleDragStart(item.id)}
                            onDragOver={(e) => handleDragOver(e, item.id)}
                            onDrop={() => handleDrop(item.id)}
                            onDragEnd={() => setDragOverId(null)}
                            className="iron-item"
                            style={{
                              display: 'flex', alignItems: 'center',
                              padding: '10px 6px', borderBottom: `1px solid ${T.border}`,
                              background: dragOverId === item.id ? T.primaryLight : 'transparent',
                              borderRadius: '8px', cursor: isEditingWorkout ? 'grab' : 'default',
                            }}
                          >
                            {isEditingWorkout && (
                              <span style={{ color: T.textMuted, fontSize: '16px', marginRight: '8px', userSelect: 'none' }}>⠿</span>
                            )}
                            <span style={{ flex: 1, fontSize: '14px', color: T.text }}>
                              {!isEditingWorkout && <span style={{ color: T.success, marginRight: '6px', fontWeight: '700' }}>·</span>}
                              <strong>{item.name}</strong>　{item.weight}kg × {item.reps}回 × {item.sets}セット
                            </span>
                            {isEditingWorkout && (
                              <button onClick={() => removeFromList(item.id)} className="iron-btn" style={{ ...btn(T.danger), padding: '4px 10px', fontSize: '12px' }}>✕</button>
                            )}
                          </div>
                        ))}
                      </>
                  }
                </section>

                {/* 種目の管理 */}
                <section style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMenuListOpen ? '14px' : 0 }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: T.text }}>種目の管理</h3>
                    <button
                      onClick={() => { setIsMenuListOpen(o => !o); if (isMenuListOpen) setIsEditingMenus(false) }}
                      className="iron-btn"
                      style={{ ...btn('#f1f5f9', T.text), padding: '5px 12px', fontSize: '12px' }}
                    >{isMenuListOpen ? '▲ 閉じる' : '▼ 開く'}</button>
                  </div>

                  {isMenuListOpen && (
                    <div className="iron-fadein">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                        <button
                          onClick={() => setIsEditingMenus(e => !e)}
                          className="iron-btn"
                          style={{ ...btn(isEditingMenus ? T.neutral : T.warning), padding: '5px 12px', fontSize: '12px' }}
                        >{isEditingMenus ? '完了' : '編集'}</button>
                      </div>

                      {menus.map(m => (
                        <div
                          key={m.name}
                          draggable={isEditingMenus}
                          onDragStart={() => handleMenuDragStart(m.name)}
                          onDragOver={(e) => handleMenuDragOver(e, m.name)}
                          onDrop={() => handleMenuDrop(m.name)}
                          onDragEnd={() => setMenuDragOverName(null)}
                          className="iron-item"
                          style={{
                            display: 'flex', alignItems: 'center',
                            padding: '10px 6px', borderBottom: `1px solid ${T.border}`,
                            background: menuDragOverName === m.name ? T.primaryLight : 'transparent',
                            borderRadius: '8px', cursor: isEditingMenus ? 'grab' : 'default',
                          }}
                        >
                          {isEditingMenus && (
                            <span style={{ color: T.textMuted, fontSize: '16px', marginRight: '8px', userSelect: 'none' }}>⠿</span>
                          )}
                          <span style={{ flex: 1, fontSize: '14px', color: T.text }}>
                            {m.name}
                            <span style={{ color: T.textMuted, marginLeft: '8px', fontSize: '13px' }}>{m.defaultWeight}kg</span>
                          </span>
                          {isEditingMenus && (
                            <button onClick={() => deleteMenu(m.name)} className="iron-btn" style={{ ...btn(T.danger), padding: '4px 10px', fontSize: '12px' }}>削除</button>
                          )}
                        </div>
                      ))}

                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${T.border}` }}>
                        <p style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '13px', color: T.text }}>＋ 新しい種目を追加</p>
                        <input
                          type="text" placeholder="種目名"
                          value={newMenuName} onChange={(e) => setNewMenuName(e.target.value)}
                          className="iron-input" style={{ ...inputStyle, marginBottom: '8px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: T.textSub, whiteSpace: 'nowrap' }}>デフォルト重量</span>
                          <input
                            type="number" value={newMenuWeight}
                            onChange={(e) => setNewMenuWeight(Number(e.target.value))}
                            className="iron-input" style={{ ...inputStyle, width: '80px' }}
                          />
                          <span style={{ fontSize: '13px', color: T.textSub }}>kg</span>
                          <button onClick={addMenu} className="iron-btn" style={{ ...btn(T.primary), padding: '10px 16px', marginLeft: 'auto', whiteSpace: 'nowrap' }}>登録</button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* ワークアウト完了 */}
                <section style={card}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: T.text }}>ワークアウト完了</h3>
                  <textarea
                    placeholder="今日のパンプ感や所感を入力..."
                    value={diary} onChange={(e) => setDiary(e.target.value)}
                    className="iron-input"
                    style={{ ...inputStyle, height: '80px', resize: 'none', marginBottom: '12px', fontFamily: 'inherit' }}
                  />
                  <button onClick={saveWorkout} className="iron-btn" style={{ ...btn(T.primary), width: '100%', padding: '15px', fontSize: '15px', fontWeight: '700' }}>
                    すべて保存して終了
                  </button>
                </section>
              </div>
            )}

            {/* タイマータブ */}
            {activeSubTab === 'timer' && (() => {
              const CIRC = 2 * Math.PI * 88
              const ringProgress = countdownInitialSeconds > 0 ? timeLeft / countdownInitialSeconds : 1
              const ringColor = timeLeft === 0 ? T.danger : T.primary
              const dashOffset = CIRC * (1 - ringProgress)
              const PRESETS = [10, 15, 20, 25, 30, 40, 50, 60]
              const selectedPreset = PRESETS.includes(inputMinutes) ? inputMinutes : null
              return (
                <div className="iron-fadein">

                  {/* 達成バナー */}
                  {celebration && (
                    <div className="iron-fadein" style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      borderRadius: '16px', padding: '24px 20px',
                      textAlign: 'center', marginBottom: '16px',
                      boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                    }}>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                        {celebration.minutes}分 達成！
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>
                        お疲れ様でした。記録タブから保存できます。
                      </div>
                      <button
                        onClick={() => { setCelebration(null); setTimeLeft(countdownInitialSeconds) }}
                        className="iron-btn"
                        style={{ ...btn('rgba(255,255,255,0.2)', '#fff'), padding: '10px 24px', fontWeight: '600' }}
                      >もう一度</button>
                    </div>
                  )}

                  <section style={card}>
                    {/* 円形リング + 時間表示 */}
                    <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 28px' }}>
                      <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="110" cy="110" r="88" fill="none" stroke={T.border} strokeWidth="10" />
                        <circle
                          cx="110" cy="110" r="88"
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={CIRC}
                          strokeDashoffset={dashOffset}
                          style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          fontSize: '48px', fontWeight: '800',
                          fontFamily: '"SF Mono", "Fira Code", monospace',
                          color: timeLeft === 0 ? T.danger : T.text,
                          letterSpacing: '-0.02em', lineHeight: '1',
                          transition: 'color 0.3s ease',
                        }}>
                          {formatTime(timeLeft)}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: T.textMuted }}>
                          / {formatTime(countdownInitialSeconds)}
                        </div>
                        {timerLogs.length > 0 && (
                          <div style={{ marginTop: '4px', fontSize: '11px', color: T.primary, fontWeight: '600' }}>
                            {timerLogs.length}セット完走
                          </div>
                        )}
                      </div>
                    </div>

                    {/* コントロール */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setIsTimerRunning(r => !r)}
                        className="iron-btn"
                        style={{
                          ...btn(isTimerRunning ? T.warning : T.success),
                          minWidth: '120px', padding: '14px 24px', fontSize: '16px', fontWeight: '700',
                          boxShadow: isTimerRunning
                            ? '0 4px 14px rgba(245,158,11,0.35)'
                            : '0 4px 14px rgba(34,197,94,0.35)',
                        }}
                      >
                        {isTimerRunning ? 'PAUSE' : 'START'}
                      </button>
                      <button
                        onClick={() => { setIsTimerRunning(false); setTimeLeft(countdownInitialSeconds) }}
                        className="iron-btn"
                        style={{ ...btn('#f1f5f9', T.text), padding: '14px 20px' }}
                      >RESET</button>
                    </div>
                  </section>

                  {/* 時間設定 */}
                  <section style={card}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '700', color: T.text }}>時間設定</h3>

                    <select
                      value={selectedPreset ?? ''}
                      onChange={(e) => { if (e.target.value) setTimer(Number(e.target.value)) }}
                      className="iron-select iron-input"
                      style={{ ...inputStyle, marginBottom: '12px', paddingRight: '36px' }}
                    >
                      <option value="" disabled>時間を選択</option>
                      {PRESETS.map(min => (
                        <option key={min} value={min}>{min}分</option>
                      ))}
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: T.textSub, whiteSpace: 'nowrap' }}>カスタム</span>
                      <input
                        type="number" value={inputMinutes} min="1"
                        onChange={(e) => setInputMinutes(Number(e.target.value))}
                        className="iron-input"
                        style={{ ...inputStyle, width: '80px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '13px', color: T.textSub }}>分</span>
                      <button
                        onClick={() => setTimer(inputMinutes)}
                        className="iron-btn"
                        style={{ ...btn(T.primary), padding: '10px 16px', marginLeft: 'auto' }}
                      >セット</button>
                    </div>
                  </section>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </>
  )
}

export default App
