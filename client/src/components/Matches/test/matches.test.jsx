import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Matches from '../index';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Matches Component', () => {
  // Sample data for tests
  const mockPendingRequests = [
    {
      id: 'req1',
      sender_name: 'John Doe',
      sender_skill: 'JavaScript',
      requested_skill: 'Python',
      time_availability: 'Weekends'
    }
  ];

  const mockAcceptedMatches = [
    {
      id: 'match1',
      name: 'Alice Johnson',
      skill: 'Node.js',
      location: 'Online',
      time_availability: 'Mornings',
      email: 'alice@example.com'
    }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockReset();
    localStorageMock.getItem.mockReset();
    
    // Mock localStorage to return a user
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'currentUser') {
        return JSON.stringify({ userId: '123' });
      }
      return null;
    });
    
    // Mock successful fetch for matches
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        pending: mockPendingRequests,
        accepted: mockAcceptedMatches
      })
    });
  });

  // Test 1: Basic rendering test
  test('renders the component with headings', async () => {
    render(<Matches />);
    
    // Wait for component to load data
    await waitFor(() => {
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('Accepted Matches')).toBeInTheDocument();
    });
  });

  // Test 2: Check if pending requests are displayed
  test('displays pending requests', async () => {
    render(<Matches />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
  });

  // Test 3: Check if accepted matches are displayed
  test('displays accepted matches', async () => {
    render(<Matches />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
  });

  // Test 4: Test empty states
  test('shows "No pending requests" when there are no pending requests', async () => {
    // Override the default mock for this test
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        pending: [],
        accepted: mockAcceptedMatches
      })
    });
    
    render(<Matches />);
    
    await waitFor(() => {
      expect(screen.getByText('No pending requests')).toBeInTheDocument();
    });
  });

  test('shows "No accepted matches" when there are no accepted matches', async () => {
    // Override the default mock for this test
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        pending: mockPendingRequests,
        accepted: []
      })
    });
    
    render(<Matches />);
    
    await waitFor(() => {
      expect(screen.getByText('No accepted matches')).toBeInTheDocument();
    });
  });

  // Test 5: Test accepting a request
  test('handles accepting a request', async () => {
    // Set up mocks for the accept API call
    fetch.mockImplementation((url) => {
      if (url.includes('/api/matches/accept/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            message: 'Skill swap request accepted successfully!',
            email: 'john@example.com'
          })
        });
      }
      
      // Default response for the initial data fetch
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          pending: mockPendingRequests,
          accepted: mockAcceptedMatches
        })
      });
    });
    
    render(<Matches />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the Accept button
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);
    
    // Verify the API was called correctly
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/matches/accept/req1'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  // Test 6: Test rejecting a request
  test('handles rejecting a request', async () => {
    // Set up mocks for the reject API call
    fetch.mockImplementation((url) => {
      if (url.includes('/api/matches/reject/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Skill swap request rejected.' })
        });
      }
      
      // Default response for the initial data fetch
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          pending: mockPendingRequests,
          accepted: mockAcceptedMatches
        })
      });
    });
    
    render(<Matches />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the Reject button
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    // Verify the API was called correctly
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/matches/reject/req1'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  // Test 7: Test error handling
  test('handles fetch errors gracefully', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Make fetch throw an error
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Matches />);
    
    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});