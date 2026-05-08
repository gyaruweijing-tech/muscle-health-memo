import { useState, useEffect } from 'react'

function App() {
  // --- 1. 基本データ管理 ---
  const [menus, setMenus] = useState(['ベンチプレス', 'スクワット', 'デッドリフト']);
  const [selectedMenu, setSelectedMenu] = useState('ベンチプレス');
  const [newMenuName, setNewMenuName] = useState('');

  // --- 2. 「今日のワークアウト」リスト ---
  const [workoutList, setWorkoutList] = useState([]); // [{ name: 'ベンチ', weight: 60 }, ...]
  const [weight, setWeight] = useState(60);
  const [diary, setDiary] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // タイマー処理
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // 種目マスタに追加
  const handleAddMenu = () => {
    if (newMenuName.trim() === "") return;
    setMenus([...menus, newMenuName]);
    setSelectedMenu(newMenuName);
    setNewMenuName('');
  };

  // --- 🆕 今日のリストに種目を追加する関数 ---
  const addExerciseToList = () => {
    const newItem = {
      id: Date.now(), // 削除とかで使うための一意のID
      name: selectedMenu,
      weight: weight
    };
    setWorkoutList([...workoutList, newItem]); // リストにガッチャンコ
  };

  // --- 🆕 最後に全部まとめて保存する関数 ---
  const saveTodayWorkout = () => {
    if (workoutList.length === 0) {
      alert("まだ種目が登録されていません！");
      return;
    }
    const finalData = {
      exercises: workoutList,
      totalTime: formatTime(seconds),
      diary: diary,
      date: new Date().toLocaleDateString()
    };
    console.log("保存データ:", finalData);
    alert(`全 ${workoutList.length} 種目を保存しました！お疲れ様でした！`);
    
    // 保存後にリセット（必要なら）
    setWorkoutList([]);
    setDiary("");
    setSeconds(0);
    setIsActive(false);
  };

  // スタイル設定
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff' }}>WORKOUT NOTE</h1>

      {/* 1. 種目選択と重量のセット */}
      <section style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>🏋️ 種目を記録</h3>
        <select 
          value={selectedMenu} 
          onChange={(e) => setSelectedMenu(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' }}
        >
          {menus.map((menu) => (
            <option key={menu} value={menu}>{menu}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '15px' }}>
          <button onClick={() => setWeight(weight - 2.5)} style={{ ...btnStyle, background: '#eee' }}>-</button>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{weight} kg</span>
          <button onClick={() => setWeight(weight + 2.5)} style={{ ...btnStyle, background: '#eee' }}>+</button>
        </div>

        <button onClick={addExerciseToList} style={{ ...btnStyle, width: '100%', background: '#28a745', color: 'white' }}>
          今のセットをリストに追加
        </button>
      </section>

      {/* 2. 本日のトレーニング内容（リアルタイム表示） */}
      <section style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>📝 本日のメニュー</h3>
        {workoutList.length === 0 ? (
          <p style={{ color: '#999', fontSize: '14px' }}>まだ記録がありません</p>
        ) : (
          <ul style={{ paddingLeft: '20px', fontSize: '15px' }}>
            {workoutList.map((item) => (
              <li key={item.id} style={{ marginBottom: '5px' }}>
                <strong>{item.name}</strong>: {item.weight} kg
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. 総時間と日記（まとめ） */}
      <section style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>🏁 本日のまとめ</h3>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>合計時間: </span>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTime(seconds)}</span>
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => setIsActive(!isActive)} style={{ ...btnStyle, background: '#007bff', color: 'white', fontSize: '12px' }}>
              {isActive ? 'タイマー停止' : 'タイマースタート'}
            </button>
          </div>
        </div>
        
        <textarea 
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
          placeholder="今日の所感・筋肉のパンプ具合など..."
          style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
      </section>

      <button 
        onClick={saveTodayWorkout}
        style={{ ...btnStyle, width: '100%', background: '#007bff', color: 'white', fontSize: '16px', padding: '15px', boxShadow: '0 4px 10px rgba(0,123,255,0.3)' }}
      >
        ワークアウトを完了して保存
      </button>
    </div>
  )
}

export default App