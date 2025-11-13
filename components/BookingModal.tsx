import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Professional, Service, User, ProfessionalUser, Appointment, ProfessionalSettings } from '../types';
import { supabase } from '../utils/supabase';
import { beautyServices, healthServices, petServices } from '../constants';

interface BookingModalProps {
    professional?: Professional | null;
    category?: string | null;
    user: User | ProfessionalUser;
    onClose: () => void;
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const servicesByCategory: { [key: string]: Service[] } = {
    'Beleza': beautyServices,
    'Saúde': healthServices,
    'Pet Shop': petServices,
};

const generateTimeSlots = (date: Date, settings: ProfessionalSettings, professionalAppointments: Pick<Appointment, 'time'>[]) => {
    if (!settings?.workHours) return [];
    
    const slots = [];
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    if (!settings.workDays.includes(dayOfWeek) || settings.blockedDays.includes(dateStr)) {
        return [];
    }

    const bookedTimes = professionalAppointments.map(a => a.time.substring(0, 5));
    const blockedSlotsForDay = settings.blockedTimeSlots?.[dateStr] || [];

    const startHour = parseInt(settings.workHours.start.split(':')[0]);
    const endHour = parseInt(settings.workHours.end.split(':')[0]);
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (isToday && (h < now.getHours() || (h === now.getHours() && m < now.getMinutes()))) {
                continue;
            }
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            if (!bookedTimes.includes(time) && !blockedSlotsForDay.includes(time)) {
                slots.push(time);
            }
        }
    }
    return slots;
};

