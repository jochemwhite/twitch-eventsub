type Metadata = {
  message_id: string;
  message_type: string;
  message_timestamp: string;
};

type Session = {
  id: string;
  status: string;
  keepalive_timeout_seconds: number;
  reconnect_url: string;
  connected_at: string;
};

type WelcomeMessagePayload = {
  session: Session;
};

type KeepaliveMessagePayload = {};

type PingMessagePayload = {};

type NotificationMessagePayload = {
  subscription: {
    id: string;
    status: string;
    type: string;
    version: string;
    cost: number;
    condition: object; // Actual structure depends on subscription type
    transport: {
      method: string;
      session_id: string;
    };
    created_at: string;
  };
  event: object; // Actual structure depends on subscription type
};

type ReconnectMessagePayload = {
  session: Session;
};

type RevocationMessagePayload = {
  subscription: {
    id: string;
    status: string;
    type: string;
    version: string;
    cost: number;
    condition: object; // Actual structure depends on subscription type
    transport: {
      method: string;
      session_id: string;
    };
    created_at: string;
  };
};

export type CloseMessagePayload = {
  code: number;
  reason: string;
};

export type WebSocketMessage =
  | { metadata: Metadata; payload: WelcomeMessagePayload }
  | { metadata: Metadata; payload: KeepaliveMessagePayload }
  | { metadata: Metadata; payload: PingMessagePayload }
  | { metadata: Metadata; payload: NotificationMessagePayload }
  | { metadata: Metadata; payload: ReconnectMessagePayload }
  | { metadata: Metadata; payload: RevocationMessagePayload }
  | { metadata: Metadata; payload: CloseMessagePayload };

export type EventSubNotification = {
  metadata: {
    message_id: string;
    message_type: string;
    message_timestamp: string;
    subscription_type: string;
    subscription_version: string;
  };
  payload: {
    session: {
      id: string;
      status: string;
      keepalive_timeout_seconds: number;
      reconnect_url: string | null;
      connected_at: string;
    };

    subscription: {
      id: string;
      status: string;
      type: string;
      version: string;
      cost: number;
      condition: {
        // The condition object structure depends on the specific subscription type
        // For example, if subscribing to broadcaster's new follower, it might contain broadcaster's ID
        [key: string]: any; // You might need to define a more specific type based on your subscription types
      };
      transport: {
        method: string;
        session_id: string;
      };
      created_at: string;
    };
    event: {
      // The event object structure depends on the specific subscription type
      // For example, if subscribing to broadcaster's new follower, it might contain follower's information
      [key: string]: any; // You might need to define a more specific type based on your subscription types
    };
  };
};

export type EventSubNotificationPayload = {
  session: {
    id: string;
    status: string;
    keepalive_timeout_seconds: number;
    reconnect_url: string | null;
    connected_at: string;
  };

  subscription: {
    id: string;
    status: string;
    type: string;
    version: string;
    cost: number;
    condition: {
      // The condition object structure depends on the specific subscription type
      // For example, if subscribing to broadcaster's new follower, it might contain broadcaster's ID
      [key: string]: any; // You might need to define a more specific type based on your subscription types
    };
    transport: {
      method: string;
      session_id: string;
    };
    created_at: string;
  };
  event: {
    [key: string]: any;
  };
};

export type TwitchEvent = ChannelPointsCustomRewardRedemptionAddEvent | ChatMessageEvent;

export type ChannelPointsCustomRewardRedemptionAddEvent = {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  user_id: string;
  user_login: string;
  user_name: string;
  user_input: string;
  status: string;
  reward: {
    id: string;
    title: string;
    cost: number;
    prompt: string;
  };
  redeemed_at: string;
};

export type ChatMessageEvent = {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message_id: string;
  message: {
    text: string;
    fragments: {
      type: string;
      text: string;
      cheermote: null | any; // Type of cheermote can be defined further
      emote: null | any; // Type of emote can be defined further
      mention: null | any; // Type of mention can be defined further
    }[];
  };
  color: string;
  badges: {
    set_id: string;
    id: string;
    info: string;
  }[];
  message_type: string;
  cheer: null | any; // Type of cheer can be defined further
  reply: null | any; // Type of reply can be defined further
  channel_points_custom_reward_id: null | any; // Type of channel_points_custom_reward_id can be defined further
};
