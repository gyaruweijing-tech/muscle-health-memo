import { useState, useEffect } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('workout');

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

  // --- ⏱ タイマー用のState ---
  const [timerMode, setTimerMode] = useState('countup'); 
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(3);

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
    setWorkoutList([...workoutList, { id: Date.now(), name: selectedMenu, weight }]);
  };

  // --- 🆕 モード切り替えを安全に行う関数 ---
  const switchMode = (mode) => {
    setIsTimerRunning(false); // 一旦止める
    setTimerMode(mode);
    setTimeLeft(0); // 時間をリセット
  };

  // --- 🆕 全データをまとめて保存する関数 ---
  const saveWorkout = () => {
    const finalTime = formatTime(timeLeft);
    const summary = `【${new Date().toLocaleDateString()} の記録】\n時間: ${finalTime}\n種目: ${workoutList.map(w => w.name).join(', ')}\n所感: ${diary}`;
    
    console.log("保存するデータ:", {
      date: new Date().toLocaleDateString(),
      duration: finalTime,
      exercises: workoutList,
      note: diary
    });

    alert(`${summary}\n\n上記の内容で保存しました！`);
    
    // 保存後にリセット
    setWorkoutList([]);
    setDiary("");
    setTimeLeft(0);
    setIsTimerRunning(false);
  };

  // スタイル
  const navStyle = { display: 'flex', marginBottom: '20px', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
  const navBtnStyle = (isActive) => ({ flex: 1, padding: '15px', border: 'none', background: isActive ? '#007bff' : '#fff', color: isActive ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' });
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff', fontSize: '24px' }}>IRON NOTE 🦾</h1>

      <nav style={navStyle}>
        <button onClick={() => setActiveTab('workout')} style={navBtnStyle(activeTab === 'workout')}>記録</button>
        <button onClick={() => setActiveTab('timer')} style={navBtnStyle(activeTab === 'timer')}>タイマー</button>
      </nav>

      {/* 🌟 ワークアウト・記録画面 */}
      {activeTab === 'workout' && (
        <div>
          <section style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>🏋️ 種目選択</h3>
            <select value={selectedMenu} onChange={handleMenuChange} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
              {menus.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
            <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', margin: '10px' }}>{weight} kg</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setWeight(weight - 2.5)} style={btnStyle}>-</button>
              <button onClick={() => setWeight(weight + 2.5)} style={btnStyle}>+</button>
            </div>
            <button onClick={addToList} style={{ ...btnStyle, width: '100%', background: '#28a745', color: 'white', marginTop: '15px' }}>リストに追加</button>
          </section>

          <section style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>📝 今日のメニュー (時間: {formatTime(timeLeft)})</h3>
            {workoutList.length === 0 ? <p style={{color: '#999'}}>記録なし</p> : workoutList.map(item => <div key={item.id}>✅ {item.name} : {item.weight}kg</div>)}
          </section>

          {/* 🆕 記録タブにのみ表示される「まとめ」エリア */}
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

      {/* 🌟 タイマー画面 */}
      {activeTab === 'timer' && (
        <div style={{ textAlign: 'center' }}>
          <section style={cardStyle}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <button onClick={() => switchMode('countup')} style={{ ...btnStyle, flex: 1, background: timerMode === 'countup' ? '#333' : '#eee', color: timerMode === 'countup' ? '#fff' : '#333' }}>ストップウォッチ</button>
              <button onClick={() => switchMode('countdown')} style={{ ...btnStyle, flex: 1, background: timerMode === 'countdown' ? '#333' : '#eee', color: timerMode === 'countdown' ? '#fff' : '#333' }}>カウントダウン</button>
            </div>

            <h2 style={{ fontSize: '64px', margin: '20px 0', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ ...btnStyle, background: isTimerRunning ? '#ffc107' : '#28a745', color: 'white', minWidth: '100px' }}>
                {isTimerRunning ? 'PAUSE' : 'START'}
              </button>
              <button onClick={() => { setIsTimerRunning(false); setTimeLeft(0); }} style={{ ...btnStyle, background: '#6c757d', color: 'white' }}>RESET</button>
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
              <button onClick={() => { setTimeLeft(inputMinutes * 60); setIsTimerRunning(true); }} style={{ ...btnStyle, background: '#007bff', color: 'white', marginLeft: '10px' }}>セット＆開始</button>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default App