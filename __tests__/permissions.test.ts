import { describe, it, expect } from "vitest";
import { assertToolAllowed, AgentPermissionError, getCurrentAgentMode } from "@/lib/agent/permissions";
import { executeAgentTool } from "@/lib/agent/tools";

describe("Agent Permission Gatekeeper (Phase 1)", () => {
  it("confirms that the default mode is strictly RESEARCH", () => {
    expect(getCurrentAgentMode()).toBe("RESEARCH");
  });

  it("permits read-only research tools in RESEARCH mode", () => {
    expect(() => assertToolAllowed("scan_universe", "RESEARCH")).not.toThrow();
    expect(() => assertToolAllowed("analyze_instrument", "RESEARCH")).not.toThrow();
    expect(() => assertToolAllowed("find_crossovers", "RESEARCH")).not.toThrow();
    expect(() => assertToolAllowed("find_rsi_setups", "RESEARCH")).not.toThrow();
    expect(() => assertToolAllowed("analyze_portfolio", "RESEARCH")).not.toThrow();
  });

  it("strictly blocks order execution tools in RESEARCH mode", () => {
    expect(() => assertToolAllowed("place_order", "RESEARCH")).toThrow(AgentPermissionError);
    expect(() => assertToolAllowed("execute_order", "RESEARCH")).toThrow(AgentPermissionError);
    expect(() => assertToolAllowed("modify_order", "RESEARCH")).toThrow(AgentPermissionError);
    expect(() => assertToolAllowed("cancel_order", "RESEARCH")).toThrow(AgentPermissionError);
    expect(() => assertToolAllowed("enable_auto_trading", "RESEARCH")).toThrow(AgentPermissionError);
  });

  it("safely handles execution tool requests in executeAgentTool", async () => {
    const result = await executeAgentTool({
      name: "place_order",
      args: { symbol: "RELIANCE", quantity: 10 },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("prohibited in RESEARCH mode");
  });
});
