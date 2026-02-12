
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Professional, Service, User, ProfessionalUser, Appointment, ProfessionalSettings } from '../types';
import { supabase, withRetry } from '../utils/supabase';

interface BookingModalProps {
    professional?: Professional | null;
    category?: string | null;
    user: User | ProfessionalUser;
    onClose: () => void;
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

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
    const initialStep = professional ? 2 : 1;
    const [step, setStep] = useState(initialStep);
    
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(professional || null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    
    const [professionalsList, setProfessionalsList] = useState<Professional[]>([]);
    const [loadingProfessionals, setLoadingProfessionals] = useState(false);
    
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [justSelectedTime, setJustSelectedTime] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfessionals = useCallback(async () => {
        if (professional) return;
        setLoadingProfessionals(true);
        setError(null);
        try {
            const data = await withRetry(async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, specialty, image_url, cover_image_url, services, settings, bio')
                    .eq('role', 'professional');
                if (error) throw error;
                return data;
            });
            if (data) {
                const normalized = data.map(p => ({
                    ...p,
                    imageUrl: p.image_url,
                    coverImageUrl: p.cover_image_url,
                    specialties: p.specialty
                }));
                setProfessionalsList(normalized as Professional[]);
            }
        } catch (err: any) {
            console.error("Error fetching professionals in modal:", err);
            setError(err.message?.toLowerCase().includes('fetch') 
                ? "Erro de conexão. Verifique se o banco de dados está ativo." 
                : "Não foi possível carregar os profissionais.");
        } finally {
            setLoadingProfessionals(false);
        }
    }, [professional]);

    useEffect(() => {
        fetchProfessionals();
    }, [fetchProfessionals]);

