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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingContext, setBookingContext] = useState<{ professional?: Professional | null; category?: string | null }>({});

  const handleScheduleFromProfessional = useCallback((professional: Professional) => {
    if (!user) {
      onLoginRequired();
    } else {
      setBookingContext({ professional });
      setIsBookingModalOpen(true);
    }
  }, [user, onLoginRequired]);

  const handleScheduleFromCategory = useCallback((categoryName: string) => {
    if (!user) {
      onLoginRequired();
    } else {
      setBookingContext({ category: categoryName });
      setIsBookingModalOpen(true);
    }
  }, [user, onLoginRequired]);

  const handleCloseModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setBookingContext({});
  }, []);

  return (
    <>
      <Hero />
      <ServiceCategories onCategoryClick={handleScheduleFromCategory} />
      <FeaturedProfessionals onScheduleClick={handleScheduleFromProfessional} />
      <Testimonials />
      {isBookingModalOpen && user && (
        <BookingModal
          professional={bookingContext.professional}
          category={bookingContext.category}
          user={user}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};