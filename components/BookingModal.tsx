import React, { useState, useMemo } from 'react';
import type { Professional, Service, User, ProfessionalUser } from '../types';
import { supabase } from '../utils/supabase';

interface BookingModalProps {
    professional: Professional;
    user: User | ProfessionalUser;
    onClose: () => void;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CheckCircleIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const BookingModal: React.FC<BookingModalProps> = ({ professional, user, onClose }) => {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const timeSlots = useMemo(() => {
        return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    }, []);

    const handleConfirmBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime || !user) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const appointmentData = {
            client_id: user.id,
            professional_id: professional.id,
            client_name: user.name,
            professional_name: professional.name,
            professional_image_url: professional.imageUrl,
            service_name: selectedService.name,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            price: selectedService.price,
            status: 'upcoming'
        };

        const { error } = await supabase.from('appointments').insert([appointmentData]);

        if (error) {
            console.error("Error creating appointment:", error);
            setError("Não foi possível criar o agendamento. Tente novamente.");
            setIsSubmitting(false);
        } else {
            setStep(prev => prev + 1); // Move to success screen
            setIsSubmitting(false);
        }
    };
    
    const handleNextStep = () => {
        setError(null);
        if (step === 3) {
            handleConfirmBooking();
        } else {
            setStep(prev => prev + 1);
        }
    };
    const handlePrevStep = () => setStep(prev => prev - 1);

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-stone-700">1. Escolha um serviço</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {professional.services.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedService?.id === service.id ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200' : 'border-stone-200 hover:bg-stone-100'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-stone-800">{service.name}</span>
                                        <span className="text-stone-600">R$ {service.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-stone-500">{service.duration} minutos</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                const today = new Date();
                today.setHours(0,0,0,0);
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-stone-700">2. Selecione Data e Hora</h3>
                         <input
                            type="date"
                            min={today.toISOString().split('T')[0]}
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                            className="w-full p-2 border border-stone-300 rounded-lg mb-4"
                        />
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`p-2 rounded-lg transition-colors duration-200 ${selectedTime === time ? 'bg-rose-500 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-stone-700">3. Confirme seu Agendamento</h3>
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                            <div>
                                <p className="text-sm text-stone-500">Profissional</p>
                                <p className="font-semibold text-stone-800">{professional.name}</p>
                            </div>
                             <div>
                                <p className="text-sm text-stone-500">Serviço</p>
                                <p className="font-semibold text-stone-800">{selectedService?.name}</p>
                            </div>
                             <div>
                                <p className="text-sm text-stone-500">Data e Hora</p>
                                <p className="font-semibold text-stone-800">{selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}</p>
                            </div>
                             <div>
                                <p className="text-sm text-stone-500">Valor Total</p>
                                <p className="font-bold text-lg text-rose-600">R$ {selectedService?.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                 return (
                    <div className="text-center">
                        <CheckCircleIcon />
                        <h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Confirmado!</h3>
                        <p className="text-stone-600 mt-2">Você receberá uma confirmação por e-mail com todos os detalhes. Mal podemos esperar para te ver!</p>
                         <button onClick={onClose} className="mt-6 w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors duration-300">
                            Fechar
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors">
                    <XIcon />
                </button>
                <div className="flex-shrink-0 mb-4">
                    <h2 className="text-2xl font-bold text-center text-stone-800">Agendar com {professional.name}</h2>
                    <p className="text-center text-stone-500">{professional.specialty}</p>
                </div>

                <div className="flex-grow overflow-y-auto mb-6">
                    {renderStep()}
                </div>

                {step < 4 && (
                    <div className="mt-auto flex-shrink-0 flex items-center justify-between pt-4 border-t">
                        <button
                            onClick={handlePrevStep}
                            disabled={step === 1 || isSubmitting}
                            className="text-stone-600 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handleNextStep}
                            disabled={(step === 1 && !selectedService) || (step === 2 && !selectedTime) || isSubmitting}
                            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Confirmando...' : (step === 3 ? 'Confirmar Agendamento' : 'Avançar')}
                        </button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};