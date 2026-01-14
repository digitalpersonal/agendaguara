
import React, { useEffect, useState } from 'react';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Previne o mini-infobar padrão do Chrome
            e.preventDefault();
            // Guarda o evento para ser disparado depois
            setDeferredPrompt(e);
            
            // Verifica se o usuário já dispensou o aviso recentemente
            const dismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!dismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Mostra o prompt nativo
        deferredPrompt.prompt();

        // Espera a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Salva no localStorage para não mostrar novamente nesta sessão/período
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60] animate-slide-up">
            <div className="bg-white rounded-xl shadow-2xl border border-stone-100 p-4 flex items-start gap-4">
                <div className="bg-stone-100 p-3 rounded-full text-stone-600">
                    <DownloadIcon />
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-stone-800 text-sm">Instalar App AgendaGuara</h4>
                        <button 
                            onClick={handleDismiss}
                            className="text-stone-400 hover:text-stone-600 -mt-1 -mr-1 p-1"
                            aria-label="Fechar"
                        >
                            <XIcon />
                        </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 mb-3 leading-relaxed">
                        Instale nosso aplicativo para acesso rápido na tela inicial e melhor experiência, inclusive offline.
                    </p>
                    <button 
                        onClick={handleInstallClick}
                        className="w-full bg-rose-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100"
                    >
                        Adicionar à Tela Inicial
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
};
