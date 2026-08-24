import OpenAI from "openai";

/** 단순 추출 작업이라 OpenAI 라인업 중 가장 저렴한 모델을 쓴다. */
const MODEL = "gpt-5-nano";
const MAX_OUTPUT_TOKENS = 1000;

export interface ParsedTaskMessage {
  title: string;
  body: string | null;
  reporterName: string | null;
}

const SYSTEM_PROMPT = `당신은 슬랙 DM 메시지에서 업무 일정 정보를 추출하는 도우미입니다.
메시지에서 제목, 본문(설명), 보고자 이름을 찾아 JSON으로 응답하세요.

규칙:
- title은 반드시 채워야 합니다. 메시지에서 업무/일정 제목을 찾을 수 없으면 빈 문자열("")로 두세요.
- body는 제목 외에 설명으로 보이는 내용이 있을 때만 채우고, 없으면 null입니다.
- reporterName은 메시지에서 "보고자"로 지칭되거나 그렇게 유추되는 사람 이름이 있을 때만 채우고, 없으면 null입니다. 담당자를 지칭하는 이름은 채우지 않습니다.`;

const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    body: { type: ["string", "null"] as const },
    reporterName: { type: ["string", "null"] as const },
  },
  required: ["title", "body", "reporterName"],
  additionalProperties: false,
};

/**
 * 자유 형식의 DM 메시지를 제목/본문/보고자로 파싱한다. API 키가 없거나 호출/파싱에 실패하면 null.
 * 실패는 호출부에서 "일정 제목을 찾지 못했다"는 안내로 처리한다.
 */
export const parseTaskFromMessage = async (text: string): Promise<ParsedTaskMessage | null> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY가 없어 자연어 일정 등록을 건너뛴다.");
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
        json_schema: { name: "parsed_task", strict: true, schema: RESPONSE_SCHEMA },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<ParsedTaskMessage>;

    if (typeof parsed.title !== "string" || parsed.title.trim().length === 0) {
      return null;
    }

    const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
    const reporterName = typeof parsed.reporterName === "string" ? parsed.reporterName.trim() : "";

    return {
      title: parsed.title.trim(),
      body: body.length > 0 ? body : null,
      reporterName: reporterName.length > 0 ? reporterName : null,
    };
  } catch (error) {
    console.error("자연어 일정 등록 파싱 실패", error);
    return null;
  }
};
