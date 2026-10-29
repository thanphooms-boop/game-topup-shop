import React, { useState } from 'react';

export default function GameTopupApp() {
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

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
      image: 'https://images.unsplash.com/photo-1612287233002-14e30263f3ef?auto=format&fit=crop&w=500&q=80',
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
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'สะดวกรวดเร็ว ปลอดภัย' },
    { id: 'truemoney', name: 'บัตรเงินสดทรูมันนี่', desc: 'หักค่าธรรมเนียม 14.5%' },
    { id: 'card', name: 'บัตรเครดิต / เดบิต', desc: 'VISA / Mastercard' }
  ];

  const [orders, setOrders] = useState([
    { id: 'ORD-98421', game: 'VALORANT', package: '420 VP', price: 319, player: 'CyberNinja#1234', status: 'สำเร็จ', time: '10 นาทีที่แล้ว' },
    { id: 'ORD-98420', game: 'ROV', package: '220 Coupons', price: 175, player: 'ProPlayer99', status: 'สำเร็จ', time: '25 นาทีที่แล้ว' }
  ]);

  const handleCheckout = () => {
    if (!selectedGame || !playerId || !selectedPackage || !selectedPayment) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      const newOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: selectedPackage.name,
        price: selectedPackage.price,
        player: playerId,
        status: 'สำเร็จ',
        time: 'เมื่อสักครู่นี้'
      };
      setOrders([newOrder, ...orders]);
      setIsProcessing(false);
      setOrderSuccess(newOrderId);
    }, 1500);
  };

  const filteredGames = gamesData.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          game.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: '#090d16', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '60px' }}>
      
      {/* NAVBAR */}
      <header style={{ backgroundColor: '#111827', borderBottom: '1 border solid #1f2937', padding: '15px 30px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', itemsCenter: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
          <div style={{ backgroundColor: '#9333ea', padding: '8px 12px', borderRadius: '12px', fontSize: '20px' }}>🎮</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#c084fc', letterSpacing: '1px' }}>CYBER TOPUP</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase' }}>Fast & Secure Gaming</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}
            style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : '#1f2937', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            ✨ หน้าแรกเติมเกม
          </button>
          <button 
            onClick={() => setActiveTab('track')}
            style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : '#1f2937', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            📋 เช็คสถานะ
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : '#1f2937', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            ⚙️ หลังบ้าน
          </button>
        </nav>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* SHOP MAIN */}
        {activeTab === 'shop' && !selectedGame && (
          <div>
            {/* HERO BANNER */}
            <div style={{ background: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 50%, #111827 100%)', border: '1px solid #581c87', borderRadius: '24px', padding: '35px', marginBottom: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)', border: '1px solid #a855f7', color: '#e9d5ff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '15px' }}>
                🚀 ระบบเติมเกมอัตโนมัติ 24 ชั่วโมง ปลอดภัย 100%
              </span>
              <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0 0 15px 0', lineHeight: '1.2' }}>
                เติมเกมสะดวกรวดเร็ว <br />
                <span style={{ color: '#c084fc' }}>ราคาถูกที่สุด คุ้มค่าที่สุด</span>
              </h1>
              <p style={{ color: '#d1d5db', fontSize: '15px', marginBottom: '25px', maxWidth: '650px' }}>
                เลือกเกมโปรดของคุณ เติมไวภายใน 1 นาที รองรับทั้ง VALORANT, PUBG, ROV, Avatar Star ที่กำลังจะเปิดในไทย และเกมดังอื่นๆ อีกมากมาย
              </p>

              {/* SEARCH & FILTER */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text"
                  placeholder="🔍 ค้นหาชื่อเกม..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: '1', minWidth: '220px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedCategory('all')} style={{ backgroundColor: selectedCategory === 'all' ? '#9333ea' : '#111827', border: '1px solid #374151', color: '#ffffff', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🎮 ทั้งหมด</button>
                  <button onClick={() => setSelectedCategory('pc')} style={{ backgroundColor: selectedCategory === 'pc' ? '#9333ea' : '#111827', border: '1px solid #374151', color: '#ffffff', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>💻 PC</button>
                  <button onClick={() => setSelectedCategory('mobile')} style={{ backgroundColor: selectedCategory === 'mobile' ? '#9333ea' : '#111827', border: '1px solid #374151', color: '#ffffff', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>📱 Mobile</button>
                </div>
              </div>
            </div>

            {/* GAMES GRID */}
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '20px' }}>🔥 เลือกเกมที่ต้องการเติมเงิน ({filteredGames.length} เกม)</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {filteredGames.map((game) => (
                <div 
                  key={game.id}
                  onClick={() => { setSelectedGame(game); setSelectedPackage(null); }}
                  style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
                >
                  <div style={{ position: 'relative', height: '170px', backgroundColor: '#1f2937' }}>
                    <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#9333ea', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
                      {game.badge}
                    </span>
                  </div>
                  
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#ffffff' }}>{game.name}</h3>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{game.publisher}</p>
                    </div>
                    
                    <button style={{ marginTop: '15px', width: '100%', backgroundColor: '#9333ea', border: 'none', color: '#ffffff', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                      คลิกเพื่อเติมเงิน →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOPUP FORM */}
        {activeTab === 'shop' && selectedGame && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button 
              onClick={() => setSelectedGame(null)}
              style={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#c084fc', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', fontSize: '13px' }}
            >
              ← กลับไปเลือกเกมอื่น
            </button>

            {/* SELECTED GAME HEADER */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #581c87', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
              <img src={selectedGame.image} alt={selectedGame.name} style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #9333ea' }} />
              <div>
                <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{selectedGame.badge}</span>
                <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '6px 0 2px 0' }}>{selectedGame.name}</h1>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>ผู้ให้บริการ: {selectedGame.publisher}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* STEP 1: PLAYER ID */}
                <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '20px' }}>
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

                {/* STEP 2: SELECT PACKAGE */}
                <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '20px' }}>
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
                            backgroundColor: isSelected ? 'rgba(147, 51, 234, 0.2)' : '#030712',
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

                {/* STEP 3: PAYMENT */}
                <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '20px' }}>
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
                            backgroundColor: isSelected ? 'rgba(147, 51, 234, 0.2)' : '#030712',
                            border: isSelected ? '2px solid #9333ea' : '1px solid #1f2937',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{pay.name}</div>
                          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{pay.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* SUMMARY SIDEBAR */}
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
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

        {/* TRACK TAB */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '30px' }}>
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
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>✓ {trackResult.status}</span>
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

        {/* ADMIN TAB */}
        {activeTab === 'admin' && (
          <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '30px', textAlign: 'center' }}>
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
                else setAdminPinError(true);
              }}
              style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              เข้าสู่ระบบ
            </button>
          </div>
        )}

      </main>

      {/* PAYMENT POPUP MODAL */}
      {showCheckoutModal && selectedGame && selectedPackage && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            {!orderSuccess ? (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 15px 0' }}>ยืนยันการชำระเงิน</h3>
                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '180px', height: '180px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: '#000000', fontSize: '13px', fontWeight: 'bold' }}>
                    QR PromptPay<br/>฿{selectedPackage.price}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowCheckoutModal(false)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button onClick={handleCheckout} style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isProcessing ? 'กำลังตรวจสอบ...' : 'ยืนยันโอนเงิน'}
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
