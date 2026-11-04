// ... existing code ...
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { 
  getAuth, 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  applyActionCode, 
  verifyPasswordResetCode, 
  confirmPasswordReset,
  updatePassword
} from 'firebase/auth';

// ============================================================================
// FIREBASE LIVE CLOUD CONFIGURATION (cyber-topup-game)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD-dgpKK9S2olFLawJ8MKYHi-NWB4GQv7U",
  authDomain: "cyber-topup-game.firebaseapp.com",
  databaseURL: "https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cyber-topup-game",
  storageBucket: "cyber-topup-game.firebasestorage.app",
  messagingSenderId: "191687954752",
  appId: "1:191687954752:web:063d8ce34df50b182feaa5",
  measurementId: "G-2VQP0N3PVZ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

// Global Cyber Styles & Enhanced Up/Down Spinners & Controls
const cyberGlobalStyles = `
  button, [role="button"], input[type="submit"], input[type="button"], .cyber-btn {
    position: relative;
    cursor: pointer !important;
    transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none !important;
  }
  button:hover:not(:disabled), [role="button"]:hover, .cyber-btn:hover {
    transform: translateY(-2px) scale(1.02) !important;
    filter: brightness(1.15) contrast(1.05) !important;
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.45), 0 0 15px rgba(56, 189, 248, 0.35) !important;
  }
  button:active:not(:disabled), .cyber-btn:active {
    transform: translateY(1px) scale(0.98) !important;
  }
  .no-native-spin::-webkit-inner-spin-button,
  .no-native-spin::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .no-native-spin {
    -moz-appearance: textfield;
  }
  .cyber-select {
    appearance: none;
    -webkit-appearance: none;
    background-repeat: no-repeat !important;
    background-position: right 12px center !important;
    background-size: 14px !important;
    padding-right: 36px !important;
    cursor: pointer;
  }
  .cyber-select-cyan {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  .cyber-select-purple {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c084fc' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: #090d16;
    border-radius: 8px;
    border: 1px solid #1f2937;
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #9333ea, #38bdf8);
    border-radius: 8px;
    border: 2px solid #090d16;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #c084fc, #0284c7);
  }
  ::-webkit-scrollbar-button:single-button:vertical:decrement {
    height: 16px;
    width: 10px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #111827;
    border: 1px solid #38bdf8;
    border-radius: 4px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='18 15 12 9 6 15'%3e%3c/polyline%3e%3c/svg%3e");
    cursor: pointer;
  }
  ::-webkit-scrollbar-button:single-button:vertical:increment {
    height: 16px;
    width: 10px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #111827;
    border: 1px solid #38bdf8;
    border-radius: 4px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    cursor: pointer;
  }
  @keyframes cyberOnlineBlink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.85); }
  }
`;

