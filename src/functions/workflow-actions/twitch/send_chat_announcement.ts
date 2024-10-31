import { twitchChat } from "@/classes/twitch/twitch-chat";
import checkVariable from "@/functions/check-variable";
import { replaceWords } from "@/functions/replace-variables";
import type { ActionsParams } from "@/types/workflow";


export default async function sendChatAnnouncement({ metaData, prevResponses, broadcaster_id }: ActionsParams): Promise<void> {
  if (!metaData) {
    console.error("No metadata provided for send_chat_message action");
    return;
  }

  // check for variables in the message
  const messageArray = checkVariable(metaData.message);

 
  const new_message_array = replaceWords(messageArray, prevResponses);
  const new_message = new_message_array.join(" ");


  const res = await twitchChat.sendChatAnnouncement(broadcaster_id, {
    message: new_message,
    color: "primary"
  });
  return res
}