/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Globe, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  History, 
  Zap, 
  ShieldCheck, 
  MessageSquareQuote,
  Loader2,
  ChevronRight,
  Bell,
  Menu,
  X,
  Smartphone,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';

// --- Constants & Types ---

const AFGHAN_OPERATORS = [
  { 
    id: 'roshan', 
    name: 'Roshan', 
    color: '#e11d48', 
    logo: 'R', 
    prefix: ['79', '72'],
    secondaryColor: '#9f1239',
    details: {
      en: "Largest network with 6M+ users. Best coverage in Kabul and major cities.",
      fa: "بزرگترین شبکه با بیش از ۶ میلیون کاربر. بهترین پوشش در کابل و شهرهای بزرگ.",
      ps: "تر ټولو لویه شبکه چې له ۶ ملیونو ډیر کاروونکي لري. په کابل او لویو ښارونو کې غوره پوښښ."
    }
  },
  { 
    id: 'etisalat', 
    name: 'Etisalat', 
    color: '#059669', 
    logo: 'E', 
    prefix: ['78', '77'],
    secondaryColor: '#064e3b',
    details: {
      en: "Leading 4G provider. Known for high-speed data bundles.",
      fa: "پیشرو در ارائه خدمات 4G. معروف به بسته‌های انترنتی پرسرعت.",
      ps: "د 4G خدماتو مخکښ وړاندې کوونکی. د لوړ سرعت انټرنیټ کڅوړو لپاره پیژندل شوی."
    }
  },
  { 
    id: 'awcc', 
    name: 'AWCC', 
    color: '#f97316', 
    logo: 'A', 
    prefix: ['70', '71'],
    secondaryColor: '#9a3412',
    details: {
      en: "First mobile operator in AFG. Strongest rural coverage.",
      fa: "اولین اپراتور موبایل در افغانستان. قوی‌ترین پوشش در مناطق روستایی.",
      ps: "په افغانستان کې لومړی ګرځنده آپریټر. په کلیوالو سیمو کې ترټولو قوي پوښښ."
    }
  },
  { 
    id: 'mtn', 
    name: 'MTN', 
    color: '#facc15', 
    logo: 'M', 
    prefix: ['76', '77'],
    secondaryColor: '#a16207',
    details: {
      en: "Global brand with competitive international calling rates.",
      fa: "برند جهانی با نرخ‌های رقابتی برای تماس‌های بین‌المللی.",
      ps: "نړیوال برانډ د نړیوالو اړیکو لپاره د رقابتی نرخونو سره."
    }
  },
  { 
    id: 'salam', 
    name: 'Salam', 
    color: '#2563eb', 
    logo: 'S', 
    prefix: ['74'],
    secondaryColor: '#1e3a8a',
    details: {
      en: "Government-backed network. Most affordable local rates.",
      fa: "شبکه تحت حمایت دولت. ارزان‌ترین نرخ‌های محلی.",
      ps: "د حکومت لخوا ملاتړ شوې شبکه. خورا ارزانه محلي نرخونه."
    }
  },
];

