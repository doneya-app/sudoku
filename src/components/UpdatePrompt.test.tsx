import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import UpdatePrompt from './UpdatePrompt';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

describe('UpdatePrompt', () => {
  const mockUpdateServiceWorker = vi.fn();
  const mockSetNeedRefresh = vi.fn();
  let mockRegistration: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock registration object
    mockRegistration = {
      update: vi.fn(),
      installing: null,
      waiting: null,
      active: null,
    };

    // Default mock implementation - no update needed
    (useRegisterSW as any).mockReturnValue({
      needRefresh: [false, mockSetNeedRefresh],
      updateServiceWorker: mockUpdateServiceWorker,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should render without crashing', () => {
    render(<UpdatePrompt />);
    // Component returns null, so we just verify it doesn't throw
    expect(true).toBe(true);
  });

  it('should not show toast when needRefresh is false', () => {
    render(<UpdatePrompt />);
    expect(toast).not.toHaveBeenCalled();
  });

  it('should show toast when needRefresh becomes true', async () => {
    const { rerender } = render(<UpdatePrompt />);

    // Simulate needRefresh becoming true
    (useRegisterSW as any).mockReturnValue({
      needRefresh: [true, mockSetNeedRefresh],
      updateServiceWorker: mockUpdateServiceWorker,
    });

    rerender(<UpdatePrompt />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalled();
    });

    // Verify toast was called with correct configuration
    const toastCall = (toast as any).mock.calls[0];
    expect(toastCall[1]).toMatchObject({
      duration: Infinity,
    });
    expect(toastCall[1].action).toBeDefined();
    expect(toastCall[1].cancel).toBeDefined();
  });

  it('should call updateServiceWorker when Update button is clicked', async () => {
    (useRegisterSW as any).mockReturnValue({
      needRefresh: [true, mockSetNeedRefresh],
      updateServiceWorker: mockUpdateServiceWorker,
    });

    render(<UpdatePrompt />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalled();
    });

    // Get the action onClick callback
    const toastCall = (toast as any).mock.calls[0];
    const actionOnClick = toastCall[1].action.onClick;

    // Simulate clicking the Update button
    actionOnClick();

    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true);
    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
  });

  it('should call setNeedRefresh(false) when Later button is clicked', async () => {
    (useRegisterSW as any).mockReturnValue({
      needRefresh: [true, mockSetNeedRefresh],
      updateServiceWorker: mockUpdateServiceWorker,
    });

    render(<UpdatePrompt />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalled();
    });

    // Get the cancel onClick callback
    const toastCall = (toast as any).mock.calls[0];
    const cancelOnClick = toastCall[1].cancel.onClick;

    // Simulate clicking the Later button
    cancelOnClick();

    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
    expect(mockUpdateServiceWorker).not.toHaveBeenCalled();
  });

  it('should set up update check interval when service worker is registered', () => {
    vi.useFakeTimers();

    let onRegisteredCallback: ((registration: any) => void) | undefined;

    (useRegisterSW as any).mockImplementation((options: any) => {
      onRegisteredCallback = options.onRegistered;
      return {
        needRefresh: [false, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      };
    });

    render(<UpdatePrompt />);

    // Simulate service worker registration
    expect(onRegisteredCallback).toBeDefined();
    onRegisteredCallback!(mockRegistration);

    // Fast-forward time by 1 hour
    vi.advanceTimersByTime(60 * 60 * 1000);

    // Verify update was called
    expect(mockRegistration.update).toHaveBeenCalledTimes(1);

    // Fast-forward another hour
    vi.advanceTimersByTime(60 * 60 * 1000);

    expect(mockRegistration.update).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('should handle registration error gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let onRegisterErrorCallback: ((error: Error) => void) | undefined;

    (useRegisterSW as any).mockImplementation((options: any) => {
      onRegisterErrorCallback = options.onRegisterError;
      return {
        needRefresh: [false, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      };
    });

    render(<UpdatePrompt />);

    const testError = new Error('Registration failed');
    expect(onRegisterErrorCallback).toBeDefined();
    onRegisterErrorCallback!(testError);

    expect(consoleErrorSpy).toHaveBeenCalledWith('SW registration error', testError);

    consoleErrorSpy.mockRestore();
  });

  it('should not set up interval if registration is null', () => {
    vi.useFakeTimers();

    let onRegisteredCallback: ((registration: any) => void) | undefined;

    (useRegisterSW as any).mockImplementation((options: any) => {
      onRegisteredCallback = options.onRegistered;
      return {
        needRefresh: [false, mockSetNeedRefresh],
        updateServiceWorker: mockUpdateServiceWorker,
      };
    });

    render(<UpdatePrompt />);

    // Simulate registration with null
    expect(onRegisteredCallback).toBeDefined();
    onRegisteredCallback!(null);

    // Fast-forward time by 1 hour
    vi.advanceTimersByTime(60 * 60 * 1000);

    // Verify update was NOT called (since registration was null)
    expect(mockRegistration.update).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should only show toast once for the same needRefresh state', async () => {
    (useRegisterSW as any).mockReturnValue({
      needRefresh: [true, mockSetNeedRefresh],
      updateServiceWorker: mockUpdateServiceWorker,
    });

    const { rerender } = render(<UpdatePrompt />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledTimes(1);
    });

    // Rerender with same state
    rerender(<UpdatePrompt />);

    // Toast should not be called again
    expect(toast).toHaveBeenCalledTimes(1);
  });
});
