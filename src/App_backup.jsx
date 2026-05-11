import { useState, useEffect, useRef } from 'react'

// ── カレンダー ────────────────────────────────────────────
function CalendarTab({ savedWorkouts, onDeleteWorkout }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(null);

  // "2026/5/9" → "2026/5/9" 形式に統一して検索できるセット
  const workoutDateSet = new Set(savedWorkouts.map(w => w.date));

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const firstDay = new Date(year, month, 1).getDay(); // 0=日
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toDateStr = (d) => `${year}/${month + 1}/${d}`;

  const selectedRecords = selectedDate
    ? savedWorkouts.filter(w => w.date === toDateStr(selectedDate))
    : [];

  const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <section style={cardStyle}>
        {/* 月ナビ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={prevMonth} style={{ ...btnStyle, padding: '6px 14px', background: '#eee', color: '#333' }}>＜</button>
          <strong style={{ fontSize: '18px' }}>{year}年 {month + 1}月</strong>
          <button onClick={nextMonth} style={{ ...btnStyle, padding: '6px 14px', background: '#eee', color: '#333' }}>＞</button>
        </div>

        {/* 曜日ヘッダー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
          {['日','月','火','水','木','金','土'].map(d => (
            <div key={d} style={{ fontSize: '12px', color: '#888', fontWeight: 'bold' }}>{d}</div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = toDateStr(day);
            const hasRecord = workoutDateSet.has(dateStr);
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            const isSelected = selectedDate === day;
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                style={{
                  padding: '8px 0',
                  textAlign: 'center',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isSelected ? '#007bff' : isToday ? '#e8f4ff' : 'transparent',
                  color: isSelected ? '#fff' : '#333',
                  fontWeight: isToday ? 'bold' : 'normal',
                  position: 'relative',
                }}
              >
                {day}
                {hasRecord && (
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isSelected ? '#fff' : '#007bff',
                    margin: '2px auto 0',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 選択日の記録 */}
      {selectedDate && (
        <section style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>📋 {year}/{month + 1}/{selectedDate} の記録</h3>
          {selectedRecords.length === 0 ? (
            <p style={{ color: '#999' }}>この日の記録はありません</p>
          ) : (
            selectedRecords.map(record => (
              <div key={record.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>⏱ {record.duration}</span>
                  <button
                    onClick={() => onDeleteWorkout(record.id)}
                    style={{ ...btnStyle, padding: '4px 10px', background: '#ff4d4d', color: 'white', fontSize: '12px' }}
                  >削除</button>
                </div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                  {record.exercises.map(e => `${e.name} ${e.weight}kg`).join(' / ')}
                </div>
                {record.note && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>💬 {record.note}</div>}
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

// ── メイン ────────────────────────────────────────────────
function App() {
  const [activeMainTab, setActiveMainTab] = useState('calendar');
  const [activeSubTab, setActiveSubTab] = useState('record');

  // --- 💾 保存済みワークアウト ---
  const [savedWorkouts, setSavedWorkouts] = useState(() => {
    const stored = localStorage.getItem('ironNoteWorkouts');
    return stored ? JSON.parse(stored) : [];
  });

  // --- 🏋️ ワークアウト用のState ---
  const [menus, setMenus] = useState([
    { name: 'ベンチプレス', defaultWeight: 60 },
    { name: 'スクワット', defaultWeight: 80 },
    { name: 'デッドリフト', defaultWeight: 100 }
  ]);
  const [selectedMenu, setSelectedMenu] = useState(menus[0].name);
  const [weight, setWeight] = useState(60);
  const [workoutList, setWorkoutList] = useState([]);
  const [diary, setDiary] = useState("");
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuWeight, setNewMenuWeight] = useState(20);
  const [reps, setReps] = useState(10);
  const [sets, setSets] = useState(1);
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);
  const [isEditingMenus, setIsEditingMenus] = useState(false);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItemId = useRef(null);
  const [menuDragOverName, setMenuDragOverName] = useState(null);
  const menuDragItemName = useRef(null);

  // --- ⏱ タイマー用のState ---
  const [timerMode, setTimerMode] = useState('countup');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(3);
  const [countdownInitialSeconds, setCountdownInitialSeconds] = useState(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerMode === 'countup') {
          setTimeLeft(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setIsTimerRunning(false);
              alert("時間です！次のセットへGO！");
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleMenuChange = (e) => {
    const name = e.target.value;
    setSelectedMenu(name);
    const m = menus.find(menu => menu.name === name);
    if (m) setWeight(m.defaultWeight);
  };

  const addToList = () => {
    setWorkoutList([...workoutList, { id: Date.now(), name: selectedMenu, weight, reps, sets }]);
  };

  const removeFromList = (id) => {
    setWorkoutList(workoutList.filter(item => item.id !== id));
  };

  const handleMenuDragStart = (name) => { menuDragItemName.current = name; };
  const handleMenuDragOver = (e, name) => { e.preventDefault(); setMenuDragOverName(name); };
  const handleMenuDrop = (targetName) => {
    const fromIdx = menus.findIndex(m => m.name === menuDragItemName.current);
    const toIdx = menus.findIndex(m => m.name === targetName);
    if (fromIdx === toIdx) return;
    const updated = [...menus];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setMenus(updated);
    setMenuDragOverName(null);
    menuDragItemName.current = null;
  };

  const handleDragStart = (id) => { dragItemId.current = id; };
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (targetId) => {
    const fromIdx = workoutList.findIndex(i => i.id === dragItemId.current);
    const toIdx = workoutList.findIndex(i => i.id === targetId);
    if (fromIdx === toIdx) return;
    const updated = [...workoutList];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setWorkoutList(updated);
    setDragOverId(null);
    dragItemId.current = null;
  };

  const addMenu = () => {
    const trimmed = newMenuName.trim();
    if (!trimmed) return;
    if (menus.find(m => m.name === trimmed)) return;
    setMenus([...menus, { name: trimmed, defaultWeight: newMenuWeight }]);
    setNewMenuName('');
    setNewMenuWeight(20);
  };

  const deleteMenu = (name) => {
    const updated = menus.filter(m => m.name !== name);
    setMenus(updated);
    if (selectedMenu === name && updated.length > 0) {
      setSelectedMenu(updated[0].name);
      setWeight(updated[0].defaultWeight);
    }
    if (updated.length === 0) setIsEditingMenus(false);
  };

  const switchMode = (mode) => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimeLeft(0);
  };

  const getCurrentElapsed = () => {
    return timerMode === 'countup' ? timeLeft : countdownInitialSeconds - timeLeft;
  };

  const addElapsedToTotal = () => {
    const elapsed = getCurrentElapsed();
    if (elapsed > 0) setTotalElapsedSeconds(prev => prev + elapsed);
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'countdown' ? countdownInitialSeconds : 0);
  };

  const saveWorkout = () => {
    if (workoutList.length === 0) {
      alert('種目が記録されていません');
      return;
    }
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ja-JP'),
      duration: formatTime(totalElapsedSeconds),
      exercises: workoutList,
      note: diary,
    };
    const updated = [...savedWorkouts, newRecord];
    setSavedWorkouts(updated);
    localStorage.setItem('ironNoteWorkouts', JSON.stringify(updated));
    setWorkoutList([]);
    setDiary("");
    setTimeLeft(0);
    setIsTimerRunning(false);
    setTotalElapsedSeconds(0);
    alert('保存しました！');
  };

  const deleteWorkout = (id) => {
    const updated = savedWorkouts.filter(w => w.id !== id);
    setSavedWorkouts(updated);
    localStorage.setItem('ironNoteWorkouts', JSON.stringify(updated));
  };

  // スタイル
  const mainNavStyle = { display: 'flex', marginBottom: '12px', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
  const mainNavBtnStyle = (isActive) => ({ flex: 1, padding: '15px', border: 'none', background: isActive ? '#007bff' : '#fff', color: isActive ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' });
  const subNavStyle = { display: 'flex', marginBottom: '20px', background: '#e8f4ff', borderRadius: '8px', overflow: 'hidden' };
  const subNavBtnStyle = (isActive) => ({ flex: 1, padding: '10px', border: 'none', background: isActive ? '#0056cc' : 'transparent', color: isActive ? '#fff' : '#007bff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' });
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff', fontSize: '24px' }}>IRON NOTE 🦾</h1>

      {/* トップナビ */}
      <nav style={mainNavStyle}>
        <button onClick={() => setActiveMainTab('calendar')} style={mainNavBtnStyle(activeMainTab === 'calendar')}>📅 カレンダー</button>
        <button onClick={() => setActiveMainTab('workout')} style={mainNavBtnStyle(activeMainTab === 'workout')}>🏋️ ワークアウト</button>
      </nav>

      {/* カレンダー画面 */}
      {activeMainTab === 'calendar' && (
        <CalendarTab savedWorkouts={savedWorkouts} onDeleteWorkout={deleteWorkout} />
      )}

      {/* ワークアウト画面（サブタブあり） */}
      {activeMainTab === 'workout' && (
        <div>
          <nav style={subNavStyle}>
            <button onClick={() => setActiveSubTab('record')} style={subNavBtnStyle(activeSubTab === 'record')}>記録</button>
            <button onClick={() => setActiveSubTab('timer')} style={subNavBtnStyle(activeSubTab === 'timer')}>タイマー</button>
          </nav>

          {/* 記録サブタブ */}
          {activeSubTab === 'record' && (
            <div>
              <section style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>🏋️ 種目選択</h3>
                <select value={selectedMenu} onChange={handleMenuChange} style={{ width: '100%', padding: '10px', marginBottom: '16px' }}>
                  {menus.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>

                {/* 重量 */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>重量</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <button onClick={() => setWeight(w => w - 2.5)} style={{ ...btnStyle, padding: '8px 16px' }}>-</button>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', minWidth: '72px', textAlign: 'center' }}>{weight}kg</span>
                    <button onClick={() => setWeight(w => w + 2.5)} style={{ ...btnStyle, padding: '8px 16px' }}>+</button>
                  </div>
                </div>

                {/* 回数・セット数 */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>回数</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button onClick={() => setReps(r => Math.max(1, r - 1))} style={{ ...btnStyle, padding: '6px 12px' }}>-</button>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', minWidth: '36px', textAlign: 'center' }}>{reps}</span>
                      <button onClick={() => setReps(r => r + 1)} style={{ ...btnStyle, padding: '6px 12px' }}>+</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>セット数</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button onClick={() => setSets(s => Math.max(1, s - 1))} style={{ ...btnStyle, padding: '6px 12px' }}>-</button>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', minWidth: '36px', textAlign: 'center' }}>{sets}</span>
                      <button onClick={() => setSets(s => s + 1)} style={{ ...btnStyle, padding: '6px 12px' }}>+</button>
                    </div>
                  </div>
                </div>

                <button onClick={addToList} style={{ ...btnStyle, width: '100%', background: '#28a745', color: 'white', marginTop: '12px' }}>リストに追加</button>
              </section>

              <section style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0 }}>📝 今日のメニュー (累計: {formatTime(totalElapsedSeconds)})</h3>
                  {workoutList.length > 0 && (
                    <button
                      onClick={() => setIsEditingWorkout(e => !e)}
                      style={{ ...btnStyle, padding: '3px 12px', background: isEditingWorkout ? '#6c757d' : '#ffc107', color: isEditingWorkout ? 'white' : '#333', fontSize: '12px' }}
                    >{isEditingWorkout ? '完了' : '編集'}</button>
                  )}
                </div>
                {workoutList.length === 0
                  ? <p style={{ color: '#999' }}>記録なし</p>
                  : workoutList.map(item => (
                    <div
                      key={item.id}
                      draggable={isEditingWorkout}
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDrop={() => handleDrop(item.id)}
                      onDragEnd={() => setDragOverId(null)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 4px', borderBottom: '1px solid #f0f0f0',
                        background: dragOverId === item.id ? '#e8f4ff' : 'transparent',
                        borderRadius: '6px', transition: 'background 0.15s',
                        cursor: isEditingWorkout ? 'grab' : 'default',
                      }}
                    >
                      {isEditingWorkout && (
                        <span style={{ color: '#bbb', fontSize: '18px', marginRight: '8px', userSelect: 'none' }}>⠿</span>
                      )}
                      <span style={{ flex: 1, fontSize: '14px' }}>
                        {!isEditingWorkout && '✅ '}{item.name}　{item.weight}kg × {item.reps}回 × {item.sets}セット
                      </span>
                      {isEditingWorkout && (
                        <button onClick={() => removeFromList(item.id)} style={{ ...btnStyle, padding: '2px 10px', background: '#ff4d4d', color: 'white', fontSize: '12px' }}>✕</button>
                      )}
                    </div>
                  ))
                }
              </section>

              <section style={cardStyle}>
                {/* ヘッダー：プルダウントグル */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMenuListOpen ? '12px' : 0 }}>
                  <h3 style={{ margin: 0 }}>⚙️ 種目の管理</h3>
                  <button
                    onClick={() => { setIsMenuListOpen(o => !o); if (isMenuListOpen) setIsEditingMenus(false); }}
                    style={{ ...btnStyle, padding: '4px 12px', background: '#eee', color: '#333', fontSize: '13px' }}
                  >{isMenuListOpen ? '▲ 閉じる' : '▼ 開く'}</button>
                </div>

                {isMenuListOpen && (
                  <>
                    {/* 登録済み種目一覧 */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                        <button
                          onClick={() => setIsEditingMenus(e => !e)}
                          style={{ ...btnStyle, padding: '3px 12px', background: isEditingMenus ? '#6c757d' : '#ffc107', color: isEditingMenus ? 'white' : '#333', fontSize: '12px' }}
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
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 4px', borderBottom: '1px solid #f0f0f0',
                            background: menuDragOverName === m.name ? '#e8f4ff' : 'transparent',
                            borderRadius: '6px', transition: 'background 0.15s',
                            cursor: isEditingMenus ? 'grab' : 'default',
                          }}
                        >
                          {isEditingMenus && (
                            <span style={{ color: '#bbb', fontSize: '18px', marginRight: '8px', userSelect: 'none' }}>⠿</span>
                          )}
                          <span style={{ flex: 1, fontSize: '14px' }}>{m.name}　<span style={{ color: '#888' }}>{m.defaultWeight}kg</span></span>
                          {isEditingMenus && (
                            <button onClick={() => deleteMenu(m.name)} style={{ ...btnStyle, padding: '2px 10px', background: '#ff4d4d', color: 'white', fontSize: '12px' }}>削除</button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 新規登録フォーム */}
                    <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: '13px', color: '#555' }}>＋ 新しい種目を追加</p>
                    <input
                      type="text"
                      placeholder="種目名"
                      value={newMenuName}
                      onChange={(e) => setNewMenuName(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#555' }}>デフォルト重量:</span>
                      <input
                        type="number"
                        value={newMenuWeight}
                        onChange={(e) => setNewMenuWeight(Number(e.target.value))}
                        style={{ width: '70px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                      <span style={{ fontSize: '14px', color: '#555' }}>kg</span>
                      <button onClick={addMenu} style={{ ...btnStyle, background: '#007bff', color: 'white', padding: '8px 16px', marginLeft: 'auto' }}>登録</button>
                    </div>
                  </>
                )}
              </section>

              <section style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>🏁 ワークアウト完了</h3>
                <textarea
                  placeholder="今日のパンプ感や所感を入力..."
                  value={diary}
                  onChange={(e) => setDiary(e.target.value)}
                  style={{ width: '100%', height: '80px', borderRadius: '10px', padding: '10px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '10px' }}
                />
                <button onClick={saveWorkout} style={{ ...btnStyle, width: '100%', background: '#007bff', color: 'white', padding: '15px' }}>
                  すべて保存して終了
                </button>
              </section>
            </div>
          )}

          {/* タイマーサブタブ */}
          {activeSubTab === 'timer' && (
            <div style={{ textAlign: 'center' }}>
              <section style={cardStyle}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                  <button onClick={() => switchMode('countup')} style={{ ...btnStyle, flex: 1, background: timerMode === 'countup' ? '#333' : '#eee', color: timerMode === 'countup' ? '#fff' : '#333' }}>ストップウォッチ</button>
                  <button onClick={() => switchMode('countdown')} style={{ ...btnStyle, flex: 1, background: timerMode === 'countdown' ? '#333' : '#eee', color: timerMode === 'countdown' ? '#fff' : '#333' }}>カウントダウン</button>
                </div>
                <h2 style={{ fontSize: '64px', margin: '20px 0', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button onClick={() => setIsTimerRunning(r => !r)} style={{ ...btnStyle, background: isTimerRunning ? '#ffc107' : '#28a745', color: 'white', minWidth: '100px' }}>
                    {isTimerRunning ? 'PAUSE' : 'START'}
                  </button>
                  <button onClick={() => { setIsTimerRunning(false); setTimeLeft(timerMode === 'countdown' ? countdownInitialSeconds : 0); }} style={{ ...btnStyle, background: '#6c757d', color: 'white' }}>RESET</button>
                </div>
                <div style={{ marginTop: '15px' }}>
                  <button
                    onClick={addElapsedToTotal}
                    disabled={getCurrentElapsed() === 0}
                    style={{ ...btnStyle, background: getCurrentElapsed() > 0 ? '#007bff' : '#ccc', color: 'white', width: '100%' }}
                  >
                    + 記録に追加
                  </button>
                </div>
              </section>

              {timerMode === 'countdown' && (
                <section style={cardStyle}>
                  <h3 style={{ marginTop: 0 }}>⏲ 時間セット</h3>
                  <input
                    type="number"
                    value={inputMinutes}
                    onChange={(e) => setInputMinutes(e.target.value)}
                    style={{ width: '60px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginRight: '5px' }}
                  /> 分
                  <button onClick={() => { const secs = inputMinutes * 60; setCountdownInitialSeconds(secs); setTimeLeft(secs); setIsTimerRunning(false); }} style={{ ...btnStyle, background: '#6c757d', color: 'white', marginLeft: '10px' }}>セット</button>
                  <button onClick={() => setIsTimerRunning(true)} disabled={countdownInitialSeconds === 0} style={{ ...btnStyle, background: countdownInitialSeconds > 0 ? '#28a745' : '#ccc', color: 'white', marginLeft: '5px' }}>開始</button>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App
