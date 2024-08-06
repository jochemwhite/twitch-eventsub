import { twitchChat } from "@/classes/twitch/twitch-chat";
import { supabase } from "@/lib/supabase";
import type { EventSubNotificationPayload } from "@/types/eventsub";
import type { Action, Metadata } from "@/types/workflow";
import WorkflowActions from "./handle-workflow-actions";

interface Event {
  event: EventSubNotificationPayload;
}

// Example of workflow type
interface Workflow {
  type: string;
  data: Action;
}

export default async function HandleWorkflow({ event }: Event): Promise<void> {
  let event_id: string | null = null;

  // check if the event is a chat message
  if (event.subscription.type === "channel.chat.message") {
    return;
  }

  if (event.event.reward) {
    event_id = event.event.reward.id;
  }

  const eventFilter = event_id ? `event_id.eq.${event_id}` : "event_id.is.null";

  const { data, error } = await supabase
    .from("workflow_triggers")
    .select("*, workflow(nodes, name)")
    .eq("event_type", event.subscription.type)
    .or(eventFilter)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // console.log(`No workflow found for ${event.subscription.type} with event_id ${event_id}`);
      return;
    }

    console.error("Error fetching workflow");
    return;
  }

  if (!data || !data.workflow) return;

  // @ts-ignore
  let workflow: EditorNodeType[] = JSON.parse(data.workflow.nodes as string);
  let responseData: Metadata = {};

  const trigger_id = workflow[0].data.id;

  console.log(`Trigger ID: ${trigger_id}`);

  responseData[trigger_id] = event.event;

  // remove everything that in the node except the data object
  const actions: Action[] = workflow.filter((node) => node.type !== "Trigger").map((node) => node.data as Action);

  for (let index = 0; index < actions.length; index++) {
    const action = actions[index];

    const handler = WorkflowActions[action.type];

    if (!handler) {
      console.error(`Handler not found for ${action.type}`);
      continue;
    }

    try {
      const response = await handler({
        eventDetails: event,
        metaData: action.metaData,
        prevResponses: responseData,
      });
      if (response) {
        responseData[action.id] = response;
      }
    } catch (error: any) {
      await twitchChat.sendMessage({
        broadcaster_id: event.event.broadcaster_user_id,
        // @ts-ignore
        message: `An error occurred while processing the workflow: ${data.workflow.name} - turning off the workflow`,
        sender_id: event.event.broadcaster_user_id,
      });
    }

    continue;
  }
}
