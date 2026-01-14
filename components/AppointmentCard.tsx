
import React, { useState } from 'react';
import type { Appointment } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';

interface AppointmentCardProps {
    appointment: Appointment;
    onUpdate: (updatedAppointment: Appointment) => void;
}

const StatusBadge: React.FC<{ status: Appointment['status'] }> = ({ status }) => {
    const statusInfo = {
        completed: { text: 'Concluído', style: 'bg-green-100 text-green-800' },
        cancelled: { text: 'Cancelado', style: 'bg-stone-200 text-stone-600' }
    };
    const info = statusInfo[status as keyof typeof statusInfo];
    if (!info) return null;
    return (
        <span className={`mt-1 text-xs font-semibold px-2 py-1 rounded-full ${info.style}`}>
            {info.text}
        </span>
    )
 }

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onUpdate }) => {
    const [isCancelling, setIsCancelling] = useState(false);

    const appointmentDate = new Date(appointment.date + 'T00:00:00');
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleCancel = async () => {
        if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        
        setIsCancelling(true);
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', appointment.id)
            .select()
            .single();
        
        if (error) {
            alert('Não foi possível cancelar o agendamento.');
            console.error('Error cancelling appointment:', error);
        } else if (data) {
            onUpdate(data as Appointment);
        }
        setIsCancelling(false);
    };

    const hasValidImage = appointment.professional_image_url && appointment.professional_image_url.startsWith('http');

    return (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex flex-col items-stretch gap-4 transition-shadow hover:shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {hasValidImage ? (
                    <img 
                        src={appointment.professional_image_url}
                        alt={appointment.professional_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 flex-shrink-0"
                    />
                ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${getColor(appointment.professional_name)} flex-shrink-0 border-2 border-stone-200`}>
                        <span className="text-xl">{getInitials(appointment.professional_name)}</span>
                    </div>
                )}
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-stone-800">{appointment.service_name}</h3>
                    <p className="text-sm text-stone-600">com {appointment.professional_name}</p>
                    <p className="text-sm text-stone-500 mt-1 capitalize">{formattedDate} às {appointment.time}</p>
                </div>
                <div className="text-right sm:ml-4 flex-shrink-0 self-start sm:self-center">
                    <p className="font-bold text-lg text-rose-600">R$ {appointment.price.toFixed(2)}</p>
                    {appointment.status === 'upcoming' && (
                        <button 
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="mt-1 text-xs text-stone-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isCancelling ? 'Cancelando...' : 'Cancelar'}
                        </button>
                    )}
                    {appointment.status !== 'upcoming' && <StatusBadge status={appointment.status} />}
                </div>
            </div>
            {appointment.notes && (
                <div className="bg-white p-3 rounded-lg border border-dashed border-stone-200 text-sm italic text-stone-600">
                    <p className="font-bold text-xs uppercase text-stone-400 mb-1 not-italic">Observações:</p>
                    {appointment.notes}
                </div>
            )}
        </div>
    );
};
