import { Elysia, t } from "elysia";

export const supabaseJWTMiddleware = new Elysia()
  .onRequest(({ request, set }) => {
    const supabasejwt = request.headers.get('authorization');
    if (!supabasejwt) {
      set.status = 401;
      return { error: "Unauthorized: Missing supabase jwt header" };
    }
  });