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


export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [role, setRole] = useState<'client' | 'professional'>('client');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
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
                    imageUrl: `https://i.pravatar.cc/150?u=${email}`,
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
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
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors">
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
                        <div className="mb-4">
                            <label className="block text-stone-600 mb-1" htmlFor="name">Nome Completo</label>
                            <input type="text" id="name" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                        </div>
                    )}
                     <div className="mb-4">
                        <label className="block text-stone-600 mb-1" htmlFor="email">Email</label>
                        <input type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                     <div className="mb-4">
                        <label className="block text-stone-600 mb-1" htmlFor="password">Senha</label>
                        <input type="password" id="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    
                    {activeTab === 'signup' && (
                      <div className="mb-6">
                          <label className="block text-stone-600 mb-2">Eu sou:</label>
                          <div className="flex rounded-lg border border-stone-300 p-1">
                              <button type="button" onClick={() => setRole('client')} className={`w-1/2 py-2 rounded-md transition-colors ${role === 'client' ? 'bg-rose-500 text-white' : 'text-stone-600'}`}>Cliente</button>
                              <button type="button" onClick={() => setRole('professional')} className={`w-1/2 py-2 rounded-md transition-colors ${role === 'professional' ? 'bg-rose-500 text-white' : 'text-stone-600'}`}>Profissional</button>
                          </div>
                      </div>
                    )}


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