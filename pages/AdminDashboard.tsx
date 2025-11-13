import React, { useState, useEffect, useMemo } from 'react';
import type { AdminUser, User, Specialty } from '../types';
import { supabase } from '../utils/supabase';

// Icons
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


const AddProfessionalModal: React.FC<{
    onClose: () => void;
    onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const [newSpecialtyPrice, setNewSpecialtyPrice] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("O arquivo é muito grande. O limite é 2MB.");
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert("Por favor, selecione um arquivo de imagem.");
                return;
            }
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddSpecialty = () => {
        if (newSpecialtyName.trim() && newSpecialtyPrice) {
            setSpecialties([...specialties, { name: newSpecialtyName.trim(), price: Number(newSpecialtyPrice) }]);
            setNewSpecialtyName('');
            setNewSpecialtyPrice('');
        } else {
            alert('Por favor, preencha o nome e o preço da especialidade.');
        }
    };
    
    const removeSpecialty = (indexToRemove: number) => {
        setSpecialties(specialties.filter((_, index) => index !== indexToRemove));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (specialties.length === 0) {
            setError('Por favor, adicione ao menos uma especialidade.');
            return;
        }

        setLoading(true);
        setError(null);
        
        let imageUrl = `https://i.pravatar.cc/150?u=${email}`;

        if (avatarFile) {
            try {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `${crypto.randomUUID()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                
                if (!urlData.publicUrl) throw new Error("URL pública não foi gerada.");
                
                imageUrl = urlData.publicUrl;

            } catch (uploadError: any) {
                setError(`Erro no upload da imagem: ${uploadError.message}`);
                setLoading(false);
                return;
            }
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'professional',
                    specialty: specialties,
                    whatsapp,
                    imageUrl,
                    bio,
                    settings: {
                        workHours: { start: '09:00', end: '18:00' },
                        workDays: [1, 2, 3, 4, 5],
                        blockedDays: [],
                        blockedTimeSlots: {},
                    },
                    services: []
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
        } else if (data.user) {
            alert('Profissional cadastrado com sucesso!');
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-center text-stone-800 mb-6">Adicionar Novo Profissional</h2>
                
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="flex flex-col items-center text-center">
                        <img src={previewUrl || 'https://via.placeholder.com/150'} alt="Pré-visualização do perfil" className="w-24 h-24 rounded-full object-cover border-4 border-stone-200 mb-4" />
                        <label className="cursor-pointer bg-stone-100 text-stone-700 font-semibold py-2 px-4 rounded-lg hover:bg-stone-200 transition-colors">
                            <span>Logomarca / Foto de Perfil</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                         <p className="text-xs text-stone-500 mt-2">Max 2MB. JPG, PNG.</p>
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-name">Nome Completo</label>
                        <input type="text" id="prof-name" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-bio">Bio / Descrição</label>
                        <textarea id="prof-bio" value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3} placeholder="Descreva o profissional, seus serviços e experiência."></textarea>
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-email">Email</label>
                        <input type="email" id="prof-email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-password">Senha Provisória</label>
                        <input type="password" id="prof-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1">Especialidades</label>
                        <div className="border rounded-lg p-2 space-y-2">
                             {specialties.map((spec, index) => (
                                <div key={index} className="flex items-center justify-between bg-stone-100 p-2 rounded-lg text-sm">
                                    <span>{spec.name} - R$ {spec.price.toFixed(2)}</span>
                                    <button type="button" onClick={() => removeSpecialty(index)} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                                </div>
                            ))}
                            <div className="flex items-end gap-2 border-t pt-2">
                                <div className="flex-grow">
                                     <input type="text" value={newSpecialtyName} onChange={e => setNewSpecialtyName(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-sm" placeholder="Nome da Especialidade" />
                                </div>
                                <div className="w-24">
                                     <input type="number" value={newSpecialtyPrice} onChange={e => setNewSpecialtyPrice(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-sm" placeholder="Preço" step="0.01" />
                                </div>
                                <button type="button" onClick={handleAddSpecialty} className="h-9 bg-stone-700 text-white font-semibold px-3 rounded-lg hover:bg-stone-800 text-sm">Add</button>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-whatsapp">WhatsApp (Opcional)</label>
                        <input type="tel" id="prof-whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors duration-300 disabled:bg-rose-300">
                        {loading ? 'Cadastrando...' : 'Cadastrar Profissional'}
                    </button>
                </form>
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

const ProfessionalManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'professional')
            .order('created_at', { ascending: false });
        if (error) console.error("Error fetching professionals:", error);
        else setUsers(data as User[] || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const handleProfessionalAdded = () => {
        setIsAddModalOpen(false);
        fetchUsers();
    };

    const handleRemoveProfessional = async (userId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este profissional? Esta ação removerá o perfil do profissional da plataforma. Esta ação não pode ser desfeita.')) {
            return;
        }
    
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
    
        if (error) {
            alert('Erro ao remover o perfil do profissional.');
            console.error('Error removing profile:', error);
        } else {
            alert('Perfil do profissional removido com sucesso.');
            setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
        }
    };
    
    const filteredUsers = useMemo(() => 
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    if (loading) return <p>Carregando profissionais...</p>;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                 <h3 className="text-2xl font-bold text-stone-800">Gerenciar Profissionais</h3>
                 <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors"
                >
                    + Adicionar Profissional
                </button>
            </div>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">WhatsApp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{user.whatsapp || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onClick={() => handleRemoveProfessional(user.id)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors" aria-label={`Remover ${user.name}`}>
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && <p className="text-center text-stone-500 py-4">Nenhum profissional encontrado.</p>}
            </div>
            {isAddModalOpen && (
                <AddProfessionalModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={handleProfessionalAdded}
                />
            )}
        </div>
    );
};

const ClientManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'client')
            .order('created_at', { ascending: false });
        if (error) console.error("Error fetching clients:", error);
        else setUsers(data as User[] || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const filteredUsers = useMemo(() => 
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    if (loading) return <p>Carregando clientes...</p>;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                 <h3 className="text-2xl font-bold text-stone-800">Gerenciar Clientes</h3>
            </div>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">WhatsApp</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{user.whatsapp || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && <p className="text-center text-stone-500 py-4">Nenhum cliente encontrado.</p>}
            </div>
        </div>
    );
};

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
            case 'professionals': return <ProfessionalManagement />;
            case 'clients': return <ClientManagement />;
            default: return <DashboardOverview />;
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Painel do Administrador</h1>
                <p className="text-stone-500 mt-2 text-lg">Gerencie a plataforma, {user.name.split(' ')[0]}.</p>
            </div>

            <div className="border-b border-stone-200 flex items-center mb-6 flex-wrap">
                <TabButton tabName="overview" label="Visão Geral" icon={<EyeIcon />} />
                <TabButton tabName="professionals" label="Profissionais" icon={<UsersIcon />} />
                <TabButton tabName="clients" label="Clientes" icon={<UserIcon />} />
            </div>

            <div id="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};