const TRANSLATIONS = {
  en: {
    welcome: "Welcome back to the diaspora network",
    join: "Join the global Afghan community",
    start: "Start Top-up",
    history: "History",
    logout: "Logout",
    settings: "Settings",
    connect: "Connect",
    afghanistan: "Afghanistan",
    instant: "Instant Global Transfer",
    desc: "The most reliable way for the diaspora to send airtime and data bundles to loved ones across all Afghan networks.",
    who: "Who are you sending to?",
    enter: "Enter the Afghan mobile number starting with 7x.",
    detected: "Detected Network",
    back: "Back",
    continue: "Continue",
    select: "Select Amount",
    receives: "Recipient Receives",
    personalize: "Personalize Gift",
    addMsg: "Add a Message",
    ai: "AI Assistant",
    regenerate: "Regenerate",
    preview: "Preview",
    payment: "Go to Payment",
    secure: "Secure Checkout",
    stripe: "Payment processed via Stripe",
    total: "Total to Pay",
    card: "Card Details",
    expiry: "Expiry",
    cvc: "CVC",
    pay: "Pay",
    success: "Top-up Sent!",
    delivered: "The credit has been instantly delivered to",
    receipt: "Receipt",
    another: "Send Another Top-up",
    privacy: "Privacy",
    terms: "Terms",
    compliance: "Compliance",
    help: "Help",
    profile: "Profile",
    language: "Language",
    save: "Save Changes",
    name: "Full Name",
    email: "Email Address",
    password: "Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    createAccount: "Create Account",
    orWithEmail: "Or with email",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log In",
    notifications: "Notifications",
    security: "Security",
    enablePush: "Enable Push Notifications",
    twoFactor: "Two-Factor Authentication"
  },
  fa: {
    welcome: "به شبکه دیاسپورا خوش آمدید",
    join: "به جامعه جهانی افغان بپیوندید",
    start: "شروع ارسال اعتبار",
    history: "تاریخچه",
    logout: "خروج",
    settings: "تنظیمات",
    connect: "اتصال به",
    afghanistan: "افغانستان",
    instant: "انتقال فوری جهانی",
    desc: "مطمئن‌ترین راه برای دیاسپورا جهت ارسال اعتبار و بسته‌های انترنتی به عزیزان در تمام شبکه‌های افغانستان.",
    who: "به چه کسی ارسال می‌کنید؟",
    enter: "شماره موبایل افغانستان را که با ۷ شروع می‌شود وارد کنید.",
    detected: "شبکه شناسایی شده",
    back: "برگشت",
    continue: "ادامه",
    select: "انتخاب مبلغ",
    receives: "دریافت کننده دریافت می‌کند",
    personalize: "شخصی‌سازی هدیه",
    addMsg: "افزودن پیام",
    ai: "دستیار هوش مصنوعی",
    regenerate: "تولید مجدد",
    preview: "پیش‌نمایش",
    payment: "رفتن به پرداخت",
    secure: "پرداخت امن",
    stripe: "پرداخت توسط Stripe پردازش می‌شود",
    total: "مبلغ قابل پرداخت",
    card: "مشخصات کارت",
    expiry: "تاریخ انقضا",
    cvc: "کد امنیتی",
    pay: "پرداخت",
    success: "اعتبار ارسال شد!",
    delivered: "اعتبار بلافاصله تحویل داده شد به",
    receipt: "رسید",
    another: "ارسال اعتبار دیگر",
    privacy: "حریم خصوصی",
    terms: "شرایط",
    compliance: "انطباق",
    help: "کمک",
    profile: "پروفایل",
    language: "زبان",
    save: "ذخیره تغییرات",
    name: "نام کامل",
    email: "آدرس ایمیل",
    password: "رمز عبور",
    signIn: "ورود",
    signUp: "ثبت نام",
    createAccount: "ایجاد حساب کاربری",
    orWithEmail: "یا با ایمیل",
    dontHaveAccount: "حساب کاربری ندارید؟",
    alreadyHaveAccount: "قبلاً حساب کاربری ساخته‌اید؟",
    logIn: "وارد شوید",
    notifications: "اعلان‌ها",
    security: "امنیت",
    enablePush: "فعال‌سازی اعلان‌های فشاری",
    twoFactor: "احراز هویت دو مرحله‌ای"
  },
  ps: {
    welcome: "د ډیاسپورا شبکې ته ښه راغلاست",
    join: "د نړیوالې افغان ټولنې سره یوځای شئ",
    start: "د کریډیټ لیږل پیل کړئ",
    history: "تاریخچه",
    logout: "وتل",
    settings: "ترتیبات",
    connect: "وصل کړئ",
    afghanistan: "افغانستان",
    instant: "فوري نړیوال لیږد",
    desc: "د ډیاسپورا لپاره ترټولو د باور وړ لاره چې په ټولو افغان شبکو کې خپلو عزیزانو ته کریډیټ او انټرنیټ کڅوړې واستوي.",
    who: "چا ته یې لیږئ؟",
    enter: "د افغانستان ګرځنده شمیره دننه کړئ چې په ۷ پیل کیږي.",
    detected: "پیژندل شوې شبکه",
    back: "شاته",
    continue: "دوام ورکړئ",
    select: "مبلغ غوره کړئ",
    receives: "ترلاسه کونکی ترلاسه کوي",
    personalize: "ډالۍ شخصي کړئ",
    addMsg: "پیغام اضافه کړئ",
    ai: "د AI مرستیال",
    regenerate: "بیا تولید",
    preview: "مخکتنه",
    payment: "تادیې ته لاړشئ",
    secure: "خوندي تادیه",
    stripe: "تادیه د Stripe لخوا پروسس کیږي",
    total: "ټوله تادیه",
    card: "د کارت توضیحات",
    expiry: "نیټه",
    cvc: "کوډ",
    pay: "تادیه",
    success: "کریډیټ واستول شو!",
    delivered: "کریډیټ سمدلاسه وسپارل شو",
    receipt: "رسید",
    another: "بل کریډیټ واستوئ",
    privacy: "محرمیت",
    terms: "شرایط",
    compliance: "اطاعت",
    help: "مرسته",
    profile: "پروفایل",
    language: "ژبه",
    save: "بدلونونه خوندي کړئ",
    name: "بشپړ نوم",
    email: "بریښنالیک",
    password: "پټ نوم",
    signIn: "ننوتل",
    signUp: "نوم لیکنه",
    createAccount: "حساب جوړ کړئ",
    orWithEmail: "یا د بریښنالیک له لارې",
    dontHaveAccount: "حساب نلرئ؟",
    alreadyHaveAccount: "دمخه حساب لرئ؟",
    logIn: "ننوځئ",
    notifications: "خبرتیاوې",
    security: "امنیت",
    enablePush: "د پش خبرتیاوې فعال کړئ",
    twoFactor: "دوه مرحله ای تصدیق"
  }
};

