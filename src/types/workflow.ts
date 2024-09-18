import type { EventSubNotificationPayload } from "./eventsub";

type TwitchTriggersTypes = "channel.channel_points_custom_reward_redemption.add";
type TwitchActionsTypes = "custom_reward_update" | "send_chat_message";

type Actions = TwitchActionsTypes;
type Triggers = TwitchTriggersTypes;

type NodeTypes = "Action" | "Trigger";

export type Metadata = Record<string, any>;

export type EditorCanvasCardType = {
  title: string;
  description: string;
  metadata: Metadata;
  type: Triggers | Actions;
};

export type EditorNodeType = {
  id: string;
  type: NodeTypes;
  position: {
    x: number;
    y: number;
  };
  data: Trigger | Action;
};

export type EditorActions =
  | { type: "LOAD_DATA"; payload: { nodes: EditorNodeType[]; edges: { id: string; source: string; target: string }[] } }
  | { type: "UPDATE_NODE"; payload: { nodes: EditorNodeType[] } }
  | { type: "REDO" }
  | { type: "UNDO" }
  | { type: "SELECTED_NODE"; payload: { node: EditorNodeType } }
  | { type: "UPDATE_METADATA"; payload: { id: string; metadata: Metadata } }
  | { type: "UPDATE_TRIGGER"; payload: { id: string; event_id: string } };

export type EditorCanvasDefaultCardType = {
  [provider: string]: {
    Actions: Action[];
    Triggers: Trigger[];
  };
};

export type Trigger = {
  id: string;
  title: string;
  description: string;
  type: Triggers;
  event_id: string | null;
  nodeType: NodeTypes;
  metaData?: Metadata;
};

export type Action = {
  id: string;
  title: string;
  description: string;
  type: Actions;
  nodeType: NodeTypes;
  metaData?: Metadata;
};

export type ActionsParams = {
  metaData?: Metadata;
  prevResponses: NodeReponses;
  broadcaster_id: string;
};

export interface NodeReponses {
  [uuid: string]: {
    status: string;
    message: string;
    data?: {
      [key: string]: any;
    };

    error?: any;
    started_at: string
  };
}

// export type NodeReponses = {
//   [node_id: string]: {
//     status: "success" | "error" | "warning" | "trigger";
//     message: string;
//     data?: Metadata;
//   };
// };
