import React from "react";
import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { renderWithRouter } from "../utils/test";

describe("when the user is not authenticated and enters on admin page", () => {
  it("must be redirected to login page", () => {
    renderWithRouter(<AppRouter />, "/admin");
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });
});

describe("when the user is not authenticated and enters on employee page", () => {
  it("must be redirected to login page", () => {
    renderWithRouter(<AppRouter />, "/employee");
    render(
      <MemoryRouter>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });
});
