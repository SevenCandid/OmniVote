import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrganizationForm } from './OrganizationForm';

describe('OrganizationForm Component', () => {
  it('renders form fields correctly', () => {
    const mockOnSubmit = vi.fn();
    render(<OrganizationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Organization Name *')).toBeInTheDocument();
    expect(screen.getByText('Unique Slug *')).toBeInTheDocument();
    expect(screen.getByText('Contact Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save organization/i })).toBeInTheDocument();
  });

  it('shows validation errors when required fields are empty on submit', async () => {
    const mockOnSubmit = vi.fn();
    render(<OrganizationForm onSubmit={mockOnSubmit} />);

    const form = screen.getByRole('button', { name: /save organization/i }).closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText(/name must be at least/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/slug must be at least/i).length).toBeGreaterThan(0);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', async () => {
    const mockOnSubmit = vi.fn();
    render(<OrganizationForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. Acme Corp'), { target: { value: 'Test Org' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. acme-corp'), { target: { value: 'test-org' } });
    fireEvent.change(screen.getByPlaceholderText('admin@acme.com'), { target: { value: 'test@example.com' } });

    const form = screen.getByRole('button', { name: /save organization/i }).closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Org',
        slug: 'test-org',
        contact_email: 'test@example.com',
      }), expect.anything());
    });
  });
});
