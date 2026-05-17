import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, runTransaction } from 'firebase/firestore';

// Base de données des leçons
const LESSONS = [
  { id: 'eq', name: 'Équations et inéquations', total: 11, icon: '⚖️' },
  { id: 'vec', name: 'Vecteurs et translation', total: 19, icon: '↗️' },
  { id: 'geo', name: 'Géométrie analytique', total: 12, icon: '📐' },
  { id: 'sys', name: 'Systèmes', total: 13, icon: '🔗' },
  { id: 'fon', name: 'Fonctions', total: 12, icon: '📈' },
  { id: 'sta', name: 'Statistiques', total: 15, icon: '📊' },
  { id: 'esp', name: 'Géométrie dans l\'espace', total: 12, icon: '🧊' }
];

const now = Date.now();
const INITIAL_STUDENTS = [
  { id: 1, name: 'Ait El Fatimi Ghali', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 2, name: 'Ouzgoumouz Saad', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 3, name: 'Bouchehab Mohamed', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 4, name: 'Afgourne Hasna', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 5, name: 'Moussaoui Driss', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 6, name: 'Bourza Aya', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 7, name: 'Ennajibi Sara', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 8, name: 'Bouchfira Roumaissa', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 9, name: 'Ait Izzi Yahya', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 10, name: 'Azzab Yahya', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 11, name: 'Ben Loktib Larbi', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 12, name: 'Hassan Hajar', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 13, name: 'Errabhi Ayman', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 14, name: 'Ndali Reda', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 15, name: 'Kaarir Ouaiss', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 16, name: 'Kamrate Israe', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 17, name: 'Hamdi Fatima Ezzahra', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 18, name: 'Aid Yahya', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 19, name: 'Afgourne Amina', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 20, name: 'El Hamidi Anouar', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 21, name: 'Ait El Kias Amira', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 22, name: 'Lehbal Badr', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 23, name: 'Touil Zakaria', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 24, name: 'Mkder Rayane', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 25, name: 'Idahia Rayane', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 26, name: 'Khallal Mohsine', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 27, name: 'Mkder Ines', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 28, name: 'El Asfar Meryem', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 29, name: 'Belhouria Ali', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 30, name: 'Sass Lina', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 31, name: 'Benayd Mayssa', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 32, name: 'Mokri Jihane', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 33, name: 'Lemlioui Adam', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 34, name: 'Belkergour Hafsa', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 35, name: 'Bouchrahil Farah', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 36, name: 'Boussal Khadija', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 37, name: 'El Amrani Hafsa', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 38, name: 'El Mohtaker Amine', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 39, name: 'Ouassou Zineb', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 40, name: 'El Joudi Abdennour', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 41, name: 'El Abbassi Larbi', trend: 0, recentProgress: 0, progress: { eq: 0, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } }
];

const MY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBRtTxNNZ3ssU_FrKd9T67ai2agUIRh6PU",
  authDomain: "optima-3d020.firebaseapp.com",
  projectId: "optima-3d020",
  storageBucket: "optima-3d020.firebasestorage.app",
  messagingSenderId: "1069028732243",
  appId: "1:1069028732243:web:8da00b101fd4004e6285a6",
  measurementId: "G-H1VCM43BBQ"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : MY_FIREBASE_CONFIG;

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

const calculateTotal = (progress) => Object.values(progress).reduce((a, b) => a + b, 0);

