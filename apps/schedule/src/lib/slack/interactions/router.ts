import { DUE_SOON_STATUS_BY_ACTION } from "../blocks/dueSoonBlocks";
import { handleDueSoonAction } from "./handleDueSoonAction";
import { handleOverdueAction } from "./handleOverdueAction";

const OVERDUE_ACTION_IDS = new Set(["overdue_complete", "overdue_postpone"]);

interface RouteSlackInteractionParams {
  actionId: string;
  taskId: string;
  slackUserId: string;
  responseUrl: string;
}

/** 5-4/5-5 DM의 버튼 클릭(block_actions)을 action_id별로 분기한다. */
export const routeSlackInteraction = async (params: RouteSlackInteractionParams) => {
  if (params.actionId in DUE_SOON_STATUS_BY_ACTION) {
    await handleDueSoonAction(params);
    return;
  }

  if (OVERDUE_ACTION_IDS.has(params.actionId)) {
    await handleOverdueAction(params);
  }
};
