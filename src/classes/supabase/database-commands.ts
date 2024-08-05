import { supabase } from "@/lib/supabase";

class commandDatabase {
  databaseID: string;

  constructor() {
    this.databaseID = "6613a4934f497ba10dcb";
  }

  // find command
  async findCommand(command: string, channelID: number) {
    const { data, error, count } = await supabase.from("commands").select("*").eq("command", command).eq("broadcaster_id", channelID);

    if (error) {
      console.log(error);
      return;
    }

    if (count === 0 || data.length === 0) {
      return;
    }

    return data[0];

    return;
  }
}

export const CommandDatabase = new commandDatabase();
