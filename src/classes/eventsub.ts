import { HandleChatMessage } from "@/event-handlers/channel-chat-message";
import { EventsubAPI } from "./twitch-eventsub";
import type { ChatMessageEvent, EventSubNotification, EventSubNotificationPayload, TwitchEvent } from "@/types/eventsub";
import { sendDiscordMessage } from "@/axios/discord-webhook";
import { supabase } from "@/lib/supabase";
import handleWorkflow from "@/functions/handle-workflow";
import actionHandlers from "@/functions/handle-workflow";
import type { Action, EditorNodeType, Metadata } from "@/types/workflow";

type CloseCodeMap = {
  [code: number]: string;
};

interface EventSubOptions {
  url?: string;
  connect?: boolean;
  silenceReconnect?: boolean;
  disableAutoReconnect?: boolean;
}

class EventSubSocket {
  private counter: number = 0;
  private closeCodes: CloseCodeMap = {
    4000: "Internal Server Error",
    4001: "Client sent inbound traffic",
    4002: "Client failed ping-pong",
    4003: "Connection unused",
    4004: "Reconnect grace time expired",
    4005: "Network Timeout",
    4006: "Network error",
    4007: "Invalid Reconnect",
  };

  private mainUrl: string = "wss://eventsub.wss.twitch.tv/ws";
  private backoff: number = 0;
  private backoffStack: number = 100;
  private eventsub: WebSocket | null = null;
  private silenceHandler: any;
  private silenceTime: number = 10;

  private silenceReconnect: boolean;
  private disableAutoReconnect: boolean;

  constructor({ url = "wss://eventsub.wss.twitch.tv/ws", connect = false, silenceReconnect = true, disableAutoReconnect = false }: EventSubOptions) {
    this.silenceReconnect = silenceReconnect;
    this.disableAutoReconnect = disableAutoReconnect;
    this.mainUrl = url;

    if (connect) {
      this.connect();
    }
  }

  private connect(url?: string, isReconnect: boolean = false): void {
    this.eventsub = null;
    this.counter++;

    url = url ? url : this.mainUrl;

    console.debug(`Connecting to ${url}`);
    this.eventsub = new WebSocket(url);

    this.eventsub.onopen = () => {
      this.backoff = 0;
      console.debug(`Opened Connection to Twitch`);
      sendDiscordMessage("Connected to Twitch EventSub");
    };

    this.eventsub.onclose = (close) => {
      this.emit("close", close);

      console.debug(`${this.eventsub?.url}/${this.counter} Connection Closed: ${close.code} Reason - ${this.closeCodes[close.code]}`);
      sendDiscordMessage(`${this.eventsub?.url}/${this.counter} Connection Closed: ${close.code} Reason - ${this.closeCodes[close.code]}`);

      if (close.code === 4003) {
        console.debug("Did not subscribe to anything, the client should decide to reconnect (when it is ready)");
        return;
      }
      if (close.code === 4004) {
        console.debug("Old Connection is 4004-ing");
        sendDiscordMessage("Old Connection is 4004-ing");

        return;
      }

      if (this.disableAutoReconnect) {
        return;
      }

      this.backoff++;
      console.debug("retry in", this.backoff * this.backoffStack);
      sendDiscordMessage(`retry in ${this.backoff * this.backoffStack}`);
      setTimeout(() => {
        this.connect();
      }, this.backoff * this.backoffStack);
    };

    this.eventsub.onerror = (err) => {
      console.debug(`${this.eventsub?.url}/${this.counter} Connection Error`, err);
      sendDiscordMessage(`${this.eventsub?.url}/${this.counter} Connection Error ${err ? err : "unknown"}`);
    };

    this.eventsub.onmessage = async (message) => {
      const messageData: EventSubNotification = JSON.parse(message.data.toString());

      const { metadata, payload } = messageData;
      const { message_id, message_type, message_timestamp } = metadata;

      switch (message_type) {
        case "session_welcome":
          const { session } = payload;
          const { id, keepalive_timeout_seconds } = session;

          console.debug(`${this.counter} This is Socket ID ${id}`);
          // if (this.eventsub) {
          //   this.eventsub.url = id;
          // }

          console.debug(`${this.counter} This socket declared silence as ${keepalive_timeout_seconds} seconds`);

          if (isReconnect) {
            this.emit("reconnected", id);
          } else {
            console.debug(`${this.counter} Sending shards to Twitch`);
            await EventsubAPI.updateConduitShards({
              conduit_id: "d76b9935-da70-4ccb-87cd-e9e899986cc8",
              shards: [
                {
                  id: "0",
                  transport: {
                    method: "websocket",
                    session_id: id,
                  },
                },
              ],
            });
          }

          this.silence(keepalive_timeout_seconds);
          break;

        case "notification":
          const { subscription } = payload;
          const { type } = subscription;

          // if (type !== "channel.chat.message") {
          //   console.debug(`${this.eventsub?.url}/${this.counter} Recv notification ${type}`);
          // }

          // console.debug(payload.event);

          this.dispatchEvent(payload);

          this.silence();
          break;

        case "session_keepalive":
          //console.debug(`Recv KeepAlive - ${message_type}`);
          // this.emit("session_keepalive");
          this.silence();
          break;

        case "session_reconnect":
          // if (this.eventsub) {
          //   this.eventsub.url = "is_reconnecting";
          // }

          const { reconnect_url } = payload.session;

          console.debug(`${this.eventsub?.url}/${this.counter} Reconnect request ${reconnect_url}`);
          sendDiscordMessage(`${this.eventsub?.url}/${this.counter} Reconnect request ${reconnect_url}`);

          // this.emit("session_reconnect", reconnect_url);
          this.connect(reconnect_url!, true);
          break;
        case "websocket_disconnect":
          console.debug(`${this.counter} Recv Disconnect`);
          console.debug("websocket_disconnect", payload);

          sendDiscordMessage(`${this.counter} Recv Disconnect ${payload}`);
          break;

        case "revocation":
          console.debug(`${this.counter} Recv Topic Revocation`);
          console.debug("revocation", payload);

          sendDiscordMessage(`${this.counter} Recv Topic Revocation ${payload}`);
          this.emit("revocation", { metadata, payload });
          break;

        default:
          console.debug(`${this.counter} unexpected`, metadata, payload);

          sendDiscordMessage(`${this.counter} unexpected ${metadata} ${payload}`);
          break;
      }
    };
  }

  private close(): void {
    this.eventsub?.close();
  }

  private silence(keepalive_timeout_seconds?: number): void {
    if (keepalive_timeout_seconds) {
      this.silenceTime = keepalive_timeout_seconds + 1;
    }
    if (this.silenceHandler) {
      clearTimeout(this.silenceHandler);
    }
    this.silenceHandler = setTimeout(() => {
      this.emit("session_silenced");
      if (this.silenceReconnect) {
        this.close();
      }
    }, this.silenceTime * 1000);
  }

  private async dispatchEvent(event: EventSubNotificationPayload): Promise<void> {

    if (event.subscription.type === "channel.chat.message") {
      await HandleChatMessage(event.event as ChatMessageEvent);
    }




    
    await handleWorkflow({ event });
      
  }

  private emit(event: string, ...args: any[]): void {
    console.debug(`Event emitted: ${event}`, ...args);
  }
}

export { EventSubSocket };
