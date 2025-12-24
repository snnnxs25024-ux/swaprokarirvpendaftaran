
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

// Komponen ilustrasi SVG yang disematkan untuk performa dan styling
const LoginIllustration = () => (
    <svg viewBox="0 0 525 525" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <g opacity="0.1">
            <circle cx="262.5" cy="262.5" r="262.5" fill="url(#paint0_linear_1_2)"/>
        </g>
        <path d="M263 481C382.587 481 481 382.587 481 263C481 143.413 382.587 45 263 45C143.413 45 45 143.413 45 263C45 382.587 143.413 481 263 481Z" stroke="white" strokeOpacity="0.1" strokeWidth="2"/>
        <path d="M263 416C348.526 416 418 346.526 418 261C418 175.474 348.526 106 263 106C177.474 106 108 175.474 108 261C108 346.526 177.474 416 263 416Z" stroke="white" strokeOpacity="0.1" strokeWidth="2"/>
        <g filter="url(#filter0_d_1_2)">
        <path d="M198.5 220.575L237.98 171.744C243.606 164.73 255.394 164.73 261.02 171.744L300.5 220.575C310.292 232.748 301.789 251 286.992 251H212.008C197.211 251 188.708 232.748 198.5 220.575Z" fill="#2563EB"/>
        </g>
        <g filter="url(#filter1_d_1_2)">
        <path d="M259.943 361C274.939 361 286.443 346.941 286.443 331.944V263.856C286.443 248.859 274.939 236.8 259.943 236.8H210.557C195.561 236.8 184.057 248.859 184.057 263.856V331.944C184.057 346.941 195.561 361 210.557 361H259.943Z" fill="#3B82F6"/>
        </g>
        <g filter="url(#filter2_d_1_2)">
        <path d="M341 333.393C341 348.093 329.135 360 314.479 360H270.521C255.865 360 244 348.093 244 333.393V273.607C244 258.907 255.865 247 270.521 247H314.479C329.135 247 341 258.907 341 273.607V333.393Z" fill="white"/>
        </g>
        <defs>
        <filter id="filter0_d_1_2" x="180.52" y="157.14" width="138.96" height="119.86" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="8"/>
        <feGaussianBlur stdDeviation="8"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.145098 0 0 0 0 0.388235 0 0 0 0 0.921569 0 0 0 0.3 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
        </filter>
        <filter id="filter1_d_1_2" x="168.057" y="224.8" width="134.386" height="152.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="8"/>
        <feGaussianBlur stdDeviation="8"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.231373 0 0 0 0 0.509804 0 0 0 0 0.964706 0 0 0 0.3 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
        </filter>
        <filter id="filter2_d_1_2" x="228" y="239" width="129" height="137" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="8"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
        </filter>
        <linearGradient id="paint0_linear_1_2" x1="262.5" y1="0" x2="262.5" y2="525" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A"/>
        <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
        </defs>
    </svg>
);


export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // HARDCODED CREDENTIALS
    if (username === 'swapro' && password === '1234') {
      onLogin();
    } else {
      setError('ID Pengguna atau Kata Sandi salah!');
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative flex flex-col md:flex-row w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Sisi Kiri - Ilustrasi */}
        <div className="w-full md:w-1/2 bg-slate-900 p-8 sm:p-12 flex flex-col justify-center items-center text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-slate-900 opacity-80"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

            <div className="relative z-10 text-center">
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="inline-block mb-8">
                    <img 
                        src="https://i.imgur.com/P7t1bQy.png" 
                        alt="Logo Swapro" 
                        className="w-40 h-auto object-contain" 
                    />
                </a>
                <div className="w-full max-w-xs mx-auto mb-8">
                    <LoginIllustration />
                </div>
                <h1 className="text-3xl font-bold mb-3 tracking-tight">
                    Talent Management Portal
                </h1>
                <p className="text-slate-300 max-w-xs mx-auto">
                    Solusi terintegrasi untuk tim rekrutmen profesional.
                </p>
            </div>
        </div>

        {/* Sisi Kanan - Formulir */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center bg-gray-50">
            <div className="w-full max-w-sm mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang Kembali</h2>
                <p className="text-slate-500 mb-8">Silakan masuk untuk melanjutkan.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ID Pengguna</label>
                        <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan ID"
                        autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
                        <input 
                        type="password" 
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200 animate-shake">
                        {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 hover:-translate-y-0.5"
                    >
                        Masuk
                    </button>
                </form>

                <div className="text-center mt-8">
                    <button 
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} /> Kembali ke Beranda
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
