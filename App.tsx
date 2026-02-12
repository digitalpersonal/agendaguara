
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Ref para evitar múltiplas buscas de perfil simultâneas
  const isFetchingProfile = useRef(false);

  const fetchProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user || isFetchingProfile.current) return;
    
    isFetchingProfile.current = true;
    setFetchError(null);
    
    try {
      const data = await withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Profile not created yet");
        return data;
      }, 5, 500);

      if (data) {
        if (currentSession.user.email === 'digitalpersonal@gmail.com') {
          data.role = 'admin';
        }
        
        if (data.role === 'professional') {
          const professionalUser: ProfessionalUser = {
            id: data.id,
            name: data.name || currentSession.user.email?.split('@')[0] || 'Profissional',
            email: currentSession.user.email!,
            imageUrl: data.image_url || `https://i.pravatar.cc/150?u=${currentSession.user.id}`,
            coverImageUrl: data.cover_image_url,
            role: 'professional',
            whatsapp: data.whatsapp,
            specialties: data.specialty || [],
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
        } else if (data.role === 'admin') {
            setCurrentUser(data as AdminUser);
        } else {
          setCurrentUser(data as User);
        }
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      const isAborted = error.message?.toLowerCase().includes('aborted');
      
      setFetchError(isAborted 
          ? "A conexão foi interrompida. Por favor, tente atualizar a página."
          : error.message === 'Failed to fetch' 
            ? "Falha ao conectar com o servidor. O projeto Supabase pode estar pausado." 
            : "Não conseguimos localizar seu perfil no banco de dados.");
      
      setCurrentUser(null);
    } finally {
      isFetchingProfile.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchProfile(session);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN' && session) {
        fetchProfile(session);
      }
      if (_event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
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
        return { ...prevUser, ...updatedFields } as any;
    });
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center bg-stone-50 min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
            <p className="text-stone-500 font-medium animate-pulse text-sm">Sincronizando com Guaranésia...</p>
        </div>
      );
    }

    if (fetchError) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
                <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl max-w-md">
                    <h2 className="text-xl font-bold text-stone-800 mb-2">Conexão Necessária</h2>
                    <p className="text-stone-500 text-sm mb-6">{fetchError}</p>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-rose-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100"
                        >
                            Atualizar Página
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="text-stone-400 text-xs hover:text-stone-600 underline py-2"
                        >
                            Fazer login novamente
                        </button>
                    </div>
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
