import type { Report } from "../types";
import { renderJson } from "./json";
import { renderMarkdown } from "./markdown";
import { renderSarif } from "./sarif";
import { renderTerminal } from "./terminal";

export type ReportFormat = "terminal" | "markdown" | "json" | "sarif";

export interface RenderOptions {
  sarifLocation?: string;
}

export function renderReport(
  report: Report,
  format: ReportFormat,
  color: boolean,
  options: RenderOptions = {},
): string {
  switch (format) {
    case "terminal":
      return renderTerminal(report, color);
    case "markdown":
      return renderMarkdown(report);
    case "json":
      return renderJson(report);
    case "sarif":
      return renderSarif(report, { locationUri: options.sarifLocation });
    default:
      throw new Error(`Unsupported report format: ${String(format)}`);
  }
}

export function isReportFormat(value: string): value is ReportFormat {
  return value === "terminal" || value === "markdown" || value === "json" || value === "sarif";
}
