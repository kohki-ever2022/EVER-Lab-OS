// src/hooks/useReservationActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { useReservationActions } from './useReservationActions';
import { IDataAdapter } from '../adapters/IDataAdapter';
import { createWrapper } from '../services/reportAggregator.test'; // Import shared wrapper
import { Role, RoleCategory, User, Language, Reservation, ReservationStatus, WaitlistEntry } from '../types';

// Mock Dependencies
const mockAdapter: IDataAdapter = {
  createReservation: vi.fn(),
  updateReservation: vi.fn(),
  createUsage: vi.fn(),
} as any;

const mockSetWaitlist = vi.fn();

const mockCurrentUser: User = { id: 'user-1', name: 'Test User', email: 'test@test.com', companyId: 'company-a', role: Role.Researcher, roleCategory: RoleCategory.Tenant };
const mockReservations: Reservation[] = [
    { id: 'res-1', userId: 'user-1', equipmentId: 'eq-1', startTime: new Date(), endTime: new Date(), status: ReservationStatus.AwaitingCheckIn, actualStartTime: new Date() } as Reservation,
];


describe('useReservationActions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  const wrapper = createWrapper({
    adapter: mockAdapter,
    sessionContextValue: { currentUser: mockCurrentUser, isTenantStaff: true },
    labStateContextValue: { setWaitlist: mockSetWaitlist },
    reservations: mockReservations,
  });

  it('should add a reservation successfully', async () => {
    const newReservation: Omit<Reservation, 'id'> = {
      userId: 'user-1',
      equipmentId: 'eq-2',
      startTime: new Date(),
      endTime: new Date(),
      status: ReservationStatus.AwaitingCheckIn,
    };
    (mockAdapter.createReservation as any).mockResolvedValue({ success: true, data: { ...newReservation, id: 'res-2' } });

    const { result } = renderHook(() => useReservationActions(), { wrapper });
    
    let actionResult;
    await act(async () => {
      actionResult = await result.current.addReservation(newReservation);
    });

    expect(mockAdapter.createReservation).toHaveBeenCalledWith(newReservation);
    expect(actionResult).toEqual({ success: true, data: { ...newReservation, id: 'res-2' } });
  });

  it('should update a reservation successfully', async () => {
    const reservationToUpdate = { ...mockReservations[0], status: ReservationStatus.CheckedIn };
    (mockAdapter.updateReservation as any).mockResolvedValue({ success: true, data: reservationToUpdate });

    const { result } = renderHook(() => useReservationActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.updateReservation(reservationToUpdate);
    });

    expect(mockAdapter.updateReservation).toHaveBeenCalledWith(reservationToUpdate);
    expect(actionResult).toEqual({ success: true, data: reservationToUpdate });
  });

  it('should check out a reservation and create a usage record', async () => {
    const reservationToCheckOut = mockReservations[0];
    const updatedReservation = { ...reservationToCheckOut, status: ReservationStatus.Completed, actualEndTime: expect.any(Date) };
    const expectedUsage = expect.objectContaining({
        userId: reservationToCheckOut.userId,
        equipmentId: reservationToCheckOut.equipmentId,
        reservationId: reservationToCheckOut.id,
        durationMinutes: expect.any(Number),
    });

    (mockAdapter.updateReservation as any).mockResolvedValue({ success: true, data: updatedReservation });
    (mockAdapter.createUsage as any).mockResolvedValue({ success: true, data: { id: 'usage-1', ...expectedUsage } });

    const { result } = renderHook(() => useReservationActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.checkOutReservation(reservationToCheckOut.id);
    });

    expect(mockAdapter.updateReservation).toHaveBeenCalledWith(updatedReservation);
    expect(mockAdapter.createUsage).toHaveBeenCalledWith(expect.objectContaining({
        userId: reservationToCheckOut.userId,
        equipmentId: reservationToCheckOut.equipmentId,
    }));
    expect(actionResult?.success).toBe(true);
  });

  it('should add an item to the waitlist', async () => {
    const { result } = renderHook(() => useReservationActions(), { wrapper });
    
    let actionResult;
    await act(async () => {
        actionResult = await result.current.addToWaitlist('eq-1', new Date(), new Date());
    });

    expect(mockSetWaitlist).toHaveBeenCalled();
    expect(actionResult?.success).toBe(true);
    expect((actionResult as any).data).toEqual(expect.objectContaining({
        equipmentId: 'eq-1',
        userId: mockCurrentUser.id,
        status: 'Pending',
    }));
  });
});