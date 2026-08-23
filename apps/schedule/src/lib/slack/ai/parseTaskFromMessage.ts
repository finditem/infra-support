import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_OUTPUT_TOKENS = 500;

export interface ParsedTaskMessage {
  title: string;
  body: string | null;
  reporterName: string | null;
}

const SYSTEM_PROMPT = `당신은 슬랙 DM 메시지에서 업무 일정 정보를 추출하는 도우미입니다.
메시지에서 제목, 본문(설명), 보고자 이름을 찾아 아래 JSON 형식으로만 응답하세요. 다른 설명은 절대 덧붙이지 마세요.

형식: {"title": string, "body": string | null, "reporterName": string | null}

규칙:
- title은 반드시 채워야 합니다. 메시지에서 업무/일정 제목을 찾을 수 없으면 빈 문자열("")로 두세요.
- body는 제목 외에 설명으로 보이는 내용이 있을 때만 채우고, 없으면 null입니다.
- reporterName은 메시지에서 "보고자"로 지칭되거나 그렇게 유추되는 사람 이름이 있을 때만 채우고, 없으면 null입니다. 담당자를 지칭하는 이름은 채우지 않습니다.`;

/**
 * 자유 형식의 DM 메시지를 제목/본문/보고자로 파싱한다. API 키가 없거나 호출/파싱에 실패하면 null.
 * 실패는 호출부에서 "일정 제목을 찾지 못했다"는 안내로 처리한다.
 */
export const parseTaskFromMessage = async (text: string): Promise<ParsedTaskMessage | null> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY가 없어 자연어 일정 등록을 건너뛴다.");
    return null;
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const textBlock = response.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text) as Partial<ParsedTaskMessage>;

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
