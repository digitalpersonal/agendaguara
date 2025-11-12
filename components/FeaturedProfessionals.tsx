import React, { useState, useEffect } from 'react';
import type { Professional } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';

interface FeaturedProfessionalsProps {
    onScheduleClick: (professional: Professional) => void;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

const ProfessionalCard: React.FC<{ professional: Professional; onScheduleClick: (professional: Professional) => void }> = ({ professional, onScheduleClick }) => {
    const hasValidImage = professional.imageUrl && professional.imageUrl.startsWith('http');
    
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
            {hasValidImage ? (
                <img className="w-full h-56 object-cover" src={professional.imageUrl} alt={professional.name} />
            ) : (
                <div className={`w-full h-56 flex items-center justify-center text-white font-bold ${getColor(professional.name)}`}>
                    <span className="text-5xl">{getInitials(professional.name)}</span>
                </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-stone-800">{professional.name}</h3>
                <p className="text-rose-500 mb-2">{professional.specialty}</p>
                <div className="flex items-center text-amber-400 mb-4">
                    <StarIcon className="w-5 h-5" />
                    <span className="text-stone-600 font-semibold ml-1">{professional.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="mt-auto">
                    <button 
                        onClick={() => onScheduleClick(professional)}
                        className="w-full bg-stone-800 text-white font-semibold py-2 px-4 rounded-full hover:bg-rose-500 transition-colors duration-300"
                    >
                        Agendar
                    </button>
                </div>
            </div>
        </div>
    );
};


export const FeaturedProfessionals: React.FC<FeaturedProfessionalsProps> = ({ onScheduleClick }) => {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfessionals = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, specialty, imageUrl:image_url, services, settings')
                .eq('role', 'professional')
                .limit(4);

            if (error) {
                console.error("Error fetching professionals:", error.message);
                setError('Não foi possível carregar os profissionais.');
            } else if (data) {
                setProfessionals(data as Professional[]);
            }
            setLoading(false);
        };

        fetchProfessionals();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <div className="text-center"><p>Carregando profissionais...</p></div>;
        }
        if (error) {
            return <div className="text-center text-red-500">{error}</div>;
        }
        if (professionals.length > 0) {
            return (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {professionals.map((prof) => (
                        <ProfessionalCard key={prof.id} professional={prof} onScheduleClick={onScheduleClick} />
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center">
                <p className="text-stone-500">Nenhum profissional em destaque no momento.</p>
            </div>
        );
    };

    return (
        <section id="professionals" className="py-16 bg-stone-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Profissionais em Destaque</h2>
                    <p className="text-stone-500 mt-2 text-lg">Especialistas prontos para cuidar de você.</p>
                </div>
                {renderContent()}
            </div>
        </section>
    );
};