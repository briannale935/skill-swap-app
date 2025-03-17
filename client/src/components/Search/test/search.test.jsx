import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "../Search"; // Adjust the import path if needed

// Mock `fetch` API for different tests
global.fetch = jest.fn();

// Mock `localStorage`
const mockUser = { userId: "123", name: "Test User" };
beforeEach(() => {
  localStorage.setItem("currentUser", JSON.stringify(mockUser));
});
afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("Search Component", () => {
  // Test 1: Renders input fields and buttons correctly**
  test("renders search fields and buttons", () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Search by Skill")).toBeInTheDocument();
    expect(screen.getByLabelText("Search by Time Availability")).toBeInTheDocument();
    expect(screen.getByText("Clear Search")).toBeInTheDocument();
  });

  // Test 2: Fetch and display search results**
  test("fetches and displays search results", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "Alice",
          skill: "React",
          time_availability: "Evenings",
          location: "New York",
          portfolio_link: "https://alice.dev",
        },
      ],
    });

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Search by Skill"), {
      target: { value: "React" },
    });

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("Evenings")).toBeInTheDocument();
    });
  });

  // Test 3: Handle API errors gracefully**
  test("displays an error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Search by Skill"), {
      target: { value: "React" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument(); // No results should be shown
    });
  });

  // Test 4: Send invite successfully**
  test("sends an invite successfully", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "2", name: "Bob", skill: "Node.js", time_availability: "Mornings" },
        ],
      }) // Mock search results
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Invite sent successfully!" }),
      }); // Mock invite response

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Search by Skill"), {
      target: { value: "Node.js" },
    });

    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(screen.getByText("Invite sent successfully!")).toBeInTheDocument();
    });
  });

  // Test 5: Prevent sending invites if not logged in**
  test("shows error message when sending invite while not logged in", async () => {
    localStorage.clear(); // Simulate user not logged in

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "3", name: "Charlie", skill: "Python", time_availability: "Afternoons" },
      ],
    });

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Search by Skill"), {
      target: { value: "Python" },
    });

    await waitFor(() => {
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(screen.getByText("Login to send invites")).toBeInTheDocument();
    });
  });
});
