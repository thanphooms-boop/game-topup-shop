import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------
// เชื่อมต่อ Supabase Cloud Database (ออนไลน์ Realtime)
// ----------------------------------------------------
const SUPABASE_URL = 'https://ytehvwzhjvybbffsbvki.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ENCmPjFJfBuT2hvZkbWUwA_IJNjOSLN';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function GameTopupApp() {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cyber_current_logged_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    return null;
  });

  // ดึงข้อมูล Users & Orders จาก Supabase และเปิดระบบ Realtime ข้ามเครื่อง
  useEffect(() => {
    fetchUsers();
    fetchOrders();

    const ordersChannel = supabase
      .channel('realtime_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    const usersChannel = supabase
      .channel('realtime_users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      setRegisteredUsers(data);
      if (user) {
        const currentUserData = data.find(u => u.username === user.username);
        if (currentUserData) {
          setUser(currentUserData);
          localStorage.setItem('cyber_current_logged_user', JSON.stringify(currentUserData));
        }
      }
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('timestamp', { ascending: false });
    if (!error && data) {
      const mappedOrders = data.map(o => ({
        id: o.id,
        game: o.game,
        package: o.package,
        price: parseFloat(o.price),
        profit: parseFloat(o.profit),
        player: o.player,
        paymentMethod: o.payment_method,
        status: o.status,
        type: o.type,
        time: o.time,
        dateKey: o.date_key,
        timestamp: parseInt(o.timestamp)
      }));
      setOrders(mappedOrders);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cyber_current_logged_user');
    }
  }, [user]);

  const [authMode, setAuthMode] = useState('login');
  const [rememberMe, setRememberMe] = useState(false);
  const [usernameInput, setUsernameInput] = useState(() => localStorage.getItem('cyber_remembered_user') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState('shop');
  const [gameCategory, setGameCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [eventGame, setEventGame] = useState('VALORANT');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventGiftCode, setEventGiftCode] = useState('');
  const [eventMsg, setEventMsg] = useState({ text: '', type: '' });

  const [gamesData] = useState([
    {
      id: 'valorant',
      name: 'VALORANT',
      publisher: 'Riot Games',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิตอันดับ 1 🔥',
      packages: [
        { id: 'v1', name: '125 VP', price: 99, profit: 15, bonus: '+0 VP' },
        { id: 'v2', name: '420 VP', price: 319, profit: 48, bonus: '+15 VP' },
        { id: 'v3', name: '700 VP', price: 529, profit: 80, bonus: '+30 VP' },
        { id: 'v4', name: '1,375 VP', price: 999, profit: 150, bonus: '+80 VP' },
        { id: 'v5', name: '2,400 VP', price: 1750, profit: 260, bonus: '+150 VP 🔥' }
      ]
    },
    {
      id: 'rov',
      name: 'ROV (Arena of Valor)',
      publisher: 'Garena',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต ⚔️',
      packages: [
        { id: 'r1', name: '40 Coupons', price: 35, profit: 5, bonus: '+2 Coupons' },
        { id: 'r2', name: '90 Coupons', price: 75, profit: 11, bonus: '+5 Coupons' },
        { id: 'r3', name: '220 Coupons', price: 175, profit: 26, bonus: '+15 Coupons' },
        { id: 'r4', name: '470 Coupons', price: 350, profit: 52, bonus: '+30 Coupons' }
      ]
    }
  ]);

  const [giftCodes, setGiftCodes] = useState([
    { id: '1', code: 'GIFT2026', game: 'VALORANT', reward: '125 VP', maxUses: 50, usedCount: 2 }
  ]);

  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState('qrcode');
  const [walletStep, setWalletStep] = useState(1);
  const [floatingTimer, setFloatingTimer] = useState(0);

  const [customerOrderSearch, setCustomerOrderSearch] = useState('');
  const [exactSearchQuery, setExactSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  const [adminOrdersPage, setAdminOrdersPage] = useState(1);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('cyber_is_admin_logged') === 'true');
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('cyber_admin_pin') || '123456');
  const [inputAdminPin, setInputAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutPassword, setCheckoutPassword] = useState('');
  const [checkoutPasswordError, setCheckoutPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'wallet', name: 'Cyber Wallet (เครดิตร้าน)', desc: 'หักจากยอดเงินในบัญชีทันที' },
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.' }
  ];

  const EyeIcon = ({ show }) => show ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  );

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${usernameInput},email.eq.${usernameInput}`)
        .eq('password', passwordInput)
        .single();

      if (data && !error) {
        setUser(data);
      } else {
        setAuthError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    } else if (authMode === 'register') {
      if (!emailInput.trim() || !usernameInput.trim() || !regPasswordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทั้ง 4 ช่อง');
        return;
      }
      if (regPasswordInput !== confirmPasswordInput) {
        setAuthError('รหัสผ่านไม่ตรงกัน');
        return;
      }

      const newUser = { username: usernameInput, email: emailInput, password: regPasswordInput, balance: 1800 };
      const { error: regErr } = await supabase.from('users').insert([newUser]);
      
      if (!regErr) {
        setAuthSuccessMsg('สมัครสมาชิกสำเร็จ! กรุณากดเข้าสู่ระบบ');
        setAuthMode('login');
      } else {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cyber_current_logged_user');
    setIsAdminLoggedIn(false);
    setActiveTab('shop');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (inputAdminPin === adminPin) {
      setIsAdminLoggedIn(true);
      setInputAdminPin('');
    } else {
      setAdminPinError('รหัส PIN ไม่ถูกต้อง');
    }
  };

  const handleWalletConfirmPayment = async () => {
    const amt = parseFloat(topupAmount) || 0;
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
      player: user ? user.username : '11',
      payment_method: 'QR PromptPay',
      status: 'รอตรวจสอบ [10s]',
      type: 'wallet',
      time: thaiTime,
      date_key: dateKey,
      timestamp: Date.now()
    };

    await supabase.from('orders').insert([newWalletOrder]);
    setShowTopupWalletModal(false);
    setTopupAmount('');
  };

  const handleFinalPaymentSubmit = async () => {
    const totalPrice = selectedPackage.price * packageQuantity;
    const totalProfit = (selectedPackage.profit || Math.round(selectedPackage.price * 0.15)) * packageQuantity;

    if (selectedPayment.id === 'wallet') {
      const updatedBalance = parseFloat(user.balance) - totalPrice;
      await supabase.from('users').update({ balance: updatedBalance }).eq('username', user.username);
    }

    setIsProcessing(true);
    setTimeout(async () => {
      const newOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: `${selectedPackage.name} (x${packageQuantity} แพ็ก)`,
        price: totalPrice,
        profit: totalProfit,
        player: playerId.trim() || user.username,
        payment_method: selectedPayment.name,
        status: 'รอตรวจสอบ [10s]',
        type: 'game',
        time: thaiTime,
        date_key: dateKey,
        timestamp: Date.now(),
      };

      await supabase.from('orders').insert([newOrder]);
      setIsProcessing(false);
      setShowCheckoutModal(false);
      setSelectedPackage(null);
    }, 1000);
  };

  const handleAdminApproveOrder = async (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    await supabase.from('orders').update({ status: '✅ สำเร็จ (แอดมินอนุมัติแล้ว)' }).eq('id', orderId);

    if (targetOrder.type === 'wallet') {
      const targetUser = registeredUsers.find(u => u.username === targetOrder.player);
      if (targetUser) {
        const newBal = parseFloat(targetUser.balance) + parseFloat(targetOrder.price);
        await supabase.from('users').update({ balance: newBal }).eq('username', targetOrder.player);
      }
    }
  };

  const handleAdminRejectOrder = async (orderId) => {
    await supabase.from('orders').update({ status: '❌ ยกเลิก' }).eq('id', orderId);
  };

  const isUserAdmin = user && (user.username === 'thanphooms@gmail.com' || user.email === 'thanphooms@gmail.com');
  const searchedOrders = orders.filter(o => isUserAdmin ? true : user && o.player.toLowerCase() === user.username.toLowerCase());

  if (!user) {
    return (
      <div style={{ backgroundColor: '#070a12', color: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid #a855f7', borderRadius: '24px', padding: '40px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <h2>CYBER TOPUP</h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>เข้าสู่ระบบร้านเติมเกมอัตโนมัติ</p>
          {authError && <div style={{ color: '#fca5a5', marginBottom: '10px', fontSize: '12px' }}>{authError}</div>}
          {authSuccessMsg && <div style={{ color: '#34d399', marginBottom: '10px', fontSize: '12px' }}>{authSuccessMsg}</div>}
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {authMode === 'register' && <input type="email" placeholder="Email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ padding: '12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }} />}
            <input type="text" placeholder="Username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ padding: '12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }} />
            <input type="password" placeholder="Password" value={authMode === 'login' ? passwordInput : regPasswordInput} onChange={(e) => authMode === 'login' ? setPasswordInput(e.target.value) : setRegPasswordInput(e.target.value)} style={{ padding: '12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }} />
            {authMode === 'register' && <input type="password" placeholder="Confirm Password" value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} style={{ padding: '12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }} />}
            <button type="submit" style={{ padding: '12px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
          </form>
          <p style={{ marginTop: '15px', fontSize: '13px', color: '#9ca3af' }}>
            {authMode === 'login' ? <>ยังไม่มีบัญชี? <span onClick={() => setAuthMode('register')} style={{ color: '#38bdf8', cursor: 'pointer' }}>สมัครสมาชิก</span></> : <>มีบัญชีแล้ว? <span onClick={() => setAuthMode('login')} style={{ color: '#38bdf8', cursor: 'pointer' }}>เข้าสู่ระบบ</span></>}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#070a12', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '60px' }}>
      <header style={{ background: 'rgba(17, 24, 39, 0.9)', padding: '12px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151' }}>
        <h2 style={{ margin: 0, color: '#c084fc', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>CYBER TOPUP</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>👤 {user.username} | 💰 ฿{parseFloat(user.balance).toLocaleString()}</span>
          <button onClick={() => setShowTopupWalletModal(true)} style={{ background: '#9333ea', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>+ เติมเครดิต</button>
          <button onClick={() => setActiveTab('shop')} style={{ background: activeTab === 'shop' ? '#9333ea' : '#1f2937', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>หน้าแรก</button>
          <button onClick={() => setActiveTab('track')} style={{ background: activeTab === 'track' ? '#9333ea' : '#1f2937', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>เช็คสถานะ</button>
          {isUserAdmin && <button onClick={() => setActiveTab('admin')} style={{ background: activeTab === 'admin' ? '#9333ea' : '#1f2937', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>หลังบ้าน</button>}
          <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>ออกจากระบบ</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        {activeTab === 'shop' && !selectedGame && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {gamesData.map((game) => (
              <div key={game.id} onClick={() => { setSelectedGame(game); setPlayerId(user.username); }} style={{ background: '#111827', border: '1px solid #374151', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}>
                <img src={game.image} alt={game.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{game.name}</h3>
                  <button style={{ width: '100%', background: '#9333ea', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', marginTop: '10px' }}>เลือกเติมเงิน</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div style={{ background: '#111827', padding: '30px', borderRadius: '20px', border: '1px solid #374151' }}>
            <button onClick={() => setSelectedGame(null)} style={{ background: 'transparent', border: '1px solid #374151', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>← กลับ</button>
            <h2>{selectedGame.name}</h2>
            <input type="text" placeholder="ID ในเกม..." value={playerId} onChange={(e) => setPlayerId(e.target.value)} style={{ width: '100%', maxWidth: '350px', padding: '10px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '8px', marginBottom: '20px', display: 'block' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {selectedGame.packages.map((pkg) => (
                <div key={pkg.id} onClick={() => setSelectedPackage(pkg)} style={{ background: selectedPackage?.id === pkg.id ? 'rgba(147,51,234,0.3)' : '#030712', border: selectedPackage?.id === pkg.id ? '2px solid #a855f7' : '1px solid #374151', padding: '15px', borderRadius: '12px', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 'bold' }}>{pkg.name}</div>
                  <div style={{ color: '#38bdf8', marginTop: '5px' }}>฿{pkg.price}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>ช่องทางชำระเงิน</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {paymentMethods.map(pm => (
                  <div key={pm.id} onClick={() => setSelectedPayment(pm)} style={{ background: selectedPayment?.id === pm.id ? 'rgba(56,189,248,0.2)' : '#030712', border: selectedPayment?.id === pm.id ? '2px solid #38bdf8' : '1px solid #374151', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>
                    {pm.name}
                  </div>
                ))}
              </div>
            </div>

            <button disabled={!selectedPackage || !selectedPayment} onClick={() => setShowCheckoutModal(true)} style={{ background: '#9333ea', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยืนยันชำระเงิน</button>
          </div>
        )}

        {activeTab === 'track' && (
          <div style={{ background: '#111827', padding: '30px', borderRadius: '20px' }}>
            <h2>📋 เช็คสถานะคำสั่งซื้อ</h2>
            {searchedOrders.map((ord, idx) => (
              <div key={idx} style={{ background: '#030712', padding: '15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div><b>{ord.id}</b> - {ord.game} ({ord.package})</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>ผู้ทำ: {ord.player} | เวลา: {ord.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#34d399', fontWeight: 'bold' }}>฿{ord.price}</div>
                  <div style={{ fontSize: '12px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b' }}>{ord.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'admin' && isUserAdmin && (
          <div style={{ background: '#111827', padding: '30px', borderRadius: '20px' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '300px', margin: '0 auto', textAlign: 'center' }}>
                <h3>รหัส PIN แอดมิน</h3>
                {adminPinError && <div style={{ color: '#fca5a5', fontSize: '12px' }}>{adminPinError}</div>}
                <form onSubmit={handleAdminLogin}>
                  <input type="password" maxLength={6} placeholder="PIN 6 หลัก" value={inputAdminPin} onChange={(e) => setInputAdminPin(e.target.value)} style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '8px', textAlign: 'center', marginBottom: '10px' }} />
                  <button type="submit" style={{ width: '100%', padding: '10px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '8px' }}>เข้าสู่ระบบ</button>
                </form>
              </div>
            ) : (
              <div>
                <h2>⚙️ จัดการออร์เดอร์หลังบ้าน (Realtime)</h2>
                {orders.map((ord, idx) => (
                  <div key={idx} style={{ background: '#030712', padding: '15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div><b>{ord.id}</b> - {ord.game} ({ord.package})</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>ลูกค้า: {ord.player} | ยอด: ฿{ord.price}</div>
                    </div>
                    <div>
                      {ord.status.includes('รอตรวจสอบ') ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleAdminApproveOrder(ord.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>อนุมัติ</button>
                          <button onClick={() => handleAdminRejectOrder(ord.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>ยกเลิก</button>
                        </div>
                      ) : (
                        <span style={{ color: '#34d399', fontSize: '13px' }}>{ord.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111827', padding: '30px', borderRadius: '20px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <h3>ยืนยันการสั่งซื้อ</h3>
            <p>ยอดชำระ: ฿{(selectedPackage?.price * packageQuantity).toLocaleString()}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowCheckoutModal(false)} style={{ flex: 1, padding: '10px', background: '#374151', color: '#fff', border: 'none', borderRadius: '8px' }}>ยกเลิก</button>
              <button onClick={handleFinalPaymentSubmit} style={{ flex: 1, padding: '10px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '8px' }}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {showTopupWalletModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111827', padding: '30px', borderRadius: '20px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <h3>เติมเครดิตร้าน</h3>
            <input type="text" placeholder="จำนวนเงิน..." value={topupAmount} onChange={(e) => setTopupAmount(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '8px', textAlign: 'center', margin: '15px 0' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowTopupWalletModal(false)} style={{ flex: 1, padding: '10px', background: '#374151', color: '#fff', border: 'none', borderRadius: '8px' }}>ยกเลิก</button>
              <button onClick={handleWalletConfirmPayment} style={{ flex: 1, padding: '10px', background: '#9333ea', color: '#fff', border: '1px solid #fff', borderRadius: '8px' }}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
