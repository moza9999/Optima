import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  if (percentage < 100) return 'bg-purple-400';
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true); // حالة تحميل التطبيق
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [user, setUser] = useState(null);
  
  const [expandedId, setExpandedId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminExpandedId, setAdminExpandedId] = useState(null);
  const [adminSortDesc, setAdminSortDesc] = useState(false); 
  
  const [initialAdminStudents, setInitialAdminStudents] = useState([]);
  const [sessionStartRanks, setSessionStartRanks] = useState({});
  const [sessionStartScores, setSessionStartScores] = useState({});
  const [adminSortScores, setAdminSortScores] = useState({}); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const isAdminRef = useRef(isAdmin);
  useEffect(() => {
    isAdminRef.current = isAdmin;
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
    if (!user || !db) return;
    // قمنا بتغيير v1 إلى v2 لإنشاء قاعدة بيانات جديدة ونظيفة
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
      // إزالة شاشة التحميل بعد التأكد من جلب البيانات وتأخيرها لثانيتين (2000ms) حتى يأخذ التصميم مكانه
      setTimeout(() => setIsLoading(false), 2000);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

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

  // منطق كسر التعادل في المنصة (Non défini)
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
          progress: atRank[0].progress, // إظهار النقاط التي حدث فيها التعادل
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

  // التلاميذ الذين سيظهرون في اللائحة السفلية (يتضمنون المتعادلين المبعدين من المنصة)
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
      return a.name.localeCompare(b.name);
    });
  }, [rankedStudents, searchQuery, adminSortDesc, adminSortScores]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      setLoginError(false);
      
      setInitialAdminStudents(JSON.parse(JSON.stringify(students)));
      setSessionStartRanks(getRankMap(students));
      
      const initialScores = {};
      students.forEach(s => initialScores[s.id] = calculateTotal(s.progress));
      setSessionStartScores(initialScores);
      setAdminSortScores(initialScores); 
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
    const newRanks = getRankMap(students);
    const now = Date.now();
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
        fireBadgeUntil = now + twoDays;
      } else if (trend < 0) {
        fireBadgeUntil = null;
      }

      if (recentProgress >= 10) {
        lightningBadgeUntil = now + twoDays;
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
      // قمنا بتغيير v1 إلى v2 هنا أيضاً لحفظ البيانات في المكان الجديد
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', 'v2');
      try {
        await setDoc(docRef, { students: updatedStudents });
      } catch (e) {
        console.error("Erreur de sauvegarde:", e);
      }
    }
    setIsAdmin(false);
  };

  const handleCancelAdmin = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler sans sauvegarder les modifications ?")) {
      setStudents(initialAdminStudents);
      setIsAdmin(false);
    }
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

  const ProgressDetails = ({ student, isPodium = false }) => {
    if (!student || student.isTie || student.isEmpty) return null;
    return (
      <div className={`p-4 bg-purple-50/50 ${isPodium ? 'rounded-2xl shadow-sm border border-purple-100' : 'border-t border-gray-100'}`}>
        <h4 className="text-xs font-bold text-purple-400 mb-4 text-center uppercase tracking-wider">
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

  // شاشة التحميل بخلفية متناسقة مع الصورة
  if (isLoading) {
    return (
      <div dir="ltr" className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <img src="https://i.pinimg.com/originals/54/58/a1/5458a14ae4c8f07055b7441ff0f234cf.gif" alt="Chargement..." className="w-32 h-32 object-contain" />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div dir="ltr" className="min-h-screen bg-gray-50 text-gray-800 pb-10" style={{ fontFamily: "'Poppins', sans-serif", opacity: 0, animation: "fadeIn 1s forwards" }}>
        <style>{`
          @keyframes fadeIn { to { opacity: 1; } }
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
        `}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bitcount&family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <div className="bg-white px-4 py-5 shadow-sm sticky top-0 z-20 border-b border-gray-100">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-black text-purple-600 flex items-center gap-2 mb-4">
              <i className="fa-solid fa-user-shield"></i> Espace Professeur
            </h1>
            
            <div className="flex gap-3 mb-5">
              <button 
                onClick={handleCancelAdmin}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3.5 rounded-2xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
                title="Annuler les modifications"
              >
                <i className="fa-solid fa-xmark text-lg"></i> Annuler
              </button>
              <button 
                onClick={handleSaveAdmin}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-2xl text-sm font-bold transition-colors flex justify-center items-center gap-2 shadow-sm shadow-green-200"
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
    <div dir="ltr" className="min-h-screen bg-purple-50/50 text-gray-800 pb-10 relative" style={{ fontFamily: "'Poppins', sans-serif", opacity: 0, animation: "fadeIn 1s forwards" }}>
      <style>{`
        @keyframes fadeIn { to { opacity: 1; } }
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
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bitcount&family=Lato:wght@500;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
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
        onClick={() => setShowLogin(true)}
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

      <div className="max-w-md mx-auto px-4 pt-10 pb-2">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <h1 className="text-6xl font-normal text-purple-600 tracking-widest drop-shadow-sm" style={{ fontFamily: "'Bitcount', 'Bebas Neue', sans-serif" }}>
              OPTIMA
            </h1>
            <p className="text-gray-500 text-sm font-bold mt-1 uppercase tracking-widest" style={{ fontFamily: "'Lato', sans-serif" }}>
              Ensemble vers le sommet
            </p>
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

      <div className="max-w-md mx-auto px-4 pt-2">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          {podiumSpots.length > 0 && (
            <>
              <div className="flex justify-center items-end h-72 mb-6 gap-2 pt-8">
                {/* Rang 2 */}
                {podiumSpots[1] && (
                <div 
                  className={`w-24 flex flex-col items-center transition-transform duration-200 ${(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? 'cursor-pointer active:scale-95' : ''} ${expandedId === podiumSpots[1].id ? 'scale-105' : ''}`}
                  onClick={() => { if(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) setExpandedId(expandedId === podiumSpots[1].id ? null : podiumSpots[1].id) }}
                >
                  <div className="mb-1">
                    {(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? <PodiumMedal rank={podiumSpots[1].rank} defaultIcon="fa-solid fa-medal text-2xl text-slate-400" /> : <i className="fa-solid fa-medal text-2xl text-slate-200"></i>}
                  </div>
                  <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[1].isTie || podiumSpots[1].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[1].isTie || podiumSpots[1].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[1].name)}</div>
                  {(!podiumSpots[1].isTie && !podiumSpots[1].isEmpty) ? (
                    <>
                      <div className="flex items-center gap-1 mb-1 mt-1">
                        <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                          {calculateCompletedLessons(podiumSpots[1].progress)}
                        </span>
                        <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        {podiumSpots[1].fireBadgeUntil && podiumSpots[1].fireBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '12px' }}></i>
                        )}
                        {podiumSpots[1].lightningBadgeUntil && podiumSpots[1].lightningBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '12px' }}></i>
                        )}
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
                  className={`w-[110px] flex flex-col items-center z-10 transition-transform duration-200 ${(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? 'cursor-pointer active:scale-95' : ''} ${expandedId === podiumSpots[0].id ? 'scale-105' : ''}`}
                  onClick={() => { if(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) setExpandedId(expandedId === podiumSpots[0].id ? null : podiumSpots[0].id) }}
                >
                  <div className="mb-1">
                    {(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? <PodiumMedal rank={podiumSpots[0].rank} defaultIcon="fa-solid fa-trophy text-3xl text-yellow-500" /> : <i className="fa-solid fa-trophy text-3xl text-purple-200/50 drop-shadow-sm"></i>}
                  </div>
                  <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[0].isTie || podiumSpots[0].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[0].isTie || podiumSpots[0].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[0].name)}</div>
                  {(!podiumSpots[0].isTie && !podiumSpots[0].isEmpty) ? (
                    <>
                      <div className="flex items-center gap-1 mb-1 mt-1">
                        <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                          {calculateCompletedLessons(podiumSpots[0].progress)}
                        </span>
                        <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        {podiumSpots[0].fireBadgeUntil && podiumSpots[0].fireBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '13px' }}></i>
                        )}
                        {podiumSpots[0].lightningBadgeUntil && podiumSpots[0].lightningBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '13px' }}></i>
                        )}
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
                  onClick={() => { if(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) setExpandedId(expandedId === podiumSpots[2].id ? null : podiumSpots[2].id) }}
                >
                  <div className="mb-1">
                    {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) ? <PodiumMedal rank={podiumSpots[2].rank} defaultIcon="fa-solid fa-medal text-2xl text-amber-600" /> : <i className="fa-solid fa-medal text-2xl text-slate-200"></i>}
                  </div>
                  <div className={`text-sm w-full text-center px-1 leading-tight ${(podiumSpots[2].isTie || podiumSpots[2].isEmpty) ? 'text-gray-400 font-normal whitespace-nowrap' : 'text-gray-800 font-bold'}`}>{(podiumSpots[2].isTie || podiumSpots[2].isEmpty) ? 'Non défini' : renderPodiumName(podiumSpots[2].name)}</div>
                  {(!podiumSpots[2].isTie && !podiumSpots[2].isEmpty) ? (
                    <>
                      <div className="flex items-center gap-1 mb-1 mt-1">
                        <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Lato', sans-serif" }}>
                          {calculateCompletedLessons(podiumSpots[2].progress)}
                        </span>
                        <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-2 w-full px-1">
                        {podiumSpots[2].fireBadgeUntil && podiumSpots[2].fireBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '12px' }}></i>
                        )}
                        {podiumSpots[2].lightningBadgeUntil && podiumSpots[2].lightningBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '12px' }}></i>
                        )}
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

              <div className="w-full">
                {podiumSpots.filter(s => !s.isTie && !s.isEmpty).map(student => (
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
            {others.map((student) => {
              const total = calculateTotal(student.progress);
              const isExpanded = expandedId === student.id;
              const completedLessonsCount = calculateCompletedLessons(student.progress);
              const isZero = total === 0;

              let rankBadgeColor = 'bg-gray-50 border-gray-200 text-gray-700'; 
              if (student.trend > 0) {
                rankBadgeColor = 'bg-green-100 border-green-200 text-green-700'; 
              } else if (student.trend < 0) {
                rankBadgeColor = 'bg-red-100 border-red-200 text-red-700'; 
              } else if (isZero) {
                rankBadgeColor = 'bg-gray-100 border-red-200 text-red-400';
              }

              const cardStyle = isZero 
                ? "mb-3 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm bg-gray-50 border border-red-300 opacity-95" 
                : "mb-3 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md bg-white border border-gray-200";

              return (
                <div key={student.id} className={cardStyle}>
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer active:bg-gray-50"
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border font-black shadow-sm text-sm transition-colors ${rankBadgeColor}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                        {student.rank}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isZero ? 'text-gray-400' : 'text-gray-800'}`}>{student.name}</h3>
                        
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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
                            <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-md text-[10px] font-bold shadow-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                              {student.recentProgress > 0 ? '+' : ''}{student.recentProgress}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 mr-1">
                        {student.fireBadgeUntil && student.fireBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-fire animate-pulse drop-shadow-sm" style={{ color: 'rgb(243, 59, 59)', fontSize: '14px' }} title="Avancé de plus de 5 rangs !"></i>
                        )}
                        {student.lightningBadgeUntil && student.lightningBadgeUntil > Date.now() && (
                          <i className="fa-solid fa-bolt text-purple-500 animate-pulse drop-shadow-sm" style={{ fontSize: '14px' }} title="10 exercices ou plus complétés !"></i>
                        )}
                      </div>
                      <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${getScoreColorBadge(total)}`} style={{ fontFamily: "'Lato', sans-serif" }}>
                        {total}/94
                      </div>
                      <div className="text-gray-400 flex items-center justify-center w-6 h-6">
                        <i className={`fa-solid fa-chevron-down text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180 text-purple-500' : ''}`}></i>
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
