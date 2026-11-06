import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';

// ---------------------------------------------------------------------------
// 1. Firebase Config & Initialization
// ---------------------------------------------------------------------------
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const auth = getAuth(app);

// ---------------------------------------------------------------------------
// 2. Global CSS Styles & Animations
// ---------------------------------------------------------------------------
const cyberGlobalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700;800;900&display=swap');

  body, input, button, select, textarea {
    font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }

  button, [role="button"], input[type="submit"], input[type="button"], .cyber-btn {
    position: relative;
    cursor: pointer !important;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    user-select: none;
    outline: none !important;
  }

  button:hover:not(:disabled), .cyber-btn:hover {
    transform: translateY(-2px) scale(1.02) !important;
    filter: brightness(1.08) !important;
  }

  button:active:not(:disabled), .cyber-btn:active {
    transform: translateY(1px) scale(0.98) !important;
  }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #fff7ed; border-radius: 8px; }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #f97316, #ec4899); border-radius: 8px; }

  .cyber-game-card {
    position: relative;
    background: #ffffff !important;
    border: 2.5px solid #fed7aa !important;
    border-radius: 24px !important;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(249, 115, 22, 0.08);
    transition: all 0.3s ease !important;
  }
  .cyber-game-card:hover {
    transform: translateY(-6px) scale(1.02) !important;
    border-color: #f97316 !important;
    box-shadow: 0 15px 35px rgba(249, 115, 22, 0.2) !important;
  }

  .package-card-item {
    transition: all 0.25s ease !important;
    cursor: pointer;
  }
  .package-card-item:hover {
    transform: translateY(-3px) scale(1.02) !important;
    border-color: #f97316 !important;
  }

  @keyframes floatAnimation {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  .float-anim { animation: floatAnimation 3.5s ease-in-out infinite; }
`;

// ---------------------------------------------------------------------------
// 3. VIP Rank Tiers
// ---------------------------------------------------------------------------
const RANK_TIERS = [
  { tier: 'CHALLENGER', level: 7, title: 'Mythic Legend', name: 'Challenger VIP', shortName: 'CHALLENGER', minSpend: 50000, color: '#ff2d55', border: '#ff2d55', bg: 'rgba(255, 45, 85, 0.2)' },
  { tier: 'MASTER', level: 6, title: 'Grand Master', name: 'Master VIP', shortName: 'MASTER', minSpend: 25000, color: '#f472b6', border: '#ec4899', bg: 'rgba(236, 72, 153, 0.2)' },
  { tier: 'DIAMOND', level: 5, title: 'Diamond Champion', name: 'Diamond VIP', shortName: 'DIAMOND', minSpend: 10000, color: '#c084fc', border: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' },
  { tier: 'PLATINUM', level: 4, title: 'Platinum Elite', name: 'Platinum VIP', shortName: 'PLATINUM', minSpend: 5000, color: '#38bdf8', border: '#0ea5e9', bg: 'rgba(56, 189, 248, 0.2)' },
  { tier: 'GOLD', level: 3, title: 'Gold Commander', name: 'Gold VIP', shortName: 'GOLD', minSpend: 2000, color: '#fbbf24', border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
  { tier: 'SILVER', level: 2, title: 'Silver Knight', name: 'Silver VIP', shortName: 'SILVER', minSpend: 500, color: '#e2e8f0', border: '#94a3b8', bg: 'rgba(148, 163, 184, 0.2)' },
  { tier: 'BRONZE', level: 1, title: 'Bronze Scout', name: 'Bronze Member', shortName: 'BRONZE', minSpend: 0, color: '#f59e0b', border: '#b45309', bg: 'rgba(217, 119, 6, 0.2)' }
];

const getCustomerRank = (spending) => {
  const spend = Number(spending) || 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    const tier = RANK_TIERS[i];
    if (spend >= tier.minSpend) {
      const prevTier = i > 0 ? RANK_TIERS[i - 1] : null;
      return {
        ...tier,
        currentSpend: spend,
        nextTier: prevTier ? prevTier.name : null,
        nextSpend: prevTier ? prevTier.minSpend : null,
        remainingToNext: prevTier ? Math.max(0, prevTier.minSpend - spend) : 0,
        progressPercent: prevTier 
          ? Math.min(100, Math.round(((spend - tier.minSpend) / (prevTier.minSpend - tier.minSpend)) * 100))
          : 100
      };
    }
  }
  return { ...RANK_TIERS[RANK_TIERS.length - 1], currentSpend: 0, remainingToNext: 500, progressPercent: 0 };
};

function RankEmblem({ tier, size = 20 }) {
  const t = (tier || '').toUpperCase();
  const colorMap = {
    CHALLENGER: '#ff2d55',
    MASTER: '#f472b6',
    DIAMOND: '#c084fc',
    PLATINUM: '#38bdf8',
    GOLD: '#fbbf24',
    SILVER: '#94a3b8',
    BRONZE: '#d97706'
  };
  const color = colorMap[t] || '#d97706';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0 }}>
      <polygon points="50,6 88,26 88,74 50,94 12,74 12,26" fill="#1e1b4b" stroke={color} strokeWidth="4" />
      <polygon points="50,18 76,32 76,68 50,82 24,68 24,32" fill={color} opacity="0.3" />
      <circle cx="50" cy="50" r="14" fill={color} />
      <polygon points="50,42 53,48 59,49 55,54 56,60 50,57 44,60 45,54 41,49 47,48" fill="#ffffff" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. Verification & Helper Functions
// ---------------------------------------------------------------------------
const verifySlipWithSlipOK = async (imageBase64Data, expectedAmount, metadata = {}) => {
  let cleanBase64 = imageBase64Data.includes(',') ? imageBase64Data.split(',')[1] : imageBase64Data;
  try {
    const response = await fetch('/api/verify-slip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: cleanBase64, expectedAmount, ...metadata }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success) return data;
    return { success: false, message: data.message || 'สลิปไม่ถูกต้องหรือยอดเงินไม่ตรง' };
  } catch (err) {
    return { success: false, message: 'ไม่สามารถเชื่อมต่อระบบตรวจสอบสลิปได้: ' + err.message };
  }
};

const EyeIcon = ({ show }) => (
  show ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
);

// ---------------------------------------------------------------------------
// 5. Main Component
// ---------------------------------------------------------------------------
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('meow_theme_mode') === 'dark');
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('meow_theme_mode', next ? 'dark' : 'light');
      return next;
    });
  };

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cyber_current_logged_user')); } catch (e) { return null; }
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'history', 'admin'

  // Authentication State
  const [authMode, setAuthMode] = useState('login');
  const [usernameInput, setUsernameInput] = useState(() => localStorage.getItem('cyber_remembered_user') || '');
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

  // OTP Modal State (แบบเดิม)
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotTargetUser, setForgotTargetUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(300);
  const [otpResendCountdown, setOtpResendCountdown] = useState(60);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotStatusMsg, setForgotStatusMsg] = useState({ text: '', type: '' });

  // รายการเกม (ตัด Genshin, Honkai, PUBG ออกตามที่ขอ)
  const [gamesData] = useState([
    {
      id: 'valorant',
      name: 'VALORANT',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต #1 🔥',
      packages: [
        { id: 'v1', name: '475 VP', price: 128 },
        { id: 'v2', name: '1,000 VP', price: 255 },
        { id: 'v3', name: '2,050 VP', price: 510 },
        { id: 'v4', name: '3,650 VP', price: 905 },
        { id: 'v5', name: '5,350 VP', price: 1295 },
        { id: 'v6', name: '11,000 VP (Whale)', price: 2580 }
      ]
    },
    {
      id: 'rov',
      name: 'ROV (Arena of Valor)',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต MOBA ⚔️',
      packages: [
        { id: 'r1', name: '60 คูปอง', price: 49.5 },
        { id: 'r2', name: '110 คูปอง', price: 89.5 },
        { id: 'r3', name: '185 คูปอง', price: 148 },
        { id: 'r4', name: '370 คูปอง', price: 296 },
        { id: 'r5', name: '620 คูปอง', price: 493 },
        { id: 'r6', name: '1,240 คูปอง', price: 985 }
      ]
    },
    {
      id: 'freefire',
      name: 'Free Fire',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดนิยม #1 🎯',
      packages: [
        { id: 'ff1', name: '172 เพชร', price: 49.5 },
        { id: 'ff2', name: '310 เพชร', price: 89 },
        { id: 'ff3', name: '517 เพชร', price: 148.5 },
        { id: 'ff4', name: '690 เพชร', price: 197 },
        { id: 'ff5', name: '1,052 เพชร', price: 296 },
        { id: 'ff6', name: '1,801 เพชร', price: 493 }
      ]
    },
    {
      id: 'lol',
      name: 'League of Legends (PC)',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      badge: 'MOBA ยอดฮิต 🏆',
      packages: [
        { id: 'l1', name: '615 RP', price: 136 },
        { id: 'l2', name: '1,320 RP', price: 273 },
        { id: 'l3', name: '2,795 RP', price: 547 },
        { id: 'l4', name: '4,985 RP', price: 959 }
      ]
    },
    {
      id: 'fcmobile',
      name: 'EA SPORTS FC Mobile',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80',
      badge: 'ฟุตบอลอันดับ 1 ⚽',
      packages: [
        { id: 'fc1', name: '4,466 FC Points', price: 49 },
        { id: 'fc2', name: '8,181 FC Points', price: 88.5 },
        { id: 'fc3', name: '15,000 FC Points', price: 147.5 },
        { id: 'fc4', name: '30,000 FC Points', price: 295 }
      ]
    },
    {
      id: 'avatarstar',
      name: 'Avatar Star',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80',
      badge: 'ยิงปืนสุดมันส์ ⚡',
      packages: [
        { id: 'as1', name: '300 Diamonds', price: 45 },
        { id: 'as2', name: '1,000 Diamonds', price: 120 },
        { id: 'as3', name: '2,100 Diamonds', price: 235 },
        { id: 'as4', name: '3,600 Diamonds', price: 399 }
      ]
    },
    {
      id: 'razergold_card',
      name: 'Razer Gold PIN (e-Pin)',
      category: 'card',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80',
      badge: 'ส่งรหัส PIN ทันที ⚡',
      packages: [
        { id: 'rg50', name: '50 THB PIN', price: 49 },
        { id: 'rg100', name: '100 THB PIN', price: 98 },
        { id: 'rg300', name: '300 THB PIN', price: 292 },
        { id: 'rg500', name: '500 THB PIN', price: 487 },
        { id: 'rg1000', name: '1,000 THB PIN', price: 975 }
      ]
    }
  ]);

  // สถานะสต็อกเกมในระบบ (เปิด/ปิดรับเติม)
  const [gameStockStatus, setGameStockStatus] = useState({});
  useEffect(() => {
    const statusRef = ref(db, 'game_stock_status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setGameStockStatus(data);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleGameStock = (gameId, gameName) => {
    const nextStatus = gameStockStatus[gameId] === false;
    set(ref(db, `game_stock_status/${gameId}`), nextStatus);
  };

  // State การสั่งซื้อ
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [packageQty, setPackageQty] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [isVerifyingSlip, setIsVerifyingSlip] = useState(false);
  const [slipError, setSlipError] = useState('');

  // State เติม Cat Coin Wallet
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletSlipFile, setWalletSlipFile] = useState(null);
  const [walletSlipPreview, setWalletSlipPreview] = useState(null);
  const [isWalletVerifying, setIsWalletVerifying] = useState(false);
  const [walletError, setWalletError] = useState('');

  // State เช็คประวัติคำสั่งซื้อแบบเดิม
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyOrderSearch, setHistoryOrderSearch] = useState('');
  const [historyGameFilter, setHistoryGameFilter] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(true);

  // State แดชบอร์ดแอดมินแบบเดิม
  const isUserAdmin = user && (user.username?.toLowerCase() === 'thanphooms' || user.email?.toLowerCase() === 'thanphooms@gmail.com');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('cyber_is_admin_logged') === 'true');
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('cyber_admin_pin') || '123456');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [changePinMessage, setChangePinMessage] = useState({ text: '', type: '' });
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminOrdersPage, setAdminOrdersPage] = useState(1);

  // แอดมิน: ค่าโฆษณา
  const [adPlatform, setAdPlatform] = useState('Facebook Ads');
  const [adAmountInput, setAdAmountInput] = useState('');
  const [adPromotions, setAdPromotions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cyber_ad_promotions_list')) || []; } catch (e) { return []; }
  });

  // Realtime Listeners สำหรับผู้ใช้และคำสั่งซื้อ
  useEffect(() => {
    const unsubUsers = onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const uList = Object.keys(data).map(k => ({ ...data[k], firebaseKey: k }));
        setRegisteredUsers(uList);
        if (user) {
          const updated = uList.find(u => u.username?.toLowerCase() === user.username?.toLowerCase());
          if (updated) {
            setUser(updated);
            localStorage.setItem('cyber_current_logged_user', JSON.stringify(updated));
          }
        }
      } else {
        setRegisteredUsers([]);
      }
    });

    const unsubOrders = onValue(ref(db, 'orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrders(Object.keys(data).map(k => ({ ...data[k], firebaseKey: k })).reverse());
      } else {
        setOrders([]);
      }
    });

    return () => { unsubUsers(); unsubOrders(); };
  }, []);

  // OTP Countdown
  useEffect(() => {
    let timer;
    if (forgotModalOpen && forgotStep === 2) {
      timer = setInterval(() => {
        setOtpCountdown(prev => (prev > 0 ? prev - 1 : 0));
        setOtpResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotModalOpen, forgotStep]);

  // คำนวณยอดใช้จ่ายและแรงค์ลูกค้า
  const currentUserSpending = orders
    .filter(o => o.type === 'game' && !o.status?.includes('ยกเลิก') && o.player?.toLowerCase() === user?.username?.toLowerCase())
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const currentUserRank = getCustomerRank(currentUserSpending);

  // Authentication Handlers
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้ และรหัสผ่าน');
        return;
      }
      const found = registeredUsers.find(u => u.username?.toLowerCase() === usernameInput.trim().toLowerCase());
      if (!found || found.password !== passwordInput) {
        setAuthError('ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง');
        return;
      }
      if (rememberMe) localStorage.setItem('cyber_remembered_user', usernameInput.trim());
      else localStorage.removeItem('cyber_remembered_user');
      setUser(found);
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(found));
    } else {
      if (!emailInput.trim() || !regUsernameInput.trim() || !regPasswordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
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
      const isExist = registeredUsers.some(u => u.username?.toLowerCase() === regUsernameInput.trim().toLowerCase());
      if (isExist) {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น');
        return;
      }
      const newUser = {
        username: regUsernameInput.trim(),
        email: emailInput.trim().toLowerCase(),
        password: regPasswordInput,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      push(ref(db, 'users'), newUser).then(() => {
        setUsernameInput(regUsernameInput.trim());
        setPasswordInput(regPasswordInput);
        setAuthSuccessMsg('🎉 สมัครสมาชิกสำเร็จเรียบร้อยแล้ว!');
        setAuthMode('login');
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cyber_current_logged_user');
    setIsAdminLoggedIn(false);
    localStorage.removeItem('cyber_is_admin_logged');
    setActiveTab('shop');
  };

  // OTP Handlers
  const handleRequestOtpSubmit = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });
    const clean = forgotEmailInput.trim().toLowerCase();
    const matched = registeredUsers.find(u => u.username?.toLowerCase() === clean || u.email?.toLowerCase() === clean);
    if (!matched) {
      setForgotStatusMsg({ text: `ไม่พบบัญชีผู้ใช้ "${forgotEmailInput}" ในระบบ`, type: 'error' });
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setForgotTargetUser(matched);
    setOtpCountdown(300);
    setOtpResendCountdown(60);
    setForgotStep(2);
    setForgotStatusMsg({ text: `📧 ส่งรหัส OTP 6 หลักเรียบร้อยแล้ว (OTP ของคุณคือ: ${otp})`, type: 'success' });
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    if (forgotOtpInput.trim() !== generatedOtp) {
      setForgotStatusMsg({ text: '❌ รหัส OTP ไม่ถูกต้อง', type: 'error' });
      return;
    }
    setForgotStep(3);
    setForgotStatusMsg({ text: '✅ ยืนยันรหัส OTP ถูกต้อง! กรุณาตั้งรหัสผ่านใหม่', type: 'success' });
  };

  const handleSetNewPasswordSubmit = (e) => {
    e.preventDefault();
    if (forgotNewPassword.trim().length < 6 || forgotNewPassword !== forgotConfirmPassword) {
      setForgotStatusMsg({ text: 'รหัสผ่านใหม่ต้องมี 6 ตัวขึ้นไปและตรงกันทั้งสองช่อง', type: 'error' });
      return;
    }
    set(ref(db, `users/${forgotTargetUser.firebaseKey}/password`), forgotNewPassword.trim()).then(() => {
      setForgotStatusMsg({ text: '🎉 เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว! กำลังกลับสู่หน้าแรก...', type: 'success' });
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotStep(1);
      }, 2000);
    });
  };

  // การสั่งซื้อแพ็กเกจเกม
  const handleConfirmGameOrder = async () => {
    if (!playerId.trim() || !selectedPackage) return;
    const total = selectedPackage.price * packageQty;

    if (selectedPayment === 'wallet') {
      if ((user.balance || 0) < total) {
        alert('ยอดเหรียญ Cat Coin ไม่เพียงพอ กรุณาเติมเหรียญก่อนสั่งซื้อ');
        return;
      }
      const newBal = (user.balance || 0) - total;
      set(ref(db, `users/${user.firebaseKey}/balance`), newBal);
    }

    const newOrder = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      game: selectedGame.name,
      package: `${selectedPackage.name} (x${packageQty})`,
      price: total,
      player: user ? user.username : 'Guest',
      gameChar: playerId.trim(),
      paymentMethod: selectedPayment === 'wallet' ? 'Cat Coin Wallet' : 'โอนเงินธนาคาร (SCB/พร้อมเพย์)',
      status: selectedPayment === 'wallet' ? '✅ สำเร็จ (เติมเงินแล้ว)' : '⏳ รอตรวจสอบยอดเงิน',
      type: 'game',
      time: new Date().toLocaleString('th-TH'),
      dateKey: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    push(ref(db, 'orders'), newOrder);
    setShowCheckoutModal(false);
    setSelectedGame(null);
    setSelectedPackage(null);
    setPlayerId('');
    setActiveTab('history');
    alert('บันทึกคำสั่งซื้อเรียบร้อยแล้ว!');
  };

  // เติมเงิน Wallet ผ่าน SlipOK
  const handleWalletSlipUpload = async () => {
    if (!walletSlipFile || !walletAmount) return;
    setIsWalletVerifying(true);
    setWalletError('');

    try {
      const base64 = await fileToBase64(walletSlipFile);
      const res = await verifySlipWithSlipOK(base64, parseFloat(walletAmount));
      if (res.success) {
        const amt = parseFloat(walletAmount);
        const newBal = (user.balance || 0) + amt;
        set(ref(db, `users/${user.firebaseKey}/balance`), newBal);

        push(ref(db, 'orders'), {
          id: 'ORD-W-' + Math.floor(10000 + Math.random() * 90000),
          game: 'เติมเครดิตร้าน',
          package: `+฿${amt.toLocaleString()}`,
          price: amt,
          player: user.username,
          gameChar: 'เติมเครดิต',
          paymentMethod: 'โอนเงินธนาคาร (SlipOK ผ่าน)',
          status: '✅ เติมเครดิตสำเร็จ (ตรวจสลิปผ่าน)',
          type: 'wallet',
          time: new Date().toLocaleString('th-TH'),
          dateKey: new Date().toISOString().split('T')[0],
          timestamp: Date.now()
        });

        setIsWalletVerifying(false);
        setShowWalletModal(false);
        setWalletAmount('');
        setWalletSlipFile(null);
        alert(`🎉 เติมเหรียญสำเร็จ! ได้รับ ${amt.toLocaleString()} Cat Coin เรียบร้อยแล้ว`);
      } else {
        setIsWalletVerifying(false);
        setWalletError(res.message || 'สลิปไม่ถูกต้อง');
      }
    } catch (e) {
      setIsWalletVerifying(false);
      setWalletError('เกิดข้อผิดพลาดในการตรวจสอบสลิป');
    }
  };

  // แอดมินล็อกอิน
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminPinError('');
    if (adminPinInput === adminPin) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('cyber_is_admin_logged', 'true');
      setAdminPinInput('');
    } else {
      setAdminPinError('รหัส PIN ไม่ถูกต้อง');
    }
  };

  // กรองประวัติคำสั่งซื้อแบบเดิม (History Tab)
  const nowDayStr = new Date().toISOString().split('T')[0];
  const searchedOrders = orders.filter(o => {
    const matchUser = isUserAdmin ? (!historySearchQuery || o.player?.toLowerCase().includes(historySearchQuery.toLowerCase())) : (o.player?.toLowerCase() === user?.username?.toLowerCase());
    const matchOrder = !historyOrderSearch || o.id?.toLowerCase().includes(historyOrderSearch.toLowerCase());
    const matchGame = historyGameFilter === 'all' || o.game?.toLowerCase() === historyGameFilter.toLowerCase();
    return matchUser && matchOrder && matchGame;
  });

  const todayOrders = searchedOrders.filter(o => o.dateKey === nowDayStr || o.time?.includes(new Date().toLocaleDateString('th-TH')));
  const pastOrders = searchedOrders.filter(o => o.dateKey !== nowDayStr && !o.time?.includes(new Date().toLocaleDateString('th-TH')));
  const totalSpentInSearch = searchedOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);

  // ---------------------------------------------------------------------------
  // RENDER: หน้าล็อกอินแบบเดิม (ถ้ายังไม่ล็อกอิน)
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div style={{
        backgroundColor: '#fffaf5',
        backgroundImage: 'radial-gradient(#fdba74 1.2px, transparent 1.2px), radial-gradient(#f472b6 1.2px, #fffaf5 1.2px)',
        backgroundSize: '36px 36px',
        color: '#1e293b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <style>{cyberGlobalStyles}</style>
        <div style={{
          backgroundColor: '#ffffff', border: '3px solid #fed7aa', borderRadius: '28px',
          padding: '40px 32px', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px rgba(249, 115, 22, 0.15)', textAlign: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '22px',
              background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
              border: '3px solid #ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(249,115,22,0.4)', fontSize: '36px', marginBottom: '12px'
            }}>
              🐱
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, background: 'linear-gradient(135deg, #ea580c, #db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MEOW TOPUP
            </div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
              🐾 CUTE & FAST GAME STORE 🪙
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
            {authMode === 'login' ? 'เข้าสู่ระบบด้วยชื่อผู้ใช้งานอัตโนมัติ 24 ชม.' : 'สมัครสมาชิกใหม่ กรอกอีเมลและชื่อผู้ใช้'}
          </p>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            {authError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authError}</div>}
            {authSuccessMsg && <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#10b981', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authSuccessMsg}</div>}

            {authMode === 'login' ? (
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>ชื่อผู้ใช้งาน (Username)</label>
                <input type="text" placeholder="กรอกชื่อผู้ใช้งาน..." value={usernameInput} onChange={e => setUsernameInput(e.target.value)} style={{ width: '100%', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. อีเมลกู้คืนรหัสผ่าน</label>
                  <input type="email" placeholder="example@gmail.com" value={emailInput} onChange={e => setEmailInput(e.target.value)} style={{ width: '100%', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>2. ชื่อผู้ใช้งาน</label>
                  <input type="text" placeholder="ตั้งชื่อผู้ใช้งาน..." value={regUsernameInput} onChange={e => setRegUsernameInput(e.target.value)} style={{ width: '100%', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                {authMode === 'register' ? '3. รหัสผ่าน (6 ตัวขึ้นไป)' : 'รหัสผ่าน (Password)'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={authMode === 'login' ? (showLoginPassword ? 'text' : 'password') : (showRegPassword ? 'text' : 'password')}
                  placeholder="กรอกรหัสผ่าน..."
                  value={authMode === 'login' ? passwordInput : regPasswordInput}
                  onChange={e => authMode === 'login' ? setPasswordInput(e.target.value) : setRegPasswordInput(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '12px 40px 12px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => authMode === 'login' ? setShowLoginPassword(!showLoginPassword) : setShowRegPassword(!showRegPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none' }}>
                  <EyeIcon show={authMode === 'login' ? showLoginPassword : showRegPassword} />
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>4. ยืนยันรหัสผ่าน</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่านอีกครั้ง..."
                    value={confirmPasswordInput}
                    onChange={e => setConfirmPasswordInput(e.target.value)}
                    style={{ width: '100%', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '12px 40px 12px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none' }}>
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                  <input type="checkbox" id="rem" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  <label htmlFor="rem">จดจำไอดีไว้</label>
                </div>
                <span onClick={() => { setForgotModalOpen(true); setForgotStep(1); }} style={{ color: '#f97316', cursor: 'pointer', fontWeight: 'bold' }}>ลืมรหัสผ่าน?</span>
              </div>
            )}

            <button type="submit" style={{ backgroundColor: '#f97316', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', marginTop: '10px' }}>
              {authMode === 'login' ? 'เข้าสู่ระบบ (Login)' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div style={{ marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
            {authMode === 'login' ? (
              <>ยังไม่มีบัญชี? <span onClick={() => { setAuthMode('register'); setAuthError(''); }} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 'bold' }}>สมัครสมาชิก</span></>
            ) : (
              <>มีบัญชีแล้ว? <span onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 'bold' }}>เข้าสู่ระบบ</span></>
            )}
          </div>
        </div>

        {/* Modal ลืมรหัสผ่านพร้อม OTP 3 ขั้นตอนแบบเดิม */}
        {forgotModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center', color: '#fff' }}>
              <button onClick={() => setForgotModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px' }}>✕</button>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>กู้คืนรหัสผ่าน OTP</h3>
              {forgotStatusMsg.text && (
                <div style={{ backgroundColor: forgotStatusMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: forgotStatusMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
                  {forgotStatusMsg.text}
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleRequestOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="กรอกอีเมลหรือชื่อผู้ใช้" value={forgotEmailInput} onChange={e => setForgotEmailInput(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#030712', color: '#fff' }} />
                  <button type="submit" style={{ padding: '12px', borderRadius: '10px', background: '#9333ea', color: '#fff', border: 'none', fontWeight: 'bold' }}>ขอรับรหัส OTP</button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" maxLength={6} placeholder="• • • • • •" value={forgotOtpInput} onChange={e => setForgotOtpInput(e.target.value.replace(/\D/g, ''))} style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #a855f7', backgroundColor: '#030712', color: '#fff', textAlign: 'center', fontSize: '24px', letterSpacing: '6px' }} />
                  <div style={{ fontSize: '12px', color: '#38bdf8' }}>หมดอายุใน: {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}</div>
                  <button type="submit" style={{ padding: '12px', borderRadius: '10px', background: '#34d399', color: '#000', border: 'none', fontWeight: 'bold' }}>ยืนยันรหัส OTP</button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleSetNewPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="password" placeholder="รหัสผ่านใหม่" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#030712', color: '#fff' }} />
                  <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" value={forgotConfirmPassword} onChange={e => setForgotConfirmPassword(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#030712', color: '#fff' }} />
                  <button type="submit" style={{ padding: '12px', borderRadius: '10px', background: '#9333ea', color: '#fff', border: 'none', fontWeight: 'bold' }}>บันทึกรหัสผ่านใหม่</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: หน้าจอหลักเมื่อเข้าสู่ระบบแล้ว (Header, Shop, History, Admin)
  // ---------------------------------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0b0f19' : '#fffaf5',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      paddingBottom: '50px'
    }}>
      <style>{cyberGlobalStyles}</style>

      {/* แถบเมนูด้านบน Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', position: 'sticky', top: 0, zIndex: 40,
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(254, 243, 235, 0.95)',
        borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #fed7aa', backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #f97316, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🐱
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '18px', color: '#ea580c' }}>MEOW TOPUP</div>
            <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>🐾 FAST GAME STORE 🪙</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '14px', background: isDarkMode ? '#1e293b' : '#ffffff', border: '1.5px solid #fed7aa', fontSize: '12px' }}>
            <RankEmblem tier={currentUserRank.tier} size={18} />
            <span>👤 <b>{user.username}</b></span>
            <span style={{ color: '#ea580c', fontWeight: 'bold' }}>🪙 {(user.balance || 0).toLocaleString()} Coin</span>
            <button onClick={() => setShowWalletModal(true)} style={{ background: '#f97316', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>+ เติมเหรียญ</button>
          </div>

          <button onClick={toggleTheme} className="cyber-btn" style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid #fed7aa', background: isDarkMode ? '#1e293b' : '#ffedd5', color: isDarkMode ? '#fde047' : '#ea580c', fontWeight: 'bold', fontSize: '12px' }}>
            {isDarkMode ? '🌙 มืด' : '☀️ สว่าง'}
          </button>
          <button onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} className="cyber-btn" style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'shop' ? '#ea580c' : '#334155', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>
            🐱 หน้าร้าน
          </button>
          <button onClick={() => setActiveTab('history')} className="cyber-btn" style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'history' ? '#ea580c' : '#334155', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>
            📋 เช็คประวัติ
          </button>
          {isUserAdmin && (
            <button onClick={() => setActiveTab('admin')} className="cyber-btn" style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'admin' ? '#9333ea' : '#334155', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>
              ⚙️ หลังบ้าน
            </button>
          )}
          <button onClick={handleLogout} className="cyber-btn" style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 'bold', fontSize: '12px' }}>
            🚪 ออก
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1100px', margin: '25px auto', padding: '0 20px' }}>
        {/* TAB 1: หน้าร้านค้า (Shop) */}
        {activeTab === 'shop' && !selectedGame && (
          <div>
            {/* Banner แบบ CSS Gradient ประหยัดพื้นที่ */}
            <div style={{
              borderRadius: '24px', padding: '35px 30px', marginBottom: '30px',
              background: 'linear-gradient(135deg, #ea580c 0%, #db2777 50%, #9333ea 100%)',
              color: '#ffffff', boxShadow: '0 15px 35px rgba(234, 88, 12, 0.25)', position: 'relative', overflow: 'hidden'
            }}>
              <h2 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 8px 0' }}>🐱 MEOW TOPUP STORE</h2>
              <p style={{ fontSize: '13px', margin: 0, opacity: 0.95 }}>เติมเกมออนไลน์ระบบออเดอร์เรียลไทม์ ปลอดภัย 100% เติมได้ตลอด 24 ชม.</p>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>🎮 เลือกเกมที่ต้องการเติม</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
              {gamesData.map(g => (
                <div key={g.id} onClick={() => setSelectedGame(g)} className="cyber-game-card">
                  <img src={g.image} alt={g.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{g.name}</div>
                    <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 'bold', marginTop: '2px' }}>{g.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* หน้ารายละเอียดเลือกแพ็กเกจของเกม */}
        {activeTab === 'shop' && selectedGame && (
          <div style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff', border: '2px solid #fed7aa', borderRadius: '24px', padding: '30px' }}>
            <button onClick={() => setSelectedGame(null)} style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>⬅ ย้อนกลับ</button>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>เติมเกม {selectedGame.name}</h2>
            
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>ระบุ UID / ชื่อตัวละคร / Riot ID</label>
              <input type="text" placeholder="เช่น 123456789 หรือ Player#TAG" value={playerId} onChange={e => setPlayerId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #fed7aa', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>เลือกแพ็กเกจที่ต้องการ</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
                {selectedGame.packages.map(p => (
                  <div key={p.id} onClick={() => setSelectedPackage(p)} className="package-card-item" style={{
                    padding: '14px', borderRadius: '14px',
                    border: selectedPackage?.id === p.id ? '2px solid #ea580c' : '1px solid #fed7aa',
                    background: selectedPackage?.id === p.id ? 'rgba(249, 115, 22, 0.1)' : 'transparent'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{p.name}</div>
                    <div style={{ color: '#ea580c', fontWeight: 900, fontSize: '16px', marginTop: '4px' }}>฿{p.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => {
              if (!playerId.trim() || !selectedPackage) return alert('กรุณากรอกไอดีและเลือกแพ็กเกจ');
              setShowCheckoutModal(true);
            }} style={{ width: '100%', marginTop: '25px', padding: '14px', borderRadius: '12px', background: '#ea580c', color: '#fff', border: 'none', fontWeight: 900, fontSize: '15px' }}>
              ดำเนินการชำระเงิน ➔
            </button>
          </div>
        )}

        {/* TAB 2: เช็คประวัติแบบเดิม (History Tab พร้อม Today Orders และ Past Orders พับได้) */}
        {activeTab === 'history' && (
          <div style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff', border: '1.5px solid #fed7aa', borderRadius: '24px', padding: '30px' }}>
            <div style={{ borderBottom: '1px solid #fed7aa', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 6px 0' }}>📋 เช็คสถานะคำสั่งซื้อและประวัติการทำรายการ</h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                👤 บัญชี: <b>{user.username}</b> | ยอดเติมสะสม: <b style={{ color: '#10b981' }}>฿{currentUserSpending.toLocaleString()}</b>
              </div>
            </div>

            {/* ช่องค้นหาและตัวกรอง */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {isUserAdmin && (
                <input type="text" placeholder="🔍 ค้นหาชื่อลูกค้า..." value={historySearchQuery} onChange={e => setHistorySearchQuery(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa' }} />
              )}
              <input type="text" placeholder="🔍 ค้นหาเลขออร์เดอร์ เช่น ORD-12345..." value={historyOrderSearch} onChange={e => setHistoryOrderSearch(e.target.value)} style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa' }} />
              <select value={historyGameFilter} onChange={e => setHistoryGameFilter(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <option value="all">🎮 เลือกดูเกม (ทั้งหมด)</option>
                {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>

            <div style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffedd5', padding: '10px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>พบ <b>{searchedOrders.length}</b> รายการ</span>
              <span>ยอดรวม: <b style={{ color: '#ea580c', fontSize: '14px' }}>฿{totalSpentInSearch.toLocaleString()}</b></span>
            </div>

            {/* รายการประจำวัน (วันนี้) */}
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#ea580c', marginBottom: '12px' }}>📅 รายการประจำวัน (วันนี้ {nowDayStr})</h3>
            {todayOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                {todayOrders.map((ord, idx) => (
                  <div key={ord.firebaseKey || idx} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>{ord.time}</span>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>🎮 {ord.game} ({ord.package})</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>UID: {ord.gameChar || ord.playerId} | จ่าย: {ord.paymentMethod}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#10b981', fontSize: '16px' }}>฿{ord.price}</div>
                      <span style={{ fontSize: '11px', color: ord.status?.includes('สำเร็จ') ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', border: '1px dashed #cbd5e1', borderRadius: '10px', marginBottom: '25px', fontSize: '12px' }}>ไม่มีรายการคำสั่งซื้อใหม่ในวันนี้</div>
            )}

            {/* ประวัติย้อนหลัง (พับได้) */}
            {pastOrders.length > 0 && (
              <div style={{ border: '1.5px solid #fed7aa', borderRadius: '14px', overflow: 'hidden' }}>
                <div onClick={() => setIsPastOrdersOpen(!isPastOrdersOpen)} style={{ padding: '14px 18px', background: isDarkMode ? '#1e293b' : '#fff7ed', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>📂 ประวัติย้อนหลัง ({pastOrders.length} รายการ)</span>
                  <span style={{ fontSize: '12px', color: '#ea580c' }}>{isPastOrdersOpen ? '▲ พับเก็บ' : '▼ เปิดดู'}</span>
                </div>
                {isPastOrdersOpen && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pastOrders.map((ord, idx) => (
                      <div key={ord.firebaseKey || idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <b>{ord.id}</b> - {ord.game} ({ord.package})
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{ord.time} | UID: {ord.gameChar || ord.playerId}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#10b981' }}>฿{ord.price}</div>
                          <div style={{ fontSize: '11px' }}>{ord.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: หลังบ้านแอดมิน (Admin Dashboard แบบเดิมครบชุด) */}
        {activeTab === 'admin' && isUserAdmin && (
          <div style={{ maxWidth: '950px', margin: '0 auto' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '380px', margin: '40px auto', padding: '30px', background: isDarkMode ? '#111827' : '#ffffff', border: '2px solid #a855f7', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔐</div>
                <h3 style={{ fontWeight: 900, marginBottom: '6px' }}>ยืนยันสิทธิ์แอดมิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>กรอกรหัส PIN 6 หลักเพื่อเข้าหลังบ้าน</p>
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {adminPinError && <div style={{ color: '#ef4444', fontSize: '12px' }}>{adminPinError}</div>}
                  <input type="password" maxLength={6} placeholder="PIN 6 หลัก" value={adminPinInput} onChange={e => setAdminPinInput(e.target.value.replace(/\D/g, ''))} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '20px', letterSpacing: '6px' }} />
                  <button type="submit" style={{ padding: '12px', borderRadius: '10px', background: '#9333ea', color: '#fff', border: 'none', fontWeight: 'bold' }}>เข้าสู่ระบบแอดมิน</button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. จัดการคำสั่งซื้อเรียลไทม์ */}
                <div style={{ background: isDarkMode ? '#111827' : '#ffffff', padding: '24px', borderRadius: '20px', border: '2px solid #fed7aa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>📋 จัดการคำสั่งซื้อของลูกค้า</h3>
                    <button onClick={() => { setIsAdminLoggedIn(false); localStorage.removeItem('cyber_is_admin_logged'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>ล็อกเอาท์ PIN</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.slice(0, 15).map(o => (
                      <div key={o.firebaseKey} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <b>{o.id}</b> - {o.game} ({o.package}) | ลูกค้า: <b>{o.player}</b> (UID: {o.gameChar || o.playerId})
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{o.time} | ฿{o.price} | {o.status}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => {
                            set(ref(db, `orders/${o.firebaseKey}/status`), '✅ สำเร็จ (แอดมินอนุมัติแล้ว)');
                            if (o.type === 'wallet') {
                              const target = registeredUsers.find(u => u.username?.toLowerCase() === o.player?.toLowerCase());
                              if (target) set(ref(db, `users/${target.firebaseKey}/balance`), (target.balance || 0) + o.price);
                            }
                          }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>อนุมัติ</button>
                          <button onClick={() => set(ref(db, `orders/${o.firebaseKey}/status`), '❌ ยกเลิก (ไม่พบยอดโอน)')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>ยกเลิก</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. จัดการสต็อกเกม (เปิด-ปิดรับเติม) */}
                <div style={{ background: isDarkMode ? '#111827' : '#ffffff', padding: '24px', borderRadius: '20px', border: '2px solid #fed7aa' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '14px' }}>⚙️ เปิด/ปิดรับเติมเกม (สต็อก)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {gamesData.map(g => {
                      const isOpen = gameStockStatus[g.id] !== false;
                      return (
                        <div key={g.id} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{g.name}</span>
                          <button onClick={() => handleToggleGameStock(g.id, g.name)} style={{ background: isOpen ? '#10b981' : '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {isOpen ? 'เปิดอยู่' : 'สต็อกหมด'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. จัดการสมาชิกและเครดิต */}
                <div style={{ background: isDarkMode ? '#111827' : '#ffffff', padding: '24px', borderRadius: '20px', border: '2px solid #fed7aa' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '14px' }}>👥 สมาชิกในระบบ ({registeredUsers.length} คน)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {registeredUsers.map(u => (
                      <div key={u.firebaseKey} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <b>{u.username}</b> ({u.email}) - เครดิต: <b style={{ color: '#ea580c' }}>{(u.balance || 0).toLocaleString()}</b> Coin
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => {
                            const add = prompt(`เพิ่มเครดิตให้คุณ ${u.username} (จำนวนเหรียญ):`);
                            if (add && !isNaN(add)) set(ref(db, `users/${u.firebaseKey}/balance`), (u.balance || 0) + parseFloat(add));
                          }} style={{ background: '#f97316', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>+ เติม</button>
                          <button onClick={() => {
                            if (confirm(`ลบบัญชี ${u.username} หรือไม่?`)) remove(ref(db, `users/${u.firebaseKey}`));
                          }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>ลบ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal เติมเหรียญ Cat Coin Wallet */}
      {showWalletModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff', border: '2px solid #fed7aa', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '26px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '12px' }}>🪙 เติมเหรียญ Cat Coin</h3>
            {walletError && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>{walletError}</div>}
            
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>จำนวนเงินที่โอน (บาท)</label>
            <input type="number" placeholder="เช่น 100" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', marginBottom: '14px', boxSizing: 'border-box' }} />

            <div style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffedd5', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
              <div>🏦 <b>ธนาคารไทยพาณิชย์ (SCB)</b></div>
              <div>เลขบัญชี: <b>558-265124-6</b></div>
              <div>ชื่อ: นาย ธนภูมิ รักษี</div>
              <div style={{ marginTop: '4px', color: '#ea580c' }}>หรือพร้อมเพย์: 095-626-7172</div>
            </div>

            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>แนบสลิปโอนเงิน</label>
            <input type="file" accept="image/*" onChange={e => setWalletSlipFile(e.target.files[0])} style={{ marginBottom: '16px', fontSize: '12px' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowWalletModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', background: 'none' }}>ยกเลิก</button>
              <button onClick={handleWalletSlipUpload} disabled={isWalletVerifying} style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#fff', fontWeight: 'bold' }}>
                {isWalletVerifying ? 'กำลังตรวจสลิป...' : 'ยืนยันสลิป'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันชำระเงินคำสั่งซื้อ */}
      {showCheckoutModal && selectedPackage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff', border: '2px solid #fed7aa', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '26px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '14px' }}>ยืนยันการสั่งซื้อ</h3>
            <div style={{ fontSize: '13px', marginBottom: '14px' }}>
              <div>เกม: <b>{selectedGame?.name}</b></div>
              <div>แพ็กเกจ: <b>{selectedPackage.name}</b></div>
              <div>UID/ไอดี: <b>{playerId}</b></div>
              <div style={{ fontSize: '16px', color: '#ea580c', fontWeight: 900, marginTop: '6px' }}>ยอดชำระ: ฿{selectedPackage.price * packageQty}</div>
            </div>

            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>เลือกช่องทางชำระเงิน</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="radio" name="pay" value="wallet" checked={selectedPayment === 'wallet'} onChange={() => setSelectedPayment('wallet')} />
                <span>🪙 หักจาก Cat Coin Wallet (มี {(user?.balance || 0).toLocaleString()} Coin)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="radio" name="pay" value="bank" checked={selectedPayment === 'bank'} onChange={() => setSelectedPayment('bank')} />
                <span>🏦 โอนเงินผ่าน SCB / พร้อมเพย์ 095-626-7172</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowCheckoutModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', background: 'none' }}>ยกเลิก</button>
              <button onClick={handleConfirmGameOrder} style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#fff', fontWeight: 'bold' }}>ยืนยันชำระเงิน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
