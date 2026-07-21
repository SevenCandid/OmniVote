import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseInput } from '../../components/ui/BaseInput';

describe('BaseInput Component', () => {
  it('renders input field correctly with standard properties', () => {
    render(<BaseInput placeholder="Enter username" />);
    const input = screen.getByPlaceholderText(/enter username/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('bg-white');
  });

  it('renders label text when label prop is provided', () => {
    render(<BaseInput label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('displays validation error message and applies error class rules', () => {
    render(<BaseInput error="Invalid characters entered" />);
    const errorMessage = screen.getByText('Invalid characters entered');
    const input = screen.getByRole('textbox');

    expect(errorMessage).toBeInTheDocument();
    expect(input).toHaveClass('border-danger');
  });

  it('triggers onChange and updates value when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<BaseInput placeholder="Type here" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/type here/i);

    await user.type(input, 'h');
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
