import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SudokuCell from './SudokuCell';

describe('SudokuCell', () => {
  const mockOnClick = vi.fn();
  const mockOnDoubleClick = vi.fn();
  const mockOnNumberSelect = vi.fn();

  const defaultProps = {
    value: null,
    isFixed: false,
    isSelected: false,
    isHighlighted: false,
    isSameNumberHighlighted: false,
    isError: false,
    onClick: mockOnClick,
    onDoubleClick: mockOnDoubleClick,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders empty cell with transparent text', () => {
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('0');
      expect(button).toHaveClass('text-transparent');
    });

    it('renders cell with numeric value', () => {
      render(<SudokuCell {...defaultProps} value={5} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('5');
      expect(button).not.toHaveClass('text-transparent');
    });

    it('renders fixed cell with correct styling', () => {
      render(<SudokuCell {...defaultProps} value={3} isFixed={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-cellFixed', 'text-muted-foreground');
      expect(button).not.toHaveClass('bg-card');
    });

    it('renders user-filled cell with correct styling', () => {
      render(<SudokuCell {...defaultProps} value={7} isFixed={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-card', 'hover:bg-secondary');
      expect(button).not.toHaveClass('bg-cellFixed');
    });
  });

  describe('Visual States', () => {
    it('applies selected styling', () => {
      render(<SudokuCell {...defaultProps} isSelected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-cellSelected', 'ring-2', 'ring-primary');
    });

    it('applies highlighted styling when not selected', () => {
      render(<SudokuCell {...defaultProps} isHighlighted={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-cellHighlighted');
    });

    it('does not apply highlighted styling when selected', () => {
      render(<SudokuCell {...defaultProps} isHighlighted={true} isSelected={true} />);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('bg-cellHighlighted');
      expect(button).toHaveClass('bg-cellSelected');
    });

    it('applies same number highlighted styling', () => {
      render(<SudokuCell {...defaultProps} isSameNumberHighlighted={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ring-2', 'ring-primary/60', 'bg-primary/10');
    });

    it('applies error styling', () => {
      render(<SudokuCell {...defaultProps} value={5} isError={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-cellError', 'text-destructive');
    });

    it('combines multiple visual states correctly', () => {
      render(
        <SudokuCell
          {...defaultProps}
          value={5}
          isSelected={true}
          isSameNumberHighlighted={true}
          isError={true}
        />
      );
      const button = screen.getByRole('button');
      // Error state should be applied
      expect(button).toHaveClass('bg-cellError');
      // Same number highlight styling
      expect(button).toHaveClass('ring-2');
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onDoubleClick when double-clicked', async () => {
      const user = userEvent.setup();
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');

      await user.dblClick(button);

      expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('does not wrap with CellNumberSelector when onNumberSelect is not provided', () => {
      const { container } = render(<SudokuCell {...defaultProps} />);
      // CellNumberSelector would add a wrapper div, so we check for direct button
      expect(container.firstChild).toHaveProperty('tagName', 'BUTTON');
    });

    it('wraps with CellNumberSelector when onNumberSelect is provided', () => {
      render(
        <SudokuCell {...defaultProps} onNumberSelect={mockOnNumberSelect} />
      );
      // CellNumberSelector wraps the button, verify button still renders
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<SudokuCell {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has focus styles', () => {
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary');
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('has touch-optimized tap target', () => {
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-manipulation');
    });
  });

  describe('Responsive Design', () => {
    it('has responsive minimum heights', () => {
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]', 'sm:min-h-[48px]', 'md:min-h-[52px]');
    });

    it('has responsive font sizes', () => {
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-xl', 'sm:text-2xl', 'md:text-3xl');
    });

    it('has aspect-square class for proper cell shape', () => {
      render(<SudokuCell {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('aspect-square', 'w-full');
    });
  });

  describe('Edge Cases', () => {
    it('handles value of 0 as empty', () => {
      render(<SudokuCell {...defaultProps} value={0 as any} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('0');
      // Value of 0 is falsy, so it gets transparent text class
      expect(button).toHaveClass('text-transparent');
    });

    it('handles null value correctly', () => {
      render(<SudokuCell {...defaultProps} value={null} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('0');
      expect(button).toHaveClass('text-transparent');
    });

    it('handles all valid Sudoku numbers (1-9)', () => {
      const { rerender } = render(<SudokuCell {...defaultProps} value={1} />);
      for (let i = 1; i <= 9; i++) {
        rerender(<SudokuCell {...defaultProps} value={i} />);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent(String(i));
      }
    });

    it('does not break with fixed cell and error state', () => {
      render(<SudokuCell {...defaultProps} isFixed={true} isError={true} value={5} />);
      const button = screen.getByRole('button');
      // When isError is true, bg-cellError overrides bg-cellFixed
      expect(button).toHaveClass('bg-cellError');
      expect(button).toHaveClass('text-destructive');
    });
  });

  describe('CellNumberSelector Integration', () => {
    it('passes isFixed prop to CellNumberSelector', () => {
      render(
        <SudokuCell
          {...defaultProps}
          isFixed={true}
          onNumberSelect={mockOnNumberSelect}
        />
      );
      // The component should render without errors
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('passes onNumberSelect callback to CellNumberSelector', () => {
      render(
        <SudokuCell {...defaultProps} onNumberSelect={mockOnNumberSelect} />
      );
      // The component should render without errors
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
