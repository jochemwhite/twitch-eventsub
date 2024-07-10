import type { ChatMessageEvent } from "@/types/eventsub";

export async function HandleChatMessage(chatMessage: ChatMessageEvent) {
  const { chatter_user_name, broadcaster_user_name, message, message_id, broadcaster_user_id, chatter_user_id, chatter_user_login } = chatMessage;
  console.log(`[${broadcaster_user_name}] ${chatter_user_name}: ${message.text}`);
}
