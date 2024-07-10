import axios from "axios";
import twitchAPI from "../classes/twitch";
import { supabase } from "@/lib/supabase";

const TwitchAPI = axios.create({
  baseURL: "https://api.twitch.tv/helix",
  headers: {
    Accept: "application/json",
    "Client-ID": process.env.TWITCH_CLIENT_ID,
  },
});

TwitchAPI.interceptors.request.use(
  async (config) => {
    // Assuming you have a method to get the current token...]
    const user_id = config.user_id;
    if (!user_id) {
      throw new Error("User ID is missing");
    }

    const {data} = await supabase.from("twitch_integration").select("*").eq("user_id", user_id).single();
    if (data?.access_token) {

      config.headers["Authorization"] = `Bearer ${data.access_token}`;
    }



    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//twitch response interceptor
TwitchAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  //handle response error
  async function (error) {
    //originalRequest
    const originalRequest = error.config;

    //if the error status = 401 we update the token and retry
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      //get the channel from the request
      const channelID = error.response?.config.broadcasterID;

      const {data, error: DBerror} = await supabase.from("twitch_integration").select("refresh_token").eq("broadcaster_id", channelID).single();
      if (DBerror) {
        console.log("Tokens not found");
        return;
      }

      //fetch the new accessToken and update the tokens
      const newToken = await twitchAPI.RefreshToken(data.refresh_token, channelID);

      if (!newToken) {
        console.log("Error refreshing token");
        return;
      }

      //update the headers for the new request
      originalRequest.headers["Authorization"] = "Bearer " + newToken.access_token;

      //make the new request
      const res = TwitchAPI(originalRequest);

      return res;
    }
    return Promise.reject(error);
  }
);

export { TwitchAPI };