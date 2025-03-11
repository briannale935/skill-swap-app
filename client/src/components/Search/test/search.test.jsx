import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Search from '../Search'; // ✅ Correct import path
import '@testing-library/jest-dom';

// Mock `fetch` globally to prevent real API calls
global.fetch = jest.fn();

describe('Search Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  function renderComponent() {
    render(<Search />);
  }

  it('renders the search form correctly', () => {
    renderComponent();

    // Ensure input fields exist
    expect(screen.getByLabelText(/skill/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time availability/i)).toBeInTheDocument();

    // Ensure search button exists
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows an alert if both inputs are empty when searching', () => {
    renderComponent();

    // Mock `window.alert`
    window.alert = jest.fn();

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(window.alert).toHaveBeenCalledWith('Please enter a skill or availability.');
  });

  it('calls API and displays results when search is successful', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/skill/i), { target: { value: 'JavaScript' } });
    fireEvent.change(screen.getByLabelText(/time availability/i), { target: { value: 'Evenings' } });

    const mockResponse = [
      { id: 1, name: 'John Doe', skill: 'JavaScript', time_availability: 'Evenings' },
      { id: 2, name: 'Jane Smith', skill: 'React', time_availability: 'Mornings' },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/users/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: 'JavaScript', timeAvailability: 'Evenings' }),
      });

      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    });
  });

  it('displays "No users found" when API returns an empty array', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/skill/i), { target: { value: 'Python' } });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce([]),
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/skill/i), { target: { value: 'C++' } });

    fetch.mockResolvedValueOnce({
      ok: false,
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });
});
