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

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : MY_FIREBASE_CONFIG;

let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'optima-maths'; 

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
                const borderClass = isRecent ? 'border-orange-400 shadow-md shadow-orange-100' : 'border-gray-20
