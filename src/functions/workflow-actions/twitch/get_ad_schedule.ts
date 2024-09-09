import { TwitchChannel } from "@/classes/twitch/twitch-channel";
import type { ActionsParams } from "@/types/workflow";

export default async function get_ad_schedule({ broadcaster_id }: ActionsParams) {
  const res = await TwitchChannel.get_ad_schedule(broadcaster_id);

  const obj = {
    ...res.data[0],
    next_ad_at: formatTimeDifference(res.data[0].next_ad_at),
    last_ad_at: formatTimeDifference(res.data[0].last_ad_at),
  };

  return obj;
}

function formatTimeDifference(unixTimestamp: number): string {
  if (unixTimestamp === 0) return "no data";

  const targetDate = new Date(unixTimestamp * 1000);
  const currentDate = new Date();

  // Convert both dates to Amsterdam time
  const targetDateAmsterdam = new Date(targetDate.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
  const currentDateAmsterdam = new Date(currentDate.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));

  const diffMs = targetDateAmsterdam.getTime() - currentDateAmsterdam.getTime();
  const isPast = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const hours = Math.floor(absDiffMs / 3600000);
  const minutes = Math.floor((absDiffMs % 3600000) / 60000);
  const seconds = Math.floor((absDiffMs % 60000) / 1000);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  const timeString = parts.join(" ");
  return isPast ? `${timeString}` : `${timeString}`;
}
