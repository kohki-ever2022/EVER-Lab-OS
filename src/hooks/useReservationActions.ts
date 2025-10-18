// src/hooks/useReservationActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { Reservation, ReservationStatus, Usage } from '../types';
import { Result } from '../types';
import { useReservations } from '../contexts/ReservationContext';
import { validateDateRange } from '../utils/validation';

export const useReservationActions = () => {
  const adapter = useDataAdapter();
  const reservations = useReservations();

  const addReservation = useCallback(
    async (
      reservation: Omit<Reservation, 'id'>
    ): Promise<Result<Reservation, Error>> => {
      try {
        validateDateRange(reservation.startTime, reservation.endTime);

        const overlapping = reservations.some(
          (r) =>
            r.equipmentId === reservation.equipmentId &&
            r.status !== ReservationStatus.Cancelled &&
            ((new Date(reservation.startTime) >= new Date(r.startTime) &&
              new Date(reservation.startTime) < new Date(r.endTime)) ||
              (new Date(reservation.endTime) > new Date(r.startTime) &&
                new Date(reservation.endTime) <= new Date(r.endTime)) ||
              (new Date(reservation.startTime) <= new Date(r.startTime) &&
                new Date(reservation.endTime) >= new Date(r.endTime)))
        );
        if (overlapping) {
          return { success: false, error: new Error('OVERLAP_ERROR') };
        }
        return adapter.createReservation(reservation);
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e : new Error(String(e)),
        };
      }
    },
    [adapter, reservations]
  );

  const updateReservation = useCallback(
    async (reservation: Reservation): Promise<Result<Reservation, Error>> => {
      return adapter.updateReservation(reservation);
    },
    [adapter]
  );

  const checkOutReservation = useCallback(
    async (reservationId: string): Promise<Result<Usage, Error>> => {
      const reservation = reservations.find((r) => r.id === reservationId);
      if (!reservation || !reservation.actualStartTime) {
        return {
          success: false,
          error: new Error('Invalid reservation or not checked in.'),
        };
      }

      const actualEndTime = new Date();
      const durationMinutes =
        (actualEndTime.getTime() -
          new Date(reservation.actualStartTime).getTime()) /
        60000;

      const updatedReservation: Reservation = {
        ...reservation,
        status: ReservationStatus.Completed,
        actualEndTime,
      };
      const updateResResult =
        await adapter.updateReservation(updatedReservation);
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
    },
    [adapter, reservations]
  );

  return useMemo(
    () => ({ addReservation, updateReservation, checkOutReservation }),
    [addReservation, updateReservation, checkOutReservation]
  );
};
