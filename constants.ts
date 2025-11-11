import type { Service, Plan } from './types';

// These could also be fetched from Supabase in the future
export const beautyServices: Service[] = [
    { id: 'b1', name: 'Corte de Cabelo', duration: 60, price: 80 },
    { id: 'b2', name: 'Manicure & Pedicure', duration: 90, price: 120 },
    { id: 'b3', name: 'Limpeza de Pele', duration: 75, price: 150 },
];

export const healthServices: Service[] = [
    { id: 'h1', name: 'Sessão de Fisioterapia', duration: 50, price: 180 },
    { id: 'h2', name: 'Consulta Nutricional', duration: 60, price: 250 },
    { id: 'h3', name: 'Massagem Relaxante', duration: 60, price: 200 },
];

export const petServices: Service[] = [
    { id: 'p1', name: 'Banho & Tosa', duration: 120, price: 100 },
    { id: 'p2', name: 'Consulta Veterinária', duration: 45, price: 180 },
    { id: 'p3', name: 'Adestramento Básico', duration: 60, price: 220 },
];

export const plans: Plan[] = [
  {
    id: 'plan1',
    name: 'Básico',
    price: 'R$ 29/mês',
    features: [
      'Agendamentos ilimitados',
      'Página de perfil básica',
      'Suporte por e-mail',
    ],
    highlight: false,
  },
  {
    id: 'plan2',
    name: 'Profissional',
    price: 'R$ 59/mês',
    features: [
      'Tudo do plano Básico',
      'Página de perfil personalizável',
      'Lembretes por SMS',
      'Suporte prioritário',
    ],
    highlight: true,
  },
  {
    id: 'plan3',
    name: 'Business',
    price: 'R$ 99/mês',
    features: [
      'Tudo do plano Profissional',
      'Relatórios e análises',
      'Múltiplos profissionais',
      'Integrações',
    ],
    highlight: false,
  },
];
