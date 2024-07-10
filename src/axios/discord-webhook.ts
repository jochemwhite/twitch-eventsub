import axios from "axios";

const webhookUrl: string = "https://discord.com/api/webhooks/1260430194271850550/Q-0wYqYbHcI5QejbMFAUqtwEBYeYmXXiZA4Fc3FtmbIhBSlSIdHx_ISe56scd5oC-DJk";

interface DiscordMessage {
  content: string;
  username?: string;
  avatar_url?: string;
  embeds?: Embed[];
}

interface Embed {
  title: string;
  description: string;
  color: number;
  fields?: Field[];
}

interface Field {
  name: string;
  value: string;
  inline?: boolean;
}

export async function sendDiscordMessage(content: string): Promise<void> {
  const message: DiscordMessage = {
    content: content,
    username: "StreamWiazrd EventSub",
    avatar_url: "https://cdn.discordapp.com/icons/1052205042490429500/6c26a48e456a7d4e80cd6340e74d5460.webp",
  };

  axios
    .post(webhookUrl, message)
    .then((response) => {
      console.log("Message sent: ", response.data);
    })
    .catch((error) => {
      console.error("Error sending message: ", error);
    });
}
