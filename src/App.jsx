import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';

// ตั้งค่า Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD-dgpKK9S2olFLawJ8MKYHi-NWB4GQv7U",
  authDomain: "cyber-topup-game.firebaseapp.com",
  databaseURL: "https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cyber-topup-game",
  storageBucket: "cyber-topup-game.firebasestorage.app",
  messagingSenderId: "191687954752",
  appId: "1:191687954752:web:063d8ce34df50b182feaa5",
  measurementId: "G-2VQP0N3PVZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// สไตล์ CSS สำหรับเอฟเฟคปุ่มทุกปุ่มและองค์ประกอบที่คลิกได้ในเว็บ (Hover & Active Effects)
const cyberGlobalStyles = `
  /* กำหนดคุณสมบัติพื้นฐานของปุ่มทุกปุ่มในเว็บ */
  button, 
  [role="button"], 
  input[type="submit"], 
  input[type="button"],
  .cyber-btn {
    position: relative;
    cursor: pointer !important;
    transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none !important;
  }

  /* เอฟเฟคตอนเมาส์ผ่านและชี้ (Hover Effect) ของทุกปุ่ม */
  button:hover:not(:disabled),
  [role="button"]:hover,
  input[type="submit"]:hover,
  input[type="button"]:hover,
  .cyber-btn:hover {
    transform: translateY(-2.5px) scale(1.025) !important;
    filter: brightness(1.18) contrast(1.05) !important;
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.45), 0 0 15px rgba(56, 189, 248, 0.35) !important;
  }

  /* เอฟเฟคตอนกดปุ่ม (Active / Click Effect) */
  button:active:not(:disabled),
  [role="button"]:active,
  input[type="submit"]:active,
  input[type="button"]:active,
  .cyber-btn:active {
    transform: translateY(1px) scale(0.97) !important;
    filter: brightness(0.95) !important;
    box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3) !important;
  }

  /* ปรับแต่ง Scrollbar สวยงามแบบ Cyberpunk (Request 5: ปรับลูกศรเลื่อนขึ้นลงสวยๆ) */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: #090d16;
    border-radius: 8px;
    border: 1px solid #1f2937;
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #9333ea, #38bdf8);
    border-radius: 8px;
    border: 2px solid #090d16;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #c084fc, #0284c7);
  }

  /* ลูกศรเลื่อนขึ้น (Scroll Up Arrow Button) สไตล์ Cyber Neon สวยงาม คมชัด */
  ::-webkit-scrollbar-button:single-button:vertical:decrement {
    height: 16px;
    width: 10px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #111827;
    border: 1px solid #38bdf8;
    border-radius: 4px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='18 15 12 9 6 15'%3e%3c/polyline%3e%3c/svg%3e");
    cursor: pointer;
  }
  ::-webkit-scrollbar-button:single-button:vertical:decrement:hover {
    background-color: #1f2937;
    border-color: #f472b6;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f472b6' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='18 15 12 9 6 15'%3e%3c/polyline%3e%3c/svg%3e");
  }

  /* ลูกศรเลื่อนลง (Scroll Down Arrow Button) สไตล์ Cyber Neon สวยงาม คมชัด */
  ::-webkit-scrollbar-button:single-button:vertical:increment {
    height: 16px;
    width: 10px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #111827;
    border: 1px solid #38bdf8;
    border-radius: 4px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    cursor: pointer;
  }
  ::-webkit-scrollbar-button:single-button:vertical:increment:hover {
    background-color: #1f2937;
    border-color: #f472b6;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f472b6' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  }

  /* ซ่อนปุ่มแนวนอนที่ไม่จำเป็น */
  ::-webkit-scrollbar-button:single-button:horizontal:decrement,
  ::-webkit-scrollbar-button:single-button:horizontal:increment {
    display: none;
  }

  /* ซ่อน Spin Button เดิมของบราวเซอร์สำหรับ Input Number (Request 2) */
  .no-native-spin::-webkit-inner-spin-button,
  .no-native-spin::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .no-native-spin {
    -moz-appearance: textfield;
  }

  /* ลูกศร Dropdown Select สไตล์โมเดิร์น สวยงาม พรีเมียม (Request 2) */
  .cyber-select {
    appearance: none;
    -webkit-appearance: none;
    background-repeat: no-repeat !important;
    background-position: right 12px center !important;
    background-size: 14px !important;
    padding-right: 36px !important;
    cursor: pointer;
  }
  .cyber-select-pink {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f472b6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  .cyber-select-cyan {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }
  .cyber-select-purple {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c084fc' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  }

  /* สไตล์ Textarea เฉพาะพร้อม Scrollbar และลูกศรเลื่อนขึ้นลงสวยงาม (Request 5) */
  .cyber-textarea {
    scrollbar-color: #38bdf8 #090d16;
    scrollbar-width: thin;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cyber-textarea:focus {
    border-color: #38bdf8 !important;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.35) !important;
  }

  /* เอฟเฟกต์ปุ่ม LINE ลอยสุดพรีเมียม (Floating + Neon Radar Pulse + Shimmer Sweep) */
  @keyframes cyberLineFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-7px); }
  }
  @keyframes cyberLinePulse {
    0% {
      box-shadow: 0 0 0 0 rgba(6, 199, 85, 0.8), 0 0 25px rgba(6, 199, 85, 0.65), inset 0 0 12px rgba(255, 255, 255, 0.35);
    }
    70% {
      box-shadow: 0 0 0 16px rgba(6, 199, 85, 0), 0 0 35px rgba(52, 211, 153, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.45);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(6, 199, 85, 0), 0 0 25px rgba(6, 199, 85, 0.65), inset 0 0 12px rgba(255, 255, 255, 0.35);
    }
  }
  @keyframes cyberLineShine {
    0% { left: -120%; }
    35%, 100% { left: 140%; }
  }
  @keyframes cyberOnlineBlink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.85); }
  }
  .cyber-line-float-btn {
    animation: cyberLineFloat 3s ease-in-out infinite, cyberLinePulse 2.2s infinite !important;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    overflow: hidden;
  }
  .cyber-line-float-btn::after {
    content: "";
    position: absolute;
    top: 0;
    left: -120%;
    width: 65%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.45), transparent);
    transform: skewX(-25deg);
    animation: cyberLineShine 3.8s infinite;
    pointer-events: none;
  }
  .cyber-line-float-btn:hover {
    transform: translateY(-5px) scale(1.07) !important;
    filter: brightness(1.12) !important;
    box-shadow: 0 0 35px rgba(6, 199, 85, 1), 0 0 60px rgba(56, 189, 248, 0.6) !important;
  }
`;

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cyber_current_logged_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  
  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem('cyber_remembered_user') || '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailInput, setEmailInput] = useState('');
  const [regUsernameInput, setRegUsernameInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotTargetUser, setForgotTargetUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(300);
  const [otpResendCountdown, setOtpResendCountdown] = useState(60);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotStatusMsg, setForgotStatusMsg] = useState({ text: '', type: '' });
  const [emailVerifyMsg, setEmailVerifyMsg] = useState('');

  const resetForgotState = () => {
    setForgotStep(1);
    setForgotEmailInput('');
    setForgotTargetUser(null);
    setGeneratedOtp('');
    setForgotOtpInput('');
    setOtpCountdown(300);
    setOtpResendCountdown(60);
    setForgotNewPassword('');
    setShowForgotNewPassword(false);
    setForgotConfirmPassword('');
    setShowForgotConfirmPassword(false);
    setForgotStatusMsg({ text: '', type: '' });
  };

  useEffect(() => {
    let timer;
    if (forgotModalOpen && forgotStep === 2) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotModalOpen, forgotStep]);

  const formatOtpTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResendEmailVerification = () => {
    setEmailVerifyMsg('');
    if (auth.currentUser) {
      sendEmailVerification(auth.currentUser)
        .then(() => {
          setEmailVerifyMsg(`📧 ส่งลิงก์ยืนยันอีเมลไปยัง ${user?.email || auth.currentUser.email} เรียบร้อยแล้ว! กรุณาตรวจสอบใน Inbox หรือ Junk Mail`);
          setTimeout(() => setEmailVerifyMsg(''), 7000);
        })
        .catch((err) => {
          setEmailVerifyMsg(`⚠️ ไม่สามารถส่งอีเมลยืนยันได้: ${err.message}`);
          setTimeout(() => setEmailVerifyMsg(''), 7000);
        });
    } else {
      setEmailVerifyMsg(`📧 กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้งเพื่อส่งลิงก์ยืนยันอีเมล`);
      setTimeout(() => setEmailVerifyMsg(''), 7000);
    }
  };

  const handleRequestOtpSubmit = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });

    const inputClean = forgotEmailInput.trim();
    if (!inputClean) {
      setForgotStatusMsg({ text: 'กรุณากรอกอีเมล หรือชื่อผู้ใช้ของคุณ', type: 'error' });
      return;
    }

    const matched = registeredUsers.find(
      (u) => (u.username && u.username.toLowerCase() === inputClean.toLowerCase()) ||
             (u.email && u.email.toLowerCase() === inputClean.toLowerCase())
    );

    if (!matched) {
      setForgotStatusMsg({ text: `ไม่พบบัญชีผู้ใช้ "${inputClean}" ในระบบ กรุณาตรวจสอบอีกครั้ง`, type: 'error' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setForgotTargetUser(matched);
    setOtpCountdown(300);
    setOtpResendCountdown(60);
    setForgotOtpInput('');
    setForgotStep(2);
    setForgotStatusMsg({
      text: `📧 ส่งรหัส OTP 6 หลักไปยัง ${matched.email || matched.username} เรียบร้อยแล้ว (รหัส OTP ของคุณคือ: ${otp})`,
      type: 'success'
    });
  };

  const handleResendOtp = () => {
    if (otpResendCountdown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpCountdown(300);
    setOtpResendCountdown(60);
    setForgotOtpInput('');
    setForgotStatusMsg({
      text: `🔄 ส่งรหัส OTP ใหม่เรียบร้อยแล้ว (รหัส OTP: ${newOtp})`,
      type: 'success'
    });
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });

    if (otpCountdown <= 0) {
      setForgotStatusMsg({ text: '⚠️ รหัส OTP หมดอายุแล้ว กรุณากดขอรหัส OTP ใหม่', type: 'error' });
      return;
    }

    if (!forgotOtpInput.trim() || forgotOtpInput.trim().length !== 6) {
      setForgotStatusMsg({ text: 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก', type: 'error' });
      return;
    }

    if (forgotOtpInput.trim() !== generatedOtp) {
      setForgotStatusMsg({ text: '❌ รหัส OTP ไม่ถูกต้อง กรุณากรอกรหัสให้ตรงกับที่ส่งให้', type: 'error' });
      return;
    }

    setForgotStep(3);
    setForgotStatusMsg({
      text: '✅ ยืนยันรหัส OTP ถูกต้องแล้ว! กรุณาตั้งรหัสผ่านใหม่ของคุณด้านล่างได้ทันที',
      type: 'success'
    });
  };

  const handleSetNewPasswordSubmit = (e) => {
    e.preventDefault();
    setForgotStatusMsg({ text: '', type: '' });

    if (!forgotNewPassword.trim() || !forgotConfirmPassword.trim()) {
      setForgotStatusMsg({ text: 'กรุณากรอกรหัสผ่านใหม่ให้ครบทั้งสองช่อง', type: 'error' });
      return;
    }

    if (forgotNewPassword.trim().length < 6) {
      setForgotStatusMsg({ text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', type: 'error' });
      return;
    }

    if (forgotNewPassword.trim() !== forgotConfirmPassword.trim()) {
      setForgotStatusMsg({ text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน', type: 'error' });
      return;
    }

    if (!forgotTargetUser || !forgotTargetUser.firebaseKey) {
      setForgotStatusMsg({ text: 'เกิดข้อผิดพลาด: ไม่พบข้อมูลบัญชี กรุณาลองใหม่อีกครั้ง', type: 'error' });
      return;
    }

    const newPass = forgotNewPassword.trim();
    set(ref(db, `users/${forgotTargetUser.firebaseKey}/password`), newPass)
      .then(() => {
        setUsernameInput(forgotTargetUser.username);
        setPasswordInput(newPass);

        setForgotStatusMsg({
          text: '🎉 เปลี่ยนรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว! ระบบได้กรอกรหัสผ่านใหม่ให้ในหน้าเข้าสู่ระบบแล้ว กำลังกลับสู่หน้าแรก...',
          type: 'success'
        });

        setTimeout(() => {
          setForgotModalOpen(false);
          resetForgotState();
        }, 2500);
      })
      .catch((err) => {
        setForgotStatusMsg({
          text: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่านใหม่: ' + err.message,
          type: 'error'
        });
      });
  };

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setRegisteredUsers(userList);
        setUser(prevUser => {
          if (!prevUser) return null;
          const updated = userList.find(u =>
            (u.firebaseKey && u.firebaseKey === prevUser.firebaseKey) ||
            (u.username && prevUser.username && u.username.toLowerCase() === prevUser.username.toLowerCase())
          );
          if (updated) {
            try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updated)); } catch (e) {}
            return updated;
          }
          return prevUser;
        });
      } else {
        setRegisteredUsers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authMode === 'login') {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setAuthError('กรุณากรอกชื่อผู้ใช้ และรหัสผ่าน');
        return;
      }
      
      const inputClean = usernameInput.trim().toLowerCase();
      const foundUser = registeredUsers.find(
        (u) => (u.username && u.username.toLowerCase() === inputClean) || 
               (u.email && u.email.toLowerCase() === inputClean)
      );

      if (!foundUser) {
        setAuthError('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือสมัครสมาชิก');
        return;
      }

      if (foundUser.email) {
        signInWithEmailAndPassword(auth, foundUser.email, passwordInput)
          .then((userCredential) => {
            const isVerified = userCredential.user.emailVerified;
            
            if (foundUser.firebaseKey && foundUser.password !== passwordInput) {
              set(ref(db, `users/${foundUser.firebaseKey}/password`), passwordInput);
            }
            if (foundUser.firebaseKey && isVerified !== foundUser.emailVerified) {
              set(ref(db, `users/${foundUser.firebaseKey}/emailVerified`), isVerified);
            }

            const updatedUser = {
              ...foundUser,
              password: passwordInput,
              emailVerified: isVerified
            };

            if (rememberMe) {
              localStorage.setItem('cyber_remembered_user', usernameInput.trim());
            } else {
              localStorage.removeItem('cyber_remembered_user');
            }
            setUser(updatedUser);
            localStorage.setItem('cyber_current_logged_user', JSON.stringify(updatedUser));
          })
          .catch((error) => {
            if (foundUser.password === passwordInput) {
              if (rememberMe) {
                localStorage.setItem('cyber_remembered_user', usernameInput.trim());
              } else {
                localStorage.removeItem('cyber_remembered_user');
              }
              setUser(foundUser);
              localStorage.setItem('cyber_current_logged_user', JSON.stringify(foundUser));
            } else {
              if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setAuthError('รหัสผ่านไม่ถูกต้อง (หากคุณเพิ่งเปลี่ยนรหัสผ่านผ่านอีเมล กรุณากรอกรหัสผ่านใหม่ที่คุณตั้ง)');
              } else {
                setAuthError('ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง');
              }
            }
          });
      } else {
        if (foundUser.password === passwordInput) {
          if (rememberMe) {
            localStorage.setItem('cyber_remembered_user', usernameInput.trim());
          } else {
            localStorage.removeItem('cyber_remembered_user');
          }
          setUser(foundUser);
          localStorage.setItem('cyber_current_logged_user', JSON.stringify(foundUser));
        } else {
          setAuthError('ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง');
        }
      }
    } else if (authMode === 'register') {
      if (!emailInput.trim() || !regUsernameInput.trim() || !regPasswordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      
      const emailClean = emailInput.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailClean)) {
        setAuthError('รูปแบบ Email สำหรับกู้คืนรหัสผ่านไม่ถูกต้อง (เช่น name@domain.com)');
        return;
      }

      if (regPasswordInput.length < 6) {
        setAuthError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }

      if (regPasswordInput !== confirmPasswordInput) {
        setAuthError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }

      const isEmailExist = registeredUsers.some((u) => u.email && u.email.toLowerCase() === emailClean);
      if (isEmailExist) {
        setAuthError('อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น');
        return;
      }

      const usernameClean = regUsernameInput.trim();
      const isUserExist = registeredUsers.some((u) => u.username && u.username.toLowerCase() === usernameClean.toLowerCase());
      if (isUserExist) {
        setAuthError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น');
        return;
      }

      createUserWithEmailAndPassword(auth, emailClean, regPasswordInput)
        .then((userCredential) => {
          sendEmailVerification(userCredential.user).catch((err) => {
            console.log("Email verification dispatch note:", err);
          });

          const newUser = { 
            username: usernameClean, 
            email: emailClean, 
            password: regPasswordInput, 
            emailVerified: false,
            balance: 0,
            createdAt: new Date().toISOString()
          };

          const usersRef = ref(db, 'users');
          return push(usersRef, newUser);
        })
        .then(() => {
          setUsernameInput(usernameClean);
          setPasswordInput(regPasswordInput);
          setEmailInput('');
          setRegUsernameInput('');
          setRegPasswordInput('');
          setConfirmPasswordInput('');
          setAuthSuccessMsg('🎉 สมัครสมาชิกสำเร็จ! ระบบได้ส่งอีเมลยืนยันตัวตนไปยัง ' + emailClean + ' เรียบร้อยแล้ว (สามารถนำอีเมลนี้ใช้กู้คืนรหัสผ่านได้ตลอด 24 ชม.)');
          setAuthMode('login');
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            setAuthError('อีเมลนี้ถูกใช้งานในระบบ Firebase Auth แล้ว');
          } else {
            setAuthError('เกิดข้อผิดพลาดในการสร้างบัญชีสมาชิก: ' + error.message);
          }
        });
    }
  };

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

  const [giftCodes, setGiftCodes] = useState([]);

  useEffect(() => {
    const giftCodesRef = ref(db, 'giftCodes');
    const unsubscribe = onValue(giftCodesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const autoSeededNames = ['AUTO-VAL-125', 'AUTO-ROV-40', 'AUTO-GEN-60'];
        const codeList = [];
        Object.keys(data).forEach(key => {
          const item = data[key];
          if (item && autoSeededNames.includes(item.code)) {
            set(ref(db, `giftCodes/${key}`), null);
          } else {
            codeList.push({
              firebaseKey: key,
              ...item
            });
          }
        });
        setGiftCodes(codeList.reverse());
      } else {
        setGiftCodes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const [showLegacyStockAdmin, setShowLegacyStockAdmin] = useState(false);
  const [stockList, setStockList] = useState([]);
  const [stockGame, setStockGame] = useState('VALORANT');
  const [stockPackage, setStockPackage] = useState('125 VP');
  const [stockCodesInput, setStockCodesInput] = useState('');
  const [stockMsg, setStockMsg] = useState({ text: '', type: '' });
  const [stockFilterGame, setStockFilterGame] = useState('all');
  const [stockFilterStatus, setStockFilterStatus] = useState('all');
  const [stockPage, setStockPage] = useState(1);
  const [deliveredStockModal, setDeliveredStockModal] = useState(null);

  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipVerifying, setSlipVerifying] = useState(false);
  const [slipVerifyStepText, setSlipVerifyStepText] = useState('');
  const [slipVerifyError, setSlipVerifyError] = useState('');

  useEffect(() => {
    const stockRef = ref(db, 'stock');
    const unsubscribe = onValue(stockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setStockList(list.reverse());
      } else {
        const defaultSamples = [
          { game: 'VALORANT', package: '125 VP', code: 'VAL-VP125-AUTO-8891-PROD' },
          { game: 'VALORANT', package: '125 VP', code: 'VAL-VP125-FAST-4420-OK24' },
          { game: 'VALORANT', package: '420 VP', code: 'VAL-VP420-CYBER-9912-FAST' },
          { game: 'ROV (Arena of Valor)', package: '40 Coupons', code: 'ROV-CP40-INSTANT-7712' },
          { game: 'ROV (Arena of Valor)', package: '90 Coupons', code: 'ROV-CP90-AUTO-2026' },
          { game: 'Genshin Impact', package: '60 Genesis Crystals', code: 'GENSHIN-60GC-PROD-5501' }
        ];
        const now = new Date();
        const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} 12:00 น.`;
        defaultSamples.forEach(item => {
          push(stockRef, {
            ...item,
            status: 'available',
            createdAt: thaiTime,
            deliveredTo: null,
            orderId: null,
            deliveredAt: null
          });
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddStock = (e) => {
    e.preventDefault();
    setStockMsg({ text: '', type: '' });

    if (!stockPackage) {
      setStockMsg({ text: 'กรุณาเลือกแพ็กเกจที่ต้องการเพิ่มสต็อก', type: 'error' });
      return;
    }

    const lines = stockCodesInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      setStockMsg({ text: 'กรุณากรอกรหัส/โค้ดสินค้าอย่างน้อย 1 รายการ', type: 'error' });
      return;
    }

    const now = new Date();
    const thaiTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const stockRef = ref(db, 'stock');
    lines.forEach(code => {
      push(stockRef, {
        game: stockGame,
        package: stockPackage,
        code: code,
        status: 'available',
        createdAt: thaiTime,
        deliveredTo: null,
        orderId: null,
        deliveredAt: null
      });
    });

    setStockCodesInput('');
    setStockMsg({ text: `✅ เพิ่มรหัสเข้าสต็อกสำเร็จ ${lines.length} รายการ เรียบร้อยแล้ว!`, type: 'success' });
  };

  const handleDeleteStock = (item) => {
    if (item.firebaseKey) {
      const targetRef = ref(db, `stock/${item.firebaseKey}`);
      set(targetRef, null);
    }
  };

  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeGame, setNewCodeGame] = useState('VALORANT');
  const [newCodeReward, setNewCodeReward] = useState('125 VP');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(10);
  const [newCodeMinRank, setNewCodeMinRank] = useState(0);
  const [adminCodeMsg, setAdminCodeMsg] = useState({ text: '', type: '' });

  const rankTiers = [
    { level: 0, name: 'Member', icon: '🌱', minSpend: 0, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: '#4b5563', rewardHint: 'สิทธิ์ร่วมกิจกรรมทั่วไป' },
    { level: 1, name: 'Bronze', icon: '🥉', minSpend: 300, color: '#d97706', bg: 'rgba(217, 119, 6, 0.18)', border: '#f59e0b', rewardHint: 'ปลดล็อกโค้ดแพ็กเริ่มต้น (฿29-฿35)' },
    { level: 2, name: 'Silver', icon: '🥈', minSpend: 1000, color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.18)', border: '#94a3b8', rewardHint: 'ปลดล็อกโค้ดแพ็กกลาง (฿35-฿75)' },
    { level: 3, name: 'Gold', icon: '🥇', minSpend: 3000, color: '#facc15', bg: 'rgba(250, 204, 21, 0.18)', border: '#eab308', rewardHint: 'ปลดล็อกโค้ดฮิต 125 VP / 575 RP' },
    { level: 4, name: 'Diamond', icon: '💎', minSpend: 7500, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)', border: '#0ea5e9', rewardHint: 'ปลดล็อกโค้ดใหญ่ 420 VP / 220 คูปอง' },
    { level: 5, name: 'Cyber Legend', icon: '👑', minSpend: 15000, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.22)', border: '#a855f7', rewardHint: 'ปลดล็อกโค้ดลับ VIP 700 VP / 980 Crystals' }
  ];

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
  const [activeOrderFirebaseKey, setActiveOrderFirebaseKey] = useState(null);

  const [customerOrderSearch, setCustomerOrderSearch] = useState('');
  const [exactSearchQuery, setExactSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [customerOrdersPage, setCustomerOrdersPage] = useState(1);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(true);
  const [isAdminOrdersOpen, setIsAdminOrdersOpen] = useState(true);

  const [adminOrdersPage, setAdminOrdersPage] = useState(1);
  const [orders, setOrders] = useState([]);

  const creditUserWallet = (targetPlayer, amount) => {
    const targetUser = registeredUsers.find(u => 
      (u.username && u.username.toLowerCase() === targetPlayer.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === targetPlayer.toLowerCase())
    );
    if (targetUser && targetUser.firebaseKey) {
      const newBalance = (targetUser.balance || 0) + amount;
      const userRef = ref(db, `users/${targetUser.firebaseKey}/balance`);
      set(userRef, newBalance);
      if (user && user.firebaseKey === targetUser.firebaseKey) {
        const updated = { ...user, balance: newBalance };
        setUser(updated);
        try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updated)); } catch (e) {}
      }
    }
  };

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setOrders(orderList.reverse());
      } else {
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const createRealtimeOrder = (newOrderObj) => {
    const ordersRef = ref(db, 'orders');
    const newRef = push(ordersRef, newOrderObj);
    return newRef.key;
  };

  const updateRealtimeOrderStatus = (firebaseKey, newStatus) => {
    const orderRef = ref(db, `orders/${firebaseKey}/status`);
    set(orderRef, newStatus);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nowTs = Date.now();
      orders.forEach((ord) => {
        if (ord.status.includes('รอตรวจสอบ') && ord.timestamp) {
          const diffSeconds = Math.floor((nowTs - ord.timestamp) / 1000);
          if (diffSeconds >= 10) {
            if (ord.type === 'wallet') {
              creditUserWallet(ord.player, ord.price);
            }
            updateRealtimeOrderStatus(ord.firebaseKey, '✅ สำเร็จ (เติมอัตโนมัติ 10 วินาที)');
            if (ord.firebaseKey === activeOrderFirebaseKey) {
              setFloatingTimer(0);
              setActiveOrderFirebaseKey(null);
            }
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orders, activeOrderFirebaseKey]);

  useEffect(() => {
    if (activeOrderFirebaseKey) {
      const currentOrd = orders.find(o => o.firebaseKey === activeOrderFirebaseKey);
      if (!currentOrd || !currentOrd.status.includes('รอตรวจสอบ')) {
        setFloatingTimer(0);
        setActiveOrderFirebaseKey(null);
      }
    }
  }, [orders, activeOrderFirebaseKey]);

  useEffect(() => {
    let fTimer;
    if (floatingTimer > 0) {
      fTimer = setInterval(() => {
        setFloatingTimer((prev) => {
          if (prev <= 1) {
            setActiveOrderFirebaseKey(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(fTimer);
  }, [floatingTimer]);

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
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cyber_ad_promotions_list', JSON.stringify(adPromotions));
  }, [adPromotions]);

  const adExpense = adPromotions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleAddAdPromotion = (e) => {
    e.preventDefault();
    const amt = parseFloat(adAmountInput);
    if (isNaN(amt) || amt <= 0) {
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

  const handleClearAllAdPromotions = () => {
    setAdPromotions([]);
    setAdPage(1);
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
    { id: 'true', name: 'TrueMoney Wallet', desc: 'โอนผ่านเบอร์วอลเล็ต 10 หลัก' },
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

  const handleLogout = () => {
    signOut(auth).catch(() => {});
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

    const selectedRankObj = rankTiers.find(r => r.level === Number(newCodeMinRank)) || rankTiers[0];
    const newCodeObj = {
      code: cleanCode,
      game: newCodeGame,
      reward: newCodeReward,
      maxUses: parseInt(newCodeMaxUses),
      minRankLevel: Number(newCodeMinRank) || 0,
      minRankName: selectedRankObj.name,
      usedCount: 0,
      timestamp: Date.now()
    };

    const giftCodesRef = ref(db, 'giftCodes');
    push(giftCodesRef, newCodeObj)
      .then(() => {
        setAdminCodeMsg({ text: `สร้างโค้ด ${cleanCode} สำเร็จเรียบร้อย!`, type: 'success' });
        setNewCodeName('');
        setNewCodeMaxUses(10);
      })
      .catch(() => {
        setAdminCodeMsg({ text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
      });
  };

  const handleDeleteGiftCode = (codeItem) => {
    if (codeItem.firebaseKey) {
      const targetRef = ref(db, `giftCodes/${codeItem.firebaseKey}`);
      set(targetRef, null);
    }
  };

  const handleResetAllRedeemRights = () => {
    setGlobalRedeemedPlayers([]);
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
      setEventMsg({ text: `❌ ID เกม "${eventPlayerId.trim()}" เคยใช้สิทธิ์กรอกโค้ดไปแล้ว`, type: 'error' });
      return;
    }

    if (foundCode.usedCount >= foundCode.maxUses) {
      setEventMsg({ text: `โค้ด "${targetCode}" ถูกใช้งานครบจำนวนสิทธิ์เต็มแล้ว`, type: 'error' });
      return;
    }

    const requiredRankLevel = Number(foundCode.minRankLevel) || 0;
    if (currentUserRank.level < requiredRankLevel) {
      const reqTier = rankTiers.find(r => r.level === requiredRankLevel) || rankTiers[0];
      setEventMsg({
        text: `🔒 โค้ด "${targetCode}" จำกัดเฉพาะสมาชิกระดับ ${reqTier.icon} ${reqTier.name} ขึ้นไป (ยอดเติมเกมสะสม ฿${reqTier.minSpend.toLocaleString()}+ | ยอดสะสมปัจจุบันของคุณ: ฿${userTotalTopup.toLocaleString()})`,
        type: 'error'
      });
      return;
    }

    setGlobalRedeemedPlayers([...globalRedeemedPlayers, cleanPlayerId]);

    if (foundCode.firebaseKey) {
      const codeUsedRef = ref(db, `giftCodes/${foundCode.firebaseKey}/usedCount`);
      set(codeUsedRef, foundCode.usedCount + 1);
    }

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
      player: user ? user.username : eventPlayerId.trim(),
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

    setEventMsg({ text: `🎉 ใช้โค้ด ${foundCode.code} สำเร็จ! ได้รับ: ${foundCode.reward} (เลขออร์เดอร์: ${newOrderId})`, type: 'success' });
    setEventGiftCode('');
    setEventPlayerId('');
  };

  const handleWalletNextStep = () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      return;
    }

    if (walletPaymentMethod === 'true') {
      if (!truemoneyPhone || truemoneyPhone.length < 10) {
        return;
      }
      setTrueMoneyOtpStep(true);
      setTrueMoneyOtpCode('');
      setTrueMoneyOtpError('');
      return;
    } else if (walletPaymentMethod === 'truemoneycard' && (!truemoneyCard14 || truemoneyCard14.length < 14)) {
      return;
    } else if (walletPaymentMethod === 'credit' && (creditCardNum.replace(/\s/g, '').length < 16 || !creditCardExp || !creditCardCvv)) {
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

  // ฟังก์ชันยิงสัญญาณแจ้งเตือนไปยัง api/line-webhook.js
  const sendLineOrderNotification = async (orderData) => {
    try {
      const endpoint = ['/api', 'line-webhook'].join('/');
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
    } catch (err) {
      console.warn('Line notification trigger note:', err);
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
      player: user ? user.username : 'user11',
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
    if (!playerId.trim()) {
      return;
    }
    setCheckoutPasswordError('');
    
    const totalPrice = selectedPackage.price * packageQuantity;
    if (selectedPayment.id === 'wallet' && user.balance < totalPrice) {
      return;
    }

    if (selectedPayment.id === 'true') {
      if (!truemoneyPhone || truemoneyPhone.length < 10) {
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

    if (selectedPayment.id === 'wallet' && user && user.firebaseKey) {
      if ((user.balance || 0) < totalPrice) {
        return;
      }
      const newBalance = user.balance - totalPrice;
      const userRef = ref(db, `users/${user.firebaseKey}/balance`);
      set(userRef, newBalance);
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      try { localStorage.setItem('cyber_current_logged_user', JSON.stringify(updatedUser)); } catch (e) {}
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

      const targetGameChar = playerId.trim();
      const pkgSummary = `${selectedPackage.name} (x${packageQuantity} แพ็ก)`;

      const newOrder = {
        id: newOrderId,
        game: selectedGame.name,
        package: pkgSummary,
        price: totalPrice,
        profit: totalProfit,
        player: user ? user.username : 'user11',
        gameChar: targetGameChar,
        paymentMethod: selectedPayment.name,
        status: 'รอตรวจสอบ',
        deliveryType: 'DIRECT_UID_AUTO_100',
        deliveredCode: null,
        type: 'game',
        time: thaiTime,
        dateKey: dateKey,
        timestamp: Date.now(),
      };

      const insertedKey = createRealtimeOrder(newOrder);
      setFloatingTimer(10);
      setActiveOrderFirebaseKey(insertedKey);

      sendLineOrderNotification({
        orderId: newOrderId,
        game: selectedGame.name,
        packageName: pkgSummary,
        price: totalPrice,
        player: user ? user.username : 'user11',
        gameChar: targetGameChar,
        paymentMethod: selectedPayment.name,
        deliveredCode: null,
      });

      setIsProcessing(false);
      setShowCheckoutModal(false);
      setCheckoutStep(1);
      setCheckoutPassword('');
      setPackageQuantity(1);
      setTruemoneyPhone('');
      setTruemoneyCard14('');
      setCreditCardNum('');
      setCreditCardExp('');
      setCreditCardCvv('');
      setSlipFile(null);
      setSlipPreview(null);
      setSlipVerifying(false);
    }, 900);
  };

  const handleSimulateSlipScan = () => {
    setSlipVerifying(true);
    setSlipVerifyError('');
    setSlipVerifyStepText('🔍 กำลังเชื่อมต่อ API สแกน Mini-QR บนสลิป...');

    setTimeout(() => {
      setSlipVerifyStepText('💳 ตรวจสอบข้อมูลผู้รับ: บัญชี CYBER TOPUP (ยอดเงินถูกต้อง)...');
      setTimeout(() => {
        setSlipVerifyStepText('✅ ตรวจสอบสลิปสำเร็จ! กำลังส่งรายการเติมแพ็กเกจเข้า UID อัตโนมัติ...');
        setTimeout(() => {
          handleFinalPaymentSubmit();
        }, 800);
      }, 900);
    }, 900);
  };

  const handleAdminApproveOrder = (order) => {
    if (order.firebaseKey) {
      if (order.type === 'wallet' && !order.status.includes('สำเร็จ')) {
        creditUserWallet(order.player, order.price);
      }
      updateRealtimeOrderStatus(order.firebaseKey, '✅ สำเร็จ (แอดมินอนุมัติแล้ว)');
      if (order.firebaseKey === activeOrderFirebaseKey) {
        setFloatingTimer(0);
        setActiveOrderFirebaseKey(null);
      }
    }
  };

  const handleAdminRejectOrder = (order) => {
    if (order.firebaseKey) {
      updateRealtimeOrderStatus(order.firebaseKey, '❌ ยกเลิก (ไม่พบยอดโอนเงิน)');
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

  const isUserAdmin = user && (user.username.toLowerCase() === 'thanphooms' || user.email?.toLowerCase() === 'thanphooms@gmail.com');

  const userTotalTopup = React.useMemo(() => {
    if (!user || !user.username) return 0;
    return orders.reduce((sum, ord) => {
      const isSameUser = ord.player && ord.player.toLowerCase() === user.username.toLowerCase();
      const isSuccess = ord.status && ord.status.includes('สำเร็จ');
      const isGameTopup = ord.type === 'game';
      return (isSameUser && isSuccess && isGameTopup) ? sum + (parseFloat(ord.price) || 0) : sum;
    }, 0);
  }, [orders, user]);

  const currentUserRank = React.useMemo(() => {
    let current = rankTiers[0];
    for (const tier of rankTiers) {
      if (userTotalTopup >= tier.minSpend) {
        current = tier;
      }
    }
    return current;
  }, [userTotalTopup]);

  const nextUserRank = React.useMemo(() => {
    return rankTiers.find(t => t.level === currentUserRank.level + 1) || null;
  }, [currentUserRank]);

  const rankProgressPercent = React.useMemo(() => {
    if (!nextUserRank) return 100;
    const prevMin = currentUserRank.minSpend;
    const targetMin = nextUserRank.minSpend;
    const pct = ((userTotalTopup - prevMin) / (targetMin - prevMin)) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }, [userTotalTopup, currentUserRank, nextUserRank]);

  const nowObj = new Date();
  const currentDayStr = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`;

  const searchedOrders = orders.filter(o => {
    let matchUser = false;
    if (!isUserAdmin) {
      matchUser = user && (o.player.toLowerCase() === user.username.toLowerCase());
    } else {
      const q = exactSearchQuery.trim().toLowerCase();
      matchUser = !q || (o.player.toLowerCase() === q) || (o.id.toLowerCase() === q);
    }

    const orderQuery = customerOrderSearch.trim();
    const matchOrder = !orderQuery || (orderQuery.toUpperCase().startsWith('ORD') ? o.id.toLowerCase() === orderQuery.toLowerCase() : o.id.toLowerCase().includes(orderQuery.toLowerCase()));
    const matchGame = selectedGameFilter === 'all' || o.game.toLowerCase() === selectedGameFilter.toLowerCase();

    return matchUser && matchOrder && matchGame;
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
        <style>{cyberGlobalStyles}</style>
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
            {authMode === 'login' && 'เข้าสู่ระบบด้วยชื่อผู้ใช้งานอัตโนมัติ 24 ชม.'}
            {authMode === 'register' && 'สมัครสมาชิกใหม่ (กรอกอีเมลกู้คืนขึ้นก่อน แล้วตามด้วยชื่อผู้ใช้งาน)'}
          </p>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authError && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authError}</div>}
            {authSuccessMsg && <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>{authSuccessMsg}</div>}

            {authMode === 'login' ? (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ชื่อผู้ใช้งาน (Username)</label>
                <input type="text" placeholder="กรอกชื่อผู้ใช้งานของคุณ..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. อีเมลกู้คืนรหัสผ่าน (Email)</label>
                  <input type="email" placeholder="example@gmail.com (ใช้ยืนยันตอนลืมรหัส)" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. ชื่อผู้ใช้งาน (Username / Display Name)</label>
                  <input type="text" placeholder="ตั้งชื่อผู้ใช้งาน..." value={regUsernameInput} onChange={(e) => setRegUsernameInput(e.target.value)} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                {authMode === 'register' ? '3. รหัสผ่าน (Password อย่างน้อย 6 ตัว)' : 'รหัสผ่าน (Password)'}
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
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
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
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af' }}>
                  <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
                  <label htmlFor="remember" style={{ cursor: 'pointer' }}>จดจำไอดีไว้</label>
                </div>
                <span onClick={() => { setForgotModalOpen(true); resetForgotState(); }} style={{ color: '#f472b6', cursor: 'pointer', fontWeight: 'bold' }}>ลืมรหัสผ่าน?</span>
              </div>
            )}

            <button 
              type="submit" 
              style={{ 
                backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', 
                fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px', 
                boxShadow: '0 0 15px rgba(147,51,234,0.5)', transition: 'all 0.25s ease', transform: 'scale(1)' 
              }}
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

        {forgotModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center', boxShadow: '0 0 40px rgba(168,85,247,0.45)', position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => { setForgotModalOpen(false); resetForgotState(); }} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}
              >
                ✕
              </button>

              <div style={{ width: '54px', height: '54px', margin: '0 auto 12px auto', borderRadius: '50%', backgroundColor: 'rgba(168,85,247,0.15)', border: '2px solid #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {forgotStep === 1 ? '🔐' : forgotStep === 2 ? '🔢' : '✨'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: forgotStep === 1 ? '#9333ea' : 'rgba(55,65,81,0.5)', color: '#ffffff' }}>1. ขอรหัส OTP</span>
                <span style={{ color: '#4b5563', fontSize: '11px' }}>➔</span>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: forgotStep === 2 ? '#9333ea' : 'rgba(55,65,81,0.5)', color: '#ffffff' }}>2. ยืนยัน OTP</span>
                <span style={{ color: '#4b5563', fontSize: '11px' }}>➔</span>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: forgotStep === 3 ? '#9333ea' : 'rgba(55,65,81,0.5)', color: '#ffffff' }}>3. ตั้งรหัสใหม่</span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#ffffff' }}>
                {forgotStep === 1 && 'กู้คืนรหัสผ่านด้วยรหัส OTP'}
                {forgotStep === 2 && 'กรอกรหัสยืนยัน OTP 6 หลัก'}
                {forgotStep === 3 && 'ตั้งรหัสผ่านใหม่บนหน้าเว็บ'}
              </h3>
              
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px', lineHeight: '1.4' }}>
                {forgotStep === 1 && 'กรอกอีเมล หรือ ชื่อผู้ใช้งานของคุณ เพื่อรับรหัส OTP 6 หลัก'}
                {forgotStep === 2 && (
                  <>
                    รหัส OTP ถูกส่งไปที่: <b style={{ color: '#38bdf8' }}>{forgotTargetUser?.email || forgotTargetUser?.username}</b>
                  </>
                )}
                {forgotStep === 3 && (
                  <>
                    ตั้งรหัสผ่านใหม่สำหรับบัญชี: <b style={{ color: '#c084fc' }}>{forgotTargetUser?.username}</b>
                  </>
                )}
              </p>

              {forgotStatusMsg.text && (
                <div style={{ backgroundColor: forgotStatusMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${forgotStatusMsg.type === 'success' ? '#34d399' : '#ef4444'}`, color: forgotStatusMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '12px', borderRadius: '12px', fontSize: '12px', marginBottom: '16px', textAlign: 'left', lineHeight: '1.4' }}>
                  {forgotStatusMsg.text}
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleRequestOtpSubmit}>
                  <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '5px' }}>อีเมล หรือ ชื่อผู้ใช้งาน (Username)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น user@example.com หรือชื่อผู้ใช้งาน" 
                      value={forgotEmailInput} 
                      onChange={(e) => setForgotEmailInput(e.target.value)} 
                      style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                      autoFocus
                    />
                  </div>

                  <div style={{ backgroundColor: 'rgba(55, 65, 81, 0.35)', borderRadius: '10px', padding: '10px 12px', fontSize: '11px', color: '#9ca3af', marginBottom: '18px', textAlign: 'left', border: '1px dashed #4b5563', lineHeight: '1.5' }}>
                    💡 <b>สะดวก รวดเร็ว จบในหน้าเดียว:</b><br/>
                    ระบบจะส่งรหัส OTP 6 หลัก และเปิดให้คุณเปลี่ยนรหัสผ่านใหม่ได้ทันทีบนหน้านี้ ไม่ต้องสลับจอไปมา
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => { setForgotModalOpen(false); resetForgotState(); }} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                    <button type="submit" style={{ flex: 1.5, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(147,51,234,0.5)' }}>ขอรับรหัส OTP ➔</button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtpSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>กรอกรหัสยืนยัน OTP 6 หลัก</label>
                    <input 
                      type="text" 
                      inputMode="numeric" 
                      maxLength={6} 
                      placeholder="• • • • • •" 
                      value={forgotOtpInput} 
                      onChange={(e) => setForgotOtpInput(e.target.value.replace(/[^0-9]/g, ''))} 
                      style={{ width: '100%', maxWidth: '240px', margin: '0 auto', backgroundColor: '#030712', border: '2px solid #a855f7', borderRadius: '12px', padding: '12px', color: '#ffffff', fontSize: '24px', fontWeight: '900', letterSpacing: '8px', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} 
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '18px', padding: '0 6px' }}>
                    <div style={{ color: otpCountdown > 60 ? '#38bdf8' : '#ef4444', fontWeight: 'bold' }}>
                      ⏳ หมดอายุใน: {formatOtpTime(otpCountdown)}
                    </div>
                    <button 
                      type="button" 
                      disabled={otpResendCountdown > 0} 
                      onClick={handleResendOtp} 
                      style={{ background: 'none', border: 'none', color: otpResendCountdown > 0 ? '#6b7280' : '#38bdf8', cursor: otpResendCountdown > 0 ? 'not-allowed' : 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                    >
                      {otpResendCountdown > 0 ? `ขอรหัสใหม่ใน (${otpResendCountdown}s)` : '🔄 ขอรหัสใหม่อีกครั้ง'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setForgotStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ย้อนกลับ</button>
                    <button type="submit" style={{ flex: 1.5, backgroundColor: '#34d399', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(52,211,153,0.5)' }}>ยืนยันรหัส OTP ➔</button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleSetNewPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#c084fc', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>1. รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showForgotNewPassword ? 'text' : 'password'} 
                        placeholder="กรอกรหัสผ่านใหม่..." 
                        value={forgotNewPassword} 
                        onChange={(e) => setForgotNewPassword(e.target.value)} 
                        style={{ width: '100%', backgroundColor: '#030712', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)} 
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                      >
                        <EyeIcon show={showForgotNewPassword} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showForgotConfirmPassword ? 'text' : 'password'} 
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..." 
                        value={forgotConfirmPassword} 
                        onChange={(e) => setForgotConfirmPassword(e.target.value)} 
                        style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 42px 12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)} 
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                      >
                        <EyeIcon show={showForgotConfirmPassword} />
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    style={{ 
                      backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', 
                      fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px', 
                      boxShadow: '0 0 20px rgba(147,51,234,0.6)' 
                    }}
                  >
                    💾 บันทึกรหัสผ่านใหม่ทันที
                  </button>
                </form>
              )}

            </div>
          </div>
        )}
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
      <style>{cyberGlobalStyles}</style>
      
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
          <div style={{ backgroundColor: '#030712', border: '1px solid #9333ea', borderRadius: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>
                <span style={{ color: '#9ca3af' }}>👤 ผู้ใช้: </span>
                <b style={{ color: '#c084fc' }}>{user.username && user.username.includes('@') ? user.username.split('@')[0] : user.username}</b>
              </span>
              <span
                title={`ยอดเติมเกมสะสม: ฿${userTotalTopup.toLocaleString()}`}
                style={{
                  backgroundColor: currentUserRank.bg,
                  border: `1px solid ${currentUserRank.border}`,
                  color: currentUserRank.color,
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {currentUserRank.icon} {currentUserRank.name}
              </span>
            </div>
            {user.email && !user.emailVerified && (
              <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  type="button" 
                  onClick={handleResendEmailVerification}
                  title="คลิกเพื่อส่งลิงก์ยืนยันตัวตนไปยังอีเมลที่ลงทะเบียนไว้"
                  style={{ 
                    backgroundColor: 'rgba(245, 158, 11, 0.25)', 
                    border: '1px solid #f59e0b', 
                    color: '#fbbf24', 
                    padding: '2px 8px', 
                    borderRadius: '6px', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ⚠️ ยืนยันเมล
                </button>
              </div>
            )}
            <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px', fontSize: '12px' }}><span style={{ color: '#9ca3af' }}>💰 เครดิตร้าน: </span><b style={{ color: '#34d399' }}>฿{(user.balance || 0).toLocaleString()}</b></div>
            
            <button 
              onClick={() => { setShowTopupWalletModal(true); setWalletStep(1); }} 
              style={{ backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(147,51,234,0.5)' }}
            >
              + เติมเครดิต
            </button>
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
      {emailVerifyMsg && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.25)', borderBottom: '1px solid #10b981', color: '#6ee7b7', padding: '10px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
          {emailVerifyMsg}
        </div>
      )}

      <a 
        href="https://lin.ee/Nn1UeBC" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="cyber-line-float-btn"
        style={{ 
          position: 'fixed', bottom: '25px', right: '25px', zIndex: 99, 
          background: 'linear-gradient(135deg, #06c755 0%, #059669 50%, #10b981 100%)',
          color: '#ffffff', padding: '12px 22px', 
          borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '12px', 
          textDecoration: 'none', fontWeight: 'bold', fontSize: '14px',
          border: '2px solid #a7f3d0' 
        }}
      >
        <div style={{ position: 'relative', width: '28px', height: '28px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(255,255,255,0.8)', flexShrink: 0 }}>
          <span style={{ fontSize: '15px', color: '#06c755', fontWeight: '900', lineHeight: '1' }}>L</span>
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '9px', height: '9px', backgroundColor: '#34d399', borderRadius: '50%', border: '1.5px solid #030712', animation: 'cyberOnlineBlink 1.4s infinite' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.15' }}>
          <span style={{ fontSize: '9px', color: '#d1fae5', fontWeight: 'bold', letterSpacing: '1px' }}>🟢 ONLINE 24 ชม.</span>
          <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '900', textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}>ติดต่อแอดมิน (LINE)</span>
        </div>
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
              position: 'hidden'
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

            <div style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(30, 27, 75, 0.95) 100%)', border: '1.5px solid #a855f7', borderRadius: '20px', padding: '25px 30px', marginBottom: '25px', boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '16px', backgroundColor: currentUserRank.bg, border: `2px solid ${currentUserRank.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
                    {currentUserRank.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>👑 ระดับแรงค์สมาชิกของคุณ (คำนวณจากยอดเติมเกมสะสม)</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: currentUserRank.color, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span>แรงค์ {currentUserRank.name}</span>
                      <span style={{ fontSize: '13px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', padding: '3px 10px', borderRadius: '8px' }}>
                        ยอดเติมสะสม: ฿{userTotalTopup.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {nextUserRank ? (
                    <div style={{ fontSize: '12px', color: '#d1d5db' }}>
                      อีกเพียง <b style={{ color: '#38bdf8', fontSize: '15px' }}>฿{Math.max(0, nextUserRank.minSpend - userTotalTopup).toLocaleString()}</b> จะเลื่อนขั้นเป็น <b style={{ color: nextUserRank.color }}>{nextUserRank.icon} {nextUserRank.name}</b>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>🎉 คุณอยู่ระดับสูงสุด Cyber Legend (VIP) แล้ว!</div>
                  )}
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>สิทธิ์ปัจจุบัน: {currentUserRank.rewardHint}</div>
                </div>
              </div>

              <div style={{ width: '100%', height: '12px', backgroundColor: '#030712', borderRadius: '999px', overflow: 'hidden', border: '1px solid #374151', marginBottom: '18px' }}>
                <div style={{ width: `${rankProgressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #9333ea, #38bdf8, #34d399)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '10px' }}>
                {rankTiers.slice(1).map((tier) => {
                  const isUnlocked = userTotalTopup >= tier.minSpend;
                  const isCurrent = currentUserRank.level === tier.level;
                  return (
                    <div
                      key={tier.level}
                      style={{
                        backgroundColor: isCurrent ? tier.bg : '#030712',
                        border: isCurrent ? `2px solid ${tier.border}` : isUnlocked ? '1px solid #34d399' : '1px solid #1f2937',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        opacity: isUnlocked ? 1 : 0.7
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: tier.color }}>{tier.icon} {tier.name}</span>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '6px', backgroundColor: isUnlocked ? 'rgba(52,211,153,0.2)' : 'rgba(55,65,81,0.5)', color: isUnlocked ? '#34d399' : '#9ca3af' }}>
                          {isUnlocked ? '✅ ปลดล็อกแล้ว' : `฿${tier.minSpend.toLocaleString()}+`}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.35' }}>{tier.rewardHint}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1.5px solid rgba(56, 189, 248, 0.6)', borderRadius: '20px', padding: '25px 30px', marginBottom: '35px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 15px 0' }}>📊 สถานะโค้ดกิจกรรมคงเหลือแยกตามเกม (Realtime)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
                {gamesData.map((g) => {
                  const codesForGame = giftCodes.filter(c => c.game === g.name);
                  const totalRemainingForGame = codesForGame.reduce((sum, c) => sum + Math.max(0, c.maxUses - c.usedCount), 0);
                  return (
                    <div key={g.id} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '52px', boxSizing: 'border-box' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginRight: '10px', lineHeight: '1.3', flex: 1 }}>{g.name}</span>
                      <span style={{ backgroundColor: totalRemainingForGame > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)', color: totalRemainingForGame > 0 ? '#34d399' : '#fca5a5', border: `1px solid ${totalRemainingForGame > 0 ? '#34d399' : '#ef4444'}`, padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'center' }}>
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
                  <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                    ✨ ยืนยันรับสิทธิ์โค้ด
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'shop' && selectedGame && (
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '24px', padding: '30px', border: '1.5px solid rgba(147,51,234,0.5)' }}>
            <button onClick={() => setSelectedGame(null)} style={{ backgroundColor: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
              ← กลับไปหน้าเลือกเกม
            </button>

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
                {selectedGame.packages.map((pkg) => {
                  const availCount = stockList.filter(s => s.game === selectedGame.name && s.package === pkg.name && s.status === 'available').length;
                  const isSelected = selectedPackage?.id === pkg.id;
                  return (
                    <div 
                      key={pkg.id} 
                      onClick={() => { setSelectedPackage(pkg); setPackageQuantity(1); }} 
                      style={{ 
                        backgroundColor: isSelected ? 'rgba(147, 51, 234, 0.25)' : '#030712', 
                        border: isSelected ? '2px solid #a855f7' : '1px solid #374151', 
                        borderRadius: '16px', padding: '16px', cursor: 'pointer',
                        transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{pkg.name}</div>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 'bold', 
                          padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: 'rgba(52, 211, 153, 0.2)',
                          color: '#34d399',
                          border: '1px solid #34d399'
                        }}>
                          ⚡ เติมตรง AUTO 100%
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#34d399', marginBottom: '8px' }}>โบนัส: {pkg.bonus}</div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>฿{pkg.price.toLocaleString()}</div>
                    </div>
                  );
                })}
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
                  <div key={pm.id} className="cyber-card-clickable" onClick={() => setSelectedPayment(pm)} style={{ 
                      backgroundColor: selectedPayment?.id === pm.id ? 'rgba(56, 189, 248, 0.2)' : '#030712', 
                      border: selectedPayment?.id === pm.id ? '2px solid #38bdf8' : '1px solid #374151', 
                      borderRadius: '14px', padding: '14px', cursor: 'pointer' 
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
                <b style={{ color: '#ffffff', backgroundColor: 'rgba(147,51,234,0.3)', padding: '2px 10px', borderRadius: '6px', border: '1px solid #9333ea' }}>{user.username && user.username.includes('@') ? user.username.split('@')[0] : user.username}</b>
                {!isUserAdmin && <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '6px' }}>(แสดงเฉพาะประวัติคำสั่งซื้อของคุณเอง)</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder={isUserAdmin ? "🔍 ค้นหาชื่อบัญชีลูกค้า..." : user.username}
                value={isUserAdmin ? exactSearchQuery : (user.username && user.username.includes('@') ? user.username.split('@')[0] : user.username)} 
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
                          {ord.type === 'game' && !ord.deliveredCode && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ backgroundColor: ord.status.includes('สำเร็จ') ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: `1px solid ${ord.status.includes('สำเร็จ') ? '#34d399' : '#f59e0b'}`, color: ord.status.includes('สำเร็จ') ? '#34d399' : '#fbbf24', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                {ord.status.includes('สำเร็จ')
                                  ? `⚡ เติมแพ็กเกจเข้า UID (${ord.gameChar || ord.player}) โดยตรงสำเร็จแล้ว (AUTO 100% ไม่ต้องใช้โค้ด)`
                                  : `⏳ กำลังดำเนินการเติมแพ็กเกจเข้า UID (${ord.gameChar || ord.player}) อัตโนมัติ...`}
                              </span>
                            </div>
                          )}
                          {ord.deliveredCode && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>🎁 รหัสสินค้าที่ได้รับ:</span>
                              <code style={{ backgroundColor: '#111827', color: '#ffffff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #34d399', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>{ord.deliveredCode}</code>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(ord.deliveredCode);
                                }} 
                                style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                📋 คัดลอก
                              </button>
                            </div>
                          )}
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
                  <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    เข้าสู่ระบบแอดมิน
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8', boxShadow: '0 0 25px rgba(56,189,248,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🔐 เปลี่ยนรหัส PIN 6 หลัก</h3>
                        <button onClick={() => { setIsAdminLoggedIn(false); localStorage.removeItem('cyber_is_admin_logged'); }} style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                          ล็อกเอาท์ PIN
                        </button>
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
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                        ✨ บันทึกเปลี่ยนรหัส PIN ใหม่
                      </button>
                    </form>
                  </div>

                  <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #ec4899', boxShadow: '0 0 25px rgba(236,72,153,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f472b6', margin: 0 }}>📢 บันทึกรายการโปรโมทเว็บ / ค่าโฆษณา</h3>
                      {adPromotions.length > 0 && (
                        <button 
                          type="button" 
                          onClick={handleClearAllAdPromotions}
                          style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          🗑️ ลบทั้งหมด
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddAdPromotion} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '8px', marginBottom: '15px' }}>
                      <select 
                        value={adPlatform} 
                        onChange={(e) => setAdPlatform(e.target.value)} 
                        className="cyber-select cyber-select-pink"
                        style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px 36px 10px 12px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                      >
                        <option value="Facebook Ads">Facebook Ads</option>
                        <option value="TikTok Ads">TikTok Ads</option>
                        <option value="Google / YouTube Ads">Google / YouTube Ads</option>
                        <option value="Instagram Ads">Instagram Ads</option>
                        <option value="LINE Official Account">LINE Official Account</option>
                        <option value="อื่นๆ (Custom)">อื่นๆ (Custom)</option>
                      </select>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          placeholder="ยอดเงิน (บาท)" 
                          value={adAmountInput} 
                          onChange={(e) => setAdAmountInput(e.target.value)} 
                          className="no-native-spin"
                          style={{ backgroundColor: '#030712', border: '1px solid #ec4899', borderRadius: '10px', padding: '10px 28px 10px 12px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', width: '100%' }} 
                        />
                        <div style={{ position: 'absolute', right: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button 
                            type="button" 
                            onClick={() => setAdAmountInput(prev => String(Math.max(0, (parseFloat(prev) || 0) + 100)))}
                            title="เพิ่มยอดเงิน"
                            style={{ background: 'rgba(236,72,153,0.25)', border: '1px solid #ec4899', borderRadius: '3px', width: '18px', height: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', fontSize: '8px', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                          >
                            ▲
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setAdAmountInput(prev => String(Math.max(0, (parseFloat(prev) || 0) - 100)))}
                            title="ลดยอดเงิน"
                            style={{ background: 'rgba(236,72,153,0.25)', border: '1px solid #ec4899', borderRadius: '3px', width: '18px', height: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', fontSize: '8px', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
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
                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', padding: '20px 0' }}>ยังไม่มีรายการค่าโปรโมท (ว่างเปล่า)</div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', color: '#c084fc', fontWeight: 'bold' }}>{isAdminOrdersOpen ? '▼' : '▶'}</span>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#ffffff' }}>📊 รายการทำรายการหลังบ้าน + ช่องทางที่ลูกค้าชำระเงิน</h2>
                    </div>
                    <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.3)', color: '#c084fc', border: '1px solid #9333ea', padding: '4px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold' }}>{filteredOrders.length} รายการ</span>
                  </div>

                  {isAdminOrdersOpen && (
                    <div style={{ padding: '25px' }}>
                      <input type="text" placeholder="🔍 ค้นหาเลขออร์เดอร์ หรือชื่อบัญชีลูกค้า..." value={adminSearchQuery} onChange={(e) => { setAdminSearchQuery(e.target.value); setAdminOrdersPage(1); }} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '12px', padding: '12px', color: '#ffffff', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} />
                      
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

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #10b981', boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#34d399', margin: 0 }}>⚡ ระบบเติมแพ็กเกจหลังบ้าน AUTO 100% (Direct UID Auto Top-Up)</h3>
                      <p style={{ fontSize: '12px', color: '#d1d5db', margin: '4px 0 0 0' }}>
                        แอดมินไม่ต้องมานั่งเติมสต็อกแพ็กเกจเอง และลูกค้าไม่ต้องก๊อปโค้ดไปใส่เอง (เมื่อครบ 10 วินาที หรือแอดมินกดอนุมัติ ระบบจะยิงแพ็กเกจเข้า UID ลูกค้าอัตโนมัติ)
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                        🟢 สถานะแพ็กเกจหลังบ้าน: AUTO 100% ทุกเกม
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {gamesData.map((g) => (
                      <div key={g.id} style={{ backgroundColor: '#030712', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>{g.name}</div>
                          <div style={{ fontSize: '10px', color: '#38bdf8' }}>พร้อมเติม {g.packages.length} แพ็กเกจ</div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: '3px 8px', borderRadius: '6px', border: '1px solid #34d399' }}>
                          ⚡ AUTO 100%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: showLegacyStockAdmin ? 'block' : 'none' }}>

                  {stockMsg.text && (
                    <div style={{ backgroundColor: stockMsg.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: stockMsg.type === 'success' ? '#34d399' : '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px' }}>
                      {stockMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleAddStock} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '16px', padding: '20px', marginBottom: '22px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>➕ เพิ่มรหัส/โค้ดสินค้าใหม่เข้าสต็อก</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>1. เลือกเกม</label>
                        <select 
                          value={stockGame} 
                          onChange={(e) => {
                            setStockGame(e.target.value);
                            const g = gamesData.find(gm => gm.name === e.target.value);
                            if (g && g.packages.length > 0) setStockPackage(g.packages[0].name);
                          }} 
                          className="cyber-select cyber-select-cyan"
                          style={{ width: '100%', backgroundColor: '#111827', border: '1.5px solid #38bdf8', borderRadius: '10px', padding: '10px 38px 10px 12px', color: '#ffffff', outline: 'none', cursor: 'pointer', fontWeight: 'bold', boxSizing: 'border-box' }}
                        >
                          {gamesData.map((g) => (
                            <option key={g.id} value={g.name}>{g.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>2. เลือกแพ็กเกจของเกม</label>
                        <select 
                          value={stockPackage} 
                          onChange={(e) => setStockPackage(e.target.value)} 
                          className="cyber-select cyber-select-purple"
                          style={{ width: '100%', backgroundColor: '#111827', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '10px 38px 10px 12px', color: '#c084fc', fontWeight: 'bold', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          {(gamesData.find(g => g.name === stockGame)?.packages || []).map((pkg) => (
                            <option key={pkg.id} value={pkg.name}>{pkg.name} (฿{pkg.price})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                        3. กรอกรหัส/โค้ดสินค้า (วางหลายรหัสได้ แยกบรรทัดละ 1 โค้ด)
                      </label>
                      <textarea 
                        rows={3} 
                        placeholder={"เช่น:\nVAL-A1B2-C3D4-E5F6\nVAL-G7H8-I9J0-K1L2\nVAL-M3N4-O5P6-Q7R8"} 
                        value={stockCodesInput} 
                        onChange={(e) => setStockCodesInput(e.target.value)} 
                        className="cyber-textarea"
                        style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', resize: 'vertical' }} 
                      />
                    </div>

                    <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}>
                      + บันทึกรหัสเข้าสต็อกเรียลไทม์
                    </button>
                  </form>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginBottom: '10px' }}>📊 สถานะสต็อกคงเหลือแยกตามเกม</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                      {gamesData.map((g) => {
                        const inStockCount = stockList.filter(s => s.game === g.name && s.status === 'available').length;
                        return (
                          <div key={g.id} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{g.name}</span>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: inStockCount > 0 ? '#34d399' : '#ef4444' }}>
                              {inStockCount > 0 ? `🟢 พร้อมส่ง ${inStockCount} ชิ้น` : '🔴 สต็อกหมด'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>📋 รายการรหัสในสต็อกทั้งหมด ({stockList.length} ชิ้น)</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          value={stockFilterGame} 
                          onChange={(e) => { setStockFilterGame(e.target.value); setStockPage(1); }} 
                          className="cyber-select cyber-select-cyan"
                          style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '8px', padding: '6px 30px 6px 10px', color: '#ffffff', fontSize: '11px', outline: 'none' }}
                        >
                          <option value="all">ทุกเกม</option>
                          {gamesData.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                        </select>
                        <select 
                          value={stockFilterStatus} 
                          onChange={(e) => { setStockFilterStatus(e.target.value); setStockPage(1); }} 
                          className="cyber-select cyber-select-purple"
                          style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '8px', padding: '6px 30px 6px 10px', color: '#ffffff', fontSize: '11px', outline: 'none' }}
                        >
                          <option value="all">ทุกสถานะ</option>
                          <option value="available">พร้อมส่ง</option>
                          <option value="used">ส่งมอบแล้ว</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {stockList
                        .filter(s => stockFilterGame === 'all' || s.game === stockFilterGame)
                        .filter(s => stockFilterStatus === 'all' || s.status === stockFilterStatus)
                        .slice((stockPage - 1) * 8, stockPage * 8)
                        .map((item) => (
                          <div key={item.firebaseKey} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                            <div>
                              <span style={{ backgroundColor: item.status === 'available' ? 'rgba(52,211,153,0.2)' : 'rgba(107,114,128,0.2)', color: item.status === 'available' ? '#34d399' : '#9ca3af', border: `1px solid ${item.status === 'available' ? '#34d399' : '#6b7280'}`, padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', marginRight: '8px' }}>
                                {item.status === 'available' ? 'พร้อมส่ง' : 'ส่งมอบแล้ว'}
                              </span>
                              <b style={{ color: '#38bdf8', marginRight: '6px' }}>[{item.game}]</b>
                              <span style={{ color: '#c084fc', marginRight: '10px' }}>{item.package}</span>
                              <code style={{ backgroundColor: '#111827', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #374151' }}>{item.code}</code>
                              {item.deliveredTo && (
                                <span style={{ color: '#9ca3af', marginLeft: '10px', fontSize: '11px' }}>ส่งให้: <b style={{ color: '#f472b6' }}>{item.deliveredTo}</b> ({item.deliveredAt})</span>
                              )}
                            </div>
                            <div>
                              {item.status === 'available' && (
                                <button onClick={() => handleDeleteStock(item)} style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>ลบ</button>
                              )}
                            </div>
                          </div>
                        ))}
                      {stockList.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0', fontSize: '12px' }}>ยังไม่มีรายการรหัสในสต็อก</div>
                      )}
                    </div>
                  </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderRadius: '20px', padding: '25px', border: '1.5px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>🎁 สร้างและจัดการโค้ดของขวัญ / โค้ดกิจกรรม (Realtime Cloud)</h3>
                    <button onClick={handleResetAllRedeemRights} style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                      🔄 รีเซ็ตสิทธิ์ ID เกมทั้งหมด
                    </button>
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
                    <div>
                      <label style={{ fontSize: '11px', color: '#facc15', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>5. แรงค์ขั้นต่ำที่ใช้โค้ดได้</label>
                      <select value={newCodeMinRank} onChange={(e) => setNewCodeMinRank(Number(e.target.value))} style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #eab308', borderRadius: '10px', padding: '10px', color: '#facc15', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }}>
                        {rankTiers.map((r) => (
                          <option key={r.level} value={r.level}>
                            {r.icon} {r.level === 0 ? 'ทุกคนใช้ได้ (ไม่จำกัดแรงค์)' : `${r.name} ขึ้นไป (฿${r.minSpend.toLocaleString()}+)`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                        + สร้างโค้ดกิจกรรมใหม่ (บันทึกลงเรียลไทม์)
                      </button>
                    </div>
                  </form>

                  <h4 style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 10px 0' }}>📋 รายการโค้ดที่มีในระบบปัจจุบัน ({giftCodes.length} โค้ด)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {giftCodes.map((c) => (
                      <div key={c.firebaseKey || c.code} style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{c.code}</span>
                          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>[{c.game}]</span>
                          <span style={{ color: '#34d399', fontSize: '13px' }}>🎁 {c.reward}</span>
                          <span style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)', border: '1px solid #eab308', color: '#facc15', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {c.minRankLevel > 0 ? `🔒 เฉพาะ ${c.minRankName || 'VIP'} ขึ้นไป` : '🌐 ทุกคนใช้ได้'}
                          </span>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>📱 สแกน QR PromptPay ชำระเงิน</h3>
                  <span style={{ fontSize: '11px', color: isQrExpired ? '#ef4444' : '#34d399', fontWeight: 'bold', backgroundColor: 'rgba(52,211,153,0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid #34d399' }}>
                    ⚡ AUTO 24 ชม.
                  </span>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', marginBottom: '16px', border: '2px solid #005696' }}>
                  <div style={{ backgroundColor: '#005696', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: '#ffffff', color: '#005696', fontWeight: '900', fontSize: '12px', padding: '2px 6px', borderRadius: '4px' }}>พร้อมเพย์</span>
                      <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>PromptPay</span>
                    </div>
                    <span style={{ color: '#ffffff', fontSize: '11px', opacity: 0.85 }}>CYBER TOPUP STORE</span>
                  </div>

                  <div style={{ padding: '16px', textAlign: 'center', color: '#111827' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>ชื่อบัญชี: บจก. ไซเบอร์ ท็อปอัพ (ประเทศไทย)</div>
                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>ยอดชำระสุทธิ: <span style={{ color: '#005696', fontSize: '20px', fontWeight: '900' }}>฿{(selectedPackage.price * packageQuantity).toLocaleString()}</span></div>

                    <div style={{ display: 'inline-block', padding: '8px', border: '1.5px dashed #005696', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PromptPay-CyberTopup-${selectedGame.name}-${selectedPackage.price * packageQuantity}`} alt="PromptPay QR" style={{ width: '150px', height: '150px', display: 'block' }} />
                    </div>

                    <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', marginTop: '8px' }}>
                      ⏱️ สแกนจ่ายภายใน: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} นาที
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '14px', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>📸 แนบสลิปโอนเงิน (ระบบตรวจสลิป & เติมแพ็กเกจเข้า UID อัตโนมัติ)</div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 10px 0' }}>โอนเงินแล้วแนบรูปสลิป หรือกดปุ่มยืนยัน ระบบจะเติมแพ็กเกจเข้าไอดีเกมอัตโนมัติใน 10 วินาที (หรือแอดมินกดอนุมัติทันที)</p>

                  {slipVerifying ? (
                    <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔄</div>
                      <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{slipVerifyStepText}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '1.5px dashed #38bdf8', borderRadius: '10px', cursor: 'pointer', backgroundColor: 'rgba(56, 189, 248, 0.05)' }}>
                        <span style={{ fontSize: '14px' }}>📁</span>
                        <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>{slipFile ? slipFile.name : 'แตะเพื่อเลือกรูปสลิปโอนเงิน...'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSlipFile(e.target.files[0]);
                              setSlipPreview(URL.createObjectURL(e.target.files[0]));
                            }
                          }} 
                        />
                      </label>

                      {slipPreview && (
                        <div style={{ textAlign: 'center' }}>
                          <img src={slipPreview} alt="Slip Preview" style={{ maxHeight: '90px', borderRadius: '6px', border: '1px solid #374151' }} />
                        </div>
                      )}

                      <button 
                        type="button" 
                        onClick={handleSimulateSlipScan}
                        style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                      >
                        ⚡ ตรวจสอบสลิป & ส่งคำสั่งเติมแพ็กเกจ (AUTO 100%)
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: '1.5px solid #374151', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>← ย้อนกลับ</button>
                  <button onClick={handleFinalPaymentSubmit} style={{ flex: 1, backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>ฉันโอนเงินเรียบร้อยแล้ว</button>
                  <button type="button" onClick={handleFinalPaymentSubmit} style={{ display: 'none' }}>ข้ามไปส่งมอบโค้ด</button>
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
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>ระบบได้ส่งรหัส OTP ไปยังเบอร์ <b style={{ color: '#ffffff' }}>{truemoneyPhone}</b> แล้ว</p>
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
                      <input type="text" placeholder="MM/YY" value={creditCardExp} onChange={handleCreditCardExpChange} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }} />
                      <input type="password" placeholder="CVV" value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={resetWalletModal} style={{ flex: 1, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button 
                    disabled={!topupAmount || parseFloat(topupAmount) <= 0 || (walletPaymentMethod === 'true' && (!truemoneyPhone || truemoneyPhone.length < 10))} 
                    onClick={walletPaymentMethod === 'qrcode' ? () => setWalletStep(2) : walletPaymentMethod === 'true' ? () => {
                      if (!truemoneyPhone || truemoneyPhone.length < 10) {
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

      {deliveredStockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ backgroundColor: '#111827', border: '2px solid #34d399', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', boxShadow: '0 0 40px rgba(52,211,153,0.45)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.2)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 15px auto' }}>
              🎁
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0', color: '#34d399' }}>ทำรายการสำเร็จ 24 ชม.!</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>ระบบได้ส่งมอบรหัสสินค้าจากสต็อกให้คุณเรียบร้อยแล้ว</p>
            
            <div style={{ backgroundColor: '#030712', border: '1.5px dashed #34d399', borderRadius: '16px', padding: '18px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>🎮 เกม: <b style={{ color: '#ffffff' }}>{deliveredStockModal.game}</b></div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>📦 แพ็กเกจ: <b style={{ color: '#38bdf8' }}>{deliveredStockModal.package}</b></div>
              <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold', marginBottom: '6px' }}>🔑 รหัสสินค้า / โค้ดของคุณ:</div>
              <div style={{ backgroundColor: '#111827', border: '1.5px solid #34d399', borderRadius: '10px', padding: '12px', color: '#ffffff', fontSize: '17px', fontWeight: '900', letterSpacing: '1px', wordBreak: 'break-all', textAlign: 'center', userSelect: 'all' }}>
                {deliveredStockModal.code}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' }}>
                💡 รหัสนี้ถูกบันทึกไว้ในหน้า "📋 เช็คสถานะ" ของคุณแล้ว สามารถเปิดดูซ้ำได้ตลอดเวลา
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => {
                  navigator.clipboard.writeText(deliveredStockModal.code);
                }} 
                style={{ flex: 1.2, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
              >
                📋 คัดลอกรหัสทันที
              </button>
              <button 
                type="button" 
                onClick={() => setDeliveredStockModal(null)} 
                style={{ flex: 0.8, backgroundColor: '#374151', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '13px' }}>
        <p style={{ margin: 0 }}>⚡ <b>CYBER TOPUP</b> - บริการเติมเกมออนไลน์ ตลอด 24 ชั่วโมง</p>
      </footer>
    </div>
  );
}
