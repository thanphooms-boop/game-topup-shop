import React, { useState, useEffect } from 'react';

export default function GameTopupApp() {
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('cyber_topup_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { username: 'thanphooms@gmail.com', email: 'thanphooms@gmail.com', password: '0638801739Ss_@1', balance: 99999 },
      { username: '11', email: 'user11@example.com', password: '11', balance: 1800 },
      { username: '22', email: 'user22@example.com', password: '22', balance: 1500 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cyber_topup_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // ปรับปรุง: โหลดสถานะ User จาก localStorage เพื่อไม่ให้หลุดตอนกด F5
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cyber_current_logged_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('cyber_current_logged_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cyber_current_logged_user');
    }
  }, [user]);

  const [authMode, setAuthMode] = useState('login');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem('cyber_remembered_user') || '';
  });
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

  const [globalRedeemedPlayers, setGlobalRedeemedPlayers] = useState(() => {
    const saved = localStorage.getItem('cyber_global_redeemed_players');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['22'];
  });

  useEffect(() => {
    localStorage.setItem('cyber_global_redeemed_players', JSON.stringify(globalRedeemedPlayers));
  }, [globalRedeemedPlayers]);

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
        { id: 'v5', name: '2,400 VP', price: 1750, profit: 260, bonus: '+150 VP 🔥' },
        { id: 'v6', name: '4,000 VP (Big Pack)', price: 2850, profit: 420, bonus: '+300 VP VIP ⭐' },
        { id: 'v7', name: '8,500 VP (Whale Pack)', price: 5900, profit: 900, bonus: '+700 VP VIP 👑' }
      ]
    },
    {
      id: 'genshin',
      name: 'Genshin Impact',
      publisher: 'HoYoverse',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต ✨',
      packages: [
        { id: 'g1', name: '60 Genesis Crystals', price: 35, profit: 5, bonus: '+0' },
        { id: 'g2', name: '300 Genesis Crystals', price: 179, profit: 27, bonus: '+10' },
        { id: 'g3', name: '980 Genesis Crystals', price: 549, profit: 82, bonus: '+40' },
        { id: 'g4', name: '1,980 Genesis Crystals', price: 1050, profit: 158, bonus: '+110' },
        { id: 'g5', name: '3,280 Genesis Crystals', price: 1750, profit: 260, bonus: '+260 🔥' },
        { id: 'g6', name: '6,480 Genesis Crystals', price: 3390, profit: 500, bonus: '+1,600 VIP 👑' }
      ]
    },
    {
      id: 'avatarstar',
      name: 'Avatar Star',
      publisher: 'Cubinet / AS Global',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดนิยม ⚡',
      packages: [
        { id: 'as1', name: '300 Diamonds', price: 90, profit: 14, bonus: '+0' },
        { id: 'as2', name: '1,000 Diamonds', price: 300, profit: 45, bonus: '+50' },
        { id: 'as3', name: '2,100 Diamonds', price: 600, profit: 90, bonus: '+150' },
        { id: 'as4', name: '3,600 Diamonds', price: 1000, profit: 150, bonus: '+300' },
        { id: 'as5', name: '7,500 Diamonds', price: 2000, profit: 300, bonus: '+800 🔥' },
        { id: 'as6', name: '16,000 Diamonds (Super VIP)', price: 4000, profit: 600, bonus: '+2,000 👑' }
      ]
    },
    {
      id: 'lol',
      name: 'League of Legends',
      publisher: 'Riot Games',
      category: 'pc',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80',
      badge: 'แนะนำ 🏆',
      packages: [
        { id: 'l1', name: '575 RP', price: 150, profit: 22, bonus: '+0 RP' },
        { id: 'l2', name: '1,380 RP', price: 350, profit: 52, bonus: '+30 RP' },
        { id: 'l3', name: '2,800 RP', price: 700, profit: 105, bonus: '+100 RP' },
        { id: 'l4', name: '5,000 RP', price: 1250, profit: 188, bonus: '+250 RP 🔥' },
        { id: 'l5', name: '11,000 RP (Ultra Pack)', price: 2600, profit: 390, bonus: '+700 RP 👑' }
      ]
    },
    {
      id: 'pubg',
      name: 'PUBG Mobile',
      publisher: 'Level Infinite',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต 🔫',
      packages: [
        { id: 'p1', name: '60 UC', price: 29, profit: 4, bonus: '+0 UC' },
        { id: 'p2', name: '325 UC', price: 149, profit: 22, bonus: '+15 UC' },
        { id: 'p3', name: '660 UC', price: 299, profit: 45, bonus: '+50 UC' },
        { id: 'p4', name: '1,800 UC', price: 799, profit: 120, bonus: '+150 UC 🔥' },
        { id: 'p5', name: '3,850 UC', price: 1600, profit: 240, bonus: '+350 UC ⭐' },
        { id: 'p6', name: '8,100 UC (Whale Pack)', price: 3200, profit: 480, bonus: '+900 UC 👑' }
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
        { id: 'r4', name: '470 Coupons', price: 350, profit: 52, bonus: '+30 Coupons' },
        { id: 'r5', name: '950 Coupons', price: 700, profit: 105, bonus: '+80 Coupons 🔥' },
        { id: 'r6', name: '2,700 Coupons (Big Pack)', price: 1800, profit: 270, bonus: '+250 Coupons 👑' }
      ]
    },
    {
      id: 'freefire',
      name: 'Free Fire',
      publisher: 'Garena',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=500&q=80',
      badge: 'ยอดฮิต 💎',
      packages: [
        { id: 'ff1', name: '110 Diamonds', price: 35, profit: 5, bonus: '+5' },
        { id: 'ff2', name: '341 Diamonds', price: 105, profit: 15, bonus: '+20' },
        { id: 'ff3', name: '572 Diamonds', price: 175, profit: 26, bonus: '+40' },
        { id: 'ff4', name: '1,160 Diamonds', price: 350, profit: 52, bonus: '+90 🔥' },
        { id: 'ff5', name: '2,390 Diamonds', price: 700, profit: 105, bonus: '+200 ⭐' },
        { id: 'ff6', name: '6,000 Diamonds (VIP Mega)', price: 1700, profit: 255, bonus: '+600 👑' }
      ]
    },
    {
      id: 'hsr',
      name: 'Honkai: Star Rail',
      publisher: 'HoYoverse',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80',
      badge: 'แนะนำ 🚀',
      packages: [
        { id: 'h1', name: '60 Oneiric Shard', price: 35, profit: 5, bonus: '+0' },
        { id: 'h2', name: '300 Oneiric Shard', price: 179, profit: 27, bonus: '+30' },
        { id: 'h3', name: '980 Oneiric Shard', price: 549, profit: 82, bonus: '+110' },
        { id: 'h4', name: '1,980 Oneiric Shard', price: 1050, profit: 158, bonus: '+260 🔥' },
        { id: 'h5', name: '3,280 Oneiric Shard', price: 1750, profit: 260, bonus: '+600 ⭐' },
        { id: 'h6', name: '6,480 Oneiric Shard', price: 3390, profit: 500, bonus: '+1,600 👑' }
      ]
    },
    {
      id: 'fcmobile',
      name: 'EA SPORTS FC Mobile',
      publisher: 'ELECTRONIC ARTS',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80',
      badge: 'มาใหม่ ⚽',
      packages: [
        { id: 'fc1', name: '100 FC Points', price: 35, profit: 5, bonus: '+0' },
        { id: 'fc2', name: '520 FC Points', price: 179, profit: 27, bonus: '+20' },
        { id: 'fc3', name: '1,070 FC Points', price: 350, profit: 52, bonus: '+70' },
        { id: 'fc4', name: '2,200 FC Points', price: 700, profit: 105, bonus: '+180 🔥' },
        { id: 'fc5', name: '5,750 FC Points (Pro Pack)', price: 1750, profit: 260, bonus: '+550 👑' }
      ]
    }
  ]);

  const [giftCodes, setGiftCodes] = useState(() => {
    const savedCodes = localStorage.getItem('cyber_gift_codes');
    if (savedCodes) {
      try { return JSON.parse(savedCodes); } catch (e) {}
    }
    return [
      { id: '1', code: 'GIFT2026', game: 'VALORANT', reward: '125 VP', maxUses: 50, usedCount: 2 },
      { id: '2', code: 'FREE500', game: 'Avatar Star', reward: '1,000 Diamonds', maxUses: 20, usedCount: 1 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cyber_gift_codes', JSON.stringify(giftCodes));
  }, [giftCodes]);

  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeGame, setNewCodeGame] = useState('VALORANT');
  const [newCodeReward, setNewCodeReward] = useState('125 VP');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(10);
  const [adminCodeMsg, setAdminCodeMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const found = gamesData.find(g => g.name === newCodeGame);
    if (found && found.packages.length > 0) {
      setNewCodeReward(found.packages[0].name);
    }
  }, [newCodeGame, gamesData]);

  const [showTopupWalletModal, setShowTopupWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [walletPaymentMethod, setWalletPaymentMethod] = useState('qrcode');
  const [walletStep, setWalletStep] = useState(1);
  const [walletTimeLeft, setWalletTimeLeft] = useState(180);
  const [isWalletQrExpired, setIsWalletQrExpired] = useState(false);

  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [trueMoneyOtpStep, setTrueMoneyOtpStep] = useState(false);
  const [trueMoneyOtpCode, setTrueMoneyOtpCode] = useState('');
  const [trueMoneyOtpError, setTrueMoneyOtpError] = useState('');

  const [truemoneyCard14, setTruemoneyCard14] = useState('');
  const [creditCardNum, setCreditCardNum] = useState('');
  const [creditCardExp, setCreditCardExp] = useState('');
  const [creditCardCvv, setCreditCardCvv] = useState('');

  const handleCreditCardNumChange = (e) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 16) raw = raw.slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || '';
    setCreditCardNum(formatted);
  };

  const handleCreditCardExpChange = (e) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 4) raw = raw.slice(0, 4);
    if (raw.length >= 3) {
      setCreditCardExp(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCreditCardExp(raw);
    }
  };

  const [floatingTimer, setFloatingTimer] = useState(0);

  const [customerOrderSearch, setCustomerOrderSearch] = useState('');
  const [exactSearchQuery, setExactSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [customerOrdersPage, setCustomerOrdersPage] = useState(1);

  const [adminOrdersPage, setAdminOrdersPage] = useState(1);

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('cyber_topup_orders');
    if (savedOrders) {
      try { return JSON.parse(savedOrders); } catch (e) {}
    }
    return [
      { id: 'ORD-14969', game: 'Avatar Star', package: '16,000 Diamonds (Super VIP)', price: 4000, profit: 600, player: 'thanphooms@gmail.com', paymentMethod: 'QR PromptPay', status: '✅ สำเร็จ (แอดมินอนุมัติแล้ว)', type: 'game', time: '30/10/2026 11:01 น.', dateKey: '2026-10-30', timestamp: Date.now() - 50000 },
      { id: 'ORD-98214', game: 'VALORANT', package: '700 VP', price: 529, profit: 80, player: 'thanphooms@gmail.com', paymentMethod: 'Cyber Wallet (เครดิตร้าน)', status: '✅ สำเร็จ (แอดมินอนุมัติแล้ว)', type: 'game', time: '28/10/2026 14:20 น.', dateKey: '2026-10-28', timestamp: Date.now() - 100000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cyber_topup_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOrders(prevOrders => {
        let hasChanges = false;
        const updated = prevOrders.map(ord => {
          if (ord.status && ord.status.startsWith('รอตรวจสอบ') && ord.timestamp) {
            const elapsed = Math.floor((now - ord.timestamp) / 1000);
            if (elapsed >= 10) {
              hasChanges = true;
              if (ord.type === 'wallet') {
                setUser(prevU => prevU ? { ...prevU, balance: prevU.balance + ord.price } : prevU);
                setRegisteredUsers(prevList =>
                  prevList.map(u => u.username === ord.player ? { ...u, balance: u.balance + ord.price } : u)
                );
              }
              return { ...ord, status: '✅ สำเร็จ (ระบบอนุมัติอัตโนมัติ 10s)' };
            }
          }
          return ord;
        });
        return hasChanges ? updated : prevOrders;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ปรับปรุง: โหลดสถานะ isAdminLoggedIn จาก localStorage
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('cyber_is_admin_logged') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cyber_is_admin_logged', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('cyber_admin_pin') || '123456';
  });
  const [inputAdminPin, setInputAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [changePinMessage, setChangePinMessage] = useState({ text: '', type: '' });

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutPassword, setCheckoutPassword] = useState('');
  const [showCheckoutPassword, setShowCheckoutPassword] = useState(false);
  const [checkoutPasswordError, setCheckoutPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isQrExpired, setIsQrExpired] = useState(false);

  const [adPlatform, setAdPlatform] = useState('Facebook Ads');
  const [adAmountInput, setAdAmountInput] = useState('');
  const [adPage, setAdPage] = useState(1);
  const [adPromotions, setAdPromotions] = useState(() => {
    const savedPromos = localStorage.getItem('cyber_ad_promotions_list');
    if (savedPromos) {
      try { return JSON.parse(savedPromos); } catch (e) {}
    }
    return [
      { id: '1', platform: 'Facebook Ads', amount: 1500, time: '30/10/2026 14:00 น.' },
      { id: '2', platform: 'TikTok Ads', amount: 1000, time: '29/10/2026 10:30 น.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cyber_ad_promotions_list', JSON.stringify(adPromotions));
  }, [adPromotions]);

  const adExpense = adPromotions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleAddAdPromotion = (e) => {
    e.preventDefault();
    const amt = parseFloat(adAmountInput);
    if (isNaN(amt) || amt <= 0) {
      alert('กรุณากรอกจำนวนเงินโฆษณาให้ถูกต้อง');
      return;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const newItem = {
      id: Date.now().toString(),
      platform: adPlatform,
      amount: amt,
      time: thaiTime
    };

    setAdPromotions([newItem, ...adPromotions]);
    setAdAmountInput('');
    setAdPage(1);
  };

  const handleDeleteAdPromotion = (id) => {
    setAdPromotions(adPromotions.filter(item => item.id !== id));
  };

  const adItemsPerPage = 5;
  const totalAdPages = Math.ceil(adPromotions.length / adItemsPerPage) || 1;
  const paginatedAdPromotions = adPromotions.slice((adPage - 1) * adItemsPerPage, adPage * adItemsPerPage);

  const totalAdminSales = orders.reduce((sum, ord) => sum + (ord.type === 'game' ? ord.price : 0), 0);
  const totalAdminProfits = orders.reduce((sum, ord) => sum + (ord.profit || 0), 0);

  const netProfitAfterAd = Math.max(0, totalAdminProfits - (parseFloat(adExpense) || 0));

  const isVatThresholdReached = totalAdminSales >= 1800000;
  const totalAdminVat = isVatThresholdReached ? Math.round(netProfitAfterAd * 0.07) : 0;

  const profitForTaxCalculation = netProfitAfterAd - totalAdminVat;
  const taxableIncome = Math.max(0, profitForTaxCalculation - 150000);

  let calculatedTax = 0;
  if (taxableIncome > 0 && taxableIncome <= 150000) {
    calculatedTax = taxableIncome * 0.05;
  } else if (taxableIncome > 150000 && taxableIncome <= 350000) {
    calculatedTax = 7500 + (taxableIncome - 150000) * 0.10;
  } else if (taxableIncome > 350000 && taxableIncome <= 600000) {
    calculatedTax = 27500 + (taxableIncome - 350000) * 0.15;
  } else if (taxableIncome > 600000) {
    calculatedTax = 65000 + (taxableIncome - 600000) * 0.20;
  }
  const totalAdminTax = Math.round(calculatedTax);

  const paymentMethods = [
    { id: 'wallet', name: 'Cyber Wallet (เครดิตร้าน)', desc: 'หักจากยอดเงินในบัญชีทันที' },
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'โอนผ่านเบอร์วอลเล็ต 10 หลัก พร้อม OTP' },
    { id: 'truemoneycard', name: 'บัตรเติมเงินทรูมันนี่', desc: 'เติมด้วยรหัสบัตร 14 หลัก' },
    { id: 'credit', name: 'บัตรเครดิต / เดบิต', desc: 'ชำระผ่านบัตรปลอดภัย' }
  ];

  const EyeIcon = ({ show }) => show ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

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
    let fTimer;
    if (floatingTimer > 0) {
      fTimer = setInterval(() => {
        setFloatingTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(fTimer);
  }, [floatingTimer]);

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
      if (!emailInput.trim() || !usernameInput.trim() || !regPasswordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทั้ง 4 ช่อง');
        return;
      }
      if (!emailInput.includes('@')) {
        setAuthError('รูปแบบ Email ไม่ถูกต้อง');
        return;
      }
      if (regPasswordInput !== confirmPasswordInput) {
        setAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }

      const isExist = registeredUsers.some((u) => u.username === usernameInput);
      if (isExist) {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น');
        return;
      }

      const newUser = { username: usernameInput, email: emailInput, password: regPasswordInput, balance: 1800 };
      setRegisteredUsers([...registeredUsers, newUser]);
      setUsernameInput(usernameInput);
      setPasswordInput(regPasswordInput);
      setEmailInput('');
      setRegPasswordInput('');
      setConfirmPasswordInput('');
      setAuthSuccessMsg('สมัครสมาชิกสำเร็จแล้ว! กรุณากดปุ่มเข้าสู่ระบบ');
      setAuthMode('login');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cyber_current_logged_user');
    setIsAdminLoggedIn(false);
    localStorage.removeItem('cyber_is_admin_logged');
    setPasswordInput('');
    setShowLoginPassword(false);
    setRegPasswordInput('');
    setConfirmPasswordInput('');
    setEmailInput('');
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

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    setChangePinMessage({ text: '', type: '' });

    if (oldPinInput !== adminPin) {
      setChangePinMessage({ text: 'รหัส PIN เดิมไม่ถูกต้อง', type: 'error' });
      return;
    }
    if (newPinInput.length !== 6) {
      setChangePinMessage({ text: 'รหัส PIN ใหม่ต้องมี 6 หลัก', type: 'error' });
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      setChangePinMessage({ text: 'รหัส PIN ใหม่และยืนยันรหัส PIN ไม่ตรงกัน', type: 'error' });
      return;
    }

    setAdminPin(newPinInput);
    localStorage.setItem('cyber_admin_pin', newPinInput);
    setChangePinMessage({ text: 'เปลี่ยนรหัส PIN สำเร็จเรียบร้อย!', type: 'success' });
    setOldPinInput('');
    setNewPinInput('');
    setConfirmNewPinInput('');
  };

  const handleCreateGiftCode = (e) => {
    e.preventDefault();
    setAdminCodeMsg({ text: '', type: '' });

    if (!newCodeName.trim() || !newCodeReward.trim() || newCodeMaxUses <= 0) {
      setAdminCodeMsg({ text: 'กรุณากรอกข้อมูลโค้ดและจำนวนสิทธิ์ให้ถูกต้อง', type: 'error' });
      return;
    }

    const cleanCode = newCodeName.trim().toUpperCase();
    if (giftCodes.some(c => c.code === cleanCode)) {
      setAdminCodeMsg({ text: 'โค้ดนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่อโค้ดอื่น', type: 'error' });
      return;
    }

    const newCodeObj = {
      id: Date.now().toString(),
      code: cleanCode,
      game: newCodeGame,
      reward: newCodeReward,
      maxUses: parseInt(newCodeMaxUses),
      usedCount: 0
    };

    setGiftCodes([newCodeObj, ...giftCodes]);
    setAdminCodeMsg({ text: `สร้างโค้ด ${cleanCode} สำเร็จแล้ว!`, type: 'success' });
    setNewCodeName('');
    setNewCodeMaxUses(10);
  };

  const handleDeleteGiftCode = (id) => {
    setGiftCodes(giftCodes.filter(c => c.id !== id));
  };

  const handleResetAllRedeemRights = () => {
    if (window.confirm('คุณต้องการรีเซ็ตสิทธิ์ ID เกมทั้งหมดใช่หรือไม่? (ทุก ID เกมจะสามารถกลับมากรอกโค้ดได้ใหม่อีกครั้ง)')) {
      setGlobalRedeemedPlayers([]);
      alert('🔄 รีเซ็ตสิทธิ์สำเร็จ! ทุก ID เกมสามารถกลับมากรอกโค้ดได้ใหม่อีกครั้งแล้ว');
    }
  };

  const handleRedeemEventCode = (e) => {
    e.preventDefault();
    setEventMsg({ text: '', type: '' });

    if (!eventPlayerId.trim() || !eventGiftCode.trim()) {
      setEventMsg({ text: 'กรุณากรอก ID/ชื่อในเกม และโค้ดกิจกรรมให้ครบถ้วน', type: 'error' });
      return;
    }

    const cleanPlayerId = eventPlayerId.trim().toLowerCase();
    const targetCode = eventGiftCode.trim().toUpperCase();
    const foundCode = giftCodes.find(c => c.code === targetCode && c.game === eventGame);

    if (!foundCode) {
      setEventMsg({ text: `ไม่พบโค้ด "${targetCode}" สำหรับเกม ${eventGame}`, type: 'error' });
      return;
    }

    if (globalRedeemedPlayers.includes(cleanPlayerId)) {
      setEventMsg({ text: `❌ ID เกม "${eventPlayerId.trim()}" เคยใช้สิทธิ์กรอกโค้ดไปแล้ว (ต้องรอแอดมินมารีเซ็ตสิทธิ์ใหม่)`, type: 'error' });
      return;
    }

    if (foundCode.usedCount >= foundCode.maxUses) {
      setEventMsg({ text: `โค้ด "${targetCode}" ถูกใช้งานครบจำนวนสิทธิ์เต็มแล้ว`, type: 'error' });
      return;
    }

    setGlobalRedeemedPlayers([...globalRedeemedPlayers, cleanPlayerId]);
    setGiftCodes(giftCodes.map(c => c.id === foundCode.id ? { ...c, usedCount: c.usedCount + 1 } : c));

    const newOrderId = 'ORD-EVT-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    const dateKey = `${year}-${month}-${day}`;

    const newEventOrder = {
      id: newOrderId,
      game: `กิจกรรม (${eventGame})`,
      package: `โค้ด: ${foundCode.code} (${foundCode.reward})`,
      price: 0,
      profit: 0,
      player: eventPlayerId.trim(),
      paymentMethod: '🎁 โค้ดกิจกรรมฟรี',
      status: 'รอตรวจสอบ [10s]',
      type: 'event',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    setOrders([newEventOrder, ...orders]);
    setEventMsg({ text: `🎉 ใช้โค้ด ${foundCode.code} สำเร็จ! ได้รับ: ${foundCode.reward} (เลขออร์เดอร์: ${newOrderId})`, type: 'success' });
    setEventGiftCode('');
    setEventPlayerId('');
  };

  const handleWalletNextStep = () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    if (walletPaymentMethod === 'true') {
      if (!truemoneyPhone || truemoneyPhone.length < 10) {
        alert('กรุณากรอกเบอร์ TrueMoney Wallet ให้ครบ 10 หลัก');
        return;
      }
      setTrueMoneyOtpStep(true);
      setTrueMoneyOtpCode('');
      setTrueMoneyOtpError('');
      return;
    } else if (walletPaymentMethod === 'truemoneycard' && (!truemoneyCard14 || truemoneyCard14.length < 14)) {
      alert('กรุณากรอกรหัสบัตรเติมเงิน TrueMoney ให้ครบ 14 หลัก');
      return;
    } else if (walletPaymentMethod === 'credit' && (creditCardNum.replace(/\s/g, '').length < 16 || !creditCardExp || !creditCardCvv)) {
      alert('กรุณากรอกข้อมูลบัตรเครดิต/เดบิตให้ครบถ้วน');
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

  const handleTrueMoneyOtpSubmit = (e) => {
    e.preventDefault();
    setTrueMoneyOtpError('');

    if (!trueMoneyOtpCode || trueMoneyOtpCode.length !== 6) {
      setTrueMoneyOtpError('กรุณากรอกรหัส OTP 6 หลักให้ถูกต้อง');
      return;
    }

    setTrueMoneyOtpStep(false);

    if (showCheckoutModal) {
      handleFinalPaymentSubmit();
    } else {
      handleWalletConfirmPayment();
    }
  };

  const handleWalletConfirmPayment = () => {
    const amt = parseFloat(topupAmount) || 0;
    const newOrderId = 'ORD-W-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const thaiTime = `${day}/${month}/${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    const dateKey = `${year}-${month}-${day}`;

    const paymentLabelMap = {
      qrcode: 'QR PromptPay (เติมเครดิต)',
      true: 'TrueMoney Wallet (เติมเครดิต)',
      truemoneycard: 'บัตรทรูมันนี่ (เติมเครดิต)',
      credit: 'บัตรเครดิต/เดบิต (เติมเครดิต)'
    };

    const newWalletOrder = {
      id: newOrderId,
      game: `เติมเครดิตร้าน`,
      package: `+฿${amt.toLocaleString()}`,
      price: amt,
      profit: 0,
      player: user ? user.username : '11',
      paymentMethod: paymentLabelMap[walletPaymentMethod] || walletPaymentMethod.toUpperCase(),
      status: 'รอตรวจสอบ [10s]',
      type: 'wallet',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    setOrders((prev) => [newWalletOrder, ...prev]);
    setFloatingTimer(10);

    setShowTopupWalletModal(false);
    setWalletStep(1);
    setTopupAmount('');
    setTruemoneyPhone('');
    setTrueMoneyOtpStep(false);
    setTrueMoneyOtpCode('');
    setTruemoneyCard14('');
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
    setTrueMoneyOtpStep(false);
    setTrueMoneyOtpCode('');
    setTrueMoneyOtpError('');
    setTruemoneyCard14('');
    setCreditCardNum('');
    setCreditCardExp('');
    setCreditCardCvv('');
  };

  const handleStartGamePayment = () => {
    setCheckoutPasswordError('');
    
    const totalPrice = selectedPackage.price * packageQuantity;
    if (selectedPayment.id === 'wallet' && user.balance < totalPrice) {
      alert('ยอดเงินใน Cyber Wallet ของคุณไม่พอ กรุณาเติมเครดิตก่อนทำรายการ');
      return;
    }

    if (selectedPayment.id === 'true') {
      if (!truemoneyPhone || truemoneyPhone.length < 10) {
        alert('กรุณากรอกเบอร์ TrueMoney Wallet ให้ครบ 10 หลัก');
        return;
      }
      setTrueMoneyOtpStep(true);
      setTrueMoneyOtpCode('');
      setTrueMoneyOtpError('');
      return;
    } else if (selectedPayment.id === 'qrcode' || selectedPayment.id === 'wallet') {
      setTimeLeft(180);
      setIsQrExpired(false);
      setCheckoutStep(1);
      setShowCheckoutModal(true);
    } else {
      handleFinalPaymentSubmit();
    }
  };

  const handleVerifyPasswordStep = (e) => {
    e.preventDefault();
    setCheckoutPasswordError('');

    if (checkoutPassword !== user.password) {
      setCheckoutPasswordError('รหัสผ่านบัญชีไม่ถูกต้อง');
      return;
    }

    if (selectedPayment.id === 'qrcode') {
      setCheckoutStep(2);
    } else {
      handleFinalPaymentSubmit();
    }
  };

  const handleFinalPaymentSubmit = () => {
    const totalPrice = selectedPackage.price * packageQuantity;
    const totalProfit = (selectedPackage.profit || Math.round(selectedPackage.price * 0.15)) * packageQuantity;

    if (selectedPayment.id === 'wallet') {
      setUser((prev) => {
        const updatedBalance = prev.balance - totalPrice;
        const updatedUserObj = { ...prev, balance: updatedBalance };
        setRegisteredUsers((list) =>
          list.map((u) => u.username === updatedUserObj.username ? { ...u, balance: updatedBalance } : u)
        );
        return updatedUserObj;
      });
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
        package: `${selectedPackage.name} (x${packageQuantity} แพ็ก)`,
        price: totalPrice,
        profit: totalProfit,
        player: playerId.trim() || user.username,
        paymentMethod: selectedPayment.name,
        status: 'รอตรวจสอบ [10s]',
        type: 'game',
        time: thaiTime,
        dateKey: dateKey,
        timestamp: Date.now(),
      };

      setOrders([newOrder, ...orders]);
      setIsProcessing(false);
      setFloatingTimer(10);

      setShowCheckoutModal(false);
      setCheckoutStep(1);
      setCheckoutPassword('');
      setPackageQuantity(1);
      setTruemoneyPhone('');
      setTruemoneyCard14('');
      setCreditCardNum('');
      setCreditCardExp('');
      setCreditCardCvv('');
    }, 1000);
  };

  const handleAdminApproveOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          if (ord.type === 'wallet' && !ord.status.includes('สำเร็จ')) {
            setUser((prevUser) => ({ ...prevUser, balance: prevUser.balance + ord.price }));
            setRegisteredUsers((prevList) =>
              prevList.map((u) => u.username === ord.player ? { ...u, balance: ord.balance + ord.price } : u)
            );
          }
          return { ...ord, status: '✅ สำเร็จ (แอดมินอนุมัติแล้ว)' };
        }
        return ord;
      })
    );
  };

  const handleAdminRejectOrder = (orderId) => {
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
    setPackageQuantity(1);
    setTruemoneyPhone('');
    setTruemoneyCard14('');
    setCreditCardNum('');
    setCreditCardExp('');
    setCreditCardCvv('');
  };

  const filteredGames = gamesData.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = gameCategory === 'all' || game.category === gameCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter((ord) => ord.player.toLowerCase().includes(adminSearchQuery.toLowerCase()) || ord.id.toLowerCase().includes(adminSearchQuery.toLowerCase()) || ord.game.toLowerCase().includes(adminSearchQuery.toLowerCase()));

  const adminItemsPerPage = 10;
  const totalAdminPages = Math.ceil(filteredOrders.length / adminItemsPerPage) || 1;
  const paginatedAdminOrders = filteredOrders.slice((adminOrdersPage - 1) * adminItemsPerPage, adminOrdersPage * adminItemsPerPage);

  const isUserAdmin = user && (user.username === 'thanphooms@gmail.com' || user.email === 'thanphooms@gmail.com');

  const nowObj = new Date();
  const currentDayStr = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`;

  const searchedOrders = orders.filter(o => {
    let matchUser = false;
    if (!isUserAdmin) {
      matchUser = user && o.player.toLowerCase() === user.username.toLowerCase();
    } else {
      const q = exactSearchQuery.trim().toLowerCase();
      matchUser = !q || (o.player.toLowerCase() === q) || (o.id.toLowerCase() === q);
    }

    const orderQuery = customerOrderSearch.trim().toLowerCase();
    const matchOrder = !orderQuery || o.id.toLowerCase().includes(orderQuery);

    const matchGame = selectedGameFilter === 'all' || o.game.toLowerCase() === selectedGameFilter.toLowerCase();
    const matchDate = !selectedDateFilter || o.dateKey === selectedDateFilter;

    return matchUser && matchOrder && matchGame && matchDate;
  });

  const todayOrders = searchedOrders.filter(o => o.dateKey === currentDayStr);
  const pastOrders = searchedOrders.filter(o => o.dateKey !== currentDayStr);

  const customerItemsPerPage = 10;
  const totalCustomerTodayPages = Math.ceil(todayOrders.length / customerItemsPerPage) || 1;
  const paginatedTodayOrders = todayOrders.slice((customerOrdersPage - 1) * customerItemsPerPage, customerOrdersPage * customerItemsPerPage);

  const totalSpentInSearch = searchedOrders.reduce((sum, ord) => sum + ord.price, 0);
  const selectedGameForAdminCode = gamesData.find(g => g.name === newCodeGame);

  const [selectedHistoryDate, setSelectedHistoryDate] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);

  const groupedPastOrders = React.useMemo(() => {
    const groups = {};
    pastOrders.forEach((ord) => {
      const dateStr = ord.time ? ord.time.split(' ')[0] : (ord.dateKey || 'อื่นๆ');
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(ord);
    });
    return groups;
  }, [pastOrders]);

  const availableHistoryDates = Object.keys(groupedPastOrders);

  const filteredPastOrdersByDate = React.useMemo(() => {
    if (selectedHistoryDate === 'all') {
      return pastOrders;
    }
    return groupedPastOrders[selectedHistoryDate] || [];
  }, [pastOrders, groupedPastOrders, selectedHistoryDate]);

  const historyItemsPerPage = 5;
  const totalHistoryPages = Math.ceil(filteredPastOrdersByDate.length / historyItemsPerPage) || 1;

  const paginatedPastOrders = React.useMemo(() => {
    const startIndex = (historyPage - 1) * historyItemsPerPage;
    return filteredPastOrdersByDate.slice(startIndex, startIndex + historyItemsPerPage);
  }, [filteredPastOrdersByDate, historyPage]);

  const handleHistoryDateChange = (e) => {
    setSelectedHistoryDate(e.target.value);
    setHistoryPage(1);
  };

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
          border: '1.5px solid rgba(168, 85, 247, 0.5)', borderRadius: '24px',
          padding: '40px 30px', maxWidth: '420px', width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(147,51,234,0.4)', textAlign: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ 
              position: 'relative', width: '65px', height: '65px', borderRadius: '18px', 
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #1d4ed8 100%)', 
              border: '2px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 0 30px rgba(168,85,247,0.9), 0 0 15px rgba(56,189,248,0.7)', 
              marginBottom: '12px'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1"></polygon>
              </svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', letterSpacing: '3px', textShadow: '0 0 15px rgba(168,85,247,0.8)' }}>CYBER TOPUP</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '2px', marginTop: '2px' }}>FAST & SECURE GAMING</div>
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
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. อีเมล (Email)</label>
                <input type="email" placeholder="example@email.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                {authMode === 'register' ? '2. ชื่อผู้ใช้งาน (Username / ID)' : 'ชื่อผู้ใช้งาน (Username / ID)'}
              </label>
              <input type="text" placeholder="กรอกชื่อผู้ใช้..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                {authMode === 'register' ? '3. รหัสผ่าน (Password)' : 'รหัสผ่าน (Password)'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={authMode === 'login' ? (showLoginPassword ? 'text' : 'password') : (showRegPassword ? 'text' : 'password')} 
                  placeholder="กรอกรหัสผ่าน..." 
                  value={authMode === 'login' ? passwordInput : regPasswordInput} 
                  onChange={(e) => authMode === 'login' ? setPasswordInput(e.target.value) : setRegPasswordInput(e.target.value)} 
                  style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                />
                <button 
                  type="button" 
                  onClick={() => authMode === 'login' ? setShowLoginPassword(!showLoginPassword) : setShowRegPassword(!showRegPassword)} 
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <EyeIcon show={authMode === 'login' ? showLoginPassword : showRegPassword} />
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>4. ยืนยันรหัสผ่าน (Confirm Password)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="กรอกรหัสผ่านอีกครั้ง..." 
                    value={confirmPasswordInput} 
                    onChange={(e) => setConfirmPasswordInput(e.target.value)} 
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
                <label htmlFor="remember" style={{ cursor: 'pointer' }}>จดจำไอดีของฉันไว้ (Remember ID)</label>
              </div>
            )}

            <button 
              type="submit" 
              style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 0 15px rgba(147,51,234,0.5)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(168,85,247,0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#9333ea'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(147,51,234,0.5)'; }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            >
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
      
      {floatingTimer > 0 && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '25px', zIndex: 98,
          backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '2px solid #34d399',
          borderRadius: '16px', padding: '12px 18px', boxShadow: '0 0 25px rgba(52, 211, 153, 0.6)',
          display: 'flex', alignItems: 'center', gap: '12px', animation: 'pulse 1s infinite'
        }}>
          <div style={{ fontSize: '22px' }}>⏳</div>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>รอระบบยืนยันการทำรายการ</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#34d399' }}>เหลืออีก {floatingTimer} วินาที (Auto 10s)...</div>
          </div>
        </div>
      )}

      <header style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(147, 51, 234, 0.3)', padding: '12px 30px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #1d4ed8 100%)', 
            border: '2px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 0 25px rgba(168,85,247,0.9), 0 0 10px rgba(56,189,248,0.7)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1"></polygon>
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '19px', fontWeight: '900', color: '#ffffff', lineHeight: '1', textShadow: '0 0 12px rgba(168,85,247,0.8), 0 0 5px rgba(56,189,248,0.5)' }}>CYBER TOPUP</div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '1.5px' }}>FAST & SECURE GAMING</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>👤 ผู้ใช้: </span><b style={{ color: '#c084fc' }}>{user.username}</b></div>
            <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>💰 เครดิตร้าน: </span><b style={{ color: '#34d399' }}>฿{user.balance.toLocaleString()}</b></div>
            
            <button 
              onClick={() => { setShowTopupWalletModal(true); setWalletStep(1); }} 
              style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(147,51,234,0.5)', transition: 'all 0.25s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(168,85,247,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#9333ea'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(147,51,234,0.5)'; }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            >
              + เติมเครดิต
            </button>
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} 
              style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.25s ease' }}
              onMouseEnter={(e) => { if(activeTab !== 'shop') e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; }}
              onMouseLeave={(e) => { if(activeTab !== 'shop') e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            >
              ✨ หน้าแรก
            </button>
            
            <button 
              onClick={() => setActiveTab('track')} 
              style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.25s ease' }}
              onMouseEnter={(e) => { if(activeTab !== 'track') e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; }}
              onMouseLeave={(e) => { if(activeTab !== 'track') e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            >
              📋 เช็คสถานะ
            </button>
            
            {isUserAdmin && (
              <button 
                onClick={() => setActiveTab('admin')} 
                style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.25s ease' }}
                onMouseEnter={(e) => { if(activeTab !== 'admin') e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; }}
                onMouseLeave={(e) => { if(activeTab !== 'admin') e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              >
                ⚙️ หลังบ้าน
              </button>
            )}

            <button 
              onClick={handleLogout} 
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.25s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            >
              🚪 ออกจากระบบ
            </button>
          </nav>
        </div>
      </header>

      <a href="https://lin.ee/Nn1UeBC" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 99, backgroundColor: '#06c755', color: '#ffffff', padding: '12px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 25px rgba(6, 199, 85, 0.6)', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #ffffff', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.06)'; e.currentTarget.style.boxShadow = '0 8px 35px rgba(6, 199, 85, 0.9)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 25px rgba(6, 199, 85, 0.6)'; }}
      >
        <div style={{ width: '22px', height: '22px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: '#06c755', fontWeight: '900', lineHeight: '1' }}>L</span>
        </div>
        ติดต่อแอดมิน (LINE)
      </a>

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {activeTab === 'shop' && !selectedGame && (
          <div>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', 
              border: '2px solid rgba(168, 85, 247, 0.8)', 
              borderRadius: '24px', 
              padding: '40px', 
              marginBottom: '35px', 
              boxShadow: '0 0 50px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(56, 189, 248, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
              
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc', border: '1px solid #c084fc', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textShadow: '0 0 10px rgba(192,132,252,0.8)' }}>
                ⚡ ระบบเติมเกมอัตโนมัติ 24 ชั่วโมง ปลอดภัย 100%
              </span>
              <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '16px 0 10px 0', textShadow: '0 0 25px rgba(168,85,247,0.8), 0 0 10px rgba(56,189,248,0.5)' }}>
                เติมเกมสะดวกรวดเร็ว <br/><span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56,189,248,0.8)' }}>ราคาถูกที่สุด คุ้มค่าที่สุด</span>
              </h1>
              <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 25px 0', maxWidth: '650px' }}>
                เลือกเกมโปรดของคุณ เติมไวภายใน 1 นาที รองรับทั้ง VALORANT, PUBG, ROV, Avatar Star, Genshin Impact และเกมดังอื่นๆ อีกมากมาย
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
                  <input type="text" placeholder="🔍 ค้นหาชื่อเกม..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', outline: 'none', boxShadow: '0 0 15px rgba(168,85,247,0.3)', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(3, 7, 18, 0.9)', padding: '5px', borderRadius: '14px', border: '1.5px solid rgba(168, 85, 247, 0.5)' }}>
                  {[
                    { id: 'all', label: '🎮 ทั้งหมด' },
                    { id: 'pc', label: '🖥️ PC' },
                    { id: 'mobile', label: '📱 Mobile' }
                  ].map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setGameCategory(cat.id)} 
                      style={{ 
                        backgroundColor: gameCategory === cat.id ? '#9333ea' : 'transparent', 
                        color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '10px', 
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', transition: 'all 0.25s ease',
                        boxShadow: gameCategory === cat.id ? '0 0 15px rgba(147,51,234,0.8)' : 'none'
                      }}
                      onMouseEnter={(e) => { if(gameCategory !== cat.id) e.currentTarget.style.backgroundColor = 'rgba(147,51,234,0.4)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; }}
                      onMouseLeave={(e) => { if(gameCategory !== cat.id) e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔥 เลือกเกมที่ต้องการเติมเงิน ({filteredGames.length} เกม)
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px', marginBottom: '35px' }}>
              {filteredGames.map((game) => (
                <div 
                  key={game.id} 
                  onClick={() => { setSelectedGame(game); setSelectedPackage(null); setPackageQuantity(1); setPlayerId(user.username); }} 
                  style={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.85)', 
                    border: '1.5px solid rgba(168, 85, 247, 0.35)', 
                    borderRadius: '20px', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', 
                    boxShadow: '0 6px 25px rgba(0,0,0,0.6)',
                    position: 'relative'
                  }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(56, 189, 248, 0.45), 0 0 25px rgba(168,85,247,0.5)';
                    const img = e.currentTarget.querySelector('img');
                    if(img) img.style.transform = 'scale(1.08)';
                    const btn = e.currentTarget.querySelector('button');
                    if(btn) { btn.style.backgroundColor = '#a855f7'; btn.style.boxShadow = '0 0 18px rgba(168,85,247,0.8)'; }
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.6)';
                    const img = e.currentTarget.querySelector('img');
                    if(img) img.style.transform = 'scale(1)';
                    const btn = e.currentTarget.querySelector('button');
                    if(btn) { btn.style.backgroundColor = '#9333ea'; btn.style.boxShadow = '0 0 12px rgba(147,51,234,0.5)'; }
                  }}
                >
                  <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                    <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#c084fc', border: '1px solid #c084fc', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{game.badge}</span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{game.name}</h3>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 12px 0' }}>{game.publisher}</p>
                    <button style={{ width: '100%', backgroundColor: '#9333ea', border: 'none', color: '#ffffff', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 0 12px rgba(147,51,234,0.5)' }}>คลิกเพื่อเติมเงิน →</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.95)', 
              border: '1.5px solid rgba(56, 189, 248, 0.6)', 
              borderRadius: '20px', 
              padding: '25px 30px', 
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
              marginBottom: '35px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px' }}>📊</span>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>สถานะโค้ดกิจกรรมคงเหลือแยกตามเกม</h3>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>สรุปจำนวนโค้ดที่ยังสามารถใช้งานได้ของแต่ละเกมในระบบปัจจุบัน</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {gamesData.map((g) => {
                  const codesForGame = giftCodes.filter(c => c.game === g.name);
                  const totalRemainingForGame = codesForGame.reduce((sum, c) => sum + Math.max(0, c.maxUses - c.usedCount), 0);
                  
                  return (
                    <div key={g.id} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{g.name}</span>
                      <span style={{ backgroundColor: totalRemainingForGame > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)', color: totalRemainingForGame > 0 ? '#34d399' : '#fca5a5', border: `1px solid ${totalRemainingForGame > 0 ? '#34d399' : '#ef4444'}`, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                        {totalRemainingForGame > 0 ? `เหลือ ${totalRemainingForGame} โค้ด` : 'หมดแล้ว'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.95)', 
              border: '1.5px solid rgba(56, 189, 248, 0.6)', 
              borderRadius: '20px', 
              padding: '25px 30px', 
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px' }}>🎁</span>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>กรอกโค้ดของขวัญ / โค้ดกิจกรรมจากแอดมิน</h3>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>จำกัดสิทธิ์ ID เกมละ 1 ครั้ง กรอกแล้วต้องรอแอดมินรีเซ็ตจึงจะกรอกใหม่ได้</p>
                </div>
              </div>

              {eventMsg.text && (
                <div style={{ backgroundColor: eventMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${eventMsg.type === 'success' ? '#34d399' : '#ef4444'}`, color: eventMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '15px' }}>
                  {eventMsg.text}
                </div>
              )}

              <form onSubmit={handleRedeemEventCode} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>1. เลือกเกม</label>
                  <select value={eventGame} onChange={(e) => setEventGame(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                    {gamesData.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>2. ID เกม หรือ ชื่อในเกม</label>
                  <input type="text" placeholder="ระบุไอดีหรือชื่อในเกม..." value={eventPlayerId} onChange={(e) => setEventPlayerId(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>3. โค้ดของขวัญ (Gift Code)</label>
                  <input type="text" placeholder="กรอกโค้ดกิจกรรม เช่น GIFT2026..." value={eventGiftCode} onChange={(e) => setEventGiftCode(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 0 15px rgba(2, 132, 199, 0.5)', transition: 'all 0.25s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 22px rgba(2, 132, 199, 0.8)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0284c7'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(2, 132, 199, 0.5)'; }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  >
                    ✨ ยืนยันรับสิทธิ์โค้ด
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.5)', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setSelectedGame(null)} style={{ backgroundColor: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateX(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >← กลับไปหน้าเลือกเกม</button>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
              <img src={selectedGame.image} alt={selectedGame.name} style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #a855f7' }} />
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px 0' }}>{selectedGame.name}</h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>ผู้ให้บริการ: {selectedGame.publisher} | เลือกแพ็กเกจด้านล่างเพื่อเติมเงิน</p>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>1. กรอกชื่อผู้ใช้ / ID ในเกมของคุณ</label>
              <input type="text" placeholder="ระบุ Username หรือ ID เกม..." value={playerId} onChange={(e) => setPlayerId(e.target.value)} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>2. เลือกแพ็กเกจเติมเกม</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                {selectedGame.packages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    onClick={() => { setSelectedPackage(pkg); setPackageQuantity(1); }} 
                    style={{ 
                      backgroundColor: selectedPackage?.id === pkg.id ? 'rgba(147, 51, 234, 0.3)' : '#030712', 
                      border: selectedPackage?.id === pkg.id ? '2px solid #a855f7' : '1px solid #374151', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      cursor: 'pointer', 
                      transition: 'all 0.25s ease',
                      boxShadow: selectedPackage?.id === pkg.id ? '0 0 20px rgba(168,85,247,0.5)' : 'none'
                    }}
                    onMouseEnter={(e) => { if(selectedPackage?.id !== pkg.id) e.currentTarget.style.borderColor = '#c084fc'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={(e) => { if(selectedPackage?.id !== pkg.id) e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{pkg.name}</div>
                    <div style={{ fontSize: '12px', color: '#34d399', marginBottom: '10px' }}>โบนัส: {pkg.bonus}</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>฿{pkg.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPackage && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '16px', padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>📦 แพ็กเกจที่เลือก: <span style={{ color: '#c084fc' }}>{selectedPackage.name}</span></div>
                  <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>ราคาต่อ 1 แพ็ก: ฿{selectedPackage.price.toLocaleString()}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>จำนวนแพ็กเกจ:</span>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', overflow: 'hidden' }}>
                    <button 
                      type="button" 
                      onClick={() => setPackageQuantity(Math.max(1, packageQuantity - 1))}
                      style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >-</button>
                    <input 
                      type="text" 
                      readOnly
                      value={packageQuantity} 
                      style={{ width: '45px', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', outline: 'none' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setPackageQuantity(packageQuantity + 1)}
                      style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >+</button>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399', minWidth: '100px', textAlign: 'right' }}>
                    รวม ฿{(selectedPackage.price * packageQuantity).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>3. เลือกช่องทางชำระเงิน</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {paymentMethods.map((pm) => (
                  <div 
                    key={pm.id} 
                    onClick={() => setSelectedPayment(pm)} 
                    style={{ 
                      backgroundColor: selectedPayment?.id === pm.id ? 'rgba(56, 189, 248, 0.2)' : '#030712', 
                      border: selectedPayment?.id === pm.id ? '2px solid #38bdf8' : '1px solid #374151', 
                      borderRadius: '14px', 
                      padding: '14px', 
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => { if(selectedPayment?.id !== pm.id) e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { if(selectedPayment?.id !== pm.id) e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{pm.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{pm.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPayment && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>
                  📝 กรอกข้อมูลช่องทาง: {selectedPayment.name}
                </div>

                {selectedPayment.id === 'true' && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>เบอร์โทรศัพท์ TrueMoney Wallet (10 หลัก)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      maxLength={10} 
                      placeholder="เช่น 0812345678" 
                      value={truemoneyPhone} 
                      onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                      style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                )}

                {selectedPayment.id === 'truemoneycard' && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>รหัสบัตรเติมเงิน TrueMoney (14 หลัก)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      maxLength={14} 
                      placeholder="กรอกรหัสบัตร 14 หลัก..." 
                      value={truemoneyCard14} 
                      onChange={(e) => setTruemoneyCard14(e.target.value.replace(/[^0-9]/g, ''))} 
                      style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', letterSpacing: '2px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                )}

                {selectedPayment.id === 'credit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>หมายเลขบัตรเครดิต/เดบิต (16 หลัก)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="4111 2222 3333 4444" 
                        value={creditCardNum} 
                        onChange={handleCreditCardNumChange} 
                        style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1.5px' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>วันหมดอายุ (MM/YY)</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={creditCardExp} 
                          onChange={handleCreditCardExpChange} 
                          style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CVV (3 หลัก)</label>
                        <input 
                          type="password" 
                          inputMode="numeric"
                          maxLength={3} 
                          placeholder="123" 
                          value={creditCardCvv} 
                          onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} 
                          style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment.id === 'qrcode' && (
                  <div style={{ fontSize: '13px', color: '#34d399' }}>
                    ✅ ระบบจะสร้าง QR Code อัตโนมัติในขั้นตอนถัดไปเพื่อสแกนผ่าน Mobile Banking (ต้องยืนยันรหัสผ่านบัญชี)
                  </div>
                )}

                {selectedPayment.id === 'wallet' && (
                  <div style={{ fontSize: '13px', color: '#34d399' }}>
                    🔒 เพื่อความปลอดภัยและป้องกันการกดพลาด ระบบจะให้ท่านยืนยันรหัสผ่านบัญชีก่อนหักเงินจากเครดิตร้าน (ยอดคงเหลือ: ฿{user.balance.toLocaleString()})
                  </div>
                )}
              </div>
            )}

            <button 
              disabled={!playerId.trim() || !selectedPackage || !selectedPayment}
              onClick={handleStartGamePayment} 
              style={{ 
                width: '100%', 
                backgroundColor: (!playerId.trim() || !selectedPackage || !selectedPayment) ? '#374151' : '#9333ea', 
                color: '#ffffff', 
                border: 'none', 
                padding: '16px', 
                borderRadius: '14px', 
                fontWeight: 'bold', 
                fontSize: '16px', 
                cursor: (!playerId.trim() || !selectedPackage || !selectedPayment) ? 'not-allowed' : 'pointer',
                boxShadow: (!playerId.trim() || !selectedPackage || !selectedPayment) ? 'none' : '0 0 25px rgba(147,51,234,0.6)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { if(playerId.trim() && selectedPackage && selectedPayment) { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(168,85,247,0.9)'; } }}
              onMouseLeave={(e) => { if(playerId.trim() && selectedPackage && selectedPayment) { e.currentTarget.style.backgroundColor = '#9333ea'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(147,51,234,0.6)'; } }}
              onMouseDown={(e) => { if(playerId.trim() && selectedPackage && selectedPayment) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { if(playerId.trim() && selectedPackage && selectedPayment) e.currentTarget.style.transform = 'scale(1.01)'; }}
            >
              {!playerId.trim() ? 'กรุณากรอกชื่อผู้ใช้ / ID เกม' : !selectedPackage ? 'กรุณาเลือกแพ็กเกจเติมเกม' : !selectedPayment ? 'กรุณาเลือกช่องทางชำระเงิน' : `ยืนยันชำระเงิน ฿{(selectedPackage.price * packageQuantity).toLocaleString()} (${packageQuantity} แพ็ก)`}
            </button>
          </div>
        )}

        {activeTab === 'track' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 35px rgba(0,0,0,0.7)' }}>
            <div style={{ borderBottom: '1px solid #374151', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>📋 เช็คสถานะคำสั่งซื้อและประวัติการทำรายการ</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c084fc' }}>
                <span>👤 บัญชีผู้ใช้งาน:</span>
                <b style={{ color: '#ffffff', backgroundColor: 'rgba(147,51,234,0.3)', padding: '2px 10px', borderRadius: '6px', border: '1px solid #9333ea' }}>{user.username}</b>
                {!isUserAdmin && <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '6px' }}>(แสดงเฉพาะประวัติคำสั่งซื้อของคุณเอง)</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder={isUserAdmin ? "🔍 ค้นหาชื่อบัญชีลูกค้า..." : user.username}
                value={isUserAdmin ? exactSearchQuery : user.username} 
                disabled={!isUserAdmin}
                onChange={(e) => isUserAdmin && setExactSearchQuery(e.target.value)} 
                style={{ 
                  flex: 1, minWidth: '180px', 
                  backgroundColor: isUserAdmin ? '#030712' : '#1f2937', 
                  border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', 
                  color: '#ffffff', outline: 'none', 
                  cursor: isUserAdmin ? 'text' : 'not-allowed', fontWeight: 'bold',
                  boxSizing: 'border-box' 
                }} 
              />

              <input 
                type="text" 
                placeholder="🔍 กรอกเลขออร์เดอร์ เช่น ORD-14969..." 
                value={customerOrderSearch} 
                onChange={(e) => setCustomerOrderSearch(e.target.value)} 
                style={{ 
                  flex: 1.5, minWidth: '220px', 
                  backgroundColor: '#030712', 
                  border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', 
                  color: '#ffffff', outline: 'none', 
                  boxSizing: 'border-box' 
                }} 
              />

              <select 
                value={selectedGameFilter} 
                onChange={(e) => setSelectedGameFilter(e.target.value)} 
                style={{ flex: 1, minWidth: '150px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">🎮 เลือกดูเกม (ทั้งหมด)</option>
                {gamesData.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 12px' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>📅 ปฏิทิน:</span>
                <input 
                  type="date" 
                  value={selectedDateFilter} 
                  onChange={(e) => setSelectedDateFilter(e.target.value)} 
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#ffffff', fontSize: '13px', outline: 'none', padding: '10px 0', cursor: 'pointer', colorScheme: 'dark' }} 
                />
              </div>
            </div>

            <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                ผลการค้นหา: <b style={{ color: '#ffffff' }}>{searchedOrders.length}</b> รายการ (วันนี้: {todayOrders.length} | ประวัติย้อนหลัง: {pastOrders.length})
              </span>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                ยอดรวมเงินที่เติม {selectedGameFilter !== 'all' && `(${selectedGameFilter})`}: <b style={{ color: '#34d399', fontSize: '18px' }}>฿{totalSpentInSearch.toLocaleString()}</b>
              </span>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>📅 รายการประจำวัน (วันนี้ {currentDayStr})</h3>
              {paginatedTodayOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                  {paginatedTodayOrders.map((ord, idx) => {
                    const globalIdx = (customerOrdersPage - 1) * customerItemsPerPage + idx + 1;
                    return (
                      <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '12px', marginRight: '4px' }}>#{globalIdx}</span>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#ffffff' }}>🎮 {ord.game} <span style={{ color: '#c084fc', fontSize: '13px' }}>({ord.package})</span></div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                            ชื่อผู้ทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b> | ช่องทางจ่าย: <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{ord.paymentMethod || 'Cyber Wallet'}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>฿{ord.price.toLocaleString()}</div>
                          <span style={{ fontSize: '11px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b', fontWeight: 'bold' }}>{ord.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', backgroundColor: '#030712', borderRadius: '14px', border: '1px dashed #374151', marginBottom: '15px' }}>
                  ไม่มีรายการคำสั่งซื้อใหม่ในวันนี้
                </div>
              )}

              {totalCustomerTodayPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                  {Array.from({ length: totalCustomerTodayPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCustomerOrdersPage(pageNum)}
                      style={{
                        backgroundColor: customerOrdersPage === pageNum ? '#9333ea' : '#030712',
                        color: '#ffffff',
                        border: '1px solid ' + (customerOrdersPage === pageNum ? '#a855f7' : '#374151'),
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {pastOrders.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #374151', paddingTop: '20px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#9ca3af', margin: 0 }}>📂 ประวัติย้อนหลัง (รายการจากวันก่อนหน้า)</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 'bold' }}>📅 เลือกวันที่ประวัติ:</span>
                    <select
                      value={selectedHistoryDate}
                      onChange={handleHistoryDateChange}
                      style={{
                        backgroundColor: '#030712',
                        border: '1.5px solid #a855f7',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        color: '#38bdf8',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">🌐 แสดงประวัติย้อนหลังทั้งหมด ({pastOrders.length} รายการ)</option>
                      {availableHistoryDates.map((dateStr) => (
                        <option key={dateStr} value={dateStr}>
                          📅 วันที่ {dateStr} ({groupedPastOrders[dateStr].length} รายการ)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.95 }}>
                  {paginatedPastOrders.map((ord, idx) => {
                    const globalIdx = (historyPage - 1) * historyItemsPerPage + idx + 1;
                    return (
                      <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold' }}>#{globalIdx}</span>
                            <span style={{ backgroundColor: '#374151', color: '#d1d5db', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>📅 {ord.time}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d1d5db' }}>🎮 {ord.game} <span style={{ color: '#a855f7', fontSize: '12px' }}>({ord.package})</span></div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                            ผู้ทำรายการ: {ord.player} | ช่องทางจ่าย: <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{ord.paymentMethod || 'Cyber Wallet'}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>฿{ord.price.toLocaleString()}</div>
                          <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>{ord.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalHistoryPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginRight: '6px' }}>หน้า {historyPage} จาก {totalHistoryPages}:</span>
                    {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setHistoryPage(pageNum)}
                        style={{
                          backgroundColor: historyPage === pageNum ? '#9333ea' : '#030712',
                          color: '#ffffff',
                          border: '1px solid ' + (historyPage === pageNum ? '#a855f7' : '#374151'),
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease',
                          boxShadow: historyPage === pageNum ? '0 0 10px rgba(147,51,234,0.6)' : 'none'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && isUserAdmin && (
          <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {!isAdminLoggedIn ? (
              <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '35px 30px', textAlign: 'center', border: '1.5px solid #9333ea', boxShadow: '0 0 35px rgba(147,51,234,0.5)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(147, 51, 234, 0.2)', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 15px auto' }}>🔐</div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>ยืนยันสิทธิ์แอดมิน</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าหลังบ้าน</p>
                <form onSubmit={handleAdminLogin}>
                  {adminPinError && <div style={{ color: '#fca5a5', marginBottom: '12px', fontSize: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '8px' }}>{adminPinError}</div>}
                  <input type="password" maxLength={6} placeholder="PIN 6 หลัก" value={inputAdminPin} onChange={(e) => setInputAdminPin(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #374151', borderRadius: '12px', padding: '14px', color: '#ffffff', textAlign: 'center', fontSize: '22px', letterSpacing: '6px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.25s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(168,85,247,0.8)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#9333ea'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  >เข้าสู่ระบบแอดมิน</button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 25px rgba(56,189,248,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🔐</span> เปลี่ยนรหัส PIN 6 หลัก
                        </h3>
                        <button onClick={() => { setIsAdminLoggedIn(false); localStorage.removeItem('cyber_is_admin_logged'); }} style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }}>
                          ล็อกเอาท์ PIN
                        </button>
                      </div>
                      {changePinMessage.text && (
                        <div style={{ backgroundColor: changePinMessage.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: changePinMessage.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>
                          {changePinMessage.text}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleChangePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. PIN เดิม</label>
                          <input type="password" maxLength={6} placeholder="------" value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '6px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ backgroundColor: '#030712', border: '1px solid #38bdf8', borderRadius: '12px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                          <label style={{ fontSize: '11px', color: '#38bdf8', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>2. PIN ใหม่</label>
                          <input type="password" maxLength={6} placeholder="------" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '6px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ backgroundColor: '#030712', border: '1px solid #34d399', borderRadius: '12px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                          <label style={{ fontSize: '11px', color: '#34d399', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>3. ยืนยัน PIN</label>
                          <input type="password" maxLength={6} placeholder="------" value={confirmNewPinInput} onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '6px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 0 15px rgba(2,132,199,0.4)', boxSizing: 'border-box' }}>
                        ✨ บันทึกเปลี่ยนรหัส PIN ใหม่
                      </button>
                    </form>
                  </div>

                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #ec4899', boxShadow: '0 0 25px rgba(236,72,153,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📢</span>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f472b6', margin: 0 }}>บันทึกรายการโปรโมทเว็บ / ค่าโฆษณา</h3>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '14px' }}>
                      เลือกช่องทางโฆษณา บันทึกยอดจ่ายเพื่อหักกำไรสุทธิ (แสดง 5 รายการต่อหน้า)
                    </p>

                    <form onSubmit={handleAddAdPromotion} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '8px', marginBottom: '15px' }}>
                      <select 
                        value={adPlatform} 
                        onChange={(e) => setAdPlatform(e.target.value)} 
                        style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                      >
                        <option value="Facebook Ads">Facebook Ads</option>
                        <option value="TikTok Ads">TikTok Ads</option>
                        <option value="Google / YouTube Ads">Google / YouTube Ads</option>
                        <option value="Instagram Ads">Instagram Ads</option>
                        <option value="LINE Official Account">LINE Official Account</option>
                        <option value="Twitter (X) Ads">Twitter (X) Ads</option>
                        <option value="Influencer / Creator">Influencer / Gaming Creator</option>
                        <option value="อื่นๆ (Custom)">อื่นๆ (Custom)</option>
                      </select>

                      <input 
                        type="number" 
                        placeholder="ยอดเงิน (บาท)" 
                        value={adAmountInput} 
                        onChange={(e) => setAdAmountInput(e.target.value)} 
                        style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} 
                      />

                      <button type="submit" style={{ backgroundColor: '#ec4899', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        + เพิ่ม
                      </button>
                    </form>

                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '10px', minHeight: '165px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {adPromotions.length > 0 ? (
                        <div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {paginatedAdPromotions.map((item, index) => {
                              const globalIndex = (adPage - 1) * adItemsPerPage + index + 1;
                              return (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '6px 10px', borderRadius: '8px', fontSize: '11px' }}>
                                  <div>
                                    <span style={{ color: '#f472b6', fontWeight: 'bold', marginRight: '6px' }}>{globalIndex}.</span>
                                    <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{item.platform}</span>
                                    <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '10px' }}>({item.time})</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#f472b6', fontWeight: 'bold' }}>-฿{parseFloat(item.amount).toLocaleString()}</span>
                                    <button type="button" onClick={() => handleDeleteAdPromotion(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', padding: '0 2px' }}>✕</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', padding: '20px 0' }}>
                          ยังไม่มีรายการโปรโมทเว็บ
                        </div>
                      )}

                      {totalAdPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #1f2937', paddingTop: '8px' }}>
                          {Array.from({ length: totalAdPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setAdPage(pageNum)}
                              style={{
                                backgroundColor: adPage === pageNum ? '#ec4899' : '#111827',
                                color: '#ffffff',
                                border: '1px solid ' + (adPage === pageNum ? '#f472b6' : '#374151'),
                                borderRadius: '6px',
                                padding: '3px 8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>💵 ยอดขายรวมทั้งหมด</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>฿{totalAdminSales.toLocaleString()}</div>
                  </div>

                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #34d399', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>📈 กำไรสุทธิ (หักโฆษณา)</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>+฿{netProfitAfterAd.toLocaleString()}</div>
                  </div>

                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #ec4899', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>📢 ค่าโฆษณา/โปรโมท</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#f472b6' }}>-฿{adExpense.toLocaleString()}</div>
                  </div>

                  <div style={{ backgroundColor: '#030712', border: isVatThresholdReached ? '1.5px solid #c084fc' : '1.5px dashed #4b5563', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>🏛️ VAT 7% จากกำไร</div>
                    <div style={{ fontSize: isVatThresholdReached ? '18px' : '12px', fontWeight: '900', color: isVatThresholdReached ? '#c084fc' : '#9ca3af', marginTop: isVatThresholdReached ? '0' : '4px' }}>
                      {isVatThresholdReached ? `-฿${totalAdminVat.toLocaleString()}` : '฿0 (ยังไม่ถึงเกณฑ์ 1.8M)'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #f59e0b', borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>📋 เสียภาษีประจำปี</div>
                    <div style={{ fontSize: totalAdminTax > 0 ? '18px' : '12px', fontWeight: '900', color: '#f59e0b', marginTop: totalAdminTax > 0 ? '0' : '4px' }}>
                      {totalAdminTax > 0 ? `-฿${totalAdminTax.toLocaleString()}` : '฿0 (ยกเว้น 150k แรก)'}
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #9333ea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📊 รายการทำรายการหลังบ้าน + ช่องทางที่ลูกค้าชำระเงิน (Auto 10s)</h2>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>แสดงหน้าละ 10 บรรทัด (หน้า {adminOrdersPage} / {totalAdminPages})</span>
                  </div>

                  <input type="text" placeholder="🔍 ค้นหาเลขออร์เดอร์ หรือชื่อลูกค้า..." value={adminSearchQuery} onChange={(e) => { setAdminSearchQuery(e.target.value); setAdminOrdersPage(1); }} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {paginatedAdminOrders.map((ord, idx) => (
                      <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{ord.game} <span style={{ color: '#c084fc', fontSize: '14px' }}>({ord.package})</span></div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                            ลูกค้าผู้ทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b> | ยอดขาย: <b style={{ color: '#ffffff' }}>฿{ord.price.toLocaleString()}</b>
                          </div>
                          <div style={{ fontSize: '12px', color: '#f472b6', marginTop: '4px', fontWeight: 'bold' }}>
                            💳 ช่องทางชำระเงิน: {ord.paymentMethod || 'Cyber Wallet (เครดิตร้าน)'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          {ord.type === 'game' ? (
                            <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '6px 12px', marginBottom: '6px', display: 'inline-block' }}>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>📈 กำไรสุทธิ: </span>
                              <b style={{ color: '#34d399', fontSize: '14px' }}>+฿{(ord.profit || 0).toLocaleString()}</b>
                            </div>
                          ) : ord.type === 'event' ? (
                            <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px', fontWeight: 'bold' }}>🎁 โค้ดกิจกรรมแจกฟรี</div>
                          ) : (
                            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>💳 เติมเครดิตร้าน</div>
                          )}

                          {ord.status.includes('รอตรวจสอบ') ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>⏳ รอ 10s (Auto)</span>
                              <button onClick={() => handleAdminApproveOrder(ord.id)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }}>✅ อนุมัติ</button>
                              <button onClick={() => handleAdminRejectOrder(ord.id)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', transition: 'all 0.2s ease' }}>❌ ยกเลิก</button>
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>{ord.status}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalAdminPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                      {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setAdminOrdersPage(pageNum)}
                          style={{
                            backgroundColor: adminOrdersPage === pageNum ? '#9333ea' : '#030712',
                            color: '#ffffff',
                            border: '1px solid ' + (adminOrdersPage === pageNum ? '#a855f7' : '#374151'),
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 25px rgba(56,189,248,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🎁 สร้างและจัดการโค้ดของขวัญ / โค้ดกิจกรรม
                    </h3>
                    
                    <button 
                      onClick={handleResetAllRedeemRights} 
                      style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', boxShadow: '0 0 15px rgba(245,158,11,0.5)', transition: 'all 0.25s ease' }}
                    >
                      🔄 รีเซ็ตสิทธิ์ ID เกมทั้งหมด (กิจกรรมประจำปี)
                    </button>
                  </div>

                  {adminCodeMsg.text && (
                    <div style={{ backgroundColor: adminCodeMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: adminCodeMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>
                      {adminCodeMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleCreateGiftCode} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. ชื่อโค้ด (Code Name)</label>
                      <input type="text" placeholder="เช่น GIFT2026" value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. เลือกเกม</label>
                      <select value={newCodeGame} onChange={(e) => setNewCodeGame(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}>
                        {gamesData.map((g) => (
                          <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>3. เลือกแพ็กเกจของรางวัล</label>
                      <select value={newCodeReward} onChange={(e) => setNewCodeReward(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#38bdf8', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }}>
                        {selectedGameForAdminCode?.packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.name}>{pkg.name} (฿{pkg.price})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>4. จำนวนสิทธิ์ทั้งหมด</label>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', overflow: 'hidden' }}>
                        <button 
                          type="button" 
                          onClick={() => setNewCodeMaxUses(Math.max(1, newCodeMaxUses - 1))}
                          style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >-</button>
                        <input 
                          type="text" 
                          readOnly
                          value={newCodeMaxUses} 
                          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', outline: 'none' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setNewCodeMaxUses(newCodeMaxUses + 1)}
                          style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >+</button>
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.25s ease' }}>
                        + สร้างโค้ดกิจกรรมใหม่
                      </button>
                    </div>
                  </form>

                  <h4 style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 10px 0' }}>📋 รายการโค้ดที่มีในระบบปัจจุบัน ({giftCodes.length} โค้ด)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {giftCodes.map((c) => (
                      <div key={c.id} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginRight: '8px' }}>{c.code}</span>
                          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>[{c.game}]</span>
                          <span style={{ color: '#34d399', fontSize: '13px', marginLeft: '10px' }}>🎁 {c.reward}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>ใช้ไปแล้ว: <b style={{ color: '#ffffff' }}>{c.usedCount}</b> / {c.maxUses} สิทธิ์</span>
                          <button onClick={() => handleDeleteGiftCode(c.id)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s ease' }}>ลบ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {showCheckoutModal && selectedGame && selectedPackage && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
            
            {checkoutStep === 1 && (
              <form onSubmit={handleVerifyPasswordStep}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>
                  🔐 ยืนยันรหัสผ่านบัญชี ({selectedPayment.id === 'wallet' ? 'ป้องกันกดตัดเงินพลาด' : 'เพื่อรับ QR Code'})
                </h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>กรุณากรอกรหัสผ่านบัญชีของคุณเพื่อยืนยันการทำรายการ</p>

                <div style={{ backgroundColor: '#030712', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left', border: '1px solid #374151' }}>
                  <div style={{ fontSize: '13px', color: '#ffffff', marginBottom: '4px' }}>🎮 เกม: <b>{selectedGame.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '4px' }}>📦 แพ็กเกจ: <b>{selectedPackage.name} (x{packageQuantity} แพ็ก)</b></div>
                  <div style={{ fontSize: '13px', color: '#34d399', marginBottom: '4px' }}>💰 ยอดชำระ: <b>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b></div>
                  <div style={{ fontSize: '13px', color: '#c084fc', marginBottom: '4px' }}>💳 ช่องทาง: <b>{selectedPayment.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#c084fc' }}>👤 ไอดีเกม: <b>{playerId}</b></div>
                </div>

                {checkoutPasswordError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>{checkoutPasswordError}</div>}

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <input 
                    type={showCheckoutPassword ? 'text' : 'password'} 
                    placeholder="กรอกรหัสผ่านบัญชีของคุณ..." 
                    value={checkoutPassword} 
                    onChange={(e) => setCheckoutPassword(e.target.value)} 
                    style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                  <button type="button" onClick={() => setShowCheckoutPassword(!showCheckoutPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <EyeIcon show={showCheckoutPassword} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={resetCheckoutModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(147,51,234,0.5)' }}>
                    {selectedPayment.id === 'wallet' ? 'ยืนยันหักเครดิตร้าน' : 'ถัดไป →'}
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === 2 && selectedPayment?.id === 'qrcode' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>📱 สแกน QR Code ชำระเงิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>ยอดชำระ: <b style={{ color: '#34d399' }}>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b></p>
                <div style={{ fontSize: '12px', color: isQrExpired ? '#ef4444' : '#f59e0b', marginBottom: '12px', fontWeight: 'bold' }}>
                  {isQrExpired ? '❌ QR Code หมดอายุแล้ว' : `⏱️ QR Code จะหมดอายุใน: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} นาที`}
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '160px', height: '160px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isQrExpired ? 0.4 : 1 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Game-${selectedGame.name}-${selectedPackage.price * packageQuantity}`} alt="QR Code" style={{ width: '140px', height: '140px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button 
                    disabled={isQrExpired}
                    onClick={handleFinalPaymentSubmit} 
                    style={{ flex: 1, backgroundColor: isQrExpired ? '#374151' : '#34d399', color: isQrExpired ? '#9ca3af' : '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isQrExpired ? 'not-allowed' : 'pointer' }}
                  >
                    ฉันโอนเงินแล้ว
                  </button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>กำลังดำเนินการสั่งซื้อ...</h3>
              </div>
            )}

          </div>
        </div>
      )}

      {(showTopupWalletModal || trueMoneyOtpStep) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
            
            {trueMoneyOtpStep ? (
              <form onSubmit={handleTrueMoneyOtpSubmit}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#38bdf8' }}>🔐 กรอกรหัส OTP</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>
                  ระบบได้ส่งรหัส OTP ไปยังเบอร์ <b style={{ color: '#ffffff' }}>{truemoneyPhone}</b> แล้ว (ลองกรอกตัวเลข 6 หลัก)
                </p>

                {trueMoneyOtpError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>
                    {trueMoneyOtpError}
                  </div>
                )}

                <input 
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="------"
                  value={trueMoneyOtpCode}
                  onChange={(e) => setTrueMoneyOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '12px', padding: '14px', color: '#ffffff', fontSize: '24px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '8px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setTrueMoneyOtpStep(false)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(52,211,153,0.5)' }}>ยืนยัน OTP</button>
                </div>
              </form>
            ) : walletStep === 1 ? (
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
                    <option value="true">TrueMoney Wallet (เบอร์ 10 หลัก + OTP)</option>
                    <option value="truemoneycard">บัตรเติมเงินทรูมันนี่ (14 หลัก)</option>
                    <option value="credit">บัตรเครดิต / เดบิต</option>
                  </select>
                </div>

                {walletPaymentMethod === 'true' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="เบอร์ TrueMoney Wallet (10 หลัก)" value={truemoneyPhone} onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                {walletPaymentMethod === 'truemoneycard' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="รหัสบัตรเติมเงิน 14 หลัก" value={truemoneyCard14} onChange={(e) => setTruemoneyCard14(e.target.value.replace(/[^0-9]/g, ''))} maxLength={14} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
                  </div>
                )}

                {walletPaymentMethod === 'credit' && (
                  <div style={{ textAlign: 'left', marginBottom: '15px', backgroundColor: '#030712', padding: '10px', borderRadius: '10px', border: '1px solid #374151' }}>
                    <input type="text" placeholder="หมายเลขบัตร 16 หลัก" value={creditCardNum} onChange={handleCreditCardNumChange} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1.5px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={handleCreditCardExpChange} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }} />
                      <input type="password" placeholder="CVV" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
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
                    {walletPaymentMethod === 'qrcode' ? 'ถัดไป (สแกน QR) →' : walletPaymentMethod === 'true' ? 'ส่งรหัส OTP →' : 'ยืนยันการเติมเครดิต'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>📱 สแกน QR Code เติมเครดิต</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>ยอดชำระ: <b style={{ color: '#34d399' }}>฿{parseFloat(topupAmount).toLocaleString()}</b></p>
                <div style={{ fontSize: '12px', color: isWalletQrExpired ? '#ef4444' : '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>
                  {isWalletQrExpired ? '❌ QR Code หมดอายุแล้ว' : `⏱️ QR Code จะหมดอายุใน: ${Math.floor(walletTimeLeft / 60)}:${(walletTimeLeft % 60).toString().padStart(2, '0')} นาที`}
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '160px', height: '160px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isWalletQrExpired ? 0.4 : 1 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Topup-Wallet-${topupAmount}`} alt="Topup QR Code" style={{ width: '140px', height: '140px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setWalletStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button 
                    disabled={isWalletQrExpired}
                    onClick={handleWalletConfirmPayment} 
                    style={{ flex: 1, backgroundColor: isWalletQrExpired ? '#374151' : '#34d399', color: isWalletQrExpired ? '#9ca3af' : '#000000', border: '1px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isWalletQrExpired ? 'not-allowed' : 'pointer' }}
                  >
                    ฉันโอนเงินเรียบร้อยแล้ว
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '13px' }}>
        <p style={{ margin: 0 }}>⚡ <b>CYBER TOPUP</b> - บริการเติมเกมออนไลน์ตลอด 24 ชั่วโมง</p>
      </footer>
    </div>
  );
}
