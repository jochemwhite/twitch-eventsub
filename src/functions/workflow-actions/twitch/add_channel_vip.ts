import { TwitchChannel } from "@/classes/twitch/twitch-channel";
import { twitchChat } from "@/classes/twitch/twitch-chat";
import { WorkflowError } from "@/classes/workflow-error";
import getValueByUUID from "@/functions/get_value_by_uuid";
import type { ActionsParams } from "@/types/workflow";

export default async function add_channel_vip({ metaData, broadcaster_id, prevResponses }: ActionsParams) {
  if (!metaData) throw new Error("no meta data found");

  // const user_id = replaceWords(metaData.user_id, prevResponses)

  const split = metaData.user_id.split(":");
  const node_id = split[0];
  const key = split[1];

  const user_id = getValueByUUID(prevResponses, node_id, key);

  if (!user_id) throw new Error("missing user_id");

  try {
    await TwitchChannel.add_vip(broadcaster_id, user_id);
  } catch (error: any) {
    if (error.response.data.status === 422) {
      twitchChat.sendMessage({
        broadcaster_id,
        sender_id: broadcaster_id,
        message: "You're already a VIP or a moderator",
      });

      throw new WorkflowError("User is already a VIP or a moderator", false)

    }
    else{
      throw new WorkflowError("Failed to add new vip", true, error)
    }
  }
}
