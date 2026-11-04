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
// เชื่อมต่อเซิร์ฟเวอร์ออนไลน์จริง 100% สำหรับการทดสอบข้ามเครื่อง/ออนไลน์
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

// Global Cyber Styles & Scrollbar Effects
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
  .cyber-card-clickable {
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .cyber-card-clickable:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(147, 51, 234, 0.35);
    border-color: #a855f7 !important;
  }
  @keyframes cyberOnlineBlink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes cyberTicker {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  ::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }
  ::-webkit-scrollbar-track {
    background: #090d16;
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #9333ea, #38bdf8);
    border-radius: 6px;
  }
`;

function EyeIcon({ show }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  // Forgot Password States
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

  // Navigation State
  const [activeTab, setActiveTab] = useState('shop');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const rankTiers = useMemo(() => [
    { level: 0, name: 'Member', icon: '🌱', minSpend: 0, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: '#4b5563' },
    { level: 1, name: 'Bronze', icon: '🥉', minSpend: 300, color: '#d97706', bg: 'rgba(217, 119, 6, 0.18)', border: '#f59e0b' },
    { level: 2, name: 'Silver', icon: '🥈', minSpend: 1000, color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.18)', border: '#94a3b8' },
    { level: 3, name: 'Gold', icon: '🥇', minSpend: 3000, color: '#facc15', bg: 'rgba(250, 204, 21, 0.18)', border: '#eab308' },
    { level: 4, name: 'Diamond', icon: '💎', minSpend: 7500, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)', border: '#0ea5e9' },
    { level: 5, name: 'Cyber Legend', icon: '👑', minSpend: 15000, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.22)', border: '#a855f7' }
  ], []);

  // --------------------------------------------------------------------------
  // FIREBASE REALTIME SYNCHRONIZATION
  // ซิงค์ฐานข้อมูล Users, Orders, Stock, GiftCodes, Settings ข้ามเซิร์ฟเวอร์แบบ Realtime
  // --------------------------------------------------------------------------
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
            (u.username && prevUser.username && u.username.toLowerCase() === prevUser.username.toLowerCase())
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

  // Check URL Action Codes from Firebase (e.g. Password Reset link from Email)
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
      .filter(o => o.player === user.username && o.status && o.status.includes('สำเร็จ'))
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

  const isUserAdmin = useMemo(() => {
    if (!user) return false;
    return user.isAdmin === true || 
           user.role === 'admin' || 
           (user.username && user.username.toLowerCase() === 'thanphooms') || 
           (user.email && user.email.toLowerCase() === 'thanphooms@gmail.com');
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
    { id: 'qrcode', name: '📱 PromptPay QR Code', desc: 'สแกน QR ผ่านทุกธนาคาร ฟรีค่าธรรมเนียม' },
    { id: 'wallet', name: '💰 เครดิตร้าน (Cyber Wallet)', desc: 'หักจากยอดคงเหลือในบัญชีของคุณทันที' },
    { id: 'true', name: '💚 TrueMoney Wallet', desc: 'ชำระผ่านเบอร์มือถือ ทรูมันนี่วอลเล็ท' },
    { id: 'credit', name: '💳 บัตรเครดิต / เดบิต', desc: 'Visa, Mastercard ปลอดภัย 100%' }
  ], []);

  const [gameCategory, setGameCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [playerServer, setPlayerServer] = useState('Asia');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [trueMoneyOtpStep, setTrueMoneyOtpStep] = useState(false);
  const [trueMoneyOtpCode, setTrueMoneyOtpCode] = useState('');
  const [creditCardNum, setCreditCardNum] = useState('');
  const [creditCardExp, setCreditCardExp] = useState('');
  const [creditCardCvv, setCreditCardCvv] = useState('');
  const [deliveredStockModal, setDeliveredStockModal] = useState(null);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);
  const [slipVerifying, setSlipVerifying] = useState(false);
  const [slipVerifyStepText, setSlipVerifyStepText] = useState('');

  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('100');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('cyber_is_admin_logged') === 'true';
  });
  const [inputAdminPin, setInputAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('cyber_admin_pin') || '123456';
  });
  const [adminSubTab, setAdminSubTab] = useState('overview');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const [stockGame, setStockGame] = useState('VALORANT');
  const [stockPackage, setStockPackage] = useState('125 VP');
  const [stockCodesInput, setStockCodesInput] = useState('');
  const [stockMsg, setStockMsg] = useState({ text: '', type: '' });

  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeGame, setNewCodeGame] = useState('VALORANT');
  const [newCodeReward, setNewCodeReward] = useState('125 VP');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(10);
  const [newCodeMinRank, setNewCodeMinRank] = useState(0);
  const [adminCodeMsg, setAdminCodeMsg] = useState({ text: '', type: '' });

  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [userBalanceAdjustAmount, setUserBalanceAdjustAmount] = useState('');

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventGame, setEventGame] = useState('VALORANT');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventGiftCode, setEventGiftCode] = useState('');
  const [eventMsg, setEventMsg] = useState({ text: '', type: '' });

  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('cyber_announcement') || '⚡ ยินดีต้อนรับสู่ CYBER TOPUP เติมเกมออนไลน์อัตโนมัติ 24 ชม. • เติมเร็ว ปลอดภัย 100% ผ่าน UID • ระบบตัดสลิปและเครดิตอัตโนมัติ 5 วินาที!';
  });

  useEffect(() => {
    let timer;
    if (showCheckoutModal && checkoutStep === 2 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showCheckoutModal, checkoutStep, timeLeft]);

  // ระบบตรวจสอบและอนุมัติออเดอร์อัตโนมัติ 10 วินาที
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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้ และรหัสผ่าน');
        return;
      }
      const inputClean = usernameInput.trim().toLowerCase();
      const foundUser = registeredUsers.find(
        u => (u.username && u.username.toLowerCase() === inputClean) ||
             (u.email && u.email.toLowerCase() === inputClean)
      );

      if (!foundUser) {
        setAuthError('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ');
        return;
      }

      // Try Auth with Firebase or Fallback to DB stored password
      if (foundUser.email) {
        try {
          await signInWithEmailAndPassword(auth, foundUser.email, passwordInput);
        } catch (err) {
          if (foundUser.password !== passwordInput) {
            setAuthError('รหัสผ่านไม่ถูกต้อง');
            return;
          }
        }
      } else if (foundUser.password !== passwordInput) {
        setAuthError('รหัสผ่านไม่ถูกต้อง');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('cyber_remembered_user', foundUser.username);
      } else {
        localStorage.removeItem('cyber_remembered_user');
      }

      setUser(foundUser);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(foundUser));
      showToast(`ยินดีต้อนรับคุณ ${foundUser.username}!`);
    } else {
      if (!emailInput.trim() || !regUsernameInput.trim() || !regPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      if (regPasswordInput.length < 6) {
        setAuthError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (regPasswordInput !== confirmPasswordInput) {
        setAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
      const emailClean = emailInput.trim().toLowerCase();
      const usernameClean = regUsernameInput.trim();

      if (registeredUsers.some(u => u.email && u.email.toLowerCase() === emailClean)) {
        setAuthError('อีเมลนี้ถูกใช้งานแล้ว');
        return;
      }
      if (registeredUsers.some(u => u.username && u.username.toLowerCase() === usernameClean.toLowerCase())) {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
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
          balance: 100,
          role: 'member',
          isAdmin: false,
          emailVerified: true,
          createdAt: new Date().toLocaleDateString('th-TH')
        };

        const res = await push(ref(db, 'users'), newUserObj);
        const fullUser = { firebaseKey: res.key, ...newUserObj };
        setUser(fullUser);
        localStorage.setItem('cyber_current_logged_user', JSON.stringify(fullUser));
        showToast('สมัครสมาชิกสำเร็จ พร้อมรับเครดิตทดลอง ฿100 ฟรี!');
      } catch (err) {
        setAuthError('เกิดข้อผิดพลาด: ' + err.message);
      }
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      const adminAcc = registeredUsers.find(u => u.username?.toLowerCase() === 'thanphooms') || {
        firebaseKey: 'user_admin_01',
        username: 'thanphooms',
        email: 'thanphooms@gmail.com',
        password: 'password123',
        balance: 25000,
        role: 'admin',
        isAdmin: true,
        emailVerified: true
      };
      setUser(adminAcc);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(adminAcc));
      setIsAdminLoggedIn(true);
      showToast('เข้าสู่ระบบในฐานะแอดมิน (thanphooms) เรียบร้อย!');
    } else if (role === 'member') {
      const memberAcc = registeredUsers.find(u => u.username?.toLowerCase() === 'gamer_cyber') || {
        firebaseKey: 'user_member_02',
        username: 'gamer_cyber',
        email: 'gamer@cybertopup.com',
        password: 'password123',
        balance: 2500,
        role: 'member',
        isAdmin: false,
        emailVerified: true
      };
      setUser(memberAcc);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(memberAcc));
      showToast('เข้าสู่ระบบสมาชิก (gamer_cyber) เรียบร้อย!');
    } else {
      const guestAcc = {
        firebaseKey: 'user_guest_' + Date.now(),
        username: 'Guest_' + Math.floor(1000 + Math.random() * 9000),
        email: 'guest@cybertopup.com',
        password: 'password123',
        balance: 500,
        role: 'member',
        isAdmin: false,
        emailVerified: true
      };
      setUser(guestAcc);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(guestAcc));
      showToast('เข้าใช้งานในโหมดผู้เยี่ยมชม (Guest)!');
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
    localStorage.removeItem('cyber_current_logged_user');
    setIsAdminLoggedIn(false);
    showToast('ออกจากระบบเรียบร้อย');
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });
    if (!forgotEmailInput.trim()) {
      setForgotStatusMsg({ text: 'กรุณากรอกอีเมลหรือชื่อผู้ใช้งาน', type: 'error' });
      return;
    }
    const target = registeredUsers.find(
      u => (u.email && u.email.toLowerCase() === forgotEmailInput.trim().toLowerCase()) ||
           (u.username && u.username.toLowerCase() === forgotEmailInput.trim().toLowerCase())
    );
    if (!target) {
      setForgotStatusMsg({ text: 'ไม่พบบัญชีผู้ใช้งานในระบบ', type: 'error' });
      return;
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setForgotTargetUser(target);
    setForgotStep(2);
    setForgotStatusMsg({ text: `ส่ง OTP สำเร็จ! (รหัสจำลอง: ${otp})`, type: 'success' });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (forgotOtpInput.trim() !== generatedOtp) {
      setForgotStatusMsg({ text: 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่', type: 'error' });
      return;
    }
    setForgotStep(3);
    setForgotStatusMsg({ text: 'ยืนยัน OTP สำเร็จ กรุณาตั้งรหัสผ่านใหม่', type: 'success' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      setForgotStatusMsg({ text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', type: 'error' });
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotStatusMsg({ text: 'รหัสผ่านยืนยันไม่ตรงกัน', type: 'error' });
      return;
    }
    try {
      if (resetOobCode) {
        await confirmPasswordReset(auth, resetOobCode, forgotNewPassword);
      }
      if (forgotTargetUser && forgotTargetUser.firebaseKey) {
        await set(ref(db, `users/${forgotTargetUser.firebaseKey}/password`), forgotNewPassword);
      }
      showToast('เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสใหม่');
      setForgotModalOpen(false);
      setForgotStep(1);
      setPasswordInput(forgotNewPassword);
    } catch (err) {
      setForgotStatusMsg({ text: 'เกิดข้อผิดพลาด: ' + err.message, type: 'error' });
    }
  };

  const handleApplyPromoCode = () => {
    setPromoError('');
    if (!promoCodeInput.trim()) {
      setPromoError('กรุณากรอกรหัสโปรโมชั่น');
      return;
    }
    const clean = promoCodeInput.trim().toUpperCase();
    if (clean === 'CYBER2026') {
      setAppliedPromo({ code: clean, discountPercent: 10, discountAmount: 0, text: 'ส่วนลด 10% ต้อนรับปี 2026' });
      showToast('🎉 ใช้โค้ด CYBER2026 รับส่วนลด 10% สำเร็จ!');
    } else if (clean === 'VIP50') {
      setAppliedPromo({ code: clean, discountPercent: 0, discountAmount: 50, text: 'ส่วนลดเงินสด ฿50' });
      showToast('🎉 ใช้โค้ด VIP50 รับส่วนลด ฿50 สำเร็จ!');
    } else if (clean === 'WELCOME') {
      setAppliedPromo({ code: clean, discountPercent: 0, discountAmount: 20, text: 'ส่วนลดเงินสด ฿20' });
      showToast('🎉 ใช้โค้ด WELCOME รับส่วนลด ฿20 สำเร็จ!');
    } else {
      setPromoError('ไม่พบโค้ดส่วนลดนี้ หรือหมดอายุแล้ว');
    }
  };

  const orderPricing = useMemo(() => {
    if (!selectedPackage) return { rawTotal: 0, discount: 0, finalPrice: 0 };
    const raw = selectedPackage.price * packageQuantity;
    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountPercent > 0) {
        discount = Math.round(raw * (appliedPromo.discountPercent / 100));
      } else if (appliedPromo.discountAmount > 0) {
        discount = Math.min(raw, appliedPromo.discountAmount);
      }
    }
    return {
      rawTotal: raw,
      discount: discount,
      finalPrice: Math.max(0, raw - discount)
    };
  }, [selectedPackage, packageQuantity, appliedPromo]);

  const handleStartPayment = () => {
    if (!playerId.trim()) {
      showToast('กรุณากรอกชื่อในเกม หรือ UID ก่อนชำระเงิน', 'error');
      return;
    }
    if (!selectedPackage) {
      showToast('กรุณาเลือกแพ็กเกจเติมเกม', 'error');
      return;
    }
    if (selectedPayment.id === 'wallet') {
      if ((user?.balance || 0) < orderPricing.finalPrice) {
        showToast(`เครดิตร้านไม่เพียงพอ (คงเหลือ ฿${(user?.balance || 0).toLocaleString()})`, 'error');
        setShowTopupWalletModal(true);
        return;
      }
    }
    if (selectedPayment.id === 'true') {
      setTrueMoneyOtpStep(true);
    }
    setTimeLeft(180);
    setCheckoutStep(selectedPayment.id === 'qrcode' ? 2 : 1);
    setShowCheckoutModal(true);
  };

  const handleFinalPaymentSubmit = async () => {
    const finalPrice = orderPricing.finalPrice;
    const totalProfit = Math.round(finalPrice * 0.15);

    if (selectedPayment.id === 'wallet' && user && user.firebaseKey) {
      const newBal = (user.balance || 0) - finalPrice;
      await set(ref(db, `users/${user.firebaseKey}/balance`), newBal);
      const upd = { ...user, balance: newBal };
      setUser(upd);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(upd));
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
        set(ref(db, `stock/${matchedStock.firebaseKey}/deliveredTo`), user?.username || 'Customer');
        set(ref(db, `stock/${matchedStock.firebaseKey}/orderId`), newOrderId);
      }

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: `${selectedPackage.name} (x${packageQuantity} แพ็ก)`,
        price: finalPrice,
        profit: totalProfit,
        player: user?.username || 'Customer',
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
        setSlipVerifyStepText('✅ ตรวจสอบสลิปสำเร็จ! ยืนยันรายการเติมอัตโนมัติ...');
        setTimeout(() => {
          setSlipVerifying(false);
          handleFinalPaymentSubmit();
        }, 800);
      }, 800);
    }, 800);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminPinError('');
    if (inputAdminPin.trim() === adminPin) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('cyber_is_admin_logged', 'true');
      showToast('เข้าสู่ระบบหลังบ้านแอดมินสำเร็จ!');
    } else {
      setAdminPinError('รหัส PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ 123456)');
    }
  };

  const handleAdminApproveOrder = (order) => {
    if (order.firebaseKey) {
      set(ref(db, `orders/${order.firebaseKey}/status`), '✅ สำเร็จ (แอดมินอนุมัติแล้ว)');
      showToast(`อนุมัติออเดอร์ ${order.id} สำเร็จ!`);
    }
  };

  const handleAdminCancelOrder = async (order) => {
    if (order.firebaseKey) {
      await set(ref(db, `orders/${order.firebaseKey}/status`), '❌ ยกเลิกและคืนเงินเข้ากระเป๋า');
      const targetUser = registeredUsers.find(u => u.username === order.player);
      if (targetUser && targetUser.firebaseKey) {
        const refunded = (targetUser.balance || 0) + (order.price || 0);
        await set(ref(db, `users/${targetUser.firebaseKey}/balance`), refunded);
        if (user?.username === targetUser.username) {
          const upd = { ...user, balance: refunded };
          setUser(upd);
          localStorage.setItem('cyber_current_logged_user', JSON.stringify(upd));
        }
      }
      showToast(`ยกเลิกออเดอร์ ${order.id} และคืนเงินเรียบร้อย`);
    }
  };

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

  const handleCreateGiftCode = (e) => {
    e.preventDefault();
    setAdminCodeMsg({ text: '', type: '' });
    if (!newCodeName.trim()) {
      setAdminCodeMsg({ text: 'กรุณากรอกชื่อโค้ด', type: 'error' });
      return;
    }
    push(ref(db, 'giftCodes'), {
      code: newCodeName.trim().toUpperCase(),
      game: newCodeGame,
      reward: newCodeReward,
      maxUses: Number(newCodeMaxUses) || 10,
      usedCount: 0,
      minRank: Number(newCodeMinRank) || 0,
      createdAt: new Date().toLocaleDateString('th-TH')
    }).then(() => {
      setNewCodeName('');
      setAdminCodeMsg({ text: '✅ สร้างโค้ดของขวัญเรียบร้อยแล้ว!', type: 'success' });
      showToast('สร้างโค้ดกิจกรรมสำเร็จ!');
    });
  };

  const handleRedeemEventCode = async (e) => {
    e.preventDefault();
    setEventMsg({ text: '', type: '' });
    if (!eventPlayerId.trim() || !eventGiftCode.trim()) {
      setEventMsg({ text: 'กรุณากรอก UID และรหัสโค้ด', type: 'error' });
      return;
    }
    const cleanCode = eventGiftCode.trim().toUpperCase();
    const matched = giftCodes.find(g => g.code.toUpperCase() === cleanCode && g.game === eventGame);
    if (!matched) {
      setEventMsg({ text: 'รหัสโค้ดนี้ไม่ถูกต้อง หรือไม่ตรงกับเกมที่เลือก', type: 'error' });
      return;
    }
    if ((matched.usedCount || 0) >= (matched.maxUses || 1)) {
      setEventMsg({ text: 'สิทธิ์ของโค้ดนี้ถูกใช้งานเต็มแล้ว', type: 'error' });
      return;
    }
    if (currentUserRank.level < (matched.minRank || 0)) {
      setEventMsg({ text: 'โค้ดนี้สงวนสิทธิ์สำหรับสมาชิกระดับ VIP ขึ้นไป', type: 'error' });
      return;
    }

    if (matched.firebaseKey) {
      await set(ref(db, `giftCodes/${matched.firebaseKey}/usedCount`), (matched.usedCount || 0) + 1);
    }

    const now = new Date();
    const thaiTime = `${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH')} น.`;
    const newOrderId = 'EVT-' + Math.floor(10000 + Math.random() * 90000);
    const deliveredCode = `${eventGame.slice(0,3).toUpperCase()}-GIFT-${Math.floor(1000+Math.random()*9000)}`;

    await push(ref(db, 'orders'), {
      id: newOrderId,
      game: eventGame,
      package: `${matched.reward} (🎁 โค้ดฟรี: ${matched.code})`,
      price: 0,
      profit: 0,
      player: user?.username || 'Customer',
      gameChar: eventPlayerId.trim(),
      paymentMethod: '🎁 Event Gift Code',
      status: '✅ สำเร็จ (รับโค้ดฟรี)',
      deliveryType: 'DIRECT_UID_AUTO_100',
      deliveredCode: deliveredCode,
      type: 'event',
      time: thaiTime,
      dateKey: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`,
      timestamp: Date.now()
    });

    setEventMsg({ text: `🎉 แลกรับรางวัล ${matched.reward} สำเร็จ เข้าสู่กระเป๋าแล้ว!`, type: 'success' });
    showToast(`แลกรับ ${matched.reward} สำเร็จ!`);
    setDeliveredStockModal({
      orderId: newOrderId,
      game: eventGame,
      package: matched.reward,
      code: deliveredCode
    });
    setShowEventModal(false);
  };

  const handleTopupWallet = async (e) => {
    e.preventDefault();
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('กรุณาระบุจำนวนเงินที่ถูกต้อง', 'error');
      return;
    }
    if (user && user.firebaseKey) {
      const newBal = (user.balance || 0) + amt;
      await set(ref(db, `users/${user.firebaseKey}/balance`), newBal);
      const upd = { ...user, balance: newBal };
      setUser(upd);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(upd));
      setShowTopupWalletModal(false);
      showToast(`เติมเครดิตร้าน ฿${amt.toLocaleString()} สำเร็จ! ยอดคงเหลือคือ ฿${newBal.toLocaleString()}`);
    }
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(g => {
      const matchesCategory = gameCategory === 'all' || g.category === gameCategory;
      const matchesSearch = !searchTerm.trim() || 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.publisher.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [gamesData, gameCategory, searchTerm]);

  const [customerFilterStatus, setCustomerFilterStatus] = useState('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const filteredCustomerOrders = useMemo(() => {
    return orders.filter(o => {
      const isOwn = isUserAdmin ? true : (o.player === user?.username);
      const matchesStatus = customerFilterStatus === 'all' ? true :
        customerFilterStatus === 'pending' ? (o.status && o.status.includes('รอ')) :
        (o.status && o.status.includes('สำเร็จ'));
      const q = customerSearchQuery.trim().toLowerCase();
      const matchesQuery = !q ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.game && o.game.toLowerCase().includes(q)) ||
        (o.gameChar && o.gameChar.toLowerCase().includes(q));
      return isOwn && matchesStatus && matchesQuery;
    });
  }, [orders, isUserAdmin, user, customerFilterStatus, customerSearchQuery]);

  const adminStats = useMemo(() => {
    const totalSales = orders.filter(o => o.status && o.status.includes('สำเร็จ')).reduce((sum, o) => sum + (o.price || 0), 0);
    const totalProfit = orders.filter(o => o.status && o.status.includes('สำเร็จ')).reduce((sum, o) => sum + (o.profit || 0), 0);
    const totalOrdersCount = orders.length;
    const totalUsersCount = registeredUsers.length;
    return { totalSales, totalProfit, totalOrdersCount, totalUsersCount };
  }, [orders, registeredUsers]);

  if (!user) {
    return (
      <div style={{
        backgroundColor: '#070a12',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(147, 51, 234, 0.25), transparent 70%), linear-gradient(to bottom, #070a12, #0b0f19)',
        color: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <style>{cyberGlobalStyles}</style>

        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(168, 85, 247, 0.5)', borderRadius: '24px',
          padding: '36px 30px', maxWidth: '440px', width: '100%',
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

          <div style={{ backgroundColor: 'rgba(3, 7, 18, 0.8)', border: '1px solid #374151', borderRadius: '14px', padding: '12px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', fontWeight: 'bold' }}>🚀 ปุ่มล็อกอินด่วนสำหรับการทดสอบ (One-Click Test):</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('admin')}
                style={{ flex: 1, minWidth: '100px', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
              >
                👑 แอดมิน (Admin)
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('member')}
                style={{ flex: 1, minWidth: '100px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
              >
                👤 สมาชิก (VIP Gold)
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('guest')}
                style={{ flex: 1, minWidth: '100px', backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
              >
                🎮 ผู้เยี่ยมชม
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#030712', borderRadius: '12px', padding: '4px', marginBottom: '18px' }}>
            <button 
              type="button" 
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 'bold', backgroundColor: authMode === 'login' ? '#9333ea' : 'transparent', color: '#ffffff' }}
            >
              เข้าสู่ระบบ
            </button>
            <button 
              type="button" 
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 'bold', backgroundColor: authMode === 'register' ? '#9333ea' : 'transparent', color: '#ffffff' }}
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
                  placeholder="เช่น thanphooms หรือ gamer_cyber"
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
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. ชื่อผู้ใช้งาน (Username)</label>
                  <input 
                    type="text" 
                    value={regUsernameInput} 
                    onChange={(e) => setRegUsernameInput(e.target.value)} 
                    placeholder="ตั้งชื่อผู้ใช้งาน..."
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
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร..."
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
              {authMode === 'login' ? 'เข้าสู่ระบบ (Login)' : 'สมัครสมาชิกใหม่'}
            </button>
          </form>
        </div>

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
                <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>กรอกรหัสยืนยัน 6 หลักที่ได้รับ:</div>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="------"
                    value={forgotOtpInput}
                    onChange={(e) => setForgotOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', fontSize: '20px', letterSpacing: '4px', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setForgotOtpInput(generatedOtp)} style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    💡 กดกรอก OTP อัตโนมัติ ({generatedOtp})
                  </button>
                  <button type="submit" style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ยืนยันรหัส OTP
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
    <div style={{ backgroundColor: '#070a12', color: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
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

      {/* Header */}
      <header style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1.5px solid rgba(147, 51, 234, 0.3)', position: 'sticky', top: 0, zIndex: 40, padding: '12px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          
          <div onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 0 15px rgba(168,85,247,0.7)' }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff' }}>CYBER TOPUP</div>
              <div style={{ fontSize: '9px', color: '#34d399', fontWeight: 'bold' }}>🟢 ONLINE FIREBASE CLOUD</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
          </div>

          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}
              style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
            >
              🏠 หน้าแรก
            </button>
            <button 
              onClick={() => setActiveTab('track')}
              style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
            >
              📋 เช็คสถานะ
            </button>
            <button 
              onClick={() => setShowEventModal(true)}
              style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
            >
              🎁 รับโค้ดฟรี
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
            >
              ⚙️ หลังบ้าน
            </button>
            <button 
              onClick={handleLogout}
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}
            >
              🚪 ออก
            </button>
          </nav>
        </div>
      </header>

      {/* Marquee Ticker */}
      <div style={{ backgroundColor: '#030712', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '8px 20px', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
        <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', marginRight: '12px', flexShrink: 0 }}>
          📢 ประกาศ
        </span>
        <div style={{ display: 'inline-block', animation: 'cyberTicker 25s linear infinite', color: '#e5e7eb', fontSize: '12px', fontWeight: '500' }}>
          {announcementText}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '25px auto', padding: '0 20px' }}>

        {/* TAB 1: SHOP */}
        {activeTab === 'shop' && !selectedGame && (
          <div>
            {/* Banner */}
            <div style={{
              position: 'relative', overflow: 'hidden', borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9) 0%, rgba(15, 23, 42, 0.95) 60%, rgba(17, 24, 39, 0.95) 100%)',
              border: '1.5px solid rgba(168, 85, 247, 0.5)', padding: '40px 30px', marginBottom: '30px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6)'
            }}>
              <div style={{ maxWidth: '650px', position: 'relative', zIndex: 2 }}>
                <span style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>
                  ⚡ เติมเร็ว AUTO 100%
                </span>
                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '14px 0 10px 0', color: '#ffffff', lineHeight: '1.2' }}>
                  เติมเกมออนไลน์ ทุกแพลตฟอร์ม<br />
                  <span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56,189,248,0.6)' }}>ได้ของทันทีใน 5 วินาที</span>
                </h1>
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                  ระบบเชื่อมต่อ API ตรงกับค่ายเกม ปลอดภัย ไม่ต้องใช้รหัสผ่านไอดี เพียงกรอก UID หรือชื่อตัวละคร พร้อมระบบคืนเงินอัตโนมัติหากมีปัญหา
                </p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>
                    <span>🛡️</span> ปลอดภัย 100% ผ่าน UID
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#c084fc', fontWeight: 'bold' }}>
                    <span>⚡</span> ส่งมอบโค้ด / เติมตรงอัตโนมัติ
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>
                    <span>🎁</span> สะสมแต้ม VIP รับโค้ดฟรี
                  </div>
                </div>
              </div>
            </div>

            {/* Event Gift Code Promo Card */}
            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid #38bdf8', borderRadius: '18px', padding: '18px 24px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 0 25px rgba(56,189,248,0.2)' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8' }}>🎁 กิจกรรมแจกโค้ดเติมเกมฟรีประจำสัปดาห์!</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>มีโค้ดกิจกรรมหรือไม่? กรอกรับไอเทมเกมฟรี เช่น 125 VP, 90 Coupons หรือ เพชรฟรีได้ทันที</div>
              </div>
              <button 
                onClick={() => setShowEventModal(true)}
                style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                กรอกโค้ดรับรางวัลทันที ➔
              </button>
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
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            </div>

            {/* Games Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
              {filteredGames.map(game => (
                <div 
                  key={game.id} 
                  className="cyber-card-clickable"
                  onClick={() => { setSelectedGame(game); setSelectedPackage(game.packages[0]); setPackageQuantity(1); }}
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
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

        {/* GAME DETAIL */}
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

            {/* Step 1: UID */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>
                  1. ข้อมูลผู้เล่น (UID / Player ID) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setPlayerId(`Player_${Math.floor(10000 + Math.random() * 90000)}#TH1`)}
                  style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  🎲 สุ่ม UID ทดสอบ
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="ระบุ UID หรือชื่อตัวละครในเกม..." 
                  value={playerId} 
                  onChange={(e) => setPlayerId(e.target.value)}
                  style={{ flex: 1, minWidth: '240px', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }}
                />
                <select 
                  value={playerServer} 
                  onChange={(e) => setPlayerServer(e.target.value)}
                  style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <option value="Asia">เซิร์ฟเวอร์ Asia</option>
                  <option value="Thailand">เซิร์ฟเวอร์ Thailand</option>
                  <option value="Global">เซิร์ฟเวอร์ Global</option>
                  <option value="North America">เซิร์ฟเวอร์ North America</option>
                </select>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>💡 วิธีดู UID: เข้าเกม กดที่โปรไฟล์มุมซ้ายบน จะมีตัวเลข UID ให้คัดลอกมาใส่ได้ทันที</div>
            </div>

            {/* Step 2: Package */}
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
                <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 'bold' }}>📦 แพ็กเกจ: <span style={{ color: '#c084fc' }}>{selectedPackage?.name}</span></div>
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

            {/* Step 4: Promo Code */}
            <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                🏷️ โค้ดส่วนลด / โปรโมชั่น (Promo Code)
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="กรอกโค้ด เช่น CYBER2026, VIP50, WELCOME" 
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  style={{ flex: 1, minWidth: '220px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={handleApplyPromoCode}
                  style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' }}
                >
                  ใช้โค้ด
                </button>
              </div>
              {appliedPromo && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>
                  ✅ {appliedPromo.text} (-฿{orderPricing.discount.toLocaleString()})
                </div>
              )}
              {promoError && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#fca5a5' }}>
                  ⚠️ {promoError}
                </div>
              )}
            </div>

            {/* Step 5: Payment Method */}
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

            {/* Summary */}
            <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '18px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>ยอดรวมที่ต้องชำระ:</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '26px', fontWeight: '900', color: '#34d399' }}>฿{orderPricing.finalPrice.toLocaleString()}</span>
                  {orderPricing.discount > 0 && (
                    <span style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through' }}>฿{orderPricing.rawTotal.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <button 
                onClick={handleStartPayment}
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

        {/* TAB 2: TRACK */}
        {activeTab === 'track' && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.4)' }}>
            <div style={{ borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0', color: '#ffffff' }}>📋 เช็คสถานะคำสั่งซื้อ & รหัสที่ได้รับ</h2>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                ผู้ใช้งาน: <b style={{ color: '#c084fc' }}>{user.username}</b> {isUserAdmin && <span style={{ color: '#38bdf8' }}>(สิทธิ์แอดมิน: แสดงทุกออเดอร์ในระบบ)</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'completed', label: '✅ สำเร็จแล้ว' },
                  { id: 'pending', label: '⏳ รอตรวจสอบ' }
                ].map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setCustomerFilterStatus(f.id)}
                    style={{
                      backgroundColor: customerFilterStatus === f.id ? '#9333ea' : '#030712',
                      color: '#ffffff', border: '1px solid ' + (customerFilterStatus === f.id ? '#c084fc' : '#374151'),
                      padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <input 
                type="text" 
                placeholder="🔍 ค้นหาด้วย Order ID, เกม หรือ UID..." 
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                style={{ minWidth: '260px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '9px 14px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {filteredCustomerOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9ca3af', backgroundColor: '#030712', borderRadius: '16px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>ยังไม่พบประวัติคำสั่งซื้อ</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>เมื่อคุณเติมเกม รายการและรหัสสินค้าจะมาแสดงที่หน้านี้ทันที</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredCustomerOrders.map((ord, idx) => (
                  <div key={ord.firebaseKey || ord.id || `order-${idx}`} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#38bdf8' }}>{ord.id}</span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{ord.time}</span>
                        <span style={{
                          fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: ord.status && ord.status.includes('สำเร็จ') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                          color: ord.status && ord.status.includes('สำเร็จ') ? '#34d399' : '#facc15'
                        }}>
                          {ord.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>
                        🎮 {ord.game} - <span style={{ color: '#c084fc' }}>{ord.package}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                        UID/ตัวละคร: <b style={{ color: '#ffffff' }}>{ord.gameChar}</b> | ลูกค้า: <b>{ord.player}</b> | ช่องทาง: {ord.paymentMethod}
                      </div>

                      {ord.deliveredCode && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid #34d399', borderRadius: '8px', padding: '6px 12px' }}>
                          <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>🔑 รหัสสินค้า:</span>
                          <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '900', letterSpacing: '1px' }}>{ord.deliveredCode}</span>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(ord.deliveredCode); showToast('คัดลอกรหัสสินค้าเรียบร้อย!'); }}
                            style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginLeft: 'auto' }}
                          >
                            📋 คัดลอก
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>฿{ord.price?.toLocaleString()}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => setViewReceiptModal(ord)}
                          style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          📄 ดูใบเสร็จ
                        </button>
                        <a 
                          href="https://lin.ee/Nn1UeBC" target="_blank" rel="noreferrer"
                          style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #22c55e', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none' }}
                        >
                          💬 แจ้งปัญหา
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN */}
        {activeTab === 'admin' && (
          <div>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '420px', margin: '40px auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid #9333ea', borderRadius: '24px', padding: '35px 30px', textAlign: 'center', boxShadow: '0 0 35px rgba(147,51,234,0.4)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(147, 51, 234, 0.2)', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 15px auto' }}>
                  🔐
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>ยืนยันสิทธิ์แอดมินหลังบ้าน</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าใช้งานส่วนจัดการระบบ</p>
                
                {adminPinError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>{adminPinError}</div>
                )}

                <form onSubmit={handleAdminLogin}>
                  <input 
                    type="password" 
                    maxLength={6} 
                    placeholder="------" 
                    value={inputAdminPin} 
                    onChange={(e) => setInputAdminPin(e.target.value.replace(/[^0-9]/g, ''))} 
                    style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #374151', borderRadius: '12px', padding: '14px', color: '#ffffff', textAlign: 'center', fontSize: '22px', letterSpacing: '6px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />

                  <button 
                    type="button" 
                    onClick={() => setInputAdminPin(adminPin)}
                    style={{ width: '100%', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', cursor: 'pointer' }}
                  >
                    💡 กดกรอก PIN อัตโนมัติ ({adminPin})
                  </button>

                  <button 
                    type="submit" 
                    style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                  >
                    เข้าสู่ระบบแอดมิน
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px 0', color: '#ffffff' }}>⚙️ ระบบจัดการหลังบ้าน (Admin Control Panel)</h2>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>จัดการคำสั่งซื้อ สต็อกโค้ด สมาชิก และโปรโมชั่น (ซิงค์ Firebase Cloud)</div>
                  </div>
                  <button 
                    onClick={() => { setIsAdminLoggedIn(false); localStorage.removeItem('cyber_is_admin_logged'); }}
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    🔒 ล็อกเอาท์ PIN
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {[
                    { id: 'overview', label: '📊 ภาพรวมสถิติ' },
                    { id: 'orders', label: `📦 คำสั่งซื้อ (${orders.length})` },
                    { id: 'stock', label: `🔑 สต็อกโค้ด (${stockList.length})` },
                    { id: 'giftcodes', label: `🎟️ โค้ดของขวัญ (${giftCodes.length})` },
                    { id: 'users', label: `👥 จัดการสมาชิก (${registeredUsers.length})` },
                    { id: 'settings', label: '⚙️ ตั้งค่าระบบ' }
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

                {adminSubTab === 'overview' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                      <div style={{ backgroundColor: '#030712', border: '1px solid #34d399', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>💰 ยอดขายรวมทั้งหมด</div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: '#34d399', marginTop: '4px' }}>฿{adminStats.totalSales.toLocaleString()}</div>
                      </div>
                      <div style={{ backgroundColor: '#030712', border: '1px solid #38bdf8', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>📈 กำไรสุทธิโดยประมาณ</div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: '#38bdf8', marginTop: '4px' }}>฿{adminStats.totalProfit.toLocaleString()}</div>
                      </div>
                      <div style={{ backgroundColor: '#030712', border: '1px solid #c084fc', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>📦 ออเดอร์ทั้งหมด</div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: '#c084fc', marginTop: '4px' }}>{adminStats.totalOrdersCount} รายการ</div>
                      </div>
                      <div style={{ backgroundColor: '#030712', border: '1px solid #f472b6', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>👥 สมาชิกในระบบ</div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: '#f472b6', marginTop: '4px' }}>{adminStats.totalUsersCount} บัญชี</div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>🎮 ยอดขายจำแนกตามเกม</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {gamesData.map(g => {
                          const gameSales = orders.filter(o => o.game === g.name && o.status && o.status.includes('สำเร็จ')).reduce((sum, o) => sum + (o.price || 0), 0);
                          const pct = adminStats.totalSales > 0 ? Math.round((gameSales / adminStats.totalSales) * 100) : 0;
                          return (
                            <div key={g.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{g.name}</span>
                                <span style={{ color: '#38bdf8' }}>฿{gameSales.toLocaleString()} ({pct}%)</span>
                              </div>
                              <div style={{ backgroundColor: '#1f2937', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ backgroundColor: '#a855f7', width: `${pct}%`, height: '100%', transition: 'width 0.4s' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubTab === 'orders' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="🔍 ค้นหาออเดอร์ (ID, เกม, ลูกค้า)..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        style={{ minWidth: '280px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px 14px', color: '#ffffff', outline: 'none' }}
                      />
                      <div style={{ fontSize: '13px', color: '#9ca3af' }}>รวม {orders.length} รายการ</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {orders
                        .filter(o => {
                          const q = adminSearchQuery.trim().toLowerCase();
                          return !q || o.id?.toLowerCase().includes(q) || o.game?.toLowerCase().includes(q) || o.player?.toLowerCase().includes(q);
                        })
                        .map((ord, idx) => (
                          <div key={ord.firebaseKey || ord.id || `admin-ord-${idx}`} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
                                ลูกค้า: <b>{ord.player}</b> | ตัวละคร: {ord.gameChar} | ชำระ: {ord.paymentMethod}
                              </div>
                              {ord.deliveredCode && (
                                <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>
                                  🔑 รหัสที่ส่ง: <b style={{ letterSpacing: '1px' }}>{ord.deliveredCode}</b>
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              {!ord.status?.includes('สำเร็จ') && (
                                <button 
                                  onClick={() => handleAdminApproveOrder(ord)}
                                  style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  ✅ อนุมัติ
                                </button>
                              )}
                              <button 
                                onClick={() => handleAdminCancelOrder(ord)}
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                ❌ ยกเลิก/คืนเงิน
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {adminSubTab === 'stock' && (
                  <div>
                    <form onSubmit={handleAddStock} style={{ backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '18px', padding: '22px', marginBottom: '26px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 14px 0' }}>➕ เพิ่มรหัสสต็อกสินค้าใหม่ (Single หรือ Bulk Paste)</h3>
                      
                      {stockMsg.text && (
                        <div style={{ backgroundColor: stockMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: stockMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
                          {stockMsg.text}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. เลือกเกม</label>
                          <select 
                            value={stockGame} 
                            onChange={(e) => {
                              setStockGame(e.target.value);
                              const g = gamesData.find(gm => gm.name === e.target.value);
                              if (g && g.packages.length > 0) setStockPackage(g.packages[0].name);
                            }}
                            style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #38bdf8', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}
                          >
                            {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. เลือกแพ็กเกจ</label>
                          <select 
                            value={stockPackage} 
                            onChange={(e) => setStockPackage(e.target.value)}
                            style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #a855f7', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}
                          >
                            {(gamesData.find(g => g.name === stockGame)?.packages || []).map(p => (
                              <option key={p.id} value={p.name}>{p.name} (฿{p.price})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>3. รายการรหัสสินค้า (1 รหัสต่อ 1 บรรทัด)</label>
                        <textarea 
                          rows={4}
                          placeholder="วางรหัสสินค้าที่นี่ เช่น&#10;VAL-VP125-ABCD-1234&#10;VAL-VP125-EFGH-5678"
                          value={stockCodesInput}
                          onChange={(e) => setStockCodesInput(e.target.value)}
                          style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <button type="submit" style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                        บันทึกเข้าสต็อก Firebase
                      </button>
                    </form>

                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '18px', padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 14px 0' }}>📋 รายการสต็อกทั้งหมด ({stockList.length} รายการ)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stockList.map((stk, idx) => (
                          <div key={stk.firebaseKey || stk.code || `stock-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '10px 14px', borderRadius: '10px' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{stk.game} - {stk.package}</span>
                              <div style={{ fontSize: '12px', color: '#38bdf8', letterSpacing: '1px', marginTop: '2px' }}>🔑 {stk.code}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', backgroundColor: stk.status === 'available' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(156, 163, 175, 0.15)', color: stk.status === 'available' ? '#34d399' : '#9ca3af' }}>
                                {stk.status === 'available' ? '🟢 พร้อมส่ง' : '⚪ ส่งมอบแล้ว'}
                              </span>
                              <button 
                                onClick={() => {
                                  if (stk.firebaseKey) {
                                    set(ref(db, `stock/${stk.firebaseKey}`), null);
                                    showToast('ลบรายการสต็อกเรียบร้อย');
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '14px' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubTab === 'giftcodes' && (
                  <div>
                    <form onSubmit={handleCreateGiftCode} style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '18px', padding: '22px', marginBottom: '26px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c084fc', margin: '0 0 14px 0' }}>🎁 สร้างโค้ดของขวัญ / โค้ดกิจกรรมใหม่</h3>
                      
                      {adminCodeMsg.text && (
                        <div style={{ backgroundColor: adminCodeMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: adminCodeMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
                          {adminCodeMsg.text}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อโค้ด (เช่น VIP2026)</label>
                          <input 
                            type="text" 
                            placeholder="พิมพ์ชื่อโค้ด..." 
                            value={newCodeName} 
                            onChange={(e) => setNewCodeName(e.target.value)}
                            style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #a855f7', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>เกมที่ได้รับ</label>
                          <select 
                            value={newCodeGame} 
                            onChange={(e) => setNewCodeGame(e.target.value)}
                            style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}
                          >
                            {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>แพ็กเกจรางวัล</label>
                          <input 
                            type="text" 
                            value={newCodeReward} 
                            onChange={(e) => setNewCodeReward(e.target.value)}
                            style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>จำนวนสิทธิ์ที่แจก</label>
                          <input 
                            type="number" 
                            value={newCodeMaxUses} 
                            onChange={(e) => setNewCodeMaxUses(e.target.value)}
                            style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <button type="submit" style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                        สร้างโค้ดกิจกรรม (Firebase)
                      </button>
                    </form>

                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '18px', padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 14px 0' }}>📋 โค้ดที่มีในระบบ</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {giftCodes.map((gc, idx) => (
                          <div key={gc.firebaseKey || gc.code || `giftcode-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '12px 16px', borderRadius: '10px' }}>
                            <div>
                              <span style={{ fontSize: '15px', fontWeight: '900', color: '#c084fc', letterSpacing: '1px' }}>{gc.code}</span>
                              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                รางวัล: <b style={{ color: '#ffffff' }}>{gc.reward}</b> ({gc.game})
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span style={{ fontSize: '12px', color: '#38bdf8' }}>
                                ใช้ไปแล้ว {gc.usedCount || 0} / {gc.maxUses} สิทธิ์
                              </span>
                              <button 
                                onClick={() => {
                                  if (gc.firebaseKey) {
                                    set(ref(db, `giftCodes/${gc.firebaseKey}`), null);
                                    showToast('ลบโค้ดของขวัญเรียบร้อย');
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubTab === 'users' && (
                  <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '18px', padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>👥 สมาชิกในระบบ ({registeredUsers.length} คน)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {registeredUsers.map((u, idx) => (
                        <div key={u.firebaseKey || u.username || `user-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '14px 18px', borderRadius: '12px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>{u.username}</span>
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', backgroundColor: u.isAdmin ? 'rgba(168, 85, 247, 0.25)' : 'rgba(56, 189, 248, 0.2)', color: u.isAdmin ? '#c084fc' : '#38bdf8', fontWeight: 'bold' }}>
                                {u.isAdmin ? '👑 ADMIN' : 'MEMBER'}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                              อีเมล: {u.email || '-'} | สมัครเมื่อ: {u.createdAt || '-'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>เครดิตคงเหลือ:</div>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{(u.balance || 0).toLocaleString()}</div>
                            </div>
                            <button 
                              onClick={() => { setSelectedUserToEdit(u); setUserBalanceAdjustAmount('100'); }}
                              style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              ⚙️ ปรับยอดเงิน
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubTab === 'settings' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '18px', padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 12px 0' }}>📢 ข้อความวิ่งหน้าเว็บ (Ticker)</h3>
                      <textarea 
                        rows={3}
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button 
                        onClick={() => {
                          localStorage.setItem('cyber_announcement', announcementText);
                          set(ref(db, 'settings/announcement'), announcementText).catch(() => {});
                          showToast('บันทึกข้อความวิ่งหน้าเว็บเรียบร้อย!');
                        }}
                        style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', marginTop: '10px', cursor: 'pointer' }}
                      >
                        บันทึกข้อความวิ่ง
                      </button>
                    </div>

                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '18px', padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c084fc', margin: '0 0 12px 0' }}>🔐 เปลี่ยนรหัส PIN 6 หลัก</h3>
                      <input 
                        type="password" 
                        maxLength={6}
                        placeholder="กรอก PIN 6 หลักใหม่..."
                        defaultValue={adminPin}
                        id="newPinInputBox"
                        style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button 
                        onClick={() => {
                          const el = document.getElementById('newPinInputBox');
                          const val = el ? el.value : '';
                          if (val.length === 6) {
                            setAdminPin(val);
                            localStorage.setItem('cyber_admin_pin', val);
                            set(ref(db, 'settings/adminPin'), val).catch(() => {});
                            showToast('เปลี่ยนรหัส PIN แอดมินสำเร็จ!');
                          } else {
                            showToast('PIN ต้องมี 6 หลัก', 'error');
                          }
                        }}
                        style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', marginTop: '10px', cursor: 'pointer' }}
                      >
                        บันทึกเปลี่ยน PIN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: CHECKOUT */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '24px', maxWidth: '460px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative', boxShadow: '0 0 45px rgba(168,85,247,0.45)' }}>
            <button onClick={() => setShowCheckoutModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}>✕</button>

            {isProcessing ? (
              <div style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'cyberOnlineBlink 1s infinite' }}>⚡</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>กำลังดำเนินการเติมเกม...</h3>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>ระบบกำลังเชื่อมต่อ API ค่ายเกมเพื่อส่งมอบไอเทมเข้า UID อัตโนมัติ</p>
              </div>
            ) : (
              <div>
                {selectedPayment.id === 'qrcode' && (
                  <div>
                    <div style={{ backgroundColor: '#003764', borderRadius: '12px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', letterSpacing: '1px' }}>THAI QR PAYMENT</span>
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>PromptPay</span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>ยอดที่ต้องชำระ:</div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#34d399', marginBottom: '12px' }}>
                      ฿{orderPricing.finalPrice.toLocaleString()}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', maxWidth: '210px', margin: '0 auto 16px auto', boxShadow: '0 0 25px rgba(255,255,255,0.2)' }}>
                      <svg viewBox="0 0 100 100" width="180" height="180">
                        <rect x="5" y="5" width="25" height="25" fill="#000" />
                        <rect x="8" y="8" width="19" height="19" fill="#fff" />
                        <rect x="11" y="11" width="13" height="13" fill="#000" />

                        <rect x="70" y="5" width="25" height="25" fill="#000" />
                        <rect x="73" y="8" width="19" height="19" fill="#fff" />
                        <rect x="76" y="11" width="13" height="13" fill="#000" />

                        <rect x="5" y="70" width="25" height="25" fill="#000" />
                        <rect x="8" y="73" width="19" height="19" fill="#fff" />
                        <rect x="11" y="76" width="13" height="13" fill="#000" />

                        <rect x="35" y="10" width="6" height="6" fill="#000" />
                        <rect x="45" y="10" width="6" height="6" fill="#000" />
                        <rect x="55" y="10" width="6" height="6" fill="#000" />
                        <rect x="35" y="20" width="6" height="6" fill="#000" />
                        <rect x="50" y="25" width="6" height="6" fill="#000" />

                        <rect x="10" y="35" width="6" height="6" fill="#000" />
                        <rect x="25" y="45" width="6" height="6" fill="#000" />
                        <rect x="40" y="40" width="20" height="20" fill="#003764" rx="3" />
                        <text x="50" y="54" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="bold">PP</text>

                        <rect x="65" y="35" width="6" height="6" fill="#000" />
                        <rect x="80" y="45" width="6" height="6" fill="#000" />

                        <rect x="35" y="70" width="6" height="6" fill="#000" />
                        <rect x="55" y="75" width="6" height="6" fill="#000" />
                        <rect x="70" y="70" width="6" height="6" fill="#000" />
                        <rect x="85" y="80" width="6" height="6" fill="#000" />
                      </svg>
                    </div>

                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '14px' }}>
                      ชื่อบัญชี: <b style={{ color: '#ffffff' }}>บจก. ไซเบอร์ ท็อปอัพ (ประเทศไทย)</b><br />
                      หมดอายุใน: <b style={{ color: '#facc15' }}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} นาที</b>
                    </div>

                    {slipVerifying ? (
                      <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '12px', padding: '12px', marginBottom: '12px', fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>
                        {slipVerifyStepText}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          onClick={handleSimulateSlipScan}
                          style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                        >
                          📸 แนบสลิปโอนเงิน (สแกนตรวจสลิป AUTO)
                        </button>
                        <button 
                          onClick={handleFinalPaymentSubmit}
                          style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                        >
                          ⚡ ยืนยันชำระเงินสำเร็จ (บันทึกลง Firebase)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedPayment.id === 'wallet' && (
                  <div>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>💰</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>ชำระผ่านเครดิตร้าน (Cyber Wallet)</h3>
                    <div style={{ backgroundColor: '#030712', borderRadius: '14px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>ยอดคงเหลือในกระเป๋า:</span>
                        <b style={{ color: '#34d399' }}>฿{(user?.balance || 0).toLocaleString()}</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>ยอดหักชำระ:</span>
                        <b style={{ color: '#f87171' }}>-฿{orderPricing.finalPrice.toLocaleString()}</b>
                      </div>
                      <div style={{ borderTop: '1px solid #374151', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 'bold' }}>คงเหลือสุทธิ:</span>
                        <b style={{ color: '#38bdf8' }}>฿{((user?.balance || 0) - orderPricing.finalPrice).toLocaleString()}</b>
                      </div>
                    </div>
                    <button 
                      onClick={handleFinalPaymentSubmit}
                      style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                    >
                      ยืนยันตัดเครดิตทันที
                    </button>
                  </div>
                )}

                {selectedPayment.id === 'true' && (
                  <div>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>💚</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>TrueMoney Wallet</h3>
                    {!trueMoneyOtpStep ? (
                      <div>
                        <input 
                          type="text" 
                          maxLength={10}
                          placeholder="กรอกเบอร์มือถือ TrueMoney 10 หลัก..."
                          value={truemoneyPhone}
                          onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))}
                          style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', marginBottom: '14px', outline: 'none' }}
                        />
                        <button 
                          onClick={() => setTrueMoneyOtpStep(true)}
                          style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold' }}
                        >
                          รับรหัส OTP ทาง SMS
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>กรอกรหัส OTP 6 หลักที่ส่งไปยังเบอร์ของคุณ:</div>
                        <input 
                          type="text" 
                          maxLength={6}
                          placeholder="889900"
                          value={trueMoneyOtpCode}
                          onChange={(e) => setTrueMoneyOtpCode(e.target.value)}
                          style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #10b981', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', fontSize: '20px', letterSpacing: '4px', marginBottom: '14px', outline: 'none' }}
                        />
                        <button 
                          onClick={handleFinalPaymentSubmit}
                          style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          ยืนยัน OTP ชำระเงิน ฿{orderPricing.finalPrice.toLocaleString()}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedPayment.id === 'credit' && (
                  <div>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>💳</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 14px 0' }}>ชำระผ่านบัตรเครดิต / เดบิต</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '16px' }}>
                      <input 
                        type="text" 
                        placeholder="หมายเลขบัตร 16 หลัก..."
                        value={creditCardNum}
                        onChange={(e) => setCreditCardNum(e.target.value)}
                        style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff' }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={creditCardExp}
                          onChange={(e) => setCreditCardExp(e.target.value)}
                          style={{ flex: 1, backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff' }}
                        />
                        <input 
                          type="password" 
                          maxLength={3} 
                          placeholder="CVV" 
                          value={creditCardCvv}
                          onChange={(e) => setCreditCardCvv(e.target.value)}
                          style={{ width: '70px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff' }}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleFinalPaymentSubmit}
                      style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ชำระเงิน ฿{orderPricing.finalPrice.toLocaleString()} ปลอดภัย 3D Secure
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DELIVERED STOCK */}
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
              
              <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold', marginBottom: '6px' }}>🔑 รหัสสินค้า / Voucher Code ของคุณ:</div>
              <div style={{ backgroundColor: '#111827', border: '1.5px solid #34d399', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '16px', fontWeight: '900', letterSpacing: '1px', wordBreak: 'break-all', textAlign: 'center' }}>
                {deliveredStockModal.code}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' }}>
                💡 รหัสนี้ถูกบันทึกลงหน้า "📋 เช็คสถานะ" เรียบร้อย สามารถเปิดดูซ้ำได้ตลอดเวลา
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(deliveredStockModal.code);
                  showToast('คัดลอกรหัสสินค้าเรียบร้อย!');
                }}
                style={{ flex: 1.2, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                📋 คัดลอกรหัสทันที
              </button>
              <button 
                onClick={() => {
                  setDeliveredStockModal(null);
                  setActiveTab('track');
                }}
                style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                ไปหน้าเช็คสถานะ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WALLET TOPUP */}
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
                    color: '#ffffff', border: '1px solid ' + (topupAmount === val ? '#34d399' : '#374151'),
                    padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px'
                  }}
                >
                  ฿{parseInt(val).toLocaleString()}
                </button>
              ))}
            </div>

            <form onSubmit={handleTopupWallet} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="number" 
                placeholder="ระบุจำนวนเงิน..." 
                value={topupAmount} 
                onChange={(e) => setTopupAmount(e.target.value)}
                style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #10b981', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '18px', textAlign: 'center', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
              <button 
                type="submit" 
                style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
              >
                ยืนยันเติมเงิน ฿{parseInt(topupAmount || 0).toLocaleString()} (ซิงค์ Firebase)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EVENT GIFT CODE */}
      {showEventModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #38bdf8', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowEventModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎁</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 6px 0' }}>แลกรับของรางวัล / โค้ดฟรี</h3>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>กรอกโค้ดกิจกรรมพิเศษเพื่อรับแพ็กเกจเกมเข้า UID ฟรี 100%</p>

            {eventMsg.text && (
              <div style={{ backgroundColor: eventMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: eventMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
                {eventMsg.text}
              </div>
            )}

            <form onSubmit={handleRedeemEventCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. เลือกเกม</label>
                <select 
                  value={eventGame} 
                  onChange={(e) => setEventGame(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none' }}
                >
                  {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. UID หรือชื่อตัวละคร</label>
                <input 
                  type="text" 
                  placeholder="ระบุ UID ในเกม..."
                  value={eventPlayerId}
                  onChange={(e) => setEventPlayerId(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af' }}>3. รหัสโค้ดกิจกรรม (Gift Code)</label>
                  <span style={{ fontSize: '11px', color: '#38bdf8' }}>ตัวอย่าง: CYBER2026, ROVVIP</span>
                </div>
                <input 
                  type="text" 
                  placeholder="พิมพ์รหัสโค้ดที่นี่..."
                  value={eventGiftCode}
                  onChange={(e) => setEventGiftCode(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['CYBER2026', 'ROVVIP', 'FREE50'].map(c => (
                  <button 
                    key={c} 
                    type="button" 
                    onClick={() => {
                      setEventGiftCode(c);
                      if (c === 'ROVVIP') setEventGame('ROV (Arena of Valor)');
                      else setEventGame('VALORANT');
                      if (!eventPlayerId) setEventPlayerId('TestPlayer#TH1');
                    }}
                    style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    กดทดสอบ: {c}
                  </button>
                ))}
              </div>

              <button 
                type="submit" 
                style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '6px' }}
              >
                ยืนยันแลกรับรางวัลฟรี
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECEIPT */}
      {viewReceiptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', color: '#111827', borderRadius: '20px', maxWidth: '420px', width: '100%', padding: '28px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setViewReceiptModal(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#6b7280', fontSize: '18px', cursor: 'pointer' }}>✕</button>

            <div style={{ textAlign: 'center', borderBottom: '1px dashed #d1d5db', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>⚡ CYBER TOPUP</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>ใบเสร็จรับเงิน / ใบส่งมอบสินค้าอิเล็กทรอนิกส์</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7', marginTop: '6px' }}>{viewReceiptModal.id}</div>
            </div>

            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>วันที่ทำรายการ:</span>
                <b>{viewReceiptModal.time}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>ชื่อลูกค้า:</span>
                <b>{viewReceiptModal.player}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>เกม:</span>
                <b>{viewReceiptModal.game}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>แพ็กเกจ:</span>
                <b>{viewReceiptModal.package}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>UID / ตัวละคร:</span>
                <b>{viewReceiptModal.gameChar}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>ช่องทางชำระเงิน:</span>
                <b>{viewReceiptModal.paymentMethod}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>สถานะ:</span>
                <b style={{ color: '#059669' }}>{viewReceiptModal.status}</b>
              </div>
              {viewReceiptModal.deliveredCode && (
                <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px', textAlign: 'center', marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>รหัสสินค้าที่ได้รับ:</div>
                  <b style={{ fontSize: '14px', color: '#111827', letterSpacing: '1px' }}>{viewReceiptModal.deliveredCode}</b>
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid #111827', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>ยอดสุทธิ (รวม VAT):</span>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>฿{viewReceiptModal.price?.toLocaleString()}</span>
            </div>

            <button 
              onClick={() => { window.print(); }}
              style={{ width: '100%', backgroundColor: '#111827', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
            >
              🖨️ พิมพ์ใบเสร็จ
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN ADJUST BALANCE */}
      {selectedUserToEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #0284c7', borderRadius: '20px', maxWidth: '380px', width: '100%', padding: '24px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setSelectedUserToEdit(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px 0' }}>ปรับยอดเงินสมาชิก</h3>
            <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '14px' }}>บัญชี: {selectedUserToEdit.username}</div>
            
            <div style={{ backgroundColor: '#030712', padding: '12px', borderRadius: '10px', marginBottom: '14px', textAlign: 'left', fontSize: '13px' }}>
              <div>ยอดเงินปัจจุบัน: <b style={{ color: '#34d399' }}>฿{(selectedUserToEdit.balance || 0).toLocaleString()}</b></div>
            </div>

            <input 
              type="number" 
              placeholder="จำนวนเงินที่ต้องการเพิ่ม/ลด..." 
              value={userBalanceAdjustAmount}
              onChange={(e) => setUserBalanceAdjustAmount(e.target.value)}
              style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', marginBottom: '14px', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={async () => {
                  const amt = parseFloat(userBalanceAdjustAmount);
                  if (!isNaN(amt)) {
                    const newBal = (selectedUserToEdit.balance || 0) + amt;
                    await set(ref(db, `users/${selectedUserToEdit.firebaseKey}/balance`), newBal);
                    showToast(`เพิ่มเงินให้ ${selectedUserToEdit.username} ฿${amt} สำเร็จ`);
                    setSelectedUserToEdit(null);
                  }
                }}
                style={{ flex: 1, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + เติมเงิน
              </button>
              <button 
                onClick={async () => {
                  const amt = parseFloat(userBalanceAdjustAmount);
                  if (!isNaN(amt)) {
                    const newBal = Math.max(0, (selectedUserToEdit.balance || 0) - amt);
                    await set(ref(db, `users/${selectedUserToEdit.firebaseKey}/balance`), newBal);
                    showToast(`หักเงิน ${selectedUserToEdit.username} ฿${amt} สำเร็จ`);
                    setSelectedUserToEdit(null);
                  }
                }}
                style={{ flex: 1, backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                - หักเงิน
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
        <p style={{ margin: 0, color: '#6b7280' }}>รองรับทุกช่องทาง: PromptPay QR Code, TrueMoney Wallet, Visa / Mastercard และ Cyber Wallet</p>
      </footer>
    </div>
  );
}
