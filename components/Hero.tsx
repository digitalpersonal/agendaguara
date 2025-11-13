
import React from 'react';

export const Hero: React.FC = () => {
    return (
        <section 
            id="hero-section"
            className="relative py-24 md:py-40 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black/50"></div> {/* Overlay */}
            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="animate-fade-in-down">
                    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight text-white">
                        Os melhores profissionais de Guaranésia a um clique de distância!
                    </h2>
                    <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-3xl mx-auto">
                        Agende seu serviço favorito de forma fácil e rápida. Beleza, saúde e cuidado para você e seu pet em um só lugar.
                    </p>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 1s ease-out forwards;
                }
            `}</style>
        </section>
    );
};
