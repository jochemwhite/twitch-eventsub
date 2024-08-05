import { ChannelPointsAPI } from "@/classes/twitch/twitch-channelpoints";
import type { EventSubNotificationPayload } from "@/types/eventsub";
import type { CustomRewardRequest } from "@/types/twitchAPI";
import type { Metadata } from "@/types/workflow";

type ActionsParams = {
  eventDetails: EventSubNotificationPayload;
  metaData?: Metadata;
  prevResponses?: Metadata;
};

export default async function updateCustomReward({ metaData, prevResponses, eventDetails }: ActionsParams): Promise<unknown> {
  const { event } = eventDetails;
  if (!metaData) {
    console.error("No metadata provided for custom_reward_update action");
    return;
  }

  const old_channelpoint = await ChannelPointsAPI.getCustomRewardById(event.broadcaster_user_id, metaData.reward_id);

  if (!old_channelpoint) {
    console.error("Could not find the custom reward to update");
    return;
  }

  let new_cost = old_channelpoint.cost;
  if (metaData.cost.startsWith("+")) {
    new_cost += parseInt(metaData.cost.replace("+", ""));
  } else if (metaData.cost.startsWith("-")) {
    new_cost -= parseInt(metaData.cost.replace("-", ""));
  } else if (metaData.cost.startsWith(":")) {
    new_cost = Math.floor(new_cost / parseInt(metaData.cost.replace(":", "")));
  } else if (metaData.cost.startsWith("*")) {
    new_cost *= parseInt(metaData.cost.replace("*", ""));
  } else {
    new_cost = parseInt(metaData.cost);
  }

  let new_reward: CustomRewardRequest = {
    title: old_channelpoint.title,
    cost: new_cost,
  };
  return await ChannelPointsAPI.updateCustomReward(event.broadcaster_user_id, metaData.reward_id, new_reward);
}
