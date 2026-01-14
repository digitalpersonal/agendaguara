
import React from 'react';

const LogoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-rose-500">
        <path d="M8 2v4"></path>
        <path d="M16 2v4"></path>
        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
        <path d="M3 10h18"></path>
        <path d="m9 16 2 2 4-4"></path>
    </svg>
);

const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

const UserPlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
);

interface FooterProps {
    onSignUpClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSignUpClick }) => {
    return (
        <footer id="footer" className="bg-white text-stone-800">
            <div className="container mx-auto px-6 py-20 text-center border-t border-stone-100">
                <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight">Expandindo sua atuação em Guaranésia?</h2>
                <p className="text-stone-600 mt-6 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    Profissional, transforme seu atendimento com uma <span className="font-bold text-rose-600">Agenda Inteligente</span> e <span className="font-bold text-rose-600">Controle Financeiro</span> 100% completo. A solução definitiva para organizar seu tempo e lucrar mais, com um investimento incrivelmente acessível!
                </p>
                <div className="mt-12 flex flex-col items-center space-y-6">
                    {onSignUpClick && (
                        <button
                            id="signup-trigger-button"
                            onClick={onSignUpClick}
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-rose-500 text-white font-black py-5 px-12 rounded-full hover:bg-rose-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-rose-200"
                        >
                            <UserPlusIcon />
                            Quero me Cadastrar Agora
                        </button>
                    )}
                    <div className="flex flex-col items-center">
                        <span className="text-stone-400 text-sm mb-2 font-medium">Dúvidas sobre o sistema?</span>
                        <a
                            href="https://wa.me/5535991048020"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-stone-600 font-semibold py-2 px-6 rounded-full hover:text-rose-500 hover:bg-stone-50 transition-all duration-300"
                        >
                            <WhatsAppIcon />
                            Falar com o Administrador
                        </a>
                    </div>
                </div>
            </div>
            <div className="bg-stone-900 text-stone-400">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center space-x-3 text-white">
                            <LogoIcon />
                            <h3 className="text-2xl font-bold tracking-tight">AgendaGuara</h3>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-sm">
                                © {new Date().getFullYear()} AgendaGuara - Sistema de Gestão de Atendimentos | Guaranésia-MG
                            </p>
                            <div className="mt-3 space-y-1">
                                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] leading-tight">
                                    Desenvolvido por <span className="text-rose-400">Multiplus - Sistemas Inteligentes</span>
                                </p>
                                <p className="text-lg text-white font-black leading-tight">
                                    Silvio T. de Sá Filho
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
