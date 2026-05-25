import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, runTransaction } from 'firebase/firestore';

const LESSONS = [
  { id: 'eq', name: 'Équations et inéquations', total: 11, icon: '⚖️' },
  { id: 'vec', name: 'Vecteurs et translation', total: 19, icon: '↗️' },
  { id: 'geo', name: 'Géométrie analytique', total: 12, icon: '📐' },
  { id: 'sys', name: 'Systèmes', total: 13, icon: '🔗' },
  { id: 'fon', name: 'Fonctions', total: 12, icon: '📈' },
  { id: 'sta', name: 'Stats', total: 15, icon: '📊' },
  { id: 'esp', name: 'Espace', total: 12, icon: '🧊' }
];

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const INITIAL_STUDENTS = [
  { id: 1, name: 'Ait El Fatmi Ghali', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 2, name: 'Ouzagmouz Saad', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 3, name: 'Bouchehab Mohamed', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 4, name: 'Ifkirne Hasna', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 5, name: 'Moussaoui Idriss', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 6, name: 'Bourazza Aya', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 7, name: 'Njibi Sara', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 8, name: 'Bouchfira Roumayssae', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 9, name: 'Ait Izzi Yahya', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 10, name: 'Azzab Yahya', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 11, name: 'Benaktibe Elarabi', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 12, name: 'Hassan Hajar', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 13, name: 'Rabihi Aymane', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 14, name: 'Nidali Reda', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 15, name: 'Kaarir Aouyes', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 16, name: 'Kamarat Israae', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 17, name: 'Hamdy Fatima Ezzahra', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 18, name: 'Aidi Yahia', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 19, name: 'Ifkirne Amina', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 20, name: 'Yahya Elhmidi', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 21, name: 'Ait El Kayass Amira', group: 'A', trend: 0, recentProgress: 0, progress: {} },
  { id: 22, name: 'Lahbal Badr', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 23, name: 'Touil Zakaria', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 24, name: 'Magder Rayane', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 25, name: 'Idyhya Rayan', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 26, name: 'Khalal Mohsine', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 27, name: 'Magder Inas', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 28, name: 'Sfar Meriam', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 29, name: 'Belhouria Ali', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 30, name: 'Sas Lina', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 31, name: 'Benaid Maissaa', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 32, name: 'Magri Jihane', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 33, name: 'Lamlioui Adam', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 34, name: 'Belkarkour Hafsa', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 35, name: 'Bouchrahil Farah', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 36, name: 'Boussal Khadija', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 37, name: 'El Amrani Hafsa', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 38, name: 'Elmouhtakir Amine', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 39, name: 'Ouassou Zainab', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 40, name: 'Eljoudi Abdennour', group: 'B', trend: 0, recentProgress: 0, progress: {} },
  { id: 41, name: 'El Abassi Larbi', group: 'B', trend: 0, recentProgress: 0, progress: {} }
];

const MY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBRtTxNNZ3ssU_FrKd9T67ai2agUIRh6PU",
  authDomain: "optima-3d020.firebaseapp.com",
  projectId: "optima-3d020",
  storageBucket: "optima-3d020.firebasestorage.app",
  messagingSenderId: "1069028732243",
  appId: "1:1069028732243:web:8da00b101fd4004e6285a6"
};

const firebaseConfig = typeof window !== 'undefined' && window.__firebase_config ? JSON.parse(window.__firebase_config) : MY_FIREBASE_CONFIG;

let app, auth, db;
const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'optima-maths'; 

try {
  if(firebaseConfig.apiKey || firebaseConfig.projectId) {
     app = initializeApp(firebaseConfig);
     auth = getAuth(app);
     db = getFirestore(app);
  }
} catch (e) {
  console.error("Erreur Firebase:", e);
}

const compressImageToBase64 = (file, maxWidth = 600) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
    };
  });
};

const blobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
};

const getLessonScore = (progress, lessonId) => {
  if (!progress) return 0;
  const lessonProg = progress[lessonId];
  if (typeof lessonProg === 'number') return lessonProg; 
  if (typeof lessonProg === 'object' && lessonProg !== null) {
    let count = 0;
    for (const key in lessonProg) { if (lessonProg[key] === 1) count++; }
    return count;
  }
  return 0;
};

// حساب التمارين الناقصة (الزرقاء) لفك التعادل
const getPartialScore = (progress, lessonId) => {
  if (!progress) return 0;
  const lessonProg = progress[lessonId];
  if (typeof lessonProg === 'object' && lessonProg !== null) {
    let count = 0;
    for (const key in lessonProg) { if (lessonProg[key] === 2) count++; }
    return count;
  }
  return 0;
};

const calculateTotal = (progress) => {
  if (!progress) return 0;
  let total = 0;
  for (const lessonKey in progress) total += getLessonScore(progress, lessonKey);
  return total;
};

const calculatePartialTotal = (progress) => {
  if (!progress) return 0;
  let total = 0;
  for (const lessonKey in progress) total += getPartialScore(progress, lessonKey);
  return total;
};

const calculateCompletedLessons = (progress) => {
  return LESSONS.reduce((count, lesson) => {
    const score = getLessonScore(progress, lesson.id);
    return count + (score === lesson.total ? 1 : 0);
  }, 0);
};

const getScoreColorBadge = (score) => {
  const percentage = (score / 94) * 100;
  if (percentage < 40) return 'text-red-700 bg-red-100';
  if (percentage < 80) return 'text-purple-700 bg-purple-100';
  return 'text-green-700 bg-green-100';
};

const getScoreColorText = (score) => {
  const percentage = (score / 94) * 100;
  if (percentage < 40) return 'text-red-500';
  if (percentage < 80) return 'text-purple-500';
  return 'text-green-600';
};

const getProgressBarColor = (percentage) => {
  if (percentage < 40) return 'bg-red-500';
  if (percentage < 80) return 'bg-purple-400';
  return 'bg-green-500';
};

const GroupBadge = ({ group, isList = false }) => {
  if (!group) return null;
  if (isList) {
    return (
      <span className={`ml-1 text-[12px] font-black uppercase tracking-widest shrink-0 ${group === 'A' ? 'text-purple-400' : 'text-blue-400'}`} style={{ fontFamily: "'Lato', sans-serif" }}>
        {group}
      </span>
    );
  }
  return (
    <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[8px] font-bold rounded border border-gray-200 uppercase tracking-widest shrink-0 shadow-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
      {group}
    </span>
  );
};

const renderPodiumName = (student) => {
  if (!student || !student.name) return <span className="block truncate w-full text-center">---</span>;
  const parts = student.name.split(' ');
  if (parts.length === 1) return (
    <span className="flex items-center justify-center w-full">
      <span className="truncate">{student.name}</span>
      <GroupBadge group={student.group} />
    </span>
  );
  return (
    <div className="flex flex-col items-center w-full">
      <span className="block truncate w-full text-center">{parts[0]}</span>
      <span className="flex items-center justify-center w-full">
        <span className="truncate">{parts.slice(1).join(' ')}</span>
        <GroupBadge group={student.group} />
      </span>
    </div>
  );
};

// فك التعادل عن طريق حساب الملاحظات الزرقاء في الخلفية
const getRankMap = (studentsList) => {
  const sorted = [...studentsList].sort((a, b) => {
    const tA = calculateTotal(a.progress);
    const tB = calculateTotal(b.progress);
    if (tA !== tB) return tB - tA;
    // Tie-breaker: Partials (blue)
    return calculatePartialTotal(b.progress) - calculatePartialTotal(a.progress);
  });
  let currentRank = 1;
  const rankMap = {};
  sorted.forEach((student, index) => {
    if (index > 0) {
      const prevTotal = calculateTotal(sorted[index - 1].progress);
      const currTotal = calculateTotal(student.progress);
      const prevPartial = calculatePartialTotal(sorted[index - 1].progress);
      const currPartial = calculatePartialTotal(student.progress);
      if (currTotal < prevTotal || (currTotal === prevTotal && currPartial < prevPartial)) {
         currentRank = index + 1;
      }
    }
    rankMap[student.id] = currentRank;
  });
  return rankMap;
};

const PodiumMedal = ({ rank, defaultIcon }) => {
  if (rank === 1) return (
    <div className="relative inline-flex items-center justify-center p-1 animate-icon-pulse">
      <i className="fa-solid fa-trophy text-4xl shining-trophy relative z-10"></i>
      <i className="fa-solid fa-sparkles absolute top-0 -right-2 text-yellow-100 text-sm animate-pulse z-20 drop-shadow-sm"></i>
    </div>
  );
  if (rank === 2) return <i className={`fa-solid fa-medal text-2xl text-slate-400 drop-shadow-sm animate-icon-pulse`}></i>;
  if (rank === 3) return <i className={`fa-solid fa-medal text-2xl text-amber-600 drop-shadow-sm animate-icon-pulse`}></i>;
  return <i className={defaultIcon}></i>;
};

const SafeAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    audioRef.current = new Audio(src);
    audioRef.current.onended = () => { setIsPlaying(false); setProgress(0); };
    audioRef.current.ontimeupdate = () => {
      if (audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [src]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  if (!src) return null;
  return (
    <div className="flex-1 flex items-center gap-3 w-full bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
      <button type="button" onClick={toggle} className="shrink-0 w-24 justify-center bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-bold hover:bg-purple-200 transition-colors">
        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        {isPlaying ? 'Pause' : 'Écouter'}
      </button>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
         if (audioRef.current && audioRef.current.duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newProgress = clickX / rect.width;
            audioRef.current.currentTime = newProgress * audioRef.current.duration;
         }
      }}>
         <div className="h-full bg-purple-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

const ImageModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-[310] bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">
        <i className="fa-solid fa-xmark text-xl"></i>
      </button>
      <img src={src} alt="Plein écran" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
    </div>
  );
};

