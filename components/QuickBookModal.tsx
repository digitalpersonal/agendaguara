
import React, { useState, useMemo, useEffect } from 'react';
import type { ProfessionalUser, Service, Appointment } from '../types';
import { supabase } from '../utils/supabase';

interface QuickBookModalProps {
    user: ProfessionalUser;
    initialDate?: Date;
    onClose: () => void;
    onBookingSuccess: () => void;
}

// Icons
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

export const QuickBookModal: React.FC<QuickBookModalProps> = ({ user, initialDate, onClose, onBookingSuccess }) => {
    const [clientName, setClientName] = useState('');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(
        initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [appointmentsForSelectedDate, setAppointmentsForSelectedDate] = useState<Appointment[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [justSelectedTime, setJustSelectedTime] = useState<string | null>(null);
    
    // Fetch availability whenever date changes
    useEffect(() => {
        const fetchDayAppointments = async () => {
            setLoadingAvailability(true);
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('professional_id', user.id)
                .eq('date', selectedDate)
                .neq('status', 'cancelled');
            
            if (!error) {
                setAppointmentsForSelectedDate(data || []);
            }
            setLoadingAvailability(false);
        };
        fetchDayAppointments();
    }, [selectedDate, user.id]);

    const availableTimeSlots = useMemo(() => {
        const slots = [];
        const { settings } = user;
        if (!settings.workHours) return [];

        const dateObj = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek = dateObj.getDay();
        const isWorkDay = settings.workDays.includes(dayOfWeek);
        const isBlockedDay = settings.blockedDays.includes(selectedDate);

        if (!isWorkDay || isBlockedDay) return [];

        const bookedTimes = appointmentsForSelectedDate.map(a => a.time.substring(0, 5));
        const blockedSlotsForDay = settings.blockedTimeSlots?.[selectedDate] || [];

        const now = new Date();
        const isToday = selectedDate === now.toISOString().split('T')[0];

        const startHour = parseInt(settings.workHours.start.split(':')[0]);
        const endHour = parseInt(settings.workHours.end.split(':')[0]);

        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
                // Skip past times if today
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
    }, [user, appointmentsForSelectedDate, selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!clientName || !selectedService || !selectedTime) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        setIsSubmitting(true);
        const appointmentData = {
            professional_id: user.id,
            client_name: clientName.trim(),
            professional_name: user.name,
            professional_image_url: user.imageUrl,
            service_name: selectedService.name,
            date: selectedDate,
            time: selectedTime,
            price: selectedService.price,
            notes: notes.trim(),
            status: 'upcoming' as const
        };
        
        const { error: insertError } = await supabase.from('appointments').insert([appointmentData]);

        if (insertError) {
            setError("Erro ao criar agendamento. Verifique a conexão.");
            setIsSubmitting(false);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative text-center">
                    <CheckCircleIcon />
                    <h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Criado!</h3>
                    <p className="text-stone-600 mt-2">
                        <strong>{clientName}</strong> agendado para o dia <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> às <strong>{selectedTime}</strong>.
                    </p>
                    <button onClick={onBookingSuccess} className="mt-6 w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600">Fechar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                 <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800"><XIcon /></button>
                <h2 className="text-2xl font-bold text-center text-stone-800 mb-4">Novo Agendamento Manual</h2>
                
                <form id="quick-book-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    <div>
                        <label className="block text-stone-600 mb-1 font-bold text-sm">Data do Atendimento</label>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => { setSelectedDate(e.target.value); setSelectedTime(null); }} 
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-200"
                        />
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1 font-bold text-sm">Nome do Cliente</label>
                        <input 
                            type="text" 
                            required 
                            value={clientName} 
                            onChange={e => setClientName(e.target.value)} 
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-200" 
                            placeholder="Nome para registro na agenda"
                        />
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1 font-bold text-sm">Serviço</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                             {user.services.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedService?.id === service.id ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200' : 'border-stone-200 hover:bg-stone-50'}`}
                                >
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-stone-800">{service.name}</span>
                                        <span className="text-stone-600">R$ {service.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1 font-bold text-sm">Horários Disponíveis</label>
                        {loadingAvailability ? <p className="text-xs text-stone-400">Consultando agenda...</p> : (
                            availableTimeSlots.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {availableTimeSlots.map(time => (
                                        <button
                                            type="button"
                                            key={time}
                                            onClick={() => { setSelectedTime(time); setJustSelectedTime(time); setTimeout(() => setJustSelectedTime(null), 300); }}
                                            className={`p-2 rounded-lg text-xs font-bold transition-all ${selectedTime === time ? 'bg-rose-500 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'} ${justSelectedTime === time ? 'scale-110' : ''}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-xs text-rose-500 bg-rose-50 p-3 rounded-lg">Indisponível para esta data.</p>
                            )
                        )}
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1 font-bold text-sm">Observações Internas (opcional)</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            placeholder="Detalhes sobre o cliente ou o atendimento."
                            className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-200 focus:outline-none"
                            rows={2}
                        />
                    </div>
                </form>

                <div className="mt-auto pt-4 border-t">
                    {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
                    <button 
                        type="submit" 
                        form="quick-book-form"
                        disabled={isSubmitting || !selectedTime}
                        className="w-full bg-rose-600 text-white font-black py-3 px-4 rounded-lg hover:bg-rose-700 disabled:bg-stone-300 shadow-lg"
                    >
                       {isSubmitting ? 'Salvando...' : 'Confirmar e Adicionar à Agenda'}
                    </button>
                </div>
            </div>
        </div>
    );
};
