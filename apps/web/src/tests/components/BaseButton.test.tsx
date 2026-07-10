import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseButton } from '../../components/ui/BaseButton';

describe('BaseButton Component', () => {
  it('renders with children and default primary styles', () => {
    render(<BaseButton>Click Me</BaseButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('renders different size classes based on size prop', () => {
    const { rerender } = render(<BaseButton size="sm">Small</BaseButton>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('px-4');

    rerender(<BaseButton size="lg">Large</BaseButton>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-8');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<BaseButton onClick={handleClick}>Click</BaseButton>);
    
    const button = screen.getByRole('button', { name: /click/i });
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading spinner and is disabled when isLoading is true', () => {
    render(<BaseButton isLoading>Submit</BaseButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<BaseButton disabled>Unavailable</BaseButton>);
    const button = screen.getByRole('button', { name: /unavailable/i });
    expect(button).toBeDisabled();
  });
});
