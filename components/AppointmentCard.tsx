import React from 'react';
import type { Appointment } from '../types';

interface AppointmentCardProps {
    appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
    const appointmentDate = new Date(appointment.date + 'T00:00:00');
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-shadow hover:shadow-sm">
            <img 
                src={appointment.professional_image_url}
                alt={appointment.professional_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 flex-shrink-0"
            />
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-stone-800">{appointment.service_name}</h3>
                <p className="text-sm text-stone-600">com {appointment.professional_name}</p>
                <p className="text-sm text-stone-500 mt-1 capitalize">{formattedDate} às {appointment.time}</p>
            </div>
            <div className="text-right sm:ml-4 flex-shrink-0">
                <p className="font-bold text-lg text-rose-600">R$ {appointment.price.toFixed(2)}</p>
                {appointment.status === 'upcoming' && (
                     <button className="mt-1 text-xs text-stone-500 hover:text-red-500 transition-colors">Cancelar</button>
                )}
            </div>
        </div>
    );
};
