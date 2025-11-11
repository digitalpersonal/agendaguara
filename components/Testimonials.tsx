import React, { useState, useEffect } from 'react';
import type { Testimonial } from '../types';
import { supabase } from '../utils/supabase';

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

// Mock data as a fallback
const mockTestimonials: Testimonial[] = [
    { id: 'mock1', name: 'Ana Paula', text: 'Serviço incrível! A Juliana é uma profissional excelente e muito atenciosa. Amei o resultado!', rating: 5, imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    { id: 'mock2', name: 'Carlos Eduardo', text: 'O Dr. Ricardo me ajudou muito com minha dor nas costas. Recomendo a todos!', rating: 5, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { id: 'mock3', name: 'Mariana Lima', text: 'Levei meu cachorro para um banho e tosa e ele foi super bem tratado. O local é limpo e os profissionais são muito carinhosos.', rating: 5, imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80' },
];

export const Testimonials: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('testimonials')
                .select('id, name, text, rating, imageUrl:image_url')
                .limit(3);

            if (error) {
                console.error("Error fetching testimonials:", error.message);
                setError('Não foi possível carregar os depoimentos.');
                setTestimonials(mockTestimonials); // Fallback to mock data
            } else if (data) {
                setTestimonials(data as Testimonial[]);
            }
            setLoading(false);
        };
        fetchTestimonials();
    }, []);

    if (loading) return <div className="text-center py-16">Carregando depoimentos...</div>;
    
    const displayTestimonials = testimonials.length > 0 ? testimonials : mockTestimonials;

    return (
        <section className="py-16 bg-stone-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800">O que nossos clientes dizem</h2>
                    <p className="text-stone-500 mt-2 text-lg">Confiança e satisfação em cada agendamento.</p>
                </div>
                 {error && testimonials.length === 0 && <p className="text-center text-red-500 mb-8">{error}</p>}
                <div className="grid md:grid-cols-3 gap-8">
                    {displayTestimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-lg transform transition-transform duration-300 hover:-translate-y-2">
                            <div className="flex items-center mb-4">
                                <img src={testimonial.imageUrl} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-rose-200" />
                                <div>
                                    <h4 className="text-lg font-bold text-stone-800">{testimonial.name}</h4>
                                    <div className="flex text-amber-400">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <StarIcon key={i} className="w-5 h-5" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-stone-600 italic">"{testimonial.text}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};