import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, Zap, Headphones, CheckCircle, Search, CreditCard, QrCode, Ticket, User, LogOut, Settings, Plus, Minus, Star, Heart, Flame } from 'lucide-react';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [userId, setUserId] = useState('');
  const [server, setServer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('shop');

  const games = [
    { id: 'valorant', name: 'VALORANT', category: 'PC Game', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60', popular: true },
    { id: 'rov', name: 'ROV', category: 'Mobile Game', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60', popular: true },
    { id: 'freefire', name: 'Free Fire', category: 'Mobile Game', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=60', popular: true },
    { id: 'pubg', name: 'PUBG Mobile', category: 'Mobile Game', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60', popular: true },
    { id: 'genshin', name: 'Genshin Impact', category: 'PC / Mobile', image: 'https://images.unsplash.com/photo-1612287233002-ef24249a5676?w=500&auto=format&fit=crop&q=60', popular: false },
    { id: 'fcms', name: 'FC Mobile', category: 'Mobile Game', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60', popular: false },
    { id: 'mlbb', name: 'Mobile Legends', category: 'Mobile Game', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60', popular: true },
    { id: 'heartopia', name: 'Heartopia', category: 'Cozy Game', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60', popular: false }
  ];

  const packages = {
    valorant: [
      { id: 'v1', name: '475 VP', price: 175, originalPrice: 190 },
      { id: 'v2', name: '1,000 VP', price: 350, originalPrice: 379 },
      { id: 'v3', name: '2,050 VP', price: 700, originalPrice: 750 },
      { id: 'v4', name: '3,650 VP', price: 1250, originalPrice: 1350 },
      { id: 'v5', name: '5,350 VP', price: 1790, originalPrice: 1950 }
    ],
    rov: [
      { id: 'r1', name: '40 คูปอง (Coupons)', price: 35, originalPrice: 39 },
      { id: 'r2', name: '90 คูปอง (Coupons)', price: 75, originalPrice: 85 },
      { id: 'r3', name: '220 คูปอง (Coupons)', price: 175, originalPrice: 190 },
      { id: 'r4', name: '580 คูปอง (Coupons)', price: 450, originalPrice: 479 },
      { id: 'r5', name: '1,220 คูปอง (Coupons)', price: 890, originalPrice: 950 }
    ],
    freefire: [
      { id: 'f1', name: '110 เพชร', price: 30, originalPrice: 35 },
      { id: 'f2', name: '310 เพชร', price: 89, originalPrice: 99 },
      { id: 'f3', name: '520 เพชร', price: 149, originalPrice: 169 },
      { id: 'f4', name: '1,060 เพชร', price: 299, originalPrice: 329 }
    ],
    pubg: [
      { id: 'p1', name: '60 UC', price: 29, originalPrice: 35 },
      { id: 'p2', name: '325 UC', price: 149, originalPrice: 169 },
      { id: 'p3', name: '660 UC', price: 299, originalPrice: 329 },
      { id: 'p4', name: '1,800 UC', price: 790, originalPrice: 850 }
    ]
  };

  const currentPackages = selectedGame ? (packages[selectedGame.id] || packages.valorant) : [];

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    const gamePkgs = packages[game.id] || packages.valorant;
    setSelectedPackage(gamePkgs[0]);
    setQuantity(1);
    setSuccessOrder(null);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!userId) {
      alert('กรุณากรอก User ID / ข้อมูลผู้รับให้ครบถ้วน');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessOrder({
        orderId: 'MEOW-' + Math.floor(100000 + Math.random() * 900000),
        game: selectedGame.name,
        package: selectedPackage.name,
        quantity: quantity,
        totalPrice: selectedPackage.price * quantity,
        userId: userId,
        time: new Date().toLocaleString('th-TH')
      });
    }, 1500);
  };

  const filteredGames = games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900 text-slate-100 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-purple-500/20 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setSelectedGame(null); setSuccessOrder(null); }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 text-2xl">
            🐱
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">MEOW TOPUP</h1>
            <p className="text-xs text-slate-400">เติมเกมอัตโนมัติ 24 ชม.</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <button onClick={() => { setSelectedGame(null); setSuccessOrder(null); }} className="hover:text-pink-400 transition">หน้าแรก</button>
          <a href="#games" className="hover:text-pink-400 transition">เกมทั้งหมด</a>
          <a href="#promotions" className="hover:text-pink-400 transition">โปรโมชั่น</a>
          <a href="#contact" className="hover:text-pink-400 transition">ติดต่อเรา</a>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-purple-900/40 border border-purple-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-pink-300 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>ระบบออโต้พร้อมให้บริการ</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        {successOrder ? (
          <div className="max-w-xl mx-auto bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-emerald-950/50 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">ทำรายการสำเร็จ!</h2>
            <p className="text-slate-400 text-sm mb-6">ระบบได้ทำการเติมเครดิต/แพ็กเกจให้ท่านเรียบร้อยแล้ว</p>
            
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-2 mb-6 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">เลขที่คำสั่งซื้อ:</span> <span className="font-mono text-pink-400">{successOrder.orderId}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">เกม:</span> <span className="font-semibold text-white">{successOrder.game}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">แพ็กเกจ:</span> <span className="font-semibold text-white">{successOrder.package}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">จำนวน:</span> <span className="font-semibold text-white">{successOrder.quantity} แพ็ก</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ยอดชำระสุทธิ:</span> <span className="font-bold text-emerald-400">฿{successOrder.totalPrice.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">User ID:</span> <span className="font-mono text-purple-300">{successOrder.userId}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">เวลาทำรายการ:</span> <span className="text-slate-300">{successOrder.time}</span></div>
            </div>

            <button onClick={() => setSuccessOrder(null)} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-500/25 transition">
              ทำรายการใหม่อีกครั้ง
            </button>
          </div>
        ) : !selectedGame ? (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl text-center lg:text-left">
                <span className="bg-pink-500/20 border border-pink-500/40 text-pink-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  🔥 เติมเกมสุดคุ้ม ปลอดภัย 100%
                </span>
                <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  เติมเกมสะใจ <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">กับน้องแมวเหมียว</span>
                </h1>
                <p className="text-slate-300 text-sm lg:text-base">
                  บริการเติมเกมราคาถูกกว่าเติมเอง เติมไวภายใน 1 นาที รองรับ PromptPay และ Wallet สะดวก ปลอดภัย เชื่อถือได้
                </p>
                <div className="flex items-center justify-center lg:justify-start space-x-6 pt-2 text-sm text-slate-300 font-medium">
                  <div className="flex items-center space-x-2"><Zap size={18} className="text-yellow-400"/><span>เติมไวใน 1 นาที</span></div>
                  <div className="flex items-center space-x-2"><ShieldCheck size={18} className="text-emerald-400"/><span>ปลอดภัย 100%</span></div>
                  <div className="flex items-center space-x-2"><Headphones size={18} className="text-pink-400"/><span>ซัพพอร์ตตลอด 24 ชม.</span></div>
                </div>
              </div>
              <div className="w-full lg:w-80 h-48 lg:h-64 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30 flex items-center justify-center text-8xl shadow-inner animate-pulse-slow">
                😺🛍️
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Flame className="text-pink-500" /> <span>เลือกเกมที่ต้องการเติม</span>
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อเกม..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500 transition"
                />
              </div>
            </div>

            {/* Games Grid */}
            <div id="games" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {filteredGames.map((game) => (
                <div 
                  key={game.id} 
                  onClick={() => handleSelectGame(game)}
                  className="group bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative h-36 lg:h-44 overflow-hidden bg-slate-800">
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100" />
                    {game.popular && (
                      <span className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                        ยอดฮิต 🔥
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-xs text-pink-400 font-medium">{game.category}</span>
                      <h3 className="font-bold text-white text-base group-hover:text-pink-300 transition">{game.name}</h3>
                    </div>
                    <button className="mt-3 w-full bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 text-white text-xs font-semibold py-2 rounded-xl transition shadow">
                      1 คลิกเพื่อเติม
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Checkout & Package Selection with Quantity */
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <button 
              onClick={() => setSelectedGame(null)}
              className="text-sm text-slate-400 hover:text-white flex items-center space-x-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition"
            >
              <span>← กลับไปหน้าเลือกเกม</span>
            </button>

            <div className="bg-slate-900/90 border border-purple-500/20 rounded-3xl p-6 lg:p-8 shadow-xl">
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-800">
                <img src={selectedGame.image} alt={selectedGame.name} className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30 shadow" />
                <div>
                  <span className="text-xs text-pink-400 font-medium">{selectedGame.category}</span>
                  <h2 className="text-2xl font-bold text-white">เติมเกม: {selectedGame.name}</h2>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-6">
                {/* 1. Enter User ID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">1</span>
                    <span>กรอกข้อมูลเกม (User ID / Server)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      required 
                      placeholder="กรอก User ID / Riot ID / อีเมล" 
                      value={userId} 
                      onChange={(e) => setUserId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition"
                    />
                    <input 
                      type="text" 
                      placeholder="เซิร์ฟเวอร์ (ถ้ามี เช่น Asia, TH)" 
                      value={server} 
                      onChange={(e) => setServer(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition"
                    />
                  </div>
                </div>

                {/* 2. Select Package */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">2</span>
                    <span>เลือกแพ็กเกจราคา</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentPackages.map((pkg) => (
                      <div 
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`border rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between ${selectedPackage?.id === pkg.id ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-pink-500 shadow-lg shadow-pink-500/20' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}
                      >
                        <div>
                          <span className="text-xs text-slate-400 line-through">฿{pkg.originalPrice}</span>
                          <h4 className="font-bold text-white text-base">{pkg.name}</h4>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-pink-400 font-extrabold text-lg">฿{pkg.price}</span>
                          {selectedPackage?.id === pkg.id && <CheckCircle size={18} className="text-pink-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Quantity Selector (NEW FEATURE) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">3</span>
                    <span>เลือกจำนวนที่ต้องการเติม (กี่แพ็กก็ได้)</span>
                  </label>
                  <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 rounded-xl p-4 max-w-xs">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold transition"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      max="99" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center bg-transparent text-xl font-bold text-white focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold transition"
                    >
                      <Plus size={18} />
                    </button>
                    <span className="text-sm text-slate-400">แพ็ก</span>
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">4</span>
                    <span>ช่องทางการชำระเงิน</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div 
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`border rounded-xl p-4 cursor-pointer flex items-center space-x-3 transition ${paymentMethod === 'promptpay' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}
                    >
                      <QrCode className="text-pink-400" size={24} />
                      <div>
                        <div className="font-semibold text-white text-sm">QR PromptPay</div>
                        <div className="text-xs text-slate-400">สแกนจ่ายทันที ค่าธรรมเนียม 0 บาท</div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setPaymentMethod('wallet')}
                      className={`border rounded-xl p-4 cursor-pointer flex items-center space-x-3 transition ${paymentMethod === 'wallet' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}
                    >
                      <CreditCard className="text-pink-400" size={24} />
                      <div>
                        <div className="font-semibold text-white text-sm">TrueMoney Wallet</div>
                        <div className="text-xs text-slate-400">เติมผ่านวอเลทอัตโนมัติ</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary & Submit */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-400">ยอดชำระสุทธิ ({quantity} แพ็ก):</div>
                    <div className="text-3xl font-extrabold text-pink-400">฿{(selectedPackage ? selectedPackage.price * quantity : 0).toLocaleString()}</div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>กำลังดำเนินการ...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>ยืนยันการชำระเงิน</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 MEOW TOPUP. All rights reserved. ระบบเติมเกมออนไลน์ปลอดภัย 24 ชม.</p>
      </footer>
    </div>
  );
}