type Language = 'en' | 'fa' | 'ps';

const TOPUP_AMOUNTS = [
  { usd: 5, afn: 350 },
  { usd: 10, afn: 700 },
  { usd: 20, afn: 1400 },
  { usd: 50, afn: 3500 },
  { usd: 100, afn: 7000 },
];

type Step = 'auth' | 'hero' | 'recipient' | 'plan' | 'personalize' | 'payment' | 'success';

interface User {
  email: string;
  name: string;
}

interface Transaction {
  id: string;
  number: string;
  operator: string;
  amountUsd: number;
  amountAfn: number;
  date: string;
  status: 'completed' | 'pending';
}

// --- Components ---

const Navbar = ({ onShowHistory, user, onLogout, onShowSettings, t, language, isRTL }: { onShowHistory: () => void, user: User | null, onLogout: () => void, onShowSettings: () => void, t: any, language: Language, isRTL: boolean }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="w-10 h-8 bg-sky-400 rounded-lg flex items-center justify-center font-black text-black text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)] group-hover:scale-110 transition-transform">AFG</div>
        <div className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-tighter text-white">AFGTopUp</span>
          <span className="text-[8px] font-bold text-sky-400 tracking-[0.2em] uppercase">Diaspora Network</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <button 
        onClick={onShowHistory}
        className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2"
      >
        <History size={18} />
        <span className="hidden sm:inline">{t.history}</span>
      </button>
    <div className={`flex items-center gap-3 ${isRTL ? 'pr-6 border-r' : 'pl-6 border-l'} border-white/10`}>
      <div className={`hidden sm:block ${isRTL ? 'text-left' : 'text-right'}`}>
        <p className="text-xs font-bold text-white">{user?.name}</p>
        <button 
          onClick={onShowSettings}
          className="text-[10px] text-white/40 hover:text-sky-400 uppercase tracking-widest font-bold transition-colors"
        >
          {t.settings}
        </button>
      </div>
      <button 
        onClick={onShowSettings}
        className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-sky-400 font-bold hover:bg-white/10 transition-colors"
      >
        {user?.name?.[0]}
      </button>
    </div>
    </div>
  </nav>
);

