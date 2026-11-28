import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ConsultantsPage from './ConsultantsPage';
import { useSpecialties } from '../hooks/useSpecialties';

vi.mock('../hooks/useSpecialties', () => ({
  useSpecialties: vi.fn(),
}));

const retry = vi.fn();

const specialties = [
  { id: '1', name: 'Alpha', slug: 'alpha', description: 'First area.' },
  { id: '2', name: 'Beta', slug: 'beta', description: null },
  { id: '3', name: 'Gamma', slug: 'gamma', description: 'Third area.' },
];

describe('ConsultantsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows a loading state', () => {
    vi.mocked(useSpecialties).mockReturnValue({ status: 'loading', retry });

    render(<ConsultantsPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading specialties');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('lists specialties with optional descriptions', () => {
    vi.mocked(useSpecialties).mockReturnValue({
      status: 'success',
      data: specialties,
      retry,
    });

    render(<ConsultantsPage />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByText('First area.')).toBeInTheDocument();
    expect(screen.getByText('3 specialties')).toBeInTheDocument();
  });

  it('shows an empty state when there are no specialties', () => {
    vi.mocked(useSpecialties).mockReturnValue({
      status: 'success',
      data: [],
      retry,
    });

    render(<ConsultantsPage />);

    expect(screen.getByText('No specialties yet')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('shows an error state and retries', () => {
    vi.mocked(useSpecialties).mockReturnValue({
      status: 'error',
      message: 'Failed to fetch specialties: 500',
      retry,
    });

    render(<ConsultantsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'We couldn’t load the specialties',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('filters by name and description, then clears the search', () => {
    vi.mocked(useSpecialties).mockReturnValue({
      status: 'success',
      data: specialties,
      retry,
    });

    render(<ConsultantsPage />);

    const input = screen.getByRole('searchbox', { name: 'Search specialties' });

    fireEvent.change(input, { target: { value: 'third' } });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('1 specialty')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(
      screen.getByText('No specialties match your search'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
