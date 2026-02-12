
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ProfessionalDashboard } from './pages/ProfessionalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ReminderSystem } from './components/ReminderSystem';
import { InstallPrompt } from './components/InstallPrompt';
import type { User, ProfessionalUser, AdminUser } from './types';
import { supabase, withRetry } from './utils/supabase';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | ProfessionalUser | AdminUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (session: Session | null) => {
    if (session?.user) {
      setFetchError(null);
      try {
        const data = await withRetry(async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          return data;
        });

        if (data) {
          // Force admin role for specific email
          if (session.user.email === 'digitalpersonal@gmail.com') {
            data.role = 'admin';
          }
          
          if (data.role === 'professional') {
            const professionalUser: ProfessionalUser = {
              id: data.id,
              name: data.name || session.user.email?.split('@')[0] || 'Profissional',
              email: session.user.email!,
              imageUrl: data.image_url || `https://i.pravatar.cc/150?u=${session.user.id}`,
              coverImageUrl: data.cover_image_url,
              role: 'professional',
              whatsapp: data.whatsapp,
              specialties: data.specialty || [{ name: 'Especialista em Destaque', price: 0 }],
              services: data.services || [],
              settings: data.settings || {
                workHours: { start: '09:00', end: '18:00' },
                workDays: [1, 2, 3, 4, 5],
                blockedDays: [],
                blockedTimeSlots: {},
              },
              bio: data.bio
            };
            setCurrentUser(professionalUser);
          } else {
            setCurrentUser(data);
          }
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setFetchError(error.message === 'Failed to fetch' 
            ? "Falha ao conectar com o servidor. Tente atualizar a página." 
            : "Ocorreu um erro ao carregar seu perfil.");
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        fetchProfile(session);
      }
      if (_event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);
  
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const handleOpenAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);
  
  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleProfileUpdate = useCallback((updatedFields: Partial<User | ProfessionalUser>) => {
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser, ...updatedFields };
        if (newUser.role === 'professional') {
            return newUser as ProfessionalUser;
        }
        return newUser as User;
    });
  }, []);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center bg-stone-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
            <p className="text-stone-500 font-medium animate-pulse">Iniciando AgendaGuara...</p>
        </div>
      );
    }

    if (fetchError) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 p-8 rounded-2xl border border-red-100 max-w-sm">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Ops! Algo deu errado</h2>
                    <p className="text-red-600 text-sm mb-6">{fetchError}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                    >
                        Atualizar Página
                    </button>
                </div>
            </div>
        )
    }

    if (!currentUser) {
      return <LandingPage user={null} onLoginRequired={handleOpenAuthModal} />;
    }
    
    if (currentUser.role === 'admin') {
      return <AdminDashboard user={currentUser as AdminUser} />;
    }

    if (currentUser.role === 'professional') {
      return <ProfessionalDashboard user={currentUser as ProfessionalUser} onProfileUpdate={handleProfileUpdate} />;
    }
    return <Dashboard user={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col">
      <Header 
        user={currentUser} 
        onLoginClick={handleOpenAuthModal}
        onSignUpClick={handleOpenAuthModal}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer onSignUpClick={handleOpenAuthModal} />
      {currentUser && <ReminderSystem user={currentUser} />}
      <InstallPrompt />
      {isAuthModalOpen && (
        <AuthModal 
          onClose={handleCloseAuthModal}
        />
      )}
    </div>
  );
};

export default App;
