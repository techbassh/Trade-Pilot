// Gemini-powered intent planning & response synthesis for TradePilot AI Agent
import {
  GoogleGenerativeAI,
  SchemaType,
  type Content,
  type FunctionDeclaration,
} from "@google/generative-ai";
import { AgentMessage, ToolCall } from "@/types/agent";
import { parseNaturalLanguageIntent } from "./planner";

const SYSTEM_INSTRUCTION = `You are TradePilot AI Copilot, a read-only Indian equity research assistant for Zerodha/Kite users.

Rules:
- Phase 1 is RESEARCH MODE only: never place, modify, or cancel orders.
- If the user asks to buy/sell/trade, explain that live execution is disabled and offer analysis instead.
- Prefer calling the appropriate tool for scans, single-stock analysis, or portfolio health checks.
- Use Indian market context (NSE/BSE, NIFTY universes, INR).
- Keep responses concise, actionable, and grounded in the tool data provided.
- Do not invent prices, returns, or indicator values — only use supplied tool results.`;

const AGENT_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "scan_universe",
    description:
      "Scan NIFTY universes for top performers or multi-condition setups (return, SMA, volume filters).",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        universe: {
          type: SchemaType.STRING,
          description: "NIFTY_50 | NIFTY_100 | NIFTY_500 | NIFTY_NEXT_50",
        },
        timeframe: {
          type: SchemaType.STRING,
          description: "e.g. 1 week, 1 month, 3 months, 6 months, 1 year, YTD",
        },
        minReturnPct: { type: SchemaType.NUMBER },
        priceAboveSma20: { type: SchemaType.BOOLEAN },
        priceAboveSma50: { type: SchemaType.BOOLEAN },
        sma20AboveSma50: { type: SchemaType.BOOLEAN },
        minVolumeRatio: { type: SchemaType.NUMBER },
        limit: { type: SchemaType.NUMBER },
        sortBy: { type: SchemaType.STRING, description: "return | score | volume | rsi" },
      },
    },
  },
  {
    name: "find_crossovers",
    description: "Find stocks where SMA20 crossed above SMA50 recently.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        universe: { type: SchemaType.STRING },
        lookback: { type: SchemaType.NUMBER, description: "Sessions to look back (default 5)" },
        limit: { type: SchemaType.NUMBER },
      },
    },
  },
  {
    name: "find_rsi_setups",
    description: "Find oversold/overbought RSI setups.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        universe: { type: SchemaType.STRING },
        minRsi: { type: SchemaType.NUMBER },
        maxRsi: { type: SchemaType.NUMBER },
        limit: { type: SchemaType.NUMBER },
      },
    },
  },
  {
    name: "find_breakouts",
    description: "Find stocks near 52-week highs with strong volume.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        universe: { type: SchemaType.STRING },
        within52wHighPct: { type: SchemaType.NUMBER },
        minVolumeRatio: { type: SchemaType.NUMBER },
        limit: { type: SchemaType.NUMBER },
      },
    },
  },
  {
    name: "analyze_instrument",
    description: "Deep technical analysis for a single stock symbol.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        symbol: { type: SchemaType.STRING, description: "NSE/BSE ticker e.g. RELIANCE, TCS" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "analyze_portfolio",
    description: "Audit portfolio health, concentration risk, and SMA50 warnings for user holdings.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
];

export interface GeminiPlanResult {
  toolCall: ToolCall | null;
  directResponse: string | null;
  usedGemini: boolean;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

function getModelName() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

function toGeminiHistory(history: AgentMessage[]): Content[] {
  return history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-6)
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));
}

function functionCallToToolCall(name: string, args: Record<string, unknown>): ToolCall {
  if (name === "analyze_instrument" && args.symbol) {
    args.symbol = String(args.symbol).toUpperCase();
  }
  return { name, args };
}

export async function planIntentWithGemini(
  message: string,
  history: AgentMessage[] = []
): Promise<GeminiPlanResult> {
  const client = getGeminiClient();
  if (!client) {
    return {
      toolCall: parseNaturalLanguageIntent(message),
      directResponse: null,
      usedGemini: false,
    };
  }

  try {
    const model = client.getGenerativeModel({
      model: getModelName(),
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: AGENT_FUNCTION_DECLARATIONS }],
    });

    const chat = model.startChat({ history: toGeminiHistory(history) });
    const result = await chat.sendMessage(message);
    const response = result.response;

    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      return {
        toolCall: functionCallToToolCall(call.name, (call.args || {}) as Record<string, unknown>),
        directResponse: null,
        usedGemini: true,
      };
    }

    const text = response.text()?.trim();
    if (text) {
      return { toolCall: null, directResponse: text, usedGemini: true };
    }
  } catch (err) {
    console.warn("[Gemini] Planning failed, falling back to regex planner:", err);
  }

  return {
    toolCall: parseNaturalLanguageIntent(message),
    directResponse: null,
    usedGemini: false,
  };
}

export async function synthesizeResponseWithGemini(options: {
  userMessage: string;
  toolCall: ToolCall;
  toolResult: unknown;
  fallbackContent: string;
}): Promise<{ content: string; usedGemini: boolean }> {
  const client = getGeminiClient();
  if (!client) {
    return { content: options.fallbackContent, usedGemini: false };
  }

  try {
    const model = client.getGenerativeModel({
      model: getModelName(),
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = `The user asked: "${options.userMessage}"

You executed tool \`${options.toolCall.name}\` with args ${JSON.stringify(options.toolCall.args)}.

Tool result (JSON):
${JSON.stringify(options.toolResult, null, 2)}

Write a concise markdown research summary for the user. Highlight key findings, top symbols if relevant, and risk notes. Do not fabricate numbers beyond the JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();
    if (text) {
      return { content: text, usedGemini: true };
    }
  } catch (err) {
    console.warn("[Gemini] Response synthesis failed, using template:", err);
  }

  return { content: options.fallbackContent, usedGemini: false };
}
