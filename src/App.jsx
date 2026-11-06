import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  push, 
  remove, 
  update 
} from 'firebase/database';
import { 
  getAuth, 
  signOut 
} from 'firebase/auth';

// ---------------------------------------------------------------------------
// 1. Firebase Config & Initialization (Live Realtime Database)
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
// 2. VIP Rank Tiers Definition
// ---------------------------------------------------------------------------
const VIP_TIERS = [
  { level: 7, name: 'Challenger Mythic', badge: '👑', minSpend: 50000, discount: 12, color: '#ff2d55' },
  { level: 6, name: 'Master Tiger', badge: '🐯', minSpend: 25000, discount: 8.5, color: '#f43f5e' },
  { level: 5, name: 'Royal Diamond', badge: '💎', minSpend: 10000, discount: 6, color: '#a855f7' },
  { level: 4, name: 'Platinum Elite', badge: '🥇', minSpend: 5000, discount: 4, color: '#0ea5e9' },
  { level: 3, name: 'Hunter Gold', badge: '🥈', minSpend: 2000, discount: 2.5, color: '#f59e0b' },
  { level: 2, name: 'Silver Scout', badge: '🥉', minSpend: 500, discount: 1, color: '#94a3b8' },
  { level: 1, name: 'Kitten Bronze', badge: '🐾', minSpend: 0, discount: 0, color: '#d97706' }
];

const getVipRank = (totalSpend = 0) => {
  const spend = Number(totalSpend) || 0;
  for (const tier of VIP_TIERS) {
    if (spend >= tier.minSpend) {
      const idx = VIP_TIERS.indexOf(tier);
      const nextTier = idx > 0 ? VIP_TIERS[idx - 1] : null;
      return {
        ...tier,
        currentSpend: spend,
        nextTier: nextTier ? nextTier.name : null,
        needMore: nextTier ? Math.max(0, nextTier.minSpend - spend) : 0,
        progress: nextTier 
          ? Math.min(100, Math.round(((spend - tier.minSpend) / (nextTier.minSpend - tier.minSpend)) * 100)) 
          : 100
      };
    }
  }
  return { ...VIP_TIERS[VIP_TIERS.length - 1], currentSpend: 0, needMore: 500, progress: 0 };
};

// ---------------------------------------------------------------------------
// 3. เกมในระบบ (นำ Avatar Star ออกตามคำขอเรียบร้อย)
// ---------------------------------------------------------------------------
const GAME_CATALOG = [
  {
    id: 'valorant',
    name: 'VALORANT (Riot Points)',
    category: 'FPS / PC',
    theme: 'from-rose-600 via-rose-700 to-zinc-950',
    idLabel: 'Riot ID (เช่น Meow#TH1)',
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
    category: 'MOBA / Mobile',
    theme: 'from-blue-600 via-indigo-700 to-slate-950',
    idLabel: 'OpenID หรือ เลขประจำตัวในเกม',
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
    name: 'Free Fire Max',
    category: 'Battle Royale',
    theme: 'from-amber-600 via-orange-700 to-stone-950',
    idLabel: 'UID ผู้เล่น',
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
    category: 'MOBA / PC',
    theme: 'from-cyan-600 via-sky-700 to-zinc-950',
    idLabel: 'Riot ID หรือ ชื่อซัมมอนเนอร์',
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
    category: 'Sports / Mobile',
    theme: 'from-emerald-600 via-teal-700 to-zinc-950',
    idLabel: 'UID ผู้จัดการทีม',
    packages: [
      { id: 'fc1', name: '4,466 FC Points', price: 49 },
      { id: 'fc2', name: '8,181 FC Points', price: 88.5 },
      { id: 'fc3', name: '15,000 FC Points', price: 147.5 },
      { id: 'fc4', name: '30,000 FC Points', price: 295 }
    ]
  },
  {
    id: 'razergold_card',
    name: 'Razer Gold PIN (e-Pin)',
    category: 'Voucher / Digital PIN',
    theme: 'from-lime-600 via-emerald-700 to-neutral-950',
    idLabel: 'เบอร์โทรหรืออีเมลสำหรับรับรหัส PIN',
    packages: [
      { id: 'rg50', name: '50 THB PIN', price: 49 },
      { id: 'rg100', name: '100 THB PIN', price: 98 },
      { id: 'rg300', name: '300 THB PIN', price: 292 },
      { id: 'rg500', name: '500 THB PIN', price: 487 },
      { id: 'rg1000', name: '1,000 THB PIN', price: 975 }
    ]
  }
];

// ---------------------------------------------------------------------------
// 4. Lightweight Vector Icons & Components
// ---------------------------------------------------------------------------
const CatLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="shrink-0 select-none">
    <circle cx="50" cy="50" r="46" fill="url(#meowG)" stroke="#f59e0b" strokeWidth="2.5" />
    <polygon points="25,36 36,12 50,28" fill="#ea580c" />
    <polygon points="75,36 64,12 50,28" fill="#ea580c" />
    <circle cx="50" cy="55" r="30" fill="#fff7ed" />
    <ellipse cx="40" cy="50" rx="4.5" ry="6" fill="#1e1b4b" />
    <ellipse cx="60" cy="50" rx="4.5" ry="6" fill="#1e1b4b" />
    <circle cx="42" cy="48" r="1.5" fill="#fff" />
    <circle cx="62" cy="48" r="1.5" fill="#fff" />
    <polygon points="50,57 46,62 54,62" fill="#ec4899" />
    <path d="M46,65 Q50,69 54,65" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
    <defs>
      <linearGradient id="meowG" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="60%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
  </svg>
);

const CoinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block align-middle shrink-0">
    <circle cx="12" cy="12" r="11" fill="url(#coing)" stroke="#b45309" strokeWidth="1" />
    <text x="12" y="16" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#78350f">₵</text>
    <defs>
      <linearGradient id="coing" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
);

