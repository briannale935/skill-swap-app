import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../index";

// Mock useNavigate BEFORE the mock block
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock Firebase signIn
const mockSignIn = jest.fn();
jest.mock("../../Firebase/firebase", () => ({
  FirebaseAuth: {
    signIn: (...args) => mockSignIn(...args),
  },
}));

describe("Login Component", () => {
  const setAuthUser = jest.fn();

  const setup = () => {
    render(
      <MemoryRouter>
        <Login setAuthUser={setAuthUser} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form inputs and login button", () => {
    setup();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("updates form inputs correctly", () => {
    setup();

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    fireEvent.change(email, { target: { value: "user@example.com" } });
    fireEvent.change(password, { target: { value: "secret123" } });

    expect(email).toHaveValue("user@example.com");
    expect(password).toHaveValue("secret123");
  });

  it("calls FirebaseAuth.signIn and navigates on success", async () => {
    const mockUser = { uid: "123", email: "user@example.com" };
    mockSignIn.mockResolvedValueOnce({ user: mockUser });

    setup();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("user@example.com", "secret123");
      expect(setAuthUser).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message when login fails", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Login failed"));

    setup();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "fail@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });
});
