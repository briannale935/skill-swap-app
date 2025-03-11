import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PostCreation from '../blog';

// Suppress React Router warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes('React Router')) return;
  originalConsoleWarn(...args);
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('PostCreation Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const renderComponent = async () => {
    // Mock initial posts fetch
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );

    const result = render(
      <BrowserRouter>
        <PostCreation />
      </BrowserRouter>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/posts');
    });

    return result;
  };

  const openTagSelect = async () => {
    const selectElement = screen.getByLabelText('Tag');
    fireEvent.mouseDown(selectElement);
    // Wait for the menu to be in the document
    await waitFor(() => {
      expect(document.querySelector('.MuiMenu-list')).toBeInTheDocument();
    });
  };

  const selectTag = async (tagValue) => {
    await openTagSelect();
    const options = screen.getAllByRole('option');
    const option = options.find(opt => opt.textContent === tagValue);
    fireEvent.click(option);
  };

  it('renders initial state with create post button', async () => {
    await renderComponent();
    expect(screen.getByText('Welcome to SkillSwap Discussions')).toBeInTheDocument();
    expect(screen.getByText('Create a Post')).toBeInTheDocument();
  });

  it('shows form when create post button is clicked', async () => {
    await renderComponent();
    fireEvent.click(screen.getByText('Create a Post'));

    expect(screen.getByLabelText('Post Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Post Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Tag')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('displays validation errors when submitting empty form', async () => {
    await renderComponent();
    fireEvent.click(screen.getByText('Create a Post'));
    fireEvent.click(screen.getByText('Submit Post'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Content is required')).toBeInTheDocument();
      expect(screen.getByText('Please select a tag')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('successfully submits a post with valid data', async () => {
    const mockPostResponse = { postId: 1 };
    
    // Mock API calls
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPostResponse)
      }));

    await renderComponent();
    
    // Open form
    fireEvent.click(screen.getByText('Create a Post'));

    // Fill form
    await userEvent.type(screen.getByLabelText('Post Title'), 'Test Post');
    await userEvent.type(screen.getByLabelText('Post Content'), 'Test Content');
    await userEvent.type(screen.getByLabelText('Name'), 'Test User');
    await selectTag('Technology');

    // Submit form
    fireEvent.click(screen.getByText('Submit Post'));

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Post Submitted Successfully!')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify API call
    expect(fetch).toHaveBeenCalledWith('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 1,
        title: 'Test Post',
        content: 'Test Content',
        name: 'Test User',
        tag: 'Technology'
      })
    });
  }, 15000); // Increase test timeout

  it('handles API error when submitting post', async () => {
    // Mock API calls
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Failed to create post'))
      }));

    await renderComponent();
    
    // Open form
    fireEvent.click(screen.getByText('Create a Post'));

    // Fill form
    await userEvent.type(screen.getByLabelText('Post Title'), 'Test Post');
    await userEvent.type(screen.getByLabelText('Post Content'), 'Test Content');
    await userEvent.type(screen.getByLabelText('Name'), 'Test User');
    await selectTag('Technology');

    // Mock console.error
    const originalError = console.error;
    const errorMock = jest.fn();
    console.error = errorMock;

    // Submit form
    fireEvent.click(screen.getByText('Submit Post'));

    // Wait for error to be logged
    await waitFor(() => {
      expect(errorMock).toHaveBeenCalled();
    });

    // Restore console.error
    console.error = originalError;
  });

  it('displays fetched posts', async () => {
    const mockPosts = [{
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      name: 'Test User',
      created_at: new Date().toISOString()
    }];

    // Mock fetch before rendering
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts)
      })
    );

    await act(async () => {
      render(
        <BrowserRouter>
          <PostCreation />
        </BrowserRouter>
      );
    });

    // First verify the fetch was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/posts');
    });

    // Then verify the posts are displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Post' })).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('By: Test User', { exact: false })).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 