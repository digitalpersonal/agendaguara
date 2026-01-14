
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ProfessionalUser, Appointment, Service, Specialty, Expense } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';
import { ProfessionalCalendar } from '../components/ProfessionalCalendar';
import { QuickBookModal } from '../components/QuickBookModal';

interface ProfessionalDashboardProps {
    user: ProfessionalUser;
    onProfileUpdate: (updatedFields: Partial<ProfessionalUser>) => void;
}

// Icons
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);
const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);

const DayDetailPanel: React.FC<{
    selectedDate: Date;
    appointments: Appointment[];
    settings: ProfessionalUser['settings'];
    onClose: () => void;
    onAddClick: () => void;
    onAppointmentUpdate: (updatedAppointment: Appointment) => void;
}> = ({ selectedDate, appointments, settings, onClose, onAddClick, onAppointmentUpdate }) => {
    
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleUpdateStatus = async (appointmentId: string, status: 'completed' | 'cancelled') => {
        if (status === 'cancelled' && !window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        
        setLoadingAction(appointmentId);
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .select()
            .single();

        if (error) {
            alert(`Erro ao ${status === 'completed' ? 'finalizar' : 'cancelar'} o agendamento.`);
        } else if (data) {
            onAppointmentUpdate(data);
        }
        setLoadingAction(null);
    };

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
        return appointments.find(a => a.time.startsWith(time.substring(0, 5)));
    };

    const sortedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => a.time.localeCompare(b.time));
    }, [appointments]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-stone-100 text-stone-500 border-stone-200';
            default: return 'bg-rose-100 text-rose-700 border-rose-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            default: return 'Agendado';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border w-full lg:w-1/3 animate-fade-in-right flex flex-col h-full max-h-[85vh]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-stone-800">
                        {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </h3>
                    <p className="text-stone-500 text-sm capitalize">
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    </p>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-800 text-2xl font-bold p-2">&times;</button>
            </div>
            
            <div className="flex flex-col gap-4 mb-6">
                 <button 
                    onClick={onAddClick}
                    className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 flex items-center justify-center text-sm"
                >
                    <PlusCircleIcon /> Novo Agendamento
                </button>

                <div className="flex p-1 bg-stone-100 rounded-xl">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <ListIcon /> Lista
                    </button>
                    <button 
                        onClick={() => setViewMode('timeline')}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'timeline' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <ClockIcon /> Timeline
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {viewMode === 'list' ? (
                    <div className="space-y-4">
                        {sortedAppointments.length > 0 ? sortedAppointments.map(appt => (
                            <div key={appt.id} className="bg-stone-50 border border-stone-200 p-4 rounded-xl relative transition-all hover:border-rose-200">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">{appt.time}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${getStatusStyle(appt.status)}`}>
                                        {getStatusLabel(appt.status)}
                                    </span>
                                </div>
                                <h4 className="font-bold text-stone-800">{appt.service_name}</h4>
                                <p className="text-xs text-stone-500 mt-1 mb-3">Cliente: <span className="font-semibold text-stone-700">{appt.client_name}</span></p>
                                
                                {appt.status === 'upcoming' && (
                                    <div className="flex gap-2 border-t border-stone-200 pt-3">
                                        <button
                                            onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                            disabled={loadingAction === appt.id}
                                            className="flex-1 text-[10px] font-bold py-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                            disabled={loadingAction === appt.id}
                                            className="flex-1 text-[10px] font-bold py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                                        >
                                            Concluir
                                        </button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="bg-stone-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <CalendarIcon />
                                </div>
                                <p className="text-stone-500 font-medium">Nenhum atendimento agendado para hoje.</p>
                                <p className="text-stone-400 text-xs mt-1">Dia livre para organizar as finanças!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {timeSlots.map(time => {
                            const appointment = getAppointmentForSlot(time);
                            const isBlocked = settings.blockedTimeSlots && settings.blockedTimeSlots[selectedDate.toISOString().split('T')[0]]?.includes(time);
                            
                            if (appointment) {
                                return (
                                     <div key={time} className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-rose-800 text-xs">{time}</p>
                                            <span className={`text-[8px] font-bold uppercase px-1 rounded border ${getStatusStyle(appointment.status)}`}>
                                                {getStatusLabel(appointment.status)}
                                            </span>
                                        </div>
                                        <p className="font-bold text-stone-800 text-sm">{appointment.service_name}</p>
                                        <p className="text-[10px] text-stone-600">{appointment.client_name}</p>
                                    </div>
                                )
                            }
                            if (isBlocked) {
                                 return (
                                    <div key={time} className="bg-stone-100 border-l-4 border-stone-300 p-3 rounded-r-lg flex items-center">
                                        <span className="text-stone-400 line-through text-[10px] font-medium">{time} - Bloqueado</span>
                                    </div>
                                )
                            }
                            return (
                                <div key={time} className="flex justify-between items-center bg-white p-2 border border-stone-100 border-dashed rounded-lg">
                                    <span className="text-stone-400 text-[10px] font-medium">{time} - Disponível</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfessionalNotifications: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
    const [todayStr, setTodayStr] = useState('');

    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        setTodayStr(`${year}-${month}-${day}`);
    }, []);

    const todayAppointments = useMemo(() => {
        if (!todayStr) return [];
        return appointments
            .filter(a => a.date === todayStr && a.status === 'upcoming')
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [appointments, todayStr]);

    if (todayAppointments.length === 0) return null;

    const nextAppointment = todayAppointments[0];

    return (
        <div className="bg-white rounded-xl shadow-md border-l-4 border-rose-500 p-4 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-down">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-full mt-1 md:mt-0">
                    <BellIcon />
                </div>
                <div>
                    <h3 className="font-bold text-stone-800">Lembretes de Hoje</h3>
                    <p className="text-sm text-stone-500">
                        Você tem <strong className="text-rose-600">{todayAppointments.length}</strong> atendimento(s) agendado(s) para hoje.
                    </p>
                </div>
            </div>
            
            <div className="w-full md:w-auto bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center gap-4">
                <div className="text-center min-w-[3rem]">
                    <p className="text-[10px] uppercase font-bold text-stone-400">Próximo</p>
                    <p className="font-black text-xl text-stone-800">{nextAppointment.time}</p>
                </div>
                <div className="border-l border-stone-200 pl-4">
                    <p className="font-bold text-stone-700 text-sm">{nextAppointment.client_name}</p>
                    <p className="text-xs text-stone-500">{nextAppointment.service_name}</p>
                </div>
            </div>
        </div>
    );
};

type Tab = 'agenda' | 'financial' | 'history' | 'services' | 'availability' | 'settings';

const FinancialManagement: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
    const totalRevenue = appointments.reduce((sum, appt) => appt.status === 'completed' ? sum + appt.price : sum, 0);
    const upcomingRevenue = appointments.reduce((sum, appt) => appt.status === 'upcoming' ? sum + appt.price : sum, 0);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-2xl font-bold text-stone-800 mb-6">Controle Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <p className="text-green-600 text-sm font-bold uppercase tracking-wider mb-2">Ganhos Realizados</p>
                    <p className="text-3xl font-black text-green-800">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
                    <p className="text-rose-600 text-sm font-bold uppercase tracking-wider mb-2">Previsão Futura</p>
                    <p className="text-3xl font-black text-rose-800">R$ {upcomingRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 flex items-center justify-center">
                    <p className="text-stone-500 italic text-sm text-center">Relatórios detalhados disponíveis no plano Business.</p>
                </div>
            </div>
        </div>
    );
};

const AppointmentHistory: React.FC<{ appointments: Appointment[]; onUpdate: (a: Appointment) => void }> = ({ appointments, onUpdate }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = useMemo(() => {
        return appointments.filter(appt => {
            const dateMatch = (!startDate || appt.date >= startDate) && (!endDate || appt.date <= endDate);
            const statusMatch = statusFilter === 'all' || appt.status === statusFilter;
            return dateMatch && statusMatch;
        }).sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
    }, [appointments, startDate, endDate, statusFilter]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-stone-100 text-stone-500 border-stone-200';
            default: return 'bg-rose-100 text-rose-700 border-rose-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            default: return 'Agendado';
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h3 className="text-2xl font-bold text-stone-800">Histórico de Serviços</h3>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase mr-2">De</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                            className="bg-transparent py-2 text-sm focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase mr-2">Até</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                            className="bg-transparent py-2 text-sm focus:outline-none"
                        />
                    </div>
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-200 focus:outline-none"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="upcoming">Agendados</option>
                        <option value="completed">Concluídos</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.length > 0 ? filtered.map(appt => (
                    <details key={appt.id} className="group border rounded-xl overflow-hidden transition-all hover:border-rose-200">
                        <summary className="list-none cursor-pointer p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-center bg-stone-100 p-2 rounded-lg min-w-[60px] border border-stone-200">
                                    <p className="text-[10px] uppercase font-bold text-stone-400 leading-none mb-1">{new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}</p>
                                    <p className="text-lg font-black text-stone-800 leading-none">{appt.date.split('-')[2]}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-stone-800 flex items-center gap-2">
                                        {appt.service_name}
                                        <ChevronDownIcon />
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        Cliente: <span className="font-semibold text-stone-700">{appt.client_name}</span> • <span className="font-bold text-rose-500">{appt.time}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 sm:mt-0 justify-between sm:justify-end">
                                <span className="font-black text-stone-900 text-lg">R$ {appt.price.toFixed(2)}</span>
                                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${getStatusStyle(appt.status)}`}>
                                    {getStatusLabel(appt.status)}
                                </span>
                            </div>
                        </summary>
                        <div className="p-5 bg-stone-50 border-t border-stone-100 text-sm text-stone-600 animate-fade-in-down">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Detalhes do Cliente</p>
                                        <p className="font-bold text-stone-800 text-base">{appt.client_name}</p>
                                        {appt.pet_name && (
                                            <div className="mt-2 bg-white border border-stone-200 rounded-lg p-2 inline-block">
                                                <p className="text-[10px] font-bold text-rose-400 uppercase leading-none mb-1">Paciente Pet</p>
                                                <p className="text-sm font-semibold">{appt.pet_name} {appt.pet_breed ? `(${appt.pet_breed})` : ''}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">ID do Agendamento</p>
                                        <p className="font-mono text-xs text-stone-400">#{appt.id.substring(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Observações e Notas</p>
                                    <div className="bg-white border border-stone-200 rounded-xl p-4 min-h-[80px]">
                                        <p className="italic text-stone-600">{appt.notes || "Nenhuma observação interna ou detalhe do cliente registrado para este atendimento."}</p>
                                    </div>
                                    <p className="mt-3 text-[10px] text-stone-400">Data de Registro: {new Date(appt.date).toLocaleDateString('pt-BR')} às {appt.time}</p>
                                </div>
                            </div>
                        </div>
                    </details>
                )) : (
                    <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <div className="inline-block p-4 bg-stone-100 rounded-full mb-4">
                            <ArchiveIcon />
                        </div>
                        <p className="text-stone-500 font-medium">Nenhum agendamento encontrado para os filtros aplicados.</p>
                        <button 
                            onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('all'); }} 
                            className="mt-4 text-rose-500 font-bold hover:underline"
                        >
                            Limpar Filtros e Ver Todos
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.25s cubic-bezier(0, 0, 0.2, 1) forwards; }
                details summary::-webkit-details-marker { display: none; }
            `}</style>
        </div>
    );
};

const ServiceEditor: React.FC<{ services: Service[]; userId: string; onServicesUpdate: (s: Service[]) => void }> = ({ services, userId, onServicesUpdate }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('60');

    const handleAdd = async () => {
        if (!name || !price) return;
        const newService = { id: crypto.randomUUID(), name, price: Number(price), duration: Number(duration) };
        const updated = [...services, newService];
        
        const { error } = await supabase.from('profiles').update({ services: updated }).eq('id', userId);
        if (error) alert("Erro ao salvar serviço");
        else {
            onServicesUpdate(updated);
            setName(''); setPrice(''); setDuration('60');
        }
    };

    const handleDelete = async (id: string) => {
        const updated = services.filter(s => s.id !== id);
        const { error } = await supabase.from('profiles').update({ services: updated }).eq('id', userId);
        if (!error) onServicesUpdate(updated);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-2xl font-bold text-stone-800 mb-6">Gerenciar Serviços</h3>
            <div className="grid gap-4 mb-8">
                {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-stone-50 transition-colors">
                        <div>
                            <p className="font-bold text-stone-800">{s.name}</p>
                            <p className="text-xs text-stone-500">{s.duration} min • R$ {s.price.toFixed(2)}</p>
                        </div>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">&times;</button>
                    </div>
                ))}
            </div>
            <div className="bg-stone-50 p-6 rounded-xl space-y-4">
                <p className="font-bold text-stone-700 text-sm">Adicionar Novo Serviço</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Serviço" className="p-2 border rounded-lg text-sm" />
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço (R$)" className="p-2 border rounded-lg text-sm" />
                    <select value={duration} onChange={e => setDuration(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="30">30 min</option>
                        <option value="60">60 min</option>
                        <option value="90">90 min</option>
                        <option value="120">120 min</option>
                    </select>
                </div>
                <button onClick={handleAdd} className="w-full bg-stone-800 text-white font-bold py-2 rounded-lg hover:bg-stone-900 transition-colors">Salvar Serviço</button>
            </div>
        </div>
    );
};

const AvailabilityManager: React.FC<{ user: ProfessionalUser; onSettingsUpdate: (s: any) => void }> = ({ user, onSettingsUpdate }) => {
    const [start, setStart] = useState(user.settings.workHours.start);
    const [end, setStartEnd] = useState(user.settings.workHours.end);

    const handleSave = async () => {
        const newSettings = { ...user.settings, workHours: { start, end: end } };
        const { error } = await supabase.from('profiles').update({ settings: newSettings }).eq('id', user.id);
        if (!error) onSettingsUpdate(newSettings);
        else alert("Erro ao salvar horários");
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-2xl font-bold text-stone-800 mb-6">Configuração de Horários</h3>
            <div className="space-y-6">
                <div className="flex gap-6 items-center">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Abertura</label>
                        <input type="time" value={start} onChange={e => setStart(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-200" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Fechamento</label>
                        <input type="time" value={end} onChange={e => setStartEnd(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-200" />
                    </div>
                </div>
                <button onClick={handleSave} className="w-full bg-rose-500 text-white font-black py-4 rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100">Atualizar Agenda</button>
            </div>
        </div>
    );
};

const ProfileSettings: React.FC<{ user: ProfessionalUser; onProfileUpdate: (f: any) => void }> = ({ user, onProfileUpdate }) => {
    const [name, setName] = useState(user.name);
    const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
    const [bio, setBio] = useState(user.bio || '');
    const [coverUrl, setCoverUrl] = useState(user.coverImageUrl || '');
    const [uploading, setUploading] = useState(false);

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `covers/${user.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            if (urlData.publicUrl) {
                setCoverUrl(urlData.publicUrl);
                await supabase.from('profiles').update({ cover_image_url: urlData.publicUrl }).eq('id', user.id);
                onProfileUpdate({ coverImageUrl: urlData.publicUrl });
            }
        } catch (error) {
            alert('Erro ao carregar imagem de capa.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        const { error } = await supabase.from('profiles').update({ name, whatsapp, bio }).eq('id', user.id);
        if (!error) onProfileUpdate({ name, whatsapp, bio });
        else alert("Erro ao atualizar perfil");
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-2xl font-bold text-stone-800 mb-6">Identidade Visual e Perfil</h3>
            
            <div className="mb-10 group relative rounded-2xl overflow-hidden bg-stone-100 border-4 border-stone-50 shadow-inner h-48 md:h-64">
                {coverUrl ? (
                    <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                        <CameraIcon />
                        <span className="text-sm font-bold mt-2">Clique para adicionar uma capa</span>
                    </div>
                )}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all group-hover:bg-black/10">
                    <div className="bg-white/90 backdrop-blur p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <CameraIcon />
                        <span className="text-xs font-black uppercase text-stone-800">{uploading ? 'Carregando...' : 'Trocar Capa'}</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
                </label>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Nome Público</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-rose-200 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2">WhatsApp de Agendamento</label>
                        <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-rose-200 focus:outline-none" placeholder="(XX) XXXXX-XXXX" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Descrição Detalhada / Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-rose-200 focus:outline-none" rows={6} placeholder="Conte sua história, descreva seus diferenciais, experiência e o que seus clientes podem esperar do seu atendimento..." />
                </div>
                <button onClick={handleSave} className="w-full bg-stone-900 text-white font-black py-4 rounded-xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-100 mt-4">SALVAR ALTERAÇÕES NO PERFIL</button>
            </div>
        </div>
    );
};

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ user, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('agenda');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [localUser, setLocalUser] = useState(user);
    const [isQuickBookModalOpen, setIsQuickBookModalOpen] = useState(false);
    const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(undefined);

    const fetchAppointments = useCallback(async () => {
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
    }, [user.id]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(appt => {
            const dateKey = appt.date;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(appt);
        });
        return map;
    }, [appointments]);

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);
    
    const handleAppointmentCreated = useCallback(() => {
        fetchAppointments();
        setIsQuickBookModalOpen(false);
    }, [fetchAppointments]);
    
    const handleAppointmentUpdate = useCallback((updatedAppointment: Appointment) => {
        setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
    }, []);

    const appointmentsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = selectedDate.toISOString().split('T')[0];
        return appointmentsByDate.get(dateStr) || [];
    }, [selectedDate, appointmentsByDate]);

    const handleOpenQuickBook = (date?: Date) => {
        setModalInitialDate(date);
        setIsQuickBookModalOpen(true);
    };

    const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode; }> = ({ tabName, label, icon }) => (
         <button onClick={() => setActiveTab(tabName)} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white text-rose-600 border-b-0 shadow-sm' : 'bg-transparent text-stone-600 hover:bg-white/50'}`}>
            {icon}
            {label}
        </button>
    );

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">Painel de Gestão</h1>
                <p className="text-stone-500 mt-2 text-lg">Olá, {user.name}! Bem-vindo ao controle total do seu negócio.</p>
            </div>
            
            <ProfessionalNotifications appointments={appointments} />
            
            <div className="border-b border-stone-200 flex items-center mb-6 flex-wrap overflow-x-auto no-scrollbar">
                <TabButton tabName="agenda" label="Agenda" icon={<CalendarIcon />} />
                <TabButton tabName="financial" label="Financeiro" icon={<TrendingUpIcon />} />
                <TabButton tabName="history" label="Histórico" icon={<ArchiveIcon />} />
                <TabButton tabName="services" label="Serviços" icon={<ClipboardListIcon />} />
                <TabButton tabName="availability" label="Horários" icon={<CogIcon />} />
                <TabButton tabName="settings" label="Perfil" icon={<UserIcon />} />
            </div>

            <div id="tab-content">
                {loading && <div className="py-20 text-center"><div className="animate-spin h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div><p className="text-stone-500">Sincronizando dados...</p></div>}
                
                {!loading && activeTab === 'agenda' && (
                    <>
                         <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => handleOpenQuickBook(new Date())}
                                className="bg-rose-600 text-white font-black py-3 px-6 rounded-full hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 flex items-center"
                            >
                                <PlusCircleIcon /> Agendamento Manual
                            </button>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                           <div className="flex-grow w-full">
                                <ProfessionalCalendar 
                                    appointmentsByDate={appointmentsByDate}
                                    onDateSelect={handleDateSelect}
                                    settings={localUser.settings}
                                />
                           </div>
                            {selectedDate && (
                                <DayDetailPanel 
                                    selectedDate={selectedDate}
                                    appointments={appointmentsForSelectedDate}
                                    settings={localUser.settings}
                                    onClose={() => setSelectedDate(null)}
                                    onAddClick={() => handleOpenQuickBook(selectedDate)}
                                    onAppointmentUpdate={handleAppointmentUpdate}
                                />
                            )}
                        </div>
                    </>
                )}
                
                {!loading && activeTab === 'financial' && <FinancialManagement appointments={appointments} />}
                {!loading && activeTab === 'history' && <AppointmentHistory appointments={appointments} onUpdate={handleAppointmentUpdate} />}
                {!loading && activeTab === 'services' && <ServiceEditor services={localUser.services} userId={user.id} onServicesUpdate={(s) => { setLocalUser({...localUser, services: s}); onProfileUpdate({services: s}); }} />}
                {!loading && activeTab === 'availability' && <AvailabilityManager user={localUser} onSettingsUpdate={(s) => { setLocalUser({...localUser, settings: s}); onProfileUpdate({settings: s}); }} />}
                {!loading && activeTab === 'settings' && <ProfileSettings user={localUser} onProfileUpdate={(f) => { setLocalUser({...localUser, ...f}); onProfileUpdate(f); }} />}
            </div>

             {isQuickBookModalOpen && (
                <QuickBookModal
                    user={localUser}
                    initialDate={modalInitialDate}
                    onClose={() => setIsQuickBookModalOpen(false)}
                    onBookingSuccess={handleAppointmentCreated}
                />
            )}
        </div>
    );
};
