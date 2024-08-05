import { TwitchChannel } from "@/classes/twitch/twitch-channel";
import { TwitchModeration } from "@/classes/twitch/twitch-moderation";
import type { UserLevel } from "@/types/database";

export default async function checkCommandPermission({
  broadcaster_id,
  userlevel,
  chatter_id,
  user_id
}: {
  broadcaster_id: number;
  userlevel: UserLevel;
  chatter_id: number;
  user_id: string;
}): Promise<boolean> {
  if (broadcaster_id === chatter_id) return true;

  switch (userlevel) {
    case "everyone":
      return true;
    case "follower":
      const follower = await TwitchChannel.getFollowers(broadcaster_id.toString(), chatter_id.toString(), user_id);

      if (follower.data.length > 0) {
        return true;
      }

      return false;

    case "vip":
      const vip = await TwitchChannel.getVip(broadcaster_id.toString(), chatter_id.toString(), user_id);

      if (vip.data.length > 0) {
        return true;
      }
      return false;
    case "subscriber":
      return false;
    case "moderator":
      const moderator = await TwitchModeration.getModerators(broadcaster_id.toString(), [chatter_id.toString()]);

      if (moderator.data.length > 0) {
        return true;
      }

      return false;
    case "super_moderator":
      return false;
    case "broadcaster":
      return false;
  }
}