const RemarksViewerModal = ({ isOpen, remarks, onClose, studentName }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  if (!isOpen) return null;
  const validRemarks = remarks.filter(r => Date.now() - r.timestamp < THREE_DAYS_MS);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl relative flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>

          <div className="flex flex-col mb-4 border-b border-gray-100 pb-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-sm shrink-0 border border-orange-200">
                <i className="fa-solid fa-triangle-exclamation text-xl"></i>
              </div>
              <div className="flex flex-col text-left">
                <h2 className="text-lg font-black text-gray-800 leading-tight">Remarques</h2>
                <p className="text-xs text-gray-500 font-bold leading-tight">{studentName}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto smooth-scroll pr-1 space-y-3">
            {validRemarks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm italic">Aucune remarque récente.</div>
            ) : (
              validRemarks.sort((a, b) => b.timestamp - a.timestamp).map(remark => {
                const isRecent = (Date.now() - remark.timestamp) < ONE_DAY_MS;
                const borderClass = isRecent ? 'border-orange-400 shadow-md shadow-orange-100' : 'border-gray-200 shadow-sm';
                const dotClass = isRecent ? 'w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2' : 'hidden';

                return (
                  <div key={remark.id} className={`border rounded-2xl overflow-hidden bg-white transition-all ${borderClass}`}>
                    <button 
                      onClick={() => setExpandedId(expandedId === remark.id ? null : remark.id)}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-bold text-sm text-gray-700 flex items-center">
                        <div className={dotClass}></div>
                        {remark.title || "Remarque"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          {new Date(remark.timestamp).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit'})}
                        </span>
                        <i className={`fa-solid fa-chevron-down text-gray-400 text-xs transition-transform ${expandedId === remark.id ? 'rotate-180' : ''}`}></i>
                      </div>
                    </button>
                    
                    {expandedId === remark.id && (
                      <div className="p-4 border-t border-gray-100 space-y-4 bg-gray-50/50 animate-fade-in">
                        {remark.audioBase64 && (
                           <SafeAudioPlayer src={remark.audioBase64} />
                        )}
                        {remark.imageBase64s && remark.imageBase64s.length > 0 && (
                          <div className="flex overflow-x-auto gap-2 pb-2 snap-x smooth-scroll no-scrollbar">
                            {remark.imageBase64s.map((b64, idx) => (
                              <div key={idx} className="shrink-0 snap-center cursor-pointer" onClick={() => setFullscreenImage(b64)}>
                                <img src={b64} alt={`Remarque ${idx + 1}`} className="h-32 w-auto rounded-xl border border-gray-200 shadow-sm object-cover hover:opacity-90 transition-opacity" />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 text-left italic">
                           Ajouté à {new Date(remark.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <ImageModal src={fullscreenImage} onClose={() => setFullscreenImage(null)} />
    </>
  );
};

const AdminAddRemarkModal = ({ isOpen, onClose, student, onSave, remarks, onDeleteRemark }) => {
  const [mode, setMode] = useState('new'); // 'new' or 'history'
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
     if(isOpen) {
        setMode('new');
        setTitle('');
        setImages([]);
        setAudioBase64(null);
     }
  }, [isOpen]);

  if (!isOpen || !student) return null;
  const studentRemarks = remarks || [];

  const handleImageCapture = async (e) => {
    const files = Array.from(e.target.files);
    const b64Images = await Promise.all(files.map(f => compressImageToBase64(f)));
    setImages(prev => [...prev, ...b64Images]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        setAudioBase64(base64);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erreur micro:", err);
      alert("Accès au microphone refusé.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return; 
    setIsSaving(true);
    try {
      const newRemark = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        title: title.trim(),
        audioBase64,
        imageBase64s: images
      };
      await onSave(student.id, newRemark);
      setTitle('');
      setImages([]);
      setAudioBase64(null);
      setMode('history');
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in" onClick={!isSaving ? onClose : undefined}>
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl relative flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        {!isSaving && (
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        )}
        
        {/* Toggle Mode Button */}
        <button 
           onClick={() => setMode(mode === 'new' ? 'history' : 'new')}
           className="absolute top-4 left-4 text-[11px] font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm"
        >
           {mode === 'new' ? <><i className="fa-solid fa-clock-rotate-left mr-1"></i> Historique</> : <><i className="fa-solid fa-plus mr-1"></i> Nouvelle</>}
        </button>

        <div className="text-center mb-5 mt-10 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-black text-orange-500 flex items-center justify-center gap-2">
            <i className={mode === 'new' ? "fa-solid fa-circle-plus" : "fa-solid fa-clock-rotate-left"}></i> 
            {mode === 'new' ? "Ajouter Remarque" : "Historique"}
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-bold">{student.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll">
           {mode === 'new' ? (
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-gray-700 mb-1 block">Titre <span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   value={title} 
                   onChange={e => setTitle(e.target.value)} 
                   placeholder="Ex: Correction de l'exercice..."
                   required
                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                 />
               </div>

               <div className="flex gap-3">
                 <div className="flex-1">
                    <input type="file" accept="image/*" capture="environment" id="cameraInput" className="hidden" onChange={handleImageCapture} multiple />
                    <label htmlFor="cameraInput" className="w-full py-3 flex flex-col items-center justify-center gap-1 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                       <i className="fa-solid fa-camera text-xl"></i>
                       <span className="text-[10px] font-bold">Photo ({images.length})</span>
                    </label>
                 </div>
                 
                 <div className="flex-1">
                    <button 
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-full py-3 flex flex-col items-center justify-center gap-1 rounded-xl border transition-colors ${isRecording ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : audioBase64 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'}`}
                    >
                       <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-xl`}></i>
                       <span className="text-[10px] font-bold">{isRecording ? 'Stop' : audioBase64 ? 'Audio (1)' : 'Vocal'}</span>
                    </button>
                 </div>
               </div>

               {images.length > 0 && (
                 <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar">
                    {images.map((b64, i) => (
                      <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                         <img src={b64} alt="preview" className="w-full h-full object-cover" />
                         <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]">
                            <i className="fa-solid fa-xmark"></i>
                         </button>
                      </div>
                    ))}
                 </div>
               )}

               {audioBase64 && !isRecording && (
                 <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <SafeAudioPlayer src={audioBase64} />
                    <button type="button" onClick={() => setAudioBase64(null)} className="w-8 h-8 shrink-0 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center ml-auto">
                       <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                 </div>
               )}

               <button 
                 type="submit" 
                 disabled={isSaving || !title.trim()}
                 className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl shadow-sm shadow-orange-200 flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
               >
                 {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Traitement...</> : <><i className="fa-solid fa-paper-plane"></i> Enregistrer</>}
               </button>
             </form>
           ) : (
             <div className="space-y-3">
                {studentRemarks.length === 0 ? (
                   <div className="text-center py-8 text-gray-400 text-sm italic">Aucun historique.</div>
                ) : (
                   studentRemarks.sort((a,b) => b.timestamp - a.timestamp).map(r => (
                      <div key={r.id} className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">{r.title}</span>
                            <span className="text-[10px] text-gray-400">{new Date(r.timestamp).toLocaleDateString('fr-FR')}</span>
                         </div>
                         <button 
                           onClick={() => onDeleteRemark(student.id, r.id)}
                           className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 hover:bg-red-100 transition-colors"
                         >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                         </button>
                      </div>
                   ))
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const ProgressDetails = ({ student, isPodium = false, onCompare }) => {
  const [viewMode, setViewMode] = useState('list'); 
  const [activeLesson, setActiveLesson] = useState(null);

  if (!student || student.isTie || student.isEmpty) return null;

  const size = 200;
  const center = size / 2;
  const maxRadius = 70;

  const shortNames = {
    'eq': 'Équations', 'vec': 'Vecteurs', 'geo': 'Analytique',
    'sys': 'Systèmes', 'fon': 'Fonctions', 'sta': 'Stats', 'esp': 'Espace'
  };

  const radarData = LESSONS.map((lesson, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i / LESSONS.length);
    const score = getLessonScore(student.progress, lesson.id);
    const value = score / lesson.total;
    
    let anchor = "middle";
    const labelX = center + (maxRadius + 14) * Math.cos(angle);
    if (labelX < center - 10) anchor = "end";
    else if (labelX > center + 10) anchor = "start";

    let colorStr = "168, 85, 247"; 
    if (value >= 0.8) colorStr = "34, 197, 94"; 
    else if (value >= 0.4) colorStr = "245, 158, 11"; 
    else colorStr = "239, 68, 68"; 

    return {
      ...lesson, shortName: shortNames[lesson.id], value, score,
      x: center + maxRadius * value * Math.cos(angle),
      y: center + maxRadius * value * Math.sin(angle),
      labelX, labelY: center + (maxRadius + 12) * Math.sin(angle),
      axisEndX: center + maxRadius * Math.cos(angle),
      axisEndY: center + maxRadius * Math.sin(angle),
      anchor, colorStr
    };
  });

  const polygonPoints = radarData.map(d => `${d.x},${d.y}`).join(' ');

  const renderGrid = () => {
    return [0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => {
      const points = LESSONS.map((_, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i / LESSONS.length);
        return `${center + maxRadius * scale * Math.cos(angle)},${center + maxRadius * scale * Math.sin(angle)}`;
      }).join(' ');
      return <polygon key={`grid-${index}`} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
    });
  };

  let podiumBorderClass = 'border-purple-100 shadow-[0_15px_40px_rgba(147,51,234,0.15)]';
  if (isPodium) {
      if (student.rank === 1) podiumBorderClass = 'border-[3px] border-purple-500 shadow-[0_15px_40px_rgba(168,85,247,0.3)]';
      else if (student.rank === 2) podiumBorderClass = 'border-[3px] border-emerald-500 shadow-[0_15px_40px_rgba(16,185,129,0.3)]';
      else if (student.rank === 3) podiumBorderClass = 'border-[3px] border-rose-500 shadow-[0_15px_40px_rgba(244,63,63,0.3)]';
  }

  return (
    <div className={`${isPodium ? `bg-white rounded-2xl ${podiumBorderClass} mt-2 overflow-hidden` : 'border-t border-gray-100 overflow-hidden rounded-b-2xl'}`}>
      <div className="relative w-full overflow-hidden bg-gray-50/50">
        <div 
          className="flex transition-transform duration-500 ease-in-out items-stretch" 
          style={{ width: '200%', transform: viewMode === 'radar' ? 'translateX(-50%)' : 'translateX(0)' }}
        >
          <div className="w-1/2 flex flex-col max-h-[300px] overflow-y-auto smooth-scroll no-scrollbar bg-white">
            {LESSONS.map((lesson, index) => {
              const completed = getLessonScore(student.progress, lesson.id);
              const bgClass = index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white';
              const value = completed / lesson.total;
              let textColorClass = "text-red-500";
              if (value >= 0.8) textColorClass = "text-green-500";
              else if (value >= 0.4) textColorClass = "text-orange-500";
              const isLessonExp = activeLesson === lesson.id;

              return (
                <div key={lesson.id} className={`flex flex-col border-b border-gray-50 last:border-0 ${bgClass}`}>
                  <div 
                    onClick={() => setActiveLesson(isLessonExp ? null : lesson.id)}
                    className="flex justify-between items-center px-4 py-2.5 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  >
                    <span className="text-gray-600 font-bold text-[11px] truncate mr-2">{lesson.name}</span>
                    <div className="flex items-center shrink-0 min-w-[40px] justify-end">
                      <span className={`text-[11px] font-black ${textColorClass}`} style={{ fontFamily: "'Lato', sans-serif" }}>{completed}/{lesson.total}</span>
                      <i className={`fa-solid fa-chevron-down text-gray-400 text-[9px] ml-2 transition-transform duration-300 ${isLessonExp ? 'rotate-180 text-purple-500' : ''}`}></i>
                    </div>
                  </div>
                  
                  {isLessonExp && (
                    <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-100 grid grid-cols-4 sm:grid-cols-5 gap-1.5 shadow-inner">
                      {Array.from({ length: lesson.total }).map((_, i) => {
                        const exNum = i + 1;
                        let currentProg = student.progress[lesson.id] || {};
                        const currentStatus = currentProg[exNum] || 0;
                        
                        let iconClass = "fa-regular fa-circle text-gray-300";
                        let bgBtnClass = "bg-white border-gray-200";
                        
                        if (currentStatus === 1) { 
                          iconClass = "fa-solid fa-circle-check text-green-500"; bgBtnClass = "bg-green-50 border-green-200"; 
                        } else if (currentStatus === 2) { 
                          iconClass = "fa-solid fa-circle-minus text-blue-500"; bgBtnClass = "bg-blue-50 border-blue-200"; 
                        } else if (currentStatus === 3) { 
                          iconClass = "fa-solid fa-circle-xmark text-red-500"; bgBtnClass = "bg-red-50 border-red-200"; 
                        }

                        return (
                          <div key={exNum} className={`flex flex-col items-center justify-center py-1.5 rounded-lg border shadow-sm ${bgBtnClass}`}>
                            <span className="text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "'Lato', sans-serif" }}>Ex {exNum}</span>
                            <i className={`${iconClass} text-sm drop-shadow-sm`}></i>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-1/2 flex items-center justify-center py-2 px-1 bg-white/50 border-l border-gray-100">
            <div className="w-full max-w-[200px] aspect-square relative">
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible drop-shadow-sm">
                {renderGrid()}
                {radarData.map((d, i) => <line key={`axis-${i}`} x1={center} y1={center} x2={d.axisEndX} y2={d.axisEndY} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2 2" />)}
                <polygon points={polygonPoints} fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="1.5" className="transition-all duration-700 ease-out" />
                {radarData.map((d, i) => <circle key={`dot-${i}`} cx={d.x} cy={d.y} r="2.5" fill="#fff" stroke="#a855f7" strokeWidth="1.5" />)}
                {radarData.map((d, i) => (
                  <g key={`label-${i}`}>
                    <text x={d.labelX} y={d.labelY - 6} textAnchor={d.anchor} dominantBaseline="middle" fontSize="9" fontWeight="bold" fill="#4b5563">{d.shortName}</text>
                    <text x={d.labelX} y={d.labelY + 6} textAnchor={d.anchor} dominantBaseline="middle" fontSize="9" fontWeight="bold" fill={`rgb(${d.colorStr})`} style={{ fontFamily: "'Lato', sans-serif" }}>{d.score}/{d.total}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 p-3 bg-white border-t border-gray-100 relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <button
          onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'list' ? 'radar' : 'list'); }}
          className="flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100 font-bold text-[11px] py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {viewMode === 'list' ? <><i className="fa-solid fa-chart-pie text-[13px]"></i> Diagramme</> : <><i className="fa-solid fa-list-ul text-[13px]"></i> Liste détaillée</>}
        </button>
        {onCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onCompare(); }}
            className="flex-1 bg-red-50 text-red-500 hover:bg-red-100 font-bold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <i className="fa-solid fa-khanda text-[13px]"></i> Comparer
          </button>
        )}
      </div>
    </div>
  );
};

const GroupRaceModal = ({ isOpen, students, onClose }) => {
  if (!isOpen || !students) return null;

  const groupA = students.filter(s => s.group === 'A' || !s.group);
  const groupB = students.filter(s => s.group === 'B');

  const getStats = (group) => {
    return LESSONS.map(lesson => {
      const maxPossible = group.length * lesson.total;
      let correctCount = 0;
      group.forEach(s => { correctCount += getLessonScore(s.progress, lesson.id); });
      const correctPct = maxPossible === 0 ? 0 : (correctCount / maxPossible) * 100;
      return { id: lesson.id, name: lesson.name, correctPct };
    });
  };

  const statsA = getStats(groupA);
  const statsB = getStats(groupB);

  let winsA = 0, winsB = 0;
  LESSONS.forEach(lesson => {
    const aPct = statsA.find(s => s.id === lesson.id).correctPct;
    const bPct = statsB.find(s => s.id === lesson.id).correctPct;
    if (aPct > bPct) winsA++; else if (bPct > aPct) winsB++;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl relative flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="text-center mb-2 mt-2 shrink-0">
          <div className="flex justify-center items-center gap-6 mt-3 mb-2">
             <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Groupe A</span>
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-3xl font-black text-red-500 shadow-sm" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{winsA}</div>
             </div>
             <div className="text-2xl font-black text-gray-300 mt-4">VS</div>
             <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Groupe B</span>
                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-3xl font-black text-green-500 shadow-sm" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{winsB}</div>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll pb-2 border-t border-gray-100 pt-4">
          <div className="space-y-4">
            {LESSONS.map((lesson) => {
              const a = statsA.find(s => s.id === lesson.id);
              const b = statsB.find(s => s.id === lesson.id);
              return (
                <div key={lesson.id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-sm font-black text-gray-800 mb-3 flex items-center justify-center pb-2 border-b border-gray-100">{lesson.name}</div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-5 text-sm font-black text-center shrink-0 text-red-500">A</div>
                      <div className="flex-1 h-2 flex rounded-full bg-gray-100 shadow-inner">
                        <div style={{ width: `${a.correctPct}%` }} className="h-full bg-red-500 transition-all duration-1000 ease-out rounded-full"></div>
                      </div>
                      <div className="w-9 text-right font-black text-xs text-red-500" style={{ fontFamily: "'Lato', sans-serif" }}>{a.correctPct.toFixed(0)}%</div>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-5 text-sm font-black text-center shrink-0 text-green-500">B</div>
                      <div className="flex-1 h-2 flex rounded-full bg-gray-100 shadow-inner">
                        <div style={{ width: `${b.correctPct}%` }} className="h-full bg-green-500 transition-all duration-1000 ease-out rounded-full"></div>
                      </div>
                      <div className="w-9 text-right font-black text-xs text-green-500" style={{ fontFamily: "'Lato', sans-serif" }}>{b.correctPct.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const VersusModal = ({ students, onClose }) => {
  const [viewMode, setViewMode] = useState('radar');
  if (!students || students.length !== 2) return null;
  const [s1, s2] = students;
  const size = 280, center = size / 2, maxRadius = 95;
  const shortNames = { 'eq': 'Équations', 'vec': 'Vecteurs', 'geo': 'Analytique', 'sys': 'Systèmes', 'fon': 'Fonctions', 'sta': 'Stats', 'esp': 'Espace' };

  const radarData = LESSONS.map((lesson, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i / LESSONS.length);
    const score1 = getLessonScore(s1.progress, lesson.id);
    const score2 = getLessonScore(s2.progress, lesson.id);
    const v1 = score1 / lesson.total, v2 = score2 / lesson.total;
    let anchor = "middle";
    const labelX = center + (maxRadius + 16) * Math.cos(angle);
    if (labelX < center - 15) anchor = "end"; else if (labelX > center + 15) anchor = "start";
    return {
      ...lesson, shortName: shortNames[lesson.id], score1, score2,
      x1: center + maxRadius * v1 * Math.cos(angle), y1: center + maxRadius * v1 * Math.sin(angle),
      x2: center + maxRadius * v2 * Math.cos(angle), y2: center + maxRadius * v2 * Math.sin(angle),
      labelX, labelY: center + (maxRadius + 12) * Math.sin(angle),
      axisEndX: center + maxRadius * Math.cos(angle), axisEndY: center + maxRadius * Math.sin(angle), anchor
    };
  });

  const poly1 = radarData.map(d => `${d.x1},${d.y1}`).join(' ');
  const poly2 = radarData.map(d => `${d.x2},${d.y2}`).join(' ');

  const renderGrid = () => {
    return [0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => {
      const points = LESSONS.map((_, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i / LESSONS.length);
        return `${center + maxRadius * scale * Math.cos(angle)},${center + maxRadius * scale * Math.sin(angle)}`;
      }).join(' ');
      return <polygon key={`grid-${index}`} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
    });
  };

  const getStudentDecorations = (student) => {
    const nowTime = Date.now();
    const hasFire = student.fireBadgeUntil && student.fireBadgeUntil > nowTime;
    const hasLightning = student.lightningBadgeUntil && student.lightningBadgeUntil > nowTime;
    const hasBoth = hasFire && hasLightning;
    const nameClass = `text-xs font-bold text-center leading-tight min-h-[32px] flex items-center justify-center flex-wrap px-1 ${
      hasBoth ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-gradient-x' :
      hasFire ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-gradient-x' :
      hasLightning ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-gradient-x' : 'text-gray-800'
    }`;
    return { hasFire, hasLightning, nameClass };
  };

  const s1Deco = getStudentDecorations(s1);
  const s2Deco = getStudentDecorations(s2);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-[0_10px_40px_rgba(239,68,68,0.3)] border-2 border-red-500 relative animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="mb-5 mt-2">
          <div className="flex justify-between items-start px-1">
            <div className="flex flex-col items-center w-[42%]">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xl mb-1.5 shadow-sm border-2 border-white relative">
                 {s1.rank}<div className="absolute -bottom-1 w-full flex justify-center"><div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div></div>
              </div>
              <span className={s1Deco.nameClass}>{renderPodiumName(s1)}</span>
              <div className="flex items-center justify-center gap-1.5 mt-1 w-full px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>{calculateCompletedLessons(s1.progress)}</span>
                  <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                </div>
                <div className="flex items-center gap-1">
                  {s1Deco.hasFire && <i className="fa-solid fa-fire animate-pulse drop-shadow-sm text-[14px]" style={{ color: 'rgb(243, 59, 59)' }}></i>}
                  {s1Deco.hasLightning && <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm text-[14px]"></i>}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1.5 w-full px-1">
                <span className={`text-xs px-2.5 py-1 rounded-lg shadow-sm ${getScoreColorBadge(calculateTotal(s1.progress))}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}>
                  {calculateTotal(s1.progress)}/94
                </span>
                {s1.recentProgress ? (
                  <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">+{s1.recentProgress}</div>
                ) : null}
              </div>
            </div>

            <div className="flex-1 flex justify-center pt-4 relative">
               <div className="absolute w-px h-16 bg-gray-100"></div>
               <div className="bg-white p-2 rounded-full z-10 shadow-sm border border-gray-50 mt-1">
                  <i className="fa-solid fa-bolt text-yellow-400 text-xl drop-shadow-sm"></i>
               </div>
            </div>

            <div className="flex flex-col items-center w-[42%]">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black text-xl mb-1.5 shadow-sm border-2 border-white relative">
                 {s2.rank}<div className="absolute -bottom-1 w-full flex justify-center"><div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div></div>
              </div>
              <span className={s2Deco.nameClass}>{renderPodiumName(s2)}</span>
              <div className="flex items-center justify-center gap-1.5 mt-1 w-full px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>{calculateCompletedLessons(s2.progress)}</span>
                  <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                </div>
                <div className="flex items-center gap-1">
                  {s2Deco.hasFire && <i className="fa-solid fa-fire animate-pulse drop-shadow-sm text-[14px]" style={{ color: 'rgb(243, 59, 59)' }}></i>}
                  {s2Deco.hasLightning && <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm text-[14px]"></i>}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1.5 w-full px-1">
                <span className={`text-xs px-2.5 py-1 rounded-lg shadow-sm ${getScoreColorBadge(calculateTotal(s2.progress))}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}>
                  {calculateTotal(s2.progress)}/94
                </span>
                {s2.recentProgress ? (
                  <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px] font-bold shadow-sm">+{s2.recentProgress}</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-hidden bg-gray-50/50 rounded-2xl border border-gray-100">
          <div className="flex transition-transform duration-500 ease-in-out items-stretch" style={{ width: '200%', transform: viewMode === 'table' ? 'translateX(-50%)' : 'translateX(0)' }}>
            <div className="w-1/2 flex items-center justify-center py-5 px-2">
              <div className="w-full max-w-[280px] aspect-square relative">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible drop-shadow-sm">
                  {renderGrid()}
                  {radarData.map((d, i) => <line key={`axis-${i}`} x1={center} y1={center} x2={d.axisEndX} y2={d.axisEndY} stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3 3" />)}
                  <polygon points={poly2} fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="1.5" className="transition-all duration-700 ease-out" />
                  <polygon points={poly1} fill="rgba(168, 85, 247, 0.4)" stroke="#a855f7" strokeWidth="1.5" className="transition-all duration-700 ease-out" />
                  {radarData.map((d, i) => (
                    <g key={`dots-${i}`}>
                       <circle cx={d.x2} cy={d.y2} r="2.5" fill="#fff" stroke="#22c55e" strokeWidth="1.5" />
                       <circle cx={d.x1} cy={d.y1} r="2.5" fill="#fff" stroke="#a855f7" strokeWidth="1.5" />
                    </g>
                  ))}
                  {radarData.map((d, i) => (
                    <g key={`label-${i}`}>
                      <text x={d.labelX} y={d.labelY - 7} textAnchor={d.anchor} dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#4b5563">{d.shortName}</text>
                      <text x={d.labelX} y={d.labelY + 7} textAnchor={d.anchor} dominantBaseline="middle" fontSize="12" fontWeight="900" style={{ fontFamily: "'Lato', sans-serif" }}>
                        <tspan fill="#a855f7">{d.score1}</tspan><tspan fill="#9ca3af" fontSize="9"> x </tspan><tspan fill="#22c55e">{d.score2}</tspan>
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-center bg-white p-2">
               {radarData.map((d, idx) => {
                  const v1 = d.score1, v2 = d.score2, isTie = v1 === v2, s1Wins = v1 > v2, s2Wins = v2 > v1;
                  const bgClass = idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white';
                  return (
                     <div key={d.id} className={`flex justify-between items-center py-2 px-1 rounded ${bgClass}`}>
                        <div className={`w-8 text-center font-bold text-[11px] ${s1Wins ? 'text-purple-600 bg-purple-100 rounded' : isTie ? 'text-gray-400' : 'text-gray-300'}`}>{v1}</div>
                        <div className="flex-1 flex justify-center items-center gap-1">
                           {s1Wins && <i className="fa-solid fa-caret-left text-purple-400 text-[10px]"></i>}
                           <span className="text-[10px] text-gray-500 font-bold truncate max-w-[100px] text-center">{d.name}</span>
                           {s2Wins && <i className="fa-solid fa-caret-right text-green-500 text-[10px]"></i>}
                        </div>
                        <div className={`w-8 text-center font-bold text-[11px] ${s2Wins ? 'text-green-600 bg-green-100 rounded' : isTie ? 'text-gray-400' : 'text-gray-300'}`}>{v2}</div>
                     </div>
                  )
               })}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 bg-gray-100 p-1 rounded-xl">
           <button onClick={() => setViewMode('radar')} className={`flex-1 py-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${viewMode === 'radar' ? 'bg-white text-gray-800' : 'bg-transparent text-gray-400 shadow-none'}`}>
              <i className="fa-solid fa-chart-pie text-[13px]"></i> Diagramme
           </button>
           <button onClick={() => setViewMode('table')} className={`flex-1 py-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${viewMode === 'table' ? 'bg-white text-gray-800' : 'bg-transparent text-gray-400 shadow-none'}`}>
              <i className="fa-solid fa-list-ul text-[13px]"></i> Détails
           </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true); 
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [remarksData, setRemarksData] = useState({});
  const [user, setUser] = useState(null);
  
  const [expandedId, setExpandedId] = useState(null);
  const [comparingStudent, setComparingStudent] = useState(null); 
  const [versusStudents, setVersusStudents] = useState(null); 
  const [showGroupRace, setShowGroupRace] = useState(false); 
  const [adminRemarkStudent, setAdminRemarkStudent] = useState(null);
  const [viewRemarkStudent, setViewRemarkStudent] = useState(null);
  
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminExpandedId, setAdminExpandedId] = useState(null);
  const [adminActiveLesson, setAdminActiveLesson] = useState(null);
  const [adminSortDesc, setAdminSortDesc] = useState(true); 
  
  const [announcement, setAnnouncement] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [adminAnnText, setAdminAnnText] = useState('');
  const [adminAnnActive, setAdminAnnActive] = useState(false);
  const [adminAnnHasLink, setAdminAnnHasLink] = useState(false);
  const [adminAnnLinkText, setAdminAnnLinkText] = useState('');
  const [adminAnnLinkUrl, setAdminAnnLinkUrl] = useState('');
  const [adminAnnHasDate, setAdminAnnHasDate] = useState(false);
  const [adminAnnDateValue, setAdminAnnDateValue] = useState('');

  const [showAdminStats, setShowAdminStats] = useState(false);
  const [statsTab, setStatsTab] = useState('lessons'); 
  const [liveOnline, setLiveOnline] = useState(1);
  const [dailyVisits, setDailyVisits] = useState(0);
  const [weeklyVisits, setWeeklyVisits] = useState(0);

  const [initialAdminStudents, setInitialAdminStudents] = useState([]);
  const [sessionStartRanks, setSessionStartRanks] = useState({});
  const [sessionStartScores, setSessionStartScores] = useState({});
  const [adminSortScores, setAdminSortScores] = useState({}); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [visibleCount, setVisibleCount] = useState(10);
  const [isSticky, setIsSticky] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const headerRef = useRef(null);

  const isVersusMode = !!(comparingStudent || versusStudents || showGroupRace);

  const isAdminRef = useRef(isAdmin);
  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && announcement) {
      setAdminAnnText(announcement.text || '');
      setAdminAnnActive(announcement.isActive || false);
      setAdminAnnHasLink(announcement.hasLink || false);
      setAdminAnnLinkText(announcement.linkText || '');
      setAdminAnnLinkUrl(announcement.linkUrl || '');
      setAdminAnnHasDate(announcement.hasDate || false);
      setAdminAnnDateValue(announcement.dateValue || '');
    }
  }, [isAdmin, announcement]);

  useEffect(() => {
    if (!user || !db) return; 
    let sessionId = sessionStorage.getItem('optima_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('optima_session_id', sessionId);
    }
    const recordVisit = async () => {
      const visitedToday = sessionStorage.getItem('optima_visited_today');
      if (visitedToday) return;
      const counterRef = doc(db, 'artifacts', appId, 'public', 'data', 'analytics', 'counters');
      const todayStr = new Date().toISOString().split('T')[0];
      try {
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(counterRef);
          if (!sfDoc.exists()) {
            transaction.set(counterRef, { dailyVisits: 1, weeklyVisits: 1, lastResetDate: todayStr, lastWeekResetDate: todayStr });
          } else {
            const data = sfDoc.data();
            let newDaily = (data.dailyVisits || 0) + 1;
            let newWeekly = (data.weeklyVisits || 0) + 1;
            let updates = {};
            if (data.lastResetDate !== todayStr) { newDaily = 1; updates.lastResetDate = todayStr; }
            const lastWeekDate = new Date(data.lastWeekResetDate || todayStr);
            if ((new Date() - lastWeekDate) / (1000 * 60 * 60 * 24) >= 7) { newWeekly = 1; updates.lastWeekResetDate = todayStr; }
            updates.dailyVisits = newDaily; updates.weeklyVisits = newWeekly;
            transaction.update(counterRef, updates);
          }
        });
        sessionStorage.setItem('optima_visited_today', 'true');
      } catch (e) { console.error("Analytics Error:", e); }
    };
    recordVisit();

    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'online_sessions', sessionId);
    let isUserActive = true;
    const handleActivity = () => { isUserActive = true; };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const sendHeartbeat = async () => {
      if (isUserActive) {
        try { await setDoc(sessionRef, { lastActive: Date.now() }, { merge: true }); isUserActive = false; } catch (err) {}
      }
    };
    sendHeartbeat(); 
    const heartbeatInterval = setInterval(sendHeartbeat, 3 * 60 * 1000); 

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [user, db]);

  useEffect(() => {
    if (!user || !db) return;
    const sessionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'online_sessions');
    const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      let activeCount = 0;
      snapshot.forEach(docSnap => { if (docSnap.data().lastActive > fiveMinutesAgo) activeCount++; });
      setLiveOnline(activeCount > 0 ? activeCount : 1);
    });
    return () => unsubscribeSessions();
  }, [user, db]);

  useEffect(() => {
    if (!user || !db) return; 
    const counterRef = doc(db, 'artifacts', appId, 'public', 'data', 'analytics', 'counters');
    const unsubscribeCounters = onSnapshot(counterRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailyVisits(docSnap.data().dailyVisits || 0);
        setWeeklyVisits(docSnap.data().weeklyVisits || 0);
      }
    });
    return () => unsubscribeCounters();
  }, [user, db]);

  useEffect(() => {
    if (!user || !db) return;
    const annRef = doc(db, 'artifacts', appId, 'public', 'data', 'announcements', 'current');
    const unsubAnn = onSnapshot(annRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAnnouncement(data);
        if (!isAdminRef.current) {
          if (data.isActive && data.text && localStorage.getItem('optima_hidden_ann') !== data.id) {
            setShowAnnouncement(true);
          } else setShowAnnouncement(false);
        }
      } else if (isAdminRef.current) setDoc(annRef, { text: '', isActive: false, id: Date.now().toString() }).catch(console.error);
    });
    return () => unsubAnn();
  }, [user, db]);

  const handleDismissAnnouncement = () => setShowAnnouncement(false);
  const handleDontShowAgain = () => { if (announcement) localStorage.setItem('optima_hidden_ann', announcement.id); setShowAnnouncement(false); };

  useEffect(() => {
    if (isAdmin) return;
    const handleScroll = () => {
      if (headerRef.current) setIsSticky(headerRef.current.getBoundingClientRect().bottom < 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin]);

  const handleListScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop > 10 && !isSticky) setIsSticky(true);
    if (scrollHeight - scrollTop - clientHeight < 250) {
      setVisibleCount(prev => prev < students.length ? prev + 10 : prev);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!isAdmin) setIsSticky(false);
  }, [isAdmin]);

  useEffect(() => {
    const targetDate = new Date(new Date().getFullYear(), 5, 24, 8, 0, 0); 
    const updateTimer = () => {
      const difference = targetDate - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) await signInWithCustomToken(auth, window.__initial_auth_token);
        else await signInAnonymously(auth);
      } catch (err) { console.error("Auth Error", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return; 
    
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', 'v3');
    const unsubscribeStudents = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && !isAdminRef.current) setStudents(docSnap.data().students);
      else if (!isAdminRef.current) setDoc(docRef, { students: INITIAL_STUDENTS }).catch(console.error);
      setTimeout(() => setIsLoading(false), 2000);
    });

    const remarksRef = doc(db, 'artifacts', appId, 'public', 'data', 'remarks', 'active');
    const unsubscribeRemarks = onSnapshot(remarksRef, (docSnap) => {
       if (docSnap.exists()) {
          setRemarksData(docSnap.data().records || {});
       }
    });

    return () => { unsubscribeStudents(); unsubscribeRemarks(); };
  }, [user, db]);

  const handleSaveNewRemark = async (studentId, newRemark) => {
    const updatedData = { ...remarksData };
    if (!updatedData[studentId]) updatedData[studentId] = [];
    updatedData[studentId].push(newRemark);
    
    const nowTime = Date.now();
    for (const sId in updatedData) {
        updatedData[sId] = updatedData[sId].filter(r => (nowTime - r.timestamp) < THREE_DAYS_MS);
        if (updatedData[sId].length === 0) delete updatedData[sId];
    }
    
    setRemarksData(updatedData);
    if (db) {
       const remarksRef = doc(db, 'artifacts', appId, 'public', 'data', 'remarks', 'active');
       await setDoc(remarksRef, { records: updatedData }, { merge: true });
    }
  };

  const handleDeleteRemark = async (studentId, remarkId) => {
    const updatedData = { ...remarksData };
    if (updatedData[studentId]) {
       updatedData[studentId] = updatedData[studentId].filter(r => r.id !== remarkId);
       if (updatedData[studentId].length === 0) delete updatedData[studentId];
       setRemarksData(updatedData);
       if (db) {
          const remarksRef = doc(db, 'artifacts', appId, 'public', 'data', 'remarks', 'active');
          await setDoc(remarksRef, { records: updatedData }, { merge: true });
       }
    }
  };

  const rankedStudents = useMemo(() => {
    const sorted = [...students].sort((a, b) => {
      const tA = calculateTotal(a.progress);
      const tB = calculateTotal(b.progress);
      if (tA !== tB) return tB - tA;
      // Tie breaker by blue partials
      return calculatePartialTotal(b.progress) - calculatePartialTotal(a.progress);
    });
    
    let currentRank = 1;
    return sorted.map((student, index) => {
      if (index > 0) {
        const prevTotal = calculateTotal(sorted[index - 1].progress);
        const currTotal = calculateTotal(student.progress);
        const prevPartial = calculatePartialTotal(sorted[index - 1].progress);
        const currPartial = calculatePartialTotal(student.progress);
        
        if (currTotal < prevTotal || (currTotal === prevTotal && currPartial < prevPartial)) {
           currentRank = index + 1;
        }
      }
      return { ...student, rank: currentRank };
    });
  }, [students]);

  const podiumSpots = useMemo(() => {
    return [1, 2, 3].map(r => {
      const atRank = rankedStudents.filter(s => s.rank === r);
      if (atRank.length === 1) return atRank[0];
      if (atRank.length > 1) return { id: `tie-${r}`, isTie: true, name: 'Non défini', rank: r, progress: atRank[0].progress, trend: 0, recentProgress: 0 };
      return { id: `empty-${r}`, isEmpty: true, name: 'Non défini', rank: r, progress: LESSONS.reduce((acc, l) => ({...acc, [l.id]: {}}), {}), trend: 0, recentProgress: 0 };
    });
  }, [rankedStudents]);

  const podiumStudentsIds = podiumSpots.filter(s => !s.isTie && !s.isEmpty).map(s => s.id);
  const others = rankedStudents.filter(s => !podiumStudentsIds.includes(s.id));

  const filteredAdminStudents = useMemo(() => {
    return rankedStudents.filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => {
      const totalA = adminSortScores[a.id] !== undefined ? adminSortScores[a.id] : calculateTotal(a.progress);
      const totalB = adminSortScores[b.id] !== undefined ? adminSortScores[b.id] : calculateTotal(b.progress);
      if (totalA !== totalB) return adminSortDesc ? totalB - totalA : totalA - totalB;
      
      const partialA = calculatePartialTotal(a.progress);
      const partialB = calculatePartialTotal(b.progress);
      if (partialA !== partialB) return adminSortDesc ? partialB - partialA : partialA - partialB;
      
      return a.id - b.id;
    });
  }, [rankedStudents, searchQuery, adminSortDesc, adminSortScores]);

  const openAdmin = () => {
    setInitialAdminStudents(JSON.parse(JSON.stringify(students)));
    setSessionStartRanks(getRankMap(students));
    const initialScores = {};
    students.forEach(s => initialScores[s.id] = calculateTotal(s.progress));
    setSessionStartScores(initialScores); setAdminSortScores(initialScores); 
    setIsAdmin(true);
  };

  const handleLockClick = () => {
    // التعديل الأول: منع محاولة الدخول إذا كانت البيانات لم تكتمل في التحميل
    if (isLoading) return; 
    
    if (localStorage.getItem('optimaAdminMode') === 'true') openAdmin();
    else setShowLogin(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'AMZMATH') {
      localStorage.setItem('optimaAdminMode', 'true'); setShowLogin(false); setPassword(''); setLoginError(false); openAdmin();
    } else setLoginError(true);
  };

  const refreshAdminSort = () => {
    const currentScores = {}; students.forEach(s => currentScores[s.id] = calculateTotal(s.progress)); setAdminSortScores(currentScores);
  };

  const handleSaveAdmin = async () => {
    setIsSaving(true); 
    const newRanks = getRankMap(students);
    const nowTime = Date.now();
    const twoDays = 2 * 24 * 60 * 60 * 1000; 
    
    // التحقق مما إذا تم التعديل فعلياً على تمارين أي تلميذ
    const anyProgressChanged = students.some(student => {
       const initialStudent = initialAdminStudents.find(s => s.id === student.id);
       return initialStudent && JSON.stringify(student.progress) !== JSON.stringify(initialStudent.progress);
    });

    const updatedStudents = students.map(student => {
      // إذا لم يتم تعديل التمارين، نحتفظ بالمؤشرات الحالية ولا نصفرها
      if (!anyProgressChanged) {
         return student;
      }

      // إذا تم تعديل التمارين، نقوم بتحديث المؤشرات والأسهم بشكل طبيعي
      const oldRank = sessionStartRanks[student.id] || newRanks[student.id];
      const oldTotal = sessionStartScores[student.id] !== undefined ? sessionStartScores[student.id] : calculateTotal(student.progress);
      const newTotal = calculateTotal(student.progress);
      const trend = oldRank - newRanks[student.id];
      const recentProgress = newTotal - oldTotal;
      let fireBadgeUntil = student.fireBadgeUntil || null;
      let lightningBadgeUntil = student.lightningBadgeUntil || null;

      if (trend > 5) fireBadgeUntil = nowTime + twoDays; 
      else if (trend < 0) fireBadgeUntil = null;
      if (recentProgress >= 10) lightningBadgeUntil = nowTime + twoDays;

      return { ...student, trend, recentProgress, fireBadgeUntil, lightningBadgeUntil };
    });

    setStudents(updatedStudents);

    if (user && db) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', 'v3');
      const annRef = doc(db, 'artifacts', appId, 'public', 'data', 'announcements', 'current');
      try {
        await setDoc(docRef, { students: updatedStudents });
        await setDoc(annRef, { text: adminAnnText, isActive: adminAnnActive, hasLink: adminAnnHasLink, linkText: adminAnnLinkText, linkUrl: adminAnnLinkUrl, hasDate: adminAnnHasDate, dateValue: adminAnnDateValue, id: Date.now().toString() });
      } catch (e) { console.error("Erreur de sauvegarde:", e); }
    }
    
    setIsSaving(false); setIsAdmin(false);
  };

  const handleCancelClick = () => setShowCancelConfirm(true); 
  const confirmCancel = () => { setStudents(initialAdminStudents); setIsAdmin(false); setShowCancelConfirm(false); };

  const toggleExercise = (studentId, lessonId, exNumber) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        let currentProg = s.progress[lessonId];
        if (typeof currentProg !== 'object' || currentProg === null) currentProg = {};
        const currentStatus = currentProg[exNumber] || 0;
        return { ...s, progress: { ...s.progress, [lessonId]: { ...currentProg, [exNumber]: (currentStatus + 1) % 4 } } };
      }
      return s;
    }));
  };

  const updateStudentName = (studentId, newName) => {
    setStudents(students.map(student => student.id === studentId ? { ...student, name: newName } : student));
  };

  const handleCardClick = (student, isCardExpanded) => {
    if (comparingStudent) {
      if (comparingStudent.id !== student.id) setVersusStudents([comparingStudent, student]);
      setComparingStudent(null); 
    } else setExpandedId(isCardExpanded ? null : student.id);
  };

  const startComparison = (student) => { setComparingStudent(student); setExpandedId(null); };

  const lessonStats = useMemo(() => {
    if (!students.length) return [];
    return LESSONS.map(lesson => {
      const totalExercisesDone = students.reduce((acc, student) => acc + getLessonScore(student.progress, lesson.id), 0);
      const maxPossibleExercises = students.length * lesson.total;
      const percentage = maxPossibleExercises > 0 ? (totalExercisesDone / maxPossibleExercises) * 100 : 0;
      return { ...lesson, totalExercisesDone, maxPossibleExercises, percentage };
    }).sort((a, b) => b.percentage - a.percentage); 
  }, [students]);

  // دالة لعرض زر الملاحظات في المنصة
  const renderPodiumRemarkBadge = (student) => {
    if (!student || student.isTie || student.isEmpty) return null;
    const sRemarks = remarksData[student.id] || [];
    const hasRecentRemarks = sRemarks.some(r => Date.now() - r.timestamp < THREE_DAYS_MS);
    if (!hasRecentRemarks) return null;
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); setViewRemarkStudent(student); }}
        className="text-[9px] bg-orange-100 text-orange-600 border border-orange-200 px-1.5 py-[1px] rounded flex items-center gap-1 font-bold animate-pulse shadow-sm ml-0.5 hover:bg-orange-200 transition-colors z-30 relative"
      >
        <i className="fa-solid fa-triangle-exclamation"></i> {sRemarks.length}
      </button>
    );
  };

  if (isAdmin) {
    return (
      <div dir="ltr" className="min-h-screen bg-gray-50 text-gray-800 pb-10 relative" style={{ fontFamily: "'Poppins', sans-serif", opacity: 0, animation: "fadeIn 1s forwards" }}>
        <style>{`
          @keyframes fadeIn { to { opacity: 1; } }
          @keyframes saveProgress { 0% { left: -100%; width: 50%; } 100% { left: 100%; width: 50%; } }
          .animate-save-progress { position: absolute; top: 0; bottom: 0; background-color: #22c55e; animation: saveProgress 1s infinite linear; }
          @keyframes icon-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
          .animate-icon-pulse { animation: icon-pulse 2s infinite ease-in-out; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bitcount&family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <AdminAddRemarkModal 
           isOpen={!!adminRemarkStudent} 
           student={adminRemarkStudent} 
           remarks={adminRemarkStudent ? remarksData[adminRemarkStudent.id] : []}
           onClose={() => setAdminRemarkStudent(null)} 
           onSave={handleSaveNewRemark}
           onDeleteRemark={handleDeleteRemark}
         />

        {showAdminStats && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in" onClick={() => setShowAdminStats(false)}>
            <div className="bg-gray-50 rounded-3xl w-full max-w-md h-[85vh] shadow-2xl relative flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-black text-purple-600 flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple"></i> Statistiques
                </h2>
                <button onClick={() => setShowAdminStats(false)} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
              <div className="bg-white px-4 py-3 shrink-0 shadow-sm z-10">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button onClick={() => setStatsTab('lessons')} className={`flex-1 py-2.5 rounded-lg font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm ${statsTab === 'lessons' ? 'bg-white text-purple-600' : 'bg-transparent text-gray-500 shadow-none hover:text-gray-700'}`}>
                    <i className="fa-solid fa-book-open"></i> Par Leçons
                  </button>
                  <button onClick={() => setStatsTab('visitors')} className={`flex-1 py-2.5 rounded-lg font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm ${statsTab === 'visitors' ? 'bg-white text-purple-600' : 'bg-transparent text-gray-500 shadow-none hover:text-gray-700'}`}>
                    <i className="fa-solid fa-users"></i> Visiteurs
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 smooth-scroll">
                {statsTab === 'lessons' && (
                  <div className="space-y-3">
                    {lessonStats.map((lesson, index) => (
                      <div key={lesson.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border shrink-0 ${index === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : index === 1 ? 'bg-slate-50 border-slate-200 text-slate-500' : index === 2 ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>{index + 1}</div>
                            <span className="font-bold text-gray-800 text-sm">{lesson.name}</span>
                          </div>
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg shrink-0" style={{ fontFamily: "'Lato', sans-serif" }}>
                            {lesson.totalExercisesDone} <span className="text-purple-300 text-[10px]">/ {lesson.maxPossibleExercises}</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex justify-start mt-2">
                          <div className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(lesson.percentage)}`} style={{ width: `${lesson.percentage}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center mt-2 px-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Taux de réussite</span>
                          <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "'Lato', sans-serif" }}>{lesson.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {statsTab === 'visitors' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-gray-300 font-medium text-sm flex items-center gap-2"><i className="fa-solid fa-satellite-dish"></i> En ligne maintenant</span>
                        <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div><span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Live</span>
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>{liveOnline}</span>
                        <span className="text-sm text-gray-400 font-medium mb-1.5">Élèves</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg mb-3"><i className="fa-solid fa-calendar-day"></i></div>
                        <div><span className="block text-2xl font-black text-gray-800" style={{ fontFamily: "'Lato', sans-serif" }}>{dailyVisits}</span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aujourd'hui</span></div>
                      </div>
                      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-lg mb-3"><i className="fa-solid fa-calendar-week"></i></div>
                        <div><span className="block text-2xl font-black text-gray-800" style={{ fontFamily: "'Lato', sans-serif" }}>{weeklyVisits}</span><span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Semaine</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="fixed top-0 left-0 w-full h-1.5 bg-green-100 z-[100] overflow-hidden"><div className="animate-save-progress"></div></div>
        )}

        {!showAdminStats && (
          <button onClick={() => setShowAdminStats(true)} className="fixed bottom-4 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-[0_4px_15px_rgba(147,51,234,0.4)] flex items-center justify-center transition-transform hover:scale-105 z-40 animate-icon-pulse" title="Voir les statistiques">
            <i className="fa-solid fa-chart-simple text-xl"></i>
          </button>
        )}

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500"><i className="fa-solid fa-triangle-exclamation text-xl"></i></div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Annuler les modifications ?</h2>
              <p className="text-xs text-gray-500 mb-6">Toutes les modifications non enregistrées seront perdues.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">Non</button>
                <button onClick={confirmCancel} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200">Oui, annuler</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
          <div className="max-w-md mx-auto px-4 py-4">
            {/* Header Mini Actions */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-black text-purple-600 flex items-center gap-2">
                <i className="fa-solid fa-user-shield"></i> Espace Prof
              </h1>
              <div className="flex items-center gap-2">
                <button onClick={handleCancelClick} disabled={isSaving} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50" title="Annuler">
                   <i className="fa-solid fa-xmark text-lg"></i>
                </button>
                <button onClick={handleSaveAdmin} disabled={isSaving} className="w-10 h-10 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50" title="Enregistrer">
                   <i className="fa-solid fa-floppy-disk text-lg"></i>
                </button>
                <button onClick={() => { localStorage.removeItem('optimaAdminMode'); setIsAdmin(false); }} className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors ml-1" title="Se déconnecter">
                  <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
                </button>
              </div>
            </div>

            {/* Collapsible Annonce */}
            <div className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2"><i className="fa-solid fa-bullhorn"></i> Annonce Publique</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={adminAnnActive} onChange={(e) => setAdminAnnActive(e.target.checked)} />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
              {adminAnnActive && (
                <div className="mt-3 animate-fade-in">
                  <textarea value={adminAnnText} onChange={(e) => setAdminAnnText(e.target.value)} placeholder="Écrivez votre message ici..." className="w-full h-20 px-3 py-2 rounded-xl border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 mb-2 resize-none"></textarea>
                  <div className="space-y-3">
                     <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-purple-100">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700"><i className="fa-regular fa-calendar text-purple-500 mr-1"></i> Date spécifique</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={adminAnnHasDate} onChange={(e) => setAdminAnnHasDate(e.target.checked)} />
                            <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                       </div>
                       {adminAnnHasDate && <input type="date" value={adminAnnDateValue} onChange={e => setAdminAnnDateValue(e.target.value)} className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-purple-300 text-gray-700" />}
                     </div>
                     <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-purple-100">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700"><i className="fa-solid fa-link text-purple-500 mr-1"></i> Bouton (Lien)</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={adminAnnHasLink} onChange={(e) => setAdminAnnHasLink(e.target.checked)} />
                            <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                       </div>
                       {adminAnnHasLink && (
                          <div className="flex flex-col gap-2 mt-1">
                             <input type="text" placeholder="Texte du bouton" value={adminAnnLinkText} onChange={e => setAdminAnnLinkText(e.target.value)} className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-purple-300 text-gray-700" />
                             <input type="url" placeholder="URL du lien" value={adminAnnLinkUrl} onChange={e => setAdminAnnLinkUrl(e.target.value)} className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-purple-300 text-gray-700" />
                          </div>
                       )}
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><i className="fa-solid fa-magnifying-glass text-lg"></i></div>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un élève..." className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all text-sm outline-none" />
              </div>
              <button onClick={refreshAdminSort} className="w-14 bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 rounded-xl flex items-center justify-center transition-colors shadow-sm" title="Actualiser l'ordre"><i className="fa-solid fa-rotate text-lg"></i></button>
              <button onClick={() => setAdminSortDesc(!adminSortDesc)} className="w-14 bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors shadow-sm" title="Trier"><i className={`fa-solid ${adminSortDesc ? 'fa-sort-amount-down' : 'fa-sort-amount-up'} text-lg`}></i></button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 mt-2">
          {filteredAdminStudents.length === 0 ? (
            <div className="text-center py-10 text-gray-400"><i className="fa-solid fa-magnifying-glass-minus text-4xl mb-2 opacity-50"></i><p>Aucun élève trouvé</p></div>
          ) : (
            <div className="space-y-3">
              {filteredAdminStudents.map(student => {
                const isExpanded = adminExpandedId === student.id;
                const total = calculateTotal(student.progress);
                const completedLessonsCount = calculateCompletedLessons(student.progress);
                const sRemarks = remarksData[student.id] || [];

                return (
                  <div key={`admin-${student.id}`} className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-colors ${isExpanded ? 'border-purple-300 ring-1 ring-purple-100' : 'border-gray-100'}`}>
                    <div className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50" onClick={() => { setAdminExpandedId(isExpanded ? null : student.id); setAdminActiveLesson(null); }}>
                      <div className="flex-1 mr-2 flex items-center min-w-0">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-50 border border-gray-200 text-gray-500 font-bold text-xs mr-3 shadow-sm shrink-0" style={{ fontFamily: "'Lato', sans-serif" }}>{student.rank}</div>
                        <div className="flex-1 min-w-0 text-left">
                          <input type="text" value={student.name} onChange={(e) => updateStudentName(student.id, e.target.value)} onClick={(e) => e.stopPropagation()} className="font-bold text-gray-800 text-sm w-full bg-transparent border-b border-dashed border-gray-300 focus:border-solid focus:border-purple-500 focus:outline-none transition-colors pb-0.5 truncate text-left" title="Modifier le nom de l'élève" />
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold ${getScoreColorText(total)}`} style={{ fontFamily: "'Lato', sans-serif" }}>{total}/94 Ex (Validés)</span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs font-bold text-yellow-500" style={{ fontFamily: "'Lato', sans-serif" }}>{completedLessonsCount} <i className="fa-solid fa-star text-[10px]"></i></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button onClick={(e) => { e.stopPropagation(); setAdminRemarkStudent(student); }} className="relative w-8 h-8 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors border border-orange-200 shadow-sm shrink-0" title="Gérer les remarques">
                           <i className="fa-solid fa-triangle-exclamation"></i>
                           {sRemarks.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{sRemarks.length}</span>}
                        </button>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${isExpanded ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                          <i className={`fa-solid fa-pen text-sm transition-transform ${isExpanded ? 'scale-110' : ''}`}></i>
                        </div>
                      </div>
                    </div>

                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out bg-gray-50/50 ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-t border-purple-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-3 space-y-2">
                          {LESSONS.map(lesson => {
                            const isLessonExp = adminActiveLesson === `${student.id}-${lesson.id}`;
                            const correctScore = getLessonScore(student.progress, lesson.id);
                            return (
                              <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div onClick={() => setAdminActiveLesson(isLessonExp ? null : `${student.id}-${lesson.id}`)} className="p-3 flex justify-between items-center cursor-pointer active:bg-gray-50 hover:bg-gray-50/50 transition-colors">
                                  <span className="text-[11px] font-bold text-gray-700 flex items-center gap-2"><span className="text-sm">{lesson.icon}</span> {lesson.name}</span>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${correctScore === lesson.total ? 'bg-green-100 text-green-700' : 'bg-purple-50 text-purple-600'}`} style={{ fontFamily: "'Lato', sans-serif" }}>{correctScore} / {lesson.total}</span>
                                    <i className={`fa-solid fa-chevron-down text-gray-400 text-xs transition-transform ${isLessonExp ? 'rotate-180' : ''}`}></i>
                                  </div>
                                </div>
                                {isLessonExp && (
                                  <div className="p-3 border-t border-gray-100 bg-gray-50/30 grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {Array.from({ length: lesson.total }).map((_, i) => {
                                      const exNum = i + 1;
                                      let currentProg = student.progress[lesson.id];
                                      if (typeof currentProg !== 'object' || currentProg === null) currentProg = {};
                                      const currentStatus = currentProg[exNum] || 0;
                                      let iconClass = "fa-regular fa-circle text-gray-300"; let bgBtnClass = "bg-white border-gray-200";
                                      if (currentStatus === 1) { iconClass = "fa-solid fa-circle-check text-green-500"; bgBtnClass = "bg-green-50 border-green-200"; } 
                                      else if (currentStatus === 2) { iconClass = "fa-solid fa-circle-minus text-blue-500"; bgBtnClass = "bg-blue-50 border-blue-200"; } 
                                      else if (currentStatus === 3) { iconClass = "fa-solid fa-circle-xmark text-red-500"; bgBtnClass = "bg-red-50 border-red-200"; }
                                      return (
                                        <button key={exNum} onClick={() => toggleExercise(student.id, lesson.id, exNum)} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border shadow-sm transition-transform active:scale-90 hover:shadow-md ${bgBtnClass}`}>
                                          <span className="text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontFamily: "'Lato', sans-serif" }}>Ex {exNum}</span>
                                          <i className={`${iconClass} text-lg drop-shadow-sm`}></i>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir="ltr" className={`min-h-screen text-gray-800 relative transition-colors duration-500 ${isVersusMode ? 'bg-red-50' : 'bg-purple-50'}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @keyframes shine-text { 0% { background-position: -100% center; } 100% { background-position: 200% center; } }
        .shining-trophy { background: linear-gradient(110deg, #eab308 35%, rgba(255,255,255,0.3) 50%, #eab308 65%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shine-text 3s linear infinite; }
        @keyframes gradientFlow { 0% { background-position: 200% center; } 100% { background-position: 0% center; } }
        .animate-gradient-x { background-size: 200% auto; animation: gradientFlow 3s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .smooth-scroll { -webkit-overflow-scrolling: touch; }
        @keyframes icon-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .animate-icon-pulse { animation: icon-pulse 2s infinite ease-in-out; }
        @keyframes float-modal { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-4px) scale(1.01); } }
        .animate-float-modal { animation: float-modal 4s ease-in-out infinite; }
      `}</style>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bitcount&family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <RemarksViewerModal 
         isOpen={!!viewRemarkStudent}
         remarks={viewRemarkStudent ? (remarksData[viewRemarkStudent.id] || []) : []}
         onClose={() => setViewRemarkStudent(null)}
         studentName={viewRemarkStudent?.name}
      />

      {showAnnouncement && announcement && announcement.isActive && !isAdmin && !isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
          <div className="p-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 animate-gradient-x rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="bg-white rounded-[22px] p-6 relative overflow-hidden text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
              
              <div className="flex items-center justify-center gap-3 mb-5">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 animate-gradient-x">Annonce</h2>
              </div>

              {announcement.hasDate && announcement.dateValue && (
                <div className="mb-6 flex justify-center">
                  {(() => {
                    const targetDate = new Date(announcement.dateValue);
                    const year = targetDate.getFullYear();
                    const month = targetDate.getMonth();
                    const targetDay = targetDate.getDate();
                    
                    const today = new Date();
                    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
                    const currentDay = today.getDate();
                    
                    const firstDay = new Date(year, month, 1).getDay();
                    const startDay = firstDay === 0 ? 6 : firstDay - 1; 
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const daysInPrevMonth = new Date(year, month, 0).getDate();

                    let days = [];
                    for (let i = startDay - 1; i >= 0; i--) days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
                    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, isCurrentMonth: true, isTarget: i === targetDay, isToday: isCurrentMonth && i === currentDay });
                    const remaining = 42 - days.length;
                    for (let i = 1; i <= remaining; i++) days.push({ day: i, isCurrentMonth: false });
                    if (days.length > 35 && days.slice(35).every(d => !d.isCurrentMonth)) days = days.slice(0, 35);

                    return (
                      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm p-5 w-64 text-left">
                         <div className="flex items-center justify-center mb-5 px-1">
                            <div className="font-bold text-sm text-gray-800 capitalize" style={{ fontFamily: "'Lato', sans-serif" }}>
                               {targetDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </div>
                         </div>
                         <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center mb-3">
                           {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
                              <span key={day} className="text-[11px] font-bold text-gray-400">{day}</span>
                           ))}
                         </div>
                         <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                           {days.map((d, idx) => {
                              let className = "w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold mx-auto transition-colors ";
                              if (!d.isCurrentMonth) className += "text-gray-300 ";
                              else if (d.isTarget) className += "bg-red-500 text-white shadow-md shadow-red-200 ";
                              else if (d.isToday) className += "border-2 border-purple-500 text-purple-600 bg-purple-50 ";
                              else className += "text-gray-700 hover:bg-gray-100 ";
                              return <div key={idx} className={className} style={{ fontFamily: "'Lato', sans-serif" }}>{d.day}</div>;
                           })}
                         </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <div className="bg-purple-50/80 rounded-2xl p-4 mb-6 border-2 border-purple-500 shadow-sm">
                 <p className="text-sm text-purple-900 leading-relaxed whitespace-pre-wrap font-medium italic">
                   {announcement.text}
                 </p>
              </div>

              <div className="flex flex-col gap-2">
                {announcement.hasLink && announcement.linkUrl && (
                  <a 
                    href={announcement.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleDismissAnnouncement} 
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x text-white rounded-xl font-bold text-sm shadow-md shadow-purple-500/30 hover:opacity-90 transition-opacity flex justify-center items-center gap-2 active:scale-95 animate-float-modal"
                  >
                    {announcement.linkText || 'Ouvrir le lien'} <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                  </a>
                )}
                <button 
                  onClick={handleDismissAnnouncement}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-opacity active:scale-95 flex justify-center items-center ${announcement.hasLink ? 'bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100' : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 animate-gradient-x text-white shadow-md shadow-purple-500/30 hover:opacity-90 animate-float-modal'}`}
                >
                  {announcement.hasLink ? 'Fermer' : "C'est compris"}
                </button>
                <button onClick={handleDontShowAgain} className="text-xs text-gray-400 hover:text-purple-600 transition-colors mt-2 underline underline-offset-4 decoration-gray-300 hover:decoration-purple-400">
                  Ne plus afficher cette annonce
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GroupRaceModal isOpen={showGroupRace} students={students} onClose={() => setShowGroupRace(false)} />
      <VersusModal students={versusStudents} onClose={() => setVersusStudents(null)} />

      <div className={`fixed inset-0 z-[100] bg-[#fafafa] flex flex-col items-center justify-center transition-opacity duration-700 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <img src="https://i.pinimg.com/originals/54/58/a1/5458a14ae4c8f07055b7441ff0f234cf.gif" alt="Chargement..." className="w-32 h-32 object-contain" />
      </div>

      <a href="https://drive.google.com/file/d/12D8ImLEhlVuzSV25-1fH9z7sfEsYn0ps/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-[0_4px_15px_rgba(147,51,234,0.4)] flex items-center justify-center transition-transform hover:scale-105 z-40 animate-icon-pulse" title="Ouvrir le livre d'exercices">
        <i className="fa-solid fa-book text-xl"></i>
      </a>

      {/* التعديل الثاني: استخدام زر القفل وإخفاؤه في حال كان جاري التحميل */}
      <button 
        onClick={handleLockClick} 
        disabled={isLoading}
        className={`fixed bottom-4 left-4 text-gray-400 opacity-20 hover:opacity-100 transition-opacity p-2 z-40 animate-icon-pulse ${isLoading ? 'hidden' : ''}`}
      >
        <i className="fa-solid fa-lock text-base"></i>
      </button>

      {showLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-sm shadow-2xl relative">
            <button onClick={() => { setShowLogin(false); setLoginError(false); setPassword(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-500"><i className="fa-solid fa-shield-halved text-xl"></i></div>
              <h2 className="text-lg font-bold text-gray-800">Accès Restreint</h2>
              <p className="text-xs text-gray-500 mt-1">Veuillez entrer votre mot de passe</p>
            </div>
            <form onSubmit={handleLogin}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe..." className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-center mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${loginError ? 'border-red-400 text-red-500' : 'border-gray-200'}`} autoFocus />
              <button type="submit" className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition-colors shadow-sm shadow-purple-200">Valider</button>
            </form>
          </div>
        </div>
      )}

      <div ref={headerRef} className="max-w-md mx-auto px-4 pt-3 pb-0">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center text-center mb-4">
            <img src="/logo.png" alt="Optimaths Logo" className="h-20 md:h-24 object-contain mb-1 transition-transform hover:scale-105" />
            <div className="flex gap-2 mt-2">
              <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1.5 uppercase tracking-widest border border-green-100 shadow-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>{liveOnline} en ligne
              </div>
              <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1.5 uppercase tracking-widest border border-blue-100 shadow-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                <i className="fa-solid fa-eye text-[11px]"></i>{dailyVisits} visite{dailyVisits > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-50 pt-5">
            <div className="text-center mb-4 flex items-center justify-center gap-2">
              <i className="fa-regular fa-calendar-check text-purple-400"></i>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Examen Régional • 24 Juin 08:00</span>
            </div>
            <div className="flex justify-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">{timeLeft.days}</div>
                <span className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-wider">Jours</span>
              </div>
              <span className="text-2xl font-bold text-purple-200 mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <span className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-wider">Hrs</span>
              </div>
              <span className="text-2xl font-bold text-purple-200 mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <span className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-wider">Min</span>
              </div>
              <span className="text-2xl font-bold text-purple-200 mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <span className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-wider">Sec</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 h-[100dvh] flex flex-col max-w-md mx-auto z-30">
        <div className={`shrink-0 pt-3 pb-3 px-4 relative z-40 transition-colors duration-500 ${isVersusMode ? 'bg-red-50' : 'bg-purple-50'}`}>
          <div className={`bg-white rounded-3xl p-4 shadow-sm border relative transition-colors duration-500 ${comparingStudent ? 'border-red-200' : 'border-gray-100'}`}>
            
            {podiumSpots.length > 0 && (
              <>
                <div className="flex justify-center items-end h-[330px] pt-12 relative">
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 text-purple-600 px-4 py-1.5 rounded-full text-sm font-black flex items-center justify-center gap-3 whitespace-nowrap z-20 transition-all duration-300 ${isSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                    <span>{timeLeft.days} <span className="text-[10px] text-purple-400 uppercase ml-0.5">Jrs</span></span>
                    <span className="text-purple-300">•</span>
                    <span>{timeLeft.hours.toString().padStart(2,'0')} <span className="text-[10px] text-purple-400 uppercase ml-0.5">Hrs</span></span>
                    <span className="text-purple-300">•</span>
                    <span>{timeLeft.minutes.toString().padStart(2,'0')} <span className="text-[10px] text-purple-400 uppercase ml-0.5">Min</span></span>
                    <span className="text-purple-300">•</span>
                    <span>{timeLeft.seconds.toString().padStart(2,'0')} <span className="text-[10px] text-purple-400 uppercase ml-0.5">Sec</span></span>
                  </div>

                  {/* Rang 2 */}
                  {podiumSpots[1] && (
                  <div className={`w-24 flex flex-col items-center transition-transform duration-200 cursor-pointer ${expandedId === podiumSpots[1].id ? 'scale-105' : ''}`} onClick={() => { if(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) handleCardClick(podiumSpots[1], expandedId === podiumSpots[1].id) }}>
                    <div className="mb-1">{(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? <PodiumMedal rank={podiumSpots[1].rank} defaultIcon="fa-solid fa-medal text-2xl text-slate-400" /> : <i className="fa-solid fa-medal text-2xl text-slate-200"></i>}</div>
                    <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[1].isTie || podiumSpots[1].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[1].isTie || podiumSpots[1].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[1])}</div>
                  {(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1 mt-1 w-full px-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>{calculateCompletedLessons(podiumSpots[1].progress)}</span>
                          <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                          {renderPodiumRemarkBadge(podiumSpots[1])}
                        </div>
                        <div className="flex items-center gap-1">
                          {podiumSpots[1].fireBadgeUntil && podiumSpots[1].fireBadgeUntil > Date.now() && <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '11px' }}></i>}
                          {podiumSpots[1].lightningBadgeUntil && podiumSpots[1].lightningBadgeUntil > Date.now() && <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '11px' }}></i>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full shadow-sm ${getScoreColorBadge(calculateTotal(podiumSpots[1].progress))}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}>{calculateTotal(podiumSpots[1].progress)}/94</span>
                        {podiumSpots[1].recentProgress ? <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">{podiumSpots[1].recentProgress > 0 ? '+' : ''}{podiumSpots[1].recentProgress}</div> : null}
                      </div>
                    </>
                  ) : <div className="h-[46px] w-full"></div>}
                  <div className={`w-full h-28 rounded-t-xl flex items-start justify-center pt-3 text-white font-black text-2xl relative overflow-hidden transition-colors ${expandedId === podiumSpots[1].id ? 'bg-[#059669]' : 'bg-gradient-to-t from-[#10b981] to-[#34d399]'}`}>
                      <div className="flex items-center gap-1 z-10">
                        <span>{podiumSpots[1].rank}</span>
                        {(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) && podiumSpots[1].trend > 0 && <span className="text-[12px] text-green-100 flex items-center gap-0.5"><i className="fa-solid fa-caret-up"></i> {podiumSpots[1].trend}</span>}
                        {(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) && podiumSpots[1].trend < 0 && <span className="text-[12px] text-red-100 flex items-center gap-0.5"><i className="fa-solid fa-caret-down"></i> {Math.abs(podiumSpots[1].trend)}</span>}
                      </div>
                      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    </div>
                  </div>
                  )}
                  
                  {/* Rang 1 */}
                  {podiumSpots[0] && (
                  <div className={`w-[110px] flex flex-col items-center z-10 transition-transform duration-200 mx-[-4px] cursor-pointer ${expandedId === podiumSpots[0].id ? 'scale-105' : ''}`} onClick={() => { if(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) handleCardClick(podiumSpots[0], expandedId === podiumSpots[0].id) }}>
                    <div className="mb-1">{(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? <PodiumMedal rank={podiumSpots[0].rank} defaultIcon="fa-solid fa-trophy text-3xl text-yellow-500" /> : <i className="fa-solid fa-trophy text-3xl text-purple-200/50 drop-shadow-sm"></i>}</div>
                    <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[0].isTie || podiumSpots[0].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[0].isTie || podiumSpots[0].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[0])}</div>
                  {(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1 mt-1 w-full px-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>{calculateCompletedLessons(podiumSpots[0].progress)}</span>
                          <i className="fa-solid fa-star text-yellow-400 text-[11px]"></i>
                          {renderPodiumRemarkBadge(podiumSpots[0])}
                        </div>
                        <div className="flex items-center gap-1">
                          {podiumSpots[0].fireBadgeUntil && podiumSpots[0].fireBadgeUntil > Date.now() && <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '12px' }}></i>}
                          {podiumSpots[0].lightningBadgeUntil && podiumSpots[0].lightningBadgeUntil > Date.now() && <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '12px' }}></i>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        <span className={`text-xs px-3 py-1 rounded-full shadow-sm ${getScoreColorBadge(calculateTotal(podiumSpots[0].progress))}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}>{calculateTotal(podiumSpots[0].progress)}/94</span>
                        {podiumSpots[0].recentProgress ? <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">{podiumSpots[0].recentProgress > 0 ? '+' : ''}{podiumSpots[0].recentProgress}</div> : null}
                      </div>
                    </>
                  ) : <div className="h-[46px] w-full"></div>}
                  <div className={`w-full h-36 rounded-t-xl flex items-start justify-center pt-3 text-white font-black text-3xl relative overflow-hidden transition-colors ${expandedId === podiumSpots[0].id ? 'bg-purple-900' : 'bg-gradient-to-t from-purple-600 to-purple-500'}`}>
                      <div className="flex items-center gap-1 z-10">
                        <span>{podiumSpots[0].rank}</span>
                        {(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) && podiumSpots[0].trend > 0 && <span className="text-[14px] text-green-300 flex items-center gap-0.5"><i className="fa-solid fa-caret-up"></i> {podiumSpots[0].trend}</span>}
                        {(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) && podiumSpots[0].trend < 0 && <span className="text-[14px] text-red-200 flex items-center gap-0.5"><i className="fa-solid fa-caret-down"></i> {Math.abs(podiumSpots[0].trend)}</span>}
                      </div>
                      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    </div>
                  </div>
                  )}

                  {/* Rang 3 */}
                  {podiumSpots[2] && (
                  <div className={`w-24 flex flex-col items-center transition-transform duration-200 cursor-pointer ${expandedId === podiumSpots[2].id ? 'scale-105' : ''}`} onClick={() => { if(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) handleCardClick(podiumSpots[2], expandedId === podiumSpots[2].id) }}>
                    <div className="mb-1">{(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) ? <PodiumMedal rank={podiumSpots[2].rank} defaultIcon="fa-solid fa-medal text-2xl text-amber-600" /> : <i className="fa-solid fa-medal text-2xl text-slate-200"></i>}</div>
                    <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[2].isTie || podiumSpots[2].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[2].isTie || podiumSpots[2].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[2])}</div>
                  {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1 mt-1 w-full px-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>{calculateCompletedLessons(podiumSpots[2].progress)}</span>
                          <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                          {renderPodiumRemarkBadge(podiumSpots[2])}
                        </div>
                        <div className="flex items-center gap-1">
                          {podiumSpots[2].fireBadgeUntil && podiumSpots[2].fireBadgeUntil > Date.now() && <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '11px' }}></i>}
                          {podiumSpots[2].lightningBadgeUntil && podiumSpots[2].lightningBadgeUntil > Date.now() && <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '11px' }}></i>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full shadow-sm ${getScoreColorBadge(calculateTotal(podiumSpots[2].progress))}`} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}>{calculateTotal(podiumSpots[2].progress)}/94</span>
                        {podiumSpots[2].recentProgress ? <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">{podiumSpots[2].recentProgress > 0 ? '+' : ''}{podiumSpots[2].recentProgress}</div> : null}
                      </div>
                    </>
                  ) : <div className="h-[46px] w-full"></div>}
                  <div className={`w-full h-24 rounded-t-xl flex items-start justify-center pt-3 text-white font-black text-2xl relative overflow-hidden transition-colors ${expandedId === podiumSpots[2].id ? 'bg-[#c72d3d]' : 'bg-gradient-to-t from-[#e83e4e] to-[#ee6976]'}`}>
                      <div className="flex items-center gap-1 z-10">
                        <span>{podiumSpots[2].rank}</span>
                        {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) && podiumSpots[2].trend > 0 && <span className="text-[12px] text-green-300 flex items-center gap-0.5"><i className="fa-solid fa-caret-up"></i> {podiumSpots[2].trend}</span>}
                        {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) && podiumSpots[2].trend < 0 && <span className="text-[14px] text-red-200 flex items-center gap-0.5"><i className="fa-solid fa-caret-down"></i> {Math.abs(podiumSpots[2].trend)}</span>}
                      </div>
                      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    </div>
                  </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-0 w-full flex justify-center z-30 pointer-events-auto">
                   <button onClick={() => setShowGroupRace(true)} className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-gradient-x text-white hover:opacity-90 px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition-transform active:scale-95 z-50 shadow-md" title="Voir la course des groupes">
                     <i className="fa-solid fa-flag-checkered text-lg animate-pulse"></i> Bataille des Groupes
                   </button>
                </div>

                <div className="w-full relative z-50">
                  {podiumSpots.filter(s => !s.isTie && !s.isEmpty).map(student => (
                    <div key={`podium-${student.id}`} className={`absolute top-0 left-0 w-full grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${expandedId === student.id ? 'grid-rows-[1fr] opacity-100 pointer-events-auto' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                      <div className="overflow-hidden">
                        <ProgressDetails student={student} isPodium={true} onCompare={() => startComparison(student)} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {comparingStudent && (
              <div className="absolute -bottom-5 left-0 w-full flex justify-center z-50 pointer-events-none">
                <div className="bg-red-500 text-white px-5 py-3 rounded-full shadow-lg shadow-red-500/30 flex items-center gap-3 animate-fade-in whitespace-nowrap border-2 border-white pointer-events-auto">
                  <span className="text-xs font-normal">Sélectionnez le rival de <b className="text-yellow-300 font-bold ml-1">{comparingStudent.name.split(' ')[0]}</b>...</span>
                  <button onClick={() => setComparingStudent(null)} className="ml-1 w-6 h-6 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col px-4 pb-4 min-h-0 transition-colors duration-500 ${isVersusMode ? 'bg-red-50' : 'bg-purple-50'}`}>
          <div className={`bg-white rounded-3xl py-4 flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${comparingStudent ? 'border-2 border-red-500 shadow-lg shadow-red-500/20' : 'shadow-sm border border-gray-100'}`}>
            <div className="flex-1 overflow-y-auto px-4 no-scrollbar smooth-scroll" onScroll={handleListScroll}>
              {others.slice(0, visibleCount).map((student) => {
                const total = calculateTotal(student.progress);
                const isExpanded = expandedId === student.id;
                const completedLessonsCount = calculateCompletedLessons(student.progress);
                const isZero = total === 0;
                const isCurrentlyComparing = comparingStudent && comparingStudent.id === student.id;
                
                const studentRemarks = remarksData[student.id] || [];
                const hasRecentRemarks = studentRemarks.some(r => Date.now() - r.timestamp < THREE_DAYS_MS);

                const nowTime = Date.now();
                const hasFire = student.fireBadgeUntil && student.fireBadgeUntil > nowTime;
                const hasLightning = student.lightningBadgeUntil && student.lightningBadgeUntil > nowTime;
                const hasBoth = hasFire && hasLightning;

                let rankBadgeColor = 'bg-gray-50 border-gray-200 text-gray-700'; 
                if (isCurrentlyComparing) rankBadgeColor = 'bg-red-50 border-red-200 text-red-400';
                else if (student.trend > 0) rankBadgeColor = 'bg-green-100 border-green-200 text-green-700'; 
                else if (student.trend < 0) rankBadgeColor = 'bg-red-100 border-red-200 text-red-700'; 
                else if (isZero) rankBadgeColor = 'bg-gray-100 border-red-200 text-red-400';

                let wrapperClass = "mb-3 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ";
                let innerClass = "rounded-2xl overflow-hidden bg-white ";

                if (isCurrentlyComparing) {
                  wrapperClass += "border-2 border-dashed border-red-300 opacity-50 shadow-none hover:shadow-none ";
                  innerClass = "rounded-2xl overflow-hidden bg-red-50/50 cursor-not-allowed ";
                } else if (hasBoth) wrapperClass += "p-[1px] bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-gradient-x";
                else if (hasFire) wrapperClass += "p-[1px] bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-gradient-x";
                else if (hasLightning) wrapperClass += "p-[1px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-gradient-x";
                else {
                  wrapperClass += "border " + (isZero ? "border-red-200 opacity-95 bg-gray-50" : "border-gray-100 hover:border-purple-200 bg-white");
                  if (isZero) innerClass = "rounded-2xl overflow-hidden bg-gray-50 ";
                }

                const nameClass = `font-bold text-sm pb-0.5 text-left ${isCurrentlyComparing ? 'text-red-400' : hasBoth ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-gradient-x' : hasFire ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-gradient-x' : hasLightning ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-gradient-x' : isZero ? 'text-gray-400' : 'text-gray-800'}`;

                return (
                  <div key={student.id} className={wrapperClass}>
                    <div className={innerClass}>
                      <div className={`flex items-center justify-between p-3 ${isCurrentlyComparing ? 'cursor-not-allowed' : 'cursor-pointer active:bg-gray-50'}`} onClick={() => { if (!isCurrentlyComparing) handleCardClick(student, isExpanded); }}>
                        <div className="flex items-center gap-3 w-full pr-2 min-w-0">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border font-black shadow-sm text-sm transition-colors shrink-0 ${rankBadgeColor}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                            {isCurrentlyComparing ? <i className="fa-solid fa-lock text-xs"></i> : student.rank}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col items-start text-left">
                            <h3 className={`${nameClass} truncate w-full flex items-center gap-2`} title={student.name}>
                              <span className="truncate">{student.name}</span>
                              <GroupBadge group={student.group} isList={true} />
                            </h3>
                            
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {student.trend > 0 && <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-md text-[10px] font-bold"><span style={{ fontFamily: "'Lato', sans-serif" }}>{student.trend}</span> <i className="fa-solid fa-caret-up text-[10px]"></i></div>}
                              {student.trend < 0 && <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-bold"><span style={{ fontFamily: "'Lato', sans-serif" }}>{Math.abs(student.trend)}</span> <i className="fa-solid fa-caret-down text-[10px]"></i></div>}
                              {student.trend === 0 && <div className="flex items-center justify-center px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md text-[10px] font-bold">-</div>}
                              <div className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${completedLessonsCount > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                                <span style={{ fontFamily: "'Lato', sans-serif" }}>{completedLessonsCount}</span> <i className="fa-solid fa-star text-[9px]"></i>
                              </div>
                              {student.recentProgress ? <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm" style={{ fontFamily: "'Lato', sans-serif" }}>+{student.recentProgress}</div> : null}
                              
                              {hasRecentRemarks && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setViewRemarkStudent(student); }}
                                  className="text-[10px] bg-orange-100 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold animate-pulse shadow-sm ml-auto shrink-0 z-10 hover:bg-orange-200 transition-colors"
                                >
                                  <i className="fa-solid fa-triangle-exclamation"></i> {studentRemarks.length}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 mr-1 shrink-0">
                            {hasFire && <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '14px' }} title="Avancé de plus de 5 rangs !"></i>}
                            {hasLightning && <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '14px' }} title="10 exercices ou plus complétés !"></i>}
                          </div>
                          <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0 ${getScoreColorBadge(total)}`} style={{ fontFamily: "'Lato', sans-serif" }}>{total}/94</div>
                          <div className="text-gray-400 flex items-center justify-center w-6 h-6 shrink-0"><i className={`fa-solid fa-chevron-down text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180 text-purple-500' : ''}`}></i></div>
                        </div>
                      </div>

                      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <ProgressDetails student={student} isPodium={false} onCompare={() => startComparison(student)} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
