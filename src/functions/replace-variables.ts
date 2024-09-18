import type { Metadata, NodeReponses } from "@/types/workflow";
const regex = /\{(.*)}/;

export function replaceWords(input: { word: string; variable: boolean }[], rewards: NodeReponses): string[] {
  return input.map((obj) => {
    if (obj.variable) {
      const match = obj.word.match(regex);
      if (match) {
        const path = match[1].split(":");
        const node_id = path[0];
        const variable = path[1];

        let value = rewards;

        return obj.word.replace(regex, value[node_id].data[variable]);
      }
    }
    return obj.word;
  });
}
