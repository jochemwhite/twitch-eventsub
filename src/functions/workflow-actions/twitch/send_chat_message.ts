import { twitchChat } from "@/classes/twitch/twitch-chat";
import checkVariable from "@/functions/check-variable";
import { replaceWords } from "@/functions/replace-variables";
import type { EventSubNotificationPayload } from "@/types/eventsub";
import type { Metadata } from "@/types/workflow";

interface sendChatMessageParams {
  metaData?: Metadata
  prevResponses?: Record<string, any>;
  eventDetails: EventSubNotificationPayload
}

export default async function sendChatMessage({ metaData, prevResponses, eventDetails }: sendChatMessageParams): Promise<void> {
  if (!metaData) {
    console.error("No metadata provided for send_chat_message action");
    return;
  }

  // check for variables in the message
  const messageArray = checkVariable(metaData.message);

  if (!prevResponses) {
    prevResponses = {};
  }
  const new_message_array = replaceWords(messageArray, prevResponses);
  const new_message = new_message_array.join(" ");


  await twitchChat.sendMessage({
    broadcaster_id: eventDetails.event.broadcaster_user_id,
    sender_id: eventDetails.event.broadcaster_user_id,
    message: new_message,
  });
  return;
}