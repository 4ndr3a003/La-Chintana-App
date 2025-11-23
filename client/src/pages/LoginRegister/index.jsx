import React from 'react';
import { ROLES } from '../../utils/constants';
import { CheckCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo_chintanta.png';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useLoginRegister } from './LoginRegisterLogic';

const LoginRegisterView = ({ onLoginSuccess }) => {
  const {
    mode,
    formData,
    error,
    loading,
    setMode,
    setFormData,
    handleLogin,
    handleRegister,
    quickLogin
  } = useLoginRegister(onLoginSuccess);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="mb-8 text-center">
        <img src={logo} alt="Logo" className="h-32 w-auto mx-auto mb-6" />
        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">LA CHINTANA</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Portale Operativo Volontari</p>
      </div>

      <Card className="w-full max-w-md relative overflow-hidden" noPadding>
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setMode('login')} 
            className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            Accedi
          </button>
          <button 
            onClick={() => setMode('register')} 
            className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'register' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            Registrati
          </button>
        </div>

        <div className="p-8">
          {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg mb-4 flex items-center gap-2"><CheckCircle size={14}/> {error}</div>}
          
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Mario Rossi"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="esempio@email.it"
                  className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4 justify-center" disabled={loading}>
              {loading ? 'Elaborazione...' : (mode === 'login' ? 'Entra nel Portale' : 'Crea Account')} <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400 mb-3">Accesso Rapido (Demo)</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => quickLogin(ROLES.PRESIDENT)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100">Presidente</button>
              <button onClick={() => quickLogin(ROLES.BOARD)} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100">Direttivo</button>
              <button onClick={() => quickLogin(ROLES.VOLUNTEER)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100">Volontario</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginRegisterView;