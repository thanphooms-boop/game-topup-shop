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

  // สถานะการล็อกอิน (เริ่มต้นเป็น null เพื่อให้พิมพ์เองทั้งหมด)
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [usernameInput, setUsernameInput] = useState('');
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

  // Background Wallet Auto-Topup State (10 Seconds)
  const [isWalletAutoRunning, setIsWalletAutoRunning] = useState(false);
  const [walletAutoSeconds, setWalletAutoSeconds] = useState(10);
  const [pendingWalletAmount, setPendingWalletAmount] = useState(0);
  const [pendingWalletOrderId, setPendingWalletOrderId] = useState('');
  const [showWalletSuccessPopup, setShowWalletSuccessPopup] = useState(false);
  const [lastAddedAmount, setLastAddedAmount] = useState(0);

  // Order Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResultList, setTrackResultList] = useState(null);

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('cyber_topup_orders');
    if (savedOrders) {
      try { return JSON.parse(savedOrders); } catch (e) {}
    }
    return [
      { id: 'ORD-14914', game: 'Free Fire', package: '1,166 Diamonds', price: 350, player: '11', status: 'รอตรวจสอบ [สะดุดใน 10s]', type: 'game', time: '29/10/69 22:44 น.', dateKey: '2029-10-29', timestamp: Date.now() - 100000 },
      { id: 'ORD-48751', game: 'Free Fire', package: '1,166 Diamonds', price: 350, player: '11', status: 'สำเร็จ (เพิ่มออโต้)', type: 'game', time: '29/10/69 22:44 น.', dateKey: '2029-10-29', timestamp: Date.now() - 200000 }
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

  // Background Game Checkout Auto-Topup State
  const [isGameAutoRunning, setIsGameAutoRunning] = useState(false);
  const [gameAutoSeconds, setGameAutoSeconds] = useState(10);
  const [pendingGameOrderId, setPendingGameOrderId] = useState('');
  const [showGameSuccessPopup, setShowGameSuccessPopup] = useState(false);
  const [lastGameName, setLastGameName] = useState('');

  // ฐานข้อมูลเกมทั้งหมดที่เราเคยทำร่วมกัน (รวม VALORANT, PUBG, ROV, Free Fire, Genshin Impact, Honkai Star Rail)
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
      image: 'https://images.unsplash.com/photo-1612287233202-b51e3ed6168c?auto=format&fit=crop&w=500&q=80',
      category: 'pc',
      badge: 'แนะนำ',
      packages: [
        { id: 'g1', name: '60 Genesis Crystals', price: 35, bonus: '+0' },
        { id: 'g2', name: '300 Genesis Crystals', price: 179, bonus: '+10' },
        { id: 'g3', name: '980 Genesis Crystals', price: 549, bonus: '+40' },
        { id: 'g4', name: 'Blessing of the Welkin Moon', price: 179, bonus: 'รายเดือน' }
      ]
    },
    {
      id: 'hsr',
      name: 'Honkai: Star Rail',
      publisher: 'HoYoverse',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
      category: 'pc',
      badge: 'แนะนำ',
      packages: [
        { id: 'h1', name: '60 Oneiric Shards', price: 35, bonus: '+0' },
        { id: 'h2', name: '300 Oneiric Shards', price: 179, bonus: '+10' },
        { id: 'h3', name: 'Supply Pass', price: 179, bonus: 'รายเดือน' }
      ]
    }
  ]);

  const paymentMethods = [
    { id: 'wallet', name: 'Cyber Wallet (เครดิตร้าน)', desc: 'หักจากยอดเงินในบัญชีของคุณ ชำระได้ทันที' },
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'โอนผ่านเบอร์วอลเล็ต' },
    { id: 'truemoney', name: 'บัตรเงินสดทรูมันนี่', desc: 'เติมด้วยรหัสบัตร 14 หลัก' }
  ];

  // Timers & Background Auto-Topup Effects
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

            setRegisteredUsers((prevList) =>
              prevList.map((u) => u.username === user.username ? { ...u, balance: u.balance + amt } : u)
            );

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

      const newUser = {
        username: usernameInput,
        email: emailInput,
        password: passwordInput,
        balance: 1800
      };

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
    setUsernameInput('');
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
  };

  const resetWalletModal = () => {
    setShowTopupWalletModal(false);
    setWalletStep(1);
    setTopupAmount('');
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
      const thaiTime = now.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
      const dateKey = now.toISOString().split('T')[0];

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
    }, 1000);
  };

  const handleAdminApproveOrder = (orderId) => {
    if (isWalletAutoRunning && pendingWalletOrderId === orderId) setIsWalletAutoRunning(false);
    if (isGameAutoRunning && pendingGameOrderId === orderId) setIsGameAutoRunning(false);

    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          if (ord.type === 'wallet' && !ord.status.includes('สำเร็จ')) {
            setUser((prevUser) => ({ ...prevUser, balance: prevUser.balance + ord.price }));
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
  };

  const filteredGames = gamesData.filter((game) => game.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = orders.filter((ord) => ord.player.toLowerCase().includes(adminSearchQuery.toLowerCase()) || ord.id.toLowerCase().includes(adminSearchQuery.toLowerCase()));

  const isUserAdmin = user && (user.username === 'thanphooms@gmail.com' || user.email === 'thanphooms@gmail.com');

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
          backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '24px',
          padding: '40px 30px', maxWidth: '420px', width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(147,51,234,0.3)', textAlign: 'center'
        }}>
          {/* โลโก้ร้านในหน้า Login */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(147,51,234,0.6), rgba(56,189,248,0.4))', border: '1.5px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚡</div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#c084fc', margin: 0 }}>CYBER TOPUP</h1>
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

          {/* ช่องทางติดต่อ Line OA ในหน้า Login */}
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', fontSize: '12px', color: '#34d399' }}>
            💬 สนใจติดต่อแอดมิน / แจ้งปัญหา: <b>Line: @cybertopup</b>
          </div>

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

      {/* NAVBAR WITH LOGO & LINE OA */}
      <header style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(147, 51, 234, 0.3)', padding: '15px 30px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(56,189,248,0.2))', border: '1.5px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#c084fc' }}>CYBER TOPUP</div>
            <div style={{ fontSize: '10px', color: '#34d399', letterSpacing: '1px' }}>🟢 Line Official: @cybertopup</div>
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

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* SHOP MAIN PAGE */}
        {activeTab === 'shop' && !selectedGame && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.85) 0%, rgba(17, 24, 39, 0.9) 100%)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '24px', padding: '35px', marginBottom: '35px' }}>
              <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0 0 15px 0' }}>เติมเกมสะดวกรวดเร็ว <span style={{ color: '#c084fc' }}>24 ชั่วโมง</span></h1>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>บริการเติมเกม VALORANT, PUBG, ROV, Free Fire, Genshin Impact และ Honkai: Star Rail อัตโนมัติ ปลอดภัย 100%</p>
              <input type="text" placeholder="🔍 ค้นหาชื่อเกม..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(17, 24, 39, 0.8)', border: '1px solid #374151', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', outline: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {filteredGames.map((game) => (
                <div key={game.id} onClick={() => { setSelectedGame(game); setSelectedPackage(null); setPlayerId(user.username); }} style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' }}>
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

        {/* TRACK STATUS TAB */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '20px', padding: '30px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>📋 เช็คประวัติและสถานะการทำรายการ</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
              {isUserAdmin ? '🛡️ (มุมมองแอดมิน: คุณสามารถค้นหาประวัติของลูกค้าทุกคนได้)' : `👤 (แสดงเฉพาะประวัติคำสั่งซื้อของบัญชีคุณ: ${user.username})`}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input type="text" placeholder="ค้นหาเลขออร์เดอร์..." value={trackQuery} onChange={(e) => setTrackQuery(e.target.value)} style={{ flex: 1, backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none' }} />
              <button onClick={() => {
                const query = trackQuery.trim().toLowerCase();
                let matched = orders.filter(o => isUserAdmin || o.player.toLowerCase() === user.username.toLowerCase());
                if (query) {
                  matched = matched.filter(o => o.id.toLowerCase().includes(query) || o.player.toLowerCase().includes(query));
                }
                setTrackResultList(matched.slice(0, 10));
              }} style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ค้นหา</button>
            </div>

            {trackResultList !== null && (
              <div>
                <h3 style={{ fontSize: '16px', color: '#c084fc', marginBottom: '15px' }}>ผลการค้นหา ({trackResultList.length} รายการ)</h3>
                {trackResultList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trackResultList.map((ord, idx) => (
                      <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{ord.id}</span>
                          <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}>{ord.game} ({ord.package})</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>ผู้ซื้อ: <span style={{ color: '#c084fc' }}>{ord.player}</span> | เวลา: {ord.time}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price}</div>
                          <span style={{ fontSize: '11px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b' }}>{ord.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>ไม่พบประวัติการทำรายการสำหรับบัญชีของคุณ</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && isUserAdmin && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '20px', padding: '30px', textAlign: 'center' }}>
                <h2>ระบบหลังบ้าน Admin</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าจัดการระบบ (PIN: 123456)</p>
                <form onSubmit={handleAdminLogin}>
                  {adminPinError && <div style={{ color: '#fca5a5', marginBottom: '10px', fontSize: '12px' }}>{adminPinError}</div>}
                  <input type="password" maxLength={6} placeholder="PIN 6 หลัก" value={inputAdminPin} onChange={(e) => setInputAdminPin(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', marginBottom: '15px', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>เข้าสู่ระบบแอดมิน</button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '20px', padding: '25px' }}>
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
                          <b style={{ fontSize: '15px' }}>{ord.game} ({ord.package})</b>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>ผู้ซื้อ: <span style={{ color: '#c084fc' }}>{ord.player}</span> | ราคา: <span style={{ color: '#34d399' }}>฿{ord.price}</span> | เวลา: {ord.time}</div>
                        <div style={{ fontSize: '12px', marginTop: '4px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b' }}>สถานะ: {ord.status}</div>
                      </div>

                      {ord.status.includes('รอตรวจสอบ') && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleAdminApproveOrder(ord.id)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>อนุมัติ</button>
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

      {/* FOOTER WITH LINE OA */}
      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '13px' }}>
        <p style={{ margin: '0 0 5px 0' }}>⚡ <b>CYBER TOPUP</b> - บริการเติมเกมออนไลน์ตลอด 24 ชั่วโมง</p>
        <p style={{ margin: 0, color: '#34d399' }}>🟢 ติดต่อสอบถาม / แจ้งปัญหา Line Official: <b>@cybertopup</b></p>
      </footer>

      {/* MODAL: TOPUP STORE WALLET */}
      {showTopupWalletModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center' }}>
            
            {walletStep === 1 && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>💳 เติมเครดิตเข้า Cyber Wallet</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>กรอกจำนวนเงินและเลือกช่องทางชำระเงิน</p>

                <input 
                  type="text"
                  inputMode="numeric"
                  placeholder="ระบุจำนวนเงิน (บาท)..."
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', fontSize: '20px', textAlign: 'center', fontWeight: 'bold', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button 
                    disabled={!topupAmount || parseFloat(topupAmount) <= 0}
                    onClick={handleWalletNextStep} 
                    style={{ flex: 1, backgroundColor: (!topupAmount || parseFloat(topupAmount) <= 0) ? '#374151' : '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    ถัดไป (สแกน QR) →
                  </button>
                </div>
              </div>
            )}

            {walletStep === 2 && walletPaymentMethod === 'qrcode' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>📱 สแกน QR Code เติมเครดิต</h3>

                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                  ยอดชำระ: <b style={{ color: '#34d399' }}>฿{parseFloat(topupAmount).toLocaleString()}</b>
                </p>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '180px', height: '180px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Topup-Wallet-${topupAmount}`} 
                    alt="Topup QR Code" 
                    style={{ width: '150px', height: '150px' }}
                  />
                </div>

                <p style={{ fontSize: '11px', color: '#c084fc', marginBottom: '20px' }}>*เมื่อโอนแล้ว กดปุ่มด้านล่างเพื่อยืนยัน ยอดเงินจะเข้าอัตโนมัติภายใน 10 วินาที</p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setWalletStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button 
                    onClick={handleWalletConfirmPayment} 
                    style={{ flex: 1, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
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
                
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <input type={showCheckoutPassword ? 'text' : 'password'} placeholder="กรอกรหัสผ่านของคุณ..." value={checkoutPassword} onChange={(e) => setCheckoutPassword(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 40px 12px 12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowCheckoutPassword(!showCheckoutPassword)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>{showCheckoutPassword ? '👁️‍🗨️' : '👁️'}</button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={resetCheckoutModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>ยกเลิก</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>ยืนยัน</button>
                </div>
              </form>
            )}

            {checkoutStep === 2 && selectedPayment?.id === 'qrcode' && (
              <div>
                <h3 style={{ color: '#38bdf8', marginBottom: '6px' }}>📱 สแกน QR Code ชำระเงิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                  ยอดชำระ: <b style={{ color: '#34d399' }}>฿{selectedPackage.price}</b>
                </p>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '180px', height: '180px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Checkout-PromptPay-${selectedPackage.price}`} alt="Checkout QR Code" style={{ width: '150px', height: '150px' }} />
                </div>

                <p style={{ fontSize: '11px', color: '#c084fc', marginBottom: '20px' }}>*เมื่อโอนแล้ว กดปุ่มด้านล่าง ระบบจะไปหน้าถัดไป 10 วิ แล้วยอดจะเข้าทันที</p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setCheckoutStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button type="button" disabled={isProcessing} onClick={handleFinalPaymentSubmit} style={{ flex: 1, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
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
