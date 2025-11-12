import React from 'react';

const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

export const Footer: React.FC = () => {
    return (
        <footer id="footer" className="bg-white text-stone-800">
            <div className="container mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-800">É Profissional? Junte-se a Nós!</h2>
                <p className="text-stone-600 mt-4 text-lg max-w-2xl mx-auto">
                    Aumente sua visibilidade, gerencie seus agendamentos com facilidade e conquiste mais clientes. Fale conosco para saber mais sobre nossos planos e vantagens.
                </p>
                <div className="mt-8">
                    <a
                        href="https://wa.me/5535991048020"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-rose-500 text-white font-bold py-3 px-8 rounded-full hover:bg-rose-600 transition-all duration-300 transform hover:scale-105"
                    >
                        <WhatsAppIcon />
                        Saiba Mais no WhatsApp
                    </a>
                </div>
            </div>
            <div className="bg-stone-800 text-white">
                <div className="container mx-auto px-6 py-4">
                    <p className="text-center text-stone-400 text-sm">
                        © {new Date().getFullYear()} AgendaGuara | Todos os direitos reservados
                    </p>
                </div>
            </div>
        </footer>
    );
};