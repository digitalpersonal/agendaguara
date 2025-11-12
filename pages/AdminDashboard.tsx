import React, { useState, useEffect, useMemo } from 'react';
import type { AdminUser, User, Appointment } from '../types';
import { supabase } from '../utils/supabase';

// Icons
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

const DashboardOverview: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, professionals: 0, appointments: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional');
                const { count: apptCount, data: apptData } = await supabase.from('appointments').select('price', { count: 'exact' });
                
                const totalRevenue = apptData?.reduce((sum, appt) => sum + (appt.price || 0), 0) || 0;

                setStats({
                    users: userCount ?? 0,
                    professionals: profCount ?? 0,
                    appointments: apptCount ?? 0,
                    revenue: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <p>Carregando estatísticas...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total de Usuários" value={stats.users} />
            <StatCard title="Profissionais Ativos" value={stats.professionals} />
            <StatCard title="Agendamentos Realizados" value={stats.appointments} />
            <StatCard title="Receita Total" value={`R$ ${stats.revenue.toFixed(2)}`} />
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-stone-500 text-sm font-semibold uppercase">{title}</h3>
        <p className="text-3xl font-bold text-stone-800 mt-2">{value}</p>
    </div>
);

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) console.error("Error fetching users:", error);
            else setUsers(data as User[] || []);
            setLoading(false);
        };
        fetchUsers();
    }, []);
    
    const filteredUsers = useMemo(() => 
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    if (loading) return <p>Carregando usuários...</p>;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Gerenciar Usuários</h3>
            <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 border border-stone-300 rounded-lg mb-4"
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Função</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">WhatsApp</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 capitalize">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{user.whatsapp || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && <p className="text-center text-stone-500 py-4">Nenhum usuário encontrado.</p>}
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: Appointment['status'] }> = ({ status }) => {
    const styles = {
        upcoming: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-stone-200 text-stone-700',
    };
    const text = {
        upcoming: 'Pendente',
        completed: 'Concluído',
        cancelled: 'Cancelado',
    }
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
            {text[status]}
        </span>
    );
};


const AppointmentManagement: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

     useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
            if (error) console.error("Error fetching appointments:", error);
            else setAppointments(data || []);
            setLoading(false);
        };
        fetchAppointments();
    }, []);

    const filteredAppointments = useMemo(() => 
        appointments.filter(appt => appt.status === filter),
    [appointments, filter]);

    if (loading) return <p>Carregando agendamentos...</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Gerenciar Agendamentos</h3>
             <div className="flex border-b mb-4">
                <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 font-semibold ${filter === 'upcoming' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-stone-500'}`}>Próximos</button>
                <button onClick={() => setFilter('completed')} className={`px-4 py-2 font-semibold ${filter === 'completed' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-stone-500'}`}>Concluídos</button>
                <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 font-semibold ${filter === 'cancelled' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-stone-500'}`}>Cancelados</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Profissional</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Serviço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Data & Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-stone-200">
                        {filteredAppointments.map(appt => (
                            <tr key={appt.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">{appt.client_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{appt.professional_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{appt.service_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appt.time}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">R$ {appt.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={appt.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAppointments.length === 0 && <p className="text-center text-stone-500 py-4">Nenhum agendamento encontrado para este filtro.</p>}
            </div>
        </div>
    );
}

export const AdminDashboard: React.FC<{ user: AdminUser }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const TabButton: React.FC<{ tabName: string; label: string; icon: React.ReactNode; }> = ({ tabName, label, icon }) => (
         <button onClick={() => setActiveTab(tabName)} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white text-rose-600 border-b-0' : 'bg-transparent text-stone-600 hover:bg-white/50'}`}>
            {icon}
            {label}
        </button>
    );

     const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <DashboardOverview />;
            case 'users': return <UserManagement />;
            case 'appointments': return <AppointmentManagement />;
            default: return <DashboardOverview />;
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Painel Administrativo</h1>
                <p className="text-stone-500 mt-2 text-lg">Bem-vindo(a), {user.name.split(' ')[0]}!</p>
            </div>
            
            <div className="border-b border-stone-200 flex items-center mb-6 flex-wrap">
                <TabButton tabName="overview" label="Visão Geral" icon={<EyeIcon />} />
                <TabButton tabName="users" label="Usuários" icon={<UsersIcon />} />
                <TabButton tabName="appointments" label="Agendamentos" icon={<CalendarIcon />} />
            </div>

            <div id="admin-tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};