export const BookingModal: React.FC<BookingModalProps> = ({ professional, category, user, onClose }) => {
    const isServiceLedFlow = !professional;

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(professional || null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [professionalsForService, setProfessionalsForService] = useState<Professional[]>([]);
    const [loadingProfessionals, setLoadingProfessionals] = useState(false);
    
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [justSelectedTime, setJustSelectedTime] = useState<string | null>(null);

    useEffect(() => {
        if (isServiceLedFlow && selectedService) {
            const fetchProfessionals = async () => {
                setLoadingProfessionals(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, specialties:specialty, imageUrl:image_url, services, settings')
                    .eq('role', 'professional');

                if (error) {
                    console.error("Error fetching professionals for service:", error);
                    setError("Não foi possível carregar os profissionais.");
                } else if (data) {
                    const filtered = data.filter(p => p.services?.some((s: Service) => s.name === selectedService.name));
                    setProfessionalsForService(filtered as Professional[]);
                }
                setLoadingProfessionals(false);
            };
            fetchProfessionals();
        }
    }, [isServiceLedFlow, selectedService]);

    useEffect(() => {
        if (selectedProfessional?.settings && selectedDate) {
            const fetchAvailability = async () => {
                setLoadingAvailability(true);
                setSelectedTime(null);
                const dateStr = selectedDate.toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('appointments')
                    .select('time')
                    .eq('professional_id', selectedProfessional.id)
                    .eq('date', dateStr);

                if (error) {
                    console.error("Error fetching appointments for availability:", error);
                    setTimeSlots([]);
                } else {
                    const slots = generateTimeSlots(selectedDate, selectedProfessional.settings!, data || []);
                    setTimeSlots(slots);
                }
                setLoadingAvailability(false);
            };
            fetchAvailability();
        }
    }, [selectedProfessional, selectedDate]);
    
    const handleConfirmBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime || !user || !selectedProfessional) {
            setError("Por favor, preencha todos os campos.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        
        const dateStr = selectedDate.toISOString().split('T')[0];
        const { data: existingAppointment, error: checkError } = await supabase
            .from('appointments')
            .select('id')
            .eq('client_id', user.id)
            .eq('professional_id', selectedProfessional.id)
            .eq('date', dateStr)
            .eq('status', 'upcoming');

        if (checkError) {
            console.error("Error checking for existing appointment:", checkError);
            setError("Ocorreu um erro ao verificar sua agenda. Tente novamente.");
            setIsSubmitting(false);
            return;
        }
        
        if (existingAppointment && existingAppointment.length > 0) {
            setError("Você já possui um agendamento com este profissional para esta data.");
            setIsSubmitting(false);
            return;
        }

        const appointmentData = {
            client_id: user.id,
            professional_id: selectedProfessional.id,
            client_name: user.name,
            professional_name: selectedProfessional.name,
            professional_image_url: selectedProfessional.imageUrl,
            service_name: selectedService.name,
            date: dateStr,
            time: selectedTime,
            price: selectedService.price,
            status: 'upcoming' as const
        };
        const { error } = await supabase.from('appointments').insert([appointmentData]);
        if (error) {
            console.error("Error creating appointment:", error);
            setError("Não foi possível criar o agendamento. Tente novamente.");
            setIsSubmitting(false);
        } else {
            setStep(prev => prev + 1);
            setIsSubmitting(false);
        }
    };
    
    const handleNextStep = () => {
        setError(null);
        handleConfirmBooking();
    };
    const handlePrevStep = () => setStep(prev => prev - 1);

    const renderSelectService = () => {
        const services = isServiceLedFlow ? servicesByCategory[category!] : selectedProfessional?.services || [];
        const title = isServiceLedFlow ? `1. Escolha um serviço em ${category}` : "1. Escolha um serviço";
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{title}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {services.map(service => (
                        <div key={service.id} onClick={() => { setSelectedService(service); setStep(2); }} className="p-4 border rounded-lg cursor-pointer transition-all duration-200 border-stone-200 hover:bg-stone-100">
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
    };

    const renderSelectProfessional = () => (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-stone-700">2. Escolha um profissional</h3>
            {loadingProfessionals ? <p>Carregando...</p> : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {professionalsForService.length > 0 ? professionalsForService.map(prof => (
                        <div key={prof.id} onClick={() => { setSelectedProfessional(prof); setStep(3); }} className="flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 border-stone-200 hover:bg-stone-100">
                            <img src={prof.imageUrl} alt={prof.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                            <div>
                                <p className="font-semibold text-stone-800">{prof.name}</p>
                                <p className="text-sm text-stone-500">{prof.specialties?.map(s => s.name).join(', ')}</p>
                            </div>
                        </div>
                    )) : <p className="text-stone-500">Nenhum profissional oferece este serviço no momento.</p>}
                </div>
            )}
        </div>
    );
    
    const renderSelectDateTime = () => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const stepNumber = isServiceLedFlow ? 3 : 2;
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{stepNumber}. Selecione Data e Hora</h3>
                <input type="date" min={today.toISOString().split('T')[0]} value={selectedDate.toISOString().split('T')[0]} onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))} className="w-full p-2 border border-stone-300 rounded-lg mb-4" />
                {loadingAvailability ? <p>Verificando horários...</p> : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.length > 0 ? timeSlots.map(time => (
                            <button 
                                key={time} 
                                onClick={() => {
                                    setSelectedTime(time);
                                    setJustSelectedTime(time);
                                    setTimeout(() => setJustSelectedTime(null), 300);
                                }} 
                                className={`p-2 rounded-lg transition-colors duration-200 ${selectedTime === time ? 'bg-rose-500 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'} ${justSelectedTime === time ? 'animate-pop' : ''}`}
                            >
                                {time}
                            </button>
                        )) : <p className="text-stone-500 col-span-full text-center">Nenhum horário disponível para esta data.</p>}
                    </div>
                )}
            </div>
        );
    };

    const renderConfirm = () => {
        const stepNumber = isServiceLedFlow ? 4 : 3;
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{stepNumber}. Confirme seu Agendamento</h3>
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                    <div><p className="text-sm text-stone-500">Profissional</p><p className="font-semibold text-stone-800">{selectedProfessional?.name}</p></div>
                    <div><p className="text-sm text-stone-500">Serviço</p><p className="font-semibold text-stone-800">{selectedService?.name}</p></div>
                    <div><p className="text-sm text-stone-500">Data e Hora</p><p className="font-semibold text-stone-800">{selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}</p></div>
                    <div><p className="text-sm text-stone-500">Valor Total</p><p className="font-bold text-lg text-rose-600">R$ {selectedService?.price.toFixed(2)}</p></div>
                </div>
            </div>
        );
    };

    const renderSuccess = () => (
        <div className="text-center"><CheckCircleIcon /><h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Confirmado!</h3><p className="text-stone-600 mt-2">Você receberá uma confirmação por e-mail com todos os detalhes.</p><button onClick={onClose} className="mt-6 w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors duration-300">Fechar</button></div>
    );

    const steps = isServiceLedFlow 
        ? [renderSelectService, renderSelectProfessional, renderSelectDateTime, renderConfirm, renderSuccess]
        : [renderSelectService, renderSelectDateTime, renderConfirm, renderSuccess];

    const canGoNext = () => {
        if (isServiceLedFlow) {
            if (step === 3 && !selectedTime) return false;
        } else {
            if (step === 2 && !selectedTime) return false;
        }
        return true;
    };
    
    const isConfirmationStep = step === (isServiceLedFlow ? 4 : 3);
    const isSuccessStep = step === (isServiceLedFlow ? 5 : 4);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors"><XIcon /></button>
                <div className="flex-shrink-0 mb-4 text-center">
                    <h2 className="text-2xl font-bold text-stone-800">Agendar Serviço</h2>
                    {selectedProfessional && <p className="text-stone-500">com {selectedProfessional.name}</p>}
                </div>
                <div className="flex-grow overflow-y-auto mb-6 pr-2">
                    {steps[step - 1]()}
                </div>
                {!isSuccessStep && (
                    <div className="mt-auto flex-shrink-0 flex items-center justify-between pt-4 border-t">
                        <button onClick={handlePrevStep} disabled={step === 1 || isSubmitting} className="text-stone-600 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed">Voltar</button>
                        {isConfirmationStep ? (
                             <button onClick={handleNextStep} disabled={isSubmitting} className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}</button>
                        ) : (
                            <button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()} className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Avançar</button>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-pop { animation: pop 0.3s ease-out; }
            `}</style>
        </div>
    );
};