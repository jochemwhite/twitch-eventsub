import { RunWorkflow } from "@/functions/handle-workflow";
import { createSupabaseClient } from "@/lib/supabase";
import { supabaseJWTMiddleware } from "@/middleware/jwt.middleware";
import { Elysia, t } from "elysia";

export const WorkflowController = new Elysia({ prefix: "/workflow" }).use(supabaseJWTMiddleware).post(
  "/test",
  async ({ body, headers, set }) => {
    const { authorization } = headers;
    const { user_id, workflow_id, trigger_details, broadcaster_id } = body;

    const supabase = createSupabaseClient(authorization);

    const { data, error } = await supabase.from("workflows").select("*").eq("id", workflow_id).eq("user_id", user_id).single();

    // console.log(data, error);

    if (error) {
      set.status = 401;
      return error.message;
    }

    if (!data.nodes) {
      return "no actions in workflow";
    }

    const workflow_results = await RunWorkflow(JSON.parse(data.nodes), broadcaster_id, JSON.parse(trigger_details), data.id, data.name);

    // create a array of the workflow results and sort on started at
    const workflow_results_array = Object.entries(workflow_results.responseData)
      .map(([node_id, value]) => {
        return { node_id, ...value, started_at: workflow_results.responseData[node_id].started_at };
      })
      .sort((a, b) => {
        return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
      });

    if (workflow_results.ResponseError && workflow_results.ResponseError.length > 0) {
      // check for errors vs warnings

      for (const error of workflow_results.ResponseError) {
        if (error.type === "error") {
          return { node_responses: workflow_results_array, message: `workflow failed on ${error.node_id}: ${error.message}` };
        } else {
          return { node_responses: workflow_results_array, message: `workflow finshed with warnings check logs` };
        }
      }
    }

    return { node_responses: workflow_results_array, message: "Workflow processed successfully" };
  },
  {
    body: t.Object({
      workflow_id: t.String(),
      user_id: t.String(),
      trigger_details: t.String(),
      broadcaster_id: t.String(),
    }),
    headers: t.Object({
      authorization: t.String(),
    }),
  }
);
