import React from 'react';
import { render, screen } from '@testing-library/react';
import { BaseBadge } from '../../components/ui/BaseBadge';

describe('BaseBadge Component', () => {
  it('renders children correctly', () => {
    render(<BaseBadge>Active</BaseBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(
      <BaseBadge variant="success">Active</BaseBadge>
    );
    expect(screen.getByText('Active')).toHaveClass('text-emerald-600');

    rerender(<BaseBadge variant="danger">Inactive</BaseBadge>);
    expect(screen.getByText('Inactive')).toHaveClass('text-red-600');
  });
});
