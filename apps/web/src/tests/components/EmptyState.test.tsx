import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpCircle } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

describe('EmptyState Component', () => {
  it('renders title, description and icon correctly', () => {
    render(
      <EmptyState
        icon={HelpCircle}
        title="No items found"
        description="Try adjusting your filters"
      />
    );
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('renders action button and triggers callback when clicked', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={HelpCircle}
        title="Empty"
        description="Empty description"
        actionText="Create Item"
        onAction={handleAction}
      />
    );
    
    const button = screen.getByRole('button', { name: /create item/i });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
