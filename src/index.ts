import {EventSubSocket} from "../src/classes/eventsub"
import {EventsubAPI} from "../src/classes/twitch-eventsub"


// const X = await EventsubAPI.createEventSubSubscription({
//   condition: {
//     broadcaster_user_id: "122604941",
//     user_id: "122604941",	
//   },
//   transport: {
//     method: "conduit",
//     conduit_id: "d76b9935-da70-4ccb-87cd-e9e899986cc8",
//   },
//   type: "channel.chat.message",
//   version: "1",
// })

// console.log(X)

const eventsub = new EventSubSocket({
  connect: true,
  // url: "ws://127.0.0.1:8080/ws",
});