export default function App() {
  const [step, setStep] = useState<Step>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [showSettings, setShowSettings] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<{ type: string, open: boolean }>({ type: '', open: false });
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const t = TRANSLATIONS[language];
  const isRTL = language === 'fa' || language === 'ps';
  const [selectedOperator, setSelectedOperator] = useState<typeof AFGHAN_OPERATORS[0] | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<typeof TOPUP_AMOUNTS[0] | null>(null);
  const [message, setMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize Gemini
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  const handleGenerateMessage = async () => {
    if (!selectedOperator) return;
    setIsGeneratingMessage(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a short, warm, and professional SMS message in Dari and Pashto (with English translation) for a mobile top-up gift of ${selectedAmount?.afn} AFN to a loved one in Afghanistan. Keep it under 160 characters for the local languages.`,
      });
      setMessage(response.text || '');
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessage("Top-up sent! Enjoy the credit. (Error generating custom message)");
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        number: phoneNumber,
        operator: selectedOperator?.name || 'Unknown',
        amountUsd: selectedAmount?.usd || 0,
        amountAfn: selectedAmount?.afn || 0,
        date: new Date().toLocaleString(),
        status: 'completed'
      };
      setHistory([newTx, ...history]);
      setStep('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#ffffff', '#0ea5e9']
      });
    }, 2000);
  };

  const validatePhone = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setPhoneNumber(clean);
    
    // Auto-detect operator
    if (clean.length >= 2) {
      const prefix = clean.substring(0, 2);
      const op = AFGHAN_OPERATORS.find(o => o.prefix.includes(prefix));
      if (op) setSelectedOperator(op);
    }
  };

  return (
    <div className={`min-h-screen text-white font-sans selection:bg-sky-400/30 relative overflow-x-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mesh-gradient" />
      
      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-400/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {step !== 'auth' && (
        <Navbar 
          onShowHistory={() => setShowHistory(true)} 
          user={user} 
          onLogout={() => {
            setUser(null);
            setStep('auth');
          }}
          onShowSettings={() => setShowSettings(true)}
          t={t}
          language={language}
          isRTL={isRTL}
        />
      )}

      <main className={`${step === 'auth' ? '' : 'pt-24'} pb-12 px-6 max-w-4xl mx-auto`}>
        <AnimatePresence mode="wait">
          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="min-h-[80vh] flex flex-col items-center justify-center py-12"
            >
              <div className="w-full max-w-md glass-panel p-6 sm:p-10 rounded-[2.5rem]">
                <div className="text-center mb-8 sm:mb-12">
                  <div className="w-16 h-12 sm:w-20 sm:h-16 bg-sky-400 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-black mx-auto mb-6 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                    AFG
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">AFGTopUp</h1>
                  <p className="text-sm sm:text-base text-white/50">{authMode === 'login' ? t.welcome : t.join}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <button className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-sky-300 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t.connect} with Google
                  </button>
                  <button className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M17.05 20.28c-.96.95-2.21 1.72-3.72 1.72-2.47 0-4.03-1.56-4.03-4.03 0-2.47 1.56-4.03 4.03-4.03 1.51 0 2.76.77 3.72 1.72l2.83-2.83c-1.63-1.62-3.82-2.89-6.55-2.89-4.42 0-8 3.58-8 8s3.58 8 8 8c2.73 0 4.92-1.27 6.55-2.89l-2.83-2.83zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                    {t.connect} with Apple
                  </button>
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                    <span className="bg-[#050505] px-4 text-white/30">{t.orWithEmail}</span>
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setUser({ email: 'demo@afgtopup.com', name: 'Murtaza' });
                    setStep('hero');
                  }}
                  className="space-y-4"
                >
                  {authMode === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">{t.name}</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ahmad Shah"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-sky-400/50 transition-all"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">{t.email}</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-sky-400/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">{t.password}</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-sky-400/50 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-sky-400 text-black py-4 rounded-2xl font-black text-lg hover:bg-sky-300 transition-all mt-4"
                  >
                    {authMode === 'login' ? t.signIn : t.createAccount}
                  </button>
                </form>

                <p className="text-center mt-8 text-sm text-white/40">
                  {authMode === 'login' ? t.dontHaveAccount : t.alreadyHaveAccount}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="ml-2 text-sky-400 font-bold hover:underline"
                  >
                    {authMode === 'login' ? t.signUp : t.logIn}
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {step === 'hero' && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-400 text-xs font-bold tracking-widest uppercase mb-8">
                <Zap size={14} />
                {t.instant}
              </div>
              <div className="mb-12 px-4">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase mb-8">
                  {t.connect} <br />
                  <span className="text-sky-400">{t.afghanistan}</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-12 font-light leading-relaxed">
                  {t.desc}
                </p>
              </div>
              <button 
                onClick={() => setStep('recipient')}
                className="group relative inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-sky-300 transition-all duration-300"
              >
                {t.start}
                <ArrowRight className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
              </button>

              <div className="mt-8 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 max-w-3xl mx-auto">
                {AFGHAN_OPERATORS.map(op => (
                  <motion.div 
                    key={op.id} 
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="flex flex-col items-center gap-3 sm:gap-4 group cursor-pointer relative"
                  >
                    {/* Realistic SIM Card Icon */}
                    <div className="relative w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-sky-400/20 group-hover:shadow-2xl"
                         style={{ 
                           background: `linear-gradient(135deg, ${op.color}, ${op.secondaryColor})`,
                           border: '1px solid rgba(255,255,255,0.1)'
                         }}>
                      {/* SIM Card Notch */}
                      <div className="absolute top-0 right-0 w-4 h-4 bg-[#050505] rotate-45 translate-x-2 -translate-y-2" />
                      
                      {/* SIM Chip */}
                      <div className="absolute top-4 left-3 w-6 h-5 bg-yellow-400/80 rounded-sm border border-yellow-600/30 overflow-hidden">
                        <div className="grid grid-cols-2 h-full gap-[1px] opacity-30">
                          <div className="border-r border-b border-black/20" />
                          <div className="border-b border-black/20" />
                          <div className="border-r border-black/20" />
                          <div />
                        </div>
                      </div>

                      {/* Operator Logo/Initial */}
                      <div className="absolute bottom-3 right-3 text-white font-black text-2xl italic opacity-90">
                        {op.logo}
                      </div>

                      {/* Subtle Gloss */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40 group-hover:text-sky-400 transition-colors">
                        {op.name}
                      </p>
                    </div>

                    {/* Hover Details Tooltip */}
                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 p-3 glass-panel rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 scale-90 group-hover:scale-100 z-50">
                      <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">{op.name} Network</p>
                      <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                        {op.details[language]}
                      </p>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white/10" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'recipient' && (
            <motion.div 
              key="recipient"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{t.who}</h2>
                <p className="text-white/50">{t.enter}</p>
              </div>

              <div className="relative group">
                <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/40 group-focus-within:text-sky-400 transition-colors`}>
                  <span className="font-bold">+93</span>
                  <div className="w-[1px] h-4 bg-white/10" />
                </div>
                <input 
                  type="tel"
                  placeholder="7x xxx xxxx"
                  value={phoneNumber}
                  onChange={(e) => validatePhone(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl py-5 sm:py-6 ${isRTL ? 'pr-16 sm:pr-20 pl-6' : 'pl-16 sm:pl-20 pr-6'} text-xl sm:text-2xl font-mono focus:outline-none focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 transition-all`}
                  autoFocus
                />
              </div>

              {selectedOperator && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${selectedOperator.color}, ${selectedOperator.secondaryColor})` }}
                    >
                      {selectedOperator.logo}
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase font-bold tracking-wider">{t.detected}</p>
                      <p className="font-bold">{selectedOperator.name}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="text-sky-400" />
                </motion.div>
              )}

              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => setStep('hero')}
                  className="flex-1 px-6 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                >
                  {t.back}
                </button>
                <button 
                  disabled={phoneNumber.length < 9}
                  onClick={() => setStep('plan')}
                  className="flex-[2] bg-white text-black px-6 py-4 rounded-2xl font-bold hover:bg-sky-300 disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  {t.continue}
                  <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'plan' && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2">{t.select}</h2>
                <p className="text-white/50">Choose how much credit to send to +93 {phoneNumber}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {TOPUP_AMOUNTS.map((amt) => (
                  <button
                    key={amt.usd}
                    onClick={() => setSelectedAmount(amt)}
                    className={`relative p-4 sm:p-6 rounded-3xl border text-left transition-all duration-300 ${
                      selectedAmount?.usd === amt.usd 
                        ? 'bg-sky-400/10 border-sky-400 ring-4 ring-sky-400/10' 
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-4">
                      <span className="text-3xl sm:text-4xl font-black tracking-tighter">${amt.usd}</span>
                      {selectedAmount?.usd === amt.usd && <CheckCircle2 className="text-sky-400" />}
                    </div>
                    <p className="text-white/40 text-[10px] sm:text-sm font-medium uppercase tracking-widest">{t.receives}</p>
                    <p className="text-xl sm:text-2xl font-bold text-sky-400">{amt.afn} AFN</p>
                  </button>
                ))}
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => setStep('recipient')}
                  className="px-8 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                >
                  {t.back}
                </button>
                <button 
                  disabled={!selectedAmount}
                  onClick={() => setStep('personalize')}
                  className="flex-1 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-sky-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {t.personalize}
                  <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'personalize' && (
            <motion.div 
              key="personalize"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{t.personalize}</h2>
                <p className="text-white/50">Send a warm note along with the credit.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sky-400">
                    <MessageSquareQuote size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{t.ai}</span>
                  </div>
                  <button 
                    onClick={handleGenerateMessage}
                    disabled={isGeneratingMessage}
                    className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-2"
                  >
                    {isGeneratingMessage ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    {t.regenerate}
                  </button>
                </div>
                                <div className="space-y-4">
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Generating a warm message..."
                    className="w-full bg-transparent border-none resize-none h-32 focus:ring-0 text-lg leading-relaxed font-light italic"
                  />
                  {message && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-2">{t.preview}</p>
                      <div className="prose prose-invert prose-sm max-w-none text-white/70">
                        <Markdown>{message}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('plan')}
                  className="px-8 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                >
                  {t.back}
                </button>
                <button 
                  onClick={() => setStep('payment')}
                  className="flex-1 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-sky-300 transition-all flex items-center justify-center gap-2"
                >
                  {t.payment}
                  <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div 
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2">{t.secure}</h2>
                <p className="text-white/50">{t.stripe}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 glass-panel">
                <div className="flex justify-between items-center pb-6 border-bottom border-white/5">
                  <span className="text-white/40">{t.total}</span>
                  <span className="text-3xl font-black">${selectedAmount?.usd}.00</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">{t.card}</label>
                    <div className="bg-black border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <CreditCard className="text-white/20" />
                      <input 
                        type="text" 
                        placeholder="4242 4242 4242 4242" 
                        className="bg-transparent border-none focus:ring-0 w-full font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">{t.expiry}</label>
                      <input type="text" placeholder="MM/YY" className="w-full bg-black border border-white/10 rounded-xl p-4 font-mono focus:ring-0 focus:border-sky-400/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">{t.cvc}</label>
                      <input type="text" placeholder="***" className="w-full bg-black border border-white/10 rounded-xl p-4 font-mono focus:ring-0 focus:border-sky-400/50" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold mb-6">
                    <ShieldCheck size={14} />
                    PCI DSS Compliant & Encrypted
                  </div>
                  <button 
                    onClick={handlePayment}
                    className="w-full bg-sky-400 text-black py-4 rounded-2xl font-black text-lg hover:bg-sky-300 transition-all flex items-center justify-center gap-3"
                  >
                    {t.pay} ${selectedAmount?.usd}.00
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setStep('personalize')}
                className="w-full mt-6 text-white/40 hover:text-white text-sm font-bold transition-colors"
              >
                Cancel and go back
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sky-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[0_0_50px_rgba(56,189,248,0.3)]">
                <CheckCircle2 size={40} className="sm:size-[48px] text-black" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 uppercase tracking-tight">{t.success}</h2>
              <p className="text-white/60 mb-12">
                {t.delivered} <br />
                <span className="text-white font-bold">+93 {phoneNumber}</span>
              </p>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left mb-12 glass-panel">
                <div className="flex justify-between mb-4">
                  <span className="text-white/40 text-xs uppercase font-bold tracking-widest">{t.receipt}</span>
                  <span className="text-sky-400 text-xs font-mono">#TX-{Math.floor(Math.random()*1000000)}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Network</span>
                    <span className="font-bold">{selectedOperator?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Amount</span>
                    <span className="font-bold">{selectedAmount?.afn} AFN</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-3 mt-3">
                    <span className="text-white/60">Paid</span>
                    <span className="font-black text-xl">${selectedAmount?.usd}.00</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setStep('hero');
                  setPhoneNumber('');
                  setSelectedAmount(null);
                  setSelectedOperator(null);
                }}
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-sky-300 transition-all"
              >
                {t.another}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${isRTL ? 'left-0 border-r' : 'right-0 border-l'} bottom-0 w-full sm:max-w-md bg-[#0a0a0a] border-white/10 z-[70] p-6 sm:p-8 overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-8 sm:mb-12">
                <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                  <History className="text-sky-400" />
                  {t.history}
                </h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-24 text-white/20">
                  <Smartphone size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No transactions yet</p>
                  <p className="text-sm">Your top-ups will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-lg">+93 {tx.number}</p>
                          <p className="text-xs text-white/40 font-medium uppercase tracking-widest">{tx.operator}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sky-400">${tx.amountUsd}</p>
                          <p className="text-[10px] text-white/30 font-mono">{tx.id}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-[10px] text-white/30 uppercase font-bold">{tx.date}</span>
                        <span className="text-[10px] bg-sky-400/10 text-sky-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-12 p-6 rounded-3xl bg-sky-400/5 border border-sky-400/10">
                <div className="flex items-center gap-3 mb-4 text-sky-400">
                  <Info size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Support</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Most top-ups are instant. If your recipient hasn't received credit within 10 minutes, please contact our 24/7 support team.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:max-w-lg glass-panel p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] z-[110] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">{t.settings}</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Profile Section */}
                <section>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 mb-4">{t.profile}</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">{t.name}</label>
                      <input 
                        type="text" 
                        value={user?.name}
                        onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 focus:outline-none focus:border-sky-400/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">{t.email}</label>
                      <input 
                        type="email" 
                        value={user?.email}
                        onChange={(e) => setUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 focus:outline-none focus:border-sky-400/50 transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Language Section */}
                <section>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 mb-4">{t.language}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(['en', 'fa', 'ps'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`py-3 rounded-xl border font-bold transition-all ${
                          language === lang 
                            ? 'bg-sky-400 text-black border-sky-400' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {lang === 'en' ? 'English' : lang === 'fa' ? 'Dari' : 'Pashto'}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Additional Settings */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-sky-400" />
                      <span className="text-sm font-bold">{t.notifications}</span>
                    </div>
                    <div className="w-10 h-5 bg-sky-400 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-sky-400" />
                      <span className="text-sm font-bold">{t.security}</span>
                    </div>
                    <ChevronRight size={18} className="text-white/20" />
                  </div>
                </section>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => {
                      setUser(null);
                      setStep('auth');
                      setShowSettings(false);
                    }}
                    className="flex-1 py-4 rounded-2xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-colors"
                  >
                    {t.logout}
                  </button>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-[2] bg-sky-400 text-black py-4 rounded-2xl font-black hover:bg-sky-300 transition-all"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal.open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal({ type: '', open: false })}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:max-w-2xl glass-panel p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] z-[110] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">{showInfoModal.type}</h3>
                <button onClick={() => setShowInfoModal({ type: '', open: false })} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="prose prose-invert prose-sky max-w-none">
                <p className="text-white/60 leading-relaxed">
                  This is the {showInfoModal.type} section for AFGTopUp. We are committed to providing a secure and transparent mobile top-up service for the Afghan diaspora.
                </p>
                <h4 className="text-white font-bold mt-6">Key Points:</h4>
                <ul className="list-disc pl-5 space-y-2 text-white/60">
                  <li>Instant delivery to all major Afghan networks.</li>
                  <li>Secure payment processing via industry-standard providers.</li>
                  <li>Compliance with international financial regulations.</li>
                  <li>24/7 customer support for all your needs.</li>
                </ul>
                <p className="mt-8 text-white/40 text-sm italic">
                  Last updated: February 2026
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-10 h-8 bg-white rounded flex items-center justify-center font-bold text-black text-[10px]">AFG</div>
            <span className="text-sm font-bold tracking-tighter">AFGTopUp © 2026</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-white/30 uppercase tracking-widest">
            <button onClick={() => setShowInfoModal({ type: t.privacy, open: true })} className="hover:text-white transition-colors">{t.privacy}</button>
            <button onClick={() => setShowInfoModal({ type: t.terms, open: true })} className="hover:text-white transition-colors">{t.terms}</button>
            <button onClick={() => setShowInfoModal({ type: t.compliance, open: true })} className="hover:text-white transition-colors">{t.compliance}</button>
            <button onClick={() => setShowInfoModal({ type: t.help, open: true })} className="hover:text-white transition-colors">{t.help}</button>
          </div>
          <div className="flex gap-4 relative">
            <button 
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-sky-400 hover:bg-white/10 transition-all cursor-pointer"
            >
              <Globe size={18} />
            </button>
            
            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute bottom-full mb-4 ${isRTL ? 'left-0' : 'right-0'} w-32 glass-panel rounded-2xl p-2 z-50`}
                >
                  {(['en', 'fa', 'ps'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        language === lang ? 'bg-sky-400 text-black' : 'hover:bg-white/5 text-white/60'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'fa' ? 'Dari' : 'Pashto'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </footer>
    </div>
  );
}
