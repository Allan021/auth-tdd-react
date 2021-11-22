import {
  RequestParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from "msw";
import {
  HTTP_INVALID_CREDENTIAL,
  HTTP_SUCCESS_STATUS,
} from "../constants/httpConstants";
import { Login } from "../interfaces/Login";

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

export const unauthorizedResolver = (
  req: RestRequest<Login, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  const { email, password } = req.body;

  if (email !== "john.doe@test.com" || password !== "Aa123456789!@#") {
    return res(
      ctx.status(HTTP_INVALID_CREDENTIAL),
      ctx.json({ message: "The email or password are not correct" })
    );
  }
  return res(ctx.status(HTTP_SUCCESS_STATUS));
};
