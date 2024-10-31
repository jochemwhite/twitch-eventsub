import { Elysia } from "elysia";
import { EventSubSocket } from "../src/classes/eventsub";
import { cors } from '@elysiajs/cors';
import swagger from "@elysiajs/swagger";
import { WorkflowController } from "./controllers/workflows";
import twitchAPI from "./classes/twitch";

new EventSubSocket({
  connect: true,
  // url: "ws://127.0.0.1:8080/ws",
});

const app = new Elysia()
  .use(swagger())
  .use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }))
  .use(WorkflowController)
  app
  .listen(8080, () => {
    console.log("server started on port 8000");
  });




// async function main() {
//   const res = await twitchAPI.createAppToken();
//   console.log(res);
// }

// main();