const calculateCompletedLessons = (progress) => {
  return LESSONS.reduce((count, lesson) => count + (progress[lesson.id] === lesson.total ? 1 : 0), 0);
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

const renderPodiumName = (name) => {
  const parts = name.split(' ');
  if (parts.length === 1) return <span className="block truncate">{name}</span>;
  return (
    <>
      <span className="block truncate">{parts[0]}</span>
      <span className="block truncate">{parts.slice(1).join(' ')}</span>
    </>
  );
};

const getRankMap = (studentsList) => {
  const sorted = [...studentsList].sort((a, b) => calculateTotal(b.progress) - calculateTotal(a.progress));
  let currentRank = 1;
  const rankMap = {};
  sorted.forEach((student, index) => {
    if (index > 0 && calculateTotal(student.progress) < calculateTotal(sorted[index - 1].progress)) {
      currentRank = index + 1;
    }
    rankMap[student.id] = currentRank;
  });
  return rankMap;
};

const PodiumMedal = ({ rank, defaultIcon }) => {
  if (rank === 1) return (
    <div className="relative inline-flex items-center justify-center p-1">
      <i className="fa-solid fa-trophy text-4xl shining-trophy relative z-10"></i>
      <i className="fa-solid fa-sparkles absolute top-0 -right-2 text-yellow-100 text-sm animate-pulse z-20 drop-shadow-sm"></i>
    </div>
  );
  if (rank === 2) return <i className="fa-solid fa-medal text-2xl text-slate-400 drop-shadow-sm"></i>;
  if (rank === 3) return <i className="fa-solid fa-medal text-2xl text-amber-600 drop-shadow-sm"></i>;
  return <i className={defaultIcon}></i>;
};

// مكون التفاصيل مع مبيان الرادار البنفسجي والأرقام الملونة
const ProgressDetails = ({ student, isPodium = false, onCompare }) => {
  const [viewMode, setViewMode] = useState('list'); 

  if (!student || student.isTie || student.isEmpty) return null;

  const size = 200;
  const center = size / 2;
  const maxRadius = 70;

  const shortNames = {
    'eq': 'Équations', 'vec': 'Vecteurs', 'geo': 'Analytique',
    'sys': 'Systèmes', 'fon': 'Fonctions', 'sta': 'Statistiques', 'esp': 'Espace'
  };

  const radarData = LESSONS.map((lesson, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i / LESSONS.length);
    const value = (student.progress[lesson.id] || 0) / lesson.total;
    
    let anchor = "middle";
    const labelX = center + (maxRadius + 18) * Math.cos(angle);
    if (labelX < center - 10) anchor = "end";
    else if (labelX > center + 10) anchor = "start";

    let colorStr = "168, 85, 247"; 
    if (value >= 0.8) colorStr = "34, 197, 94"; 
    else if (value >= 0.4) colorStr = "245, 158, 11"; 
    else colorStr = "239, 68, 68"; 

    return {
      ...lesson,
      shortName: shortNames[lesson.id],
      value,
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

  return (
    <div className={`${isPodium ? 'bg-white rounded-2xl border border-purple-100 shadow-[0_15px_40px_rgba(147,51,234,0.15)] mt-2 overflow-hidden' : 'border-t border-gray-100 overflow-hidden rounded-b-2xl'}`}>
      
      <div className="relative w-full overflow-hidden bg-gray-50/50">
        <div 
          className="flex transition-transform duration-500 ease-in-out items-stretch" 
          style={{ width: '200%', transform: viewMode === 'radar' ? 'translateX(-50%)' : 'translateX(0)' }}
        >
          {/* الجانب الأيسر: اللائحة الملونة */}
          <div className="w-1/2 flex flex-col justify-center">
            {LESSONS.map((lesson, index) => {
              const completed = student.progress[lesson.id] || 0;
              const isFinished = completed === lesson.total;
              const bgClass = index % 2 === 0 ? 'bg-transparent' : 'bg-white';
              
              const value = completed / lesson.total;
              let textColorClass = "text-red-500";
              if (value >= 0.8) textColorClass = "text-green-500";
              else if (value >= 0.4) textColorClass = "text-orange-500";

              return (
                <div key={lesson.id} className={`flex justify-between items-center px-4 py-1.5 ${bgClass}`}>
                  <span className="text-gray-600 font-medium text-[11px] truncate mr-2">
                    {lesson.name}
                  </span>
                  <div className="flex items-center shrink-0 min-w-[40px] justify-end">
                    <span 
                      className={`text-[11px] font-bold ${textColorClass}`}
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      {completed}/{lesson.total}
                    </span>
                    <div className={`w-3 flex justify-end transition-opacity duration-300 ${isFinished ? 'opacity-100' : 'opacity-0'}`}>
                      <i className="fa-solid fa-star text-yellow-400 text-[9px]"></i>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-1/2 flex items-center justify-center py-2 px-1 bg-white/50 border-l border-gray-100">
            <div className="w-full max-w-[200px] aspect-square relative">
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible drop-shadow-sm">
                {renderGrid()}
                {radarData.map((d, i) => (
                  <line key={`axis-${i}`} x1={center} y1={center} x2={d.axisEndX} y2={d.axisEndY} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2 2" />
                ))}
                <polygon points={polygonPoints} fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="1.5" className="transition-all duration-700 ease-out" />
                {radarData.map((d, i) => (
                  <circle key={`dot-${i}`} cx={d.x} cy={d.y} r="2.5" fill="#fff" stroke="#a855f7" strokeWidth="1.5" />
                ))}
                {radarData.map((d, i) => (
                  <g key={`label-${i}`}>
                    <text x={d.labelX} y={d.labelY - 6} textAnchor={d.anchor} dominantBaseline="middle" fontSize="9" fontWeight="bold" fill="#4b5563">
                      {d.shortName}
                    </text>
                    <text x={d.labelX} y={d.labelY + 6} textAnchor={d.anchor} dominantBaseline="middle" fontSize="9" fontWeight="bold" fill={`rgb(${d.colorStr})`} style={{ fontFamily: "'Lato', sans-serif" }}>
                      {student.progress[d.id]}/{d.total}
                    </text>
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
          {viewMode === 'list' ? (
            <><i className="fa-solid fa-chart-pie text-[13px]"></i> Diagramme</>
          ) : (
            <><i className="fa-solid fa-list-ul text-[13px]"></i> Liste détaillée</>
          )}
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

// نافذة المقارنة الملحمية الرادار المزدوج (Versus Arena)
const VersusModal = ({ students, onClose }) => {
  const [viewMode, setViewMode] = useState('radar');

  if (!students || students.length !== 2) return null;
  const [s1, s2] = students;

  const size = 280;
  const center = size / 2;
  const maxRadius = 95;

  const shortNames = {
    'eq': 'Équations', 'vec': 'Vecteurs', 'geo': 'Analytique',
    'sys': 'Systèmes', 'fon': 'Fonctions', 'sta': 'Statistiques', 'esp': 'Espace'
  };

  const radarData = LESSONS.map((lesson, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i / LESSONS.length);
    const v1 = (s1.progress[lesson.id] || 0) / lesson.total;
    const v2 = (s2.progress[lesson.id] || 0) / lesson.total;

    let anchor = "middle";
    const labelX = center + (maxRadius + 22) * Math.cos(angle);
    if (labelX < center - 15) anchor = "end";
    else if (labelX > center + 15) anchor = "start";

    return {
      ...lesson,
      shortName: shortNames[lesson.id],
      x1: center + maxRadius * v1 * Math.cos(angle),
      y1: center + maxRadius * v1 * Math.sin(angle),
      x2: center + maxRadius * v2 * Math.cos(angle),
      y2: center + maxRadius * v2 * Math.sin(angle),
      labelX,
      labelY: center + (maxRadius + 15) * Math.sin(angle),
      axisEndX: center + maxRadius * Math.cos(angle),
      axisEndY: center + maxRadius * Math.sin(angle),
      anchor
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

  const nowTime = Date.now();
  const getStudentDecorations = (student) => {
    const hasFire = student.fireBadgeUntil && student.fireBadgeUntil > nowTime;
    const hasLightning = student.lightningBadgeUntil && student.lightningBadgeUntil > nowTime;
    const hasBoth = hasFire && hasLightning;
    const nameClass = `text-xs font-bold text-center leading-tight min-h-[32px] flex items-center justify-center flex-wrap px-1 ${
      hasBoth ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-gradient-x' :
      hasFire ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-gradient-x' :
      hasLightning ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-gradient-x' :
      'text-gray-800'
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
            
            {/* بيانات التلميذ الأول (البنفسجي) */}
            <div className="flex flex-col items-center w-[42%]">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xl mb-1.5 shadow-sm border-2 border-white relative">
                 {s1.rank}
                 <div className="absolute -bottom-1 w-full flex justify-center"><div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div></div>
              </div>
              <span className={s1Deco.nameClass}>{s1.name}</span>
              
              <div className="flex items-center justify-center gap-1.5 mt-1 w-full px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {calculateCompletedLessons(s1.progress)}
                  </span>
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
                  <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">
                    +{s1.recentProgress}
                  </div>
                ) : null}
              </div>
            </div>

            {/* أيقونة VS */}
            <div className="flex-1 flex justify-center pt-4 relative">
               <div className="absolute w-px h-16 bg-gray-100"></div>
               <div className="bg-white p-2 rounded-full z-10 shadow-sm border border-gray-50 mt-1">
                  <i className="fa-solid fa-bolt text-yellow-400 text-xl drop-shadow-sm"></i>
               </div>
            </div>

            {/* بيانات التلميذ الثاني (الأخضر) */}
            <div className="flex flex-col items-center w-[42%]">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black text-xl mb-1.5 shadow-sm border-2 border-white relative">
                 {s2.rank}
                 <div className="absolute -bottom-1 w-full flex justify-center"><div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div></div>
              </div>
              <span className={s2Deco.nameClass}>{s2.name}</span>
              
              <div className="flex items-center justify-center gap-1.5 mt-1 w-full px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {calculateCompletedLessons(s2.progress)}
                  </span>
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
                  <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px] font-bold shadow-sm">
                    +{s2.recentProgress}
                  </div>
                ) : null}
              </div>
            </div>

          </div>
        </div>

        {/* الحاوية المنزلقة للمقارنة */}
        <div className="relative w-full overflow-hidden bg-gray-50/50 rounded-2xl border border-gray-100">
          <div className="flex transition-transform duration-500 ease-in-out items-stretch" style={{ width: '200%', transform: viewMode === 'table' ? 'translateX(-50%)' : 'translateX(0)' }}>

            {/* 1. المبيان المزدوج البنفسجي والأخضر */}
            <div className="w-1/2 flex items-center justify-center py-5 px-2">
              <div className="w-full max-w-[280px] aspect-square relative">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible drop-shadow-sm">
                  {renderGrid()}
                  {radarData.map((d, i) => (
                    <line key={`axis-${i}`} x1={center} y1={center} x2={d.axisEndX} y2={d.axisEndY} stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  ))}
                  
                  {/* مضلع المنافس (أخضر) */}
                  <polygon points={poly2} fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="1.5" className="transition-all duration-700 ease-out" />
                  
                  {/* مضلع البطل (بنفسجي) */}
                  <polygon points={poly1} fill="rgba(168, 85, 247, 0.4)" stroke="#a855f7" strokeWidth="1.5" className="transition-all duration-700 ease-out" />

                  {/* النقط */}
                  {radarData.map((d, i) => (
                    <g key={`dots-${i}`}>
                       <circle cx={d.x2} cy={d.y2} r="2.5" fill="#fff" stroke="#22c55e" strokeWidth="1.5" />
                       <circle cx={d.x1} cy={d.y1} r="2.5" fill="#fff" stroke="#a855f7" strokeWidth="1.5" />
                    </g>
                  ))}

                  {/* التسميات */}
                  {radarData.map((d, i) => (
                    <text key={`label-${i}`} x={d.labelX} y={d.labelY} textAnchor={d.anchor} dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#4b5563">
                      {d.shortName}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* 2. جدول المقارنة التفصيلي */}
            <div className="w-1/2 flex flex-col justify-center bg-white p-2">
               {LESSONS.map((lesson, idx) => {
                  const v1 = s1.progress[lesson.id] || 0;
                  const v2 = s2.progress[lesson.id] || 0;
                  const isTie = v1 === v2;
                  const s1Wins = v1 > v2;
                  const s2Wins = v2 > v1;
                  const bgClass = idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white';
                  
                  return (
                     <div key={lesson.id} className={`flex justify-between items-center py-2 px-1 rounded ${bgClass}`}>
                        <div className={`w-8 text-center font-bold text-[11px] ${s1Wins ? 'text-purple-600 bg-purple-100 rounded' : isTie ? 'text-gray-400' : 'text-gray-300'}`}>{v1}</div>
                        <div className="flex-1 flex justify-center items-center gap-1">
                           {s1Wins && <i className="fa-solid fa-caret-left text-purple-400 text-[10px]"></i>}
                           <span className="text-[10px] text-gray-500 font-bold truncate max-w-[100px] text-center">{lesson.name}</span>
                           {s2Wins && <i className="fa-solid fa-caret-right text-green-500 text-[10px]"></i>}
                        </div>
                        <div className={`w-8 text-center font-bold text-[11px] ${s2Wins ? 'text-green-600 bg-green-100 rounded' : isTie ? 'text-gray-400' : 'text-gray-300'}`}>{v2}</div>
                     </div>
                  )
               })}
            </div>

          </div>
        </div>

        {/* أزرار التبديل للمقارنة */}
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
  const [user, setUser] = useState(null);
  
  const [expandedId, setExpandedId] = useState(null);
  const [comparingStudent, setComparingStudent] = useState(null); 
  const [versusStudents, setVersusStudents] = useState(null); 
  
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminExpandedId, setAdminExpandedId] = useState(null);
  const [adminSortDesc, setAdminSortDesc] = useState(true); 
  
  // حالات الـ Analytics المدمجة حيا مع فايربيز
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

  const isAdminRef = useRef(isAdmin);
  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  // ----------------------------------------------------------------------------------
  // خوارزمية تسجيل تتبع الجلسات والزيارات اليومية/الأسبوعية بدقة وحماية الحصة المجانية
  // ----------------------------------------------------------------------------------
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
            transaction.set(counterRef, {
              dailyVisits: 1,
              weeklyVisits: 1,
              lastResetDate: todayStr,
              lastWeekResetDate: todayStr
            });
          } else {
            const data = sfDoc.data();
            let newDaily = (data.dailyVisits || 0) + 1;
            let newWeekly = (data.weeklyVisits || 0) + 1;
            let updates = {};

            if (data.lastResetDate !== todayStr) {
              newDaily = 1;
              updates.lastResetDate = todayStr;
            }
            
            const lastWeekDate = new Date(data.lastWeekResetDate || todayStr);
            const daysDiff = (new Date() - lastWeekDate) / (1000 * 60 * 60 * 24);
            if (daysDiff >= 7) {
              newWeekly = 1;
              updates.lastWeekResetDate = todayStr;
            }

            updates.dailyVisits = newDaily;
            updates.weeklyVisits = newWeekly;
            transaction.update(counterRef, updates);
          }
        });
        sessionStorage.setItem('optima_visited_today', 'true');
      } catch (e) {
        console.error("Analytics Error:", e);
      }
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
        try {
          await setDoc(sessionRef, { lastActive: Date.now() }, { merge: true });
          isUserActive = false; 
        } catch (err) {
          console.error("Heartbeat Error:", err);
        }
      }
    };

    sendHeartbeat(); 
    const heartbeatInterval = setInterval(sendHeartbeat, 3 * 60 * 1000); // إرسال الإشارة كل 3 دقائق فقط

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [user, db]);

  // ----------------------------------------------------------------------------------
  // الاستماع الحي لعدد المتواجدين (متاح للجميع)
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    if (!user || !db) return;

    const sessionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'online_sessions');
    const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      let activeCount = 0;
      snapshot.forEach(docSnap => {
        if (docSnap.data().lastActive > fiveMinutesAgo) {
          activeCount++;
        }
      });
      setLiveOnline(activeCount > 0 ? activeCount : 1);
    });

    return () => unsubscribeSessions();
  }, [user, db]);

  // ----------------------------------------------------------------------------------
  // الاستماع الحي للإحصائيات داخل لوحة التحكم للإدارة فقط
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    if (!user || !isAdmin || !db) return; 

    const counterRef = doc(db, 'artifacts', appId, 'public', 'data', 'analytics', 'counters');
    const unsubscribeCounters = onSnapshot(counterRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDailyVisits(data.dailyVisits || 0);
        setWeeklyVisits(data.weeklyVisits || 0);
      }
    });

    return () => unsubscribeCounters();
  }, [user, isAdmin, db]);

  // ----------------------------------------------------------------------------------
  // التحكم المباشر والدقيق في العداد الصغير على الهواتف باستخدام مراقب التمرير
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    if (isAdmin) return;

    // استخدمنا حدث التمرير المباشر بدلاً من IntersectionObserver لأنه أدق بكثير على شاشات الهواتف
    const handleScroll = () => {
      if (headerRef.current) {
        const bottom = headerRef.current.getBoundingClientRect().bottom;
        // إذا كان أسفل الهيدر على بُعد 80 بكسل أو أقل من أعلى الشاشة، يظهر العداد الصغير
        setIsSticky(bottom < 80);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // استدعاء أولي

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdmin]);

  const handleListScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // ضمان إظهار العداد الصغير إذا بدأ التلميذ بتمرير اللائحة الداخلية
    if (scrollTop > 10 && !isSticky) {
       setIsSticky(true);
    }

    if (scrollHeight - scrollTop - clientHeight < 250) {
      setVisibleCount(prev => {
        if (prev < students.length) {
          return prev + 10;
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!isAdmin) {
      setIsSticky(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(currentYear, 5, 24, 8, 0, 0); 

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
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
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return; // تم إضافة حماية المصادقة قبل العمليات
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', 'v2');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        if (!isAdminRef.current) {
          setStudents(docSnap.data().students);
        }
      } else {
        if (!isAdminRef.current) {
          setDoc(docRef, { students: INITIAL_STUDENTS }).catch(console.error);
        }
      }
      setTimeout(() => setIsLoading(false), 2000);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user, db]);

  const rankedStudents = useMemo(() => {
    const sorted = [...students].sort((a, b) => calculateTotal(b.progress) - calculateTotal(a.progress));
    
    let currentRank = 1;
    return sorted.map((student, index) => {
      if (index > 0 && calculateTotal(student.progress) < calculateTotal(sorted[index - 1].progress)) {
        currentRank = index + 1;
      }
      return {
        ...student,
        rank: currentRank
      };
    });
  }, [students]);

  const podiumSpots = useMemo(() => {
    return [1, 2, 3].map(r => {
      const atRank = rankedStudents.filter(s => s.rank === r);
      if (atRank.length === 1) return atRank[0];
      if (atRank.length > 1) {
        return {
          id: `tie-${r}`,
          isTie: true,
          name: 'Non défini',
          rank: r,
          progress: atRank[0].progress, 
          trend: 0,
          recentProgress: 0
        };
      }
      return {
         id: `empty-${r}`,
         isEmpty: true,
         name: 'Non défini',
         rank: r,
         progress: LESSONS.reduce((acc, l) => ({...acc, [l.id]: 0}), {}),
         trend: 0,
         recentProgress: 0
      };
    });
  }, [rankedStudents]);

  const podiumStudentsIds = podiumSpots.filter(s => !s.isTie && !s.isEmpty).map(s => s.id);
  const others = rankedStudents.filter(s => !podiumStudentsIds.includes(s.id));

  const filteredAdminStudents = useMemo(() => {
    return rankedStudents.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      const totalA = adminSortScores[a.id] !== undefined ? adminSortScores[a.id] : calculateTotal(a.progress);
      const totalB = adminSortScores[b.id] !== undefined ? adminSortScores[b.id] : calculateTotal(b.progress);
      
      if (totalA !== totalB) {
        return adminSortDesc ? totalB - totalA : totalA - totalB;
      }
      return a.id - b.id;
    });
  }, [rankedStudents, searchQuery, adminSortDesc, adminSortScores]);

  const openAdmin = () => {
    setInitialAdminStudents(JSON.parse(JSON.stringify(students)));
    setSessionStartRanks(getRankMap(students));
    const initialScores = {};
    students.forEach(s => initialScores[s.id] = calculateTotal(s.progress));
    setSessionStartScores(initialScores);
    setAdminSortScores(initialScores); 
    setIsAdmin(true);
  };

  const handleLockClick = () => {
    if (localStorage.getItem('optimaAdminMode') === 'true') {
      openAdmin();
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'AMZMATH') {
      localStorage.setItem('optimaAdminMode', 'true'); 
      setShowLogin(false);
      setPassword('');
      setLoginError(false);
      openAdmin();
    } else {
      setLoginError(true);
    }
  };

  const refreshAdminSort = () => {
    const currentScores = {};
    students.forEach(s => currentScores[s.id] = calculateTotal(s.progress));
    setAdminSortScores(currentScores);
  };

  const handleSaveAdmin = async () => {
    setIsSaving(true); 
    const newRanks = getRankMap(students);
    const nowTime = Date.now();
    const twoDays = 2 * 24 * 60 * 60 * 1000; 
    
    const updatedStudents = students.map(student => {
      const oldRank = sessionStartRanks[student.id] || newRanks[student.id];
      const oldTotal = sessionStartScores[student.id] !== undefined ? sessionStartScores[student.id] : calculateTotal(student.progress);
      const newTotal = calculateTotal(student.progress);
      
      const trend = oldRank - newRanks[student.id];
      const recentProgress = newTotal - oldTotal;

      let fireBadgeUntil = student.fireBadgeUntil || null;
      let lightningBadgeUntil = student.lightningBadgeUntil || null;

      if (trend > 5) {
        fireBadgeUntil = nowTime + twoDays;
      } else if (trend < 0) {
        fireBadgeUntil = null;
      }

      if (recentProgress >= 10) {
        lightningBadgeUntil = nowTime + twoDays;
      }

      return {
        ...student,
        trend: trend,
        recentProgress: recentProgress,
        fireBadgeUntil: fireBadgeUntil,
        lightningBadgeUntil: lightningBadgeUntil
      };
    });

    setStudents(updatedStudents);

    if (user && db) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', 'v2');
      try {
        await setDoc(docRef, { students: updatedStudents });
      } catch (e) {
        console.error("Erreur de sauvegarde:", e);
      }
    }
    
    setIsSaving(false);
    setIsAdmin(false);
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true); 
  };

  const confirmCancel = () => {
    setStudents(initialAdminStudents);
    setIsAdmin(false);
    setShowCancelConfirm(false); 
  };

  const updateProgress = (studentId, lessonId, newValue, max) => {
    let validValue = Math.max(0, Math.min(newValue, max));
    
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          progress: {
            ...student.progress,
            [lessonId]: validValue
          }
        };
      }
      return student;
    });

    setStudents(updatedStudents);
  };

  const updateStudentName = (studentId, newName) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return { ...student, name: newName };
      }
      return student;
    });

    setStudents(updatedStudents);
  };

  const handleCardClick = (student, isCardExpanded) => {
    if (comparingStudent) {
      if (comparingStudent.id !== student.id) {
        setVersusStudents([comparingStudent, student]);
      }
      setComparingStudent(null); 
    } else {
      setExpandedId(isCardExpanded ? null : student.id);
    }
  };

  const startComparison = (student) => {
    setComparingStudent(student);
    setExpandedId(null); 
  };

  // حساب إحصائيات الدروس للإدارة مرتبة حسب النسبة المئوية للنجاح
  const lessonStats = useMemo(() => {
    if (!students.length) return [];
    
    return LESSONS.map(lesson => {
      const totalExercisesDone = students.reduce((acc, student) => acc + (student.progress[lesson.id] || 0), 0);
      const maxPossibleExercises = students.length * lesson.total;
      const percentage = maxPossibleExercises > 0 ? (totalExercisesDone / maxPossibleExercises) * 100 : 0;
      
      return {
        ...lesson,
        totalExercisesDone,
        maxPossibleExercises,
        percentage
      };
    }).sort((a, b) => b.percentage - a.percentage); 
  }, [students]);

  const isVersusMode = comparingStudent || versusStudents !== null;

  if (isAdmin) {
    return (
      <div dir="ltr" className="min-h-screen bg-gray-50 text-gray-800 pb-10 relative" style={{ fontFamily: "'Poppins', sans-serif", opacity: 0, animation: "fadeIn 1s forwards" }}>
        <style>{`
          @keyframes fadeIn { to { opacity: 1; } }
          @keyframes saveProgress {
            0% { left: -100%; width: 50%; }
            100% { left: 100%; width: 50%; }
          }
          .animate-save-progress {
            position: absolute;
            top: 0;
            bottom: 0;
            background-color: #22c55e;
            animation: saveProgress 1s infinite linear;
          }
        `}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bitcount&family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* نافذة الإحصائيات للإدارة (Dashboard) */}
        {showAdminStats && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in" onClick={() => setShowAdminStats(false)}>
            <div className="bg-gray-50 rounded-3xl w-full max-w-md h-[85vh] shadow-2xl relative flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              
              <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-black text-purple-600 flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple"></i> Statistiques Globales
                </h2>
                <button onClick={() => setShowAdminStats(false)} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="bg-white px-4 py-3 shrink-0 shadow-sm z-10">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setStatsTab('lessons')} 
                    className={`flex-1 py-2.5 rounded-lg font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm ${statsTab === 'lessons' ? 'bg-white text-purple-600' : 'bg-transparent text-gray-500 shadow-none hover:text-gray-700'}`}
                  >
                    <i className="fa-solid fa-book-open"></i> Par Leçons
                  </button>
                  <button 
                    onClick={() => setStatsTab('visitors')} 
                    className={`flex-1 py-2.5 rounded-lg font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm ${statsTab === 'visitors' ? 'bg-white text-purple-600' : 'bg-transparent text-gray-500 shadow-none hover:text-gray-700'}`}
                  >
                    <i className="fa-solid fa-users"></i> Visiteurs
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 smooth-scroll">
                
                {/* تبويب الدروس - تحديث الخطوط والأحجام لتطابق الواجهة وحذف الأيقونات */}
                {statsTab === 'lessons' && (
                  <div className="space-y-3">
                    {lessonStats.map((lesson, index) => (
                      <div key={lesson.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border shrink-0 ${index === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : index === 1 ? 'bg-slate-50 border-slate-200 text-slate-500' : index === 2 ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                              {index + 1}
                            </div>
                            <span className="font-bold text-gray-800 text-sm">{lesson.name}</span>
                          </div>
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg shrink-0" style={{ fontFamily: "'Lato', sans-serif" }}>
                            {lesson.totalExercisesDone} <span className="text-purple-300 text-[10px]">/ {lesson.maxPossibleExercises}</span>
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex justify-start mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(lesson.percentage)}`} 
                            style={{ width: `${lesson.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2 px-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Taux de réussite</span>
                          <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "'Lato', sans-serif" }}>{lesson.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* تبويب الزوار المربوط حيا بقاعدة البيانات فايربيز */}
                {statsTab === 'visitors' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-gray-300 font-medium text-sm flex items-center gap-2">
                          <i className="fa-solid fa-satellite-dish"></i> En ligne maintenant
                        </span>
                        <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Live</span>
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>{liveOnline}</span>
                        <span className="text-sm text-gray-400 font-medium mb-1.5">Élèves</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg mb-3">
                          <i className="fa-solid fa-calendar-day"></i>
                        </div>
                        <div>
                          <span className="block text-2xl font-black text-gray-800" style={{ fontFamily: "'Lato', sans-serif" }}>{dailyVisits}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visites Aujourd'hui</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-lg mb-3">
                          <i className="fa-solid fa-calendar-week"></i>
                        </div>
                        <div>
                          <span className="block text-2xl font-black text-gray-800" style={{ fontFamily: "'Lato', sans-serif" }}>{weeklyVisits}</span>
                          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Cette Semaine</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mt-2">
                      <p className="text-[11px] text-purple-700 font-medium leading-relaxed">
                        <i className="fa-solid fa-circle-check mr-1"></i> 
                        Les données de trafic sont générées en temps réel via votre base de données Firebase sécurisée.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="fixed top-0 left-0 w-full h-1.5 bg-green-100 z-[100] overflow-hidden">
             <div className="animate-save-progress"></div>
          </div>
        )}

        {!showAdminStats && (
          <button 
            onClick={() => setShowAdminStats(true)}
            className="fixed bottom-4 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-[0_4px_15px_rgba(147,51,234,0.4)] flex items-center justify-center transition-transform hover:scale-105 z-40"
            title="Voir les statistiques"
          >
            <i className="fa-solid fa-chart-simple text-xl"></i>
          </button>
        )}

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                <i className="fa-solid fa-triangle-exclamation text-xl"></i>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Annuler les modifications ?</h2>
              <p className="text-xs text-gray-500 mb-6">Toutes les modifications non enregistrées seront perdues.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Non, continuer
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
                >
                  Oui, annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
          <div className="max-w-md mx-auto px-4 py-5">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-black text-purple-600 flex items-center gap-2">
                <i className="fa-solid fa-user-shield"></i> Espace Professeur
              </h1>
              <button 
                onClick={() => {
                  localStorage.removeItem('optimaAdminMode');
                  setIsAdmin(false);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Se déconnecter"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
              </button>
            </div>
            
            <div className="flex gap-3 mb-5">
              <button 
                onClick={handleCancelClick}
                disabled={isSaving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3.5 rounded-2xl text-sm font-bold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                title="Annuler les modifications"
              >
                <i className="fa-solid fa-xmark text-lg"></i> Annuler
              </button>
              <button 
                onClick={handleSaveAdmin}
                disabled={isSaving}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-2xl text-sm font-bold transition-colors flex justify-center items-center gap-2 shadow-sm shadow-green-200 disabled:opacity-50"
                title="Sauvegarder et calculer les rangs"
              >
                <i className="fa-solid fa-floppy-disk text-lg"></i> Enregistrer
              </button>
            </div>

            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <i className="fa-solid fa-magnifying-glass text-lg"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un élève..."
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all text-sm outline-none"
                />
              </div>
              
              <button 
                onClick={refreshAdminSort}
                className="w-14 bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                title="Actualiser l'ordre"
              >
                <i className="fa-solid fa-rotate text-lg"></i>
              </button>

              <button 
                onClick={() => setAdminSortDesc(!adminSortDesc)}
                className="w-14 bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                title={adminSortDesc ? "Trier par ordre croissant" : "Trier par ordre décroissant"}
              >
                <i className={`fa-solid ${adminSortDesc ? 'fa-sort-amount-down' : 'fa-sort-amount-up'} text-lg`}></i>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 mt-6">
          {filteredAdminStudents.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <i className="fa-solid fa-magnifying-glass-minus text-4xl mb-2 opacity-50"></i>
              <p>Aucun élève trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAdminStudents.map(student => {
                const isExpanded = adminExpandedId === student.id;
                const total = calculateTotal(student.progress);
                const completedLessonsCount = calculateCompletedLessons(student.progress);

                return (
                  <div key={`admin-${student.id}`} className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-colors ${isExpanded ? 'border-purple-300 ring-1 ring-purple-100' : 'border-gray-100'}`}>
                    
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50"
                      onClick={() => setAdminExpandedId(isExpanded ? null : student.id)}
                    >
                      <div className="flex-1 mr-4 flex items-center">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-50 border border-gray-200 text-gray-500 font-bold text-xs mr-3 shadow-sm shrink-0" style={{ fontFamily: "'Lato', sans-serif" }}>
                          {student.rank}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => updateStudentName(student.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-gray-800 text-sm w-full bg-transparent border-b border-dashed border-gray-300 focus:border-solid focus:border-purple-500 focus:outline-none transition-colors pb-0.5"
                            title="Modifier le nom de l'élève"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold ${getScoreColorText(total)}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                              {total}/94 Ex
                            </span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs font-bold text-yellow-500" style={{ fontFamily: "'Lato', sans-serif" }}>
                              {completedLessonsCount} <i className="fa-solid fa-star text-[10px]"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                        <i className={`fa-solid fa-pen text-sm transition-transform ${isExpanded ? 'scale-110' : ''}`}></i>
                      </div>
                    </div>

                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out bg-gray-50/50 ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-t border-purple-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-4 space-y-4">
                          {LESSONS.map(lesson => {
                            const currentScore = student.progress[lesson.id] || 0;
                            const isMax = currentScore === lesson.total;

                            return (
                              <div key={`edit-${lesson.id}`} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-bold text-gray-700 flex items-center">
                                    <span className="mr-2 opacity-80">{lesson.icon}</span> 
                                    {lesson.name}
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isMax ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                                    {currentScore} / {lesson.total}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => updateProgress(student.id, lesson.id, currentScore - 1, lesson.total)}
                                    disabled={currentScore <= 0}
                                    className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:bg-red-100 transition-colors"
                                  >
                                    <i className="fa-solid fa-minus text-lg"></i>
                                  </button>
                                  
                                  <div className="flex-1 relative">
                                    <input 
                                      type="number" 
                                      value={currentScore === 0 ? '' : currentScore}
                                      onChange={(e) => updateProgress(student.id, lesson.id, parseInt(e.target.value) || 0, lesson.total)}
                                      placeholder="0"
                                      className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                                      style={{ fontFamily: "'Lato', sans-serif" }}
                                    />
                                  </div>

                                  <button 
                                    onClick={() => updateProgress(student.id, lesson.id, currentScore + 1, lesson.total)}
                                    disabled={isMax}
                                    className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:bg-green-100 transition-colors"
                                  >
                                    <i className="fa-solid fa-plus text-lg"></i>
                                  </button>

                                  <button 
                                    onClick={() => updateProgress(student.id, lesson.id, lesson.total, lesson.total)}
                                    disabled={isMax}
                                    className="h-10 px-3 rounded-lg bg-yellow-50 text-yellow-600 font-bold text-xs flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed active:bg-yellow-100 transition-colors"
                                  >
                                    <i className="fa-solid fa-star"></i> Max
                                  </button>
                                </div>
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
        @keyframes shine-text {
          0% { background-position: -100% center; }
          100% { background-position: 200% center; }
        }
        .shining-trophy {
          background: linear-gradient(110deg, #eab308 35%, rgba(255,255,255,0.3) 50%, #eab308 65%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine-text 3s linear infinite;
        }
        @keyframes gradientFlow {
          0% { background-position: 200% center; }
          100% { background-position: 0% center; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradientFlow 3s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .smooth-scroll {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bitcount&family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <VersusModal students={versusStudents} onClose={() => setVersusStudents(null)} />

      <div className={`fixed inset-0 z-[100] bg-[#fafafa] flex flex-col items-center justify-center transition-opacity duration-700 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <img src="https://i.pinimg.com/originals/54/58/a1/5458a14ae4c8f07055b7441ff0f234cf.gif" alt="Chargement..." className="w-32 h-32 object-contain" />
      </div>

      <a 
        href="https://drive.google.com/file/d/12D8ImLEhlVuzSV25-1fH9z7sfEsYn0ps/view?usp=sharing" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-[0_4px_15px_rgba(147,51,234,0.4)] flex items-center justify-center transition-transform hover:scale-105 z-40"
        title="Ouvrir le livre d'exercices"
      >
        <i className="fa-solid fa-book text-xl"></i>
      </a>

      <button 
        onClick={handleLockClick}
        className="fixed bottom-4 left-4 text-gray-400 opacity-20 hover:opacity-100 transition-opacity p-2 z-40"
      >
        <i className="fa-solid fa-lock text-base"></i>
      </button>

      {showLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => { setShowLogin(false); setLoginError(false); setPassword(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-500">
                <i className="fa-solid fa-shield-halved text-xl"></i>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Accès Restreint</h2>
              <p className="text-xs text-gray-500 mt-1">Veuillez entrer votre mot de passe</p>
            </div>

            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe..."
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-center mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${loginError ? 'border-red-400 text-red-500' : 'border-gray-200'}`}
                autoFocus
              />
              <button 
                type="submit"
                className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition-colors shadow-sm shadow-purple-200"
              >
                Valider
              </button>
            </form>
          </div>
        </div>
      )}

      {/* بادج اختيار المنافس العائم أسفل المنصة يتوسط أفقيا بدقة */}
      {comparingStudent && (
        <div className="fixed bottom-24 left-0 w-full flex justify-center z-50 pointer-events-none">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in whitespace-nowrap pointer-events-auto">
            <span className="text-xs font-medium">Sélectionnez le rival de <b className="text-purple-300">{comparingStudent.name.split(' ')[0]}</b>...</span>
            <button onClick={() => setComparingStudent(null)} className="ml-1 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <i className="fa-solid fa-xmark text-[10px]"></i>
            </button>
          </div>
        </div>
      )}

      <div ref={headerRef} className="max-w-md mx-auto px-4 pt-8 pb-0">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center text-center mb-4">
            <h1 className="text-6xl font-normal text-purple-600 tracking-widest drop-shadow-sm" style={{ fontFamily: "'Bitcount', 'Bebas Neue', sans-serif" }}>
              OPTIMA
            </h1>
            <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1.5 mt-2 uppercase tracking-widest border border-green-100 shadow-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              {liveOnline} Élève{liveOnline > 1 ? 's' : ''} en ligne
            </div>
          </div>

          <div className="border-t border-gray-50 pt-5">
            <div className="text-center mb-4 flex items-center justify-center gap-2">
              <i className="fa-regular fa-calendar-check text-purple-400"></i>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Examen Régional • 24 Juin 08:00</span>
            </div>
            <div className="flex justify-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">
                  {timeLeft.days}
                </div>
                <span className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-wider">Jours</span>
              </div>
              <span className="text-2xl font-bold text-purple-200 mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-wider">Hrs</span>
              </div>
              <span className="text-2xl font-bold text-purple-200 mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <span className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-wider">Min</span>
              </div>
              <span className="text-2xl font-bold text-purple-200 mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-purple-100">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
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
                  <div 
                    className={`w-24 flex flex-col items-center transition-transform duration-200 ${(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? 'cursor-pointer active:scale-95' : ''} ${expandedId === podiumSpots[1].id ? 'scale-105' : ''}`}
                    onClick={() => { if(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) handleCardClick(podiumSpots[1], expandedId === podiumSpots[1].id) }}
                  >
                    <div className="mb-1">
                      {(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? <PodiumMedal rank={podiumSpots[1].rank} defaultIcon="fa-solid fa-medal text-2xl text-slate-400" /> : <i className="fa-solid fa-medal text-2xl text-slate-200"></i>}
                    </div>
                    <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[1].isTie || podiumSpots[1].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[1].isTie || podiumSpots[1].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[1].name)}</div>
                  {(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1 mt-1 w-full px-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                            {calculateCompletedLessons(podiumSpots[1].progress)}
                          </span>
                          <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                        </div>
                        <div className="flex items-center gap-1">
                          {podiumSpots[1].fireBadgeUntil && podiumSpots[1].fireBadgeUntil > Date.now() && (
                            <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '11px' }}></i>
                          )}
                          {podiumSpots[1].lightningBadgeUntil && podiumSpots[1].lightningBadgeUntil > Date.now() && (
                            <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '11px' }}></i>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full shadow-sm ${getScoreColorBadge(calculateTotal(podiumSpots[1].progress))}`}
                          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                        >
                          {calculateTotal(podiumSpots[1].progress)}/94
                        </span>
                        {podiumSpots[1].recentProgress ? (
                          <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">
                            {podiumSpots[1].recentProgress > 0 ? '+' : ''}{podiumSpots[1].recentProgress}
                          </div>
                        ) : null}
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
                  <div 
                    className={`w-[110px] flex flex-col items-center z-10 transition-transform duration-200 mx-[-4px] ${(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? 'cursor-pointer active:scale-95' : ''} ${expandedId === podiumSpots[0].id ? 'scale-105' : ''}`}
                    onClick={() => { if(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) handleCardClick(podiumSpots[0], expandedId === podiumSpots[0].id) }}
                  >
                    <div className="mb-1">
                      {(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? <PodiumMedal rank={podiumSpots[0].rank} defaultIcon="fa-solid fa-trophy text-3xl text-yellow-500" /> : <i className="fa-solid fa-trophy text-3xl text-purple-200/50 drop-shadow-sm"></i>}
                    </div>
                    <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[0].isTie || podiumSpots[0].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[0].isTie || podiumSpots[0].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[0].name)}</div>
                  {(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1 mt-1 w-full px-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                            {calculateCompletedLessons(podiumSpots[0].progress)}
                          </span>
                          <i className="fa-solid fa-star text-yellow-400 text-[11px]"></i>
                        </div>
                        <div className="flex items-center gap-1">
                          {podiumSpots[0].fireBadgeUntil && podiumSpots[0].fireBadgeUntil > Date.now() && (
                            <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '12px' }}></i>
                          )}
                          {podiumSpots[0].lightningBadgeUntil && podiumSpots[0].lightningBadgeUntil > Date.now() && (
                            <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '12px' }}></i>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        <span 
                          className={`text-xs px-3 py-1 rounded-full shadow-sm ${getScoreColorBadge(calculateTotal(podiumSpots[0].progress))}`}
                          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                        >
                          {calculateTotal(podiumSpots[0].progress)}/94
                        </span>
                        {podiumSpots[0].recentProgress ? (
                          <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">
                            {podiumSpots[0].recentProgress > 0 ? '+' : ''}{podiumSpots[0].recentProgress}
                          </div>
                        ) : null}
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
                  <div 
                    className={`w-24 flex flex-col items-center transition-transform duration-200 ${(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) ? 'cursor-pointer active:scale-95' : ''} ${expandedId === podiumSpots[2].id ? 'scale-105' : ''}`}
                    onClick={() => { if(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) handleCardClick(podiumSpots[2], expandedId === podiumSpots[2].id) }}
                  >
                    <div className="mb-1">
                      {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) ? <PodiumMedal rank={podiumSpots[2].rank} defaultIcon="fa-solid fa-medal text-2xl text-amber-600" /> : <i className="fa-solid fa-medal text-2xl text-slate-200"></i>}
                    </div>
                    <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[2].isTie || podiumSpots[2].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[2].isTie || podiumSpots[2].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[2].name)}</div>
                  {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1 mt-1 w-full px-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                            {calculateCompletedLessons(podiumSpots[2].progress)}
                          </span>
                          <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                        </div>
                        <div className="flex items-center gap-1">
                          {podiumSpots[2].fireBadgeUntil && podiumSpots[2].fireBadgeUntil > Date.now() && (
                            <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '11px' }}></i>
                          )}
                          {podiumSpots[2].lightningBadgeUntil && podiumSpots[2].lightningBadgeUntil > Date.now() && (
                            <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '11px' }}></i>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full shadow-sm ${getScoreColorBadge(calculateTotal(podiumSpots[2].progress))}`}
                          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                        >
                          {calculateTotal(podiumSpots[2].progress)}/94
                        </span>
                        {podiumSpots[2].recentProgress ? (
                          <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm">
                            {podiumSpots[2].recentProgress > 0 ? '+' : ''}{podiumSpots[2].recentProgress}
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : <div className="h-[46px] w-full"></div>}
                  <div className={`w-full h-24 rounded-t-xl flex items-start justify-center pt-3 text-white font-black text-2xl relative overflow-hidden transition-colors ${expandedId === podiumSpots[2].id ? 'bg-[#c72d3d]' : 'bg-gradient-to-t from-[#e83e4e] to-[#ee6976]'}`}>
                      <div className="flex items-center gap-1 z-10">
                        <span>{podiumSpots[2].rank}</span>
                        {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) && podiumSpots[2].trend > 0 && <span className="text-[12px] text-green-300 flex items-center gap-0.5"><i className="fa-solid fa-caret-up"></i> {podiumSpots[2].trend}</span>}
                        {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) && podiumSpots[2].trend < 0 && <span className="text-[12px] text-red-200 flex items-center gap-0.5"><i className="fa-solid fa-caret-down"></i> {Math.abs(podiumSpots[2].trend)}</span>}
                      </div>
                      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    </div>
                  </div>
                  )}
                </div>

              </>
            )}
            
            {/* بادج اختيار الخصم العائم يتوسط أفقياً بدقة رياضية */}
            {comparingStudent && (
              <div className="absolute -bottom-5 left-0 w-full flex justify-center z-50 pointer-events-none">
                <div className="bg-red-500 text-white px-5 py-2 rounded-full shadow-lg shadow-red-500/30 flex items-center gap-3 animate-fade-in whitespace-nowrap border-2 border-white pointer-events-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Sélectionnez le rival de <b className="text-yellow-300 ml-1">{comparingStudent.name.split(' ')[0]}</b></span>
                  <button onClick={() => setComparingStudent(null)} className="ml-1 w-5 h-5 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors">
                    <i className="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* لائحة الترتيب العامة للقسم */}
        <div className={`flex-1 flex flex-col px-4 pb-4 min-h-0 transition-colors duration-500 ${isVersusMode ? 'bg-red-50' : 'bg-purple-50'}`}>
          <div className={`bg-white rounded-3xl py-4 flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${comparingStudent ? 'border-2 border-red-500 shadow-lg shadow-red-500/20' : 'shadow-sm border border-gray-100'}`}>
            <div 
              className="flex-1 overflow-y-auto px-4 no-scrollbar smooth-scroll"
              onScroll={handleListScroll}
            >
              {others.slice(0, visibleCount).map((student) => {
                const total = calculateTotal(student.progress);
                const isExpanded = expandedId === student.id;
                const completedLessonsCount = calculateCompletedLessons(student.progress);
                const isZero = total === 0;

                const nowTime = Date.now();
                const hasFire = student.fireBadgeUntil && student.fireBadgeUntil > nowTime;
                const hasLightning = student.lightningBadgeUntil && student.lightningBadgeUntil > nowTime;
                const hasBoth = hasFire && hasLightning;

                let rankBadgeColor = 'bg-gray-50 border-gray-200 text-gray-700'; 
                if (student.trend > 0) {
                  rankBadgeColor = 'bg-green-100 border-green-200 text-green-700'; 
                } else if (student.trend < 0) {
                  rankBadgeColor = 'bg-red-100 border-red-200 text-red-700'; 
                } else if (isZero) {
                  rankBadgeColor = 'bg-gray-100 border-red-200 text-red-400';
                }

                let wrapperClass = "mb-3 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ";
                let innerClass = "rounded-2xl overflow-hidden bg-white ";

                if (hasBoth) {
                  wrapperClass += "p-[1px] bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-gradient-x";
                } else if (hasFire) {
                  wrapperClass += "p-[1px] bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-gradient-x";
                } else if (hasLightning) {
                  wrapperClass += "p-[1px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-gradient-x";
                } else {
                  wrapperClass += "border " + (isZero ? "border-red-200 opacity-95 bg-gray-50" : "border-gray-100 hover:border-purple-200 bg-white");
                  if (isZero) innerClass = "rounded-2xl overflow-hidden bg-gray-50 ";
                }

                const nameClass = `font-bold text-sm pb-0.5 ${
                  hasBoth ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-gradient-x' :
                  hasFire ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-gradient-x' :
                  hasLightning ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 animate-gradient-x' :
                  isZero ? 'text-gray-400' : 'text-gray-800'
                }`;

                return (
                  <div key={student.id} className={wrapperClass}>
                    <div className={innerClass}>
                      <div 
                        className="flex items-center justify-between p-3 cursor-pointer active:bg-gray-50"
                        onClick={() => handleCardClick(student, isExpanded)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border font-black shadow-sm text-sm transition-colors shrink-0 ${rankBadgeColor}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                            {student.rank}
                          </div>
                          <div>
                            <h3 className={nameClass}>{student.name}</h3>
                            
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {student.trend > 0 && (
                                <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-md text-[10px] font-bold">
                                  <span style={{ fontFamily: "'Lato', sans-serif" }}>{student.trend}</span> <i className="fa-solid fa-caret-up text-[10px]"></i>
                                </div>
                              )}
                              {student.trend < 0 && (
                                <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-bold">
                                  <span style={{ fontFamily: "'Lato', sans-serif" }}>{Math.abs(student.trend)}</span> <i className="fa-solid fa-caret-down text-[10px]"></i>
                                </div>
                              )}
                              {student.trend === 0 && (
                                <div className="flex items-center justify-center px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md text-[10px] font-bold">
                                  -
                                </div>
                              )}

                              <div className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${completedLessonsCount > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                                <span style={{ fontFamily: "'Lato', sans-serif" }}>{completedLessonsCount}</span> <i className="fa-solid fa-star text-[9px]"></i>
                              </div>

                              {student.recentProgress ? (
                                <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shadow-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                                  +{student.recentProgress}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 mr-1 shrink-0">
                            {hasFire && (
                              <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '14px' }} title="Avancé de plus de 5 rangs !"></i>
                            )}
                            {hasLightning && (
                              <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '14px' }} title="10 exercices ou plus complétés !"></i>
                            )}
                          </div>
                          <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0 ${getScoreColorBadge(total)}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                            {total}/94
                          </div>
                          <div className="text-gray-400 flex items-center justify-center w-6 h-6 shrink-0">
                            <i className={`fa-solid fa-chevron-down text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180 text-purple-500' : ''}`}></i>
                          </div>
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
