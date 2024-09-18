import { twitchChat } from "@/classes/twitch/twitch-chat";
import { WorkflowError } from "@/classes/workflow-error";
import checkVariable from "@/functions/check-variable";
import { replaceWords } from "@/functions/replace-variables";
import type { SendChatMessageResponse } from "@/types/twitchAPI";
import type { ActionsParams } from "@/types/workflow";

export default async function sendChatMessage({ metaData, prevResponses, broadcaster_id }: ActionsParams): Promise<SendChatMessageResponse["data"]["0"]> {
  if (!metaData) {
    console.error("No metadata provided for send_chat_message action");
    throw new WorkflowError("No metadata provided for send_chat_message action", false);
  }

  // check for variables in the message
  const messageArray = checkVariable(metaData.message);

  if (!prevResponses) {
    prevResponses = {};
  }


  const new_message_array = replaceWords(messageArray, prevResponses);
  const new_message = new_message_array.join(" ");



  const res = await twitchChat.sendMessage({
    broadcaster_id: broadcaster_id,
    sender_id: broadcaster_id,
    message: new_message,
  });


  return res
}
