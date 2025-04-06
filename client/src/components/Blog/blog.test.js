import React from 'react';
import { render, screen } from '@testing-library/react';
import PostCreation from './blog'; // Adjusted to the correct path
import { BrowserRouter } from 'react-router-dom';


// Minimal localStorage mock
beforeEach(() => {
  localStorage.setItem("currentUser", JSON.stringify({ userId: "123" }));


  // Minimal fetch mock
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});


test('renders SkillSwap title', () => {
  render(
    <BrowserRouter>
      <PostCreation />
    </BrowserRouter>
  );
  // Check if the title is in the document
  expect(screen.getByText(/Welcome to SkillSwap Discussions/i)).toBeInTheDocument();
});


test('renders Create a Post button', () => {
  render(
    <BrowserRouter>
      <PostCreation />
    </BrowserRouter>
  );
  // Check if the button is in the document
  expect(screen.getByText(/Create a Post/i)).toBeInTheDocument();
});
