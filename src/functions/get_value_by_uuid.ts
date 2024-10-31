import type { NodeReponses } from "@/types/workflow";

export default function getValueByUUID(prevResponses: NodeReponses, node_id: string, key: keyof NodeReponses[string]): string | undefined {
  // console.log(prevResponses);
  return prevResponses[node_id].data ? prevResponses[node_id].data[key] : undefined;
}
