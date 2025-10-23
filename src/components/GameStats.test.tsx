import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStats } from './GameStats';

describe('GameStats', () => {
  it('should render timer and error count by default', () => {
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
    render(
      <GameStats elapsedTime={0} errorCount={5} isComplete={false} />
    );

    const errorText = screen.getByText('5');
    expect(errorText).toHaveClass('text-destructive');
  });

  it('should not highlight errors when count is 0', () => {
    render(
      <GameStats elapsedTime={0} errorCount={0} isComplete={false} />
    );

    const errorText = screen.getByText('0');
    expect(errorText).not.toHaveClass('text-destructive');
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

  describe('showTimer prop', () => {
    it('should hide timer when showTimer is false', () => {
      render(
        <GameStats
          elapsedTime={125}
          errorCount={3}
          isComplete={false}
          showTimer={false}
        />
      );

      expect(screen.queryByText('2:05')).not.toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // errors still visible
    });

    it('should show timer when showTimer is true', () => {
      render(
        <GameStats
          elapsedTime={125}
          errorCount={3}
          isComplete={false}
          showTimer={true}
        />
      );

      expect(screen.getByText('2:05')).toBeInTheDocument();
    });
  });

  describe('showErrors prop', () => {
    it('should hide errors when showErrors is false', () => {
      render(
        <GameStats
          elapsedTime={125}
          errorCount={3}
          isComplete={false}
          showErrors={false}
        />
      );

      expect(screen.queryByText('3')).not.toBeInTheDocument();
      expect(screen.getByText('2:05')).toBeInTheDocument(); // timer still visible
    });

    it('should show errors when showErrors is true', () => {
      render(
        <GameStats
          elapsedTime={125}
          errorCount={3}
          isComplete={false}
          showErrors={true}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('when both stats are hidden', () => {
    it('should return null when both showTimer and showErrors are false', () => {
      const { container } = render(
        <GameStats
          elapsedTime={125}
          errorCount={3}
          isComplete={false}
          showTimer={false}
          showErrors={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('default prop values', () => {
    it('should default to showing both timer and errors', () => {
      render(
        <GameStats elapsedTime={125} errorCount={3} isComplete={false} />
      );

      expect(screen.getByText('2:05')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
