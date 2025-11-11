
import React from 'react';

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.93 2.53a2.15 2.15 0 0 1 3.24 0l.13.13L14 3.4l.7.13.18.05a2.15 2.15 0 0 1 2.5 2.5l.06.18.13.7.74.74.13.13a2.15 2.15 0 0 1 0 3.24l-.13.13-.74.74-.13.7-.05.18a2.15 2.15 0 0 1-2.5 2.5l-.18.06-.7.13-.74.74-.13.13a2.15 2.15 0 0 1-3.24 0l-.13-.13-.7-.74-.18-.05a2.15 2.15 0 0 1-2.5-2.5l-.06-.18-.13-.7-.74-.74-.13-.13a2.15 2.15 0 0 1 0-3.24l.13-.13.74-.74.13-.7.05-.18a2.15 2.15 0 0 1 2.5-2.5l.18-.06.7-.13.74-.74.13-.13Z"></path><path d="M12 8.5v7"></path><path d="M8.5 12h7"></path></svg>
);

const HeartPulseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M3.22 12H9.5l.7-1 2.1 4.4 2.1-4.4.7 1h6.28"></path></svg>
);

const DogIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.2a2 2 0 0 1 2-2.2h.4a2 2 0 0 1 2 2.2v.3a2 2 0 0 1-2 2.2h-.4a2 2 0 0 1-2-2.2v-.3Z"></path><path d="M9.5 14.5A2.5 2.5 0 0 1 7 12V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3a2.5 2.5 0 0 1-2.5 2.5h-3Z"></path><path d="M11 14v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3"></path><path d="M10 14h.01"></path><path d="M14 14h.01"></path><path d="M7 17v-2.3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2V17"></path><path d="M5 14a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"></path><path d="M19 14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1"></path></svg>
);

const categories = [
    { name: 'Beleza', description: 'Cuidados pessoais para realçar sua beleza natural.', Icon: SparklesIcon },
    { name: 'Saúde', description: 'Serviços voltados para o seu bem-estar físico e mental.', Icon: HeartPulseIcon },
    { name: 'Pet Shop', description: 'Todo o carinho e cuidado que seu melhor amigo merece.', Icon: DogIcon },
];

export const ServiceCategories: React.FC = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Nossos Serviços</h2>
                    <p className="text-stone-500 mt-2 text-lg">Encontre o serviço perfeito para você e seu pet.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {categories.map((category) => (
                        <div key={category.name} className="bg-stone-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                            <div className="inline-block p-4 bg-rose-100 text-rose-500 rounded-full mb-4">
                                <category.Icon />
                            </div>
                            <h3 className="text-2xl font-semibold text-stone-800 mb-2">{category.name}</h3>
                            <p className="text-stone-500">{category.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
