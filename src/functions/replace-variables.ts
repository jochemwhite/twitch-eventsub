import type { Metadata } from "@/types/workflow";
const regex = /\{(.*)}/;

export function replaceWords(input: { word: string, variable: boolean }[], rewards: Metadata): string[] {
  return input.map(obj => {
    if (obj.variable) {
      const match = obj.word.match(regex);
      if (match) {
        const path = match[1].split(".");
        let value: any = rewards;
        for (const key of path) {
          value = value[key];
        }
        return obj.word.replace(regex, value);
      }
    }
    return obj.word;
  });
}