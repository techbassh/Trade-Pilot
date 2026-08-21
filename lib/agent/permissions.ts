// Agent Mode and Permission Gatekeeper for TradePilot
import { AgentMode } from "@/types/agent";

export class AgentPermissionError extends Error {
  code: string;
  allowedModes: AgentMode[];

  constructor(message: string, code = "PERMISSION_DENIED", allowedModes: AgentMode[] = []) {
    super(message);
    this.name = "AgentPermissionError";
    this.code = code;
    this.allowedModes = allowedModes;
  }
}

export function getCurrentAgentMode(): AgentMode {
  // Phase 1 is strictly locked to RESEARCH mode
  return "RESEARCH";
}

export function assertToolAllowed(toolName: string, mode: AgentMode = getCurrentAgentMode()): void {
  const RESTRICTED_EXECUTION_TOOLS = [
    "place_order",
    "modify_order",
    "cancel_order",
    "execute_order",
    "enable_auto_trading",
    "start_live_strategy",
  ];

  if (RESTRICTED_EXECUTION_TOOLS.includes(toolName)) {
    if (mode === "RESEARCH" || mode === "ALERT") {
      throw new AgentPermissionError(
        `Action "${toolName}" is prohibited in ${mode} mode. In Phase 1, TradePilot AI Agent functions strictly in read-only RESEARCH mode for scanning, technical analysis, and portfolio health monitoring.`,
        "ORDER_EXECUTION_PROHIBITED_IN_RESEARCH_MODE",
        ["CONFIRMATION", "AUTO_EXECUTION"]
      );
    }
  }
}
