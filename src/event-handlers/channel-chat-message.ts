import { CommandDatabase } from "@/classes/supabase/database-commands";
import { twitchChat } from "@/classes/twitch/twitch-chat";
import checkCommandPermission from "@/functions/chat/check-command-permission";
import type { UserLevel } from "@/types/database";
import type { ChatMessageEvent } from "@/types/eventsub";
import { handleVariable } from "./handle-variable";
import checkVariable from "./check-variable";

export async function HandleChatMessage(chatMessage: ChatMessageEvent) {
  const { chatter_user_name, broadcaster_user_name, message, message_id, broadcaster_user_id, chatter_user_id, chatter_user_login } = chatMessage;

  const parsedMessage: string[] = message.text.split(" ");


    console.log(`[${broadcaster_user_name}] ${chatter_user_name}: ${parsedMessage}`);
  

  // get all the channelpoints

  // parse the message
  const command = parsedMessage[0].toLowerCase();
  const args = parsedMessage.slice(1);
  // find the command
  const foundCommand = await CommandDatabase.findCommand(command, +broadcaster_user_id);

  if (foundCommand) {
    // console.log(foundCommand);

    if (!foundCommand.status) {
      return;
    }

    let messageToSend: string = foundCommand.message;

    // check user permission
    const hasPermission = await checkCommandPermission({
      broadcaster_id: +broadcaster_user_id,
      userlevel: foundCommand.userlevel as UserLevel,
      chatter_id: +chatter_user_id,
      user_id: foundCommand.user_id,
    });

    // if the user does not have permission to use the command
    if (!hasPermission) {
      messageToSend = `@${chatter_user_login} you do not have permission to use this command.`;
    }

    // check if the command has variables
    let variableObjectArray = checkVariable(messageToSend);

    // handle the variables
    const newArray = await Promise.all(
      variableObjectArray.map(async (variableObject) => {
        if (variableObject.variable) {
          const variable = await handleVariable({
            varable: variableObject.word,
            channel: broadcaster_user_name,
            channelID: +broadcaster_user_id,
            chatter_id: chatter_user_id,
            chatter_name: chatter_user_name,
            user_id: foundCommand.user_id,
          });

          return variable;
        }

        return variableObject.word;
      })
    );


    messageToSend = newArray.join(" ");

    console.log(messageToSend)

    if (messageToSend === "") return;

    // send the message
    await twitchChat.sendMessage({
      broadcaster_id: broadcaster_user_id,
      message: messageToSend,
      reply_parent_message_id: message_id,
      sender_id: broadcaster_user_id,
    });
  }
}
