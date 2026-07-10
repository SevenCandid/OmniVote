import React from 'react';
import { useLocation } from 'react-router-dom';
import { render, screen } from '../utils/custom-render';

const PathDisplay = () => {
  const location = useLocation();
  return <div data-testid="route-test">Route path is: {location.pathname}</div>;
};

describe('Routing Placeholder Test', () => {
  it('renders a simple route context check', () => {
    render(<PathDisplay />, { route: '/elections' });
    expect(screen.getByTestId('route-test')).toHaveTextContent('Route path is: /elections');
  });
});
