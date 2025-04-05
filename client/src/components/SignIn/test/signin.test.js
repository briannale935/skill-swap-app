// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import SignIn from "../SignIn";
// import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../../firebase";

// // Mock global fetch to prevent "fetch is not defined" errors
// global.fetch = jest.fn((url) => {
//   if (url.includes("/api/register")) {
//     return Promise.resolve({
//       json: () => Promise.resolve({ message: "User registered successfully!", userId: "mockUserId" }),
//     });
//   } else if (url.includes("/api/user/id")) {
//     return Promise.resolve({
//       json: () => Promise.resolve({ userId: "mockUserId" }),
//     });
//   }
//   return Promise.reject(new Error("Unknown API endpoint"));
// });

// // Mock Firebase authentication methods
// jest.mock("../../firebase", () => ({
//   auth: { currentUser: { uid: "testUser123", email: "test@example.com" } },
//   signInWithEmailAndPassword: jest.fn(() =>
//     Promise.resolve({ user: { uid: "testUser123", email: "test@example.com" } })
//   ),
//   createUserWithEmailAndPassword: jest.fn(() =>
//     Promise.resolve({ user: { uid: "testUser456", email: "newuser@example.com" } })
//   ),
// }));

// describe("SignIn Component", () => {
//   test("renders email and password input fields", () => {
//     render(<SignIn onLogin={jest.fn()} />);

//     expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
//     expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
//   });

//   test("updates email and password fields correctly", () => {
//     render(<SignIn onLogin={jest.fn()} />);

//     const emailInput = screen.getByLabelText(/Email/i);
//     const passwordInput = screen.getByLabelText(/Password/i);

//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "password123" } });

//     expect(emailInput.value).toBe("test@example.com");
//     expect(passwordInput.value).toBe("password123");
//   });

//   test("registers a new user successfully", async () => {
//     const mockOnLogin = jest.fn();
//     render(<SignIn onLogin={mockOnLogin} />);

//     const toggleButton = screen.getByRole("button", { name: /New user\? Sign Up/i });
//     fireEvent.click(toggleButton);

//     const emailInput = screen.getByLabelText(/Email/i);
//     const passwordInput = screen.getByLabelText(/Password/i);
//     const signUpButton = screen.getByRole("button", { name: /Sign Up/i });

//     fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "newpassword" } });

//     fireEvent.click(signUpButton);

//     // Wait for Firebase user creation
//     await waitFor(() => expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1));
//     expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, "newuser@example.com", "newpassword");

//     // Ensure API call to register user is made
//     await waitFor(() => expect(fetch).toHaveBeenCalledWith(
//       "/api/register",
//       expect.objectContaining({
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ firebase_uid: "testUser456", email: "newuser@example.com" }),
//       })
//     ));

//     // Ensure onLogin callback was triggered
//     await waitFor(() => expect(mockOnLogin).toHaveBeenCalledTimes(1));
//   });
// });
