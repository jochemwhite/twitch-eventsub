import { z } from "zod";

const envSchema = z.object({
  // twitch
  TWITCH_CLIENT_ID: z.string(),
  TWITCH_CLIENT_SECRET: z.string(),
  TWITCH_APP_TOKEN: z.string(),
  EVENTSUB_URL: z.string(),
  CONDUIT_ID: z.string(),
  SHARD_ID: z.string().min(1),
  TWITCH_BOT_ID: z.string(),

  //supabase 
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
});

export const env = envSchema.parse(process.env);


