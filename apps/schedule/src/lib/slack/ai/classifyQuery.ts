import OpenAI from "openai";

/** 단순 분류 작업이라 OpenAI 라인업 중 가장 저렴한 모델을 쓴다. */
const MODEL = "gpt-5-nano";
const MAX_OUTPUT_TOKENS = 500;

export type QueryIntent = "days_remaining" | "completion_rate" | "remaining_tasks" | "unknown";

export interface ClassifiedQuery {
  intent: QueryIntent;
  /** days_remaining일 때만 채워지는 대상 일정 제목 키워드. 그 외에는 null. */
  taskQuery: string | null;
  /** 본인 기준("me") / 팀 전체 기준("all"). 명시가 없으면 "me". */
  scope: "me" | "all";
}

const INTENTS: readonly QueryIntent[] = [
  "days_remaining",
  "completion_rate",
  "remaining_tasks",
  "unknown",
];

const SYSTEM_PROMPT = `당신은 찾길 팀 일정 관리 봇의 조회 질문 분류기입니다.
사용자의 한국어 DM을 아래 의도 중 하나로 분류하고 필요한 슬롯만 추출해 JSON으로 응답하세요.
수치나 날짜, 완료율 같은 값은 절대 직접 계산하거나 지어내지 마세요. 오직 의도 분류와 슬롯 추출만 합니다.

의도(intent):
- days_remaining: 특정 일정의 마감까지 며칠 남았는지 묻는 질문. taskQuery에 그 일정 제목 키워드를 넣으세요. 예) "퍼블리싱작업 며칠 남았어?"
- completion_rate: 완료율을 묻는 질문. 예) "내 이번주 완료율", "팀 완료율 어때?"
- remaining_tasks: 남은(미완료) 일정 목록을 묻는 질문. 예) "내 남은 일정", "나 뭐 해야 돼?"
- unknown: 위 어디에도 해당하지 않는 질문(특히 일정 등록/변경 요청은 조회가 아니므로 unknown).

슬롯:
- scope: 본인 기준이면 "me", 팀 전체 기준이면 "all". 명시가 없으면 "me".
- taskQuery: days_remaining일 때 대상 일정 제목 키워드. 그 외 의도에서는 null.`;

const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    intent: { type: "string" as const, enum: INTENTS as unknown as string[] },
    taskQuery: { type: ["string", "null"] as const },
    scope: { type: "string" as const, enum: ["me", "all"] },
  },
  required: ["intent", "taskQuery", "scope"],
  additionalProperties: false,
};

/**
 * 자연어 조회 질문을 의도/슬롯으로 분류한다. LLM은 분류와 슬롯 추출에만 쓰고 수치 계산은 하지 않는다.
 * API 키가 없거나 호출/파싱에 실패하면 null을 반환하며, 호출부는 이를 도움말 안내로 처리한다.
 */
export const classifyQuery = async (text: string): Promise<ClassifiedQuery | null> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY가 없어 AI 조회를 건너뛴다.");
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "classified_query", strict: true, schema: RESPONSE_SCHEMA },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<ClassifiedQuery>;

    const intent = INTENTS.includes(parsed.intent as QueryIntent)
      ? (parsed.intent as QueryIntent)
      : "unknown";

    const taskQuery =
      typeof parsed.taskQuery === "string" && parsed.taskQuery.trim().length > 0
        ? parsed.taskQuery.trim()
        : null;

    const scope = parsed.scope === "all" ? "all" : "me";

    return { intent, taskQuery, scope };
  } catch (error) {
    console.error("AI 조회 분류 실패", error);
    return null;
  }
};
