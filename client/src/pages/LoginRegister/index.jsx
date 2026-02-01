import React from 'react';
import { ArrowRight, AlertCircle, Mail, Lock } from 'lucide-react';
import logo from '../../assets/logo_chintana_fenix.png';
import { useLoginRegister } from './LoginRegisterLogic';
import './LoginRegister.css';

const LoginRegisterView = ({ onLoginSuccess }) => {
  const {
    formData,
    error,
    loading,
    setFormData,
    handleLogin
  } = useLoginRegister(onLoginSuccess);

  return (
    <div className="flex min-h-screen w-full font-sans bg-[#0d2b54] relative overflow-hidden md:overflow-auto">

      {/* BACKGROUND PATTERN (Visible on Mobile & Desktop Left) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='topo' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 100 C 20 0 50 0 100 100 Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M0 0 C 50 100 80 100 100 0 Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23topo)' /%3E%3C/svg%3E")`,
            backgroundSize: '400px 400px'
          }}>
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 40%, white 40.5%, transparent 41%, transparent 70%, white 70.5%, transparent 71%)`,
            backgroundSize: '150% 150%'
          }}>
        </div>
      </div>

      {/* LEFT PANEL - Brand Content (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 relative z-10 flex-col items-center justify-center p-12 text-white">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-56 h-auto mb-4 animate-in zoom-in duration-500">
            <img src={logo} alt="La Chintana Logo" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>

          <div className="space-y-2 uppercase tracking-widest">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white">
              La Chintana Fenix
            </h1>
            <p className="text-sm lg:text-base font-semibold text-blue-200 tracking-[0.2em]">
              Portale Operativo Volontari
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10 md:bg-[#fdfbf7]">

        {/* The Card */}
        <div className="w-full max-w-[360px] md:max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] p-8 md:p-12 animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-500 relative mt-16 md:mt-0">

          {/* Mobile Header - Logo OVERLAPPING card top */}
          <div className="md:hidden flex flex-col items-center mb-6 text-center absolute -top-16 left-1/2 -translate-x-1/2 w-full">
            <div className="w-32 h-32 mb-4 drop-shadow-xl animate-in zoom-in duration-300">
              <img src={logo} alt="La Chintana" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Mobile Title - Pushed down to clear the logo overlap */}
          <div className="md:hidden text-center mb-8 mt-12 space-y-1">
            <h1 className="text-3xl font-extrabold text-[#0d2b54] tracking-tighter leading-tight">
              LA CHINTANA FENIX
            </h1>
            <p className="text-[0.7rem] font-bold text-blue-900/50 tracking-[0.2em] uppercase">
              Portale Operativo Volontari
            </p>
          </div>

          {/* Desktop-only greeting */}
          <div className="hidden md:block mb-10">
            <h2 className="text-3xl font-bold text-[#0d2b54] mb-2">Benvenuto</h2>
            <p className="text-slate-500">Accedi al portale operativo.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">

            {/* Input Group: Email */}
            <div className="relative group">
              <div className="absolute top-0 inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0d2b54] transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                placeholder=" "
                className="peer block w-full rounded-full border border-slate-300 bg-white py-4 pl-12 pr-6 text-slate-800 focus:border-[#0d2b54] focus:ring-1 focus:ring-[#0d2b54] transition-all outline-none"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <label className="absolute -top-2.5 left-6 bg-white px-2 text-sm font-medium text-slate-500 transition-all 
                                 peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-400
                                 peer-focus:-top-2.5 peer-focus:left-6 peer-focus:bg-white peer-focus:text-[#0d2b54] peer-focus:text-xs">
                Email
              </label>
            </div>

            {/* Input Group: Password */}
            <div className="relative group">
              <div className="absolute top-0 inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0d2b54] transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                placeholder=" "
                className="peer block w-full rounded-full border border-slate-300 bg-white py-4 pl-12 pr-6 text-slate-800 focus:border-[#0d2b54] focus:ring-1 focus:ring-[#0d2b54] transition-all outline-none"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <label className="absolute -top-2.5 left-6 bg-white px-2 text-sm font-medium text-slate-500 transition-all 
                                 peer-placeholder-shown:top-4 peer-placeholder-shown:left-12 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-400
                                 peer-focus:-top-2.5 peer-focus:left-6 peer-focus:bg-white peer-focus:text-[#0d2b54] peer-focus:text-xs">
                Password
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm justify-center">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffde03] hover:bg-[#ffe63b] text-black font-extrabold text-lg rounded-full py-4 px-6 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/10 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>ENTRA NEL PORTALE</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default LoginRegisterView;