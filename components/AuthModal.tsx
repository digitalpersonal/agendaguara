
import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface AuthModalProps {
    onClose: () => void;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274 4.057-5.064-7 9.542-7 .847 0 1.673.12 2.458.342M10.125 10.125a3 3 0 114.242 4.242M10.125 10.125L13.875 13.875M3.828 4.828l16.344 16.344" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [role, setRole] = useState<'client' | 'professional'>('client');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message === 'Failed to fetch' 
                    ? "Erro de conexão. Verifique se o projeto Supabase está ativo." 
                    : "Email ou senha incorretos.");
            } else {
                onClose();
            }
        } catch (e: any) {
            setError("Falha na conexão. Verifique seu acesso à internet.");
        }
        setLoading(false);
    };

    const handleSignup = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: {
                        name: name.trim(),
                        role: role,
                        whatsapp: whatsapp.trim(),
                        image_url: `https://i.pravatar.cc/150?u=${email}`,
                        specialty: [],
                        services: [],
                        settings: {
                            workHours: { start: '09:00', end: '18:00' },
                            workDays: [1, 2, 3, 4, 5],
                            blockedDays: [],
                            blockedTimeSlots: {},
                        }
                    },
                },
            });

            if (error) {
                if (error.message === 'Failed to fetch') {
                    setError("Erro de conexão com o servidor. Verifique se o projeto Supabase não está pausado no dashboard.");
                } else {
                    setError(error.message);
                }
            } else {
                alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta (se habilitado) ou faça login agora.');
                setActiveTab('login');
            }
        } catch (e: any) {
            setError("Falha crítica ao realizar cadastro. Tente novamente mais tarde.");
        }
        setLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (activeTab === 'login') {
            handleLogin();
        } else {
            handleSignup();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors">
                    <XIcon />
                </button>
                
                <div className="flex border-b mb-6">
                    <button 
                        onClick={() => setActiveTab('login')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'login' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-stone-500'}`}
                    >
                        Entrar
                    </button>
                     <button 
                        onClick={() => setActiveTab('signup')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'signup' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-stone-500'}`}
                    >
                        Criar Conta
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 text-center font-medium border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {activeTab === 'signup' && (
                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Você é um...</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRole('client')}
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${role === 'client' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-stone-50 border-stone-100 text-stone-500'}`}
                                >
                                    Cliente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('professional')}
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${role === 'professional' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-stone-50 border-stone-100 text-stone-500'}`}
                                >
                                    Profissional
                                </button>
                            </div>
                            
                            {role === 'professional' && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start animate-fade-in-down">
                                    <InfoIcon />
                                    <p className="text-[11px] text-amber-800 leading-tight">
                                        Após o cadastro, você terá acesso à sua <span className="font-bold underline">área de gestão</span> para cadastrar seus serviços, horários e personalizar seu perfil completo.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'signup' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-stone-600 mb-1 text-sm font-medium" htmlFor="name">Nome Completo</label>
                                <input type="text" id="name" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm" />
                            </div>
                             <div className="mb-4">
                                <label className="block text-stone-600 mb-1 text-sm font-medium" htmlFor="whatsapp">WhatsApp</label>
                                <input type="tel" id="whatsapp" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm" />
                            </div>
                        </>
                    )}
                     <div className="mb-4">
                        <label className="block text-stone-600 mb-1 text-sm font-medium" htmlFor="email">E-mail</label>
                        <input type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm" />
                    </div>
                     <div className="mb-6">
                        <label className="block text-stone-600 mb-1 text-sm font-medium" htmlFor="password">Senha</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} id="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white font-black py-4 px-4 rounded-xl hover:bg-rose-600 transition-colors duration-300 shadow-lg shadow-rose-100 disabled:bg-stone-300 disabled:shadow-none">
                        {loading ? 'Aguarde...' : (activeTab === 'login' ? 'ENTRAR' : 'CRIAR MINHA CONTA')}
                    </button>
                </form>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
