import { TwitchChannel } from "@/classes/twitch/twitch-channel";
import { supabase } from "@/lib/supabase";
const variableRegex = /\${(.*?)}/g;

interface Props {
  varable: string;
  channel: string;
  channelID: number;
  chatter_name: string;
  chatter_id: string;
  user_id: string;
}

export async function handleVariable({ channel, channelID, chatter_name, chatter_id, varable, user_id }: Props) {
  const intergartion = varable.replace(variableRegex, "$1").split(".");

  let catagory = intergartion[0];
  let _varable = intergartion[1];

  switch (catagory) {
    case "chatter":
      switch (_varable) {
        case "name":
          return chatter_name;
        case "id":
          return chatter_id;
      }
      break;

    case "channel":
      switch (_varable) {
        case "name":
          return channel;
        case "id":
          return channelID;
        case "subscribers":
          const subsribers = await TwitchChannel.getSubsribers(channelID.toString(), user_id);

          return subsribers.total;
      }
      break;

    default:
      return varable;
  }
}