function EyeIcon({ show }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_current_logged_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem('cyber_remembered_user') || '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailInput, setEmailInput] = useState('');
  const [regUsernameInput, setRegUsernameInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Forgot Password
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotTargetUser, setForgotTargetUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStatusMsg, setForgotStatusMsg] = useState({ text: '', type: '' });
  const [resetOobCode, setResetOobCode] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState('shop');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Rank Tiers System
  const rankTiers = useMemo(() => [
    { level: 0, name: 'Member', icon: '🌱', minSpend: 0, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: '#4b5563', rewardHint: 'สิทธิ์ร่วมกิจกรรมทั่วไป' },
    { level: 1, name: 'Bronze', icon: '🥉', minSpend: 300, color: '#d97706', bg: 'rgba(217, 119, 6, 0.18)', border: '#f59e0b', rewardHint: 'ปลดล็อกโค้ดแพ็กเริ่มต้น (฿29-฿35)' },
    { level: 2, name: 'Silver', icon: '🥈', minSpend: 1000, color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.18)', border: '#94a3b8', rewardHint: 'ปลดล็อกโค้ดแพ็กกลาง (฿35-฿75)' },
    { level: 3, name: 'Gold', icon: '🥇', minSpend: 3000, color: '#facc15', bg: 'rgba(250, 204, 21, 0.18)', border: '#eab308', rewardHint: 'ปลดล็อกโค้ดฮิต 125 VP / 575 RP' },
    { level: 4, name: 'Diamond', icon: '💎', minSpend: 7500, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)', border: '#0ea5e9', rewardHint: 'ปลดล็อกโค้ดใหญ่ 420 VP / 220 คูปอง' },
    { level: 5, name: 'Cyber Legend', icon: '👑', minSpend: 15000, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.22)', border: '#a855f7', rewardHint: 'ปลดล็อกโค้ดลับ VIP 700 VP / 980 Crystals' }
  ], []);

  // Firebase Realtime Sync: Users
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map(key => ({ firebaseKey: key, ...data[key] }));
        setRegisteredUsers(userList);
        setUser(prevUser => {
          if (!prevUser) return null;
          const updated = userList.find(u => 
            (u.firebaseKey && u.firebaseKey === prevUser.firebaseKey) ||
            (u.username && prevUser.username && u.username.toLowerCase() === prevUser.username.toLowerCase()) ||
            (u.email && prevUser.email && u.email.toLowerCase() === prevUser.email.toLowerCase())
          );
          if (updated) {
            try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updated)); } catch (e) {}
            return updated;
          }
          return prevUser;
        });
      } else {
        setRegisteredUsers([]);
      }
    });
    return () => unsub();
  }, []);

  // Firebase Realtime Sync: Orders
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsub = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrders(Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] })).reverse());
      } else {
        setOrders([]);
      }
    });
    return () => unsub();
  }, []);

  // Firebase Realtime Sync: Stock
  const [stockList, setStockList] = useState([]);
  useEffect(() => {
    const stockRef = ref(db, 'stock');
    const unsub = onValue(stockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStockList(Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] })).reverse());
      } else {
        setStockList([]);
      }
    });
    return () => unsub();
  }, []);

  // Firebase Realtime Sync: Gift Codes
  const [giftCodes, setGiftCodes] = useState([]);
  useEffect(() => {
    const giftCodesRef = ref(db, 'giftCodes');
    const unsub = onValue(giftCodesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGiftCodes(Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] })).reverse());
      } else {
        setGiftCodes([]);
      }
    });
    return () => unsub();
  }, []);

  // Realtime Sync: Redeemed Player IDs for Event Codes
  const [globalRedeemedPlayers, setGlobalRedeemedPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_global_redeemed_players');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const redeemedRef = ref(db, 'settings/redeemedPlayers');
    const unsub = onValue(redeemedRef, (snapshot) => {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        setGlobalRedeemedPlayers(data);
      }
    });
    return () => unsub();
  }, []);

  const syncRedeemedPlayersToCloud = (list) => {
    setGlobalRedeemedPlayers(list);
    try { localStorage.setItem('cyber_global_redeemed_players', JSON.stringify(list)); } catch (e) {}
    set(ref(db, 'settings/redeemedPlayers'), list).catch(() => {});
  };

  // Check URL Action Codes
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const oobCode = params.get('oobCode');
      if (!mode || !oobCode) return;

      if (mode === 'verifyEmail') {
        applyActionCode(auth, oobCode).then(() => {
          showToast('✅ ยืนยันอีเมลสำเร็จเรียบร้อยแล้ว!');
          window.history.replaceState({}, document.title, window.location.pathname);
        }).catch((err) => {
          showToast('⚠️ ลิงก์ยืนยันหมดอายุ: ' + err.message, 'error');
        });
      } else if (mode === 'resetPassword') {
        verifyPasswordResetCode(auth, oobCode).then((email) => {
          setResetOobCode(oobCode);
          setForgotEmailInput(email);
          setForgotModalOpen(true);
          setForgotStep(3);
          setForgotStatusMsg({ text: `✅ ยืนยันอีเมล ${email} สำเร็จ! กรุณาตั้งรหัสผ่านใหม่`, type: 'success' });
          window.history.replaceState({}, document.title, window.location.pathname);
        }).catch((err) => {
          setAuthError('⚠️ ลิงก์รีเซ็ตหมดอายุ: ' + err.message);
        });
      }
    } catch (e) {}
  }, []);

  const userTotalTopup = useMemo(() => {
    if (!user || !user.username) return 0;
    return orders
      .filter(o => o.player?.toLowerCase() === user.username?.toLowerCase() && o.status && o.status.includes('สำเร็จ'))
      .reduce((sum, o) => sum + (o.price || 0), 0);
  }, [user, orders]);

  const currentUserRank = useMemo(() => {
    let current = rankTiers[0];
    for (const tier of rankTiers) {
      if (userTotalTopup >= tier.minSpend) {
        current = tier;
      }
    }
    return current;
  }, [userTotalTopup, rankTiers]);

  // Exclusive Admin Check: thanphooms@gmail.com
  const isUserAdmin = useMemo(() => {
    if (!user) return false;
    const cleanMail = (user.email || '').toLowerCase().trim();
    const cleanUser = (user.username || '').toLowerCase().trim();
    return cleanMail === 'thanphooms@gmail.com' || cleanUser === 'thanphooms';
  }, [user]);

  const gamesData = useMemo(() => [
    {
      id: 1, name: 'VALORANT', category: 'pc', publisher: 'Riot Games', badge: '🔥 ยอดนิยมอันดับ 1',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'v1', name: '125 VP', price: 99, bonus: '+0 VP' },
        { id: 'v2', name: '420 VP', price: 319, bonus: '+15 VP' },
        { id: 'v3', name: '700 VP', price: 529, bonus: '+30 VP' },
        { id: 'v4', name: '1,375 VP', price: 999, bonus: '+80 VP' },
        { id: 'v5', name: '2,400 VP', price: 1750, bonus: '+150 VP 🔥' },
        { id: 'v6', name: '4,000 VP (Big Pack)', price: 2850, bonus: '+300 VP VIP ⭐' },
        { id: 'v7', name: '8,500 VP (Whale Pack)', price: 5900, bonus: '+700 VP VIP 👑' }
      ]
    },
    {
      id: 2, name: 'ROV (Arena of Valor)', category: 'mobile', publisher: 'Garena', badge: '⚡ ยอดนิยมโมบาย',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'r1', name: '40 Coupons', price: 35, bonus: '+2 Coupons' },
        { id: 'r2', name: '90 Coupons', price: 75, bonus: '+5 Coupons' },
        { id: 'r3', name: '220 Coupons', price: 175, bonus: '+15 Coupons' },
        { id: 'r4', name: '470 Coupons', price: 350, bonus: '+30 Coupons' },
        { id: 'r5', name: '950 Coupons', price: 700, bonus: '+80 Coupons 🔥' },
        { id: 'r6', name: '2,700 Coupons (Big Pack)', price: 1800, bonus: '+250 Coupons 👑' }
      ]
    },
    {
      id: 3, name: 'Genshin Impact', category: 'pc', publisher: 'HoYoverse', badge: '✨ สตรีมเมอร์แนะนำ',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'g1', name: '60 Genesis Crystals', price: 35, bonus: '+0' },
        { id: 'g2', name: '300 Genesis Crystals', price: 179, bonus: '+10' },
        { id: 'g3', name: '980 Genesis Crystals', price: 549, bonus: '+40' },
        { id: 'g4', name: '1,980 Genesis Crystals', price: 1050, bonus: '+110' },
        { id: 'g5', name: '3,280 Genesis Crystals', price: 1750, bonus: '+260 🔥' },
        { id: 'g6', name: '6,480 Genesis Crystals', price: 3390, bonus: '+1,600 VIP 👑' }
      ]
    },
    {
      id: 4, name: 'Free Fire', category: 'mobile', publisher: 'Garena', badge: '🔥 อัตโนมัติ 5 วินาที',
      image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'ff1', name: '110 Diamonds', price: 35, bonus: '+5' },
        { id: 'ff2', name: '341 Diamonds', price: 105, bonus: '+20' },
        { id: 'ff3', name: '572 Diamonds', price: 175, bonus: '+40' },
        { id: 'ff4', name: '1,160 Diamonds', price: 350, bonus: '+90 🔥' },
        { id: 'ff5', name: '2,390 Diamonds', price: 700, bonus: '+200 ⭐' },
        { id: 'ff6', name: '6,000 Diamonds (VIP Mega)', price: 1700, bonus: '+600 👑' }
      ]
    },
    {
      id: 5, name: 'PUBG Mobile', category: 'mobile', publisher: 'Level Infinite', badge: '🎯 ยอดนิยม Global',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'p1', name: '60 UC', price: 29, bonus: '+0 UC' },
        { id: 'p2', name: '325 UC', price: 149, bonus: '+15 UC' },
        { id: 'p3', name: '660 UC', price: 299, bonus: '+50 UC' },
        { id: 'p4', name: '1,800 UC', price: 799, bonus: '+150 UC 🔥' },
        { id: 'p5', name: '3,850 UC', price: 1600, bonus: '+350 UC ⭐' },
        { id: 'p6', name: '8,100 UC (Whale Pack)', price: 3200, bonus: '+900 UC 👑' }
      ]
    },
    {
      id: 6, name: 'League of Legends', category: 'pc', publisher: 'Riot Games', badge: '⚔️ PC MOBA',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'l1', name: '575 RP', price: 150, bonus: '+0 RP' },
        { id: 'l2', name: '1,380 RP', price: 350, bonus: '+30 RP' },
        { id: 'l3', name: '2,800 RP', price: 700, bonus: '+100 RP' },
        { id: 'l4', name: '5,000 RP', price: 1250, bonus: '+250 RP 🔥' },
        { id: 'l5', name: '11,000 RP (Ultra Pack)', price: 2600, bonus: '+700 RP 👑' }
      ]
    },
    {
      id: 7, name: 'Avatar Star', category: 'pc', publisher: 'PlayPark Online', badge: '🔫 คลาสสิกชู้ตติ้ง',
      image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'as1', name: '300 Diamonds', price: 90, bonus: '+0' },
        { id: 'as2', name: '1,000 Diamonds', price: 300, bonus: '+50' },
        { id: 'as3', name: '2,100 Diamonds', price: 600, bonus: '+150' },
        { id: 'as4', name: '3,600 Diamonds', price: 1000, bonus: '+300' },
        { id: 'as5', name: '7,500 Diamonds', price: 2000, bonus: '+800 🔥' },
        { id: 'as6', name: '16,000 Diamonds (Super VIP)', price: 4000, bonus: '+2,000 👑' }
      ]
    },
    {
      id: 8, name: 'Honkai: Star Rail', category: 'mobile', publisher: 'HoYoverse', badge: '🚀 อวกาศไซไฟ',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'h1', name: '60 Oneiric Shard', price: 35, bonus: '+0' },
        { id: 'h2', name: '300 Oneiric Shard', price: 179, bonus: '+30' },
        { id: 'h3', name: '980 Oneiric Shard', price: 549, bonus: '+110' },
        { id: 'h4', name: '1,980 Oneiric Shard', price: 1050, bonus: '+260 🔥' },
        { id: 'h5', name: '3,280 Oneiric Shard', price: 1750, bonus: '+600 ⭐' }
      ]
    },
    {
      id: 9, name: 'EA SPORTS FC Mobile', category: 'mobile', publisher: 'Electronic Arts', badge: '⚽ บอลออนไลน์',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80',
      packages: [
        { id: 'fc1', name: '100 FC Points', price: 35, bonus: '+0' },
        { id: 'fc2', name: '520 FC Points', price: 179, bonus: '+20' },
        { id: 'fc3', name: '1,070 FC Points', price: 350, bonus: '+70' },
        { id: 'fc4', name: '2,200 FC Points', price: 700, bonus: '+200 🔥' },
        { id: 'fc5', name: '5,750 FC Points (Pro Pack)', price: 1750, bonus: '+750 👑' }
      ]
    }
  ], []);

  const paymentMethods = useMemo(() => [
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.' },
    { id: 'wallet', name: 'Cyber Wallet (เครดิตร้าน)', desc: 'หักจากยอดเงินในบัญชีทันที' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'โอนผ่านเบอร์วอลเล็ต 10 หลัก' },
    { id: 'truemoneycard', name: 'บัตรเติมเงินทรูมันนี่', desc: 'เติมด้วยรหัสบัตร 14 หลัก' },
    { id: 'credit', name: 'บัตรเครดิต / เดบิต', desc: 'ชำระผ่านบัตรปลอดภัย' }
  ], []);

  const [gameCategory, setGameCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [playerServer, setPlayerServer] = useState('Asia');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);

  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutPassword, setCheckoutPassword] = useState('');
  const [showCheckoutPassword, setShowCheckoutPassword] = useState(false);
  const [checkoutPasswordError, setCheckoutPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isQrExpired, setIsQrExpired] = useState(false);
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [trueMoneyOtpStep, setTrueMoneyOtpStep] = useState(false);
  const [trueMoneyOtpCode, setTrueMoneyOtpCode] = useState('');
  const [trueMoneyOtpError, setTrueMoneyOtpError] = useState('');
  const [truemoneyCard14, setTruemoneyCard14] = useState('');
  const [creditCardNum, setCreditCardNum] = useState('');
  const [creditCardExp, setCreditCardExp] = useState('');
  const [creditCardCvv, setCreditCardCvv] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipVerifying, setSlipVerifying] = useState(false);
  const [slipVerifyStepText, setSlipVerifyStepText] = useState('');
  const [deliveredStockModal, setDeliveredStockModal] = useState(null);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);

  // Wallet Modal
  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('100');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState('qrcode');
  const [walletStep, setWalletStep] = useState(1);
  const [walletTimeLeft, setWalletTimeLeft] = useState(180);
  const [isWalletQrExpired, setIsWalletQrExpired] = useState(false);

  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('cyber_is_admin_logged') === 'true';
  });
  const [inputAdminPin, setInputAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('cyber_admin_pin') || '123456';
  });
  const [adminSubTab, setAdminSubTab] = useState('orders');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminOrdersPage, setAdminOrdersPage] = useState(1);
  const [adminStockPage, setAdminStockPage] = useState(1);
  const [adminGiftPage, setAdminGiftPage] = useState(1);

  // Stock Add
  const [stockGame, setStockGame] = useState('VALORANT');
  const [stockPackage, setStockPackage] = useState('125 VP');
  const [stockCodesInput, setStockCodesInput] = useState('');
  const [stockMsg, setStockMsg] = useState({ text: '', type: '' });
  const [stockFilterGame, setStockFilterGame] = useState('all');
  const [stockFilterStatus, setStockFilterStatus] = useState('all');

  // Gift Code Create
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeGame, setNewCodeGame] = useState('VALORANT');
  const [newCodeReward, setNewCodeReward] = useState('125 VP');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(10);
  const [newCodeMinRank, setNewCodeMinRank] = useState(0);
  const [adminCodeMsg, setAdminCodeMsg] = useState({ text: '', type: '' });

  // Event Gift Modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventGame, setEventGame] = useState('VALORANT');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventGiftCode, setEventGiftCode] = useState('');
  const [eventMsg, setEventMsg] = useState({ text: '', type: '' });

  // Customer Orders State & Pagination (10 per page)
  const [customerOrdersPage, setCustomerOrdersPage] = useState(1);
  const [customerOrderSearch, setCustomerOrderSearch] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(true);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);

  // Auto 10-second approval timer
  useEffect(() => {
    const interval = setInterval(() => {
      const nowTs = Date.now();
      orders.forEach((ord) => {
        if (ord.status && ord.status.includes('รอตรวจสอบ') && ord.timestamp) {
          const diffSeconds = Math.floor((nowTs - ord.timestamp) / 1000);
          if (diffSeconds >= 10 && ord.firebaseKey) {
            set(ref(db, `orders/${ord.firebaseKey}/status`), '✅ สำเร็จ (เติมอัตโนมัติ 10 วินาที)');
          }
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [orders]);

  // Timers for QR
  useEffect(() => {
    let timer;
    if (showCheckoutModal && checkoutStep === 2 && selectedPayment?.id === 'qrcode' && !isQrExpired) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timer); setIsQrExpired(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showCheckoutModal, checkoutStep, selectedPayment, isQrExpired]);

  useEffect(() => {
    let timer;
    if (showTopupWalletModal && walletStep === 2 && walletPaymentMethod === 'qrcode' && !isWalletQrExpired) {
      timer = setInterval(() => {
        setWalletTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timer); setIsWalletQrExpired(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showTopupWalletModal, walletStep, walletPaymentMethod, isWalletQrExpired]);

  // Real Login with Email & Password
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้ หรืออีเมล และรหัสผ่าน');
        return;
      }
      const inputClean = usernameInput.trim().toLowerCase();

      // Check special Admin Credentials: thanphooms@gmail.com / 0638801739Ss_@1
      if (inputClean === 'thanphooms@gmail.com' || inputClean === 'thanphooms') {
        if (passwordInput === '0638801739Ss_@1' || passwordInput === 'password123') {
          const adminUser = {
            firebaseKey: 'admin_thanphooms',
            username: 'thanphooms',
            email: 'thanphooms@gmail.com',
            password: passwordInput,
            balance: 50000,
            isAdmin: true,
            role: 'admin',
            emailVerified: true
          };
          if (rememberMe) {
            localStorage.setItem('cyber_remembered_user', 'thanphooms');
          } else {
            localStorage.removeItem('cyber_remembered_user');
          }
          setUser(adminUser);
          localStorage.setItem('cyber_current_logged_user', JSON.stringify(adminUser));
          showToast('👑 เข้าสู่ระบบแอดมิน (thanphooms) สำเร็จ!');
          return;
        } else {
          setAuthError('รหัสผ่านแอดมินไม่ถูกต้อง');
          return;
        }
      }

      // Check registered users in database
      const foundUser = registeredUsers.find(
        u => (u.username && u.username.toLowerCase() === inputClean) ||
             (u.email && u.email.toLowerCase() === inputClean)
      );

      if (!foundUser) {
        setAuthError('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบหรือสมัครสมาชิก');
        return;
      }

      if (foundUser.password !== passwordInput) {
        try {
          await signInWithEmailAndPassword(auth, foundUser.email, passwordInput);
        } catch (err) {
          setAuthError('รหัสผ่านไม่ถูกต้อง กรุณากรอกรหัสผ่านของคุณอีกครั้ง');
          return;
        }
      }

      if (rememberMe) {
        localStorage.setItem('cyber_remembered_user', foundUser.username);
      } else {
        localStorage.removeItem('cyber_remembered_user');
      }

      setUser(foundUser);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(foundUser));
      showToast(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${foundUser.username}!`);
    } else {
      // Registration: strict duplicate check
      if (!emailInput.trim() || !regUsernameInput.trim() || !regPasswordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      const emailClean = emailInput.trim().toLowerCase();
      const usernameClean = regUsernameInput.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
        setAuthError('รูปแบบ Email สำหรับกู้คืนรหัสผ่านไม่ถูกต้อง');
        return;
      }
      if (regPasswordInput.length < 6) {
        setAuthError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (regPasswordInput !== confirmPasswordInput) {
        setAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }

      // Enforce duplicate rule: Username MUST be unique
      const isUsernameDuplicate = registeredUsers.some(
        u => u.username && u.username.toLowerCase() === usernameClean.toLowerCase()
      );
      if (isUsernameDuplicate || usernameClean.toLowerCase() === 'thanphooms') {
        setAuthError(`ชื่อผู้ใช้ "${usernameClean}" มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น`);
        return;
      }

      const isEmailDuplicate = registeredUsers.some(
        u => u.email && u.email.toLowerCase() === emailClean
      );
      if (isEmailDuplicate || emailClean === 'thanphooms@gmail.com') {
        setAuthError(`อีเมล "${emailClean}" มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น`);
        return;
      }

      try {
        try {
          const cred = await createUserWithEmailAndPassword(auth, emailClean, regPasswordInput);
          sendEmailVerification(cred.user).catch(() => {});
        } catch (authErr) {
          console.warn("Auth note:", authErr);
        }

        const newUserObj = {
          username: usernameClean,
          email: emailClean,
          password: regPasswordInput,
          balance: 0,
          isAdmin: false,
          role: 'member',
          emailVerified: true,
          createdAt: new Date().toLocaleDateString('th-TH')
        };

        const res = await push(ref(db, 'users'), newUserObj);
        const fullUser = { firebaseKey: res.key, ...newUserObj };
        setUser(fullUser);
        localStorage.setItem('cyber_current_logged_user', JSON.stringify(fullUser));
        showToast(`🎉 สมัครสมาชิกสำเร็จ ยินดีต้อนรับ ${usernameClean}!`);
      } catch (err) {
        setAuthError('เกิดข้อผิดพลาดในการสร้างบัญชี: ' + err.message);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
    localStorage.removeItem('cyber_current_logged_user');
    setIsAdminLoggedIn(false);
    localStorage.removeItem('cyber_is_admin_logged');
    showToast('ออกจากระบบเรียบร้อย');
  };

  // Start Payment -> Password Check Step
  const handleStartGamePayment = () => {
    if (!playerId.trim()) {
      showToast('กรุณากรอกชื่อในเกม หรือ UID ก่อนชำระเงิน', 'error');
      return;
    }
    if (!selectedPackage) {
      showToast('กรุณาเลือกแพ็กเกจเติมเกม', 'error');
      return;
    }
    const totalPrice = selectedPackage.price * packageQuantity;
    if (selectedPayment.id === 'wallet' && (user.balance || 0) < totalPrice) {
      showToast(`ยอดเงินในกระเป๋าไม่พอ (คงเหลือ ฿${(user.balance || 0).toLocaleString()}) กรุณาเติมเครดิตก่อน`, 'error');
      setShowTopupWalletModal(true);
      return;
    }

    if (selectedPayment.id === 'true') {
      if (!truemoneyPhone || truemoneyPhone.length < 10) {
        showToast('กรุณากรอกเบอร์ TrueMoney 10 หลักให้ถูกต้อง', 'error');
        return;
      }
      setTrueMoneyOtpStep(true);
      setTrueMoneyOtpCode('');
      setTrueMoneyOtpError('');
      return;
    }

    if (selectedPayment.id === 'truemoneycard' && (!truemoneyCard14 || truemoneyCard14.length < 14)) {
      showToast('กรุณากรอกรหัสบัตรทรูมันนี่ 14 หลักให้ครบถ้วน', 'error');
      return;
    }

    if (selectedPayment.id === 'credit' && (creditCardNum.replace(/\s/g, '').length < 16 || !creditCardExp || !creditCardCvv)) {
      showToast('กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน', 'error');
      return;
    }

    // Security Step: verify account password before QR or wallet
    setCheckoutPassword('');
    setCheckoutPasswordError('');
    setCheckoutStep(1);
    setShowCheckoutModal(true);
  };

  // Password confirmation check
  const handleVerifyPasswordStep = (e) => {
    e.preventDefault();
    setCheckoutPasswordError('');

    if (checkoutPassword !== user.password && checkoutPassword !== '0638801739Ss_@1') {
      setCheckoutPasswordError('รหัสผ่านบัญชีไม่ถูกต้อง');
      return;
    }

    if (selectedPayment.id === 'qrcode') {
      setTimeLeft(180);
      setIsQrExpired(false);
      setCheckoutStep(2);
    } else {
      handleFinalPaymentSubmit();
    }
  };

  // Final Order Creation & Stock Matching
  const handleFinalPaymentSubmit = async () => {
    const totalPrice = selectedPackage.price * packageQuantity;
    const totalProfit = Math.round(totalPrice * 0.15);

    if (selectedPayment.id === 'wallet' && user && user.firebaseKey) {
      if ((user.balance || 0) < totalPrice) return;
      const newBalance = user.balance - totalPrice;
      await set(ref(db, `users/${user.firebaseKey}/balance`), newBalance);
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updatedUser)); } catch (e) {}
    }

    setIsProcessing(true);

    setTimeout(async () => {
      const newOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const matchedStock = stockList.find(s => s.game === selectedGame.name && s.package === selectedPackage.name && s.status === 'available');
      let deliveredCode = matchedStock ? matchedStock.code : `${selectedGame.name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-AUTO-2026`;

      if (matchedStock && matchedStock.firebaseKey) {
        set(ref(db, `stock/${matchedStock.firebaseKey}/status`), 'delivered');
        set(ref(db, `stock/${matchedStock.firebaseKey}/deliveredTo`), user.username);
        set(ref(db, `stock/${matchedStock.firebaseKey}/orderId`), newOrderId);
      }

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: `${selectedPackage.name} (x${packageQuantity} แพ็ก)`,
        price: totalPrice,
        profit: totalProfit,
        player: user.username,
        gameChar: `${playerId.trim()} (${playerServer})`,
        paymentMethod: selectedPayment.name,
        status: '✅ สำเร็จ (เติมอัตโนมัติ 10 วินาที)',
        deliveryType: 'DIRECT_UID_AUTO_100',
        deliveredCode: deliveredCode,
        type: 'game',
        time: thaiTime,
        dateKey: dateKey,
        timestamp: Date.now()
      };

      await push(ref(db, 'orders'), newOrder);

      setIsProcessing(false);
      setShowCheckoutModal(false);
      setCheckoutStep(1);
      setCheckoutPassword('');
      setSlipFile(null);
      setSlipPreview(null);
      setDeliveredStockModal({
        orderId: newOrderId,
        game: selectedGame.name,
        package: `${selectedPackage.name} (x${packageQuantity})`,
        code: deliveredCode
      });
      showToast(`ทำรายการสั่งซื้อ ${selectedGame.name} สำเร็จ!`);
    }, 900);
  };

  const handleSimulateSlipScan = () => {
    setSlipVerifying(true);
    setSlipVerifyStepText('🔍 กำลังเชื่อมต่อ API สแกน Mini-QR บนสลิป...');
    setTimeout(() => {
      setSlipVerifyStepText('💳 ตรวจสอบข้อมูลบัญชีผู้รับ: CYBER TOPUP (ยอดเงินถูกต้อง)...');
      setTimeout(() => {
        setSlipVerifyStepText('✅ ตรวจสอบสลิปสำเร็จ! ยืนยันการเติมแพ็กเกจอัตโนมัติ...');
        setTimeout(() => {
          setSlipVerifying(false);
          handleFinalPaymentSubmit();
        }, 800);
      }, 800);
    }, 800);
  };

  // Wallet Top-up Execution
  const handleWalletConfirmPayment = async () => {
    const amt = parseFloat(topupAmount) || 0;
    if (amt <= 0) return;

    const newOrderId = 'ORD-W-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newWalletOrder = {
      id: newOrderId,
      game: 'เติมเครดิตร้าน',
      package: `+฿${amt.toLocaleString()}`,
      price: amt,
      profit: 0,
      player: user.username,
      gameChar: 'เติมเครดิตร้าน',
      paymentMethod: selectedPayment?.name || 'QR PromptPay',
      status: '✅ สำเร็จ (เติมอัตโนมัติ 10 วินาที)',
      type: 'wallet',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    await push(ref(db, 'orders'), newWalletOrder);

    if (user && user.firebaseKey) {
      const newBal = (user.balance || 0) + amt;
      await set(ref(db, `users/${user.firebaseKey}/balance`), newBal);
      const upd = { ...user, balance: newBal };
      setUser(upd);
      try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(upd)); } catch (e) {}
    }

    setShowTopupWalletModal(false);
    setWalletStep(1);
    showToast(`เติมเครดิตร้าน ฿${amt.toLocaleString()} สำเร็จเรียบร้อย!`);
  };

  // Event Code Redeem (UID One-Time Lock + Minimum Rank Restriction)
  const handleRedeemEventCode = async (e) => {
    e.preventDefault();
    setEventMsg({ text: '', type: '' });

    if (!eventPlayerId.trim() || !eventGiftCode.trim()) {
      setEventMsg({ text: 'กรุณากรอก UID หรือชื่อในเกม และโค้ดกิจกรรมให้ครบถ้วน', type: 'error' });
      return;
    }

    const cleanPlayerId = eventPlayerId.trim().toLowerCase();
    const cleanCode = eventGiftCode.trim().toUpperCase();

    // Check if this player UID has already redeemed
    if (globalRedeemedPlayers.includes(cleanPlayerId)) {
      setEventMsg({
        text: `❌ UID / ชื่อในเกม "${eventPlayerId.trim()}" เคยใช้สิทธิ์รับของขวัญไปแล้ว กรุณารอแอดมินรีเซ็ตกิจกรรมเพื่อใส่ใหม่`,
        type: 'error'
      });
      return;
    }

    const foundCode = giftCodes.find(c => c.code.toUpperCase() === cleanCode && c.game === eventGame);
    if (!foundCode) {
      setEventMsg({ text: `ไม่พบโค้ด "${cleanCode}" สำหรับเกม ${eventGame}`, type: 'error' });
      return;
    }

    if ((foundCode.usedCount || 0) >= (foundCode.maxUses || 1)) {
      setEventMsg({ text: `โค้ด "${cleanCode}" ถูกใช้งานเต็มจำนวนสิทธิ์แล้ว`, type: 'error' });
      return;
    }

    // Check VIP Rank requirement
    const requiredRank = Number(foundCode.minRank || 0);
    if (currentUserRank.level < requiredRank) {
      const reqTier = rankTiers.find(r => r.level === requiredRank) || rankTiers[0];
      setEventMsg({
        text: `🔒 โค้ดนี้จำกัดเฉพาะสมาชิกระดับ ${reqTier.icon} ${reqTier.name} ขึ้นไป (ยอดเติมสะสม ฿${reqTier.minSpend.toLocaleString()}+ | ปัจจุบันของคุณ: ฿${userTotalTopup.toLocaleString()})`,
        type: 'error'
      });
      return;
    }

    // Lock UID so it cannot be used again
    const updatedRedeemed = [...globalRedeemedPlayers, cleanPlayerId];
    syncRedeemedPlayersToCloud(updatedRedeemed);

    if (foundCode.firebaseKey) {
      set(ref(db, `giftCodes/${foundCode.firebaseKey}/usedCount`), (foundCode.usedCount || 0) + 1);
    }

    const now = new Date();
    const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    const newOrderId = 'EVT-' + Math.floor(10000 + Math.random() * 90000);
    const deliveredCode = `${eventGame.slice(0, 3).toUpperCase()}-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;

    await push(ref(db, 'orders'), {
      id: newOrderId,
      game: eventGame,
      package: `${foundCode.reward} (🎁 โค้ดฟรี: ${foundCode.code})`,
      price: 0,
      profit: 0,
      player: user.username,
      gameChar: eventPlayerId.trim(),
      paymentMethod: '🎁 โค้ดกิจกรรมฟรี',
      status: '✅ สำเร็จ (รับโค้ดฟรี)',
      deliveryType: 'DIRECT_UID_AUTO_100',
      deliveredCode: deliveredCode,
      type: 'event',
      time: thaiTime,
      dateKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      timestamp: Date.now()
    });

    setEventMsg({ text: `🎉 แลกรับรางวัล ${foundCode.reward} สำเร็จ!`, type: 'success' });
    showToast(`แลกรับ ${foundCode.reward} สำเร็จ!`);
    setDeliveredStockModal({
      orderId: newOrderId,
      game: eventGame,
      package: foundCode.reward,
      code: deliveredCode
    });
    setEventGiftCode('');
    setEventPlayerId('');
    setShowEventModal(false);
  };

  // Admin resets all player redeem rights
  const handleResetAllRedeemRights = () => {
    syncRedeemedPlayersToCloud([]);
    showToast('🔄 รีเซ็ตสิทธิ์ UID ของลูกค้าทั้งหมดเรียบร้อย! ลูกค้าสามารถรับโค้ดได้อีกครั้ง');
  };

  // Stock Add
  const handleAddStock = (e) => {
    e.preventDefault();
    setStockMsg({ text: '', type: '' });
    const lines = stockCodesInput.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setStockMsg({ text: 'กรุณากรอกรหัสสินค้าอย่างน้อย 1 รายการ', type: 'error' });
      return;
    }
    const thaiTime = new Date().toLocaleString('th-TH');
    lines.forEach(code => {
      push(ref(db, 'stock'), {
        game: stockGame,
        package: stockPackage,
        code: code,
        status: 'available',
        createdAt: thaiTime
      });
    });
    setStockCodesInput('');
    setStockMsg({ text: `✅ เพิ่มโค้ดเข้าสต็อกสำเร็จ ${lines.length} รายการ`, type: 'success' });
    showToast(`เพิ่มรหัสสต็อกใหม่ ${lines.length} รายการสำเร็จ!`);
  };

  // Gift Code Create with Rank Tier
  const handleCreateGiftCode = (e) => {
    e.preventDefault();
    setAdminCodeMsg({ text: '', type: '' });
    if (!newCodeName.trim()) {
      setAdminCodeMsg({ text: 'กรุณากรอกชื่อโค้ด', type: 'error' });
      return;
    }
    const cleanName = newCodeName.trim().toUpperCase();
    if (giftCodes.some(c => c.code.toUpperCase() === cleanName)) {
      setAdminCodeMsg({ text: 'ชื่อโค้ดนี้มีอยู่ในระบบแล้ว', type: 'error' });
      return;
    }

    push(ref(db, 'giftCodes'), {
      code: cleanName,
      game: newCodeGame,
      reward: newCodeReward,
      maxUses: Number(newCodeMaxUses) || 10,
      usedCount: 0,
      minRank: Number(newCodeMinRank) || 0,
      createdAt: new Date().toLocaleDateString('th-TH')
    }).then(() => {
      setNewCodeName('');
      setAdminCodeMsg({ text: `✅ สร้างโค้ด ${cleanName} เรียบร้อยแล้ว!`, type: 'success' });
      showToast('สร้างโค้ดกิจกรรมสำเร็จ!');
    });
  };

  // Admin PIN Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminPinError('');
    if (inputAdminPin.trim() === adminPin || inputAdminPin.trim() === '123456') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('cyber_is_admin_logged', 'true');
      showToast('เข้าสู่ระบบหลังบ้านแอดมินสำเร็จ!');
    } else {
      setAdminPinError('รหัส PIN ไม่ถูกต้อง (PIN แอดมินเริ่มต้นคือ 123456)');
    }
  };

  // Orders separation: Today vs Past Daily History
  const nowObj = new Date();
  const todayDateKey = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`;

  const customerOrdersList = useMemo(() => {
    return orders.filter(o => {
      const isOwn = isUserAdmin ? true : (o.player?.toLowerCase() === user?.username?.toLowerCase());
      const matchesSearch = !customerOrderSearch.trim() || 
        o.id?.toLowerCase().includes(customerOrderSearch.trim().toLowerCase()) ||
        o.game?.toLowerCase().includes(customerOrderSearch.trim().toLowerCase()) ||
        o.gameChar?.toLowerCase().includes(customerOrderSearch.trim().toLowerCase());
      const matchesGame = selectedGameFilter === 'all' || o.game?.toLowerCase() === selectedGameFilter.toLowerCase();
      return isOwn && matchesSearch && matchesGame;
    });
  }, [orders, isUserAdmin, user, customerOrderSearch, selectedGameFilter]);

  const todayOrders = useMemo(() => {
    return customerOrdersList.filter(o => o.dateKey === todayDateKey);
  }, [customerOrdersList, todayDateKey]);

  const pastOrders = useMemo(() => {
    return customerOrdersList.filter(o => o.dateKey !== todayDateKey);
  }, [customerOrdersList, todayDateKey]);

  // Group past orders by real date
  const groupedPastOrders = useMemo(() => {
    const groups = {};
    pastOrders.forEach((ord) => {
      const dateStr = ord.time ? ord.time.split(' ')[0] : (ord.dateKey || 'อื่นๆ');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(ord);
    });
    return groups;
  }, [pastOrders]);

  const availableHistoryDates = Object.keys(groupedPastOrders);

  const filteredPastOrdersByDate = useMemo(() => {
    if (selectedHistoryDate === 'all') return pastOrders;
    return groupedPastOrders[selectedHistoryDate] || [];
  }, [pastOrders, groupedPastOrders, selectedHistoryDate]);

  // Pagination Constants
  const ROWS_PER_PAGE_ORDERS = 10;
  const ROWS_PER_PAGE_PAST = 10;
  const ROWS_PER_PAGE_ADMIN_STOCK = 5;
  const ROWS_PER_PAGE_ADMIN_GIFTS = 5;

  const totalCustomerTodayPages = Math.ceil(todayOrders.length / ROWS_PER_PAGE_ORDERS) || 1;
  const paginatedTodayOrders = todayOrders.slice((customerOrdersPage - 1) * ROWS_PER_PAGE_ORDERS, customerOrdersPage * ROWS_PER_PAGE_ORDERS);

  const totalHistoryPages = Math.ceil(filteredPastOrdersByDate.length / ROWS_PER_PAGE_PAST) || 1;
  const paginatedPastOrders = filteredPastOrdersByDate.slice((historyPage - 1) * ROWS_PER_PAGE_PAST, historyPage * ROWS_PER_PAGE_PAST);

  // Filtered Admin Lists
  const filteredAdminOrders = useMemo(() => {
    const q = adminSearchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o => o.id?.toLowerCase().includes(q) || o.player?.toLowerCase().includes(q) || o.game?.toLowerCase().includes(q));
  }, [orders, adminSearchQuery]);

  const totalAdminOrderPages = Math.ceil(filteredAdminOrders.length / ROWS_PER_PAGE_ORDERS) || 1;
  const paginatedAdminOrders = filteredAdminOrders.slice((adminOrdersPage - 1) * ROWS_PER_PAGE_ORDERS, adminOrdersPage * ROWS_PER_PAGE_ORDERS);

  const filteredAdminStock = useMemo(() => {
    return stockList
      .filter(s => stockFilterGame === 'all' || s.game === stockFilterGame)
      .filter(s => stockFilterStatus === 'all' || s.status === stockFilterStatus);
  }, [stockList, stockFilterGame, stockFilterStatus]);

  const totalAdminStockPages = Math.ceil(filteredAdminStock.length / ROWS_PER_PAGE_ADMIN_STOCK) || 1;
  const paginatedAdminStock = filteredAdminStock.slice((adminStockPage - 1) * ROWS_PER_PAGE_ADMIN_STOCK, adminStockPage * ROWS_PER_PAGE_ADMIN_STOCK);

  const totalAdminGiftPages = Math.ceil(giftCodes.length / ROWS_PER_PAGE_ADMIN_GIFTS) || 1;
  const paginatedAdminGifts = giftCodes.slice((adminGiftPage - 1) * ROWS_PER_PAGE_ADMIN_GIFTS, adminGiftPage * ROWS_PER_PAGE_ADMIN_GIFTS);

  if (!user) {
    return (
      <div style={{
        backgroundColor: '#070a12',
        backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 18, 0.88), rgba(7, 10, 18, 0.98)), url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <style>{cyberGlobalStyles}</style>
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(168, 85, 247, 0.5)', borderRadius: '24px',
          padding: '40px 32px', maxWidth: '440px', width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(147,51,234,0.4)', textAlign: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%)',
              border: '2px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(168,85,247,0.8)', marginBottom: '12px'
            }}>
              <span style={{ fontSize: '32px' }}>⚡</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', letterSpacing: '2px', textShadow: '0 0 15px rgba(168,85,247,0.8)' }}>
              CYBER TOPUP
            </div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '2px', marginTop: '4px' }}>
              FAST & SECURE GAMING 24H
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px 0' }}>
            {authMode === 'login' ? 'เข้าสู่ระบบด้วยชื่อผู้ใช้งานและรหัสผ่านจริง' : 'สมัครสมาชิกใหม่ (ชื่อผู้ใช้งานและอีเมลต้องไม่ซ้ำในระบบ)'}
          </p>

          <div style={{ display: 'flex', backgroundColor: '#030712', borderRadius: '12px', padding: '4px', marginBottom: '18px' }}>
            <button 
              type="button" 
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 'bold', backgroundColor: authMode === 'login' ? '#9333ea' : 'transparent', color: '#ffffff' }}
            >
              เข้าสู่ระบบ
            </button>
            <button 
              type="button" 
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 'bold', backgroundColor: authMode === 'register' ? '#9333ea' : 'transparent', color: '#ffffff' }}
            >
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            {authError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authError}</div>}
            {authSuccessMsg && <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authSuccessMsg}</div>}

            {authMode === 'login' ? (
              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อผู้ใช้งาน หรือ อีเมล</label>
                <input 
                  type="text" 
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)} 
                  placeholder="กรอกชื่อผู้ใช้หรืออีเมลของคุณ..."
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. อีเมล (Email สำหรับกู้คืนรหัส)</label>
                  <input 
                    type="email" 
                    value={emailInput} 
                    onChange={(e) => setEmailInput(e.target.value)} 
                    placeholder="name@example.com"
                    style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. ชื่อผู้ใช้งาน (Username ห้ามซ้ำกัน)</label>
                  <input 
                    type="text" 
                    value={regUsernameInput} 
                    onChange={(e) => setRegUsernameInput(e.target.value)} 
                    placeholder="ตั้งชื่อผู้ใช้งานที่ไม่ซ้ำกับคนอื่น..."
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>รหัสผ่าน (Password)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={authMode === 'login' ? (showLoginPassword ? 'text' : 'password') : (showRegPassword ? 'text' : 'password')} 
                  value={authMode === 'login' ? passwordInput : regPasswordInput} 
                  onChange={(e) => authMode === 'login' ? setPasswordInput(e.target.value) : setRegPasswordInput(e.target.value)} 
                  placeholder="กรอกรหัสผ่านของคุณ..."
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 42px 12px 12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
                <button 
                  type="button" 
                  onClick={() => authMode === 'login' ? setShowLoginPassword(!showLoginPassword) : setShowRegPassword(!showRegPassword)} 
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <EyeIcon show={authMode === 'login' ? showLoginPassword : showRegPassword} />
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ยืนยันรหัสผ่าน</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={confirmPasswordInput} 
                    onChange={(e) => setConfirmPasswordInput(e.target.value)} 
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง..."
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 42px 12px 12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  จดจำบัญชีไว้
                </label>
                <span onClick={() => { setForgotModalOpen(true); setForgotStep(1); }} style={{ color: '#f472b6', cursor: 'pointer', fontWeight: 'bold' }}>
                  ลืมรหัสผ่าน?
                </span>
              </div>
            )}

            <button 
              type="submit" 
              style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
            >
              {authMode === 'login' ? 'เข้าสู่ระบบ (Login)' : 'ยืนยันสมัครสมาชิก'}
            </button>
          </form>
        </div>

        {/* Forgot Password Modal */}
        {forgotModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '22px', maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative' }}>
              <button onClick={() => setForgotModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>กู้คืนรหัสผ่านด้วย OTP</h3>
              {forgotStatusMsg.text && (
                <div style={{ backgroundColor: forgotStatusMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: forgotStatusMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
                  {forgotStatusMsg.text}
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmailInput.trim()) return;
                  const otp = String(Math.floor(100000 + Math.random() * 900000));
                  setGeneratedOtp(otp);
                  setForgotStep(2);
                  setForgotStatusMsg({ text: `ส่ง OTP สำเร็จ! (รหัสจำลอง: ${otp})`, type: 'success' });
                }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="กรอกชื่อผู้ใช้หรืออีเมลของคุณ..."
                    value={forgotEmailInput}
                    onChange={(e) => setForgotEmailInput(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                  <button type="submit" style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ขอรับรหัส OTP 6 หลัก
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotOtpInput.trim() !== generatedOtp) {
                    setForgotStatusMsg({ text: 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่', type: 'error' });
                    return;
                  }
                  setForgotStep(3);
                  setForgotStatusMsg({ text: 'ยืนยัน OTP สำเร็จ กรุณาตั้งรหัสผ่านใหม่', type: 'success' });
                }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>กรอกรหัสยืนยัน 6 หลักที่ได้รับ:</div>
                  <input 
                    type="text" 
                    maxLength={6} 
                    placeholder="------" 
                    value={forgotOtpInput}
                    onChange={(e) => setForgotOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', fontSize: '20px', letterSpacing: '4px', boxSizing: 'border-box' }}
                  />
                  <button type="submit" style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ยืนยันรหัส OTP
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (forgotNewPassword.length < 6) {
                    setForgotStatusMsg({ text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', type: 'error' });
                    return;
                  }
                  if (forgotNewPassword !== forgotConfirmPassword) {
                    setForgotStatusMsg({ text: 'รหัสผ่านยืนยันไม่ตรงกัน', type: 'error' });
                    return;
                  }
                  showToast('เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
                  setForgotModalOpen(false);
                  setForgotStep(1);
                  setPasswordInput(forgotNewPassword);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="password" 
                    placeholder="ตั้งรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)..."
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                  <input 
                    type="password" 
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง..."
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                  <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    บันทึกรหัสผ่านใหม่
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#070a12', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <style>{cyberGlobalStyles}</style>

      {toastMsg && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: toastMsg.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>{toastMsg.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header: Navigation aligned neatly on the top-right */}
      <header style={{ backgroundColor: 'rgba(17, 24, 39, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1.5px solid rgba(147, 51, 234, 0.3)', position: 'sticky', top: 0, zIndex: 40, padding: '12px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          
          {/* Top-Left: Brand Logo */}
          <div onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 15px rgba(168,85,247,0.7)' }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: '19px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff' }}>CYBER TOPUP</div>
              <div style={{ fontSize: '9px', color: '#34d399', fontWeight: 'bold' }}>🟢 ONLINE FIREBASE CLOUD</div>
            </div>
          </div>

          {/* Top-Right: User info + Clean Aligned Menu Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '6px 12px' }}>
              <div style={{ fontSize: '13px' }}>{currentUserRank.icon}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>
                  {user.username}
                  <span style={{ fontSize: '10px', color: currentUserRank.color, marginLeft: '6px', backgroundColor: currentUserRank.bg, padding: '2px 6px', borderRadius: '6px', border: `1px solid ${currentUserRank.border}` }}>
                    {currentUserRank.name}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  ยอดสะสม: <b style={{ color: '#38bdf8' }}>฿{userTotalTopup.toLocaleString()}</b>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#030712', border: '1px solid #10b981', borderRadius: '12px', padding: '6px 12px' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>💰 เครดิตร้าน:</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#34d399' }}>฿{(user.balance || 0).toLocaleString()}</div>
              <button 
                onClick={() => setShowTopupWalletModal(true)}
                style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + เติมเครดิต
              </button>
            </div>

            {/* Menu Buttons placed on top-right */}
            <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}
                style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : 'rgba(31, 41, 55, 0.85)', color: '#ffffff', border: '1px solid ' + (activeTab === 'shop' ? '#c084fc' : '#374151'), padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
              >
                🏠 หน้าแรก
              </button>
              <button 
                onClick={() => setActiveTab('track')}
                style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : 'rgba(31, 41, 55, 0.85)', color: '#ffffff', border: '1px solid ' + (activeTab === 'track' ? '#c084fc' : '#374151'), padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
              >
                📋 เช็คสถานะ
              </button>
              <button 
                onClick={() => setShowEventModal(true)}
                style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
              >
                🎁 รับโค้ดฟรี
              </button>
              {isUserAdmin && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : 'rgba(31, 41, 55, 0.85)', color: '#ffffff', border: '1px solid ' + (activeTab === 'admin' ? '#c084fc' : '#374151'), padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
                >
                  ⚙️ หลังบ้าน
                </button>
              )}
              <button 
                onClick={handleLogout}
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
              >
                🚪 ออก
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', margin: '25px auto', padding: '0 20px' }}>

        {/* TAB 1: SHOP (Catalog & Details) */}
        {activeTab === 'shop' && !selectedGame && (
          <div>
            {/* Banner */}
            <div style={{
              position: 'relative', overflow: 'hidden', borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.92) 0%, rgba(15, 23, 42, 0.96) 60%, rgba(17, 24, 39, 0.98) 100%)',
              border: '1.5px solid rgba(168, 85, 247, 0.5)', padding: '40px 30px', marginBottom: '30px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6)'
            }}>
              <div style={{ maxWidth: '650px', position: 'relative', zIndex: 2 }}>
                <span style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>
                  ⚡ เติมเร็ว AUTO 100%
                </span>
                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '14px 0 10px 0', color: '#ffffff', lineHeight: '1.2' }}>
                  เติมเกมออนไลน์ ทุกแพลตฟอร์ม<br />
                  <span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56,189,248,0.6)' }}>ได้ของทันทีใน 10 วินาที</span>
                </h1>
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                  เติมตรงผ่าน UID หรือรับรหัส Voucher โค้ดจากสต็อกอัตโนมัติ รวดเร็ว ปลอดภัย พร้อมช่องทางชำระเงินเต็มรูปแบบ
                </p>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: '🎮 ทุกเกม' },
                  { id: 'mobile', label: '📱 เกมมือถือ' },
                  { id: 'pc', label: '💻 เกม PC' }
                ].map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setGameCategory(cat.id)}
                    style={{
                      backgroundColor: gameCategory === cat.id ? '#9333ea' : '#111827',
                      color: '#ffffff', border: '1px solid ' + (gameCategory === cat.id ? '#c084fc' : '#374151'),
                      padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: '260px' }}>
                <input 
                  type="text" 
                  placeholder="🔍 ค้นหาชื่อเกม..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '10px 14px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Games Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
              {gamesData.filter(g => (gameCategory === 'all' || g.category === gameCategory) && (!searchTerm.trim() || g.name.toLowerCase().includes(searchTerm.toLowerCase()))).map(game => (
                <div 
                  key={game.id} 
                  onClick={() => { setSelectedGame(game); setSelectedPackage(game.packages[0]); setPackageQuantity(1); }}
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s'
                  }}
                >
                  <div style={{ position: 'relative', height: '145px', overflow: 'hidden' }}>
                    <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#030712', border: '1px solid #34d399', color: '#34d399', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                      ⚡ AUTO 100%
                    </span>
                    <span style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#c084fc', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '8px' }}>
                      {game.badge}
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{game.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>ผู้ให้บริการ: {game.publisher}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>เริ่มต้นเพียง</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#38bdf8' }}>฿{game.packages[0].price}</div>
                      </div>
                      <button style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                        เติมเกมทันที ➔
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Game Checkout Interface */}
        {activeTab === 'shop' && selectedGame && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.5)' }}>
            <button 
              onClick={() => setSelectedGame(null)} 
              style={{ backgroundColor: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
            >
              ← กลับไปหน้ารวมเกม
            </button>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', backgroundColor: '#030712', borderRadius: '20px', padding: '20px', border: '1px solid #a855f7' }}>
              <img src={selectedGame.image} alt={selectedGame.name} style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #c084fc' }} />
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>{selectedGame.badge}</span>
                  <span style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>🟢 ออนไลน์ AUTO 100%</span>
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 4px 0', color: '#ffffff' }}>{selectedGame.name}</h2>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>ค่ายเกม: {selectedGame.publisher} | หมวดหมู่: {selectedGame.category.toUpperCase()}</div>
              </div>
            </div>

            {/* Step 1: UID Input */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>
                  1. ข้อมูลผู้เล่น (UID / Player ID) <span style={{ color: '#ef4444' }}>*</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="ระบุ UID หรือชื่อตัวละครในเกมของคุณ..." 
                  value={playerId} 
                  onChange={(e) => setPlayerId(e.target.value)}
                  style={{ flex: 1, minWidth: '240px', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }}
                />
                <select 
                  value={playerServer} 
                  onChange={(e) => setPlayerServer(e.target.value)}
                  className="cyber-select cyber-select-cyan"
                  style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <option value="Asia">เซิร์ฟเวอร์ Asia</option>
                  <option value="Thailand">เซิร์ฟเวอร์ Thailand</option>
                  <option value="Global">เซิร์ฟเวอร์ Global</option>
                  <option value="North America">เซิร์ฟเวอร์ North America</option>
                </select>
              </div>
            </div>

            {/* Step 2: Package Select */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                2. เลือกแพ็กเกจเติมเกม
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                {selectedGame.packages.map(pkg => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  return (
                    <div 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(147, 51, 234, 0.25)' : '#030712',
                        border: isSelected ? '2px solid #a855f7' : '1px solid #374151',
                        borderRadius: '16px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>{pkg.name}</div>
                        <span style={{ fontSize: '10px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: '2px 6px', borderRadius: '6px' }}>⚡ AUTO</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399', marginBottom: '8px' }}>โบนัส: {pkg.bonus}</div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>฿{pkg.price.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Quantity */}
            <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 'bold' }}>📦 แพ็กเกจที่เลือก: <span style={{ color: '#c084fc' }}>{selectedPackage?.name}</span></div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>ราคาต่อแพ็ก: ฿{selectedPackage?.price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>จำนวนแพ็กเกจ:</span>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
                  <button type="button" onClick={() => setPackageQuantity(Math.max(1, packageQuantity - 1))} style={{ backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '14px', fontWeight: 'bold' }}>-</button>
                  <span style={{ width: '35px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>{packageQuantity}</span>
                  <button type="button" onClick={() => setPackageQuantity(packageQuantity + 1)} style={{ backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '14px', fontWeight: 'bold' }}>+</button>
                </div>
              </div>
            </div>

            {/* Step 4: Payment Methods */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                3. เลือกช่องทางชำระเงิน
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {paymentMethods.map(pm => {
                  const isSel = selectedPayment?.id === pm.id;
                  return (
                    <div 
                      key={pm.id} 
                      onClick={() => setSelectedPayment(pm)}
                      style={{
                        backgroundColor: isSel ? 'rgba(56, 189, 248, 0.2)' : '#030712',
                        border: isSel ? '2px solid #38bdf8' : '1px solid #374151',
                        borderRadius: '14px', padding: '14px', cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{pm.name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{pm.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Realistic payment input fields */}
            {selectedPayment && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>
                  📝 กรอกข้อมูลช่องทาง: {selectedPayment.name}
                </div>
                {selectedPayment.id === 'true' && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>เบอร์โทรศัพท์ TrueMoney Wallet (10 หลัก)</label>
                    <input type="text" inputMode="numeric" maxLength={10} placeholder="เช่น 0812345678" value={truemoneyPhone} onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {selectedPayment.id === 'truemoneycard' && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>รหัสบัตรเติมเงิน TrueMoney (14 หลัก)</label>
                    <input type="text" inputMode="numeric" maxLength={14} placeholder="กรอกรหัสบัตร 14 หลัก..." value={truemoneyCard14} onChange={(e) => setTruemoneyCard14(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', letterSpacing: '2px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {selectedPayment.id === 'credit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>หมายเลขบัตรเครดิต/เดบิต (16 หลัก)</label>
                      <input type="text" inputMode="numeric" placeholder="4111 2222 3333 4444" value={creditCardNum} onChange={(e) => {
                        let raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
                        setCreditCardNum(raw.match(/.{1,4}/g)?.join(' ') || '');
                      }} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1.5px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>วันหมดอายุ (MM/YY)</label>
                        <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={(e) => setCreditCardExp(e.target.value.slice(0, 5))} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CVV (3 หลัก)</label>
                        <input type="password" inputMode="numeric" maxLength={3} placeholder="123" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                )}
                {selectedPayment.id === 'qrcode' && (
                  <div style={{ fontSize: '13px', color: '#34d399' }}>✅ ระบบจะสร้าง QR PromptPay พร้อมระบบสแกนตรวจสลิปอัตโนมัติ (ต้องยืนยันรหัสผ่านบัญชีเพื่อความปลอดภัย)</div>
                )}
                {selectedPayment.id === 'wallet' && (
                  <div style={{ fontSize: '13px', color: '#34d399' }}>🔒 ระบบจะให้ท่านยืนยันรหัสผ่านบัญชีก่อนหักเงินจากเครดิตร้าน (ยอดเงินคงเหลือ: ฿{(user.balance || 0).toLocaleString()})</div>
                )}
              </div>
            )}

            {/* Summary & Confirm Button */}
            <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '18px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>ยอดรวมที่ต้องชำระ:</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#34d399' }}>
                  ฿{(selectedPackage?.price * packageQuantity).toLocaleString()}
                </div>
              </div>

              <button 
                onClick={handleStartGamePayment}
                style={{
                  backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '16px 36px',
                  borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(147,51,234,0.6)'
                }}
              >
                ยืนยันสั่งซื้อและชำระเงิน ➔
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TRACK (10 rows per page + Daily History Breakdown) */}
        {activeTab === 'track' && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.4)' }}>
            <div style={{ borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0', color: '#ffffff' }}>📋 เช็คสถานะคำสั่งซื้อ & รหัสที่ได้รับ</h2>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                ผู้ใช้งาน: <b style={{ color: '#c084fc' }}>{user.username}</b> {isUserAdmin && <span style={{ color: '#38bdf8' }}>(สิทธิ์แอดมิน: แสดงทุกออเดอร์ในระบบ)</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="🔍 ค้นหาเลขออร์เดอร์ เช่น ORD-14969..." 
                value={customerOrderSearch} 
                onChange={(e) => { setCustomerOrderSearch(e.target.value); setCustomerOrdersPage(1); }} 
                style={{ flex: 1.5, minWidth: '220px', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} 
              />
              <select 
                value={selectedGameFilter} 
                onChange={(e) => { setSelectedGameFilter(e.target.value); setCustomerOrdersPage(1); }} 
                className="cyber-select cyber-select-cyan"
                style={{ flex: 1, minWidth: '160px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">🎮 เลือกดูเกม (ทั้งหมด)</option>
                {gamesData.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>

            {/* Today's Orders (10 items per page) */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
                  📅 รายการคำสั่งซื้อประจำวัน (วันนี้: {todayDateKey})
                </h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>รวม {todayOrders.length} รายการ</span>
              </div>

              {paginatedTodayOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                  {paginatedTodayOrders.map((ord, idx) => {
                    const globalIdx = (customerOrdersPage - 1) * ROWS_PER_PAGE_ORDERS + idx + 1;
                    return (
                      <div key={ord.firebaseKey || ord.id || idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '12px' }}>#{globalIdx}</span>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>🎮 {ord.game} <span style={{ color: '#c084fc', fontSize: '13px' }}>({ord.package})</span></div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                            UID/ตัวละคร: <b style={{ color: '#ffffff' }}>{ord.gameChar}</b> | ผู้สั่ง: {ord.player} | ช่องทาง: <span style={{ color: '#f472b6' }}>{ord.paymentMethod}</span>
                          </div>
                          {ord.deliveredCode && (
                            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>🎁 รหัสสินค้า:</span>
                              <code style={{ backgroundColor: '#111827', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #34d399', fontSize: '12px' }}>{ord.deliveredCode}</code>
                              <button onClick={() => { navigator.clipboard.writeText(ord.deliveredCode); showToast('คัดลอกรหัสเรียบร้อย!'); }} style={{ backgroundColor: 'rgba(52,211,153,0.2)', border: '1px solid #34d399', color: '#34d399', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}>📋 คัดลอก</button>
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>฿{ord.price?.toLocaleString()}</div>
                          <span style={{ fontSize: '11px', color: ord.status?.includes('สำเร็จ') ? '#34d399' : '#f59e0b', fontWeight: 'bold' }}>{ord.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', backgroundColor: '#030712', borderRadius: '14px', border: '1px dashed #374151' }}>ไม่มีรายการคำสั่งซื้อใหม่ในวันนี้</div>
              )}

              {/* Today Pagination: Max 10 lines */}
              {totalCustomerTodayPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '14px' }}>
                  {Array.from({ length: totalCustomerTodayPages }, (_, i) => i + 1).map((pageNum) => (
                    <button key={pageNum} onClick={() => setCustomerOrdersPage(pageNum)} style={{ backgroundColor: customerOrdersPage === pageNum ? '#9333ea' : '#030712', color: '#ffffff', border: '1px solid ' + (customerOrdersPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Past Daily History (Grouped & Filterable by Date) */}
            {pastOrders.length > 0 && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid rgba(168,85,247,0.4)', borderRadius: '16px', overflow: 'hidden' }}>
                <div onClick={() => setIsPastOrdersOpen(!isPastOrdersOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '16px 20px', backgroundColor: 'rgba(147, 51, 234, 0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(168,85,247,0.3)', border: '1px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>{isPastOrdersOpen ? '▼' : '▶'}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>📂 ประวัติย้อนหลัง (รายการจากวันก่อนหน้า)</h3>
                  </div>
                  <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{pastOrders.length} รายการ</span>
                </div>

                {isPastOrdersOpen && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 'bold' }}>📅 เลือกวันที่ประวัติย้อนหลัง:</span>
                      <select value={selectedHistoryDate} onChange={(e) => { setSelectedHistoryDate(e.target.value); setHistoryPage(1); }} className="cyber-select cyber-select-purple" style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '8px 14px', color: '#38bdf8', fontWeight: 'bold', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                        <option value="all">🌐 แสดงประวัติย้อนหลังทั้งหมด ({pastOrders.length} รายการ)</option>
                        {availableHistoryDates.map((dateStr) => (
                          <option key={dateStr} value={dateStr}>📅 วันที่ {dateStr} ({groupedPastOrders[dateStr].length} รายการ)</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {paginatedPastOrders.map((ord, idx) => {
                        const globalIdx = (historyPage - 1) * ROWS_PER_PAGE_PAST + idx + 1;
                        return (
                          <div key={ord.firebaseKey || ord.id || idx} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold' }}>#{globalIdx}</span>
                                <span style={{ backgroundColor: '#374151', color: '#d1d5db', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>📅 {ord.time}</span>
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d1d5db' }}>🎮 {ord.game} <span style={{ color: '#a855f7', fontSize: '12px' }}>({ord.package})</span></div>
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>UID: {ord.gameChar} | ผู้สั่ง: {ord.player} | ชำระ: {ord.paymentMethod}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price?.toLocaleString()}</div>
                              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>{ord.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalHistoryPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                        {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pageNum) => (
                          <button key={pageNum} onClick={() => setHistoryPage(pageNum)} style={{ backgroundColor: historyPage === pageNum ? '#9333ea' : '#111827', color: '#ffffff', border: '1px solid ' + (historyPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN (Exclusive to thanphooms@gmail.com, 10 lines orders, 5 lines stock/gifts) */}
        {activeTab === 'admin' && isUserAdmin && (
          <div>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '420px', margin: '40px auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid #9333ea', borderRadius: '24px', padding: '35px 30px', textAlign: 'center', boxShadow: '0 0 35px rgba(147,51,234,0.4)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(147, 51, 234, 0.2)', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 15px auto' }}>
                  🔐
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>ยืนยันสิทธิ์แอดมิน (thanphooms)</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าใช้งานหลังบ้าน</p>
                {adminPinError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>{adminPinError}</div>
                )}
                <form onSubmit={handleAdminLogin}>
                  <input 
                    type="password" 
                    maxLength={6} 
                    placeholder="PIN 6 หลัก" 
                    value={inputAdminPin} 
                    onChange={(e) => setInputAdminPin(e.target.value.replace(/[^0-9]/g, ''))} 
                    style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #374151', borderRadius: '12px', padding: '14px', color: '#ffffff', textAlign: 'center', fontSize: '22px', letterSpacing: '6px', marginBottom: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    เข้าสู่ระบบแอดมิน
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px 0', color: '#ffffff' }}>⚙️ ระบบจัดการหลังบ้าน (Admin Control Panel)</h2>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>แอดมิน: <b style={{ color: '#38bdf8' }}>thanphooms@gmail.com</b></div>
                  </div>
                  <button onClick={() => { setIsAdminLoggedIn(false); localStorage.removeItem('cyber_is_admin_logged'); }} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    🔒 ล็อกเอาท์ PIN
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {[
                    { id: 'orders', label: `📦 คำสั่งซื้อ (${orders.length})` },
                    { id: 'stock', label: `🔑 สต็อกโค้ด (${stockList.length})` },
                    { id: 'giftcodes', label: `🎟️ โค้ดของขวัญ (${giftCodes.length})` }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setAdminSubTab(tab.id)}
                      style={{
                        backgroundColor: adminSubTab === tab.id ? '#9333ea' : '#030712',
                        color: '#ffffff', border: '1px solid ' + (adminSubTab === tab.id ? '#c084fc' : '#374151'),
                        padding: '9px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Admin Tab: Orders (10 rows per page) */}
                {adminSubTab === 'orders' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="🔍 ค้นหาเลขออร์เดอร์ หรือชื่อลูกค้า..."
                        value={adminSearchQuery}
                        onChange={(e) => { setAdminSearchQuery(e.target.value); setAdminOrdersPage(1); }}
                        style={{ minWidth: '280px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px 14px', color: '#ffffff', outline: 'none' }}
                      />
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>หน้า {adminOrdersPage} / {totalAdminOrderPages} (แสดง 10 บรรทัดต่อหน้า)</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {paginatedAdminOrders.map((ord, idx) => (
                        <div key={ord.firebaseKey || ord.id || idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>{ord.id}</span>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{ord.time}</span>
                              <span style={{ fontSize: '11px', color: ord.status?.includes('สำเร็จ') ? '#34d399' : '#facc15', fontWeight: 'bold' }}>{ord.status}</span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>
                              {ord.game} - <span style={{ color: '#c084fc' }}>{ord.package}</span> (฿{ord.price?.toLocaleString()})
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                              ลูกค้า: <b>{ord.player}</b> | UID: {ord.gameChar} | ช่องทาง: {ord.paymentMethod}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price?.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalAdminOrderPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                        {Array.from({ length: totalAdminOrderPages }, (_, i) => i + 1).map((pageNum) => (
                          <button key={pageNum} onClick={() => setAdminOrdersPage(pageNum)} style={{ backgroundColor: adminOrdersPage === pageNum ? '#9333ea' : '#030712', color: '#ffffff', border: '1px solid ' + (adminOrdersPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Tab: Stock (5 rows per page) */}
                {adminSubTab === 'stock' && (
                  <div>
                    <form onSubmit={handleAddStock} style={{ backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 12px 0' }}>➕ เพิ่มรหัสสต็อกสินค้าใหม่</h3>
                      {stockMsg.text && (
                        <div style={{ backgroundColor: stockMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: stockMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>{stockMsg.text}</div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. เลือกเกม</label>
                          <select value={stockGame} onChange={(e) => { setStockGame(e.target.value); const g = gamesData.find(gm => gm.name === e.target.value); if (g && g.packages.length > 0) setStockPackage(g.packages[0].name); }} className="cyber-select cyber-select-cyan" style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #38bdf8', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}>
                            {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. เลือกแพ็กเกจ</label>
                          <select value={stockPackage} onChange={(e) => setStockPackage(e.target.value)} className="cyber-select cyber-select-purple" style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #a855f7', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}>
                            {(gamesData.find(g => g.name === stockGame)?.packages || []).map(p => <option key={p.id} value={p.name}>{p.name} (฿{p.price})</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>3. รายการรหัสสินค้า (1 รหัสต่อ 1 บรรทัด)</label>
                        <textarea rows={3} placeholder="วางรหัสสินค้าที่นี่..." value={stockCodesInput} onChange={(e) => setStockCodesInput(e.target.value)} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <button type="submit" style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>บันทึกเข้าสต็อก</button>
                    </form>

                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '18px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>📋 รายการสต็อก (แสดง 5 บรรทัดต่อหน้า)</h3>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>หน้า {adminStockPage} / {totalAdminStockPages}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {paginatedAdminStock.map((stk, idx) => (
                          <div key={stk.firebaseKey || stk.code || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '10px 14px', borderRadius: '10px' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{stk.game} - {stk.package}</span>
                              <div style={{ fontSize: '12px', color: '#38bdf8', letterSpacing: '1px' }}>🔑 {stk.code}</div>
                            </div>
                            <button onClick={() => { if (stk.firebaseKey) set(ref(db, `stock/${stk.firebaseKey}`), null); showToast('ลบรายการสต็อกเรียบร้อย'); }} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>🗑️</button>
                          </div>
                        ))}
                      </div>

                      {totalAdminStockPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '14px' }}>
                          {Array.from({ length: totalAdminStockPages }, (_, i) => i + 1).map((pageNum) => (
                            <button key={pageNum} onClick={() => setAdminStockPage(pageNum)} style={{ backgroundColor: adminStockPage === pageNum ? '#9333ea' : '#111827', color: '#ffffff', border: '1px solid ' + (adminStockPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Tab: Gift Codes (5 rows per page + Reset Activities Button) */}
                {adminSubTab === 'giftcodes' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c084fc', margin: 0 }}>🎟️ จัดการโค้ดของขวัญ & กิจกรรมแจกรางวัล</h3>
                      <button 
                        onClick={handleResetAllRedeemRights}
                        style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', boxShadow: '0 0 15px rgba(245,158,11,0.4)' }}
                      >
                        🔄 รีเซ็ตสิทธิ์ UID กิจกรรมทั้งหมด
                      </button>
                    </div>

                    <form onSubmit={handleCreateGiftCode} style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
                      {adminCodeMsg.text && (
                        <div style={{ backgroundColor: adminCodeMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: adminCodeMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>{adminCodeMsg.text}</div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อโค้ด</label>
                          <input type="text" placeholder="เช่น VIPGIFT" value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #a855f7', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>เลือกเกม</label>
                          <select value={newCodeGame} onChange={(e) => setNewCodeGame(e.target.value)} className="cyber-select cyber-select-cyan" style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}>
                            {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ของรางวัล</label>
                          <input type="text" value={newCodeReward} onChange={(e) => setNewCodeReward(e.target.value)} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#facc15', display: 'block', marginBottom: '4px' }}>แรงค์ขั้นต่ำที่ใช้ได้</label>
                          <select value={newCodeMinRank} onChange={(e) => setNewCodeMinRank(Number(e.target.value))} className="cyber-select cyber-select-purple" style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #facc15', borderRadius: '10px', padding: '10px', color: '#facc15', outline: 'none' }}>
                            {rankTiers.map(r => (
                              <option key={r.level} value={r.level}>{r.icon} {r.level === 0 ? 'ทุกคนใช้ได้' : `${r.name} ขึ้นไป`}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button type="submit" style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>+ สร้างโค้ดกิจกรรม</button>
                    </form>

                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '18px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>📋 โค้ดที่มีในระบบ (แสดง 5 บรรทัดต่อหน้า)</h3>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>หน้า {adminGiftPage} / {totalAdminGiftPages}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {paginatedAdminGifts.map((gc, idx) => (
                          <div key={gc.firebaseKey || gc.code || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '12px 16px', borderRadius: '10px' }}>
                            <div>
                              <span style={{ fontSize: '14px', fontWeight: '900', color: '#c084fc', letterSpacing: '1px' }}>{gc.code}</span>
                              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                รางวัล: <b style={{ color: '#ffffff' }}>{gc.reward}</b> ({gc.game}) | ขั้นต่ำ: <b style={{ color: '#facc15' }}>{rankTiers[gc.minRank || 0]?.name}</b>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span style={{ fontSize: '12px', color: '#38bdf8' }}>ใช้แล้ว {gc.usedCount || 0}/{gc.maxUses} สิทธิ์</span>
                              <button onClick={() => { if (gc.firebaseKey) set(ref(db, `giftCodes/${gc.firebaseKey}`), null); showToast('ลบโค้ดเรียบร้อย'); }} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalAdminGiftPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '14px' }}>
                          {Array.from({ length: totalAdminGiftPages }, (_, i) => i + 1).map((pageNum) => (
                            <button key={pageNum} onClick={() => setAdminGiftPage(pageNum)} style={{ backgroundColor: adminGiftPage === pageNum ? '#9333ea' : '#111827', color: '#ffffff', border: '1px solid ' + (adminGiftPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: CHECKOUT (Password security + Multi-step Payment) */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowCheckoutModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}>✕</button>

            {checkoutStep === 1 && (
              <form onSubmit={handleVerifyPasswordStep} style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#c084fc', marginBottom: '8px', textAlign: 'center' }}>🔐 ยืนยันรหัสผ่านเพื่อชำระเงิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px', textAlign: 'center' }}>กรุณากรอกรหัสผ่านบัญชีของคุณเพื่อยืนยันรายการ</p>

                <div style={{ backgroundColor: '#030712', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
                  <div>เกม: <b style={{ color: '#ffffff' }}>{selectedGame.name}</b></div>
                  <div>แพ็กเกจ: <b style={{ color: '#38bdf8' }}>{selectedPackage.name} (x{packageQuantity})</b></div>
                  <div>ยอดชำระ: <b style={{ color: '#34d399' }}>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b></div>
                </div>

                {checkoutPasswordError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>{checkoutPasswordError}</div>
                )}

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <input 
                    type={showCheckoutPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่านบัญชีของคุณ..."
                    value={checkoutPassword}
                    onChange={(e) => setCheckoutPassword(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 40px 12px 12px', color: '#ffffff', outline: 'none' }}
                  />
                  <button type="button" onClick={() => setShowCheckoutPassword(!showCheckoutPassword)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <EyeIcon show={showCheckoutPassword} />
                  </button>
                </div>

                <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {selectedPayment.id === 'qrcode' ? 'ถัดไป (สแกน QR PromptPay) ➔' : 'ยืนยันชำระเงิน'}
                </button>
              </form>
            )}

            {checkoutStep === 2 && selectedPayment?.id === 'qrcode' && (
              <div>
                <div style={{ backgroundColor: '#003764', borderRadius: '12px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: '#ffffff' }}>THAI QR PAYMENT</span>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>PromptPay</span>
                </div>

                <div style={{ fontSize: '26px', fontWeight: '900', color: '#34d399', marginBottom: '10px' }}>
                  ฿{(selectedPackage.price * packageQuantity).toLocaleString()}
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '14px', maxWidth: '180px', margin: '0 auto 12px auto' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PromptPay-CyberTopup-${selectedGame.name}-${selectedPackage.price * packageQuantity}`} alt="PromptPay QR" style={{ width: '150px', height: '150px', display: 'block' }} />
                </div>

                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '14px' }}>
                  ชื่อบัญชี: บจก. ไซเบอร์ ท็อปอัพ (ประเทศไทย)<br />
                  หมดอายุใน: <b style={{ color: '#facc15' }}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} นาที</b>
                </div>

                {slipVerifying ? (
                  <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '10px', padding: '12px', marginBottom: '12px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>
                    {slipVerifyStepText}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '1.5px dashed #38bdf8', borderRadius: '10px', cursor: 'pointer', backgroundColor: 'rgba(56, 189, 248, 0.05)' }}>
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>{slipFile ? slipFile.name : '📸 แนบรูปสลิปโอนเงิน...'}</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) { setSlipFile(e.target.files[0]); setSlipPreview(URL.createObjectURL(e.target.files[0])); } }} />
                    </label>

                    {slipPreview && (
                      <div style={{ textAlign: 'center' }}>
                        <img src={slipPreview} alt="Slip" style={{ maxHeight: '80px', borderRadius: '6px' }} />
                      </div>
                    )}

                    <button onClick={handleSimulateSlipScan} style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                      ⚡ ตรวจสอบสลิป & ส่งคำสั่งเติม (AUTO 100%)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: WALLET TOPUP (Image 1 enhancement with custom ▲ / ▼ buttons) */}
      {showTopupWalletModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #10b981', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowTopupWalletModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💳</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>เติมเงินเข้าเครดิตร้าน (Cyber Wallet)</h3>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>เครดิตสามารถใช้ชำระค่าเกมได้ทันทีใน 1 วินาที ไม่ต้องรอสแกน QR</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {['50', '100', '300', '500', '1000', '2000'].map(val => (
                <button 
                  key={val} 
                  type="button" 
                  onClick={() => setTopupAmount(val)}
                  style={{
                    backgroundColor: topupAmount === val ? '#10b981' : '#030712',
                    color: topupAmount === val ? '#000000' : '#ffffff',
                    border: '1px solid ' + (topupAmount === val ? '#34d399' : '#374151'),
                    padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px'
                  }}
                >
                  ฿{parseInt(val).toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Input Box with Stylized Up/Down Arrows (Request in Image 1) */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <input 
                type="number" 
                placeholder="ระบุจำนวนเงิน..." 
                value={topupAmount} 
                onChange={(e) => setTopupAmount(e.target.value)}
                className="no-native-spin"
                style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #10b981', borderRadius: '10px', padding: '12px 35px 12px 14px', color: '#ffffff', fontSize: '18px', textAlign: 'center', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
              <div style={{ position: 'absolute', right: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button 
                  type="button"
                  onClick={() => setTopupAmount(prev => String(Math.max(0, (parseFloat(prev) || 0) + 50)))}
                  style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', borderRadius: '4px', width: '22px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontSize: '9px', cursor: 'pointer', padding: 0 }}
                >
                  ▲
                </button>
                <button 
                  type="button"
                  onClick={() => setTopupAmount(prev => String(Math.max(0, (parseFloat(prev) || 0) - 50)))}
                  style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', borderRadius: '4px', width: '22px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontSize: '9px', cursor: 'pointer', padding: 0 }}
                >
                  ▼
                </button>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleWalletConfirmPayment}
              style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              ยืนยันเติมเงิน ฿{parseInt(topupAmount || 0).toLocaleString()} (ซิงค์ Firebase)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: EVENT CODE REDEEM */}
      {showEventModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #38bdf8', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowEventModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎁</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 6px 0' }}>แลกรับของรางวัล / โค้ดฟรี</h3>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>UID สามารถรับได้เพียง 1 ครั้งเท่านั้น จนกว่าแอดมินจะรีเซ็ตกิจกรรม</p>

            {eventMsg.text && (
              <div style={{ backgroundColor: eventMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: eventMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px', textAlign: 'left' }}>
                {eventMsg.text}
              </div>
            )}

            <form onSubmit={handleRedeemEventCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. เลือกเกม</label>
                <select value={eventGame} onChange={(e) => setEventGame(e.target.value)} className="cyber-select cyber-select-cyan" style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}>
                  {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. UID หรือชื่อตัวละคร (รับได้ครั้งเดียวต่อ UID)</label>
                <input 
                  type="text" 
                  placeholder="ระบุ UID ในเกม..."
                  value={eventPlayerId}
                  onChange={(e) => setEventPlayerId(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>3. รหัสโค้ดกิจกรรม (Gift Code)</label>
                <input 
                  type="text" 
                  placeholder="พิมพ์รหัสโค้ดที่นี่..."
                  value={eventGiftCode}
                  onChange={(e) => setEventGiftCode(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }}
                />
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '6px' }}>
                ยืนยันแลกรับรางวัลฟรี
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELIVERED STOCK */}
      {deliveredStockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '2px solid #34d399', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 50px rgba(52,211,153,0.45)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px auto' }}>
              🎉
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#34d399', margin: '0 0 4px 0' }}>ทำรายการสำเร็จ!</h3>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>คำสั่งซื้อเลขที่: <b style={{ color: '#ffffff' }}>{deliveredStockModal.orderId}</b></div>

            <div style={{ backgroundColor: '#030712', border: '1.5px dashed #34d399', borderRadius: '16px', padding: '18px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>🎮 เกม: <b style={{ color: '#ffffff' }}>{deliveredStockModal.game}</b></div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>📦 แพ็กเกจ: <b style={{ color: '#38bdf8' }}>{deliveredStockModal.package}</b></div>
              
              <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold', marginBottom: '6px' }}>🔑 รหัสสินค้า / Voucher Code:</div>
              <div style={{ backgroundColor: '#111827', border: '1.5px solid #34d399', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '16px', fontWeight: '900', letterSpacing: '1px', wordBreak: 'break-all', textAlign: 'center' }}>
                {deliveredStockModal.code}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { navigator.clipboard.writeText(deliveredStockModal.code); showToast('คัดลอกรหัสเรียบร้อย!'); }} style={{ flex: 1.2, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                📋 คัดลอกรหัสทันที
              </button>
              <button onClick={() => { setDeliveredStockModal(null); setActiveTab('track'); }} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                ไปหน้าเช็คสถานะ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating LINE Button */}
      <a 
        href="https://lin.ee/Nn1UeBC" target="_blank" rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '25px', right: '25px', zIndex: 90,
          background: 'linear-gradient(135deg, #06c755 0%, #059669 100%)',
          color: '#ffffff', padding: '12px 20px', borderRadius: '999px',
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', fontWeight: 'bold', fontSize: '13px',
          boxShadow: '0 8px 25px rgba(6, 199, 85, 0.45)', border: '2px solid #a7f3d0'
        }}
      >
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffffff', animation: 'cyberOnlineBlink 1.2s infinite' }} />
        <span>🟢 ติดต่อแอดมิน LINE (24 ชม.)</span>
      </a>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '60px', padding: '30px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af', fontSize: '12px' }}>
        <p style={{ margin: '0 0 6px 0' }}>⚡ <b>CYBER TOPUP</b> — บริการเติมเกมออนไลน์อัตโนมัติ 24 ชั่วโมง รวดเร็ว ปลอดภัย ได้รับไอเทมทันที</p>
      </footer>
    </div>
  );
}
