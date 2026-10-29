import React, { useState, useEffect } from 'react';

export default function GameTopupApp() {
  // ฐานข้อมูลผู้ใช้ที่สมัครจริงในเครื่อง
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

  // สถานะการล็อกอิน และระบบจำ ID
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem('cyber_remembered_user') || '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // App Navigation & Shop State
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Topup Wallet State
  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState('qrcode');
  const [walletStep, setWalletStep] = useState(1);
  const [walletTimeLeft, setWalletTimeLeft] = useState(180);
  const [isWalletQrExpired, setIsWalletQrExpired] = useState(false);

  // ข้อมูลที่ต้องกรอกสำหรับช่องทางพิเศษ
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [truemoneyRef, setTruemoneyRef] = useState('');
  const [creditCardNum, setCreditCardNum] = useState('');
  const [creditCardExp, setCreditCardExp] = useState('');
  const [creditCardCvv, setCreditCardCvv] = useState('');

  // Background Wallet Auto-Topup State (10 Seconds)
  const [isWalletAutoRunning, setIsWalletAutoRunning] = useState(false);
  const [walletAutoSeconds, setWalletAutoSeconds] = useState(10);
  const [pendingWalletAmount, setPendingWalletAmount] = useState(0);
  const [pendingWalletOrderId, setPendingWalletOrderId] = useState('');
  const [showWalletSuccessPopup, setShowWalletSuccessPopup] = useState(false);
  const [lastAddedAmount, setLastAddedAmount] = useState(0);

  // Order Tracking & Pagination State (สูงสุด 10 รายการต่อหน้า แยกตามวัน)
  const [trackQuery, setTrackQuery] = useState('');
  const [trackCurrentPage, setTrackCurrentPage] = useState(1);

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('cyber_topup_orders');
    if (savedOrders) {
      try { return JSON.parse(savedOrders); } catch (e) {}
    }
    return [
      { id: 'ORD-14914', game: 'Avatar Star', package: '1,000 Diamonds', price: 300, player: '11', status: 'รอตรวจสอบ [สะดุดใน 10s]', type: 'game', time: '25/04/2026 22:44 น.', dateKey: '2026-04-25', timestamp: Date.now() - 100000 },
      { id: 'ORD-48751', game: 'Free Fire', package: '1,166 Diamonds', price: 350, player: '11', status: 'สำเร็จ (เพิ่มออโต้)', type: 'game', time: '25/04/2026 22:44 น.', dateKey: '2026-04-25', timestamp: Date.now() - 200000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cyber_topup_orders', JSON.stringify(orders));
  }, [orders]);

  // Admin State & Dynamic PIN System (PIN: 123456)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPin, setAdminPin] = useState('123456');
  const [inputAdminPin, setInputAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutPassword, setCheckoutPassword] = useState('');
  const [showCheckoutPassword, setShowCheckoutPassword] = useState(false);
  const [checkoutPasswordError, setCheckoutPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isQrExpired, setIsQrExpired] = useState(false);

  // Background Game Checkout Auto-Topup State (10s)
  const [isGameAutoRunning, setIsGameAutoRunning] = useState(false);
  const [gameAutoSeconds, setGameAutoSeconds] = useState(10);
  const [pendingGameOrderId, setPendingGameOrderId] = useState('');
  const [showGameSuccessPopup, setShowGameSuccessPopup] = useState(false);
  const [lastGameName, setLastGameName] = useState('');

  // ฐานข้อมูลเกมทั้งหมด พร้อมปกที่ไม่ซ้ำกันและสื่อถึงจุดเด่น
  const [gamesData] = useState([
    {
      id: 'avatarstar',
      name: 'Avatar Star',
      publisher: 'Cubinet / AS Global',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80',
      badge: 'มาใหม่ล่าสุด 🔥',
      packages: [
        { id: 'as1', name: '300 Diamonds', price: 90, bonus: '+0' },
        { id: 'as2', name: '1,000 Diamonds', price: 300, bonus: '+50' },
        { id: 'as3', name: '2,100 Diamonds', price: 600, bonus: '+150' },
        { id: 'as4', name: '3,600 Diamonds', price: 1000, bonus: '+300' },
      ]
    },
    {
      id: 'valorant',
      name: 'VALORANT',
      publisher: 'Riot Games',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิตอันดับ 1',
      packages: [
        { id: 'v1', name: '125 VP', price: 99, bonus: '+0 VP' },
        { id: 'v2', name: '420 VP', price: 319, bonus: '+15 VP' },
        { id: 'v3', name: '700 VP', price: 529, bonus: '+30 VP' },
        { id: 'v4', name: '1,375 VP', price: 999, bonus: '+80 VP' },
      ]
    },
    {
      id: 'pubg',
      name: 'PUBG Mobile',
      publisher: 'Level Infinite',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต',
      packages: [
        { id: 'p1', name: '60 UC', price: 29, bonus: '+0 UC' },
        { id: 'p2', name: '325 UC', price: 149, bonus: '+15 UC' },
        { id: 'p3', name: '660 UC', price: 299, bonus: '+50 UC' },
      ]
    },
    {
      id: 'rov',
      name: 'ROV (Arena of Valor)',
      publisher: 'Garena',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต',
      packages: [
        { id: 'r1', name: '40 Coupons', price: 35, bonus: '+2 Coupons' },
        { id: 'r2', name: '90 Coupons', price: 75, bonus: '+5 Coupons' },
        { id: 'r3', name: '220 Coupons', price: 175, bonus: '+15 Coupons' },
      ]
    },
    {
      id: 'freefire',
      name: 'Free Fire',
      publisher: 'Garena',
      image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต',
      packages: [
        { id: 'ff1', name: '110 Diamonds', price: 35, bonus: '+5' },
        { id: 'ff2', name: '341 Diamonds', price: 105, bonus: '+20' },
        { id: 'ff3', name: '572 Diamonds', price: 175, bonus: '+40' },
      ]
    },
    {
      id: 'genshin',
      name: 'Genshin Impact',
      publisher: 'HoYoverse',
      image: 'https://images.unsplash.com/photo-1612287233202-b51e3ed6168c?auto=format&fit=crop&w=500&q=80',
      badge: 'แนะนำ',
      packages: [
        { id: 'g1', name: '60 Genesis Crystals', price: 35, bonus: '+0' },
        { id: 'g2', name: '300 Genesis Crystals', price: 179, bonus: '+10' },
        { id: 'g3', name: 'Blessing of the Welkin Moon', price: 179, bonus: 'รายเดือน' }
      ]
    }
  ]);

  const paymentMethods = [
    { id: 'wallet', name: 'Cyber Wallet (เครดิตร้าน)', desc: 'หักจากยอดเงินในบัญชีทันที' },
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'โอนผ่านเบอร์วอลเล็ต' },
    { id: 'credit', name: 'บัตรเครดิต / เดบิต', desc: 'ชำระผ่านบัตรเครดิตปลอดภัย' }
  ];

  // Timers Effect
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

  // Background 10s Auto-Topup for Wallet
  useEffect(() => {
    let bgWalletTimer;
    if (isWalletAutoRunning) {
      bgWalletTimer = setInterval(() => {
        setWalletAutoSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(bgWalletTimer);
            const amt = pendingWalletAmount;
            
            setUser((prevUser) => ({ ...prevUser, balance: prevUser.balance + amt }));
            setRegisteredUsers((prevList) =>
              prevList.map((u) => u.username === user.username ? { ...u, balance: u.balance + amt } : u)
            );

            const ordId = pendingWalletOrderId;
            setOrders((prevOrders) =>
              prevOrders.map((ord) => ord.id === ordId ? { ...ord, status: '✅ สำเร็จ' } : ord)
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

  // Background 10s Auto-Topup for Game
  useEffect(() => {
    let bgGameTimer;
    if (isGameAutoRunning) {
      bgGameTimer = setInterval(() => {
        setGameAutoSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(bgGameTimer);
            const ordId = pendingGameOrderId;
            setOrders((prevOrders) =>
              prevOrders.map((ord) => ord.id === ordId ? { ...ord, status: '✅ สำเร็จ' } : ord)
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

  // Auth Handlers
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
      }
      
      const foundUser = registeredUsers.find(
        (u) => (u.username === usernameInput || u.email === usernameInput) && u.password === passwordInput
      );

      if (foundUser) {
        if (rememberMe) {
          localStorage.setItem('cyber_remembered_user', usernameInput);
        } else {
          localStorage.removeItem('cyber_remembered_user');
        }
        setUser(foundUser);
      } else {
        setAuthError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
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

      const isExist = registeredUsers.some((u) => u.username === usernameInput);
      if (isExist) {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น');
        return;
      }

      const newUser = { username: usernameInput, email: emailInput, password: passwordInput, balance: 1800 };
      setRegisteredUsers([...registeredUsers, newUser]);
      setUsernameInput(usernameInput);
      setPasswordInput(passwordInput);
      setConfirmPasswordInput('');
      setEmailInput('');
      setAuthSuccessMsg('สมัครสมาชิกสำเร็จแล้ว! กรุณากดปุ่มเข้าสู่ระบบ');
      setAuthMode('login');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPasswordInput('');
    setShowLoginPassword(false);
    setConfirmPasswordInput('');
    setEmailInput('');
    setIsAdminLoggedIn(false);
    setActiveTab('shop');
  };

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

  const handleWalletNextStep = () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    if (walletPaymentMethod === 'true') {
      if (!truemoneyPhone || truemoneyPhone.length < 10 || !truemoneyRef || truemoneyRef.length < 14) {
        alert('กรุณากรอกเบอร์ TrueMoney และเลขอ้างอิง 14 หลักให้ครบถ้วน');
        return;
      }
    } else if (walletPaymentMethod === 'credit') {
      if (!creditCardNum || creditCardNum.length < 16 || !creditCardExp || !creditCardCvv) {
        alert('กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน');
        return;
      }
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
    // รูปแบบวันที่ตามต้องการ: 25/04/2026
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    const dateKey = `${year}-${month}-${day}`;

    const newWalletOrder = {
      id: newOrderId,
      game: `เติมเครดิต (${walletPaymentMethod.toUpperCase()})`,
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
    setTruemoneyPhone('');
    setTruemoneyRef('');
    setCreditCardNum('');
    setCreditCardExp('');
    setCreditCardCvv('');
  };

  const resetWalletModal = () => {
    setShowTopupWalletModal(false);
    setWalletStep(1);
    setTopupAmount('');
    setWalletTimeLeft(180);
    setIsWalletQrExpired(false);
    setTruemoneyPhone('');
    setTruemoneyRef('');
    setCreditCardNum('');
    setCreditCardExp('');
    setCreditCardCvv('');
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

    if (selectedPayment.id === 'true') {
      if (!truemoneyPhone || !truemoneyRef) {
        setCheckoutPasswordError('กรุณากรอกข้อมูล TrueMoney ให้ครบถ้วน');
        return;
      }
    } else if (selectedPayment.id === 'credit') {
      if (!creditCardNum || !creditCardExp || !creditCardCvv) {
        setCheckoutPasswordError('กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน');
        return;
      }
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
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
      const dateKey = `${year}-${month}-${day}`;

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: selectedPackage.name,
        price: selectedPackage.price,
        player: user.username,
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
      setTruemoneyPhone('');
      setTruemoneyRef('');
      setCreditCardNum('');
      setCreditCardExp('');
      setCreditCardCvv('');
    }, 1000);
  };

  // แอดมินกดอนุมัติ (ให้เงินเข้าทันทีและหยุดเวลานับถอยหลังทันที)
  const handleAdminApproveOrder = (orderId) => {
    if (isWalletAutoRunning && pendingWalletOrderId === orderId) setIsWalletAutoRunning(false);
    if (isGameAutoRunning && pendingGameOrderId === orderId) setIsGameAutoRunning(false);

    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          if (ord.type === 'wallet' && !ord.status.includes('สำเร็จ')) {
            setUser((prevUser) => ({ ...prevUser, balance: prevUser.balance + ord.price }));
            setRegisteredUsers((prevList) =>
              prevList.map((u) => u.username === ord.player ? { ...u, balance: u.balance + ord.price } : u)
            );
          }
          return { ...ord, status: '✅ สำเร็จ (แอดมินอนุมัติแล้ว)' };
        }
        return ord;
      })
    );
  };

  const handleAdminRejectOrder = (orderId) => {
    if (isWalletAutoRunning && pendingWalletOrderId === orderId) setIsWalletAutoRunning(false);
    if (isGameAutoRunning && pendingGameOrderId === orderId) setIsGameAutoRunning(false);
    setOrders((prevOrders) => prevOrders.map((ord) => ord.id === orderId ? { ...ord, status: '❌ ยกเลิก (ไม่พบยอดโอนเงิน)' } : ord));
  };

  const resetCheckoutModal = () => {
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setCheckoutPassword('');
    setShowCheckoutPassword(false);
    setCheckoutPasswordError('');
    setTimeLeft(180);
    setIsQrExpired(false);
    setTruemoneyPhone('');
    setTruemoneyRef('');
    setCreditCardNum('');
    setCreditCardExp('');
    setCreditCardCvv('');
  };

  const filteredGames = gamesData.filter((game) => game.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = orders.filter((ord) => ord.player.toLowerCase().includes(adminSearchQuery.toLowerCase()) || ord.id.toLowerCase().includes(adminSearchQuery.toLowerCase()));

  const isUserAdmin = user && (user.username === 'thanphooms@gmail.com' || user.email === 'thanphooms@gmail.com');

  // การแบ่งหน้าประวัติ (แสดงสูงสุด 10 รายการต่อหน้า แยกตามบัญชีผู้ใช้งาน)
  const userOrders = orders.filter(o => isUserAdmin || (user && o.player.toLowerCase() === user.username.toLowerCase()));
  const searchedOrders = userOrders.filter(o => {
    const q = trackQuery.trim().toLowerCase();
    if (!q) return true;
    return o.id.toLowerCase().includes(q) || o.game.toLowerCase().includes(q) || o.time.toLowerCase().includes(q);
  });
  const itemsPerPage = 10;
  const totalPages = Math.ceil(searchedOrders.length / itemsPerPage) || 1;
  const paginatedOrders = searchedOrders.slice((trackCurrentPage - 1) * itemsPerPage, trackCurrentPage * itemsPerPage);

  if (!user) {
    return (
      <div style={{
        backgroundColor: '#070a12',
        backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 18, 0.85), rgba(7, 10, 18, 0.95)), url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '24px',
          padding: '40px 30px', maxWidth: '420px', width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(147,51,234,0.3)', textAlign: 'center'
        }}>
          {/* โลโก้ร้าน */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #a855f7, #38bdf8)', border: '2px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: '0 0 20px rgba(168,85,247,0.6)', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', letterSpacing: '2px' }}>GAMING</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#c084fc', border: '1px solid #c084fc', padding: '2px 10px', borderRadius: '6px', letterSpacing: '1px', marginTop: '2px' }}>TOP-UP STORE</div>
          </div>

          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px 0' }}>
            {authMode === 'login' && 'เข้าสู่ระบบร้านเติมเกมอัตโนมัติ 24 ชม.'}
            {authMode === 'register' && 'สมัครสมาชิกใหม่'}
          </p>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authError}</div>}
            {authSuccessMsg && <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authSuccessMsg}</div>}

            {authMode === 'register' && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>อีเมล</label>
                <input type="email" placeholder="example@email.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อผู้ใช้งาน (Username / ID)</label>
              <input type="text" placeholder="กรอกชื่อผู้ใช้..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>รหัสผ่าน (Password)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showLoginPassword ? 'text' : 'password'} placeholder="กรอกรหัสผ่าน..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 40px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>{showLoginPassword ? '👁️‍🗨️' : '👁️'}</button>
              </div>
            </div>

            {authMode === 'login' && (
              <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
                <label htmlFor="remember" style={{ cursor: 'pointer' }}>จดจำไอดีของฉันไว้ (Remember ID)</label>
              </div>
            )}

            {authMode === 'register' && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ยืนยันรหัสผ่าน</label>
                <input type="password" placeholder="กรอกรหัสผ่านอีกครั้ง..." value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            <button type="submit" style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}>
              {authMode === 'login' && 'เข้าสู่ระบบ (Login)'}
              {authMode === 'register' && 'สมัครสมาชิก'}
            </button>
          </form>

          <div style={{ marginTop: '15px', fontSize: '13px', color: '#9ca3af' }}>
            {authMode === 'login' && <>ยังไม่มีบัญชี? <span onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccessMsg(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>สมัครสมาชิก</span></>}
            {authMode === 'register' && <>มีบัญชีแล้ว? <span onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>เข้าสู่ระบบ</span></>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#070a12',
      backgroundImage: `linear-gradient(to bottom, rgba(7, 10, 18, 0.85), rgba(7, 10, 18, 0.95)), url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
      color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '60px', position: 'relative'
    }}>
      
      {/* Wallet Success Popup */}
      {showWalletSuccessPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #34d399', borderRadius: '24px', maxWidth: '380px', width: '100%', padding: '30px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 15px auto', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✓</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399', margin: '0 0 10px 0' }}>เติมเครดิตร้านสำเร็จทันที!</h3>
            <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '20px' }}>ยอดเงิน <b>+฿{lastAddedAmount.toLocaleString()}</b> ถูกเพิ่มเข้าบัญชีของคุณเรียบร้อยแล้ว</p>
            <button onClick={() => setShowWalletSuccessPopup(false)} style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ตกลง</button>
          </div>
        </div>
      )}

      {/* Game Success Popup */}
      {showGameSuccessPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #34d399', borderRadius: '24px', maxWidth: '380px', width: '100%', padding: '30px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 15px auto', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✓</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399', margin: '0 0 10px 0' }}>เติมเกมสำเร็จเรียบร้อย!</h3>
            <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '20px' }}>ระบบส่งยอดเข้าบัญชีเกมสำเร็จ เลขออร์เดอร์: <b style={{ color: '#c084fc' }}>{orderSuccess}</b></p>
            <button onClick={() => setShowGameSuccessPopup(false)} style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ตกลง</button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(147, 51, 234, 0.3)', padding: '12px 30px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7, #38bdf8)', border: '1.5px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚡</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', lineHeight: '1' }}>GAMING</div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#c084fc', border: '1px solid #c084fc', padding: '0 4px', borderRadius: '4px', marginTop: '2px' }}>TOP-UP STORE</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>👤 ผู้ใช้: </span><b style={{ color: '#c084fc' }}>{user.username}</b></div>
            <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>💰 เครดิตร้าน: </span><b style={{ color: '#34d399' }}>฿{user.balance.toLocaleString()}</b></div>
            <button onClick={() => { setShowTopupWalletModal(true); setWalletStep(1); }} style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>+ เติมเครดิต</button>
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

      {/* FLOATING LINE OA WIDGET (แสดงเฉพาะหลังล็อกอินแล้ว) */}
      <a 
        href="https://lin.ee/Nn1UeBC" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{
          position: 'fixed', bottom: '25px', right: '25px', zIndex: 99,
          backgroundColor: '#06c755', color: '#ffffff', padding: '12px 18px',
          borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 20px rgba(6, 199, 85, 0.5)', textDecoration: 'none',
          fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #ffffff'
        }}
      >
        <span style={{ fontSize: '18px' }}>🟢</span> ติดต่อแอดมิน (Line OA)
      </a>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* SHOP MAIN PAGE */}
        {activeTab === 'shop' && !selectedGame && (
          <div>
            {/* ตกแต่งกล่องต้อนรับด้านบนให้สวยงาม ไม่ดูโล่ง */}
            <div style={{ background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(168, 85, 247, 0.5)', borderRadius: '24px', padding: '40px', marginBottom: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>⭐ OFFICIAL GAMING STORE 24 ชม.</span>
                <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '12px 0 10px 0' }}>ยินดีต้อนรับสู่ <span style={{ color: '#c084fc' }}>GAMING TOP-UP STORE</span></h1>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, maxWidth: '600px' }}>บริการเติมเกมออนไลน์อัตโนมัติ รวดเร็ว ปลอดภัย รองรับหลากหลายเกมดัง พร้อมระบบซัพพอร์ตตลอด 24 ชั่วโมง</p>
              </div>
              <div style={{ backgroundColor: 'rgba(3, 7, 18, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '20px', minWidth: '220px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>สถานะระบบเติมเงิน</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#34d399' }}>🟢 พร้อมให้บริการอัตโนมัติ</div>
                <div style={{ fontSize: '11px', color: '#c084fc', marginTop: '6px' }}>ความเร็วเฉลี่ย: 10 วินาที</div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <input type="text" placeholder="🔍 ค้นหาชื่อเกมที่คุณต้องการเติม..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid #374151', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', outline: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {filteredGames.map((game) => (
                <div key={game.id} onClick={() => { setSelectedGame(game); setSelectedPackage(null); setPlayerId(user.username); }} style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <img src={game.image} alt={game.name} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
                  <div style={{ padding: '18px' }}>
                    <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>{game.badge}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0 4px 0' }}>{game.name}</h3>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{game.publisher}</p>
                    <button style={{ marginTop: '15px', width: '100%', backgroundColor: '#9333ea', border: 'none', color: '#ffffff', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>คลิกเพื่อเติมเงิน →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAME SELECTION DETAILS PAGE */}
        {activeTab === 'shop' && selectedGame && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => setSelectedGame(null)} style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid #374151', color: '#c084fc', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>← กลับไปเลือกเกมอื่น</button>
            
            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid #581c87', borderRadius: '20px', padding: '20px', display: 'flex', gap: '20px', marginBottom: '25px', alignItems: 'center' }}>
              <img src={selectedGame.image} alt={selectedGame.name} style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover' }} />
              <div>
                <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{selectedGame.badge}</span>
                <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '6px 0 0 0' }}>{selectedGame.name}</h1>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>{selectedGame.publisher}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '20px', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>1. ไอดีผู้เล่น / Username ที่ต้องการเติม</h3>
                  <input type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="กรอก UID / Player ID..." style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '20px', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>2. เลือกแพ็กเกจเติมเกม</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {selectedGame.packages.map((pkg) => (
                      <div key={pkg.id} onClick={() => setSelectedPackage(pkg)} style={{ backgroundColor: selectedPackage?.id === pkg.id ? 'rgba(147, 51, 234, 0.3)' : '#030712', border: selectedPackage?.id === pkg.id ? '2px solid #9333ea' : '1px solid #1f2937', borderRadius: '12px', padding: '12px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: 'bold' }}>{pkg.bonus}</div>
                        <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', margin: '4px 0 6px 0' }}>{pkg.name}</div>
                        <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 'bold' }}>฿{pkg.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '20px', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>3. เลือกช่องทางชำระเงิน</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {paymentMethods.map((pay) => (
                      <div key={pay.id} onClick={() => setSelectedPayment(pay)} style={{ backgroundColor: selectedPayment?.id === pay.id ? 'rgba(147, 51, 234, 0.3)' : '#030712', border: selectedPayment?.id === pay.id ? '2px solid #9333ea' : '1px solid #1f2937', borderRadius: '12px', padding: '12px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: pay.id === 'wallet' ? '#34d399' : '#ffffff' }}>{pay.name}</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{pay.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* ฟอร์มข้อมูลเพิ่มเติมตามช่องทางจ่ายเงิน */}
                  {selectedPayment?.id === 'true' && (
                    <div style={{ marginTop: '15px', backgroundColor: '#030712', padding: '15px', borderRadius: '12px', border: '1px solid #374151' }}>
                      <h4 style={{ fontSize: '13px', color: '#34d399', margin: '0 0 10px 0' }}>📱 ข้อมูล TrueMoney Wallet</h4>
                      <input type="text" placeholder="เบอร์วอลเล็ตผู้โอน (10 หลัก)" value={truemoneyPhone} onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff', fontSize: '13px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }} />
                      <input type="text" placeholder="เลขอ้างอิงรายการ (14 หลัก)" value={truemoneyRef} onChange={(e) => setTruemoneyRef(e.target.value.replace(/[^0-9]/g, ''))} maxLength={14} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  {selectedPayment?.id === 'credit' && (
                    <div style={{ marginTop: '15px', backgroundColor: '#030712', padding: '15px', borderRadius: '12px', border: '1px solid #374151' }}>
                      <h4 style={{ fontSize: '13px', color: '#38bdf8', margin: '0 0 10px 0' }}>💳 ข้อมูลบัตรเครดิต / เดบิต</h4>
                      <input type="text" placeholder="หมายเลขบัตร (16 หลัก)" value={creditCardNum} onChange={(e) => setCreditCardNum(e.target.value.replace(/[^0-9]/g, ''))} maxLength={16} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff', fontSize: '13px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={(e) => setCreditCardExp(e.target.value)} maxLength={5} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        <input type="password" placeholder="CVV" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '10px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SUMMARY BOX */}
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '20px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>สรุปคำสั่งซื้อ</h3>
                
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>เกม:</span> <span>{selectedGame.name}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>ID ผู้เล่น:</span> <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{playerId || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>แพ็กเกจ:</span> <span>{selectedPackage ? selectedPackage.name : '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>ช่องทางชำระ:</span> <span style={{ color: '#38bdf8' }}>{selectedPayment ? selectedPayment.name : '-'}</span></div>
                </div>

                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>ยอดชำระ:</span>
                  <span style={{ fontSize: '22px', color: '#34d399', fontWeight: 'bold' }}>฿{selectedPackage ? selectedPackage.price : '0'}</span>
                </div>
                
                <button disabled={!playerId || !selectedPackage || !selectedPayment} onClick={() => { setCheckoutStep(1); setShowCheckoutModal(true); }} style={{ width: '100%', backgroundColor: (!playerId || !selectedPackage || !selectedPayment) ? '#374151' : '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: (!playerId || !selectedPackage || !selectedPayment) ? 'not-allowed' : 'pointer' }}>ยืนยันการชำระเงิน</button>
              </div>
            </div>
          </div>
        )}

        {/* TRACK STATUS & HISTORY TAB (พร้อมแบ่งหน้า และแสดงวันที่ DD/MM/YYYY) */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '30px', border: '1px solid rgba(147,51,234,0.3)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>📋 เช็คประวัติและสถานะการทำรายการ</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
              {isUserAdmin ? '🛡️ (มุมมองแอดมิน: แสดงประวัติทั้งหมดในระบบ)' : `👤 (แสดงเฉพาะประวัติคำสั่งซื้อของบัญชีคุณ: ${user.username})`}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="ค้นหาเลขออร์เดอร์, ชื่อเกม หรือวันที่..." value={trackQuery} onChange={(e) => { setTrackQuery(e.target.value); setTrackCurrentPage(1); }} style={{ flex: 1, backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '15px', color: '#c084fc', margin: 0 }}>ประวัติการทำรายการ (ทั้งหมด {searchedOrders.length} รายการ)</h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>แสดงหน้าละ 10 รายการ</span>
              </div>

              {paginatedOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {paginatedOrders.map((ord, idx) => (
                    <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{ord.id}</span>
                          <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}>{ord.game} ({ord.package})</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>ผู้ซื้อ: <span style={{ color: '#c084fc' }}>{ord.player}</span></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price}</div>
                        <span style={{ fontSize: '11px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b' }}>{ord.status}</span>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                      <button disabled={trackCurrentPage === 1} onClick={() => setTrackCurrentPage(prev => prev - 1)} style={{ backgroundColor: trackCurrentPage === 1 ? '#1f2937' : '#9333ea', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: trackCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>← ก่อนหน้า</button>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>หน้าที่ {trackCurrentPage} จาก {totalPages}</span>
                      <button disabled={trackCurrentPage === totalPages} onClick={() => setTrackCurrentPage(prev => prev + 1)} style={{ backgroundColor: trackCurrentPage === totalPages ? '#1f2937' : '#9333ea', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: trackCurrentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>ถัดไป →</button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>ไม่พบประวัติการทำรายการ</div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && isUserAdmin && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '30px', textAlign: 'center', border: '1px solid #9333ea' }}>
                <h2>ระบบหลังบ้าน Admin</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าจัดการระบบ (PIN: 123456)</p>
                <form onSubmit={handleAdminLogin}>
                  {adminPinError && <div style={{ color: '#fca5a5', marginBottom: '10px', fontSize: '12px' }}>{adminPinError}</div>}
                  <input type="password" maxLength={6} placeholder="PIN 6 หลัก" value={inputAdminPin} onChange={(e) => setInputAdminPin(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', marginBottom: '15px', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>เข้าสู่ระบบแอดมิน</button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1px solid #9333ea' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📊 จัดการคำสั่งซื้อทั้งหมด (Admin Panel)</h2>
                  <button onClick={() => setIsAdminLoggedIn(false)} style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>ล็อกอิน PIN ใหม่</button>
                </div>

                <input type="text" placeholder="ค้นหาเลขออร์เดอร์ หรือชื่อผู้ซื้อ..." value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredOrders.map((ord, idx) => (
                    <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{ord.id}</span>
                          <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                          <b style={{ fontSize: '15px' }}>{ord.game} ({ord.package})</b>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>ผู้ซื้อ: <span style={{ color: '#c084fc' }}>{ord.player}</span> | ราคา: <span style={{ color: '#34d399' }}>฿{ord.price}</span></div>
                        <div style={{ fontSize: '12px', marginTop: '4px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b' }}>สถานะ: {ord.status}</div>
                      </div>

                      {ord.status.includes('รอตรวจสอบ') && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleAdminApproveOrder(ord.id)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>อนุมัติ (เงินเข้าทันที)</button>
                          <button onClick={() => handleAdminRejectOrder(ord.id)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>ยกเลิก</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '13px' }}>
        <p style={{ margin: '0 0 5px 0' }}>⚡ <b>GAMING TOP-UP STORE</b> - บริการเติมเกมออนไลน์ตลอด 24 ชั่วโมง</p>
      </footer>

      {/* MODAL: TOPUP STORE WALLET */}
      {showTopupWalletModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center' }}>
            
            {walletStep === 1 && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>💳 เติมเครดิตเข้า Cyber Wallet</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>กรอกจำนวนเงินและเลือกช่องทางชำระเงิน</p>

                <input 
                  type="text"
                  inputMode="numeric"
                  placeholder="ระบุจำนวนเงิน (บาท)..."
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', fontSize: '20px', textAlign: 'center', fontWeight: 'bold', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' }}
                />

                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>เลือกช่องทางชำระเงิน</label>
                  <select value={walletPaymentMethod} onChange={(e) => setWalletPaymentMethod(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '13px', outline: 'none' }}>
                    <option value="qrcode">QR PromptPay</option>
                    <option value="true">TrueMoney Wallet</option>
                    <option value="credit">บัตรเครดิต / เดบิต</option>
                  </select>
                </div>

                {walletPaymentMethod === 'true' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="เบอร์วอลเล็ต (10 หลัก)" value={truemoneyPhone} onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="text" placeholder="เลขอ้างอิง 14 หลัก" value={truemoneyRef} onChange={(e) => setTruemoneyRef(e.target.value.replace(/[^0-9]/g, ''))} maxLength={14} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                {walletPaymentMethod === 'credit' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="หมายเลขบัตร 16 หลัก" value={creditCardNum} onChange={(e) => setCreditCardNum(e.target.value.replace(/[^0-9]/g, ''))} maxLength={16} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={(e) => setCreditCardExp(e.target.value)} maxLength={5} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                      <input type="password" placeholder="CVV" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button 
                    disabled={!topupAmount || parseFloat(topupAmount) <= 0}
                    onClick={handleWalletNextStep} 
                    style={{ flex: 1, backgroundColor: (!topupAmount || parseFloat(topupAmount) <= 0) ? '#374151' : '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {walletPaymentMethod === 'qrcode' ? 'ถัดไป (สแกน QR) →' : 'ยืนยันการเติมเครดิต'}
                  </button>
                </div>
              </div>
            )}

            {walletStep === 2 && walletPaymentMethod === 'qrcode' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>📱 สแกน QR Code เติมเครดิต</h3>

                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  ยอดชำระ: <b style={{ color: '#34d399' }}>฿{parseFloat(topupAmount).toLocaleString()}</b>
                </p>

                {/* ตัวนับเวลาถอยหลัง QR Code และสถานะ 10 วิ */}
                <div style={{ fontSize: '12px', color: isWalletQrExpired ? '#ef4444' : '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>
                  {isWalletQrExpired ? '❌ QR Code หมดอายุแล้ว' : `⏱️ QR Code จะหมดอายุใน: ${Math.floor(walletTimeLeft / 60)}:${(walletTimeLeft % 60).toString().padStart(2, '0')} นาที`}
                </div>
                {isWalletAutoRunning && (
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '10px', animation: 'pulse 1s infinite' }}>
                    ⏳ ระบบกำลังตรวจสอบยอดโอนอัตโนมัติใน ({walletAutoSeconds} วินาที)...
                  </div>
                )}

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '160px', height: '160px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isWalletQrExpired ? 0.4 : 1 }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Topup-Wallet-${topupAmount}`} 
                    alt="Topup QR Code" 
                    style={{ width: '140px', height: '140px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setWalletStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button 
                    disabled={isWalletQrExpired}
                    onClick={handleWalletConfirmPayment} 
                    style={{ flex: 1, backgroundColor: isWalletQrExpired ? '#374151' : '#34d399', color: isWalletQrExpired ? '#9ca3af' : '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isWalletQrExpired ? 'not-allowed' : 'pointer' }}
                  >
                    ฉันโอนเงินเรียบร้อยแล้ว
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && selectedGame && selectedPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center' }}>
            
            {checkoutStep === 1 && (
              <form onSubmit={handleVerifyPasswordStep}>
                <h3 style={{ color: '#c084fc', marginBottom: '8px' }}>🔐 ยืนยันรหัสผ่านก่อนชำระเงิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>กรอกรหัสผ่านบัญชีของคุณเพื่อยืนยันคำสั่งซื้อ</p>

                {checkoutPasswordError && <div style={{ color: '#fca5a5', fontSize: '12px', backgroundColor: 'rgba(239,68,68,0.2)', padding: '8px', borderRadius: '8px', marginBottom: '12px' }}>{checkoutPasswordError}</div>}
                
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <input type={showCheckoutPassword ? 'text' : 'password'} placeholder="กรอกรหัสผ่านของคุณ..." value={checkoutPassword} onChange={(e) => setCheckoutPassword(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 40px 12px 12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowCheckoutPassword(!showCheckoutPassword)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>{showCheckoutPassword ? '👁️‍🗨️' : '👁️'}</button>
                </div>

                {selectedPayment?.id === 'true' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="เบอร์ TrueMoney (10 หลัก)" value={truemoneyPhone} onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="text" placeholder="เลขอ้างอิง 14 หลัก" value={truemoneyRef} onChange={(e) => setTruemoneyRef(e.target.value.replace(/[^0-9]/g, ''))} maxLength={14} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                {selectedPayment?.id === 'credit' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="หมายเลขบัตร 16 หลัก" value={creditCardNum} onChange={(e) => setCreditCardNum(e.target.value.replace(/[^0-9]/g, ''))} maxLength={16} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={(e) => setCreditCardExp(e.target.value)} maxLength={5} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                      <input type="password" placeholder="CVV" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={resetCheckoutModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>ยกเลิก</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>ยืนยัน</button>
                </div>
              </form>
            )}

            {checkoutStep === 2 && selectedPayment?.id === 'qrcode' && (
              <div>
                <h3 style={{ color: '#38bdf8', marginBottom: '6px' }}>📱 สแกน QR Code ชำระเงิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  ยอดชำระ: <b style={{ color: '#34d399' }}>฿{selectedPackage.price}</b>
                </p>

                {/* ตัวนับเวลาถอยหลัง Checkout QR และสถานะ 10 วิ */}
                <div style={{ fontSize: '12px', color: isQrExpired ? '#ef4444' : '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>
                  {isQrExpired ? '❌ QR Code หมดอายุแล้ว' : `⏱️ QR Code จะหมดอายุใน: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} นาที`}
                </div>
                {isGameAutoRunning && (
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '10px', animation: 'pulse 1s infinite' }}>
                    ⏳ ระบบกำลังตรวจสอบยอดโอนอัตโนมัติใน ({gameAutoSeconds} วินาที)...
                  </div>
                )}

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '160px', height: '160px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isQrExpired ? 0.4 : 1 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Checkout-PromptPay-${selectedPackage.price}`} alt="Checkout QR Code" style={{ width: '140px', height: '140px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setCheckoutStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button type="button" disabled={isProcessing || isQrExpired} onClick={handleFinalPaymentSubmit} style={{ flex: 1, backgroundColor: isQrExpired ? '#374151' : '#34d399', color: isQrExpired ? '#9ca3af' : '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isQrExpired ? 'not-allowed' : 'pointer' }}>
                    {isProcessing ? 'กำลังส่งข้อมูล...' : 'ฉันโอนเงินเรียบร้อยแล้ว'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
