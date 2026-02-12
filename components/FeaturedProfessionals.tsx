
import React, { useState, useEffect, useCallback } from 'react';
import type { Professional } from '../types';
import { supabase, getInitials, getColor, withRetry } from '../utils/supabase';

interface FeaturedProfessionalsProps {
    onScheduleClick: (professional: Professional) => void;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AlertCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ProfessionalCard: React.FC<{ professional: Professional; onScheduleClick: (professional: Professional) => void }> = ({ professional, onScheduleClick }) => {
    const hasValidImage = professional.imageUrl && professional.imageUrl.startsWith('http');
    // Mapeia specialty para specialties caso venha com nome diferente do banco
    const specialties = (professional as any).specialty || professional.specialties || [];
    
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
                <div className="text-rose-500 mb-2 h-12 overflow-hidden">
                    {specialties.length > 0 ? (
                        specialties.slice(0, 2).map((s: any, i: number) => (
                            <p key={i} className="truncate">{s.name} - R$ {s.price.toFixed(2)}</p>
                        ))
                    ) : (
                        <p className="text-stone-500">Serviços sob consulta</p>
                    )}
                </div>
                <div className="flex items-center text-amber-400 mb-4">
                    <StarIcon className="w-5 h-5" />
                    <span className="text-stone-600 font-semibold ml-1">{professional.rating?.toFixed(1) || '5.0'}</span>
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
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchProfessionals = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await withRetry(async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, specialty, image_url, services, settings')
                    .eq('role', 'professional')
                    .limit(8);

                if (error) throw error;
                return data;
            });

            if (data && data.length > 0) {
                // Normaliza os nomes de campos caso necessário
                const normalized = data.map(p => ({
                    ...p,
                    imageUrl: p.image_url,
                    specialties: p.specialty
                }));
                setProfessionals(normalized as Professional[]);
            } else {
                setProfessionals([]);
            }
        } catch (err: any) {
            const msg = err.message || String(err);
            console.error("Erro ao buscar profissionais:", msg);
            if (msg.toLowerCase().includes('fetch')) {
                setErrorMsg("Não foi possível conectar ao servidor. Verifique se o projeto no Supabase não está PAUSADO (clique em 'Restore' no painel do Supabase).");
            } else {
                setErrorMsg("Houve um problema ao carregar os dados. Tente atualizar a página.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfessionals();
    }, [fetchProfessionals]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
                    <p className="text-stone-500 font-medium">Buscando especialistas...</p>
                </div>
            );
        }

        if (errorMsg) {
            return (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-amber-100 max-w-2xl mx-auto p-8">
                    <div className="inline-block p-4 bg-amber-50 rounded-full mb-4">
                        <AlertCircleIcon />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800">Conexão Interrompida</h3>
                    <p className="text-stone-500 mt-2 text-sm leading-relaxed">{errorMsg}</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                        <button 
                            onClick={fetchProfessionals}
                            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-full hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                        >
                            Tentar Novamente
                        </button>
                        <a 
                            href="https://supabase.com/dashboard" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-stone-100 text-stone-600 font-bold py-2 px-6 rounded-full hover:bg-stone-200 transition-all"
                        >
                            Abrir Painel Supabase
                        </a>
                    </div>
                </div>
            )
        }

        if (professionals.length === 0) {
             return (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-100">
                    <div className="inline-block p-4 bg-stone-100 rounded-full mb-4">
                        <UserIcon />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800">Nenhum profissional cadastrado</h3>
                    <p className="text-stone-500 mt-2">Os especialistas de Guaranésia aparecerão aqui em breve.</p>
                </div>
            );
        }
        
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {professionals.map((prof) => (
                    <ProfessionalCard key={prof.id} professional={prof} onScheduleClick={onScheduleClick} />
                ))}
            </div>
        );
    };

    return (
        <section id="professionals" className="py-16 bg-stone-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight">Especialistas Parceiros</h2>
                    <p className="text-stone-500 mt-3 text-lg">Prontos para lhe atender em Guaranésia.</p>
                </div>
                {renderContent()}
            </div>
        </section>
    );
};
