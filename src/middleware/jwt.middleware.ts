import { Elysia, t } from "elysia";

// export const supabaseJWT = new Elysia()
//   .onRequest(({ request, set }) => {
//     const supabasejwt = request.headers.get('supabasejwt');
//     if (!supabasejwt) {
//       set.status = 401;
//       return { error: "Unauthorized: Missing supabase jwt header" };
//     }
//   });