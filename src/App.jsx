import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  Check,
  Users,
  Beer,
  Utensils,
  Download,
  PartyPopper,
  Flame,
  MessageCircle,
  Camera,
  Image as ImageIcon,
  Copy,
  ShoppingCart,
  ArrowLeft,
  Calendar
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
// 使用環境變數，加上 trim() 去除可能的換行符號
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim()
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = (import.meta.env.VITE_APP_ID || 'party-rsvp-app').trim();

// --- Constants & Data ---
const USERS_LIST = [
  "又尹", "庭妤", "17", "尚芊", "宗翰",
  "阿敦", "佑儒", "懷文", "璿騰", "勃諄"
];

const generateDateRange = () => {
  const dates = [];
  const start = new Date(2026, 1, 1);
  const end = new Date(2026, 2, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
};

const ALL_DATES = generateDateRange();

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDayName = (date) => {
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return days[date.getDay()];
};

// --- Manga Style Components ---
const SpeedLines = () => (
  <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden"
       style={{
         background: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #000 10deg, #000 11deg)'
       }}>
  </div>
);

const MangaPhotoPanel = () => {
  const defaultSrc = "/hero.jpg";
  const [photoSrc, setPhotoSrc] = useState(defaultSrc);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoSrc(url);
      setHasError(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-8 p-2 bg-white border-4 border-black transform -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group">
      {/* Title Tag */}
      <div className="absolute -top-4 -left-4 bg-red-600 text-white font-black text-xl px-4 py-1 border-2 border-black transform -rotate-2 z-20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        入厝大作戰！
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photo Container */}
      <div className="relative overflow-hidden h-64 bg-gray-200 border-2 border-black">
        <div className="w-full h-full relative">
            {!hasError ? (
              <img
                src={photoSrc}
                alt="Manga Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => setHasError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-4 text-center">
                <ImageIcon size={48} className="mb-2 opacity-50"/>
                <span className="text-sm font-bold">雲端照片讀取失敗</span>
                <span className="text-xs">可能是權限未公開</span>
              </div>
            )}

            {/* Halftone Effect Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000_120%)] opacity-30 mix-blend-multiply pointer-events-none"></div>
        </div>

        {/* Speed Lines Overlay */}
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_160deg,white_180deg,transparent_200deg,transparent_360deg)] opacity-20 mix-blend-overlay pointer-events-none"></div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="absolute top-2 right-2 bg-white border-2 border-black p-2 rounded-full shadow-md z-30 hover:bg-yellow-300 transition-colors"
          title="換一張照片"
        >
          <Camera size={20} className="text-black" />
        </button>

        {/* Manga Speech Bubble */}
        <div className="absolute bottom-4 right-4 bg-white border-4 border-black rounded-[50%_50%_50%_50%_/_40%_40%_40%_40%] px-6 py-4 z-10 shadow-lg animate-pulse">
           <p className="font-black text-xl text-black leading-tight text-center">
             快來<br/>填時間！
           </p>
           {/* Bubble Tail */}
           <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white border-b-4 border-r-4 border-black transform rotate-45"></div>
           <div className="absolute bottom-1 right-9 w-4 h-4 bg-white transform rotate-45 z-20"></div>
        </div>

        {/* Sound Effect Text (SFX) */}
        <div className="absolute top-2 left-2 text-4xl font-black text-yellow-400 stroke-black text-stroke-2 italic transform -rotate-12 z-20 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{WebkitTextStroke: '1px black'}}>
          YA!!
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const [rsvpData, setRsvpData] = useState({});
  const [myDates, setMyDates] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login');
  const [foodData, setFoodData] = useState({});
  const [copied, setCopied] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: '',
    website: '',
  });
  const [feedbackState, setFeedbackState] = useState({ type: 'idle', message: '' });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth failed", error);
        alert("登入失敗，請檢查網路連線後重新整理頁面");
        setLoading(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setLoading(false); // 登入成功才結束 loading
      }
    });

    // 超時處理：10秒後強制顯示畫面（延長等待時間）
    const timeout = setTimeout(() => {
      if (!user) {
        console.error("Auth timeout - user still null after 10 seconds");
      }
      setLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Data Sync - RSVP
  useEffect(() => {
    if (!user) return;
    const rsvpRef = collection(db, 'artifacts', appId, 'public', 'data', 'party_rsvp_115');
    const unsubscribe = onSnapshot(rsvpRef,
      (snapshot) => {
        const data = {};
        snapshot.docs.forEach(doc => {
          data[doc.id] = doc.data();
        });
        setRsvpData(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Data Sync - Food Items
  useEffect(() => {
    if (!user) return;
    const foodRef = collection(db, 'artifacts', appId, 'public', 'data', 'party_food_items');
    const unsubscribe = onSnapshot(foodRef,
      (snapshot) => {
        const data = {};
        snapshot.docs.forEach(doc => {
          data[doc.id] = doc.data();
        });
        setFoodData(data);
      },
      (error) => {
        console.error("Error fetching food data:", error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedName && rsvpData[selectedName]?.dates) {
      setMyDates(new Set(rsvpData[selectedName].dates));
    }
  }, [selectedName, rsvpData]);

  const toggleDate = (dateStr) => {
    const newDates = new Set(myDates);
    if (newDates.has(dateStr)) {
      newDates.delete(dateStr);
    } else {
      newDates.add(dateStr);
    }
    setMyDates(newDates);
  };

  const saveAvailability = async () => {
    if (!user) {
      alert("尚未登入，請重新整理頁面後再試");
      console.error("Save failed: user is null");
      return;
    }
    if (!selectedName) {
      alert("請先選擇您的名字");
      return;
    }
    if (myDates.size === 0) {
      alert("請至少選擇一個日期");
      return;
    }
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'party_rsvp_115', selectedName);
    try {
      await setDoc(userDocRef, {
        name: selectedName,
        dates: Array.from(myDates),
        updatedAt: serverTimestamp(),
        uid: user.uid
      }, { merge: true });
      alert(`${selectedName} 的時間已儲存！`);
    } catch (e) {
      console.error("Save failed", e);
      alert("儲存失敗：" + e.message);
    }
  };

  const stats = useMemo(() => {
    const dateCounts = {};
    const dateAttendees = {};
    ALL_DATES.forEach(d => {
      const dStr = formatDate(d);
      dateCounts[dStr] = 0;
      dateAttendees[dStr] = [];
    });
    Object.values(rsvpData).forEach(person => {
      if (person.dates && Array.isArray(person.dates)) {
        person.dates.forEach(dStr => {
          if (dateCounts[dStr] !== undefined) {
            dateCounts[dStr]++;
            dateAttendees[dStr].push(person.name);
          }
        });
      }
    });
    const sortedDates = Object.entries(dateCounts)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 0);
    return { dateCounts, dateAttendees, sortedDates };
  }, [rsvpData]);

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "日期,星期,人數,名單\n";
    stats.sortedDates.forEach(([dateStr, count]) => {
      const dateObj = new Date(dateStr);
      const dayName = getDayName(dateObj);
      const names = stats.dateAttendees[dateStr].join(", ");
      csvContent += `${dateStr},${dayName},${count},"${names}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "入厝趴_統計表.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Food item functions
  const saveFoodItem = async (slotId, name, item) => {
    if (!user) return;
    const foodDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'party_food_items', `slot_${slotId}`);
    try {
      await setDoc(foodDocRef, {
        slotId,
        name: name.trim(),
        item: item.trim(),
        updatedAt: serverTimestamp(),
        uid: user.uid
      }, { merge: true });
    } catch (e) {
      console.error("Save food item failed", e);
    }
  };

  const copyFoodList = () => {
    const slots = Array.from({ length: 10 }, (_, i) => {
      const slotData = foodData[`slot_${i + 1}`];
      return {
        id: i + 1,
        name: slotData?.name || '',
        item: slotData?.item || ''
      };
    });
    const filled = slots.filter(s => s.name.trim() || s.item.trim());
    let text = '💥 入厝大作戰 認領清單 💥\n\n';
    if (filled.length === 0) {
      text += '還沒有人報名喔！快來卡位！';
    } else {
      text += filled.map(s => `[${s.id}] ${s.name || '神秘人'} 👉 帶：${s.item || '驚喜'}`).join('\n');
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('複製失敗', err);
    });
  };

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
    if (feedbackState.type !== 'idle') {
      setFeedbackState({ type: 'idle', message: '' });
    }
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    if (isSendingFeedback) return;

    const name = feedbackForm.name.trim();
    const email = feedbackForm.email.trim();
    const message = feedbackForm.message.trim();

    if (!name || !email || !message) {
      setFeedbackState({ type: 'error', message: '請完整填寫姓名、Email 與回饋內容。' });
      return;
    }

    if (name.length > 80) {
      setFeedbackState({ type: 'error', message: '姓名不可超過 80 字。' });
      return;
    }

    if (email.length > 120) {
      setFeedbackState({ type: 'error', message: 'Email 不可超過 120 字。' });
      return;
    }

    if (message.length > 2000) {
      setFeedbackState({ type: 'error', message: '回饋內容不可超過 2000 字。' });
      return;
    }

    setIsSendingFeedback(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          website: feedbackForm.website,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '送出失敗，請稍後再試。');
      }

      setFeedbackState({ type: 'success', message: '收到你的回饋了，謝謝！' });
      setFeedbackForm({
        name: '',
        email: '',
        message: '',
        website: '',
      });
    } catch (error) {
      setFeedbackState({ type: 'error', message: error.message || '送出失敗，請稍後再試。' });
    } finally {
      setIsSendingFeedback(false);
    }
  };

  // --- Views ---
  const LoginView = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 relative z-10">
      <MangaPhotoPanel />
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-4 border-orange-500 relative z-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">你是哪一位？</h2>
        <div className="grid grid-cols-2 gap-3">
          {USERS_LIST.map(name => {
            const isTaken = !!rsvpData[name];
            return (
              <button
                key={name}
                onClick={() => {
                  setSelectedName(name);
                  setView('calendar');
                }}
                className={`p-3 rounded-lg text-lg font-medium transition-all ${
                  isTaken
                    ? 'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {name}
                  {isTaken && <Check size={16} className="text-green-500" />}
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-center text-gray-400">
          已有 {Object.keys(rsvpData).length} 人填寫過時間
        </p>

        {/* 食物認領入口 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setView('food')}
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all border-2 border-black"
          >
            <ShoppingCart size={24} />
            我要認領食物/東西
          </button>
        </div>
      </div>
    </div>
  );

  const CalendarView = () => (
    <div className="max-w-4xl mx-auto pb-20 relative z-10">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-black">
        <div className="bg-orange-600 p-4 text-white flex justify-between items-center sticky top-0 z-10 border-b-4 border-black">
          <div>
            <span className="text-xs opacity-80 block">目前身分</span>
            <span className="font-bold text-xl">{selectedName}</span>
          </div>
          <div className="flex gap-2">
             <button
              onClick={() => setView('stats')}
              className="bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded text-sm flex items-center gap-1 backdrop-blur-sm border border-white/20"
            >
              <Users size={16} /> 查看統計
            </button>
            <button
              type="button"
              onClick={saveAvailability}
              className="bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300 font-bold px-4 py-1.5 rounded text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
              儲存我的時間
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-4 text-black text-sm bg-white p-3 rounded border-2 border-black shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] flex items-center gap-2">
            <MessageCircle size={20} className="text-orange-600"/>
            <span>請點選你可以參加的日期（綠色代表已選取）。記得按下右上角的「儲存」喔！</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-center font-black text-xl text-gray-800 mb-3 bg-gray-100 py-2 rounded border border-gray-300">2月 February</h3>
              <div className="grid grid-cols-7 gap-1 text-center mb-1 font-bold">
                {['日','一','二','三','四','五','六'].map(d => (
                  <div key={d} className="text-xs text-gray-500">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {ALL_DATES.filter(d => d.getMonth() === 1).map(date => {
                  const dStr = formatDate(date);
                  const isSelected = myDates.has(dStr);
                  const dayName = getDayName(date);
                  const isWeekend = dayName === '週六' || dayName === '週日';

                  return (
                    <button
                      key={dStr}
                      onClick={() => toggleDate(dStr)}
                      className={`
                        aspect-square rounded flex flex-col items-center justify-center text-sm relative transition-all border-b-2
                        ${isSelected
                          ? 'bg-green-500 text-white border-green-700 shadow-sm transform scale-105'
                          : isWeekend ? 'bg-orange-50 text-gray-800 border-orange-200 hover:bg-orange-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="font-bold">{date.getDate()}</span>
                      {stats.dateCounts[dStr] > 0 && !isSelected && (
                        <span className="absolute bottom-1 right-1 text-[10px] bg-white border border-gray-300 text-gray-800 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {stats.dateCounts[dStr]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-center font-black text-xl text-gray-800 mb-3 bg-gray-100 py-2 rounded border border-gray-300">3月 March</h3>
              <div className="grid grid-cols-7 gap-1 text-center mb-1 font-bold">
                {['日','一','二','三','四','五','六'].map(d => (
                  <div key={d} className="text-xs text-gray-500">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {ALL_DATES.filter(d => d.getMonth() === 2).map(date => {
                  const dStr = formatDate(date);
                  const isSelected = myDates.has(dStr);
                  const dayName = getDayName(date);
                  const isWeekend = dayName === '週六' || dayName === '週日';

                  return (
                    <button
                      key={dStr}
                      onClick={() => toggleDate(dStr)}
                      className={`
                        aspect-square rounded flex flex-col items-center justify-center text-sm relative transition-all border-b-2
                        ${isSelected
                          ? 'bg-green-500 text-white border-green-700 shadow-sm transform scale-105'
                          : isWeekend ? 'bg-orange-50 text-gray-800 border-orange-200 hover:bg-orange-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="font-bold">{date.getDate()}</span>
                      {stats.dateCounts[dStr] > 0 && !isSelected && (
                        <span className="absolute bottom-1 right-1 text-[10px] bg-white border border-gray-300 text-gray-800 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {stats.dateCounts[dStr]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsView = () => (
    <div className="max-w-2xl mx-auto relative z-10">
      <div className="bg-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] border-2 border-black p-6">
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Flame className="text-red-500" />
            人氣日期排行榜
          </h2>
          <button
            onClick={() => setView('calendar')}
            className="text-gray-500 hover:text-gray-800 font-bold underline"
          >
            返回填寫
          </button>
        </div>

        {stats.sortedDates.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            還沒有人填寫時間喔！
          </div>
        ) : (
          <div className="space-y-4">
            {stats.sortedDates.slice(0, 10).map(([dateStr, count], index) => {
              const dateObj = new Date(dateStr);
              return (
                <div key={dateStr} className="flex items-center p-3 rounded-lg border-2 border-gray-200 bg-white shadow-sm">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-4 border-2 border-black
                    ${index === 0 ? 'bg-yellow-400 text-black' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-700' : 'bg-blue-100 text-blue-600'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      {dateObj.getMonth() + 1}/{dateObj.getDate()}
                      <span className="text-sm font-normal text-gray-500 ml-2">({getDayName(dateObj)})</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stats.dateAttendees[dateStr].join('、')}
                    </div>
                  </div>
                  <div className="text-right pl-4">
                    <span className="block text-2xl font-black text-green-600">{count}</span>
                    <span className="text-xs text-gray-400">人有空</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-4 border-t-2 border-gray-100 flex justify-center">
           <button
             onClick={downloadCSV}
             className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg border-2 border-transparent hover:border-black"
           >
             <Download size={18} />
             匯出 Excel/CSV
           </button>
        </div>
      </div>
    </div>
  );

  const FoodSlotInput = ({ slotId }) => {
    const slotData = foodData[`slot_${slotId}`] || { name: '', item: '' };
    const [localName, setLocalName] = useState(slotData.name);
    const [localItem, setLocalItem] = useState(slotData.item);
    const nameRef = useRef(null);
    const itemRef = useRef(null);

    useEffect(() => {
      setLocalName(slotData.name || '');
      setLocalItem(slotData.item || '');
    }, [slotData.name, slotData.item]);

    const handleBlur = () => {
      if (localName !== slotData.name || localItem !== slotData.item) {
        saveFoodItem(slotId, localName, localItem);
      }
    };

    return (
      <div className="flex gap-2">
        <div className="w-10 flex-shrink-0 flex items-center justify-center font-black text-lg border-[3px] border-black bg-[#ffea00] rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          {slotId}
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <input
            ref={nameRef}
            type="text"
            value={localName}
            onChange={e => setLocalName(e.target.value)}
            onBlur={handleBlur}
            placeholder="稱呼"
            className="w-full sm:w-1/3 border-[3px] border-black rounded-xl px-3 py-2 font-bold focus:outline-none focus:bg-orange-50 focus:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all placeholder:font-normal placeholder:text-neutral-400"
          />
          <input
            ref={itemRef}
            type="text"
            value={localItem}
            onChange={e => setLocalItem(e.target.value)}
            onBlur={handleBlur}
            placeholder="要帶什麼東西？"
            className="w-full sm:w-2/3 border-[3px] border-black rounded-xl px-3 py-2 font-bold focus:outline-none focus:bg-orange-50 focus:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all placeholder:font-normal placeholder:text-neutral-400"
          />
        </div>
      </div>
    );
  };

  const FoodView = () => (
    <div className="max-w-md mx-auto relative z-10">
      {/* 返回按鈕 */}
      <button
        onClick={() => setView('login')}
        className="mb-4 flex items-center gap-1.5 bg-white border-[3px] border-black rounded-xl px-3 py-2 font-black text-sm shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
      >
        <ArrowLeft size={16} strokeWidth={3} />
        返回首頁
      </button>

      {/* 表單卡片 */}
      <div className="bg-white border-4 border-black rounded-3xl pt-2 pb-6 px-4 sm:px-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="w-24 h-2 bg-[#ff8a00] mx-auto rounded-full mb-6 mt-2"></div>
        <h2 className="text-2xl font-black text-center mb-2 tracking-wide text-black flex items-center justify-center gap-2">
          <ShoppingCart size={28} />
          認領清單
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">填完自動儲存，大家都看得到喔！</p>

        <div className="space-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <FoodSlotInput key={i + 1} slotId={i + 1} />
          ))}
        </div>

        {/* 複製按鈕 */}
        <div className="mt-8 pt-6 border-t-[3px] border-black border-dashed flex justify-center">
          <button
            onClick={copyFoodList}
            className={`flex items-center gap-2 px-6 py-3 border-[3px] border-black font-black text-lg rounded-xl transition-all transform active:translate-y-1 active:translate-x-1 active:shadow-none ${
              copied
                ? 'bg-green-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
                : 'bg-[#ffea00] hover:bg-[#ffe100] shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
            }`}
          >
            {copied ? <Check size={24} strokeWidth={3} /> : <Copy size={24} strokeWidth={3} />}
            {copied ? '已複製清單！' : '複製認領清單'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50 font-sans text-gray-800 overflow-x-hidden">
      <SpeedLines />
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 shadow-md relative z-10 border-b-4 border-black">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2 flex-wrap drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            <PartyPopper className="animate-bounce" />
            「4男4女4樓之2加2」入厝趴
          </h1>
          <div className="flex flex-wrap gap-2 text-sm font-bold opacity-100">
            <span className="bg-black/20 px-2 py-1 rounded flex items-center gap-1 border border-white/30">
              <Utensils size={14} /> 正宗北平烤鴨
            </span>
            <span className="bg-black/20 px-2 py-1 rounded flex items-center gap-1 border border-white/30">
              <Utensils size={14} /> 好市多蝦沙拉
            </span>
            <span className="bg-black/20 px-2 py-1 rounded flex items-center gap-1 border border-white/30">
              <Beer size={14} /> 啤酒供應
            </span>
            <span className="bg-black/20 px-2 py-1 rounded flex items-center gap-1 border border-white/30">
              外送飲料
            </span>
          </div>
        </div>
      </header>

      <main className="p-4 relative">
        {loading ? (
          <div className="text-center py-20 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto"></div>
            <p className="mt-4 text-black font-bold">正在準備好酒好菜...</p>
          </div>
        ) : (
          <>
            {view === 'login' && <LoginView />}
            {view === 'calendar' && <CalendarView />}
            {view === 'stats' && <StatsView />}
            {view === 'food' && <FoodView />}
          </>
        )}
      </main>

      {view === 'login' && !loading && (
        <section className="max-w-2xl mx-auto px-4 pb-8 relative z-10">
          <div className="bg-white rounded-2xl border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <MessageCircle size={20} />
              給站長的意見回饋
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              你的回饋會寄送到 jeff110@cht.com.tw
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <input
                type="text"
                name="website"
                value={feedbackForm.website}
                onChange={handleFeedbackChange}
                tabIndex="-1"
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="name"
                  value={feedbackForm.name}
                  onChange={handleFeedbackChange}
                  placeholder="姓名"
                  maxLength={80}
                  required
                  className="w-full border-[3px] border-black rounded-xl px-3 py-2 font-bold focus:outline-none focus:bg-orange-50"
                />
                <input
                  type="email"
                  name="email"
                  value={feedbackForm.email}
                  onChange={handleFeedbackChange}
                  placeholder="Email"
                  maxLength={120}
                  required
                  className="w-full border-[3px] border-black rounded-xl px-3 py-2 font-bold focus:outline-none focus:bg-orange-50"
                />
              </div>
              <textarea
                name="message"
                value={feedbackForm.message}
                onChange={handleFeedbackChange}
                rows={4}
                maxLength={2000}
                required
                placeholder="想反應的問題、建議、需求..."
                className="w-full border-[3px] border-black rounded-xl px-3 py-2 font-bold focus:outline-none focus:bg-orange-50 resize-y"
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p
                  className={`text-sm ${
                    feedbackState.type === 'error'
                      ? 'text-red-600'
                      : feedbackState.type === 'success'
                        ? 'text-green-700'
                        : 'text-gray-500'
                  }`}
                  aria-live="polite"
                >
                  {feedbackState.message || '我們會盡快查看你的訊息。'}
                </p>
                <button
                  type="submit"
                  disabled={isSendingFeedback}
                  className="px-5 py-2.5 bg-[#ffea00] border-[3px] border-black rounded-xl font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-[#ffe100] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSendingFeedback ? '送出中...' : '送出回饋'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      <footer className="text-center text-gray-400 text-xs py-8 relative z-10">
        115.2.1 ～ 115.3.31 時間確認表單 <br/>
        Made for the Housewarming Party
      </footer>
    </div>
  );
}
