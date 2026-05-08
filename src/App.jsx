import { useState, useEffect } from 'react'

function App() {
  // --- 🌟 ページ管理用のState ---
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' or 'timer'

  // --- 🏋️ ワークアウト用のState（前回の内容） ---
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
  const [timerMode, setTimerMode] = useState('countup'); // 'countup' or 'countdown'
  const [timeLeft, setTimeLeft] = useState(0); // 秒単位
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(3); // カウントダウン初期値（分）

  // タイマーの心臓部
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

  // --- 関数群 ---
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

  const startCountdown = () => {
    setTimeLeft(inputMinutes * 60);
    setTimerMode('countdown');
    setIsTimerRunning(true);
  };

  // スタイル設定
  const navStyle = { display: 'flex', marginBottom: '20px', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
  const navBtnStyle = (isActive) => ({
    flex: 1, padding: '15px', border: 'none', background: isActive ? '#007bff' : '#fff',
    color: isActive ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer'
  });
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff', fontSize: '24px' }}>IRON NOTE 🦾</h1>

      {/* 🌟 タブナビゲーション */}
      <nav style={navStyle}>
        <button onClick={() => setActiveTab('workout')} style={navBtnStyle(activeTab === 'workout')}>記録</button>
        <button onClick={() => setActiveTab('timer')} style={navBtnStyle(activeTab === 'timer')}>タイマー</button>
      </nav>

      {/* 🌟 ワークアウト画面 */}
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
            <h3 style={{ marginTop: 0 }}>📝 今日のメニュー</h3>
            {workoutList.map(item => <div key={item.id}>✅ {item.name} : {item.weight}kg</div>)}
          </section>
        </div>
      )}

      {/* 🌟 タイマー画面 */}
      {activeTab === 'timer' && (
        <div style={{ textAlign: 'center' }}>
          <section style={cardStyle}>
            <h2 style={{ fontSize: '48px', margin: '20px 0' }}>{formatTime(timeLeft)}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ ...btnStyle, background: isTimerRunning ? '#ffc107' : '#28a745', color: 'white' }}>
                {isTimerRunning ? 'PAUSE' : 'START'}
              </button>
              <button onClick={() => { setIsTimerRunning(false); setTimeLeft(0); }} style={{ ...btnStyle, background: '#6c757d', color: 'white' }}>RESET</button>
            </div>
          </section>

          <section style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>⏲ カウントダウン設定</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <input 
                type="number" 
                value={inputMinutes} 
                onChange={(e) => setInputMinutes(e.target.value)} 
                style={{ width: '60px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <span>分測る</span>
              <button onClick={startCountdown} style={{ ...btnStyle, background: '#007bff', color: 'white' }}>セット</button>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>※セットすると自動で開始します</p>
          </section>
        </div>
      )}

      {/* 完了ボタンはどのタブでも見えるように下に配置 */}
      <div style={{ marginTop: '20px' }}>
        <textarea 
          placeholder="今日の所感..." 
          value={diary} 
          onChange={(e) => setDiary(e.target.value)}
          style={{ width: '100%', height: '60px', borderRadius: '10px', padding: '10px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <button style={{ ...btnStyle, width: '100%', background: '#007bff', color: 'white', marginTop: '10px', padding: '15px' }}>ワークアウト完了</button>
      </div>
    </div>
  )
}

export default App