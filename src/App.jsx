import { useState, useEffect } from 'react'

function App() {
  // --- 1. 状態管理（メニュー関連） ---
  const [menus, setMenus] = useState(['ベンチプレス', 'スクワット', 'デッドリフト']); // メニューのリスト
  const [selectedMenu, setSelectedMenu] = useState('ベンチプレス'); // 今選んでいるメニュー
  const [newMenuName, setNewMenuName] = useState(''); // 新しく追加したいメニューの名前

  // --- 既存の状態管理 ---
  const [weight, setWeight] = useState(60);
  const [diary, setDiary] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // タイマーのuseEffect（前回と同じ）
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

  // --- 2. 新しいメニューを追加する関数 ---
  const handleAddMenu = () => {
    if (newMenuName.trim() === "") return; // 空っぽなら何もしない
    setMenus([...menus, newMenuName]); // 今のリストに新しい名前を「ガッチャンコ」する
    setSelectedMenu(newMenuName); // 追加したらそのメニューをすぐ選択状態にする
    setNewMenuName(''); // 入力欄を空にする
  };

  // スタイル設定（前回＋α）
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginRight: '10px', flex: 1 };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff' }}>WORKOUT NOTE</h1>

      {/* --- 🆕 メニュー選択・追加セクション --- */}
      <section style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>📋 種目を選ぶ</h3>
        <select 
          value={selectedMenu} 
          onChange={(e) => setSelectedMenu(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #007bff', fontSize: '16px', marginBottom: '15px' }}
        >
          {menus.map((menu) => (
            <option key={menu} value={menu}>{menu}</option>
          ))}
        </select>

        <div style={{ display: 'flex' }}>
          <input 
            type="text" 
            placeholder="新種目（例：懸垂）" 
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleAddMenu} style={{ ...btnStyle, background: '#28a745', color: 'white' }}>追加</button>
        </div>
      </section>

      {/* --- 🕒 タイマー（前回と同じなので省略可ですが一応配置） --- */}
      <section style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>⏱ インターバル: {selectedMenu}</h3>
        <div style={{ textAlign: 'center', fontSize: '48px', fontWeight: 'bold', margin: '10px 0' }}>
          {formatTime(seconds)}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => setIsActive(!isActive)} style={{ ...btnStyle, background: isActive ? '#ffc107' : '#007bff', color: 'white' }}>
            {isActive ? '一時停止' : 'スタート'}
          </button>
          <button onClick={() => { setSeconds(0); setIsActive(false); }} style={{ ...btnStyle, background: '#6c757d', color: 'white', marginLeft: '10px' }}>
            リセット
          </button>
        </div>
      </section>

      {/* --- 重量・メモ（タイトルに選択した種目が反映される） --- */}
      <section style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>{selectedMenu} の記録</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <button onClick={() => setWeight(weight - 2.5)} style={{ ...btnStyle, background: '#eee', fontSize: '20px' }}>-</button>
          <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{weight} kg</span>
          <button onClick={() => setWeight(weight + 2.5)} style={{ ...btnStyle, background: '#eee', fontSize: '20px' }}>+</button>
        </div>
      </section>

      <section style={cardStyle}>
        <textarea 
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
          placeholder={`${selectedMenu}の感想を書こう...`}
          style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
      </section>

      <button 
        onClick={() => alert(`${selectedMenu} を ${weight}kg で保存しました！`)}
        style={{ ...btnStyle, width: '100%', background: '#007bff', color: 'white', fontSize: '16px', padding: '15px' }}
      >
        記録を保存する
      </button>
    </div>
  )
}

export default App