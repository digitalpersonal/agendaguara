
import React, { useState, useEffect } from 'react';
import type { Testimonial } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

export const Testimonials: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('id, name, text, rating, imageUrl:image_url')
                .limit(3);

            if (error || !data) {
                setTestimonials([]);
            } else {
                setTestimonials(data as Testimonial[]);
            }
        } catch (err: any) {
            setTestimonials([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    if (!loading && testimonials.length === 0) {
        return null; // Oculta a seção se não houver depoimentos reais
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-12">
                     <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-stone-200 h-12 w-12"></div>
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-stone-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => {
                    const hasValidImage = testimonial.imageUrl && testimonial.imageUrl.startsWith('http');
                    return (
                        <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-lg transform transition-transform duration-300 hover:-translate-y-2 border border-stone-50">
                            <div className="flex items-center mb-6">
                                {hasValidImage ? (
                                    <img src={testimonial.imageUrl} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-rose-200" />
                                ) : (
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${getColor(testimonial.name)} mr-4 border-2 border-rose-200`}>
                                        <span className="text-xl">{getInitials(testimonial.name)}</span>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-lg font-bold text-stone-800">{testimonial.name}</h4>
                                    <div className="flex text-amber-400">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <StarIcon key={i} className="w-4 h-4" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-stone-600 italic leading-relaxed">"{testimonial.text}"</p>
                        </div>
                    );
                })}
            </div>
        );
    };
    
    return (
        <section className="py-20 bg-stone-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">Avaliações</h2>
                    <p className="text-stone-500 mt-4 text-lg">Feedback de clientes reais.</p>
                </div>
                {renderContent()}
            </div>
        </section>
    );
};
