import type { prevResponses } from "@/types/workflow";

export default function getValueByUUID(prevResponses: prevResponses, uuid: string, key: keyof prevResponses[string]): string | undefined {
  const item = prevResponses[uuid];


  return item ? item[key] : undefined;
}
