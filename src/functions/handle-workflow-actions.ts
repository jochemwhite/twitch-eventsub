import type { EventSubNotificationPayload } from "@/types/eventsub";
import type { Metadata } from "@/types/workflow";
import sendChatMessage from "./workflow-actions/twitch/send_chat_message";
import updateCustomReward from "./workflow-actions/twitch/update_custom_reward";

interface WorkflowActions {
  send_chat_message: typeof sendChatMessage;
  custom_reward_update: typeof updateCustomReward;
}

const WorkflowActions: WorkflowActions = {
  send_chat_message: sendChatMessage,
  custom_reward_update: updateCustomReward,
};

export default WorkflowActions;
