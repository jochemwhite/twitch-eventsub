import { EventSubSocket } from "../src/classes/eventsub";
import { EventsubAPI } from "./classes/twitch/twitch-eventsub";

new EventSubSocket({
  connect: true,
  // url: "ws://127.0.0.1:8080/ws",
});




async function getShards(){
  const res = await EventsubAPI.getConduitShards({
    conduit_id: "d76b9935-da70-4ccb-87cd-e9e899986cc8"
  })
 res.data.map((res) => {
  console.log(res)
 })
}


// getShards()