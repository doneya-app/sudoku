import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GameStats } from './GameStats';

describe('GameStats', () => {
  it('should render timer and error count', () => {
    render(<GameStats elapsedTime={125} errorCount={3} isComplete={false} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should format time correctly', () => {
    const { rerender } = render(
      <GameStats elapsedTime={0} errorCount={0} isComplete={false} />
    );
    expect(screen.getByText('0:00')).toBeInTheDocument();

    rerender(<GameStats elapsedTime={3661} errorCount={0} isComplete={false} />);
    expect(screen.getByText('1:01:01')).toBeInTheDocument();
  });

  it('should highlight errors in red when count > 0', () => {
    const { container } = render(
      <GameStats elapsedTime={0} errorCount={5} isComplete={false} />
    );

    const errorText = screen.getByText('5');
    expect(errorText).toHaveClass('text-destructive');
  });

  it('should not highlight errors when count is 0', () => {
    const { container } = render(
      <GameStats elapsedTime={0} errorCount={0} isComplete={false} />
    );

    const errorText = screen.getByText('0');
    expect(errorText).not.toHaveClass('text-destructive');
  });

  it('should show restart button when onRestartTimer is provided', () => {
    const mockRestart = vi.fn();
    render(
      <GameStats
        elapsedTime={120}
        errorCount={3}
        isComplete={false}
        onRestartTimer={mockRestart}
      />
    );

    expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
  });

  it('should not show restart button when onRestartTimer is not provided', () => {
    render(<GameStats elapsedTime={120} errorCount={3} isComplete={false} />);

    expect(screen.queryByRole('button', { name: /restart/i })).not.toBeInTheDocument();
  });

  it('should not show restart button when game is complete', () => {
    const mockRestart = vi.fn();
    render(
      <GameStats
        elapsedTime={120}
        errorCount={3}
        isComplete={true}
        onRestartTimer={mockRestart}
      />
    );

    expect(screen.queryByRole('button', { name: /restart/i })).not.toBeInTheDocument();
  });

  it('should call onRestartTimer when restart button is clicked', async () => {
    const user = userEvent.setup();
    const mockRestart = vi.fn();

    render(
      <GameStats
        elapsedTime={120}
        errorCount={3}
        isComplete={false}
        onRestartTimer={mockRestart}
      />
    );

    const restartButton = screen.getByRole('button', { name: /restart/i });
    await user.click(restartButton);

    expect(mockRestart).toHaveBeenCalledTimes(1);
  });

  it('should display timer with tabular-nums class', () => {
    render(<GameStats elapsedTime={125} errorCount={3} isComplete={false} />);

    const timerElement = screen.getByText('2:05');
    expect(timerElement).toHaveClass('tabular-nums');
  });

  it('should display errors with tabular-nums class', () => {
    render(<GameStats elapsedTime={0} errorCount={99} isComplete={false} />);

    const errorElement = screen.getByText('99');
    expect(errorElement).toHaveClass('tabular-nums');
  });
});