    useEffect(() => {
        if (selectedProfessional?.settings && selectedDate) {
            const fetchAvailability = async () => {
                setLoadingAvailability(true);
                setSelectedTime(null);
                const dateStr = selectedDate.toISOString().split('T')[0];
                try {
                    const data = await withRetry(async () => {
                        const { data, error } = await supabase
                            .from('appointments')
                            .select('time')
                            .eq('professional_id', selectedProfessional.id)
                            .eq('date', dateStr);
                        if (error) throw error;
                        return data;
                    });
                    const slots = generateTimeSlots(selectedDate, selectedProfessional.settings!, data || []);
                    setTimeSlots(slots);
                } catch (err: any) {
                    console.error("Error fetching availability:", err);
                    setTimeSlots([]);
                } finally {
                    setLoadingAvailability(false);
                }
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
        
        try {
            // Check for collisions
            const { data: existingAppointment, error: checkError } = await supabase
                .from('appointments')
                .select('id')
                .eq('client_id', user.id)
                .eq('professional_id', selectedProfessional.id)
                .eq('date', dateStr)
                .eq('status', 'upcoming');

            if (checkError) throw checkError;
            
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
                notes: notes.trim(),
                status: 'upcoming' as const
            };
            
            const { error: insertError } = await supabase.from('appointments').insert([appointmentData]);
            if (insertError) throw insertError;

            setStep(5); // Success Step
        } catch (err: any) {
            console.error("Error creating appointment:", err);
            setError("Não foi possível criar o agendamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleNextStep = () => {
        setError(null);
        handleConfirmBooking();
    };
    const handlePrevStep = () => setStep(prev => prev - 1);

    const renderSelectProfessional = () => {
        const title = category ? `1. Profissionais` : "1. Escolha um profissional";
        const subtitle = category ? `Especialistas em ${category}` : "Todos os especialistas";

        return (
            <div>
                <h3 className="text-xl font-semibold text-stone-700">{title}</h3>
                <p className="text-sm text-stone-500 mb-4">{subtitle}</p>
                {loadingProfessionals ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-2"></div>
                        <span className="text-xs text-stone-400">Consultando base...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-6 bg-red-50 rounded-lg p-4">
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                        <button onClick={fetchProfessionals} className="text-xs font-bold bg-white border border-red-200 px-3 py-1 rounded-full text-red-600">Tentar Novamente</button>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {professionalsList.length > 0 ? professionalsList.map(prof => (
                            <div key={prof.id} onClick={() => { setSelectedProfessional(prof); setStep(2); }} className="flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 border-stone-200 hover:bg-stone-50 group hover:border-rose-200">
                                <img src={prof.imageUrl} alt={prof.name} className="w-12 h-12 rounded-full object-cover mr-4 border border-stone-200" />
                                <div>
                                    <p className="font-semibold text-stone-800 group-hover:text-rose-600 transition-colors">{prof.name}</p>
                                    <p className="text-xs text-stone-500">{(prof as any).specialties?.map((s: any) => s.name).join(', ')}</p>
                                </div>
                            </div>
                        )) : <p className="text-stone-500 text-center py-4">Nenhum profissional disponível no momento.</p>}
                    </div>
                )}
            </div>
        );
    };

    const renderSelectService = () => {
        if (!selectedProfessional) return null;
        
        return (
            <div>
                 <div className="mb-6 -mx-6 -mt-6">
                    <div className="h-28 bg-stone-100 relative">
                        {selectedProfessional.coverImageUrl ? (
                            <img src={selectedProfessional.coverImageUrl} className="w-full h-full object-cover opacity-90" alt="Capa" />
                        ) : (
                            <div className="w-full h-full bg-stone-200"></div>
                        )}
                        <div className="absolute -bottom-10 left-6">
                            <img src={selectedProfessional.imageUrl} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover" alt={selectedProfessional.name} />
                        </div>
                    </div>
                    <div className="pt-12 px-6">
                        <h4 className="text-xl font-bold text-stone-800">{selectedProfessional.name}</h4>
                        <p className="text-sm text-stone-500">{(selectedProfessional as any).specialties?.map((s: any) => s.name).join(' • ')}</p>
                    </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-stone-700">Selecione o Serviço</h3>
                {selectedProfessional.services && selectedProfessional.services.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {selectedProfessional.services.map(service => (
                            <div key={service.id} onClick={() => { setSelectedService(service); setStep(3); }} className="p-4 border rounded-lg cursor-pointer transition-all duration-200 border-stone-200 hover:bg-stone-50 hover:border-rose-200 group">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-stone-800 group-hover:text-rose-600">{service.name}</span>
                                    <span className="text-stone-600 font-bold">R$ {service.price.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-stone-400 mt-1">{service.duration} minutos</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-stone-50 rounded-lg">
                        <p className="text-stone-500">Este profissional ainda não cadastrou serviços.</p>
                    </div>
                )}
            </div>
        );
    };
    
    const renderSelectDateTime = () => {
        const today = new Date();
        today.setHours(0,0,0,0);
        return (
            <div>
                <h3 className="text-lg font-semibold mb-4 text-stone-700">Data e Horário</h3>
                <div className="bg-stone-50 p-4 rounded-xl mb-4">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-1">Serviço Selecionado</p>
                    <p className="font-bold text-stone-800">{selectedService?.name}</p>
                    <p className="text-sm text-stone-600">Duração: {selectedService?.duration} min</p>
                </div>

                <label className="block text-sm font-bold text-stone-600 mb-2">Selecione o Dia</label>
                <input 
                    type="date" 
                    min={today.toISOString().split('T')[0]} 
                    value={selectedDate.toISOString().split('T')[0]} 
                    onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))} 
                    className="w-full p-3 border border-stone-300 rounded-lg mb-6 focus:ring-2 focus:ring-rose-200 focus:outline-none" 
                />
                
                <label className="block text-sm font-bold text-stone-600 mb-2">Horários Disponíveis</label>
                {loadingAvailability ? (
                    <div className="flex items-center gap-2 text-stone-500 text-sm"><div className="animate-spin h-4 w-4 border-2 border-rose-500 rounded-full border-t-transparent"></div> Buscando...</div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                        {timeSlots.length > 0 ? timeSlots.map(time => (
                            <button 
                                key={time} 
                                onClick={() => {
                                    setSelectedTime(time);
                                    setJustSelectedTime(time);
                                    setTimeout(() => setJustSelectedTime(null), 300);
                                }} 
                                className={`p-2 rounded-lg transition-all duration-200 text-sm font-bold ${selectedTime === time ? 'bg-rose-500 text-white shadow-md' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'} ${justSelectedTime === time ? 'scale-95' : ''}`}
                            >
                                {time}
                            </button>
                        )) : <p className="text-stone-500 col-span-full text-center text-sm py-2 italic bg-stone-50 rounded-lg">Sem horários nesta data.</p>}
                    </div>
                )}
            </div>
        );
    };

    const renderConfirm = () => {
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-stone-700">Confirmação</h3>
                {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-100">{error}</p>}
                
                <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between border-b border-stone-100 pb-2">
                        <span className="text-stone-500 text-sm">Profissional</span>
                        <span className="font-semibold text-stone-800">{selectedProfessional?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-100 pb-2">
                        <span className="text-stone-500 text-sm">Serviço</span>
                        <span className="font-semibold text-stone-800">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-100 pb-2">
                        <span className="text-stone-500 text-sm">Data</span>
                        <span className="font-semibold text-stone-800">{selectedDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-100 pb-2">
                        <span className="text-stone-500 text-sm">Horário</span>
                        <span className="font-semibold text-stone-800">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="text-stone-800 font-bold">Total</span>
                        <span className="font-black text-lg text-rose-600">R$ {selectedService?.price.toFixed(2)}</span>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-2">Observações (Opcional)</label>
                    <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="Alguma preferência especial?"
                        className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-200 focus:outline-none"
                        rows={3}
                    />
                </div>
            </div>
        );
    };

    const renderSuccess = () => (
        <div className="text-center py-8">
            <CheckCircleIcon />
            <h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Confirmado!</h3>
            <p className="text-stone-600 mt-2 max-w-xs mx-auto">Seu horário foi reservado com sucesso. Você pode ver os detalhes no seu painel.</p>
            <button onClick={onClose} className="mt-8 w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-rose-600 transition-colors duration-300 shadow-lg shadow-rose-200">Voltar para o Início</button>
        </div>
    );

    const renderCurrentStep = () => {
        if (step === 1) return renderSelectProfessional();
        if (step === 2) return renderSelectService();
        if (step === 3) return renderSelectDateTime();
        if (step === 4) return renderConfirm();
        if (step === 5) return renderSuccess();
        return null;
    };

    const canGoNext = () => {
        if (step === 1 && selectedProfessional) return true;
        if (step === 2 && selectedService) return true;
        if (step === 3 && selectedTime) return true;
        return false;
    };
    
    const isConfirmationStep = step === 4;
    const isSuccessStep = step === 5;
    const showBackButton = step > (professional ? 2 : 1) && !isSuccessStep;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors z-10 bg-white rounded-full p-1"><XIcon /></button>
                
                {!isSuccessStep && (
                    <div className="mb-4 text-center">
                        <h2 className="text-xl font-bold text-stone-800">Agendar Atendimento</h2>
                        <div className="flex justify-center mt-2 space-x-1">
                            {[1, 2, 3, 4].map(i => {
                                const visibleStep = professional ? i + 1 : i; 
                                if (visibleStep > 4) return null;
                                return (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= visibleStep ? 'w-6 bg-rose-500' : 'w-2 bg-stone-200'}`} />
                                )
                            })}
                        </div>
                    </div>
                )}
                
                <div className="flex-grow overflow-y-auto mb-6 pr-1 custom-scrollbar">
                    {renderCurrentStep()}
                </div>
                
                {!isSuccessStep && (
                    <div className="mt-auto flex-shrink-0 flex items-center justify-between pt-4 border-t border-stone-100 gap-4">
                        {showBackButton ? (
                            <button onClick={handlePrevStep} disabled={isSubmitting} className="flex-1 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all">
                                Voltar
                            </button>
                        ) : <div className="flex-1"></div>}
                        
                        {isConfirmationStep ? (
                             <button onClick={handleNextStep} disabled={isSubmitting} className="flex-[2] bg-rose-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-rose-100">
                                {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                             </button>
                        ) : (
                            <button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()} className="flex-[2] bg-rose-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-100">
                                Continuar
                            </button>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 4px; }
            `}</style>
        </div>
    );
};
