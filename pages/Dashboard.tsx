import React, { useState, useEffect } from 'react';
import type { User, Appointment } from '../types';
import { supabase } from '../utils/supabase';
import { AppointmentCard } from '../components/AppointmentCard';

interface DashboardProps {
    user: User;
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ClockIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('client_id', user.id)
                .order('date', { ascending: false })
                .order('time', { ascending: false });

            if (error) {
                console.error("Error fetching appointments:", error);
                setError("Não foi possível carregar seus agendamentos.");
            } else {
                setAppointments(data || []);
            }
            setLoading(false);
        };

        if (user) {
            fetchAppointments();
        }
    }, [user]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments.filter(a => new Date(a.date + 'T00:00:00') >= today && a.status === 'upcoming');
    const pastAppointments = appointments.filter(a => new Date(a.date + 'T00:00:00') < today || a.status === 'completed');

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Olá, {user.name.split(' ')[0]}!</h1>
                <p className="text-stone-500 mt-2 text-lg">Bem-vindo(a) de volta! Aqui estão seus agendamentos.</p>
            </div>
            
            {loading && <p>Carregando agendamentos...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="grid lg:grid-cols-1 gap-8">
                    {/* Upcoming Appointments */}
                    <section>
                        <div className="flex items-center mb-4">
                            <CalendarIcon />
                            <h2 className="text-2xl font-bold text-stone-700">Próximos Agendamentos</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingAppointments.map(appt => <AppointmentCard key={appt.id} appointment={appt} />)}
                                </div>
                            ) : (
                                <p className="text-stone-500 text-center py-4">Você não tem nenhum agendamento futuro.</p>
                            )}
                        </div>
                    </section>
                    
                    {/* Past Appointments */}
                    <section>
                        <div className="flex items-center mb-4">
                            <ClockIcon />
                            <h2 className="text-2xl font-bold text-stone-700">Histórico de Serviços</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            {pastAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {pastAppointments.map(appt => <AppointmentCard key={appt.id} appointment={appt} />)}
                                </div>
                            ) : (
                                <p className="text-stone-500 text-center py-4">Seu histórico de agendamentos está vazio.</p>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};