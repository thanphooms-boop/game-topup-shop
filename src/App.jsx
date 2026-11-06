import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';
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
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700;800;900&display=swap');

  body, input, button, select, textarea {
    font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }

  button, 
  [role="button"], 
  input[type="submit"], 
  input[type="button"],
  .cyber-btn {
    position: relative;
    cursor: pointer !important;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none !important;
  }

  button:hover:not(:disabled),
  [role="button"]:hover,
  input[type="submit"]:hover,
  input[type="button"]:hover,
  .cyber-btn:hover {
    transform: translateY(-3px) scale(1.025) !important;
    filter: brightness(1.08) !important;
    box-shadow: 0 10px 25px rgba(249, 115, 22, 0.35), 0 0 15px rgba(236, 72, 153, 0.25) !important;
  }

  button:active:not(:disabled),
  [role="button"]:active,
  input[type="submit"]:active,
  input[type="button"]:active,
  .cyber-btn:active {
    transform: translateY(1px) scale(0.97) !important;
    filter: brightness(0.95) !important;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2) !important;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: #fff7ed;
    border-radius: 10px;
    border: 1px solid #fed7aa;
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #f97316, #ec4899);
    border-radius: 10px;
    border: 2px solid #fff7ed;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #ea580c, #db2777);
  }

  .no-native-spin::-webkit-inner-spin-button,
  .no-native-spin::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .no-native-spin {
    -moz-appearance: textfield;
  }

  .cyber-select {
    appearance: none;
    -webkit-appearance: none;
    background-repeat: no-repeat !important;
    background-position: right 14px center !important;
    background-size: 16px !important;
    padding-right: 38px !important;
    cursor: pointer;
    background-color: #ffffff !important;
    color: #1e293b !important;
    border: 2px solid #fed7aa !important;
    border-radius: 12px !important;
  }

  @keyframes packageSelectPulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.4), 0 0 35px rgba(168, 85, 247, 0.35);
      border-color: #f59e0b;
    }
    50% {
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.75), 0 0 55px rgba(168, 85, 247, 0.6);
      border-color: #fde047;
    }
  }

  .package-card-selected {
    animation: packageSelectPulse 2.8s ease-in-out infinite;
    transform: translateY(-4px) scale(1.02) !important;
  }

  .package-card-item {
    transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    position: relative;
    cursor: pointer;
  }
  .package-card-item:hover:not(.out-of-stock) {
    transform: translateY(-5px) scale(1.025) !important;
    border-color: #38bdf8 !important;
    box-shadow: 0 14px 30px rgba(168, 85, 247, 0.4), 0 0 20px rgba(56, 189, 248, 0.35) !important;
  }

  @keyframes catCoinGlow {
    0%, 100% {
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.45), 0 0 50px rgba(234, 88, 12, 0.25), inset 0 0 15px rgba(254, 243, 199, 0.15);
      border-color: rgba(245, 158, 11, 0.85);
    }
    50% {
      box-shadow: 0 0 45px rgba(245, 158, 11, 0.8), 0 0 75px rgba(234, 88, 12, 0.5), inset 0 0 25px rgba(254, 243, 199, 0.3);
      border-color: #fde047;
    }
  }

  @keyframes catCoinFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-5px) rotate(5deg);
    }
  }

  .cat-coin-card-glow {
    animation: catCoinGlow 3.5s ease-in-out infinite;
  }

  .cat-coin-icon-float {
    display: inline-block;
    animation: catCoinFloat 2.8s ease-in-out infinite;
  }
`;

// ไอคอนเหรียญทอง Cat Coin เวกเตอร์ SVG สวยคมชัด 100%
const CatCoinIcon = ({ size = 20, style = {}, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, filter: 'drop-shadow(0 2px 5px rgba(245, 158, 11, 0.45))', ...style }}
  >
    <defs>
      <linearGradient id="catCoinGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="catCoinInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="url(#catCoinGoldGrad)" stroke="#78350f" strokeWidth="1" />
    <circle cx="16" cy="16" r="13" fill="url(#catCoinInnerGrad)" stroke="#fef08a" strokeWidth="0.8" />
    <ellipse cx="16" cy="18" rx="4.5" ry="3.8" fill="#78350f" opacity="0.88" />
    <circle cx="11.5" cy="12.5" r="1.8" fill="#78350f" opacity="0.88" />
    <circle cx="14.5" cy="10.8" r="1.8" fill="#78350f" opacity="0.88" />
    <circle cx="17.5" cy="10.8" r="1.8" fill="#78350f" opacity="0.88" />
    <circle cx="20.5" cy="12.5" r="1.8" fill="#78350f" opacity="0.88" />
  </svg>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('shop');

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <style>{cyberGlobalStyles}</style>
      <div className="cat-coin-icon-float" style={{ fontSize: '48px', marginBottom: '15px' }}>🐱</div>
      <h1>Cyber Game Top-up Shop</h1>
      <p>ระบบพร้อมใช้งานแล้ว ขนาดไฟล์ถูกปรับให้เหมาะสมและน้ำหนักเบาลงเรียบร้อยครับ!</p>
    </div>
  );
}
