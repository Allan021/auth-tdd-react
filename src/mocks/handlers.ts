import { rest } from "msw";

//enpoints
export const handlers = [
  // Handles a POST /login request
  rest.post("/login", (req, res, ctx) => {
    // Persist user's authentication in the session
    localStorage.setItem("is-authenticated", "true");
    return res(
      // Respond with a 200 status code
      ctx.status(200)
    );
  }),
];
