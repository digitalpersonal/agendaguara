
import React from 'react';

const CalendarCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10"/><path d="m9 16 2 2 4-4"/>
    </svg>
);

const WalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
    </svg>
);

export const Hero: React.FC = () => {
    const handleScrollToSignup = () => {
        const signupButton = document.getElementById('signup-trigger-button');
        if (signupButton) {
            signupButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            signupButton.classList.add('ring-4', 'ring-rose-300');
            setTimeout(() => signupButton.classList.remove('ring-4', 'ring-rose-300'), 2000);
        }
    };

    return (
        <section 
            id="hero-section"
            className="relative py-24 md:py-32 bg-stone-900 overflow-hidden"
        >
            {/* Background Image with blur and overlay */}
            <div 
                className="absolute inset-0 opacity-30 bg-cover bg-center grayscale scale-110"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop')" }}
            ></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 text-left animate-fade-in-up">
                        <span className="inline-block bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
                            Para Profissionais de Guaranésia
                        </span>
                        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-white">
                            Sua gestão no piloto automático. <br/>
                            <span className="text-rose-500">Mais tempo para o que importa.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-stone-300 mb-8 max-w-2xl leading-relaxed">
                            A Agenda Inteligente e o Controle Financeiro que seu negócio precisa. 
                            Menos burocracia, mais lucro e total liberdade para você focar no seu trabalho.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex items-center text-white space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <div className="p-2 bg-rose-500 rounded-lg">
                                    <CalendarCheckIcon />
                                </div>
                                <div>
                                    <p className="font-bold">Agenda Inteligente</p>
                                    <p className="text-sm text-stone-400">Zero conflitos</p>
                                </div>
                            </div>
                            <div className="flex items-center text-white space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <div className="p-2 bg-rose-500 rounded-lg">
                                    <WalletIcon />
                                </div>
                                <div>
                                    <p className="font-bold">Controle Financeiro</p>
                                    <p className="text-sm text-stone-400">Fluxo completo</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <button 
                                onClick={handleScrollToSignup}
                                className="bg-rose-500 text-white font-bold py-4 px-10 rounded-full hover:bg-rose-600 transition-all duration-300 shadow-xl shadow-rose-500/20 transform hover:-translate-y-1"
                            >
                                Começar Agora
                            </button>
                            <div>
                                <p className="text-white font-bold text-2xl">R$ 149,90 <span className="text-sm text-stone-400 font-normal">/mês</span></p>
                                <p className="text-stone-500 text-xs">Sem taxas escondidas</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:w-1/2 relative animate-fade-in-right hidden lg:block">
                         <div className="bg-gradient-to-tr from-rose-500/20 to-transparent absolute -inset-4 rounded-3xl -z-10 blur-2xl"></div>
                         <img 
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop" 
                            alt="Dashboard Gestão" 
                            className="rounded-2xl shadow-2xl border border-white/10"
                         />
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-right {
                    0% { opacity: 0; transform: translateX(30px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
                .animate-fade-in-right { animation: fade-in-right 1.2s ease-out forwards; }
            `}</style>
        </section>
    );
};
