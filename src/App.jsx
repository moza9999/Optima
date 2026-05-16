import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

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

const INITIAL_STUDENTS = [
  { id: 1, name: 'Sara Alami', trend: 0, progress: { eq: 11, vec: 19, geo: 12, sys: 13, fon: 12, sta: 15, esp: 12 } },
  { id: 2, name: 'Youssef Bensaïd', trend: 2, progress: { eq: 11, vec: 19, geo: 10, sys: 8, fon: 0, sta: 0, esp: 0 } },
  { id: 3, name: 'Maryam Tazi', trend: -1, progress: { eq: 11, vec: 15, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 4, name: 'Ayman Najjar', trend: 1, progress: { eq: 11, vec: 5, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } },
  { id: 5, name: 'Ilham Karim', trend: -2, progress: { eq: 10, vec: 0, geo: 0, sys: 0, fon: 0, sta: 0, esp: 0 } }
];

// ==========================================
// CONFIGURATION FIREBASE 
// ==========================================
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
  if (percentage < 80) return 'text-orange-700 bg-orange-100';
  return 'text-green-700 bg-green-100';
};

const getScoreColorText = (score) => {
  const percentage = (score / 94) * 100;
  if (percentage < 40) return 'text-red-500';
  if (percentage < 80) return 'text-orange-500';
  return 'text-green-600';
};

