import { twitchChat } from "@/classes/twitch/twitch-chat";
import { WorkflowError } from "@/classes/workflow-error";
import getValueByUUID from "@/functions/get_value_by_uuid";
import type { ActionsParams } from "@/types/workflow";

export default async function send_shoutout({ metaData, broadcaster_id, prevResponses }: ActionsParams) {
  if (!metaData || !metaData.user_id) throw new WorkflowError("Missing user_id", true);

  // const user_id = replaceWords(metaData.user_id, prevResponses)

  const split = metaData.user_id.split(":");
  const node_id = split[0];
  const key = split[1];

  // console.log(node_id, key)


  const user_id = getValueByUUID(prevResponses, node_id, key);

  if (!user_id) throw new Error("missing user_id");

  try {
    await twitchChat.sendShoutout(broadcaster_id, user_id, broadcaster_id);
  } catch (error: any) {
    if (error.response.data.status === 429) {
      throw new WorkflowError(
        "The broadcaster exceeded the number of Shoutouts they may send within a given window. See the endpoint's Rate Limits.",
        false
      );
    } else if (error.response.data.status === 400) {
      if (error.response.data.message === "The broadcaster may not give themselves a Shoutout.") {
        throw new WorkflowError("The broadcaster may not give themselves a Shoutout.", false);
      } else if (error.response.data.message === "The broadcaster is not streaming live or does not have one or more viewers.") {
        throw new WorkflowError("The broadcaster is not streaming live or does not have one or more viewers.", false);
      } else {
        throw new WorkflowError(error.response.data.message, true);
      }
    } else {
      throw new WorkflowError("Failed to send a shoutout", true, error);
    }
  }
}
