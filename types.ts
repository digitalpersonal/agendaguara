
export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface Specialty {
  name: string;
  price: number;
}

export interface Professional {
  id: string;
  name: string;
  specialties: Specialty[];
  rating?: number;
  imageUrl: string;
  coverImageUrl?: string; // Novo campo
  services: Service[];
  settings?: ProfessionalSettings;
  bio?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  imageUrl: string;
}

export interface Plan {
  id:string;
  name: string;
  price: string;
  features: string[];
  highlight: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: 'client' | 'professional' | 'admin';
  whatsapp?: string;
}

export interface ProfessionalSettings {
  workHours: { start: string; end: string; };
  workDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  blockedDays: string[]; // YYYY-MM-DD
  blockedTimeSlots: { [date: string]: string[] };
}

export interface ProfessionalUser extends User {
  role: 'professional';
  specialties: Specialty[];
  services: Service[];
  settings: ProfessionalSettings;
  bio?: string;
  coverImageUrl?: string; // Novo campo
}

export interface AdminUser extends User {
  role: 'admin';
}

export interface Appointment {
  id: string;
  service_name: string;
  professional_id: string; // Added to help filter financials
  professional_name: string;
  professional_image_url: string;
  client_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  pet_name?: string;
  pet_breed?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}
