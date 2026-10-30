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
      
      {/* NAVBAR */}
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

      {/* FLOATING LINE OA WIDGET */}
      <a href="https://lin.ee/Nn1UeBC" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 99, backgroundColor: '#06c755', color: '#ffffff', padding: '12px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 25px rgba(6, 199, 85, 0.6)', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #ffffff', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.06)'; e.currentTarget.style.boxShadow = '0 8px 35px rgba(6, 199, 85, 0.9)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 25px rgba(6, 199, 85, 0.6)'; }}
      >
        <div style={{ width: '22px', height: '22px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: '#06c755', fontWeight: '900', lineHeight: '1' }}>L</span>
        </div>
        ติดต่อแอดมิน (LINE)
      </a>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* SHOP MAIN PAGE */}
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
                  onClick={() => { setSelectedGame(game); setSelectedPackage(null); setPlayerId(user.username); }} 
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

            {/* ช่องกรอกโค้ดของขวัญ / โค้ดกิจกรรมจากแอดมิน */}
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
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>จำกัดสิทธิ์ 1 บัญชีผู้ใช้ กรอกโค้ดรับรางวัลได้เพียง 1 ครั้งเท่านั้น</p>
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

        {/* GAME DETAIL & PACKAGES */}
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
                    onClick={() => setSelectedPackage(pkg)} 
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

            <button 
              disabled={!playerId.trim() || !selectedPackage || !selectedPayment}
              onClick={() => { setShowCheckoutModal(true); setCheckoutStep(1); }} 
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
              {!playerId.trim() ? 'กรุณากรอกชื่อผู้ใช้ / ID เกม' : !selectedPackage ? 'กรุณาเลือกแพ็กเกจเติมเงิน' : !selectedPayment ? 'กรุณาเลือกช่องทางชำระเงิน' : `ยืนยันชำระเงิน ฿${selectedPackage.price.toLocaleString()}`}
            </button>
          </div>
        )}

        {/* TRACK STATUS TAB */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 35px rgba(0,0,0,0.7)' }}>
            <div style={{ borderBottom: '1px solid #374151', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>📋 เช็คสถานะคำสั่งซื้อและประวัติการทำรายการ</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c084fc' }}>
                <span>👤 บัญชีผู้ใช้งาน:</span>
                <b style={{ color: '#ffffff', backgroundColor: 'rgba(147,51,234,0.3)', padding: '2px 10px', borderRadius: '6px', border: '1px solid #9333ea' }}>{user.username}</b>
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
                ผลการค้นหา: <b style={{ color: '#ffffff' }}>{searchedOrders.length}</b> รายการ
              </span>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                ยอดรวมเงินที่เติม {selectedGameFilter !== 'all' && `(${selectedGameFilter})`}: <b style={{ color: '#34d399', fontSize: '18px' }}>฿{totalSpentInSearch.toLocaleString()}</b>
              </span>
            </div>

            <div>
              {searchedOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {searchedOrders.map((ord, idx) => (
                    <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                          <span style={{ fontSize: '12px', color: '#38bdf8' }}>📅 {ord.time}</span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#ffffff' }}>🎮 {ord.game} <span style={{ color: '#c084fc', fontSize: '13px' }}>({ord.package})</span></div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>ชื่อผู้ทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>฿{ord.price.toLocaleString()}</div>
                        <span style={{ fontSize: '11px', color: ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b', fontWeight: 'bold' }}>{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#030712', borderRadius: '14px', border: '1px dashed #374151' }}>
                  ไม่พบประวัติคำสั่งซื้อที่ค้นหา
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
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
                {/* 1. ส่วนเปลี่ยน PIN */}
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 25px rgba(56,189,248,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🔑 เปลี่ยนรหัส PIN 6 หลัก (แอดมิน)</h3>
                    <button onClick={() => setIsAdminLoggedIn(false)} style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >ล็อกเอาท์ PIN</button>
                  </div>
                  {changePinMessage.text && (
                    <div style={{ backgroundColor: changePinMessage.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: changePinMessage.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px' }}>
                      {changePinMessage.text}
                    </div>
                  )}
                  <form onSubmit={handleChangePinSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. รหัส PIN เดิม</label>
                      <input type="password" maxLength={6} placeholder="PIN เดิม" value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. รหัส PIN ใหม่</label>
                      <input type="password" maxLength={6} placeholder="PIN ใหม่" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>3. ยืนยันรหัส PIN</label>
                      <input type="password" maxLength={6} placeholder="ยืนยัน PIN" value={confirmNewPinInput} onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#ffffff', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ gridColumn: 'span 3', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px', transition: 'all 0.25s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(2, 132, 199, 0.8)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0284c7'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                    >
                      บันทึกการเปลี่ยน PIN
                    </button>
                  </form>
                </div>

                {/* สรุปยอดขาย กำไร และภาษีประจำปี */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '16px', padding: '20px', textAlign: 'center', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(168,85,247,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>💵 ยอดขายรวมทั้งหมด</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#38bdf8' }}>฿{totalAdminSales.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #34d399', borderRadius: '16px', padding: '20px', textAlign: 'center', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(52,211,153,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>📈 กำไรสุทธิรวม</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#34d399' }}>+฿{totalAdminProfits.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: '#030712', border: '1.5px solid #f59e0b', borderRadius: '16px', padding: '20px', textAlign: 'center', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(245,158,11,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>🏛️ เสียภาษีประจำปี (7% จากกำไร)</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b' }}>-฿{totalAdminTax.toLocaleString()}</div>
                  </div>
                </div>

                {/* รายการคำสั่งซื้อหลังบ้าน */}
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #9333ea' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 15px 0' }}>📊 รายการทำรายการหลังบ้าน + สรุปกำไรแต่ละแพ็กเกจ</h2>

                  <input type="text" placeholder="🔍 ค้นหาเลขออร์เดอร์ หรือชื่อลูกค้า..." value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredOrders.map((ord, idx) => (
                      <div key={idx} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{ord.id}</span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>📅 {ord.time}</span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{ord.game} <span style={{ color: '#c084fc', fontSize: '14px' }}>({ord.package})</span></div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                            ลูกค้าผู้ทำรายการ: <b style={{ color: '#38bdf8' }}>{ord.player}</b> | ยอดขาย: <b style={{ color: '#ffffff' }}>฿{ord.price.toLocaleString()}</b>
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

                          {ord.status.includes('รอ') && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleAdminApproveOrder(ord.id)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#059669'; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(16,185,129,0.7)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              >✅ อนุมัติ</button>
                              <button onClick={() => handleAdminRejectOrder(ord.id)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(239,68,68,0.7)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              >❌ ยกเลิก</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ส่วนสร้างโค้ดกิจกรรม + ปุ่มปรับสิทธิ์แบบใหม่ */}
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 25px rgba(56,189,248,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🎁 สร้างและจัดการโค้ดของขวัญ / โค้ดกิจกรรม
                    </h3>
                    
                    <button 
                      onClick={handleResetAllRedeemRights} 
                      style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', boxShadow: '0 0 15px rgba(245,158,11,0.5)', transition: 'all 0.25s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fbbf24'; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.8)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(245,158,11,0.5)'; }}
                    >
                      🔄 รีเซ็ตสิทธิ์โค้ดทุกบัญชี (กิจกรรมประจำปี)
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
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(147,51,234,0.3)'}
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
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(147,51,234,0.3)'}
                        >+</button>
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.25s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(2, 132, 199, 0.8)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0284c7'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                      >
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
                          <button onClick={() => handleDeleteGiftCode(c.id)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.transform = 'scale(1)'; }}
                          >ลบ</button>
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

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && selectedGame && selectedPackage && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
            
            {checkoutStep === 1 && (
              <form onSubmit={handleVerifyPasswordStep}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#c084fc' }}>🔐 ยืนยันรหัสผ่านบัญชี</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>กรุณากรอกรหัสผ่านบัญชีของคุณเพื่อยืนยันการสั่งซื้อ</p>

                <div style={{ backgroundColor: '#030712', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left', border: '1px solid #374151' }}>
                  <div style={{ fontSize: '13px', color: '#ffffff', marginBottom: '4px' }}>🎮 เกม: <b>{selectedGame.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '4px' }}>📦 แพ็กเกจ: <b>{selectedPackage.name}</b></div>
                  <div style={{ fontSize: '13px', color: '#34d399', marginBottom: '4px' }}>💰 ยอดชำระ: <b>฿{selectedPackage.price.toLocaleString()}</b></div>
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
                  <button type="button" onClick={resetCheckoutModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  >ยกเลิก</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(147,51,234,0.5)', transition: 'all 0.25s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.boxShadow = '0 0 20px rgba(168,85,247,0.8)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 15px rgba(147,51,234,0.5)'; }}
                  >ถัดไป →</button>
                </div>
              </form>
            )}

            {checkoutStep === 2 && selectedPayment?.id === 'qrcode' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>📱 สแกน QR Code ชำระเงิน</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>ยอดชำระ: <b style={{ color: '#34d399' }}>฿{selectedPackage.price.toLocaleString()}</b></p>
                <div style={{ fontSize: '12px', color: isQrExpired ? '#ef4444' : '#f59e0b', marginBottom: '12px', fontWeight: 'bold' }}>
                  {isQrExpired ? '❌ QR Code หมดอายุแล้ว' : `⏱️ QR Code จะหมดอายุใน: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} นาที`}
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '16px', width: '160px', height: '160px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isQrExpired ? 0.4 : 1 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Game-${selectedGame.name}-${selectedPackage.price}`} alt="QR Code" style={{ width: '140px', height: '140px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  >← ย้อนกลับ</button>
                  <button 
                    disabled={isQrExpired}
                    onClick={handleFinalPaymentSubmit} 
                    style={{ flex: 1, backgroundColor: isQrExpired ? '#374151' : '#34d399', color: isQrExpired ? '#9ca3af' : '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isQrExpired ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease' }}
                    onMouseEnter={(e) => { if(!isQrExpired) { e.currentTarget.style.backgroundColor = '#6ee7b7'; e.currentTarget.style.boxShadow = '0 0 15px rgba(52,211,153,0.8)'; } }}
                    onMouseLeave={(e) => { if(!isQrExpired) { e.currentTarget.style.backgroundColor = '#34d399'; e.currentTarget.style.boxShadow = 'none'; } }}
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

      {/* MODAL: TOPUP STORE WALLET */}
      {showTopupWalletModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '1.5px solid #9333ea', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
            
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
                    <input type="text" placeholder="หมายเลขบัตร 16 หลัก" value={creditCardNum} onChange={(e) => setCreditCardNum(e.target.value.replace(/[^0-9]/g, ''))} maxLength={16} style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={(e) => setCreditCardExp(e.target.value)} maxLength={5} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                      <input type="password" placeholder="CVV" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  >ยกเลิก</button>
                  <button 
                    disabled={!topupAmount || parseFloat(topupAmount) <= 0}
                    onClick={handleWalletNextStep} 
                    style={{ flex: 1, backgroundColor: (!topupAmount || parseFloat(topupAmount) <= 0) ? '#374151' : '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.25s ease' }}
                    onMouseEnter={(e) => { if(topupAmount && parseFloat(topupAmount) > 0) { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.boxShadow = '0 0 20px rgba(168,85,247,0.8)'; } }}
                    onMouseLeave={(e) => { if(topupAmount && parseFloat(topupAmount) > 0) { e.currentTarget.style.backgroundColor = '#9333ea'; e.currentTarget.style.boxShadow = 'none'; } }}
                  >
                    {walletPaymentMethod === 'qrcode' ? 'ถัดไป (สแกน QR) →' : 'ยืนยันการเติมเครดิต'}
                  </button>
                </div>
              </div>
            )}

            {walletStep === 2 && walletPaymentMethod === 'qrcode' && (
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
                  <button onClick={() => setWalletStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  >← ย้อนกลับ</button>
                  <button 
                    disabled={isWalletQrExpired}
                    onClick={handleWalletConfirmPayment} 
                    style={{ flex: 1, backgroundColor: isWalletQrExpired ? '#374151' : '#34d399', color: isWalletQrExpired ? '#9ca3af' : '#000000', border: '1px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: isWalletQrExpired ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease' }}
                    onMouseEnter={(e) => { if(!isWalletQrExpired) { e.currentTarget.style.backgroundColor = '#6ee7b7'; e.currentTarget.style.boxShadow = '0 0 15px rgba(52,211,153,0.8)'; } }}
                    onMouseLeave={(e) => { if(!isWalletQrExpired) { e.currentTarget.style.backgroundColor = '#34d399'; e.currentTarget.style.boxShadow = 'none'; } }}
                  >
                    ฉันโอนเงินเรียบร้อยแล้ว
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', border: 'top 1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '13px' }}>
        <p style={{ margin: 0 }}>⚡ <b>CYBER TOPUP</b> - บริการเติมเกมออนไลน์ตลอด 24 ชั่วโมง</p>
      </footer>
    </div>
  );
}
