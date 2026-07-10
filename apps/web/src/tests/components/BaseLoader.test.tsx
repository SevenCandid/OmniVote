import React from 'react';
import { render, screen } from '@testing-library/react';
import { BaseLoader } from '../../components/ui/BaseLoader';

describe('BaseLoader Component', () => {
  it('renders loading text correctly', () => {
    render(<BaseLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
