import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

export const renderWithRouter = (ui: React.ReactElement, route = "") => {
  window.history.pushState({}, "Test page", route);

  return render(ui, { wrapper: MemoryRouter });
};
