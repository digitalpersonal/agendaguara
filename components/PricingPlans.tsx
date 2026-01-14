
import React from 'react';
import { plans } from '../constants';
import type { Plan } from '../types';

const CheckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  const handleScrollToSignup = () => {
    const signupButton = document.getElementById('signup-trigger-button');
    if (signupButton) {
      signupButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Adiciona um efeito de pulso temporário para chamar atenção
      signupButton.classList.add('ring-4', 'ring-rose-300');
      setTimeout(() => signupButton.classList.remove('ring-4', 'ring-rose-300'), 2000);
    }
  };

  return (
    <div className="bg-white text-stone-800 shadow-2xl rounded-3xl border border-stone-100 overflow-hidden transition-transform duration-300 hover:scale-[1.02] flex flex-col md:flex-row max-w-4xl w-full">
      <div className="p-10 bg-rose-500 text-white flex flex-col justify-center items-center md:w-2/5">
        <h3 className="text-2xl font-bold mb-2 text-center uppercase tracking-widest">{plan.name}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-5xl font-black">{plan.price.split('/')[0]}</span>
          <span className="text-rose-100 ml-1">/mês</span>
        </div>
        <p className="text-rose-100 text-sm text-center">Acesso total a todas as ferramentas de gestão.</p>
      </div>
      
      <div className="p-10 flex-grow bg-white flex flex-col">
        <h4 className="font-bold text-stone-800 mb-6 text-lg">O que está incluído:</h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-stone-600 text-sm">
              <div className="bg-rose-100 rounded-full p-1 mr-3 shrink-0">
                  <CheckIcon />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto space-y-4">
            <button 
                onClick={handleScrollToSignup}
                className="w-full bg-stone-900 text-white font-black py-4 px-8 rounded-2xl hover:bg-stone-800 transition-all duration-300 transform shadow-xl shadow-stone-200"
            >
                COMEÇAR AGORA
            </button>
            <p className="text-center text-xs text-stone-400 font-medium">Sem fidelidade • Sem taxas extras • Cancele quando quiser</p>
        </div>
      </div>
    </div>
  );
};

export const PricingPlans: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-rose-500 font-bold tracking-widest text-sm uppercase mb-4 block">Transparência Total</span>
          <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-4">Investimento Único para o seu Negócio</h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Nada de letras miúdas. Um único plano com acesso ilimitado para você crescer sem preocupações.
          </p>
        </div>
        <div className="flex justify-center">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};
