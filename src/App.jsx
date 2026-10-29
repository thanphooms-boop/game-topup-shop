import React, { useState, useEffect } from 'react';

export default function GameTopupApp() {
  // ฐานข้อมูลผู้ใช้ที่สมัครจริงในเครื่อง (บันทึกจำรหัสผ่าน)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('cyber_topup_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { username: 'thanphooms@gmail.com', email: 'thanphooms@gmail.com', password: '0638801739Ss_@1', balance: 99999 },
      { username: '11', email: 'user11@example.com', password: '11', balance: 1800 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cyber_topup_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Authentication State
  const [user, setUser] = useState(null); // เริ่มต้นยังไม่ Login จนกว่าจะกรอกรหัสผ่านที่สมัครไว้จริง
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // App Navigation & Shop State
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Topup Wallet State & Background 10s Countdown State
  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState('qrcode');
  const [walletPhone, setWalletPhone] = useState('');
  const [walletStep, setWalletStep] = useState(1);
  const [walletTimeLeft, setWalletTimeLeft] = useState(180);
  const [isWalletQrExpired, setIsWalletQrExpired] = useState(false);

  // Background Wallet Auto-Topup State (10 Seconds)
  const [isWalletAutoRunning, setIsWalletAutoRunning] = useState(false);
  const [walletAutoSeconds, setWalletAutoSeconds] = useState(10);
  const [pendingWalletAmount, setPendingWalletAmount] = useState(0);
  const [pendingWalletOrderId, setPendingWalletOrderId] = useState('');
  const [showWalletSuccessPopup, setShowWalletSuccessPopup] = useState(false);
  const [lastAddedAmount, setLastAddedAmount] = useState(0);

  // Payment Input States for Checkout
  const [trueWalletNumber, setTrueWalletNumber] = useState('');
  const [trueCashCardPin, setTrueCashCardPin] = useState('');

  // Order Tracking State & Date Filter (โหลดข้อมูลเก่าเก็บไว้ใน localStorage ไม่ให้หายตอนรีเฟรช)
  const [trackQuery, setTrackQuery] = useState('');
  const [trackDateFilter, setTrackDateFilter] = useState('');
  const [trackResultList, setTrackResultList] = useState(null);

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('cyber_topup_orders');
    if (savedOrders) {
      try {
        return JSON.parse(savedOrders);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'ORD-14914', game: 'Free Fire', package: '1,166 Diamonds', price: 350, player: '11', status: 'รอตรวจสอบ [สะดุดใน 10s]', type: 'game', time: '29/10/69 22:44 น.', dateKey: '2029-10-29', timestamp: Date.now() - 100000 },
      { id: 'ORD-48751', game: 'Free Fire', package: '1,166 Diamonds', price: 350, player: '11', status: 'สำเร็จ (เพิ่มออโต้)', type: 'game', time: '29/10/69 22:44 น.', dateKey: '2029-10-29', timestamp: Date.now() - 200000 },
      { id: 'ORD-23664', game: 'VALORANT', package: '4,050 VP', price: 2790, player: '11', status: 'สำเร็จ', type: 'game', time: '29/10/69 13:54 น.', dateKey: '2029-10-29', timestamp: Date.now() - 500000 }
    ];
  });

  // บันทึกออร์เดอร์ลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('cyber_topup_orders', JSON.stringify(orders));
  }, [orders]);

  // Admin State & Dynamic PIN System
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPin, setAdminPin] = useState('123456');
  const [inputAdminPin, setInputAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Change Admin PIN Form States
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [changePinMsg, setChangePinMsg] = useState({ type: '', text: '' });

  // Checkout Modal State & Multi-Step Flow
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutPassword, setCheckoutPassword] = useState('');
  const [showCheckoutPassword, setShowCheckoutPassword] = useState(false);
  const [checkoutPasswordError, setCheckoutPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  
  // Timer State for Checkout QR Code (180 seconds = 3 minutes)
  const [timeLeft, setTimeLeft] = useState(180);
  const [isQrExpired, setIsQrExpired] = useState(false);

  // Background Game Checkout Auto-Topup State (10 Seconds)
  const [isGameAutoRunning, setIsGameAutoRunning] = useState(false);
  const [gameAutoSeconds, setGameAutoSeconds] = useState(10);
  const [pendingGameOrderId, setPendingGameOrderId] = useState('');
  const [showGameSuccessPopup, setShowGameSuccessPopup] = useState(false);
  const [lastGameName, setLastGameName] = useState('');

  // Card Info State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [gamesData] = useState([
    {
      id: 'valorant',
      name: 'VALORANT',
      publisher: 'Riot Games',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      category: 'pc',
      badge: 'ยอดฮิตอันดับ 1',
      packages: [
        { id: 'v1', name: '125 VP', price: 99, bonus: '+0 VP' },
        { id: 'v2', name: '420 VP', price: 319, bonus: '+15 VP' },
        { id: 'v3', name: '700 VP', price: 529, bonus: '+30 VP' },
        { id: 'v4', name: '1,375 VP', price: 999, bonus: '+80 VP' },
        { id: 'v5', name: '2,400 VP', price: 1699, bonus: '+150 VP' },
        { id: 'v6', name: '4,050 VP', price: 2790, bonus: '+300 VP' },
      ]
    },
    {
      id: 'pubg',
      name: 'PUBG Mobile',
      publisher: 'Level Infinite',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80',
      category: 'mobile',
      badge: 'ยอดฮิต',
      packages: [
        { id: 'p1', name: '60 UC', price: 29, bonus: '+0 UC' },
        { id: 'p2', name: '325 UC', price: 149, bonus: '+15 UC' },
        { id: 'p3', name: '660 UC', price: 299, bonus: '+50 UC' },
        { id: 'p4', name: '1,800 UC', price: 799, bonus: '+180 UC' },
        { id: 'p5', name: '3,850 UC', price: 1590, bonus: '+450 UC' },
        { id: 'p6', name: '8,100 UC', price: 3190, bonus: '+1,050 UC' },
      ]
    },
    {
      id: 'rov',
      name: 'ROV (Arena of Valor)',
      publisher: 'Garena',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80',
      category: 'mobile',
      badge: 'ยอดฮิต',
      packages: [
        { id: 'r1', name: '40 Coupons', price: 35, bonus: '+2 Coupons' },
        { id: 'r2', name: '90 Coupons', price: 75, bonus: '+5 Coupons' },
        { id: 'r3', name: '220 Coupons', price: 175, bonus: '+15 Coupons' },
        { id: 'r4', name: '470 Coupons', price: 350, bonus: '+35 Coupons' },
        { id: 'r5', name: '1,150 Coupons', price: 850, bonus: '+100 Coupons' },
        { id: 'r6', name: '2,330 Coupons', price: 1700, bonus: '+250 Coupons' },
      ]
    },
    {
      id: 'avatar-star',
      name: 'Avatar Star (กำลังจะเปิดในไทย)',
      publisher: 'Classic Revival',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80',
      category: 'pc',
      badge: '🔥 Coming Soon',
      packages: [
        { id: 'as1', name: '100 StarCash', price: 90, bonus: 'Pre-order Bonus' },
        { id: 'as2', name: '300 StarCash', price: 270, bonus: 'Pre-order Bonus' },
        { id: 'as3', name: '500 StarCash', price: 450, bonus: 'Closed Beta Pack' },
        { id: 'as4', name: '1,000 StarCash', price: 890, bonus: 'VIP Wings + Bonus' },
        { id: 'as5', name: '2,500 StarCash', price: 2150, bonus: 'Exclusive Costume' },
        { id: 'as6', name: '5,000 StarCash', price: 4200, bonus: 'Founder Edition Set' },
      ]
    },
    {
      id: 'freefire',
      name: 'Free Fire',
      publisher: 'Garena',
      image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=500&q=80',
      category: 'mobile',
      badge: 'ยอดฮิต',
      packages: [
        { id: 'ff1', name: '110 Diamonds', price: 35, bonus: '+5' },
        { id: 'ff2', name: '341 Diamonds', price: 105, bonus: '+20' },
        { id: 'ff3', name: '572 Diamonds', price: 175, bonus: '+40' },
        { id: 'ff4', name: '1,166 Diamonds', price: 350, bonus: '+100' },
      ]
    },
    {
      id: 'genshin',
      name: 'Genshin Impact',
      publisher: 'HoYoverse',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
      category: 'pc',
      badge: 'แนะนำ',
      packages: [
        { id: 'g1', name: '60 Genesis Crystals', price: 35, bonus: '+0' },
        { id: 'g2', name: '300 Genesis Crystals', price: 179, bonus: '+10' },
        { id: 'g3', name: '980 Genesis Crystals', price: 579, bonus: '+40' },
        { id: 'g4', name: '1,980 Genesis Crystals', price: 1150, bonus: '+100' },
        { id: 'g5', name: '3,280 Genesis Crystals', price: 1900, bonus: '+200' },
      ]
    },
    {
      id: 'mlbb',
      name: 'Mobile Legends: Bang Bang',
      publisher: 'Moonton',
      image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80',
      category: 'mobile',
      badge: 'ยอดฮิต',
      packages: [
        { id: 'm1', name: '84 Diamonds', price: 35, bonus: '+4' },
        { id: 'm2', name: '296 Diamonds', price: 125, bonus: '+20' },
        { id: 'm3', name: '625 Diamonds', price: 275, bonus: '+50' },
        { id: 'm4', name: '1,059 Diamonds', price: 475, bonus: '+90' },
      ]
    },
    {
      id: 'hsr',
      name: 'Honkai: Star Rail',
      publisher: 'HoYoverse',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80',
      category: 'pc',
      badge: 'แนะนำ',
      packages: [
        { id: 'h1', name: '60 Oneiric Shards', price: 35, bonus: '+0' },
        { id: 'h2', name: '300 Oneiric Shards', price: 179, bonus: '+15' },
        { id: 'h3', name: '980 Oneiric Shards', price: 579, bonus: '+50' },
        { id: 'h4', name: '1,980 Oneiric Shards', price: 1150, bonus: '+120' },
      ]
    },
    {
      id: 'wildrift',
      name: 'League of Legends: Wild Rift',
      publisher: 'Riot Games',
      image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=500&q=80',
      category: 'mobile',
      badge: 'มาใหม่',
      packages: [
        { id: 'w1', name: '450 Cores', price: 150, bonus: '+20' },
        { id: 'w2', name: '1,000 Cores', price: 325, bonus: '+60' },
        { id: 'w3', name: '2,050 Cores', price: 650, bonus: '+150' },
        { id: 'w4', name: '3,850 Cores', price: 1150, bonus: '+300' },
      ]
    }
  ]);

  const paymentMethods = [
    { id: 'wallet', name: 'Cyber Wallet (เครดิตร้าน)', desc: 'หักจากยอดเงินในบัญชีของคุณ ชำระได้ทันที' },
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'โอนผ่านเบอร์วอลเล็ต' },
    { id: 'truemoney', name: 'บัตรเงินสดทรูมันนี่', desc: 'เติมด้วยรหัสบัตร 14 หลัก (หัก 14.5%)' },
    { id: 'card', name: 'บัตรเครดิต / เดบิต', desc: 'VISA / Mastercard' }
  ];

  // Countdown Timer Effect for Checkout QR Code (3 Mins)
  useEffect(() => {
    let timer;
    if (showCheckoutModal && checkoutStep === 2 && selectedPayment?.id === 'qrcode' && !isQrExpired) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showCheckoutModal, checkoutStep, selectedPayment, isQrExpired]);

  // Countdown Timer Effect for Wallet QR Code (3 Mins)
  useEffect(() => {
    let timer;
    if (showTopupWalletModal && walletStep === 2 && walletPaymentMethod === 'qrcode' && !isWalletQrExpired) {
      timer = setInterval(() => {
        setWalletTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsWalletQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showTopupWalletModal, walletStep, walletPaymentMethod, isWalletQrExpired]);

  // BACKGROUND WALLET AUTO-TOPUP TIMER (10 SECONDS)
  useEffect(() => {
    let bgWalletTimer;
    if (isWalletAutoRunning) {
      bgWalletTimer = setInterval(() => {
        setWalletAutoSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(bgWalletTimer);
            const amt = pendingWalletAmount;
            
            setUser((prevUser) => ({
              ...prevUser,
              balance: prevUser.balance + amt
            }));

            const ordId = pendingWalletOrderId;
            setOrders((prevOrders) =>
              prevOrders.map((ord) =>
                ord.id === ordId ? { ...ord, status: '✅ สำเร็จ' } : ord
              )
            );

            setIsWalletAutoRunning(false);
            setLastAddedAmount(amt);
            setShowWalletSuccessPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(bgWalletTimer);
  }, [isWalletAutoRunning, pendingWalletAmount, pendingWalletOrderId]);

  // BACKGROUND GAME CHECKOUT AUTO-TOPUP TIMER (10 SECONDS)
  useEffect(() => {
    let bgGameTimer;
    if (isGameAutoRunning) {
      bgGameTimer = setInterval(() => {
        setGameAutoSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(bgGameTimer);
            const ordId = pendingGameOrderId;
            setOrders((prevOrders) =>
              prevOrders.map((ord) =>
                ord.id === ordId ? { ...ord, status: '✅ สำเร็จ' } : ord
              )
            );
            setIsGameAutoRunning(false);
            setOrderSuccess(ordId);
            setShowGameSuccessPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(bgGameTimer);
  }, [isGameAutoRunning, pendingGameOrderId]);

  // Auto-Cancel Pending Orders after 30 Minutes
  useEffect(() => {
    const cancelInterval = setInterval(() => {
      const now = Date.now();
      const thirtyMins = 30 * 60 * 1000;

      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (
            (ord.status === 'รอตรวจสอบ' || ord.status.includes('รอตรวจสอบ')) &&
            ord.timestamp &&
            now - ord.timestamp > thirtyMins
          ) {
            return { ...ord, status: '❌ ยกเลิกอัตโนมัติ (หมดเวลา 30 นาที)' };
          }
          return ord;
        })
      );
    }, 10000);

    return () => clearInterval(cancelInterval);
  }, []);

  // Auth Handlers (ตรวจสอบรหัสผ่านจริงจากที่สมัครไว้)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
      }
      
      // ตรวจสอบกับฐานข้อมูลผู้ใช้ที่สมัครจริง
      const foundUser = registeredUsers.find(
        (u) => u.username === usernameInput && u.password === passwordInput
      );

      if (foundUser) {
        setUser(foundUser);
      } else {
        setAuthError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้สมัครสมาชิก');
      }
    } else if (authMode === 'register') {
      if (!emailInput.trim() || !usernameInput.trim() || !passwordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      if (!emailInput.includes('@')) {
        setAuthError('รูปแบบ Email ไม่ถูกต้อง');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }

      // เช็คว่า Username ซ้ำไหม
      const isExist = registeredUsers.some((u) => u.username === usernameInput);
      if (isExist) {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น');
        return;
      }

      const newUser = {
        username: usernameInput,
        email: emailInput,
        password: passwordInput,
        balance: 1800
      };

      setRegisteredUsers([...registeredUsers, newUser]);
      setUser(newUser);
    } else if (authMode === 'forgot') {
      if (forgotStep === 1) {
        if (!usernameInput.trim() || !emailInput.trim() || !emailInput.includes('@')) {
          setAuthError('กรุณากรอกชื่อผู้ใช้งานและ Email ให้ถูกต้อง');
          return;
        }
        setForgotStep(2);
        setAuthSuccessMsg(`ส่งรหัสยืนยัน OTP ไปยัง ${emailInput} แล้ว`);
      } else if (forgotStep === 2) {
        if (!otpInput.trim() || otpInput.length < 6) {
          setAuthError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
          return;
        }
        setForgotStep(3);
        setAuthError('');
        setAuthSuccessMsg('ยืนยันตัวตนสำเร็จ! กรุณาตั้งรหัสผ่านใหม่');
      } else if (forgotStep === 3) {
        if (!newPasswordInput.trim()) {
          setAuthError('กรุณากรอกรหัสผ่านใหม่');
          return;
        }
        // อัปเดตรหัสผ่านใหม่ในฐานข้อมูลผู้ใช้
        setRegisteredUsers(registeredUsers.map(u => u.username === usernameInput ? { ...u, password: newPasswordInput } : u));
        setAuthSuccessMsg('เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังกลับไปหน้าเข้าสู่ระบบ...');
        setTimeout(() => {
          setAuthMode('login');
          setForgotStep(1);
          setOtpInput('');
          setNewPasswordInput('');
          setPasswordInput('');
          setAuthSuccessMsg('');
        }, 1500);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsernameInput('');
    setPasswordInput('');
    setShowLoginPassword(false);
    setConfirmPasswordInput('');
    setEmailInput('');
    setIsAdminLoggedIn(false);
    setActiveTab('shop');
  };

  // Admin PIN Handlers
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminPinError('');
    if (inputAdminPin === adminPin) {
      setIsAdminLoggedIn(true);
      setInputAdminPin('');
    } else {
      setAdminPinError('รหัส PIN ไม่ถูกต้อง');
    }
  };

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    setChangePinMsg({ type: '', text: '' });

    if (oldPinInput !== adminPin) {
      setChangePinMsg({ type: 'error', text: 'รหัส PIN เดิมไม่ถูกต้อง' });
      return;
    }
    if (newPinInput.length !== 6) {
      setChangePinMsg({ type: 'error', text: 'รหัส PIN ใหม่ต้องเป็นตัวเลข 6 หลัก' });
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      setChangePinMsg({ type: 'error', text: 'รหัส PIN ใหม่ และการยืนยันรหัส ไม่ตรงกัน' });
      return;
    }

    setAdminPin(newPinInput);
    setChangePinMsg({ type: 'success', text: 'เปลี่ยนรหัส PIN 6 หลักสำเร็จแล้ว!' });
    setTimeout(() => {
      setShowChangePinModal(false);
      setOldPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setChangePinMsg({ type: '', text: '' });
    }, 1500);
  };

  // Wallet Topup Flow Handlers
  const handleWalletNextStep = () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }
    if (walletPaymentMethod === 'true' && (!walletPhone || walletPhone.length < 10)) {
      alert('กรุณากรอกเบอร์โทรศัพท์ TrueMoney Wallet ให้ครบ 10 หลัก');
      return;
    }
    setWalletTimeLeft(180);
    setIsWalletQrExpired(false);
    
    if (walletPaymentMethod === 'qrcode') {
      setWalletStep(2);
    } else {
      handleWalletConfirmPayment();
    }
  };

  const handleWalletConfirmPayment = () => {
    const amt = parseFloat(topupAmount) || 0;
    const newOrderId = 'ORD-W-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const thaiTime = now.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const dateKey = now.toISOString().split('T')[0];

    const newWalletOrder = {
      id: newOrderId,
      game: 'เติมเครดิตร้าน (Wallet)',
      package: `+฿${amt.toLocaleString()}`,
      price: amt,
      player: user ? user.username : '11',
      status: 'รอตรวจสอบ [สะดุดใน 10s]',
      type: 'wallet',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    setOrders((prev) => [newWalletOrder, ...prev]);
    setPendingWalletAmount(amt);
    setPendingWalletOrderId(newOrderId);
    setWalletAutoSeconds(10);
    setIsWalletAutoRunning(true);
    setShowTopupWalletModal(false);
    setWalletStep(1);
    setTopupAmount('');
    setWalletPhone('');
  };

  const resetWalletModal = () => {
    setShowTopupWalletModal(false);
    setWalletStep(1);
    setTopupAmount('');
    setWalletPhone('');
    setWalletTimeLeft(180);
    setIsWalletQrExpired(false);
  };

  const handleVerifyPasswordStep = (e) => {
    e.preventDefault();
    setCheckoutPasswordError('');

    if (checkoutPassword !== user.password) {
      setCheckoutPasswordError('รหัสผ่านบัญชีไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    if (selectedPayment.id === 'wallet' && user.balance < selectedPackage.price) {
      setCheckoutPasswordError('ยอดเงินใน Cyber Wallet ของคุณไม่พอ กรุณาเติมเงินเข้าระบบก่อนครับ');
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

  const handleFinalPaymentSubmit = () => {
    if (selectedPayment.id === 'wallet') {
      setUser((prev) => ({ ...prev, balance: prev.balance - selectedPackage.price }));
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const thaiTime =
        now.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) +
        ' ' +
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) +
        ' น.';
      const dateKey = now.toISOString().split('T')[0];

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: selectedPackage.name,
        price: selectedPackage.price,
        player: user.username, // ผูกออร์เดอร์กับ Username ของผู้ใช้ที่เข้าสู่ระบบ
        status: 'รอตรวจสอบ [สะดุดใน 10s]',
        type: 'game',
        time: thaiTime,
        dateKey: dateKey,
        timestamp: Date.now(),
      };

      setOrders([newOrder, ...orders]);
      setIsProcessing(false);
      setPendingGameOrderId(newOrderId);
      setLastGameName(selectedGame.name);
      setGameAutoSeconds(10);
      setIsGameAutoRunning(true);
      setShowCheckoutModal(false);
      
      setCheckoutStep(1);
      setCheckoutPassword('');
      setShowCheckoutPassword(false);
      setCardNumber('');
      setCardExp('');
      setCardCvv('');
      setTrueWalletNumber('');
      setTrueCashCardPin('');
    }, 1000);
  };

  // Admin Manual Order Approval
  const handleAdminApproveOrder = (orderId) => {
    if (isWalletAutoRunning && pendingWalletOrderId === orderId) {
      setIsWalletAutoRunning(false);
    }
    if (isGameAutoRunning && pendingGameOrderId === orderId) {
      setIsGameAutoRunning(false);
    }

    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          if (ord.type === 'wallet' && !ord.status.includes('สำเร็จ')) {
            setUser((prevUser) => ({
              ...prevUser,
              balance: prevUser.balance + ord.price
            }));
          }
          return { ...ord, status: '✅ สำเร็จ (แอดมินอนุมัติแล้ว)' };
        }
        return ord;
      })
    );
  };

  const handleAdminRejectOrder = (orderId) => {
    if (isWalletAutoRunning && pendingWalletOrderId === orderId) {
      setIsWalletAutoRunning(false);
    }
    if (isGameAutoRunning && pendingGameOrderId === orderId) {
      setIsGameAutoRunning(false);
    }

    setOrders((prevOrders) =>
      prevOrders.map((ord) => (ord.id === orderId ? { ...ord, status: '❌ ยกเลิก (ไม่พบยอดโอนเงิน)' } : ord))
    );
  };

  const resetCheckoutModal = () => {
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setCheckoutPassword('');
    setShowCheckoutPassword(false);
    setCheckoutPasswordError('');
    setTimeLeft(180);
    setIsQrExpired(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredGames = gamesData.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(
    (ord) =>
      ord.player.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      ord.id.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  // Check if current user is Admin
  const isUserAdmin = user && (user.username === 'thanphooms@gmail.com' || user.email === 'thanphooms@gmail.com');

  if (!user) {
    return (
      <div style={{
        backgroundColor: '#070a12',
        backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 18, 0.85), rgba(7, 10, 18, 0.95)), url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '24px',
          padding: '40px 30px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(147,51,234,0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 15px auto',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(56,189,248,0.2))',
            border: '2px solid #a855f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V6L12 2Z" fill="url(#shield-grad-login)" stroke="#c084fc" strokeWidth="1.5" />
              <path d="M7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11Z" fill="#38bdf8" />
              <path d="M17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.523 13 18 12.5523 18 12C18 11.4477 17.523 11 17 11Z" fill="#38bdf8" />
              <path d="M13 3L7 13H12L11 21L17 11H12L13 3Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
              <defs>
                <linearGradient id="shield-grad-login" x1="3" y1="2" x2="21" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#581c87" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#0284c7" stopOpacity="0.8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#c084fc', margin: '0 0 4px 0', textShadow: '0 0 10px rgba(192,132,252,0.6)' }}>CYBER TOPUP</h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 25px 0' }}>
            {authMode === 'login' && 'เข้าสู่ระบบด้วยรหัสผ่านที่คุณสมัครไว้'}
            {authMode === 'register' && 'สมัครสมาชิกใหม่เพื่อสร้างบัญชีผู้ใช้จริง'}
            {authMode === 'forgot' && forgotStep === 1 && 'ระบุ ID และ Email เพื่อยืนยันตัวตน'}
            {authMode === 'forgot' && forgotStep === 2 && 'กรอกรหัส OTP ยืนยันความเป็นเจ้าของ ID'}
            {authMode === 'forgot' && forgotStep === 3 && 'ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ'}
          </p>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>
                {authError}
              </div>
            )}
            {authSuccessMsg && (
              <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>
                {authSuccessMsg}
              </div>
            )}

            {(authMode === 'register' || (authMode === 'forgot' && forgotStep === 1)) && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>อีเมล (Email ยืนยันตัวตน)</label>
                <input 
                  type="email" 
                  placeholder="example@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {(authMode !== 'forgot' || (authMode === 'forgot' && forgotStep === 1)) && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อผู้ใช้งาน (Username / ID)</label>
                <input 
                  type="text" 
                  placeholder="กรอกชื่อผู้ใช้..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {authMode !== 'forgot' && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>รหัสผ่าน (Password)</label>
                
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่าน..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 40px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}
                    title={showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showLoginPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>

                {authMode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '6px' }}>
                    <span 
                      onClick={() => { setAuthMode('forgot'); setForgotStep(1); setAuthError(''); setAuthSuccessMsg(''); }} 
                      style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer' }}
                    >
                      ลืมรหัสผ่าน?
                    </span>
                  </div>
                )}
              </div>
            )}

            {authMode === 'register' && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ยืนยันรหัสผ่าน (Confirm Password)</label>
                <input 
                  type="password" 
                  placeholder="กรอกรหัสผ่านให้อีกครั้ง..."
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {authMode === 'forgot' && forgotStep === 2 && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>รหัส OTP จากอีเมล (6 หลัก)</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="กรอกรหัส OTP 6 หลัก..."
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '18px', textAlign: 'center', letterSpacing: '4px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {authMode === 'forgot' && forgotStep === 3 && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ตั้งรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  placeholder="กรอกรหัสผ่านใหม่..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <button 
              type="submit" 
              style={{
                backgroundColor: '#9333ea',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '10px',
                boxShadow: '0 0 15px rgba(147,51,234,0.5)'
              }}
            >
              {authMode === 'login' && 'เข้าสู่ระบบ (Login)'}
              {authMode === 'register' && 'สมัครสมาชิก (Register)'}
              {authMode === 'forgot' && forgotStep === 1 && 'ส่งรหัส OTP ยืนยันตัวตน'}
              {authMode === 'forgot' && forgotStep === 2 && 'ยืนยันรหัส OTP →'}
              {authMode === 'forgot' && forgotStep === 3 && 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '13px', color: '#9ca3af' }}>
            {authMode === 'login' && (
              <>ยังไม่มีบัญชี? <span onClick={() => { setAuthMode('register'); setAuthError(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>สมัครสมาชิก</span></>
            )}
            {authMode === 'register' && (
              <>มีบัญชีแล้ว? <span onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>เข้าสู่ระบบ</span></>
            )}
            {authMode === 'forgot' && (
              <span onClick={() => { setAuthMode('login'); setForgotStep(1); setAuthError(''); setAuthSuccessMsg(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>← กลับไปหน้าเข้าสู่ระบบ</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#070a12',
      backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 18, 0.85), rgba(7, 10, 18, 0.95)), url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      paddingBottom: '60px',
      position: 'relative'
    }}>
      
      <div style={{ position: 'fixed', top: '75px', left: '20px', zIndex: 99, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isWalletAutoRunning && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid #f59e0b', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <div style={{ fontSize: '12px' }}>
              <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>กำลังเติมเครดิตร้าน (฿{pendingWalletAmount.toLocaleString()})</div>
              <div style={{ color: '#9ca3af' }}>ตรวจสอบออโต้ใน: <b style={{ color: '#38bdf8' }}>{walletAutoSeconds}s</b></div>
            </div>
          </div>
        )}

        {isGameAutoRunning && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid #a855f7', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: '18px' }}>🎮</span>
            <div style={{ fontSize: '12px' }}>
              <div style={{ color: '#c084fc', fontWeight: 'bold' }}>กำลังเติมเกม {lastGameName}</div>
              <div style={{ color: '#9ca3af' }}>เติมออโต้ใน: <b style={{ color: '#38bdf8' }}>{gameAutoSeconds}s</b></div>
            </div>
          </div>
        )}
      </div>

      {showWalletSuccessPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #34d399', borderRadius: '24px', maxWidth: '380px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 20px 50px rgba(52,211,153,0.3)' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 15px auto', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399', margin: '0 0 10px 0' }}>เติมเครดิตร้านสำเร็จทันที!</h3>
            <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '20px' }}>
              ยอดเงิน <b>+฿{lastAddedAmount.toLocaleString()}</b> ถูกเพิ่มเข้าบัญชีของคุณเรียบร้อยแล้ว
            </p>
            <button onClick={() => setShowWalletSuccessPopup(false)} style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ตกลง</button>
          </div>
        </div>
      )}

      {showGameSuccessPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #34d399', borderRadius: '24px', maxWidth: '380px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 20px 50px rgba(52,211,153,0.3)' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 15px auto', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399', margin: '0 0 10px 0' }}>เติมเกมสำเร็จเรียบร้อย!</h3>
            <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '20px' }}>
              ระบบส่งยอดเข้าบัญชีเกม {lastGameName} สำเร็จ เลขออร์เดอร์: <b style={{ color: '#c084fc' }}>{orderSuccess}</b>
            </p>
            <button onClick={() => setShowGameSuccessPopup(false)} style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ตกลง</button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(147, 51, 234, 0.3)', padding: '15px 30px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(56,189,248,0.2))',
            border: '1.5px solid #a855f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V6L12 2Z" fill="url(#shield-grad)" stroke="#c084fc" strokeWidth="1.5" />
              <path d="M7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11Z" fill="#38bdf8" />
              <path d="M17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.523 13 18 12.5523 18 12C18 11.4477 17.523 11 17 11Z" fill="#38bdf8" />
              <path d="M13 3L7 13H12L11 21L17 11H12L13 3Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
              <defs>
                <linearGradient id="shield-grad" x1="3" y1="2" x2="21" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#581c87" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#0284c7" stopOpacity="0.8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#c084fc', letterSpacing: '1px', textShadow: '0 0 10px rgba(192,132,252,0.6)' }}>CYBER TOPUP</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase' }}>Fast & Secure Gaming</div>
          </div>
        </div>

        {/* USER PROFILE & WALLET BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#9ca3af' }}>👤 ผู้ใช้: </span>
              <b style={{ color: '#c084fc' }}>{user.username}</b>
            </div>
            <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px' }}>
              <span style={{ color: '#9ca3af' }}>💰 เครดิตร้าน: </span>
              <b style={{ color: '#34d399' }}>฿{user.balance.toLocaleString()}</b>
            </div>
            <button 
              onClick={() => { setShowTopupWalletModal(true); setWalletStep(1); }}
              style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + เติมเครดิต
            </button>
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>✨ หน้าแรก</button>
            <button onClick={() => setActiveTab('track')} style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>📋 เช็คสถานะ</button>
            
            {isUserAdmin && (
              <button onClick={() => setActiveTab('admin')} style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>⚙️ หลังบ้าน</button>
            )}

            <button onClick={handleLogout} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🚪 ออกจากระบบ</button>
          </nav>
        </div>
      </header>

      {/* FLOATING LINE BUTTON */}
      <a 
        href="https://lin.ee/XRpYKph" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '25px', right: '25px', backgroundColor: '#06c755', color: '#ffffff', padding: '12px 20px', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 99, boxShadow: '0 4px 25px rgba(6,199,85,0.5)', fontSize: '14px' }}
      >
        💬 ติดต่อแอดมิน (LINE)
      </a>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {activeTab === 'shop' && !selectedGame && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.85) 0%, rgba(30, 27, 75, 0.85) 50%, rgba(17, 24, 39, 0.9) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '24px', padding: '35px', marginBottom: '35px', boxShadow: '0 10px 40px rgba(147,51,234,0.25)' }}>
              <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.25)', border: '1px solid #a855f7', color: '#e9d5ff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '15px' }}>🚀 ยินดีต้อนรับคุณ {user.username} เข้าสู่ระบบเติมเกม 24 ชั่วโมง</span>
              <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0 0 15px 0', lineHeight: '1.2' }}>
                เติมเกมสะดวกรวดเร็ว <br />
                <span style={{ color: '#c084fc', textShadow: '0 0 15px rgba(192,132,252,0.4)' }}>ราคาถูกที่สุด คุ้มค่าที่สุด</span>
              </h1>
              <p style={{ color: '#d1d5db', fontSize: '15px', marginBottom: '25px', maxWidth: '650px' }}>
                เลือกเกมโปรดของคุณ เติมไวภายใน 1 นาที ชำระด้วย **Cyber Wallet เครดิตร้าน** หรือช่องทางอื่นๆ ได้อย่างง่ายดาย
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text"
                  placeholder="🔍 ค้นหาชื่อเกม..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: '1', minWidth: '220px', backgroundColor: 'rgba(17, 24, 39, 0.8)', border: '1px solid #374151', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedCategory('all')} style={{ backgroundColor: selectedCategory === 'all' ? '#9333ea' : 'rgba(17, 24, 39, 0.8)', border: '1px solid #374151', color: '#ffffff', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🎮 ทั้งหมด</button>
                  <button onClick={() => setSelectedCategory('pc')} style={{ backgroundColor: selectedCategory === 'pc' ? '#9333ea' : 'rgba(17, 24, 39, 0.8)', border: '1px solid #374151', color: '#ffffff', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>💻 PC</button>
                  <button onClick={() => setSelectedCategory('mobile')} style={{ backgroundColor: selectedCategory === 'mobile' ? '#9333ea' : 'rgba(17, 24, 39, 0.8)', border: '1px solid #374151', color: '#ffffff', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>📱 Mobile</button>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>🔥 เลือกเกมที่ต้องการเติมเงิน ({filteredGames.length} เกม)</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {filteredGames.map((game) => (
                <div 
                  key={game.id}
                  onClick={() => { setSelectedGame(game); setSelectedPackage(null); setPlayerId(user.username); }}
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, border 0.2s',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
                  }}
                >
                  <div style={{ position: 'relative', height: '170px', backgroundColor: '#1f2937' }}>
                    <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#9333ea', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(147,51,234,0.6)' }}>{game.badge}</span>
                  </div>
                  
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#ffffff' }}>{game.name}</h3>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{game.publisher}</p>
                    </div>
                    
                    <button style={{ marginTop: '15px', width: '100%', backgroundColor: '#9333ea', border: 'none', color: '#ffffff', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>คลิกเพื่อเติมเงิน →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => setSelectedGame(null)} style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid #374151', color: '#c084fc', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', fontSize: '13px' }}>← กลับไปเลือกเกมอื่น</button>

            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #581c87', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
              <img src={selectedGame.image} alt={selectedGame.name} style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #9333ea' }} />
              <div>
                <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{selectedGame.badge}</span>
                <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '6px 0 2px 0' }}>{selectedGame.name}</h1>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>ผู้ให้บริการ: {selectedGame.publisher}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', height: '24px', backgroundColor: '#9333ea', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</span>
                    ระบุข้อมูลไอดีผู้เล่น
                  </h2>
                  <input 
                    type="text"
                    placeholder="กรอก Player ID / Riot ID / UID..."
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', height: '24px', backgroundColor: '#9333ea', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</span>
                    เลือกแพ็กเกจที่ต้องการเติม
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {selectedGame.packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <div 
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          style={{
                            backgroundColor: isSelected ? 'rgba(147, 51, 234, 0.3)' : '#030712',
                            border: isSelected ? '2px solid #9333ea' : '1px solid #1f2937',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: 'bold' }}>{pkg.bonus}</div>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', margin: '4px 0 8px 0' }}>{pkg.name}</div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#34d399' }}>฿{pkg.price}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', height: '24px', backgroundColor: '#9333ea', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>3</span>
                    เลือกช่องทางชำระเงิน
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {paymentMethods.map((pay) => {
                      const isSelected = selectedPayment?.id === pay.id;
                      return (
                        <div 
                          key={pay.id}
                          onClick={() => setSelectedPayment(pay)}
                          style={{
                            backgroundColor: isSelected ? 'rgba(147, 51, 234, 0.3)' : '#030712',
                            border: isSelected ? '2px solid #9333ea' : '1px solid #1f2937',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: pay.id === 'wallet' ? '#34d399' : '#ffffff' }}>{pay.name}</div>
                          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{pay.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT SUMMARY */}
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>สรุปคำสั่งซื้อ</h3>

                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>เกม:</span> <span>{selectedGame.name}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>ID ผู้เล่น:</span> <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{playerId || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>แพ็กเกจ:</span> <span>{selectedPackage ? selectedPackage.name : '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>ช่องทางชำระ:</span> <span style={{ color: '#38bdf8' }}>{selectedPayment ? selectedPayment.name : '-'}</span></div>
                </div>

                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>ยอดชำระ:</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#34d399' }}>฿{selectedPackage ? selectedPackage.price : '0'}</span>
                </div>

                <button 
                  disabled={!playerId || !selectedPackage || !selectedPayment}
                  onClick={() => { setCheckoutStep(1); setShowCheckoutModal(true); }}
                  style={{ 
                    width: '100%', 
                    backgroundColor: (!playerId || !selectedPackage || !selectedPayment) ? '#374151' : '#9333ea', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    fontSize: '14px', 
                    cursor: (!playerId || !selectedPackage || !selectedPayment) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  ยืนยันการชำระเงิน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TRACK STATUS TAB (จำกัดสิทธิ์เฉพาะบัญชีตัวเอง ยกเว้นแอดมินดูได้ทั้งหมด) */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '30px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>📋 เช็คประวัติและสถานะการทำรายการ</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
              {isUserAdmin ? '🛡️ (มุมมองแอดมิน: คุณสามารถค้นหาประวัติของลูกค้าทุกคนได้)' : `👤 (แสดงเฉพาะประวัติคำสั่งซื้อของบัญชีคุณ: ${user.username})`}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <input 
                type="text"
                placeholder="ค้นหาเลขออร์เดอร์..."
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                style={{ flex: 1, minWidth: '200px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none' }}
              />
              <button 
                onClick={() => {
                  const query = trackQuery.trim().toLowerCase();
                  
                  // ถ้าเป็นแอดมิน ให้ดูออร์เดอร์ทั้งหมดได้ | ถ้าเป็นลูกค้าทั่วไป บังคับให้แสดงเฉพาะออร์เดอร์ของ Username ตัวเองเท่านั้น
                  let matched = orders.filter(o => isUserAdmin || o.player.toLowerCase() === user.username.toLowerCase());

                  if (query) {
                    matched = matched.filter(o => o.id.toLowerCase().includes(query) || o.player.toLowerCase().includes(query));
                  }

                  setTrackResultList(matched.slice(0, 10));
                }}
                style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ค้นหา
              </button>
            </div>

            {trackResultList !== null && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c084fc', marginBottom: '15px' }}>
                  ผลการค้นหา ({trackResultList.length} รายการ)
                </h3>

                {trackResultList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trackResultList.map((ord, idx) => (
                      <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>{ord.game} ({ord.package})</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            ผู้ซื้อ: <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{ord.player}</span> | เวลา: <span style={{ color: '#38bdf8' }}>{ord.time}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price}</div>
                          <span style={{ 
                            fontSize: '11px', 
                            backgroundColor: ord.status.includes('สำเร็จ') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                            color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b', 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            fontWeight: 'bold' 
                          }}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '14px', backgroundColor: '#030712', borderRadius: '14px', border: '1px solid #374151' }}>
                    ไม่พบประวัติการทำรายการสำหรับบัญชีของคุณ
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ADMIN MANAGEMENT TAB */}
        {activeTab === 'admin' && isUserAdmin && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0' }}>ระบบหลังบ้าน Admin</h2>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px' }}>กรอกรหัส PIN 6 หลักเพื่อเข้าสู่ระบบ</p>

                <form onSubmit={handleAdminLogin}>
                  {adminPinError && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>
                      {adminPinError}
                    </div>
                  )}

                  <input 
                    type="password"
                    maxLength={6}
                    placeholder="PIN 6 หลัก"
                    value={inputAdminPin}
                    onChange={(e) => setInputAdminPin(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }}
                  />

                  <button 
                    type="submit"
                    style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    เข้าสู่ระบบ
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📊 จัดการคำสั่งซื้อทั้งหมด (Admin)</h2>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>ตรวจสอบรายการและอนุมัติสลิปโอนเงิน</p>
                  </div>
                  <button 
                    onClick={() => setIsAdminLoggedIn(false)} 
                    style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ออกจากระบบ
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="text"
                    placeholder="🔍 ค้นหาด้วย Player ID หรือเลขออร์เดอร์..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord, idx) => {
                      const isPending = ord.status.includes('รอตรวจสอบ');
                      return (
                        <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>{ord.game} ({ord.package})</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                              ผู้ซื้อ: <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{ord.player}</span> | เวลา: <span style={{ color: '#38bdf8' }}>{ord.time}</span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price}</div>
                            
                            <span style={{ 
                              fontSize: '11px', 
                              backgroundColor: isPending ? 'rgba(245, 158, 11, 0.2)' : 'rgba(52, 211, 153, 0.2)', 
                              color: isPending ? '#f59e0b' : '#34d399', 
                              padding: '3px 8px', 
                              borderRadius: '6px', 
                              fontWeight: 'bold' 
                            }}>
                              {ord.status}
                            </span>

                            {isPending && (
                              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                <button 
                                  onClick={() => handleAdminApproveOrder(ord.id)}
                                  style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  ✅ อนุมัติทันที
                                </button>
                                <button 
                                  onClick={() => handleAdminRejectOrder(ord.id)}
                                  style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  ❌ ยกเลิก
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '14px' }}>
                      ไม่พบรายการที่ค้นหา
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && selectedGame && selectedPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center' }}>
            {checkoutStep === 1 && (
              <form onSubmit={handleVerifyPasswordStep}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#c084fc' }}>🔐 ยืนยันรหัสผ่านก่อนชำระเงิน</h3>
                {checkoutPasswordError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>
                    {checkoutPasswordError}
                  </div>
                )}
                <input 
                  type="password"
                  placeholder="กรอกรหัสผ่านบัญชีของคุณ..."
                  value={checkoutPassword}
                  onChange={(e) => setCheckoutPassword(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box', marginBottom: '15px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={resetCheckoutModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยืนยัน</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
