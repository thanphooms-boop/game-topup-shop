import React, { useState } from 'react';

export default function GameTopupApp() {
  // Authentication State
  const [user, setUser] = useState(null); // null = not logged in
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
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

  // Topup Wallet State
  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState('qrcode');
  const [isWalletProcessing, setIsWalletProcessing] = useState(false);
  const [walletPaymentStep, setWalletPaymentStep] = useState(1); // 1: Input Amount, 2: Pay, 3: Success

  // Payment Input States for Checkout
  const [trueWalletNumber, setTrueWalletNumber] = useState('');
  const [trueCashCardPin, setTrueCashCardPin] = useState('');

  // Order Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

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

  const [orders, setOrders] = useState([
    { id: 'ORD-23664', game: 'VALORANT', package: '4,050 VP', price: 2790, player: '11', status: 'สำเร็จ', time: '29/10/69 13:54 น.' },
    { id: 'ORD-98421', game: 'VALORANT', package: '420 VP', price: 319, player: 'CyberNinja#1234', status: 'สำเร็จ', time: '29/10/2569 13:10 น.' },
    { id: 'ORD-98420', game: 'ROV', package: '220 Coupons', price: 175, player: 'ProPlayer99', status: 'สำเร็จ', time: '29/10/2569 12:45 น.' }
  ]);

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
      setUser({
        username: usernameInput,
        email: 'user@example.com',
        balance: 1000
      });
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
      setUser({
        username: usernameInput,
        email: emailInput,
        balance: 1000
      });
    } else if (authMode === 'forgot') {
      if (!isOtpSent) {
        if (!emailInput.trim() || !emailInput.includes('@')) {
          setAuthError('กรุณากรอก Email ที่ใช้สมัครสมาชิก');
          return;
        }
        setIsOtpSent(true);
        setAuthSuccessMsg(`ส่งรหัสยืนยัน OTP ไปยัง ${emailInput} แล้ว`);
      } else {
        if (!otpInput.trim() || !newPasswordInput.trim()) {
          setAuthError('กรุณากรอกรหัส OTP และรหัสผ่านใหม่');
          return;
        }
        setAuthSuccessMsg('เปลี่ยนรหัสผ่านสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสใหม่');
        setTimeout(() => {
          setAuthMode('login');
          setIsOtpSent(false);
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
    setConfirmPasswordInput('');
    setEmailInput('');
  };

  // Wallet Topup Flow Handlers
  const handleWalletNextStep = () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }
    setWalletPaymentStep(2);
  };

  const handleWalletConfirmPayment = () => {
    setIsWalletProcessing(true);
    setTimeout(() => {
      const amt = parseFloat(topupAmount);
      setUser(prev => ({
        ...prev,
        balance: prev.balance + amt
      }));
      setIsWalletProcessing(false);
      setWalletPaymentStep(3);
    }, 1500);
  };

  const resetWalletModal = () => {
    setShowTopupWalletModal(false);
    setWalletPaymentStep(1);
    setTopupAmount('');
    setIsWalletProcessing(false);
  };

  // Checkout Handler
  const handleCheckout = () => {
    if (!selectedGame || !playerId || !selectedPackage || !selectedPayment) return;

    if (selectedPayment.id === 'wallet') {
      if (user.balance < selectedPackage.price) {
        alert('ยอดเงินใน Cyber Wallet ของคุณไม่พอ กรุณาเติมเงินเข้าระบบก่อนครับ');
        return;
      }
      setUser(prev => ({ ...prev, balance: prev.balance - selectedPackage.price }));
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const newOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const thaiTime = now.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: selectedPackage.name,
        price: selectedPackage.price,
        player: playerId,
        status: 'สำเร็จ',
        time: thaiTime
      };

      setOrders([newOrder, ...orders]);
      setIsProcessing(false);
      setOrderSuccess(newOrderId);
      setCardNumber('');
      setCardExp('');
      setCardCvv('');
      setTrueWalletNumber('');
      setTrueCashCardPin('');
    }, 1200);
  };

  const filteredGames = gamesData.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          game.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(ord => 
    ord.player.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
    ord.id.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  // 1. LOGIN / REGISTER / FORGOT PASSWORD SCREEN
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
          {/* LOGO ICON */}
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 15px auto',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(56,189,248,0.2))',
            border: '2px solid #a855f7',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V6L12 2Z" fill="url(#shield-grad-login)" stroke="#c084fc" strokeWidth="1.5" />
              <path d="M7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11Z" fill="#38bdf8" />
              <path d="M17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.5523 13 18 12.5523 18 12C18 11.4477 17.523 11 17 11Z" fill="#38bdf8" />
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
            {authMode === 'login' && 'เข้าสู่ระบบส่วนตัวเพื่อรับโปรโมชันพิเศษ'}
            {authMode === 'register' && 'สมัครสมาชิกใหม่ ยืนยันผ่าน Email'}
            {authMode === 'forgot' && 'กู้คืนรหัสผ่านด้วย Email สมาชิก'}
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

            {/* EMAIL INPUT FOR REGISTER & FORGOT (MOVED TO TOP FOR REGISTER) */}
            {(authMode === 'register' || authMode === 'forgot') && (
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

            {/* USERNAME INPUT FOR LOGIN & REGISTER */}
            {authMode !== 'forgot' && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อผู้ใช้งาน (Username)</label>
                <input 
                  type="text" 
                  placeholder="กรอกชื่อผู้ใช้..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* PASSWORD INPUT FOR LOGIN & REGISTER */}
            {authMode !== 'forgot' && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af' }}>รหัสผ่าน (Password)</label>
                  {authMode === 'login' && (
                    <span 
                      onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccessMsg(''); }} 
                      style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer' }}
                    >
                      ลืมรหัสผ่าน?
                    </span>
                  )}
                </div>
                <input 
                  type="password" 
                  placeholder="กรอกรหัสผ่าน..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* CONFIRM PASSWORD INPUT FOR REGISTER */}
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

            {/* FORGOT PASSWORD EXTRA INPUTS */}
            {authMode === 'forgot' && isOtpSent && (
              <>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>รหัส OTP จากอีเมล</label>
                  <input 
                    type="text" 
                    placeholder="กรอกรหัส OTP 6 หลัก..."
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
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
              </>
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
              {authMode === 'forgot' && (!isOtpSent ? 'ส่งรหัสยืนยันเข้า Email' : 'ยืนยันการเปลี่ยนรหัสผ่าน')}
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
              <span onClick={() => { setAuthMode('login'); setIsOtpSent(false); setAuthError(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>← กลับไปหน้าเข้าสู่ระบบ</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN APPLICATION (LOGGED IN)
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
            justify: 'center',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V6L12 2Z" fill="url(#shield-grad)" stroke="#c084fc" strokeWidth="1.5" />
              <path d="M7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11Z" fill="#38bdf8" />
              <path d="M17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.5523 13 18 12.5523 18 12C18 11.4477 17.523 11 17 11Z" fill="#38bdf8" />
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
              onClick={() => { setShowTopupWalletModal(true); setWalletPaymentStep(1); }}
              style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + เติมเครดิต
            </button>
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>✨ หน้าแรก</button>
            <button onClick={() => setActiveTab('track')} style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>📋 เช็คสถานะ</button>
            <button onClick={() => setActiveTab('admin')} style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>⚙️ หลังบ้าน</button>
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
                  onClick={() => { setSelectedGame(game); setSelectedPackage(null); }}
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

              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>สรุปคำสั่งซื้อ</h3>

                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>เกม:</span> <span>{selectedGame.name}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>ID ผู้เล่น:</span> <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{playerId || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>แพ็กเกจ:</span> <span>{selectedPackage ? selectedPackage.name : '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9ca3af' }}>ช่องทางชำระ:</span> <span>{selectedPayment ? selectedPayment.name : '-'}</span></div>
                </div>

                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>ยอดชำระ:</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#34d399' }}>฿{selectedPackage ? selectedPackage.price : '0'}</span>
                </div>

                <button 
                  disabled={!playerId || !selectedPackage || !selectedPayment}
                  onClick={() => setShowCheckoutModal(true)}
                  style={{ width: '100%', backgroundColor: (!playerId || !selectedPackage || !selectedPayment) ? '#374151' : '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: (!playerId || !selectedPackage || !selectedPayment) ? 'not-allowed' : 'pointer' }}
                >
                  ยืนยันการชำระเงิน
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'track' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '30px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>เช็คสถานะการเติมเงิน</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>กรอกเลขออร์เดอร์ (เช่น ORD-98421) หรือชื่อผู้เล่นเพื่อตรวจสอบ</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
              <input 
                type="text"
                placeholder="กรอกเลขออร์เดอร์ หรือ Player ID..."
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                style={{ flex: 1, backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none' }}
              />
              <button 
                onClick={() => {
                  const found = orders.find(o => o.id.toLowerCase().includes(trackQuery.toLowerCase()) || o.player.toLowerCase().includes(trackQuery.toLowerCase()));
                  setTrackResult(found || { notFound: true });
                }}
                style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ค้นหา
              </button>
            </div>

            {trackResult && !trackResult.notFound && (
              <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 'bold' }}>{trackResult.id}</span>
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>✓ {trackResult.status} ({trackResult.time})</span>
                </div>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>เกม: <b>{trackResult.game}</b></div>
                  <div>แพ็กเกจ: <b>{trackResult.package}</b></div>
                  <div>ผู้เล่น: <b style={{ color: '#c084fc' }}>{trackResult.player}</b></div>
                  <div>ยอดเงิน: <b style={{ color: '#34d399' }}>฿{trackResult.price}</b></div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0' }}>ระบบหลังบ้าน Admin</h2>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px' }}>กรอก PIN 6 หลักเพื่อเข้าสู่ระบบ (รหัสทดสอบ: 123456)</p>

                <input 
                  type="password"
                  maxLength={6}
                  placeholder="PIN 6 หลัก"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', marginBottom: '15px', boxSizing: 'border-box' }}
                />

                <button 
                  onClick={() => {
                    if (adminPin === '123456') setIsAdminLoggedIn(true);
                  }}
                  style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📊 รายการคำสั่งซื้อทั้งหมดของลูกค้า</h2>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>ตรวจสอบเกมที่ลูกค้าเติม แพ็กเกจ และเวลาไทยแบบเรียลไทม์</p>
                  </div>
                  <button onClick={() => setIsAdminLoggedIn(false)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>ออกจากระบบ</button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="text"
                    placeholder="🔍 ค้นหาด้วย Player ID หรือเลขออร์เดอร์ (เช่น 11 หรือ ORD-...)..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord, idx) => (
                      <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>{ord.game} ({ord.package})</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            ผู้เล่น ID: <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{ord.player}</span> | เวลาเติม (ไทย): <span style={{ color: '#38bdf8' }}>{ord.time}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price}</div>
                          <span style={{ fontSize: '10px', backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{ord.status}</span>
                        </div>
                      </div>
                    ))
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

      {/* MODAL 1: TOPUP STORE WALLET WITH PAYMENT PROCESS */}
      {showTopupWalletModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center' }}>
            
            {walletPaymentStep === 1 && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>💳 เติมเครดิตเข้า Cyber Wallet</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>ขั้นตอนที่ 1: กรอกจำนวนเงินที่ต้องการเติม</p>

                <input 
                  type="number"
                  placeholder="ระบุจำนวนเงิน (บาท)..."
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', fontSize: '20px', textAlign: 'center', fontWeight: 'bold', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
                />

                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>เลือกช่องทางชำระเงินเติมเครดิต</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => setWalletPaymentMethod('qrcode')} 
                      style={{ backgroundColor: walletPaymentMethod === 'qrcode' ? 'rgba(147, 51, 234, 0.3)' : '#030712', border: walletPaymentMethod === 'qrcode' ? '2px solid #9333ea' : '1px solid #374151', color: '#ffffff', padding: '10px 14px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}
                    >
                      📱 QR PromptPay (สแกนจ่ายทันที)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setWalletPaymentMethod('true')} 
                      style={{ backgroundColor: walletPaymentMethod === 'true' ? 'rgba(147, 51, 234, 0.3)' : '#030712', border: walletPaymentMethod === 'true' ? '2px solid #9333ea' : '1px solid #374151', color: '#ffffff', padding: '10px 14px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}
                    >
                      🧡 TrueMoney Wallet
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button onClick={handleWalletNextStep} style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ดำเนินการชำระเงิน →</button>
                </div>
              </div>
            )}

            {walletPaymentStep === 2 && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#34d399' }}>ชำระเงินเพื่อเติมเครดิต</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>ขั้นตอนที่ 2: สแกน/ชำระเงิน <b>฿{parseFloat(topupAmount).toLocaleString()}</b></p>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '180px', height: '180px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold' }}>
                    {walletPaymentMethod === 'qrcode' ? 'QR PromptPay' : 'TrueMoney QR'}<br/>
                    <span style={{ fontSize: '18px', color: '#9333ea' }}>฿{parseFloat(topupAmount).toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: '#c084fc', marginBottom: '20px' }}>*เมื่อชำระเงินเสร็จแล้ว กดปุ่ม "ฉันชำระเงินเรียบร้อยแล้ว" ด้านล่าง</p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setWalletPaymentStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button onClick={handleWalletConfirmPayment} style={{ flex: 1, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isWalletProcessing ? 'กำลังตรวจสอบ...' : 'ฉันชำระเงินเรียบร้อยแล้ว'}
                  </button>
                </div>
              </div>
            )}

            {walletPaymentStep === 3 && (
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399', margin: '0 0 10px 0' }}>เติมเครดิตร้านสำเร็จ!</h3>
                <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '20px' }}>
                  เพิ่มเครดิต <b>+฿{parseFloat(topupAmount).toLocaleString()}</b> เข้าบัญชีของคุณเรียบร้อยแล้ว
                </p>
                <button onClick={resetWalletModal} style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ตกลง</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: GAME CHECKOUT */}
      {showCheckoutModal && selectedGame && selectedPackage && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #9333ea', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 20px 50px rgba(147,51,234,0.3)' }}>
            {!orderSuccess ? (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                  {selectedPayment.id === 'wallet' && 'ชำระด้วย Cyber Wallet'}
                  {selectedPayment.id === 'true' && '🧡 ชำระผ่าน TrueMoney Wallet'}
                  {selectedPayment.id === 'truemoney' && '🎫 ชำระด้วยบัตรเงินสดทรูมันนี่'}
                  {selectedPayment.id === 'card' && '💳 บัตรเครดิต / เดบิต'}
                  {selectedPayment.id === 'qrcode' && '📱 สแกน QR PromptPay'}
                </h3>

                {selectedPayment.id === 'wallet' ? (
                  <div style={{ backgroundColor: '#030712', border: '1px solid #34d399', borderRadius: '16px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>ยอดเงินคงเหลือใน Cyber Wallet</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', margin: '4px 0 10px 0' }}>฿{user.balance.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#ffffff', borderTop: '1px dashed #374151', paddingTop: '10px' }}>
                      หักค่าเติมเกม: <b style={{ color: '#fca5a5' }}>-฿{selectedPackage.price}</b>
                    </div>
                  </div>
                ) : selectedPayment.id === 'true' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', textAlign: 'left' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>กรอกเบอร์โทรศัพท์ TrueMoney Wallet ของคุณเพื่อทำรายการ:</p>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>เบอร์มือถือวอลเล็ต (10 หลัก)</label>
                      <input 
                        type="text"
                        maxLength={10}
                        placeholder="0891234567"
                        value={trueWalletNumber}
                        onChange={(e) => setTrueWalletNumber(e.target.value)}
                        style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#34d399', textAlign: 'center' }}>
                      ยอดชำระสุทธิ: <b>฿{selectedPackage.price}</b>
                    </div>
                  </div>
                ) : selectedPayment.id === 'truemoney' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', textAlign: 'left' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>กรอกรหัสบัตรเงินสดทรูมันนี่ (14 หลัก) [หักค่าธรรมเนียม 14.5%]:</p>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>รหัสบัตรเงินสด 14 หลัก</label>
                      <input 
                        type="text"
                        maxLength={14}
                        placeholder="xxxxxxxxxxxxxx"
                        value={trueCashCardPin}
                        onChange={(e) => setTrueCashCardPin(e.target.value)}
                        style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#34d399', textAlign: 'center' }}>
                      ยอดชำระแพ็กเกจ: <b>฿{selectedPackage.price}</b>
                    </div>
                  </div>
                ) : selectedPayment.id === 'card' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', textAlign: 'left' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>หมายเลขบัตร (16 หลัก)</label>
                      <input 
                        type="text"
                        maxLength={19}
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>วันหมดอายุ (MM/YY)</label>
                        <input 
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>รหัส CVV</label>
                        <input 
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '180px', height: '180px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold' }}>{selectedPayment.name}<br/>฿{selectedPackage.price}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowCheckoutModal(false)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button 
                    disabled={
                      (selectedPayment.id === 'card' && (!cardNumber || !cardExp || !cardCvv)) ||
                      (selectedPayment.id === 'true' && !trueWalletNumber) ||
                      (selectedPayment.id === 'truemoney' && !trueCashCardPin)
                    }
                    onClick={handleCheckout} 
                    style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isProcessing ? 'กำลังชำระเงิน...' : 'ชำระเงินทันที'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399', margin: '0 0 10px 0' }}>เติมเงินสำเร็จ!</h3>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>เลขออร์เดอร์ของคุณคือ <b style={{ color: '#c084fc' }}>{orderSuccess}</b></p>
                <button onClick={() => { setShowCheckoutModal(false); setOrderSuccess(null); setSelectedGame(null); }} style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>กลับสู่หน้าหลัก</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
