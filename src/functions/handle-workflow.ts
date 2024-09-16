import { twitchChat } from "@/classes/twitch/twitch-chat";
import { supabase } from "@/lib/supabase";
import type { EventSubNotificationPayload } from "@/types/eventsub";
import type { Action, EditorNodeType, Metadata } from "@/types/workflow";
import WorkflowActions from "./handle-workflow-actions";
import { WorkflowError } from "@/classes/workflow-error";

interface Event {
  event: EventSubNotificationPayload;
}

export default async function HandleWorkflow({ event }: Event): Promise<void> {
  let event_id: string | null = null;

  if (event.event.reward) {
    event_id = event.event.reward.id;
  }

  const broadcaster_id: string = event.event.broadcaster_user_id ?? event.event.to_broadcaster_user_id;

  const eventFilter = event_id ? `event_id.eq.${event_id}` : "event_id.is.null";

  const { data, error } = await supabase
    .from("workflow_triggers")
    .select("*, workflow(nodes, name, publish, id)")
    .eq("event_type", event.subscription.type)
    .or(eventFilter);

  if (error) {
    if (error.code === "PGRST116") {
      // console.log(`No workflow found for ${event.subscription.type} with event_id ${event_id}`);
      return;
    }

    console.error("Error fetching workflow");
    return;
  }

  if (!data || data.length === 0) return;

  await Promise.allSettled(
    data.map(async (item) => {
      // @ts-ignore
      if (!item.workflow.publish) return;

      // @ts-ignore
      let nodes: EditorNodeType[] = JSON.parse(item.workflow.nodes as string);
      // console.log(nodes)

      // @ts-ignore
      return RunWorkflow(nodes, broadcaster_id, event.event, item.workflow.id, item.workflow.name);
    })
  );

  // console.log(workflow_results);
}

export async function RunWorkflow(
  nodes: EditorNodeType[],
  broadcaster_id: string,
  eventDetails: [key: string],
  workflow_id: string,
  workflow_name: string
) {
  console.log("workflow id", workflow_id);

  let node_errors: Metadata = {};

  let responseData: Metadata = {};

  const trigger_id = nodes[0].data.id;

  responseData[trigger_id] = eventDetails;

  // remove everything that in the node except the data object
  const actions: Action[] = nodes.filter((node) => node.type !== "Trigger").map((node) => node.data as Action);

  for (let index = 0; index < actions.length; index++) {
    const action = actions[index];

    const handler = WorkflowActions[action.type];

    if (!handler) {
      console.error(`Handler not found for ${action.type}`);
      continue;
    }

    try {
      const response = await handler({
        metaData: action.metaData,
        prevResponses: responseData,
        broadcaster_id,
      });
      if (response) {
        responseData[action.id] = response;
      }
    } catch (error: any) {
      if (error instanceof WorkflowError) {
        node_errors[action.id] = {
          error: error.message,
          shouldTurnOffWorkflow: error.shouldTurnOffWorkflow,
          originalError: error.originalError,
        };

        if (!error.shouldTurnOffWorkflow) break;
        else {
          await HandleWorkFlowError(broadcaster_id, workflow_id, workflow_name);
          break;
        }
      } else {
        await HandleWorkFlowError(broadcaster_id, workflow_id, workflow_name);
        node_errors[action.id] = {
          error: error.message,
          shouldTurnOffWorkflow: true,
          originalError: error,
        };
        break;
      }
    }

    continue;
  }

  return { responseData, node_errors };
}

async function HandleWorkFlowError(broadcaster_id: string, workflow_id: string, workflow_name: string) {
  console.log("turning off workflow");

  try {
    await twitchChat.sendMessage({
      broadcaster_id: broadcaster_id,
      message: `An error occurred while processing the workflow: ${workflow_name} - turning off the workflow`,
      sender_id: broadcaster_id,
    });
  } catch (error) {
    console.log(error);
  }

  const { data, error } = await supabase
    .from("workflows")
    .update({
      publish: false,
    })
    .eq("id", workflow_id);
}