// ---------------------------------------------------------------------------
// 5. Main Component
// ---------------------------------------------------------------------------
export default function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('meow_theme') !== 'light');
  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('meow_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cyber_logged_user')) || null;
    } catch {
      return null;
    }
  });

  const [tab, setTab] = useState('shop');

  // Firebase Realtime State
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [gameStock, setGameStock] = useState({});
  const [packageStock, setPackageStock] = useState({});
  const [adminOnline, setAdminOnline] = useState(true);

  // Auth Inputs
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

  // OTP Modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotTargetUser, setForgotTargetUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(300);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStatusMsg, setForgotStatusMsg] = useState({ text: '', type: '' });

  // Shop & Order
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [payMethod, setPayMethod] = useState('wallet');
  const [slipPreview, setSlipPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cat Coin Wallet Topup
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletSlipPreview, setWalletSlipPreview] = useState(null);
  const [isCheckingSlip, setIsCheckingSlip] = useState(false);
  const [walletMsg, setWalletMsg] = useState({ text: '', type: '' });

  // History Tab Filters
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyOrderSearch, setHistoryOrderSearch] = useState('');
  const [historyGameFilter, setHistoryGameFilter] = useState('all');
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(true);

  // Admin Dashboard
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const name = String(user.username || '').toLowerCase();
    const mail = String(user.email || '').toLowerCase();
    return name === 'thanphooms' || mail === 'thanphooms@gmail.com';
  }, [user]);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem('cyber_admin_auth') === 'true');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinCode, setAdminPinCode] = useState(() => localStorage.getItem('cyber_pin_code') || '123456');
  const [newPinSetting, setNewPinSetting] = useState('');
  const [totalAdSpend, setTotalAdSpend] = useState(() => Number(localStorage.getItem('cyber_ad_spend')) || 0);

  const [adminFolds, setAdminFolds] = useState({
    orders: true,
    stock: true,
    members: false,
    stats: false,
    lnwtrue: false,
    settings: false
  });

  const toggleAdminFold = (key) => {
    setAdminFolds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------------------------------------------------------------------------
  // 6. Realtime Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const unsubUsers = onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key,
          balance: Number(data[key].balance || 0),
          totalSpent: Number(data[key].totalSpent || 0)
        }));
        setRegisteredUsers(list);

        if (user) {
          const current = list.find(u => 
            u.username?.toLowerCase() === user.username?.toLowerCase() || 
            u.email?.toLowerCase() === user.email?.toLowerCase()
          );
          if (current) {
            setUser(current);
            localStorage.setItem('cyber_logged_user', JSON.stringify(current));
          }
        }
      } else {
        setRegisteredUsers([]);
      }
    });

    const unsubOrders = onValue(ref(db, 'orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key,
          price: Number(data[key].price || 0)
        })).reverse();
        setOrders(list);
      } else {
        setOrders([]);
      }
    });

    const unsubGameStock = onValue(ref(db, 'game_stock_status'), (snapshot) => {
      setGameStock(snapshot.val() || {});
    });

    const unsubPkgStock = onValue(ref(db, 'package_stock_status'), (snapshot) => {
      setPackageStock(snapshot.val() || {});
    });

    const unsubStatus = onValue(ref(db, 'system_status/admin_online'), (snapshot) => {
      if (snapshot.exists()) setAdminOnline(snapshot.val());
    });

    return () => {
      unsubUsers();
      unsubOrders();
      unsubGameStock();
      unsubPkgStock();
      unsubStatus();
    };
  }, [user?.username]);

  const userRank = useMemo(() => {
    return getVipRank(user?.totalSpent || 0);
  }, [user?.totalSpent]);

  // ---------------------------------------------------------------------------
  // 7. Auth Handlers
  // ---------------------------------------------------------------------------
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      const query = usernameInput.trim().toLowerCase();
      const targetUser = registeredUsers.find(u => 
        String(u.username || '').toLowerCase() === query || 
        String(u.email || '').toLowerCase() === query
      );

      if (!targetUser) {
        setAuthError('ไม่พบชื่อผู้ใช้หรืออีเมลนี้ในระบบ');
        return;
      }
      if (targetUser.password !== passwordInput) {
        setAuthError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('cyber_remembered_user', usernameInput.trim());
      } else {
        localStorage.removeItem('cyber_remembered_user');
      }

      setUser(targetUser);
      localStorage.setItem('cyber_logged_user', JSON.stringify(targetUser));
    } else {
      const uName = regUsernameInput.trim();
      const uEmail = emailInput.trim().toLowerCase();

      if (!uName || !regPasswordInput || !uEmail || !confirmPasswordInput) {
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

      const isDup = registeredUsers.some(u => 
        String(u.username || '').toLowerCase() === uName.toLowerCase() ||
        String(u.email || '').toLowerCase() === uEmail
      );
      if (isDup) {
        setAuthError('ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว');
        return;
      }

      const newUser = {
        username: uName,
        email: uEmail,
        password: regPasswordInput,
        balance: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };

      push(ref(db, 'users'), newUser).then(() => {
        setUsernameInput(uName);
        setPasswordInput(regPasswordInput);
        setAuthSuccessMsg('🎉 สมัครสมาชิกสำเร็จ! เข้าสู่ระบบได้ทันที');
        setAuthMode('login');
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cyber_logged_user');
    setIsAdminAuthenticated(false);
    localStorage.removeItem('cyber_admin_auth');
    try { signOut(auth); } catch {}
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });
    const clean = forgotEmailInput.trim().toLowerCase();
    const matched = registeredUsers.find(u => u.username?.toLowerCase() === clean || u.email?.toLowerCase() === clean);
    if (!matched) {
      setForgotStatusMsg({ text: `ไม่พบบัญชี "${forgotEmailInput}" ในระบบ`, type: 'error' });
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setForgotTargetUser(matched);
    setOtpCountdown(300);
    setForgotStep(2);
    setForgotStatusMsg({ text: `📧 ส่ง OTP เรียบร้อย! (รหัสสำหรับคุณ: ${otp})`, type: 'success' });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (forgotOtpInput.trim() !== generatedOtp) {
      setForgotStatusMsg({ text: '❌ รหัส OTP ไม่ถูกต้อง', type: 'error' });
      return;
    }
    setForgotStep(3);
    setForgotStatusMsg({ text: '✅ OTP ถูกต้อง! กรุณาตั้งรหัสผ่านใหม่', type: 'success' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword.trim().length < 6 || forgotNewPassword !== forgotConfirmPassword) {
      setForgotStatusMsg({ text: 'รหัสผ่านใหม่ต้องมี 6 ตัวขึ้นไปและตรงกันทั้ง 2 ช่อง', type: 'error' });
      return;
    }
    await update(ref(db, `users/${forgotTargetUser.firebaseKey}`), {
      password: forgotNewPassword.trim()
    });
    setForgotStatusMsg({ text: '🎉 เปลี่ยนรหัสผ่านสำเร็จแล้ว!', type: 'success' });
    setTimeout(() => {
      setForgotModalOpen(false);
      setForgotStep(1);
    }, 1500);
  };

  // ---------------------------------------------------------------------------
  // 8. Order & Top-up Handlers (ตั้งค่าให้สำเร็จทันทีโดยไม่ต้องรออนุมัติ)
  // ---------------------------------------------------------------------------
  const calculateFinalPrice = (price) => {
    const discountAmount = (price * userRank.discount) / 100;
    return Number((price - discountAmount).toFixed(2));
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!selectedGame || !selectedPackage) return;
    if (!playerId.trim()) {
      alert(`กรุณากรอก ${selectedGame.idLabel}`);
      return;
    }

    const finalAmount = calculateFinalPrice(selectedPackage.price);

    if (payMethod === 'wallet') {
      if ((user.balance || 0) < finalAmount) {
        alert(`ยอดเหรียญใน Wallet ไม่พอ (ต้องการ ₵${finalAmount} มีอยู่ ₵${user.balance || 0})`);
        setShowWalletModal(true);
        return;
      }
    } else {
      if (!slipPreview) {
        alert('กรุณาแนบภาพสลิปโอนเงิน');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      // ทุกช่องทางชำระเงิน ให้เป็นสถานะสำเร็จทันทีโดยอัตโนมัติตามคำขอ
      const newOrder = {
        orderId,
        game: selectedGame.name,
        gameId: selectedGame.id,
        packageName: selectedPackage.name,
        price: finalAmount,
        originalPrice: selectedPackage.price,
        discountApplied: userRank.discount,
        player: user.username,
        playerId: playerId.trim(),
        paymentMethod: payMethod === 'wallet' ? 'Cat Coin Wallet' : 'PromptPay QR (สลิปโอนเงิน)',
        status: '✅ สำเร็จ (เติมเงินอัตโนมัติแล้ว)',
        time: new Date().toLocaleString('th-TH'),
        dateKey: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      };

      if (user.firebaseKey) {
        const nextBal = payMethod === 'wallet' ? (user.balance || 0) - finalAmount : (user.balance || 0);
        const nextSpent = (user.totalSpent || 0) + finalAmount;
        await update(ref(db, `users/${user.firebaseKey}`), {
          balance: nextBal,
          totalSpent: nextSpent
        });
      }

      await push(ref(db, 'orders'), newOrder);

      alert(`⚡ เติมเกมสำเร็จ! รหัสออเดอร์: ${orderId} (สถานะสำเร็จเรียบร้อย)`);
      setSelectedGame(null);
      setSelectedPackage(null);
      setPlayerId('');
      setSlipPreview(null);
      setTab('history');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletTopup = async (e) => {
    e.preventDefault();
    setWalletMsg({ text: '', type: '' });
    const amount = Number(walletAmount);

    if (!amount || amount < 10) {
      setWalletMsg({ text: 'ยอดเติมเงินขั้นต่ำคือ 10 บาท', type: 'error' });
      return;
    }
    if (!walletSlipPreview) {
      setWalletMsg({ text: 'กรุณาแนบภาพสลิปการโอนเงิน', type: 'error' });
      return;
    }

    setIsCheckingSlip(true);

    try {
      if (user?.firebaseKey) {
        const newBal = (user.balance || 0) + amount;
        await update(ref(db, `users/${user.firebaseKey}`), { balance: newBal });

        await push(ref(db, 'orders'), {
          orderId: 'TOPUP-' + Math.floor(100000 + Math.random() * 900000),
          game: 'Cat Coin Wallet',
          gameId: 'wallet',
          packageName: `เติมเหรียญ ₵${amount.toLocaleString()}`,
          price: amount,
          player: user.username,
          playerId: user.username,
          paymentMethod: 'PromptPay QR (อัตโนมัติ)',
          status: '✅ สำเร็จ (เติมเหรียญแล้ว)',
          time: new Date().toLocaleString('th-TH'),
          dateKey: new Date().toISOString().split('T')[0],
          timestamp: Date.now()
        });

        setWalletMsg({ text: `🎉 เติมเหรียญสำเร็จ! ยอดคงเหลือใหม่: ₵${newBal.toLocaleString()}`, type: 'success' });
        setTimeout(() => {
          setShowWalletModal(false);
          setWalletAmount('');
          setWalletSlipPreview(null);
          setWalletMsg({ text: '', type: '' });
        }, 1500);
      }
    } catch (err) {
      setWalletMsg({ text: 'เกิดข้อผิดพลาด: ' + err.message, type: 'error' });
    } finally {
      setIsCheckingSlip(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 9. Admin Operations
  // ---------------------------------------------------------------------------
  const handleAdminVerifyPin = (e) => {
    e.preventDefault();
    if (adminPinInput === adminPinCode) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('cyber_admin_auth', 'true');
      setAdminPinInput('');
    } else {
      alert('รหัส PIN แอดมินไม่ถูกต้อง!');
    }
  };

  const handleUpdateOrderStatus = async (o, newStatus) => {
    if (!o.firebaseKey) return;
    await update(ref(db, `orders/${o.firebaseKey}`), { status: newStatus });
  };

  const handleDeleteOrder = async (o) => {
    if (window.confirm(`ต้องการลบออเดอร์ ${o.orderId} หรือไม่?`)) {
      await remove(ref(db, `orders/${o.firebaseKey}`));
    }
  };

  const handleToggleGameStock = async (gameId) => {
    const cur = gameStock[gameId] ?? true;
    await set(ref(db, `game_stock_status/${gameId}`), !cur);
  };

  const handleTogglePackageStock = async (pkgId) => {
    const cur = packageStock[pkgId] ?? true;
    await set(ref(db, `package_stock_status/${pkgId}`), !cur);
  };

  const handleAdjustBalance = async (u, delta) => {
    if (!u.firebaseKey) return;
    const cur = Number(u.balance || 0);
    const updated = Math.max(0, cur + delta);
    await update(ref(db, `users/${u.firebaseKey}`), { balance: updated });
  };

  const handleDeleteUser = async (u) => {
    if (window.confirm(`ต้องการลบผู้ใช้ ${u.username} หรือไม่?`)) {
      await remove(ref(db, `users/${u.firebaseKey}`));
    }
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (newPinSetting.length === 6) {
      setAdminPinCode(newPinSetting);
      localStorage.setItem('cyber_pin_code', newPinSetting);
      setNewPinSetting('');
      alert('เปลี่ยนรหัส PIN แอดมินเรียบร้อยแล้ว');
    } else {
      alert('รหัส PIN ต้องมีความยาว 6 หลัก');
    }
  };

  // ---------------------------------------------------------------------------
  // 10. Filtered History Calculations (เฉพาะเกมที่อยู่ในหน้าแรกและไม่มี Avatar Star)
  // ---------------------------------------------------------------------------
  const activeGameCatalogNames = useMemo(() => {
    return ['Cat Coin Wallet', ...GAME_CATALOG.map(g => g.name)];
  }, []);

  const searchedOrders = useMemo(() => {
    return orders.filter(o => {
      const isGameInCatalog = activeGameCatalogNames.some(name => 
        o.game?.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(o.game?.toLowerCase())
      );
      if (!isGameInCatalog) return false;

      const matchUser = isSuperAdmin 
        ? (!historySearchQuery || o.player?.toLowerCase().includes(historySearchQuery.toLowerCase()))
        : (o.player?.toLowerCase() === user?.username?.toLowerCase());
      const matchOrder = !historyOrderSearch || o.orderId?.toLowerCase().includes(historyOrderSearch.toLowerCase());
      const matchGame = historyGameFilter === 'all' || o.game?.toLowerCase() === historyGameFilter.toLowerCase();

      return matchUser && matchOrder && matchGame;
    });
  }, [orders, activeGameCatalogNames, isSuperAdmin, historySearchQuery, user?.username, historyOrderSearch, historyGameFilter]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = searchedOrders.filter(o => o.dateKey === todayStr || o.time?.includes(new Date().toLocaleDateString('th-TH')));
  const pastOrders = searchedOrders.filter(o => o.dateKey !== todayStr && !o.time?.includes(new Date().toLocaleDateString('th-TH')));
  const totalAmountInSearch = searchedOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);

  // Financial Stats
  const totalSales = orders.filter(o => o.status?.includes('สำเร็จ')).reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const estimatedCost = totalSales * 0.88;
  const netProfit = totalSales - estimatedCost - totalAdSpend;
  const estimatedVat = totalSales * 0.07;

  // ---------------------------------------------------------------------------
  // VIEW: หน้าล็อกอิน / สมัครสมาชิก
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-300 font-sans ${
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-amber-50/60 text-neutral-900'
      }`}>
        <div className="fixed top-5 right-5 z-50">
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${
              isDark 
                ? 'bg-neutral-900 border-neutral-700 text-amber-400 hover:border-amber-400' 
                : 'bg-white border-amber-300 text-amber-700 hover:border-amber-500'
            }`}
          >
            {isDark ? '🌙 โหมดมืด' : '☀️ โหมดสว่าง'}
          </button>
        </div>

        <div className={`w-full max-w-md rounded-3xl p-8 border shadow-2xl transition-all ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-amber-200'
        }`}>
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25">
              🐱
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
              MEOW TOPUP
            </h1>
            <p className="text-xs text-neutral-400 font-medium">🐾 CUTE & FAST GAME STORE 24H 🪙</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
              {authError}
            </div>
          )}
          {authSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
              {authSuccessMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'login' ? (
              <>
                <div>
                  <label className="text-xs font-bold block mb-1 text-neutral-400">ชื่อผู้ใช้งาน (Username) หรือ อีเมล</label>
                  <input
                    type="text"
                    required
                    placeholder="กรอกชื่อผู้ใช้..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs border outline-none font-medium transition ${
                      isDark ? 'bg-neutral-950 border-neutral-800 focus:border-amber-500 text-white' : 'bg-neutral-50 border-neutral-300 focus:border-amber-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-neutral-400">รหัสผ่าน (Password)</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-xs border outline-none font-medium transition pr-10 ${
                        isDark ? 'bg-neutral-950 border-neutral-800 focus:border-amber-500 text-white' : 'bg-neutral-50 border-neutral-300 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-amber-500"
                    >
                      {showLoginPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-neutral-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>จดจำไอดีไว้</span>
                  </label>
                  <span
                    onClick={() => { setForgotModalOpen(true); setForgotStep(1); }}
                    className="text-amber-500 font-bold hover:underline cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold block mb-1 text-purple-400">1. อีเมลกู้คืนรหัสผ่าน</label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-neutral-400">2. ตั้งชื่อผู้ใช้งาน (Username)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น meowgamer"
                    value={regUsernameInput}
                    onChange={(e) => setRegUsernameInput(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-neutral-400">3. รหัสผ่าน (6 ตัวขึ้นไป)</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={regPasswordInput}
                      onChange={(e) => setRegPasswordInput(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none pr-10 ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400"
                    >
                      {showRegPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-neutral-400">4. ยืนยันรหัสผ่านอีกครั้ง</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none pr-10 ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400"
                    >
                      {showConfirmPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
            >
              {authMode === 'login' ? 'เข้าสู่ระบบ (Login)' : 'ยืนยันการสมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-neutral-400">
            {authMode === 'login' ? (
              <span>
                ยังไม่มีบัญชีใช่ไหม?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className="text-amber-500 font-bold hover:underline"
                >
                  สมัครสมาชิกที่นี่
                </button>
              </span>
            ) : (
              <span>
                มีบัญชีอยู่แล้ว?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className="text-amber-500 font-bold hover:underline"
                >
                  เข้าสู่ระบบเลย
                </button>
              </span>
            )}
          </div>
        </div>

        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-3xl border p-6 text-center space-y-4 shadow-2xl ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-amber-200 text-neutral-900'
            }`}>
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm">🔑 กู้คืนรหัสผ่าน OTP</h3>
                <button onClick={() => setForgotModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
              </div>

              {forgotStatusMsg.text && (
                <div className={`p-2.5 rounded-xl text-xs font-bold ${
                  forgotStatusMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {forgotStatusMsg.text}
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล"
                    value={forgotEmailInput}
                    onChange={(e) => setForgotEmailInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs border bg-neutral-950 border-neutral-700 text-white outline-none"
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
                    ขอรับรหัส OTP 6 หลัก
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={forgotOtpInput}
                    onChange={(e) => setForgotOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-widest text-2xl font-mono px-3 py-2.5 rounded-xl border bg-neutral-950 border-purple-500 text-white outline-none"
                  />
                  <div className="text-[11px] text-amber-400">หมดอายุใน: {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')} นาที</div>
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                    ยืนยันรหัส OTP
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <input
                    type="password"
                    placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs border bg-neutral-950 border-neutral-700 text-white outline-none"
                  />
                  <input
                    type="password"
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs border bg-neutral-950 border-neutral-700 text-white outline-none"
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black text-xs font-black">
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

  // ---------------------------------------------------------------------------
  // VIEW: เมื่อล็อกอินแล้ว (ตกแต่งหน้าแรกและหน้าประวัติให้สวยงามพรีเมียม)
  // ---------------------------------------------------------------------------
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-gradient-to-br from-amber-50/50 via-white to-rose-50/50 text-neutral-900'
    }`}>
      {/* HEADER NAVBAR */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white/90 border-amber-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div 
            onClick={() => { setTab('shop'); setSelectedGame(null); }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="transform group-hover:scale-105 transition-transform">
              <CatLogo size={40} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
                  MEOW TOPUP
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  AUTO 24H
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ระบบออโต้พร้อมให้บริการ</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-bold transition shadow-sm ${
                isDark ? 'bg-neutral-800 border-neutral-700 text-amber-400' : 'bg-white border-amber-300 text-amber-800'
              }`}
              title="สลับโหมดมืด/สว่าง"
            >
              {isDark ? '🌙' : '☀️'}
            </button>

            <button
              onClick={() => { setTab('shop'); setSelectedGame(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                tab === 'shop' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              🐱 หน้าร้าน
            </button>

            <button
              onClick={() => setTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                tab === 'history' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              📋 เช็คประวัติ
            </button>

            <button
              onClick={() => setTab('vip')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                tab === 'vip' 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-black font-black' 
                  : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              👑 สิทธิ VIP
            </button>

            <button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-xs font-bold text-amber-500 hover:border-amber-400 transition"
            >
              <CoinIcon size={16} />
              <span>₵{(user.balance || 0).toLocaleString()}</span>
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black">+</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setTab('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  tab === 'admin' 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' 
                    : 'bg-purple-900/30 border border-purple-500/50 text-purple-300'
                }`}
              >
                ⚙️ หลังบ้าน
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 text-xs text-rose-500 hover:text-rose-400 transition"
              title="ออกจากระบบ"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* VIP STATUS RIBBON */}
      <div className={`border-b text-xs py-2 px-4 transition-colors ${
        isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-amber-100/60 border-amber-200 text-amber-900'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{userRank.badge}</span>
            <span>ระดับสมาชิก: <b>{userRank.name}</b> (รับส่วนลด <b>{userRank.discount}%</b> อัตโนมัติทุกแพ็กเกจ)</span>
          </div>
          {userRank.nextTier ? (
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">อีก ฿{userRank.needMore.toLocaleString()} ขึ้น {userRank.nextTier}</span>
              <div className="w-24 bg-neutral-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full" style={{ width: `${userRank.progress}%` }} />
              </div>
            </div>
          ) : (
            <span className="text-amber-500 font-bold">🎉 ระดับสมาชิกสูงสุดตลอดชีพ</span>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: SHOP (หน้าแรก ตกแต่งใหม่ให้สวยงามพรีเมียม ลบ Avatar Star ออกแล้ว) */}
        {/* ------------------------------------------------------------------ */}
        {tab === 'shop' && !selectedGame && (
          <div className="space-y-8">
            
            {/* Hero Banner ดีไซน์หรูหราทันสมัย */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-amber-500/30 bg-gradient-to-r from-amber-950 via-neutral-900 to-purple-950 shadow-2xl">
              <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl select-none pointer-events-none">🐱</div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold backdrop-blur">
                  <span>⚡</span>
                  <span>ระบบเติมเกมอัตโนมัติ รวดเร็ว ปลอดภัย 100%</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  MEOW TOPUP <br />
                  <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                    สวรรค์ของเกมเมอร์ตัวจริง
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  เลือกเกมโปรดของคุณ เติมตรงเข้าไอดีพร้อมรับส่วนลด VIP ถาวรสูงสุด 12% ทุกคำสั่งซื้อ พร้อมบริการตลอด 24 ชั่วโมง
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-black font-black text-xs shadow-xl shadow-amber-500/30 hover:scale-105 transition"
                  >
                    🪙 เติมเงินเข้า Cat Wallet
                  </button>
                  <button
                    onClick={() => setTab('vip')}
                    className="px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 transition shadow"
                  >
                    👑 เช็คตารางสิทธิ VIP
                  </button>
                </div>
              </div>
            </div>

            {/* ค้นหาและหมวดหมู่เกม */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight">🎮 แคตตาล็อกเกมยอดฮิต</h2>
                  <p className="text-xs text-neutral-400">เลือกเกมที่คุณต้องการเติมเงินได้ทันที</p>
                </div>
                <div className="w-full sm:w-80 relative">
                  <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อเกม..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs border outline-none transition shadow-sm ${
                      isDark 
                        ? 'bg-neutral-900 border-neutral-800 focus:border-amber-500 text-white' 
                        : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              {/* Grid แสดงเกม (ไม่มี Avatar Star) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                {GAME_CATALOG.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.category.toLowerCase().includes(searchQuery.toLowerCase())).map((game) => {
                  const isOutOfStock = gameStock[game.id] === false;

                  return (
                    <div
                      key={game.id}
                      onClick={() => {
                        if (!isOutOfStock) {
                          setSelectedGame(game);
                          setSelectedPackage(game.packages[0]);
                        }
                      }}
                      className={`group rounded-3xl border transition-all overflow-hidden flex flex-col justify-between select-none ${
                        isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl'
                      } ${
                        isDark 
                          ? 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/50' 
                          : 'bg-white border-neutral-200 hover:border-amber-400 shadow-sm'
                      }`}
                    >
                      <div className="p-5 space-y-4">
                        <div className={`h-36 rounded-2xl bg-gradient-to-br ${game.theme} p-4 flex flex-col justify-between text-white relative overflow-hidden shadow-md`}>
                          <div className="absolute -right-6 -bottom-6 opacity-20 text-6xl select-none pointer-events-none">🎮</div>
                          <div className="flex items-center justify-between z-10">
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur border border-white/20">
                              {game.category}
                            </span>
                            {isOutOfStock ? (
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">สต็อกหมด</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white">พร้อมเติม</span>
                            )}
                          </div>
                          <div className="z-10 space-y-0.5">
                            <h3 className="font-black text-lg drop-shadow leading-snug">{game.name}</h3>
                            <p className="text-[11px] text-white/80">⚡ จัดส่งออโต้ใน 1 นาที</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <div className="text-[11px] text-neutral-400">ราคาเริ่มต้น</div>
                            <div className="font-black text-amber-500 text-base">฿{game.packages[0].price}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-neutral-400">แพ็กเกจทั้งหมด</div>
                            <div className="font-bold text-xs">{game.packages.length} ตัวเลือก</div>
                          </div>
                        </div>
                      </div>

                      <div className={`px-5 py-3 border-t text-xs font-black flex items-center justify-between transition ${
                        isDark ? 'bg-neutral-950/60 border-neutral-800 group-hover:text-amber-400' : 'bg-neutral-50 border-neutral-100 group-hover:text-amber-600'
                      }`}>
                        <span>{isOutOfStock ? 'ปิดปรับปรุงชั่วคราว' : 'เลือกแพ็กเกจเติมเงิน'}</span>
                        <span className="transform group-hover:translate-x-1 transition-transform">➔</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* หน้ารายละเอียดสั่งซื้อเกม */}
        {tab === 'shop' && selectedGame && (
          <div className="max-w-3xl mx-auto space-y-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="text-xs font-bold text-neutral-400 hover:text-amber-500 transition flex items-center gap-1"
            >
              ← กลับไปหน้าเลือกเกม
            </button>

            <div className={`p-6 rounded-3xl bg-gradient-to-r ${selectedGame.theme} text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/40 border border-white/20 font-bold">
                  {selectedGame.category}
                </span>
                <h1 className="text-2xl font-black mt-1.5">{selectedGame.name}</h1>
                <p className="text-xs text-white/80">กรอกข้อมูลผู้เล่น เลือกแพ็กเกจ และยืนยันการเติมเงินได้ทันที</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
                <div className="text-[10px] text-amber-300">สิทธิพิเศษ {userRank.name}</div>
                <div className="text-sm font-black text-amber-400">ลดทันที {userRank.discount}%</div>
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-6">
              {/* Step 1: Account info */}
              <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 border-b pb-3 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black">1</span>
                  <span>ข้อมูลบัญชีผู้เล่นเกม</span>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">
                    {selectedGame.idLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`กรอก ${selectedGame.idLabel}`}
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl text-xs border outline-none font-mono ${
                      isDark ? 'bg-neutral-950 border-neutral-700 text-white focus:border-amber-500' : 'bg-slate-50 border-neutral-300 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              {/* Step 2: Package Selection */}
              <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 border-b pb-3 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black">2</span>
                  <span>เลือกแพ็กเกจไอเทม</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedGame.packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const isPkgOutOfStock = packageStock[pkg.id] === false;
                    const finalPkgPrice = calculateFinalPrice(pkg.price);

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => { if (!isPkgOutOfStock) setSelectedPackage(pkg); }}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                          isPkgOutOfStock ? 'opacity-50 cursor-not-allowed bg-neutral-950/40' : ''
                        } ${
                          isSelected 
                            ? 'bg-amber-500/15 border-amber-500 shadow-sm' 
                            : isDark ? 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700' : 'bg-slate-50 border-neutral-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs">{pkg.name}</span>
                          {isPkgOutOfStock && (
                            <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded font-black">หมด</span>
                          )}
                        </div>
                        <div className="mt-4 flex justify-between items-baseline">
                          <span className="text-[11px] text-neutral-400 line-through">฿{pkg.price}</span>
                          <span className="text-sm font-black text-amber-500">฿{finalPkgPrice}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 border-b pb-3 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black">3</span>
                  <span>ช่องทางการชำระเงิน</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPayMethod('wallet')}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      payMethod === 'wallet' 
                        ? 'bg-amber-500/15 border-amber-500' 
                        : isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CoinIcon size={20} />
                      <span className="font-bold text-xs">Cat Coin Wallet</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">ตัดเหรียญทันที สำเร็จอัตโนมัติ 100%</p>
                    <div className="text-[11px] font-bold text-amber-500 mt-2">
                      คงเหลือ: ₵{(user.balance || 0).toLocaleString()}
                    </div>
                  </div>

                  <div
                    onClick={() => setPayMethod('promptpay')}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      payMethod === 'promptpay' 
                        ? 'bg-amber-500/15 border-amber-500' 
                        : isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <span className="font-bold text-xs">PromptPay QR (สลิป)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">สแกนจ่ายผ่านแอปธนาคาร พร้อมสำเร็จทันที</p>
                    <div className="text-[11px] font-bold text-blue-400 mt-2">ฟรีค่าธรรมเนียม</div>
                  </div>
                </div>

                {payMethod === 'promptpay' && selectedPackage && (
                  <div className={`p-4 rounded-2xl border mt-3 text-center space-y-3 ${
                    isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="text-xs font-bold text-amber-500">
                      สแกน QR เพื่อชำระยอด ฿{calculateFinalPrice(selectedPackage.price)}
                    </div>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center border shadow">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=PROMPTPAY-0956267172-AMT-${calculateFinalPrice(selectedPackage.price)}`}
                        alt="PromptPay QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      พร้อมเพย์: <b>095-626-7172 (ธนภูมิ รักษี)</b>
                    </div>
                    <div className="pt-2 text-left space-y-1">
                      <label className="text-xs font-bold block">แนบภาพสลิปโอนเงิน <span className="text-rose-500">*</span></label>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setSlipPreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs w-full"
                      />
                      {slipPreview && (
                        <div className="mt-2 text-center">
                          <img src={slipPreview} alt="Slip" className="h-28 mx-auto rounded-xl border" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {selectedPackage && (
                <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">แพ็กเกจ:</span>
                    <span className="font-bold">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">ส่วนลด VIP ({userRank.name}):</span>
                    <span className="font-bold text-emerald-500">-{userRank.discount}%</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t pt-3">
                    <span className="font-bold text-sm">ยอดชำระสุทธิ:</span>
                    <span className="text-2xl font-black text-amber-500">
                      ฿{calculateFinalPrice(selectedPackage.price)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl font-black text-sm text-black transition shadow-xl ${
                      isSubmitting 
                        ? 'bg-neutral-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:scale-[1.01] shadow-amber-500/25'
                    }`}
                  >
                    {isSubmitting ? 'กำลังดำเนินการเติมเกม...' : '⚡ ยืนยันการสั่งซื้อและเติมเงินทันที'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: HISTORY (เช็คประวัติ ไม่มี Avatar Star และออเดอร์สำเร็จทันที) */}
        {/* ------------------------------------------------------------------ */}
        {tab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-amber-200'
            }`}>
              <div>
                <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  📋 ประวัติคำสั่งซื้อและการเติมเงิน
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  👤 บัญชี: <b>{user.username}</b> | ยอดเติมสะสม: <b className="text-emerald-500">฿{(user.totalSpent || 0).toLocaleString()}</b>
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                ✓ สำเร็จอัตโนมัติทุกรายการ
              </div>
            </div>

            {/* ช่องค้นหาและตัวกรอง (ไม่มี Avatar Star) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {isSuperAdmin && (
                <input
                  type="text"
                  placeholder="🔍 ค้นหาชื่อลูกค้า..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className={`px-4 py-2.5 rounded-2xl text-xs border outline-none ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-300'
                  }`}
                />
              )}
              <input
                type="text"
                placeholder="🔍 ค้นหาเลขออเดอร์ เช่น ORD-..."
                value={historyOrderSearch}
                onChange={(e) => setHistoryOrderSearch(e.target.value)}
                className={`px-4 py-2.5 rounded-2xl text-xs border outline-none ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-300'
                }`}
              />
              <select
                value={historyGameFilter}
                onChange={(e) => setHistoryGameFilter(e.target.value)}
                className={`px-4 py-2.5 rounded-2xl text-xs border outline-none ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-300'
                }`}
              >
                <option value="all">🎮 เลือกดูเกมทั้งหมด</option>
                <option value="Cat Coin Wallet">Cat Coin Wallet</option>
                {GAME_CATALOG.map(g => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className={`p-4 rounded-2xl border flex justify-between items-center text-xs ${
              isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-amber-100/50 border-amber-200'
            }`}>
              <span>พบ <b>{searchedOrders.length}</b> รายการ</span>
              <span>ยอดรวมค้นหา: <b className="text-amber-500 text-sm">฿{totalAmountInSearch.toLocaleString()}</b></span>
            </div>

            {/* รายการประจำวัน (วันนี้) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-500">
                <span>📅</span>
                <span>รายการประจำวัน (วันนี้ {todayStr})</span>
                <span className="text-xs px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-400">
                  {todayOrders.length}
                </span>
              </div>

              {todayOrders.length > 0 ? (
                todayOrders.map((ord) => (
                  <div
                    key={ord.firebaseKey || ord.orderId}
                    className={`p-4 rounded-3xl border transition flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                      isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          {ord.orderId}
                        </span>
                        <span className="text-xs text-neutral-400">• {ord.time}</span>
                      </div>
                      <div className="font-bold text-sm">🎮 {ord.game} ({ord.packageName})</div>
                      <div className="text-xs text-neutral-400 font-mono">
                        UID/ไอดี: <span className="text-white font-bold">{ord.playerId}</span> | ช่องทาง: {ord.paymentMethod}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-amber-500">฿{ord.price}</div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1 bg-emerald-500/20 text-emerald-400">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-3xl text-neutral-400 text-xs">
                  ไม่มีรายการคำสั่งซื้อใหม่ในวันนี้
                </div>
              )}
            </div>

            {/* ประวัติย้อนหลัง (พับได้) */}
            {pastOrders.length > 0 && (
              <div className={`rounded-3xl border overflow-hidden transition ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                <div
                  onClick={() => setIsPastOrdersOpen(!isPastOrdersOpen)}
                  className={`p-4 flex justify-between items-center cursor-pointer select-none font-bold text-xs ${
                    isDark ? 'bg-neutral-950/60' : 'bg-amber-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>📂</span>
                    <span>ประวัติย้อนหลัง ({pastOrders.length} รายการ)</span>
                  </span>
                  <span className="text-amber-500">{isPastOrdersOpen ? '▲ พับเก็บ' : '▼ เปิดดู'}</span>
                </div>

                {isPastOrdersOpen && (
                  <div className="p-4 divide-y divide-neutral-800 space-y-3">
                    {pastOrders.map((ord) => (
                      <div key={ord.firebaseKey || ord.orderId} className="pt-3 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold">{ord.orderId} - {ord.game} ({ord.packageName})</div>
                          <div className="text-neutral-400 text-[11px]">{ord.time} | UID: {ord.playerId}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-amber-500">฿{ord.price}</div>
                          <div className="text-[10px] text-emerald-400">{ord.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: ADMIN DASHBOARD (ระบบหลังบ้าน พับได้ทุกส่วน) */}
        {/* ------------------------------------------------------------------ */}
        {tab === 'admin' && isSuperAdmin && (
          <div className="max-w-5xl mx-auto space-y-6">
            {!isAdminAuthenticated ? (
              <div className={`max-w-sm mx-auto p-8 rounded-3xl border text-center space-y-4 shadow-2xl ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                <div className="text-4xl">🔐</div>
                <h2 className="text-lg font-black">ยืนยันสิทธิ์แอดมิน</h2>
                <p className="text-xs text-neutral-400">กรุณาใส่รหัส PIN 6 หลักเพื่อเข้าถึงระบบหลังบ้าน</p>

                <form onSubmit={handleAdminVerifyPin} className="space-y-3">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="PIN 6 หลัก"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl font-mono tracking-widest px-3 py-2.5 rounded-2xl border bg-neutral-950 border-neutral-700 text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                  >
                    ยืนยันตัวตนแอดมิน
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-purple-400 flex items-center gap-2">
                      ⚙️ ระบบจัดการหลังบ้าน (Admin Control Panel)
                    </h1>
                    <p className="text-xs text-neutral-400">
                      แผงควบคุมออเดอร์ (สำเร็จออโต้) สต็อก สมาชิก สถิติ และภาษี
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      localStorage.removeItem('cyber_admin_auth');
                    }}
                    className="text-xs px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                  >
                    🔒 ล็อกหน้าจอหลังบ้าน
                  </button>
                </div>

                {/* 1. ออเดอร์ลูกค้า */}
                <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                  <div
                    onClick={() => toggleAdminFold('orders')}
                    className="p-4 bg-purple-950/20 border-b border-neutral-800 flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <span>📦</span>
                      <span>1. รายการสั่งซื้อทั้งหมด (สำเร็จอัตโนมัติ)</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        {orders.length} รายการ
                      </span>
                    </div>
                    <span className="text-purple-400 font-bold text-xs">{adminFolds.orders ? '▲ พับเก็บ' : '▼ ขยาย'}</span>
                  </div>

                  {adminFolds.orders && (
                    <div className="p-4 space-y-3">
                      {orders.length === 0 ? (
                        <div className="text-center py-6 text-neutral-400 text-xs">ไม่มีรายการสั่งซื้อในระบบ</div>
                      ) : (
                        orders.slice(0, 15).map((o) => (
                          <div
                            key={o.firebaseKey}
                            className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                            }`}
                          >
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-500">{o.orderId}</span>
                                <span className="text-neutral-400">({o.time})</span>
                                <span className="font-bold text-purple-400">ลูกค้า: {o.player}</span>
                              </div>
                              <div className="font-bold text-sm">{o.game} - {o.packageName}</div>
                              <div className="text-neutral-400 font-mono">
                                UID: <span className="text-white font-bold">{o.playerId}</span> | ยอด: ฿{o.price}
                              </div>
                              <div className="text-[11px] text-emerald-400 font-bold">สถานะ: {o.status}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteOrder(o)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition"
                              >
                                🗑️ ลบออเดอร์
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* 2. สต็อกเกม */}
                <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                  <div
                    onClick={() => toggleAdminFold('stock')}
                    className="p-4 bg-purple-950/20 border-b border-neutral-800 flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <span>🎮</span>
                      <span>2. จัดการสต็อกเกม & แพ็กเกจย่อย</span>
                    </div>
                    <span className="text-purple-400 font-bold text-xs">{adminFolds.stock ? '▲ พับเก็บ' : '▼ ขยาย'}</span>
                  </div>

                  {adminFolds.stock && (
                    <div className="p-4 space-y-4">
                      <div>
                        <div className="text-xs font-bold text-neutral-400 mb-2">สถานะเปิด/ปิดรายเกม</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {GAME_CATALOG.map((g) => {
                            const isOpen = gameStock[g.id] ?? true;
                            return (
                              <button
                                key={g.id}
                                onClick={() => handleToggleGameStock(g.id)}
                                className={`p-3 rounded-2xl border text-xs font-bold text-left flex justify-between items-center transition ${
                                  isOpen ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'
                                }`}
                              >
                                <span className="truncate">{g.name}</span>
                                <span>{isOpen ? 'เปิด' : 'ปิด'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. สมาชิก */}
                <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                  <div
                    onClick={() => toggleAdminFold('members')}
                    className="p-4 bg-purple-950/20 border-b border-neutral-800 flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <span>👥</span>
                      <span>3. จัดการสมาชิก & ปรับยอดเหรียญ Wallet</span>
                    </div>
                    <span className="text-purple-400 font-bold text-xs">{adminFolds.members ? '▲ พับเก็บ' : '▼ ขยาย'}</span>
                  </div>

                  {adminFolds.members && (
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-neutral-800 text-neutral-400">
                          <tr>
                            <th className="p-2">ชื่อผู้ใช้</th>
                            <th className="p-2">อีเมล</th>
                            <th className="p-2">Cat Coin</th>
                            <th className="p-2">ยอดสะสม VIP</th>
                            <th className="p-2">ปรับยอดเหรียญ</th>
                            <th className="p-2 text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {registeredUsers.map((u) => (
                            <tr key={u.firebaseKey}>
                              <td className="p-2 font-bold">{u.username}</td>
                              <td className="p-2 text-neutral-400">{u.email}</td>
                              <td className="p-2 font-mono text-amber-500 font-bold">₵{(u.balance || 0).toLocaleString()}</td>
                              <td className="p-2 text-emerald-400 font-bold">฿{(u.totalSpent || 0).toLocaleString()}</td>
                              <td className="p-2 flex items-center gap-1">
                                <button onClick={() => handleAdjustBalance(u, 50)} className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">+50</button>
                                <button onClick={() => handleAdjustBalance(u, 100)} className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">+100</button>
                                <button onClick={() => handleAdjustBalance(u, -50)} className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold">-50</button>
                              </td>
                              <td className="p-2 text-center">
                                <button onClick={() => handleDeleteUser(u)} className="text-rose-500 hover:text-rose-400">🗑️</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. สถิติ */}
                <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                  <div
                    onClick={() => toggleAdminFold('stats')}
                    className="p-4 bg-purple-950/20 border-b border-neutral-800 flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <span>📊</span>
                      <span>4. สถิติรายได้ กำไรสุทธิ และภาษี VAT (7%)</span>
                    </div>
                    <span className="text-purple-400 font-bold text-xs">{adminFolds.stats ? '▲ พับเก็บ' : '▼ ขยาย'}</span>
                  </div>

                  {adminFolds.stats && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                          <div className="text-[11px] text-neutral-400">ยอดขายรวม</div>
                          <div className="text-lg font-black text-amber-500">฿{totalSales.toLocaleString()}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                          <div className="text-[11px] text-neutral-400">กำไรสุทธิ</div>
                          <div className="text-lg font-black text-emerald-400">฿{netProfit.toLocaleString()}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                          <div className="text-[11px] text-neutral-400">ค่าโฆษณา</div>
                          <div className="text-lg font-black text-rose-400">฿{totalAdSpend.toLocaleString()}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                          <div className="text-[11px] text-neutral-400">ภาษี VAT (7%)</div>
                          <div className="text-lg font-black text-blue-400">฿{estimatedVat.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. ตั้งค่า PIN */}
                <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
                  <div
                    onClick={() => toggleAdminFold('settings')}
                    className="p-4 bg-purple-950/20 border-b border-neutral-800 flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                      <span>🔒</span>
                      <span>5. ตั้งค่ารหัส PIN แอดมินใหม่</span>
                    </div>
                    <span className="text-purple-400 font-bold text-xs">{adminFolds.settings ? '▲ พับเก็บ' : '▼ ขยาย'}</span>
                  </div>

                  {adminFolds.settings && (
                    <div className="p-4 max-w-sm">
                      <form onSubmit={handleSavePin} className="space-y-3">
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="รหัส PIN ใหม่ 6 หลัก"
                          value={newPinSetting}
                          onChange={(e) => setNewPinSetting(e.target.value)}
                          className="w-full px-3 py-2 rounded-2xl text-xs border bg-neutral-950 border-neutral-700 text-white outline-none"
                        />
                        <button type="submit" className="w-full py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs">
                          บันทึก PIN ใหม่
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: VIP TIERS TABLE */}
        {/* ------------------------------------------------------------------ */}
        {tab === 'vip' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b pb-4">
              <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                👑 ระดับสมาชิก VIP และส่วนลดตลอดชีพ
              </h1>
              <p className="text-xs text-neutral-400">ยิ่งสะสมยอดเติมเงิน ยิ่งได้รับส่วนลดถาวรสูงขึ้น</p>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 to-purple-950/60 border border-amber-500/40 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{userRank.badge}</span>
                <div>
                  <h2 className="text-lg font-black text-white">{userRank.name}</h2>
                  <p className="text-xs text-amber-400 font-bold">ระดับที่ {userRank.level} • ส่วนลด {userRank.discount}%</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-400">ยอดสะสมตลอดชีพ</div>
                <div className="text-xl font-black text-amber-400">฿{(user.totalSpent || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b ${isDark ? 'bg-neutral-950 text-neutral-400 border-neutral-800' : 'bg-neutral-100 text-neutral-600'}`}>
                  <tr>
                    <th className="p-3.5">ระดับ</th>
                    <th className="p-3.5">ชื่อแรงค์</th>
                    <th className="p-3.5">ยอดสะสมขั้นต่ำ</th>
                    <th className="p-3.5">ส่วนลดถาวร</th>
                    <th className="p-3.5 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {VIP_TIERS.map((tier) => {
                    const isCurrent = userRank.level === tier.level;
                    const isUnlocked = (user?.totalSpent || 0) >= tier.minSpend;

                    return (
                      <tr key={tier.level} className={isCurrent ? 'bg-amber-500/10 font-bold' : ''}>
                        <td className="p-3.5 font-mono">Lv.{tier.level}</td>
                        <td className="p-3.5">
                          <span className="mr-1.5">{tier.badge}</span>
                          <span style={{ color: tier.color }}>{tier.name}</span>
                        </td>
                        <td className="p-3.5">฿{tier.minSpend.toLocaleString()}</td>
                        <td className="p-3.5 text-emerald-400 font-black">{tier.discount}%</td>
                        <td className="p-3.5 text-center">
                          {isCurrent ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-black">
                              ปัจจุบัน
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-emerald-400 font-bold">✓ ปลดล็อกแล้ว</span>
                          ) : (
                            <span className="text-neutral-500">🔒 ล็อก</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: เติมเหรียญ CAT COIN WALLET */}
      {/* -------------------------------------------------------------------- */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <CoinIcon size={24} />
                <span className="font-black text-sm">เติมเงิน Cat Coin Wallet</span>
              </div>
              <button
                onClick={() => { setShowWalletModal(false); setWalletMsg({ text: '', type: '' }); }}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {walletMsg.text && (
              <div className={`p-2.5 rounded-xl border text-xs font-bold ${
                walletMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {walletMsg.text}
              </div>
            )}

            <form onSubmit={handleWalletTopup} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">เลือกจำนวนเงินที่ต้องการเติม (บาท)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 300, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWalletAmount(amt.toString())}
                      className={`py-2 text-xs font-bold rounded-2xl border transition ${
                        walletAmount === amt.toString()
                          ? 'bg-amber-500 text-black border-amber-500'
                          : isDark ? 'bg-neutral-950 border-neutral-700 text-neutral-300' : 'bg-slate-100 border-neutral-300'
                      }`}
                    >
                      ฿{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10"
                  required
                  placeholder="หรือระบุจำนวนเงินเอง"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className={`w-full mt-2 px-3.5 py-2.5 rounded-2xl text-xs border outline-none ${
                    isDark ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-slate-50 border-neutral-300'
                  }`}
                />
              </div>

              {walletAmount && Number(walletAmount) >= 10 && (
                <div className={`p-3 rounded-2xl border text-center space-y-2 ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="text-xs font-bold text-amber-500">สแกน QR PromptPay เพื่อโอนเงิน ฿{walletAmount}</div>
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border flex items-center justify-center shadow">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=PROMPTPAY-0956267172-AMT-${walletAmount}`}
                      alt="PromptPay"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    พร้อมเพย์: <b>095-626-7172 (ธนภูมิ รักษี)</b>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold block mb-1">แนบภาพสลิปโอนเงิน</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setWalletSlipPreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs w-full"
                />
                {walletSlipPreview && (
                  <div className="mt-2 text-center">
                    <img src={walletSlipPreview} alt="Slip" className="h-24 mx-auto rounded-xl border" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isCheckingSlip || !walletAmount || !walletSlipPreview}
                className={`w-full py-3 rounded-2xl font-bold text-xs text-black transition ${
                  isCheckingSlip || !walletAmount || !walletSlipPreview
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
              >
                {isCheckingSlip ? 'กำลังตรวจสอบสลิป...' : '✓ ยืนยันการเติมเหรียญ (สำเร็จอัตโนมัติ)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`border-t py-6 text-center text-xs mt-12 transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-900 text-neutral-500' : 'bg-slate-100 border-neutral-200 text-neutral-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CatLogo size={24} />
            <span className="font-black text-amber-500">MEOW TOPUP</span>
            <span>— ระบบเติมเกมอัตโนมัติ Realtime Database 24 ชั่วโมง</span>
          </div>
          <div className="text-[11px] text-neutral-500">
            Connected to Firebase Realtime Database
          </div>
        </div>
      </footer>

    </div>
  );
}
