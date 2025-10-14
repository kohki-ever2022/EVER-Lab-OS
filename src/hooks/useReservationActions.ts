// src/hooks/useReservationActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useLabStateContext } from '../contexts/AppProviders';
import { useSessionContext } from '../contexts/SessionContext';
// FIX: import from barrel file
import { Reservation, ReservationStatus, Usage, WaitlistEntry, WaitlistStatus } from '../types';
// FIX: import from barrel file
import { Result } from '../types';
import { useReservationContext } from '../contexts/ReservationContext';

export const useReservationActions = () => {
    const adapter = useDataAdapter();
    const { reservations } = useReservationContext();
    const { setWaitlist } = useLabStateContext();
    const { currentUser } = useSessionContext();

    const addReservation = useCallback(async (reservation: Omit<Reservation, 'id'>): Promise<Result<Reservation, Error>> => {
        return adapter.createReservation(reservation);
    }, [adapter]);

    const updateReservation = useCallback(async (reservation: Reservation): Promise<Result<Reservation, Error>> => {
        return adapter.updateReservation(reservation);
    }, [adapter]);

    const checkOutReservation = useCallback(async (reservationId: string): Promise<Result<Usage, Error>> => {
        const reservation = reservations.find(r => r.id === reservationId);
        if (!reservation || !reservation.actualStartTime) {
            return { success: false, error: new Error('Invalid reservation or not checked in.') };
        }

        const actualEndTime = new Date();
        const durationMinutes = (actualEndTime.getTime() - new Date(reservation.actualStartTime).getTime()) / 60000;
        
        const updatedReservation: Reservation = {
            ...reservation,
            status: ReservationStatus.Completed,
            actualEndTime,
        };
        const updateResResult = await adapter.updateReservation(updatedReservation);
        if (updateResResult.success === false) {
             return { success: false, error: updateResResult.error };
        }

        const usage: Omit<Usage, 'id'> = {
            userId: reservation.userId,
            equipmentId: reservation.equipmentId,
            reservationId,
            durationMinutes: Math.max(0, durationMinutes),
            date: new Date(),
            projectId: reservation.projectId,
        };
        
        return adapter.createUsage(usage);
    }, [adapter, reservations]);
    
    const addToWaitlist = useCallback(async (equipmentId: string, requestedStartTime: Date, requestedEndTime: Date): Promise<Result<WaitlistEntry, Error>> => {
        if (!currentUser) return { success: false, error: new Error("Not logged in") };
        const newEntry: WaitlistEntry = {
            id: `waitlist-${Date.now()}`,
            userId: currentUser.id,
            equipmentId,
            requestedStartTime,
            requestedEndTime,
            createdAt: new Date(),
            status: WaitlistStatus.Pending,
        };
        setWaitlist(prev => [...prev, newEntry]); // Mock behavior
        return { success: true, data: newEntry };
    }, [currentUser, setWaitlist]);

    const removeFromWaitlist = useCallback(async (waitlistId: string): Promise<Result<void, Error>> => {
        setWaitlist(prev => prev.filter(w => w.id !== waitlistId)); // Mock behavior
        return { success: true, data: undefined };
    }, [setWaitlist]);
    
    return useMemo(() => ({ addReservation, updateReservation, checkOutReservation, addToWaitlist, removeFromWaitlist }), [addReservation, updateReservation, checkOutReservation, addToWaitlist, removeFromWaitlist]);
};