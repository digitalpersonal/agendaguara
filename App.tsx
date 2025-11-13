import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ProfessionalDashboard } from './pages/ProfessionalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import type { User, ProfessionalUser, AdminUser } from './types';
import { supabase } from './utils/supabase';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | ProfessionalUser | AdminUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setCurrentUser(null);
      } else if (data) {
        // Force admin role for specific email
        if (session.user.email === 'digitalpersonal@gmail.com') {
          data.role = 'admin';
        }
        
        if (data.role === 'professional') {
          // Ensure professional users have default settings if none exist
          const professionalUser: ProfessionalUser = {
            id: data.id,
            name: data.name || session.user.email?.split('@')[0] || 'Profissional',
            email: session.user.email!,
            imageUrl: data.image_url || `https://i.pravatar.cc/150?u=${session.user.id}`,
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
          };
          setCurrentUser(professionalUser);
        } else {
          setCurrentUser(data);
        }
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
      return <div className="flex-grow flex items-center justify-center"><p>Carregando...</p></div>;
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
      <Footer />
      {isAuthModalOpen && (
        <AuthModal 
          onClose={handleCloseAuthModal}
        />
      )}
    </div>
  );
};

export default App;