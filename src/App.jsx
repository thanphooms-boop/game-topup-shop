import React, { useState } from 'react';
import { 
  Gamepad2, Shield, Search, Wallet, CheckCircle2, 
  Settings, Lock, ArrowRight, User, History,
  LogOut, Sparkles, TrendingUp, RefreshCw
} from 'lucide-react';

export default function GameTopupApp() {
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [server, setServer] = useState('');
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

  const [gamesData, setGamesData] = useState([
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
    { id: 'qrcode', name: 'QR PromptPay', desc: 'ฟรีค่าธรรมเนียม อัตโนมัติ 24 ชม.', icon: 'qr' },
    { id: 'true', name: 'TrueMoney Wallet', desc: 'สะดวกรวดเร็ว ปลอดภัย', icon: 'wallet' },
    { id: 'truemoney', name: 'บัตรเงินสดทรูมันนี่', desc: 'หักค่าธรรมเนียม 14.5%', icon: 'card' },
    { id: 'card', name: 'บัตรเครดิต / เดบิต', desc: 'VISA / Mastercard', icon: 'credit-card' }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white pb-20">
      
      {/* HEADER NAVBAR (จัดระเบียบให้เด่นชัดและสวยงาม) */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}>
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-purple-500/30">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                CYBER TOPUP
              </span>
              <span className="block text-[11px] text-slate-400 font-semibold tracking-widest uppercase">Fast & Secure Gaming</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={() => { setActiveTab('shop'); setSelectedGame(null); }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'shop' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>หน้าแรกเติมเกม</span>
            </button>
            <button 
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'track' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'}`}
            >
              <History className="w-4 h-4" />
              <span>เช็คสถานะ</span>
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'}`}
            >
              <Settings className="w-4 h-4" />
              <span>หลังบ้าน</span>
            </button>
          </nav>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {activeTab === 'shop' && !selectedGame && (
          <div>
            {/* HERO BANNER */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-slate-900 border border-purple-500/30 p-6 sm:p-10 mb-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>ระบบเติมเกมอัตโนมัติ 24 ชั่วโมง ปลอดภัย 100%</span>
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
                  เติมเกมสะดวกรวดเร็ว <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">ราคาถูกที่สุด คุ้มค่าที่สุด</span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base mb-6">
                  เลือกเกมโปรดของคุณ เติมไวภายใน 1 นาที รองรับทั้ง VALORANT, PUBG, ROV, Avatar Star ที่กำลังจะเปิดในไทย และเกมดังอื่นๆ อีกมากมาย
                </p>

                {/* SEARCH & FILTER BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="ค้นหาชื่อเกมที่ต้องการเติม..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${selectedCategory === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                    >
                      🎮 ทั้งหมด
                    </button>
                    <button 
                      onClick={() => setSelectedCategory('pc')}
                      className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${selectedCategory === 'pc' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                    >
                      💻 PC Games
                    </button>
                    <button 
                      onClick={() => setSelectedCategory('mobile')}
                      className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${selectedCategory === 'mobile' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                    >
                      📱 Mobile Games
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GAMES GRID */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <span>🔥 เลือกเกมที่ต้องการเติมเงิน ({filteredGames.length} เกม)</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredGames.map((game) => (
                <div 
                  key={game.id}
                  onClick={() => { setSelectedGame(game); setSelectedPackage(null); }}
                  className="group relative bg-slate-900/80 rounded-3xl overflow-hidden border border-slate-800 hover:border-purple-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer flex flex-col transform hover:-translate-y-1"
                >
                  <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-800">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-lg">
                      {game.badge}
                    </span>
                  </div>
                  
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1">{game.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{game.publisher}</p>
                    </div>
                    
                    <button className="mt-4 w-full bg-slate-800 group-hover:bg-purple-600 text-slate-200 group-hover:text-white py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md">
                      <span>คลิกเพื่อเติมเงิน</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <button 
              onClick={() => setSelectedGame(null)}
              className="mb-6 text-sm text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1.5 bg-slate-900/90 px-5 py-3 rounded-2xl border border-slate-800 w-fit shadow-md transition-all hover:bg-slate-800"
            >
              <span>← กลับไปเลือกเกมอื่น</span>
            </button>

            <div className="relative rounded-3xl overflow-hidden mb-8 border border-purple-500/40 p-6 sm:p-8 bg-slate-900 shadow-2xl">
              <div className="absolute inset-0 opacity-20">
                <img src={selectedGame.image} alt={selectedGame.name} className="w-full h-full object-cover filter blur-sm" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <img src={selectedGame.image} alt={selectedGame.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl border border-purple-500/40" />
                <div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2 inline-block">
                    {selectedGame.badge}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black text-white">{selectedGame.name}</h1>
                  <p className="text-sm text-slate-300 mt-1">ผู้ให้บริการ: {selectedGame.publisher}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                
                {/* STEP 1 */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-black">1</span>
                    <span>ระบุข้อมูลไอดีผู้เล่น</span>
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Player ID / Riot ID / UID</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="เช่น PlayerName#1234 หรือ 123456789"
                          value={playerId}
                          onChange={(e) => setPlayerId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {selectedGame.id === 'rov' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">เลือกเซิร์ฟเวอร์</label>
                        <select 
                          value={server} 
                          onChange={(e) => setServer(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="">-- กรุณาเลือกเซิร์ฟเวอร์ --</option>
                          <option value="th">Thailand</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-black">2</span>
                    <span>เลือกแพ็กเกจที่ต้องการเติม</span>
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedGame.packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <div 
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-500/30 ring-2 ring-purple-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                        >
                          <div>
                            <span className="text-xs font-bold text-purple-400">{pkg.bonus}</span>
                            <div className="text-base font-black text-white mt-1">{pkg.name}</div>
                          </div>
                          <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-400">ราคา</span>
                            <span className="text-sm font-black text-emerald-400">฿{pkg.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-black">3</span>
                    <span>เลือกช่องทางชำระเงิน</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((pay) => {
                      const isSelected = selectedPayment?.id === pay.id;
                      return (
                        <div 
                          key={pay.id}
                          onClick={() => setSelectedPayment(pay)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${isSelected ? 'bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-500/30 ring-2 ring-purple-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                        >
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{pay.name}</div>
                            <div className="text-[11px] text-slate-400">{pay.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* SUMMARY */}
              <div className="space-y-6">
                <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 sticky top-24 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800">สรุปคำสั่งซื้อ</h3>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-400">เกม:</span>
                      <span className="font-semibold text-white">{selectedGame.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ID ผู้เล่น:</span>
                      <span className="font-semibold text-purple-300">{playerId || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">แพ็กเกจ:</span>
                      <span className="font-semibold text-white">{selectedPackage ? selectedPackage.name : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ช่องทางชำระ:</span>
                      <span className="font-semibold text-white">{selectedPayment ? selectedPayment.name : '-'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mb-6 flex items-center justify-between">
                    <span className="text-base font-bold text-white">ยอดชำระสุทธิ:</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ฿{selectedPackage ? selectedPackage.price : '0'}
                    </span>
                  </div>

                  <button 
                    disabled={!playerId || !selectedPackage || !selectedPayment}
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>ยืนยันการชำระเงิน</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-400 justify-center">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>ระบบเติมเงินอัตโนมัติ ปลอดภัย 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2">เช็คสถานะการเติมเงิน</h2>
              <p className="text-slate-400 text-sm mb-6">กรอกเลขออร์เดอร์ (เช่น ORD-98421) หรือชื่อผู้เล่นเพื่อตรวจสอบประวัติการทำรายการ</p>

              <div className="flex gap-3 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="กรอกเลขออร์เดอร์ หรือ Player ID..."
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button 
                  onClick={() => {
                    const found = orders.find(o => o.id.toLowerCase().includes(trackQuery.toLowerCase()) || o.player.toLowerCase().includes(trackQuery.toLowerCase()));
                    setTrackResult(found || { notFound: true });
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-purple-600/30"
                >
                  ค้นหา
                </button>
              </div>

              {trackResult && !trackResult.notFound && (
                <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs text-purple-400 font-bold">{trackResult.id}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{trackResult.status}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block">เกม</span>
                      <span className="font-bold text-white">{trackResult.game}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">แพ็กเกจ</span>
                      <span className="font-bold text-white">{trackResult.package}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">ผู้เล่น</span>
                      <span className="font-bold text-purple-300">{trackResult.player}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">ยอดเงิน</span>
                      <span className="font-bold text-emerald-400">฿{trackResult.price}</span>
                    </div>
                  </div>
                </div>
              )}

              {trackResult && trackResult.notFound && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center text-rose-400 text-sm">
                  ไม่พบรายการที่คุณค้นหา กรุณาตรวจสอบเลขออร์เดอร์ใหม่อีกครั้ง
                </div>
              )}

              <div className="mt-10">
                <h3 className="text-base font-bold text-white mb-4">รายการเติมเงินล่าสุดในระบบ</h3>
                <div className="space-y-3">
                  {orders.map((ord, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-sm">
                      <div>
                        <div className="font-bold text-white flex items-center space-x-2">
                          <span>{ord.game}</span>
                          <span className="text-xs text-slate-400 font-normal">({ord.package})</span>
                        </div>
                        <div className="text-xs text-purple-400 mt-0.5">ID: {ord.player} • {ord.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">฿{ord.price}</div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">สำเร็จ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
                <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">ระบบหลังบ้าน Admin</h2>
                <p className="text-xs text-slate-400 mb-6">กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าสู่ระบบ (รหัสทดสอบ: <span className="text-purple-400 font-bold">123456</span>)</p>

                <input 
                  type="password"
                  maxLength={6}
                  placeholder="PIN 6 หลัก"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-lg tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 mb-4"
                />

                {adminPinError && (
                  <p className="text-xs text-rose-400 mb-4">รหัส PIN ไม่ถูกต้อง (ลองกรอก 123456)</p>
                )}

                <button 
                  onClick={() => {
                    if (adminPin === '123456') {
                      setIsAdminLoggedIn(true);
                      setAdminPinError(false);
                    } else {
                      setAdminPinError(true);
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white">ยินดีต้อนรับผู้ดูแลระบบ (Admin)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">จัดการราคาแพ็กเกจเกม และตรวจสอบยอดขายทั้งหมด</p>
                  </div>
                  <button 
                    onClick={() => setIsAdminLoggedIn(false)}
                    className="bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow">
                    <span className="text-xs text-slate-400 font-medium">ยอดขายรวมวันนี้</span>
                    <div className="text-2xl font-black text-emerald-400 mt-2">฿12,450</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow">
                    <span className="text-xs text-slate-400 font-medium">รายการเติมสำเร็จ</span>
                    <div className="text-2xl font-black text-purple-400 mt-2">48 รายการ</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow">
                    <span className="text-xs text-slate-400 font-medium">จำนวนเกมในระบบ</span>
                    <div className="text-2xl font-black text-indigo-400 mt-2">{gamesData.length} เกม</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4">รายการคำสั่งซื้อล่าสุด</h3>
                  <div className="space-y-3">
                    {orders.map((ord, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-sm">
                        <div>
                          <div className="font-bold text-white">{ord.id} - {ord.game} ({ord.package})</div>
                          <div className="text-xs text-purple-400 mt-0.5">ผู้เล่น: {ord.player} • {ord.time}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-400">฿{ord.price}</span>
                          <div className="text-[10px] text-emerald-400">{ord.status}</div>
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

      {showCheckoutModal && selectedGame && selectedPackage && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            {!orderSuccess ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">ยืนยันการชำระเงิน</h3>
                <p className="text-xs text-slate-400 text-center mb-6">สแกน QR Code หรือชำระเงินผ่านช่องทางที่เลือก</p>

                {selectedPayment.id === 'qrcode' && (
                  <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-6 flex flex-col items-center justify-center shadow-lg">
                    <div className="w-36 h-36 border-4 border-slate-900 flex items-center justify-center bg-slate-100 rounded-lg">
                      <span className="text-xs font-bold text-slate-900 text-center">QR PromptPay<br/>฿{selectedPackage.price}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-sm space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">เกม:</span>
                    <span className="font-bold text-white">{selectedGame.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">แพ็กเกจ:</span>
                    <span className="font-bold text-white">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ยอดโอน:</span>
                    <span className="font-bold text-emerald-400">฿{selectedPackage.price}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-semibold text-sm transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    disabled={isProcessing}
                    onClick={handleCheckout}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังตรวจสอบ...</span>
                      </>
                    ) : (
                      <span>ยืนยันการโอนเงิน</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">เติมเงินสำเร็จ!</h3>
                <p className="text-xs text-slate-400 mb-6">เลขออร์เดอร์ของคุณคือ <span className="text-purple-400 font-bold">{orderSuccess}</span><br/>ระบบได้เติมไอเทมเข้าไอดีให้เรียบร้อยแล้วครับ</p>
                
                <button 
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setOrderSuccess(null);
                    setSelectedGame(null);
                    setPlayerId('');
                    setSelectedPackage(null);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
                >
                  กลับสู่หน้าหลัก
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
