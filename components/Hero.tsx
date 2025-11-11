
import React from 'react';

export const Hero: React.FC = () => {
    return (
        <section 
            id="hero-section"
            className="relative bg-stone-50 py-24 md:py-40 overflow-hidden" 
        >
            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="animate-fade-in-down">
                    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight text-stone-800">
                        Seu bem-estar a um clique de distância.
                    </h2>
                    <p className="text-lg md:text-xl text-stone-600 mb-8 max-w-3xl mx-auto">
                        Agende seu serviço favorito de forma fácil e rápida. Beleza, saúde e cuidado para você e seu pet em um só lugar.
                    </p>
                </div>
            </div>
            <style>{`
                #hero-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: url('https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1600&q=80');
                    background-size: cover;
                    background-position: center;
                    opacity: 0.5;
                    z-index: 0;
                }
                
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
