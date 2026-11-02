// State สำหรับจัดการสถานะการแจ้งเตือน LINE
  const [lineToken, setLineToken] = useState(() => {
    return localStorage.getItem('cyber_line_token') || '';
  });
  const [isLineNotifyEnabled, setIsLineNotifyEnabled] = useState(() => {
    return localStorage.getItem('cyber_line_enabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cyber_line_token', lineToken);
    localStorage.setItem('cyber_line_enabled', isLineNotifyEnabled ? 'true' : 'false');
  }, [lineToken, isLineNotifyEnabled]);

  // ฟังก์ชันจำลองการยิงข้อความแจ้งเตือนเข้า Line OA / Line Notify อัตโนมัติ
  const sendLineNotification = async (messageText) => {
    console.log("📤 [LINE NOTIFICATION SENT]:", messageText);
    
    // หากเปิดใช้งานระบบ Line Notify จริง สามารถเชื่อมต่อผ่าน Fetch API ไปยัง Line Endpoint ได้ทันที
    if (isLineNotifyEnabled && lineToken.trim()) {
      try {
        // ตัวอย่างการส่ง HTTP POST ไปยัง Line Notify API (ต้องใช้งานผ่าน Backend หรือ Proxy เพื่อป้องกัน CORS หรือใช้ Token ตรง)
        /*
        await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${lineToken}`
          },
          body: new URLSearchParams({ message: messageText })
        });
        */
      } catch (err) {
        console.error("LINE Notify Error:", err);
      }
    }
  };// ฟังก์ชันสร้างรูปแบบข้อความแจ้งเตือนออเดอร์ใหม่ส่งเข้า LINE
  const sendOrderLineNotification = (orderData) => {
    let msg = `\n🔔 **มีออเดอร์ใหม่เข้ามา!**\n`;
    msg += `---------------------------\n`;
    msg += `📌 เลขออร์เดอร์: ${orderData.id}\n`;
    msg += `👤 อีเมล/ผู้ใช้: ${orderData.player}\n`;
    msg += `🎮 เกม: ${orderData.game}\n`;
    msg += `📦 แพ็กเกจ: ${orderData.package}\n`;
    msg += `💰 ยอดชำระ: ฿${orderData.price.toLocaleString()}\n`;
    msg += `💳 ช่องทาง: ${orderData.paymentMethod}\n`;
    if (orderData.gameChar && orderData.gameChar !== 'เติมเครดิตร้าน') {
      msg += `🎯 UID/ตัวละคร: ${orderData.gameChar}\n`;
    }
    msg += `⏱️ เวลา: ${orderData.time}\n`;
    msg += `---------------------------\n`;
    msg += `สถานะ: ${orderData.status}`;

    sendLineNotification(msg);
  };

  // จัดการการยืนยันชำระเงินเติมเครดิตร้าน (Wallet) พร้อมส่ง LINE
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
      player: user ? (user.email || user.username) : 'user11@example.com',
      gameChar: 'เติมเครดิตร้าน',
      paymentMethod: paymentLabelMap[walletPaymentMethod] || walletPaymentMethod.toUpperCase(),
      status: 'รอตรวจสอบ',
      type: 'wallet',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    const insertedKey = createRealtimeOrder(newWalletOrder);
    setFloatingTimer(10);
    setActiveOrderFirebaseKey(insertedKey);

    // ส่งแจ้งเตือนเข้า LINE OA / Line Notify อัตโนมัติ
    sendOrderLineNotification(newWalletOrder);

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

  // จัดการการยืนยันชำระเงินซื้อแพ็กเกจเกม พร้อมส่ง LINE
  const handleFinalPaymentSubmit = () => {
    const totalPrice = selectedPackage.price * packageQuantity;
    const totalProfit = (selectedPackage.profit || Math.round(selectedPackage.price * 0.15)) * packageQuantity;

    if (selectedPayment.id === 'wallet' && user && user.firebaseKey) {
      const newBalance = user.balance - totalPrice;
      const userRef = ref(db, `users/${user.firebaseKey}/balance`);
      set(userRef, newBalance);
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
        player: user ? (user.email || user.username) : 'user11@example.com',
        gameChar: playerId.trim(),
        paymentMethod: selectedPayment.name,
        status: 'รอตรวจสอบ',
        type: 'game',
        time: thaiTime,
        dateKey: dateKey,
        timestamp: Date.now(),
      };

      const insertedKey = createRealtimeOrder(newOrder);

      // ส่งแจ้งเตือนออเดอร์เกมเข้า LINE OA / Line Notify อัตโนมัติ
      sendOrderLineNotification(newOrder);

      setIsProcessing(false);
      setFloatingTimer(10);
      setActiveOrderFirebaseKey(insertedKey);

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
  };// ฟังก์ชันสุ่มรหัสออร์เดอร์
  const generateOrderId = (prefix = 'ORD-') => {
    return prefix + Math.floor(10000 + Math.random() * 90000);
  };

  // จัดการการกรอก Gift Code / โค้ดกิจกรรมจากแอดมิน
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

    if (foundCode.firebaseKey) {
      const codeUsedRef = ref(db, `giftCodes/${foundCode.firebaseKey}/usedCount`);
      set(codeUsedRef, foundCode.usedCount + 1);
    }

    const newOrderId = generateOrderId('ORD-EVT-');
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
      player: user ? (user.email || user.username) : eventPlayerId.trim(),
      gameChar: eventPlayerId.trim(),
      paymentMethod: '🎁 โค้ดกิจกรรมฟรี',
      status: 'รอตรวจสอบ',
      type: 'event',
      time: thaiTime,
      dateKey: dateKey,
      timestamp: Date.now()
    };

    const insertedKey = createRealtimeOrder(newEventOrder);
    setFloatingTimer(10);
    setActiveOrderFirebaseKey(insertedKey);

    // ส่ง LINE Notify เมื่อกรอกโค้ดกิจกรรมสำเร็จ
    sendOrderLineNotification(newEventOrder);

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
    if (!playerId.trim()) {
      alert('กรุณากรอกชื่อในเกม หรือ UID ก่อนทำรายการ');
      return;
    }
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

  const handleAdminApproveOrder = (order) => {
    if (order.firebaseKey) {
      if (order.type === 'wallet' && !order.status.includes('สำเร็จ')) {
        creditUserWallet(order.player, order.price);
      }
      updateRealtimeOrderStatus(order.firebaseKey, '✅ สำเร็จ (แอดมินอนุมัติแล้ว)');
      
      // ส่งแจ้งเตือน LINE อัปเดตสถานะ
      sendLineNotification(`✅ **ออร์เดอร์อนุมัติแล้ว!**\nเลขออร์เดอร์: ${order.id}\nผู้ใช้: ${order.player}\nยอด: ฿${order.price.toLocaleString()}`);

      if (order.firebaseKey === activeOrderFirebaseKey) {
        setFloatingTimer(0);
        setActiveOrderFirebaseKey(null);
      }
    }
  };

  const handleAdminRejectOrder = (order) => {
    if (order.firebaseKey) {
      updateRealtimeOrderStatus(order.firebaseKey, '❌ ยกเลิก (ไม่พบยอดโอนเงิน)');

      // ส่งแจ้งเตือน LINE อัปเดตสถานะ
      sendLineNotification(`❌ **ออร์เดอร์ถูกยกเลิก!**\nเลขออร์เดอร์: ${order.id}\nผู้ใช้: ${order.player}`);

      if (order.firebaseKey === activeOrderFirebaseKey) {
        setFloatingTimer(0);
        setActiveOrderFirebaseKey(null);
      }
    }
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

  const filteredOrders = orders.filter((ord) => {
    const q = adminSearchQuery.trim();
    if (!q) return true;

    const lowerQ = q.toLowerCase();
    const isOrderQuery = lowerQ.startsWith('ord');

    if (isOrderQuery) {
      return ord.id.toLowerCase() === lowerQ;
    } else {
      return ord.player.toLowerCase().includes(lowerQ);
    }
  });

  const adminItemsPerPage = 10;
  const totalAdminPages = Math.ceil(filteredOrders.length / adminItemsPerPage) || 1;
  const paginatedAdminOrders = filteredOrders.slice((adminOrdersPage - 1) * adminItemsPerPage, adminOrdersPage * adminItemsPerPage);

  const isUserAdmin = user && (user.username.toLowerCase() === 'thanphooms' || user.email.toLowerCase() === 'thanphooms@gmail.com');

  const nowObj = new Date();
  const currentDayStr = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`;

  const searchedOrders = orders.filter(o => {
    let matchUser = false;
    if (!isUserAdmin) {
      matchUser = user && (
        o.player.toLowerCase() === user.username.toLowerCase() || 
        o.player.toLowerCase() === user.email.toLowerCase()
      );
    } else {
      const q = exactSearchQuery.trim().toLowerCase();
      matchUser = !q || (o.player.toLowerCase() === q) || (o.id.toLowerCase() === q);
    }

    const orderQuery = customerOrderSearch.trim();
    const matchOrder = !orderQuery || (orderQuery.toUpperCase().startsWith('ORD') ? o.id.toLowerCase() === orderQuery.toLowerCase() : o.id.toLowerCase().includes(orderQuery.toLowerCase()));

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
  };return (
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
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ fontSize: '22px' }}>⏳</div>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>ระบบกำลังเติมเงิน</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#34d399' }}>กำลังรอแอดมินอนุมัติ ({floatingTimer}s)</div>
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
            <div style={{ fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>👤 ผู้ใช้: </span><b style={{ color: '#c084fc' }}>{user.email || user.username}</b></div>
            <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>💰 เครดิตร้าน: </span><b style={{ color: '#34d399' }}>฿{(user.balance || 0).toLocaleString()}</b></div>
            
            <button 
              onClick={() => { setShowTopupWalletModal(true); setWalletStep(1); }} 
              style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(147,51,234,0.5)', transition: 'all 0.25s ease' }}
            >
              + เติมเครดิต
            </button>
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => { setActiveTab('shop'); setSelectedGame(null); }} 
              style={{ backgroundColor: activeTab === 'shop' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              ✨ หน้าแรก
            </button>
            
            <button 
              onClick={() => setActiveTab('track')} 
              style={{ backgroundColor: activeTab === 'track' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              📋 เช็คสถานะ
            </button>
            
            {isUserAdmin && (
              <button 
                onClick={() => setActiveTab('admin')} 
                style={{ backgroundColor: activeTab === 'admin' ? '#9333ea' : 'rgba(31, 41, 55, 0.8)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                ⚙️ หลังบ้าน
              </button>
            )}

            <button 
              onClick={handleLogout} 
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              🚪 ออกจากระบบ
            </button>
          </nav>
        </div>
      </header>

      <a href="https://lin.ee/Nn1UeBC" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 99, backgroundColor: '#06c755', color: '#ffffff', padding: '12px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 25px rgba(6, 199, 85, 0.6)', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #ffffff' }}>
        <div style={{ width: '22px', height: '22px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: '#06c755', fontWeight: '900', lineHeight: '1' }}>L</span>
        </div>
        ติดต่อแอดมิน (LINE OA)
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
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc', border: '1px solid #c084fc', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                ⚡ ระบบเติมเกมอัตโนมัติออนไลน์ 24 ชั่วโมง
              </span>
              <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '16px 0 10px 0', textShadow: '0 0 25px rgba(168,85,247,0.8)' }}>
                เติมเกมสะดวกรวดเร็ว <br/><span style={{ color: '#38bdf8' }}>ราคาถูกที่สุด คุ้มค่าที่สุด</span>
              </h1>
              <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 25px 0', maxWidth: '650px' }}>
                เลือกเกมโปรดของคุณ เติมไวภายใน 1 นาที รองรับทั้ง VALORANT, PUBG, ROV, Avatar Star, Genshin Impact และเกมดังอื่นๆ อีกมากมาย
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
                  <input type="text" placeholder="🔍 ค้นหาชื่อเกม..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
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
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                🔥 เลือกเกมที่ต้องการเติมเงิน ({filteredGames.length} เกม)
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px', marginBottom: '35px' }}>
              {filteredGames.map((game) => (
                <div 
                  key={game.id} 
                  onClick={() => { setSelectedGame(game); setSelectedPackage(null); setPackageQuantity(1); setPlayerId(''); }} 
                  style={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.85)', 
                    border: '1.5px solid rgba(168, 85, 247, 0.35)', 
                    borderRadius: '20px', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    transition: 'all 0.35s ease', 
                    boxShadow: '0 6px 25px rgba(0,0,0,0.6)',
                    position: 'relative'
                  }} 
                >
                  <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                    <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#c084fc', border: '1px solid #c084fc', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{game.badge}</span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{game.name}</h3>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 12px 0' }}>{game.publisher}</p>
                    <button style={{ width: '100%', backgroundColor: '#9333ea', border: 'none', color: '#ffffff', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>คลิกเพื่อเติมเงิน →</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid rgba(56, 189, 248, 0.6)', borderRadius: '20px', padding: '25px 30px', marginBottom: '35px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 15px 0' }}>📊 สถานะโค้ดกิจกรรมคงเหลือแยกตามเกม (Realtime)</h3>
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

            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid rgba(56, 189, 248, 0.6)', borderRadius: '20px', padding: '25px 30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 15px 0' }}>🎁 กรอกโค้ดของขวัญ / โค้ดกิจกรรมจากแอดมิน</h3>
              {eventMsg.text && (
                <div style={{ backgroundColor: eventMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${eventMsg.type === 'success' ? '#34d399' : '#ef4444'}`, color: eventMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '15px' }}>
                  {eventMsg.text}
                </div>
              )}
              <form onSubmit={handleRedeemEventCode} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>1. เลือกเกม</label>
                  <select value={eventGame} onChange={(e) => setEventGame(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}>
                    {gamesData.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>2. ชื่อในเกม หรือ UID</label>
                  <input type="text" placeholder="ระบุไอดีหรือชื่อในเกม..." value={eventPlayerId} onChange={(e) => setEventPlayerId(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>3. โค้ดของขวัญ (Gift Code)</label>
                  <input type="text" placeholder="กรอกโค้ดกิจกรรม..." value={eventGiftCode} onChange={(e) => setEventGiftCode(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>✨ ยืนยันรับสิทธิ์โค้ด</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.5)' }}>
            <button onClick={() => setSelectedGame(null)} style={{ backgroundColor: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>← กลับไปหน้าเลือกเกม</button>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
              <img src={selectedGame.image} alt={selectedGame.name} style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #a855f7' }} />
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px 0' }}>{selectedGame.name}</h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>ผู้ให้บริการ: {selectedGame.publisher} | เลือกแพ็กเกจด้านล่างเพื่อเติมเงิน</p>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '13px', color: '#c084fc', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>1. ชื่อในเกม หรือ UID</label>
              <input type="text" placeholder="ระบุชื่อในเกม หรือ UID ของท่าน..." value={playerId} onChange={(e) => setPlayerId(e.target.value)} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
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
                      borderRadius: '16px', padding: '16px', cursor: 'pointer', transition: 'all 0.25s ease'
                    }}
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
                    <button type="button" onClick={() => setPackageQuantity(Math.max(1, packageQuantity - 1))} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                    <input type="text" readOnly value={packageQuantity} style={{ width: '45px', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', outline: 'none' }} />
                    <button type="button" onClick={() => setPackageQuantity(packageQuantity + 1)} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
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
                      borderRadius: '14px', padding: '14px', cursor: 'pointer', transition: 'all 0.25s ease'
                    }}
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
                    <input type="text" inputMode="numeric" maxLength={10} placeholder="เช่น 0812345678" value={truemoneyPhone} onChange={(e) => setTruemoneyPhone(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {selectedPayment.id === 'truemoneycard' && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>รหัสบัตรเติมเงิน TrueMoney (14 หลัก)</label>
                    <input type="text" inputMode="numeric" maxLength={14} placeholder="กรอกรหัสบัตร 14 หลัก..." value={truemoneyCard14} onChange={(e) => setTruemoneyCard14(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', maxWidth: '350px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '14px', letterSpacing: '2px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {selectedPayment.id === 'credit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>หมายเลขบัตรเครดิต/เดบิต (16 หลัก)</label>
                      <input type="text" inputMode="numeric" placeholder="4111 2222 3333 4444" value={creditCardNum} onChange={handleCreditCardNumChange} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1.5px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>วันหมดอายุ (MM/YY)</label>
                        <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={handleCreditCardExpChange} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CVV (3 หลัก)</label>
                        <input type="password" inputMode="numeric" maxLength={3} placeholder="123" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
                      </div>
                    </div>
                  </div>
                )}
                {selectedPayment.id === 'qrcode' && (
                  <div style={{ fontSize: '13px', color: '#34d399' }}>✅ ระบบจะสร้าง QR Code อัตโนมัติในขั้นตอนถัดไปเพื่อสแกนผ่าน Mobile Banking (ต้องยืนยันรหัสผ่านบัญชี)</div>
                )}
                {selectedPayment.id === 'wallet' && (
                  <div style={{ fontSize: '13px', color: '#34d399' }}>🔒 เพื่อความปลอดภัย ระบบจะให้ท่านยืนยันรหัสผ่านบัญชีก่อนหักเงินจากเครดิตร้าน (ยอดคงเหลือ: ฿{(user.balance || 0).toLocaleString()})</div>
                )}
              </div>
            )}

            <button 
              disabled={!playerId.trim() || !selectedPackage || !selectedPayment}
              onClick={handleStartGamePayment} 
              style={{ 
                width: '100%', 
                backgroundColor: (!playerId.trim() || !selectedPackage || !selectedPayment) ? '#374151' : '#9333ea', 
                color: '#ffffff', border: 'none', padding: '16px', borderRadius: '14px', 
                fontWeight: 'bold', fontSize: '16px', cursor: (!playerId.trim() || !selectedPackage || !selectedPayment) ? 'not-allowed' : 'pointer',
                boxShadow: (!playerId.trim() || !selectedPackage || !selectedPayment) ? 'none' : '0 0 25px rgba(147,51,234,0.6)'
              }}
            >
              {!playerId.trim() ? 'กรุณากรอกชื่อในเกม หรือ UID (ห้ามเว้นว่าง)' : !selectedPackage ? 'กรุณาเลือกแพ็กเกจเติมเกม' : !selectedPayment ? 'กรุณาเลือกช่องทางชำระเงิน' : `ยืนยันชำระเงิน ฿${(selectedPackage.price * packageQuantity).toLocaleString()} (${packageQuantity} แพ็ก)`}
            </button>
          </div>
        )}

        {activeTab === 'track' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 35px rgba(0,0,0,0.7)' }}>
            <div style={{ borderBottom: '1px solid #374151', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>📋 เช็คสถานะคำสั่งซื้อและประวัติการทำรายการ</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c084fc' }}>
                <span>👤 บัญชีผู้ใช้งาน:</span>
                <b style={{ color: '#ffffff', backgroundColor: 'rgba(147,51,234,0.3)', padding: '2px 10px', borderRadius: '6px', border: '1px solid #9333ea' }}>{user.email || user.username}</b>
                {!isUserAdmin && <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '6px' }}>(แสดงเฉพาะประวัติคำสั่งซื้อของคุณเอง)</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder={isUserAdmin ? "🔍 ค้นหาชื่อบัญชีลูกค้า/อีเมล..." : (user.email || user.username)}
                value={isUserAdmin ? exactSearchQuery : (user.email || user.username)} 
                disabled={!isUserAdmin}
                onChange={(e) => isUserAdmin && setExactSearchQuery(e.target.value)} 
                style={{ flex: 1, minWidth: '180px', backgroundColor: isUserAdmin ? '#030712' : '#1f2937', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', cursor: isUserAdmin ? 'text' : 'not-allowed', fontWeight: 'bold', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                placeholder="🔍 กรอกเลขออร์เดอร์ เช่น ORD-14969..." 
                value={customerOrderSearch} 
                onChange={(e) => setCustomerOrderSearch(e.target.value)} 
                style={{ flex: 1.5, minWidth: '220px', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} 
              />
              <select value={selectedGameFilter} onChange={(e) => setSelectedGameFilter(e.target.value)} style={{ flex: 1, minWidth: '150px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', outline: 'none', cursor: 'pointer' }}>
                <option value="all">🎮 เลือกดูเกม (ทั้งหมด)</option>
                {gamesData.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 12px' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>📅 ปฏิทิน:</span>
                <input type="date" value={selectedDateFilter} onChange={(e) => setSelectedDateFilter(e.target.value)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ffffff', fontSize: '13px', outline: 'none', padding: '10px 0', cursor: 'pointer', colorScheme: 'dark' }} />
              </div>
            </div>

            <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>ผลการค้นหา: <b style={{ color: '#ffffff' }}>{searchedOrders.length}</b> รายการ (วันนี้: {todayOrders.length} | ประวัติย้อนหลัง: {pastOrders.length})</span>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>ยอดรวมเงินที่เติม: <b style={{ color: '#34d399', fontSize: '18px' }}>฿{totalSpentInSearch.toLocaleString()}</b></span>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>📅 รายการประจำวัน (วันนี้ {currentDayStr})</h3>
              {paginatedTodayOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                  {paginatedTodayOrders.map((ord, idx) => {
                    const globalIdx = (customerOrdersPage - 1) * customerItemsPerPage + idx + 1;
                    let countdownSec = 0;
                    if (ord.status.includes('รอตรวจสอบ') && ord.timestamp) {
                      const elapsed = Math.floor((Date.now() - ord.timestamp) / 1000);
                      countdownSec = Math.max(0, 10 - elapsed);
                    }
                    return (
                      <div key={ord.firebaseKey || idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '12px', marginRight: '4px' }}>#{globalIdx}</span>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#ffffff' }}>🎮 {ord.game} <span style={{ color: '#c084fc', fontSize: '13px' }}>({ord.package})</span></div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>บัญชีทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b> {ord.gameChar && <span style={{ color: '#34d399' }}>| ตัวละคร/UID: {ord.gameChar}</span>} | ช่องทางจ่าย: <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{ord.paymentMethod || 'Cyber Wallet'}</span></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>฿{ord.price.toLocaleString()}</div>
                          {ord.status.includes('รอตรวจสอบ') ? (
                            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '4px 8px', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>⏱️ อนุมัติออโต้ใน ({countdownSec}s)</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b', fontWeight: 'bold' }}>{ord.status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', backgroundColor: '#030712', borderRadius: '14px', border: '1px dashed #374151', marginBottom: '15px' }}>ไม่มีรายการคำสั่งซื้อใหม่ในวันนี้</div>
              )}

              {totalCustomerTodayPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                  {Array.from({ length: totalCustomerTodayPages }, (_, i) => i + 1).map((pageNum) => (
                    <button key={pageNum} onClick={() => setCustomerOrdersPage(pageNum)} style={{ backgroundColor: customerOrdersPage === pageNum ? '#9333ea' : '#030712', color: '#ffffff', border: '1px solid ' + (customerOrdersPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                  ))}
                </div>
              )}
            </div>

            {pastOrders.length > 0 && (
              <div style={{ backgroundColor: '#030712', border: '1.5px solid rgba(168,85,247,0.4)', borderRadius: '16px', overflow: 'hidden' }}>
                <div onClick={() => setIsPastOrdersOpen(!isPastOrdersOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '16px 20px', backgroundColor: 'rgba(147, 51, 234, 0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(168,85,247,0.3)', border: '1px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>{isPastOrdersOpen ? '▼' : '▶'}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>📂 ประวัติย้อนหลัง (รายการจากวันก่อนหน้า)</h3>
                  </div>
                  <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{pastOrders.length} รายการ</span>
                </div>

                {isPastOrdersOpen && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 'bold' }}>📅 เลือกวันที่ประวัติ:</span>
                      <select value={selectedHistoryDate} onChange={handleHistoryDateChange} style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '8px 14px', color: '#38bdf8', fontWeight: 'bold', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                        <option value="all">🌐 แสดงประวัติย้อนหลังทั้งหมด ({pastOrders.length} รายการ)</option>
                        {availableHistoryDates.map((dateStr) => (
                          <option key={dateStr} value={dateStr}>📅 วันที่ {dateStr} ({groupedPastOrders[dateStr].length} รายการ)</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {paginatedPastOrders.map((ord, idx) => {
                        const globalIdx = (historyPage - 1) * historyItemsPerPage + idx + 1;
                        return (
                          <div key={ord.firebaseKey || idx} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold' }}>#{globalIdx}</span>
                                <span style={{ backgroundColor: '#374151', color: '#d1d5db', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>📅 {ord.time}</span>
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d1d5db' }}>🎮 {ord.game} <span style={{ color: '#a855f7', fontSize: '12px' }}>({ord.package})</span></div>
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>บัญชีทำรายการ: {ord.player} {ord.gameChar && <span style={{ color: '#34d399' }}>| ตัวละคร/UID: {ord.gameChar}</span>} | ช่องทางจ่าย: <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{ord.paymentMethod || 'Cyber Wallet'}</span></div>
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
                          <button key={pageNum} onClick={() => setHistoryPage(pageNum)} style={{ backgroundColor: historyPage === pageNum ? '#9333ea' : '#111827', color: '#ffffff', border: '1px solid ' + (historyPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{pageNum}</button>
                        ))}
                      </div>
                    )}
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
                  <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>เข้าสู่ระบบแอดมิน</button>
                </form>
              </div>
            ) : (
              <>
                {/* ส่วนการตั้งค่า LINE Notify & LINE Token */}
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #06c755', boxShadow: '0 0 25px rgba(6,199,85,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#06c755', margin: 0 }}>💬 การตั้งค่าแจ้งเตือนเข้า LINE OA / LINE Notify</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#ffffff', fontWeight: 'bold' }}>
                      <input type="checkbox" checked={isLineNotifyEnabled} onChange={(e) => setIsLineNotifyEnabled(e.target.checked)} />
                      เปิดระบบแจ้งเตือน LINE
                    </label>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>LINE Notify Token / LINE Webhook Secret Token</label>
                    <input 
                      type="password" 
                      placeholder="วาง LINE Token สำหรับยิงแจ้งเตือนออร์เดอร์ใหม่เข้าแอดมิน..." 
                      value={lineToken} 
                      onChange={(e) => setLineToken(e.target.value)} 
                      style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                    <div style={{ fontSize: '11px', color: '#06c755', marginTop: '6px' }}>
                      {isLineNotifyEnabled ? '✅ สถานะ: พร้อมส่งแจ้งเตือนออร์เดอร์การเติมเงินและสั่งซื้อสินค้าไปยัง LINE ร้านค้า' : '⏸️ สถานะ: ระบบ LINE ปิดใช้งานอยู่'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 25px rgba(56,189,248,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🔐 เปลี่ยนรหัส PIN 6 หลัก</h3>
                        <button onClick={() => { setIsAdminLoggedIn(false); localStorage.removeItem('cyber_is_admin_logged'); }} style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>ล็อกเอาท์ PIN</button>
                      </div>
                      {changePinMessage.text && (
                        <div style={{ backgroundColor: changePinMessage.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: changePinMessage.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>{changePinMessage.text}</div>
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
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>✨ บันทึกเปลี่ยนรหัส PIN ใหม่</button>
                    </form>
                  </div>

                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #ec4899', boxShadow: '0 0 25px rgba(236,72,153,0.2)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f472b6', margin: '0 0 12px 0' }}>📢 บันทึกรายการโปรโมทเว็บ / ค่าโฆษณา</h3>
                    <form onSubmit={handleAddAdPromotion} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '8px', marginBottom: '15px' }}>
                      <select value={adPlatform} onChange={(e) => setAdPlatform(e.target.value)} style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '12px', outline: 'none' }}>
                        <option value="Facebook Ads">Facebook Ads</option>
                        <option value="TikTok Ads">TikTok Ads</option>
                        <option value="Google / YouTube Ads">Google / YouTube Ads</option>
                        <option value="Instagram Ads">Instagram Ads</option>
                        <option value="LINE Official Account">LINE Official Account</option>
                        <option value="อื่นๆ (Custom)">อื่นๆ (Custom)</option>
                      </select>
                      <input type="number" placeholder="ยอดเงิน (บาท)" value={adAmountInput} onChange={(e) => setAdAmountInput(e.target.value)} style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                      <button type="submit" style={{ backgroundColor: '#ec4899', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>+ เพิ่ม</button>
                    </form>
                    <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '10px', minHeight: '165px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {adPromotions.length > 0 ? (
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
                      ) : (
                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', padding: '20px 0' }}>ยังไม่มีรายการโปรโมทเว็บ</div>
                      )}
                      {totalAdPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #1f2937', paddingTop: '8px' }}>
                          {Array.from({ length: totalAdPages }, (_, i) => i + 1).map((pageNum) => (
                            <button key={pageNum} onClick={() => setAdPage(pageNum)} style={{ backgroundColor: adPage === pageNum ? '#ec4899' : '#111827', color: '#ffffff', border: '1px solid ' + (adPage === pageNum ? '#f472b6' : '#374151'), borderRadius: '6px', padding: '3px 8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>{pageNum}</button>
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

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', border: '1.5px solid rgba(147,51,234,0.5)', overflow: 'hidden' }}>
                  <div onClick={() => setIsAdminOrdersOpen(!isAdminOrdersOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '20px 25px', backgroundColor: 'rgba(147, 51, 234, 0.15)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#ffffff' }}>📊 รายการทำรายการหลังบ้าน + ช่องทางที่ลูกค้าชำระเงิน</h2>
                    <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.3)', color: '#c084fc', border: '1px solid #9333ea', padding: '4px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold' }}>{filteredOrders.length} รายการ</span>
                  </div>

                  {isAdminOrdersOpen && (
                    <div style={{ padding: '25px' }}>
                      <input type="text" placeholder="🔍 ค้นหาเลขออร์เดอร์ หรือชื่อบัญชีลูกค้า/อีเมล..." value={adminSearchQuery} onChange={(e) => { setAdminSearchQuery(e.target.value); setAdminOrdersPage(1); }} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                        {paginatedAdminOrders.map((ord, idx) => {
                          let adminCountdownSec = 0;
                          if (ord.status.includes('รอตรวจสอบ') && ord.timestamp) {
                            const elapsed = Math.floor((Date.now() - ord.timestamp) / 1000);
                            adminCountdownSec = Math.max(0, 10 - elapsed);
                          }
                          return (
                            <div key={ord.firebaseKey || idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                  <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                                  <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{ord.game} <span style={{ color: '#c084fc', fontSize: '14px' }}>({ord.package})</span></div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>บัญชีทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b> {ord.gameChar && <span style={{ color: '#34d399' }}>| ตัวละคร/UID: {ord.gameChar}</span>} | ยอดขาย: <b style={{ color: '#ffffff' }}>฿{ord.price.toLocaleString()}</b></div>
                                <div style={{ fontSize: '12px', color: '#f472b6', marginTop: '4px', fontWeight: 'bold' }}>💳 ช่องทางชำระเงิน: {ord.paymentMethod || 'Cyber Wallet (เครดิตร้าน)'}</div>
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
                                  <div>
                                    <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '6px' }}>⏱️ อนุมัติออโต้ใน ({adminCountdownSec}s)</div>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                      <button onClick={() => handleAdminApproveOrder(ord)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>✅ อนุมัติ</button>
                                      <button onClick={() => handleAdminRejectOrder(ord)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>❌ ยกเลิก</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>{ord.status}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {totalAdminPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                          {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((pageNum) => (
                            <button key={pageNum} onClick={() => setAdminOrdersPage(pageNum)} style={{ backgroundColor: adminOrdersPage === pageNum ? '#9333ea' : '#030712', color: '#ffffff', border: '1px solid ' + (adminOrdersPage === pageNum ? '#a855f7' : '#374151'), borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{pageNum}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🎁 สร้างและจัดการโค้ดของขวัญ / โค้ดกิจกรรม (Realtime Cloud)</h3>
                    <button onClick={handleResetAllRedeemRights} style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🔄 รีเซ็ตสิทธิ์ ID เกมทั้งหมด</button>
                  </div>

                  {adminCodeMsg.text && (
                    <div style={{ backgroundColor: adminCodeMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: adminCodeMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>{adminCodeMsg.text}</div>
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
                        <button type="button" onClick={() => setNewCodeMaxUses(Math.max(1, newCodeMaxUses - 1))} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                        <input type="text" readOnly value={newCodeMaxUses} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#ffffff', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', outline: 'none' }} />
                        <button type="button" onClick={() => setNewCodeMaxUses(newCodeMaxUses + 1)} style={{ backgroundColor: 'rgba(147,51,234,0.3)', color: '#a855f7', border: 'none', padding: '8px 14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ สร้างโค้ดกิจกรรมใหม่ (บันทึกลงเรียลไทม์)</button>
                    </div>
                  </form>

                  <h4 style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 10px 0' }}>📋 รายการโค้ดที่มีในระบบปัจจุบัน ({giftCodes.length} โค้ด)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {giftCodes.map((c) => (
                      <div key={c.firebaseKey || c.code} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginRight: '8px' }}>{c.code}</span>
                          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>[{c.game}]</span>
                          <span style={{ color: '#34d399', fontSize: '13px', marginLeft: '10px' }}>🎁 {c.reward}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>ใช้ไปแล้ว: <b style={{ color: '#ffffff' }}>{c.usedCount}</b> / {c.maxUses} สิทธิ์</span>
                          <button onClick={() => handleDeleteGiftCode(c)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>ลบ</button>
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
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>🔐 ยืนยันรหัสผ่านบัญชี</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>กรุณากรอกรหัสผ่านบัญชีของคุณเพื่อยืนยันการทำรายการ</p>

                <div style={{ backgroundColor: '#030712', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left', border: '1px solid #374151' }}>
                  <div style={{ fontSize: '13px', color: '#ffffff', marginBottom: '4px' }}>🎮 เกม: <b>{selectedGame.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '4px' }}>📦 แพ็กเกจ: <b>{selectedPackage.name} (x{packageQuantity} แพ็ก)</b></div>
                  <div style={{ fontSize: '13px', color: '#34d399', marginBottom: '4px' }}>💰 ยอดชำระ: <b>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b></div>
                  <div style={{ fontSize: '13px', color: '#c084fc', marginBottom: '4px' }}>💳 ช่องทาง: <b>{selectedPayment.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#c084fc' }}>👤 ตัวละคร/UID: <b>{playerId}</b></div>
                </div>

                {checkoutPasswordError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>{checkoutPasswordError}</div>}

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <input type={showCheckoutPassword ? 'text' : 'password'} placeholder="กรอกรหัสผ่านบัญชีของคุณ..." value={checkoutPassword} onChange={(e) => setCheckoutPassword(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowCheckoutPassword(!showCheckoutPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}><EyeIcon show={showCheckoutPassword} /></button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={resetCheckoutModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>{selectedPayment.id === 'wallet' ? 'ยืนยันหักเครดิตร้าน' : 'ถัดไป →'}</button>
                </div>
              </form>
            )}

            {checkoutStep === 2 && selectedPayment?.id === 'qrcode' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>📱 สแกน QR Code ชำระเงิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>ยอดชำระ: <b style={{ color: '#34d399' }}>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</b></p>
                <div style={{ fontSize: '12px', color: isQrExpired ? '#ef4444' : '#f59e0b', marginBottom: '12px', fontWeight: 'bold' }}>{isQrExpired ? '❌ QR Code หมดอายุแล้ว' : `⏱️ QR Code จะหมดอายุใน: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} นาที`}</div>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '160px', height: '160px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isQrExpired ? 0.4 : 1 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Game-${selectedGame.name}-${selectedPackage.price * packageQuantity}`} alt="QR Code" style={{ width: '140px', height: '140px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: '1px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button disabled={isQrExpired} onClick={handleFinalPaymentSubmit} style={{ flex: 1, backgroundColor: isQrExpired ? '#374151' : '#34d399', color: isQrExpired ? '#9ca3af' : '#000000', border: '1px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isQrExpired ? 'not-allowed' : 'pointer' }}>ฉันโอนเงินแล้ว</button>
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
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>ระบบได้ส่งรหัส OTP ไปยังเบอร์ <b style={{ color: '#ffffff' }}>{truemoneyPhone}</b> แล้ว (ลองกรอกตัวเลข 6 หลัก)</p>
                {trueMoneyOtpError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>{trueMoneyOtpError}</div>}
                <input type="text" inputMode="numeric" maxLength={6} placeholder="------" value={trueMoneyOtpCode} onChange={(e) => setTrueMoneyOtpCode(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #38bdf8', borderRadius: '12px', padding: '14px', color: '#ffffff', fontSize: '24px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '8px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setTrueMoneyOtpStep(false)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยืนยัน OTP</button>
                </div>
              </form>
            ) : walletStep === 1 ? (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>💳 เติมเครดิตเข้า Cyber Wallet</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>กรอกจำนวนเงินและเลือกช่องทางชำระเงิน</p>
                <input type="text" inputMode="numeric" placeholder="ระบุจำนวนเงิน (บาท)..." value={topupAmount} onChange={(e) => setTopupAmount(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', fontSize: '20px', textAlign: 'center', fontWeight: 'bold', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' }} />
                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>เลือกช่องทางชำระเงิน</label>
                  <select value={walletPaymentMethod} onChange={(e) => setWalletPaymentMethod(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', fontSize: '13px', outline: 'none' }}>
                    <option value="qrcode">QR PromptPay</option>
                    <option value="true">TrueMoney Wallet (เบอร์ 10 หลัก)</option>
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
                      <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={handleCreditCardExpChange} style={{ flex: 1, backgroundColor: '#111827', border: '1.5px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }} />
                      <input type="password" placeholder="CVV" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} style={{ flex: 1, backgroundColor: '#111827', border: '1.5px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button 
                    disabled={!topupAmount || parseFloat(topupAmount) <= 0 || (walletPaymentMethod === 'true' && (!truemoneyPhone || truemoneyPhone.length < 10))} 
                    onClick={walletPaymentMethod === 'qrcode' ? () => setWalletStep(2) : walletPaymentMethod === 'true' ? () => {
                      if (!truemoneyPhone || truemoneyPhone.length < 10) {
                        alert('กรุณากรอกเบอร์ TrueMoney Wallet ให้ครบ 10 หลัก');
                        return;
                      }
                      setTrueMoneyOtpStep(true);
                      setTrueMoneyOtpCode('');
                      setTrueMoneyOtpError('');
                    } : handleWalletConfirmPayment} 
                    style={{ flex: 1, backgroundColor: (!topupAmount || parseFloat(topupAmount) <= 0) ? '#374151' : '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {walletPaymentMethod === 'qrcode' ? 'ถัดไป (สแกน QR) →' : walletPaymentMethod === 'true' ? 'ส่งรหัส OTP →' : 'ยืนยันการเติมเงิน'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>📱 สแกน QR Code เติมเครดิต</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>ยอดชำระ: <b style={{ color: '#34d399' }}>฿{parseFloat(topupAmount).toLocaleString()}</b></p>
                <div style={{ fontSize: '12px', color: isWalletQrExpired ? '#ef4444' : '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>{isWalletQrExpired ? '❌ QR Code หมดอายุแล้ว' : `⏱️ QR Code จะหมดอายุใน: ${Math.floor(walletTimeLeft / 60)}:${(walletTimeLeft % 60).toString().padStart(2, '0')} นาที`}</div>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '160px', height: '160px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isWalletQrExpired ? 0.4 : 1 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Topup-Wallet-${topupAmount}`} alt="Topup QR Code" style={{ width: '140px', height: '140px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setWalletStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: '1.5px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← ย้อนกลับ</button>
                  <button disabled={isWalletQrExpired} onClick={handleWalletConfirmPayment} style={{ flex: 1, backgroundColor: isWalletQrExpired ? '#374151' : '#34d399', color: isWalletQrExpired ? '#9ca3af' : '#000000', border: '1.5px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isWalletQrExpired ? 'not-allowed' : 'pointer' }}>ฉันโอนเงินเรียบร้อยแล้ว</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '13px' }}>
        <p style={{ margin: 0 }}>⚡ <b>CYBER TOPUP</b> - บริการเติมเกมออนไลน์ ตลอด 24 ชั่วโมง</p>
      </footer>
    </div>
  );
}
