import { RunWorkflow } from "@/functions/handle-workflow";
import { createSupabaseClient } from "@/lib/supabase";
// import { supabaseJWT } from "@/middleware/jwt.middleware";
import { Elysia, t } from "elysia";

export const WorkflowController = new Elysia({ prefix: "/workflow" }).post(
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


    // check for errors
    if (Object.keys(workflow_results.node_errors).length) {
      set.status = 400
      return {
        errors: workflow_results.node_errors,
        message: "Workflow processed with errors",
        responses: workflow_results.responseData
      };
    }

    return { message: "Workflow processed" };
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
