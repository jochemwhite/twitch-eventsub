import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { TwitchAPI } from "../axios/twitchAPI";
import type {
  ClipResponse,
  CustomRewardRequest,
  CustomRewardResponse,
  EventSubTopics,
  getChattersRequest,
  getChattersResponse,
} from "../types/twitchAPI";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";

export class twitch {
  protected clientID = env.TWITCH_CLIENT_ID;
  protected clientSecret = env.TWITCH_CLIENT_SECRET;
  protected broadcasterID?: number;

  constructor() {}

  // create app Token
  async createAppToken() {
    try {
      const res = await axios.post(
        `https://id.twitch.tv/oauth2/token?client_id=${this.clientID}&client_secret=${this.clientSecret}&grant_type=client_credentials`
      );

      return res.data;
    } catch (error) {
      console.log(error);
    }
  }

  async getChatters({ broadcaster_id, moderator_id, after, first }: getChattersRequest): Promise<getChattersResponse> {
    try {
      const res = await TwitchAPI.get<getChattersResponse>(`/chat/chatters`, {
        params: {
          broadcaster_id,
          moderator_id,
          after,
          first,
        },
      });

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async RefreshToken(refreshToken: string, channelID: number) {
    try {
      const res = await axios.post(
        `https://id.twitch.tv/oauth2/token?client_id=${env.TWITCH_CLIENT_ID}&client_secret=${env.TWITCH_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshToken}`
      );

      // console.log(res)

      await supabase
        .from("twitch_integration")
        .update({ access_token: res.data.access_token, refresh_token: res.data.refresh_token })
        .eq("broadcaster_id", channelID);

      return res.data;
    } catch (error) {
      console.error("error refreshing token");
      console.log(error);
    }
  }
}

const twitchAPI = new twitch();

export default twitchAPI;
