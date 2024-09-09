import { twitchChat } from "@/classes/twitch/twitch-chat";
import { WorkflowError } from "@/classes/workflow-error";
import getValueByUUID from "@/functions/get_value_by_uuid";
import type { ActionsParams } from "@/types/workflow";

export default async function send_shoutout({metaData, broadcaster_id, prevResponses}: ActionsParams){
  if (!metaData) throw new Error("no meta data found");

  // const user_id = replaceWords(metaData.user_id, prevResponses)

  const split = metaData.user_id.split(":");
  const node_id = split[0];
  const key = split[1];

  const user_id = getValueByUUID(prevResponses, node_id, key);

  if (!user_id) throw new Error("missing user_id");

  try {
    await twitchChat.sendShoutout(broadcaster_id, user_id, broadcaster_id);
  } catch (error: any) {
    if (error.response.data.status === 429 ) {
      twitchChat.sendMessage({
        broadcaster_id,
        sender_id: broadcaster_id,
        message: "The broadcaster exceeded the number of Shoutouts they may send within a given window. See the endpoint's Rate Limits.",
      });

      throw new WorkflowError("The broadcaster exceeded the number of Shoutouts they may send within a given window. See the endpoint's Rate Limits.", false)

    }
    else{
      throw new WorkflowError("Failed to send a shoutout", true, error)
    }
  }





}