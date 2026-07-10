import React from 'react';
import { render, screen } from '@testing-library/react';
import { BaseCard } from '../../components/ui/BaseCard';

describe('BaseCard Component', () => {
  it('renders content correctly', () => {
    render(<BaseCard>Card Body</BaseCard>);
    expect(screen.getByText('Card Body')).toBeInTheDocument();
  });

  it('applies hoverable transition classes when hoverable prop is true', () => {
    render(<BaseCard hoverable>Card Body</BaseCard>);
    expect(screen.getByText('Card Body')).toHaveClass('hover:border-primary');
  });
});
