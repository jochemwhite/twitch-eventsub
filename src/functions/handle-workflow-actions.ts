import get_ad_schedule from "./workflow-actions/twitch/get_ad_schedule";
import sendChatAnnouncement from "./workflow-actions/twitch/send_chat_announcement";
import sendChatMessage from "./workflow-actions/twitch/send_chat_message";
import updateCustomReward from "./workflow-actions/twitch/update_custom_reward";

interface WorkflowActions {
  send_chat_message: typeof sendChatMessage;
  custom_reward_update: typeof updateCustomReward;
  get_ad_schedule: typeof get_ad_schedule
  send_chat_announcement: typeof sendChatAnnouncement
}

const WorkflowActions: WorkflowActions = {
  send_chat_message: sendChatMessage,
  send_chat_announcement: sendChatAnnouncement,
  custom_reward_update: updateCustomReward,  
  get_ad_schedule: get_ad_schedule
};

export default WorkflowActions;
