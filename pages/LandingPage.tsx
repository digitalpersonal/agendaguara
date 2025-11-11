import React, { useState, useCallback } from 'react';
import { Hero } from '../components/Hero';
import { ServiceCategories } from '../components/ServiceCategories';
import { FeaturedProfessionals } from '../components/FeaturedProfessionals';
import { Testimonials } from '../components/Testimonials';
import { BookingModal } from '../components/BookingModal';
import type { Professional, User, ProfessionalUser } from '../types';

interface LandingPageProps {
  user: User | ProfessionalUser | null;
  onLoginRequired: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, onLoginRequired }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  const handleOpenModal = useCallback((professional: Professional) => {
    if (!user) {
      onLoginRequired();
    } else {
      setSelectedProfessional(professional);
      setIsModalOpen(true);
    }
  }, [user, onLoginRequired]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProfessional(null);
  }, []);

  return (
    <>
      <Hero />
      <ServiceCategories />
      <FeaturedProfessionals onScheduleClick={handleOpenModal} />
      <Testimonials />
      {isModalOpen && selectedProfessional && user && (
        <BookingModal
          professional={selectedProfessional}
          user={user}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