const getProgressBarColor = (percentage) => {
  if (percentage < 40) return 'bg-red-500';
  if (percentage < 100) return 'bg-orange-400';
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

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [user, setUser] = useState(null);
  
  const [expandedId, setExpandedId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminExpandedId, setAdminExpandedId] = useState(null);

  // 1. الإجبار على تحميل التصميم (Tailwind CSS) وتهيئة Firebase
  useEffect(() => {
    // تحميل سكريبت التصميم تلقائياً
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
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudents(docSnap.data().students);
      } else {
        setDoc(docRef, { students: INITIAL_STUDENTS }).catch(console.error);
      }
    }, (error) => {
      console.error("Firestore Error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => calculateTotal(b.progress) - calculateTotal(a.progress));
  }, [students]);

  const topThree = sortedStudents.slice(0, 3);
  const others = sortedStudents.slice(3);

  const filteredAdminStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const updateProgress = async (studentId, lessonId, newValue, max) => {
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

    if (user && db) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', 'main');
      try {
        await setDoc(docRef, { students: updatedStudents });
      } catch (e) {
        console.error("Erreur de sauvegarde:", e);
      }
    }
  };

  const ProgressDetails = ({ student, isPodium = false }) => {
    if (!student) return null;
    return (
      <div className={`p-4 bg-orange-50/50 ${isPodium ? 'rounded-2xl shadow-sm border border-orange-100' : 'border-t border-gray-100'}`}>
        <h4 className="text-xs font-bold text-orange-400 mb-4 text-center uppercase tracking-wider">
          Progression • {student.name}
        </h4>
        <div className="space-y-4">
          {LESSONS.map((lesson) => {
            const completed = student.progress[lesson.id] || 0;
            const percentage = (completed / lesson.total) * 100;
            const isFinished = completed === lesson.total;

            return (
              <div key={lesson.id} className="text-sm relative">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-700 flex items-center font-medium text-xs">
                    <span className="mr-2 text-base bg-white p-1 rounded shadow-sm">{lesson.icon}</span> 
                    {lesson.name}
                  </span>
                  <div className="flex items-center">
                    <span 
                      className={`text-xs mr-1 ${getScoreColorText((completed / lesson.total) * 94)}`}
                      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 500 }}
                    >
                      {completed}/{lesson.total}
                    </span>
                    <div className={`transition-all duration-500 ease-out ${isFinished ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'}`}>
                      <i className="fa-solid fa-star text-yellow-400 text-lg ml-1"></i>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden flex justify-start">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(percentage)}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isAdmin) {
    return (
      <div dir="ltr" className="min-h-screen bg-gray-50 text-gray-800 pb-10" style={{ fontFamily: "'Poppins', sans-serif", opacity: 0, animation: "fadeIn 1s forwards" }}>
        <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-20 border-b border-gray-100">
          <div className="max-w-md mx-auto flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-orange-500 flex items-center gap-2">
              <i className="fa-solid fa-user-shield"></i> Espace Professeur
            </h1>
            <button 
              onClick={() => setIsAdmin(false)}
              className="bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
            >
              Fermer <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>

          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <i className="fa-solid fa-magnifying-glass text-lg"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un élève..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all text-sm outline-none"
            />
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
                  <div key={`admin-${student.id}`} className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-colors ${isExpanded ? 'border-orange-300 ring-1 ring-orange-100' : 'border-gray-100'}`}>
                    
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50"
                      onClick={() => setAdminExpandedId(isExpanded ? null : student.id)}
                    >
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{student.name}</h3>
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                        <i className={`fa-solid fa-pen text-sm transition-transform ${isExpanded ? 'scale-110' : ''}`}></i>
                      </div>
                    </div>

                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out bg-gray-50/50 ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-t border-orange-100' : 'grid-rows-[0fr] opacity-0'}`}>
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
                                      className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
    <div dir="ltr" className="min-h-screen bg-orange-50/50 text-gray-800 pb-10 relative" style={{ fontFamily: "'Poppins', sans-serif", opacity: 0, animation: "fadeIn 1s forwards" }}>
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <button 
        onClick={() => setShowLogin(true)}
        className="fixed bottom-4 right-4 text-gray-300 opacity-20 hover:opacity-100 transition-opacity p-2 z-40"
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
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500">
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
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-center mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all ${loginError ? 'border-red-400 text-red-500' : 'border-gray-200'}`}
                autoFocus
              />
              <button 
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
              >
                Valider
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-8">
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          {topThree.length >= 3 && (
            <>
              <div className="flex justify-center items-end h-72 mb-6 gap-2 pt-8">
                {/* Rang 2 */}
                <div 
                  className={`w-24 flex flex-col items-center cursor-pointer transition-transform duration-200 active:scale-95 ${expandedId === topThree[1].id ? 'scale-105' : ''}`}
                  onClick={() => setExpandedId(expandedId === topThree[1].id ? null : topThree[1].id)}
                >
                  <div className="mb-1 text-slate-400">
                    <i className="fa-solid fa-medal text-2xl"></i>
                  </div>
                  <div className="text-sm font-bold w-full text-center text-gray-800 px-1 leading-tight">{renderPodiumName(topThree[1].name)}</div>
                  <div className="flex items-center gap-1 mb-2 mt-1">
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                      {calculateCompletedLessons(topThree[1].progress)}
                    </span>
                    <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                  </div>
                  <span 
                    className={`text-xs px-2 py-0.5 rounded-full mb-2 shadow-sm ${getScoreColorBadge(calculateTotal(topThree[1].progress))}`}
                    style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                  >
                    {calculateTotal(topThree[1].progress)}/94
                  </span>
                  <div className={`w-full h-28 rounded-t-xl flex items-start justify-center pt-3 text-white font-black text-2xl relative overflow-hidden transition-colors ${expandedId === topThree[1].id ? 'bg-blue-500' : 'bg-gradient-to-t from-blue-400 to-blue-300'}`}>
                    2
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                  </div>
                </div>
                
                {/* Rang 1 */}
                <div 
                  className={`w-[110px] flex flex-col items-center z-10 cursor-pointer transition-transform duration-200 active:scale-95 ${expandedId === topThree[0].id ? 'scale-105' : ''}`}
                  onClick={() => setExpandedId(expandedId === topThree[0].id ? null : topThree[0].id)}
                >
                  <div className="mb-1 text-yellow-500">
                    <i className="fa-solid fa-trophy text-3xl"></i>
                  </div>
                  <div className="text-sm font-bold w-full text-center text-gray-800 px-1 leading-tight">{renderPodiumName(topThree[0].name)}</div>
                  <div className="flex items-center gap-1 mb-2 mt-1">
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                      {calculateCompletedLessons(topThree[0].progress)}
                    </span>
                    <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                  </div>
                  <span 
                    className={`text-xs px-3 py-1 rounded-full mb-2 shadow-sm ${getScoreColorBadge(calculateTotal(topThree[0].progress))}`}
                    style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                  >
                    {calculateTotal(topThree[0].progress)}/94
                  </span>
                  <div className={`w-full h-36 rounded-t-xl flex items-start justify-center pt-3 text-white font-black text-3xl relative overflow-hidden transition-colors ${expandedId === topThree[0].id ? 'bg-orange-600' : 'bg-gradient-to-t from-orange-500 to-orange-400'}`}>
                    1
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                  </div>
                </div>

                {/* Rang 3 */}
                <div 
                  className={`w-24 flex flex-col items-center cursor-pointer transition-transform duration-200 active:scale-95 ${expandedId === topThree[2].id ? 'scale-105' : ''}`}
                  onClick={() => setExpandedId(expandedId === topThree[2].id ? null : topThree[2].id)}
                >
                  <div className="mb-1 text-amber-600">
                    <i className="fa-solid fa-medal text-2xl"></i>
                  </div>
                  <div className="text-sm font-bold w-full text-center text-gray-800 px-1 leading-tight">{renderPodiumName(topThree[2].name)}</div>
                  <div className="flex items-center gap-1 mb-2 mt-1">
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                      {calculateCompletedLessons(topThree[2].progress)}
                    </span>
                    <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                  </div>
                  <span 
                    className={`text-xs px-2 py-0.5 rounded-full mb-2 shadow-sm ${getScoreColorBadge(calculateTotal(topThree[2].progress))}`}
                    style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                  >
                    {calculateTotal(topThree[2].progress)}/94
                  </span>
                  <div className={`w-full h-24 rounded-t-xl flex items-start justify-center pt-3 text-white font-black text-2xl relative overflow-hidden transition-colors ${expandedId === topThree[2].id ? 'bg-yellow-500' : 'bg-gradient-to-t from-yellow-400 to-yellow-300'}`}>
                    3
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                {topThree.map(student => (
                  <div 
                    key={`podium-${student.id}`} 
                    className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${expandedId === student.id ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0 mb-0'}`}
                  >
                    <div className="overflow-hidden">
                      <ProgressDetails student={student} isPodium={true} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-2">
            {others.map((student, index) => {
              const total = calculateTotal(student.progress);
              const isExpanded = expandedId === student.id;
              const completedLessonsCount = calculateCompletedLessons(student.progress);

              return (
                <div key={student.id} className="mb-3 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md bg-white">
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer active:bg-gray-50"
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-sm">
                        {index + 4}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-800">{student.name}</h3>
                        <p 
                          className={`text-xs mt-0.5 ${getScoreColorText(total)}`}
                          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                        >
                          {total} / 94 exercices
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-bold min-w-[2.5rem] ${completedLessonsCount > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                        <span style={{ fontFamily: "'Lato', sans-serif" }}>{completedLessonsCount}</span> 
                        <i className="fa-solid fa-star text-[10px]"></i>
                      </div>

                      {student.trend > 0 && (
                        <div className="flex items-center justify-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold min-w-[2.5rem]">
                          <span style={{ fontFamily: "'Lato', sans-serif" }}>{student.trend}</span> <i className="fa-solid fa-caret-up text-sm"></i>
                        </div>
                      )}
                      {student.trend < 0 && (
                        <div className="flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold min-w-[2.5rem]">
                          <span style={{ fontFamily: "'Lato', sans-serif" }}>{Math.abs(student.trend)}</span> <i className="fa-solid fa-caret-down text-sm"></i>
                        </div>
                      )}
                      {student.trend === 0 && (
                        <div className="flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-500 rounded-full text-lg font-bold">
                          -
                        </div>
                      )}
                      <div className="text-gray-400 flex items-center justify-center w-6 h-6">
                        <i className={`fa-solid fa-chevron-down text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`}></i>
                      </div>
                    </div>
                  </div>

                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <ProgressDetails student={student} isPodium={false} />
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
}