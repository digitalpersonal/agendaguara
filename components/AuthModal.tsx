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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.673.12 2.458.342M10.125 10.125a3 3 0 114.242 4.242M10.125 10.125L13.875 13.875M3.828 4.828l16.344 16.344" />
    </svg>
);


export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [role] = useState<'client' | 'professional'>('client');
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
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setError(error.message);
        } else {
            onClose();
        }
        setLoading(false);
    };

    const handleSignup = async () => {
        setLoading(true);
        setError(null);
        // The database trigger 'on_auth_user_created' will handle creating the profile.
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                    role: role,
                    whatsapp: whatsapp,
                    imageUrl: `https://i.pravatar.cc/150?u=${email}`,
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            alert('Cadastro realizado com sucesso!');
            onClose();
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors">
                    <XIcon />
                </button>
                
                <div className="flex border-b mb-6">
                    <button 
                        onClick={() => setActiveTab('login')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'login' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-stone-500'}`}
                    >
                        Login
                    </button>
                     <button 
                        onClick={() => setActiveTab('signup')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'signup' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-stone-500'}`}
                    >
                        Cadastre-se
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    {activeTab === 'signup' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-stone-600 mb-1" htmlFor="name">Nome Completo</label>
                                <input type="text" id="name" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                            </div>
                             <div className="mb-4">
                                <label className="block text-stone-600 mb-1" htmlFor="whatsapp">WhatsApp (Opcional)</label>
                                <input type="tel" id="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                            </div>
                        </>
                    )}
                     <div className="mb-4">
                        <label className="block text-stone-600 mb-1" htmlFor="email">Email</label>
                        <input type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                     <div className="mb-6">
                        <label className="block text-stone-600 mb-1" htmlFor="password">Senha</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} id="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors duration-300 disabled:bg-rose-300">
                        {loading ? 'Processando...' : (activeTab === 'login' ? 'Entrar' : 'Criar Conta')}
                    </button>
                </form>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};