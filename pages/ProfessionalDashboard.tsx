import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ProfessionalUser, Appointment, Service } from '../types';
import { supabase } from '../utils/supabase';
import { ProfessionalCalendar } from '../components/ProfessionalCalendar';

interface ProfessionalDashboardProps {
    user: ProfessionalUser;
}

// Icons for UI
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);
const DogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-stone-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 5.2a2 2 0 0 1 2-2.2h.4a2 2 0 0 1 2 2.2v.3a2 2 0 0 1-2 2.2h-.4a2 2 0 0 1-2-2.2v-.3Z"></path><path d="M9.5 14.5A2.5 2.5 0 0 1 7 12V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3a2.5 2.5 0 0 1-2.5 2.5h-3Z"></path><path d="M11 14v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3"></path><path d="M10 14h.01"></path><path d="M14 14h.01"></path><path d="M7 17v-2.3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2V17"></path><path d="M5 14a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"></path><path d="M19 14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1"></path></svg>

const DayDetailPanel: React.FC<{
    selectedDate: Date;
    appointments: Appointment[];
    settings: ProfessionalUser['settings'];
    onClose: () => void;
}> = ({ selectedDate, appointments, settings, onClose }) => {
    
    const timeSlots = useMemo(() => {
        const slots = [];
        if (!settings.workHours) return [];
        const start = parseInt(settings.workHours.start.split(':')[0]);
        const end = parseInt(settings.workHours.end.split(':')[0]);
        for (let i = start; i < end; i++) {
            slots.push(`${String(i).padStart(2, '0')}:00`);
            slots.push(`${String(i).padStart(2, '0')}:30`);
        }
        return slots;
    }, [settings.workHours]);

    const getAppointmentForSlot = (time: string) => {
        return appointments.find(a => a.time.startsWith(time.substring(0, 5))); // Match HH:MM
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border w-full lg:w-1/3">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800">
                    {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <button onClick={onClose} className="text-stone-500 hover:text-stone-800">&times;</button>
            </div>
            <div className="flex items-center gap-2 mb-4">
                 <button className="flex-1 text-sm bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200">
                    Bloquear Dia
                </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {timeSlots.map(time => {
                    const appointment = getAppointmentForSlot(time);
                    const isBlocked = settings.blockedTimeSlots && settings.blockedTimeSlots[selectedDate.toISOString().split('T')[0]]?.includes(time);
                    
                    if (appointment) {
                        return (
                             <div key={time} className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg">
                                <p className="font-semibold text-rose-800">{time} - {appointment.service_name}</p>
                                <p className="text-sm text-rose-700">Cliente: {appointment.client_name}</p>
                                {appointment.pet_name && (
                                    <p className="text-sm text-rose-600 flex items-center"><DogIcon /> {appointment.pet_name} ({appointment.pet_breed})</p>
                                )}
                            </div>
                        )
                    }
                    if (isBlocked) {
                         return (
                            <div key={time} className="flex justify-between items-center bg-stone-100 p-3 rounded-lg">
                                <span className="text-stone-500 line-through">{time} - Bloqueado</span>
                                <button className="text-xs text-green-600 hover:underline">Desbloquear</button>
                            </div>
                        )
                    }
                    return (
                        <div key={time} className="flex justify-between items-center bg-white p-3 rounded-lg hover:bg-stone-50">
                            <span className="text-stone-600">{time} - Disponível</span>
                            <button className="text-xs text-stone-500 hover:underline">Bloquear</button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const ServiceEditor: React.FC<{ services: Service[]; userId: string; onServicesUpdate: (services: Service[]) => void; }> = ({ services, userId, onServicesUpdate }) => {
    const [localServices, setLocalServices] = useState(services || []);

    const handleServiceChange = (index: number, field: keyof Service, value: any) => {
        const updatedServices = [...localServices];
        (updatedServices[index] as any)[field] = field === 'price' || field === 'duration' ? Number(value) : value;
        setLocalServices(updatedServices);
    };

    const handleSaveChanges = async () => {
        const { error } = await supabase
            .from('profiles')
            .update({ services: localServices })
            .eq('id', userId);
        
        if (error) {
            alert("Erro ao salvar alterações.");
            console.error(error);
        } else {
            alert("Serviços atualizados com sucesso!");
            onServicesUpdate(localServices);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Meus Serviços</h3>
            <div className="space-y-4">
                {localServices.map((service, index) => (
                    <div key={service.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-3 border rounded-lg">
                        <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} className="p-2 border rounded col-span-1" />
                        <input type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} className="p-2 border rounded" placeholder="Preço" />
                        <input type="number" value={service.duration} onChange={(e) => handleServiceChange(index, 'duration', e.target.value)} className="p-2 border rounded" placeholder="Duração (min)" />
                    </div>
                ))}
            </div>
            <button onClick={handleSaveChanges} className="mt-6 bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600">Salvar Alterações</button>
        </div>
    )
};

const AvailabilityManager: React.FC<{ settings: ProfessionalUser['settings'] }> = ({ settings }) => {
    if (!settings) return <div className="bg-white p-6 rounded-xl shadow-md"><p>Configurações de disponibilidade não encontradas.</p></div>;
    
    return (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-stone-800 mb-4">Minha Disponibilidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-stone-600 mb-1">Horário de Trabalho</label>
                <div className="flex items-center gap-2">
                    <input type="time" defaultValue={settings.workHours.start} className="p-2 border rounded w-full" />
                    <span>até</span>
                    <input type="time" defaultValue={settings.workHours.end} className="p-2 border rounded w-full" />
                </div>
            </div>
            <div>
                <label className="block text-stone-600 mb-1">Dias de Trabalho</label>
                <div className="flex flex-wrap gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <button key={day} className={`px-3 py-2 text-sm rounded-full border ${(settings.workDays || []).includes(index) ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-stone-600'}`}>
                            {day}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <button className="mt-6 bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600">Salvar Alterações</button>
    </div>
)};


type Tab = 'agenda' | 'services' | 'availability';

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<Tab>('agenda');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [localUser, setLocalUser] = useState(user);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('professional_id', user.id);
            
            if (error) {
                console.error("Error fetching appointments:", error);
            } else {
                setAppointments(data || []);
            }
            setLoading(false);
        };
        fetchAppointments();
    }, [user.id]);

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    const appointmentsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = selectedDate.toISOString().split('T')[0];
        return appointments.filter(a => a.date === dateStr);
    }, [selectedDate, appointments]);
    
    const handleServicesUpdate = (updatedServices: Service[]) => {
        setLocalUser(prevUser => ({ ...prevUser, services: updatedServices }));
    };

    const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode; }> = ({ tabName, label, icon }) => (
         <button onClick={() => setActiveTab(tabName)} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white text-rose-600 border-b-0' : 'bg-transparent text-stone-600 hover:bg-white/50'}`}>
            {icon}
            {label}
        </button>
    );

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Painel do Profissional</h1>
                <p className="text-stone-500 mt-2 text-lg">Bem-vindo(a), {user.name.split(' ')[0]}! Gerencie sua agenda aqui.</p>
            </div>
            
            <div className="border-b border-stone-200 flex items-center mb-6">
                <TabButton tabName="agenda" label="Agenda" icon={<CalendarIcon />} />
                <TabButton tabName="services" label="Meus Serviços" icon={<ClipboardListIcon />} />
                <TabButton tabName="availability" label="Disponibilidade" icon={<CogIcon />} />
            </div>

            <div id="tab-content">
                {loading && <p>Carregando...</p>}
                {!loading && activeTab === 'agenda' && (
                    <div className="flex flex-col lg:flex-row gap-6">
                       <div className="flex-grow">
                            <ProfessionalCalendar 
                                appointments={appointments}
                                onDateSelect={handleDateSelect}
                                settings={user.settings}
                            />
                       </div>
                        {selectedDate && (
                            <DayDetailPanel 
                                selectedDate={selectedDate}
                                appointments={appointmentsForSelectedDate}
                                settings={user.settings}
                                onClose={() => setSelectedDate(null)}
                            />
                        )}
                    </div>
                )}
                {activeTab === 'services' && <ServiceEditor services={localUser.services} userId={user.id} onServicesUpdate={handleServicesUpdate} />}
                {activeTab === 'availability' && <AvailabilityManager settings={user.settings} />}
            </div>
        </div>
    );
};