import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';
import { dataAdapter } from '../../config/adapterFactory';

jest.mock('../../config/adapterFactory');

describe('useChat', () => {
  it('should load messages on mount', async () => {
    const mockMessages = [
      { id: '1', content: 'Hello', senderId: 'user1', createdAt: new Date() },
    ];

    (dataAdapter.subscribeToChatMessages as jest.Mock).mockImplementation(
      (roomId, callback) => {
        callback(mockMessages);
        return jest.fn();
      }
    );

    const { result } = renderHook(() => useChat('room1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toEqual(mockMessages);
  });

  it('should send message', async () => {
    const { result } = renderHook(() => useChat('room1'));

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(dataAdapter.sendMessage).toHaveBeenCalledWith(
      'room1',
      expect.objectContaining({
        content: 'Test message',
      })
    );
  });
});
