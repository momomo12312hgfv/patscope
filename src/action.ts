import { appendFileSync } from "node:fs";
import { appendFile, writeFile } from "node:fs/promises";
import { parsePermissionInput } from "./permissions";
import { isReportFormat, renderReport, type ReportFormat } from "./report";
import { scanToken } from "./scan";
import { severityAtLeast } from "./score";
import { redactSecrets } from "./token";
import { SEVERITIES, type Severity } from "./types";

function input(name: string, fallback = ""): string {
  return (process.env[`INPUT_${name.toUpperCase()}`] ?? fallback).trim();
}

function parseSeverity(raw: string): Severity {
  const value = raw.trim().toLowerCase();
  if (!SEVERITIES.includes(value as Severity)) {
    throw new Error(`Invalid fail-on value "${raw}". Expected one of: ${SEVERITIES.join(", ")}.`);
  }
  return value as Severity;
}

function parseActionFormat(raw: string): ReportFormat {
  const value = raw.trim().toLowerCase();
  if (!isReportFormat(value) || value === "terminal") {
    throw new Error(`Invalid format "${raw}". Expected markdown, json or sarif.`);
  }
  return value;
}

function setOutput(name: string, value: string): void {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) return;
  appendFileSync(outputFile, `${name}=${value}\n`, "utf8");
}

async function appendSummary(markdown: string): Promise<void> {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) return;
  await appendFile(summaryFile, `${markdown}\n`, "utf8");
}

export interface RunActionOptions {
  silent?: boolean;
}

export async function runAction(options: RunActionOptions = {}): Promise<void> {
  const token = input("token");
  if (!token) {
    throw new Error("Input 'token' is required. Use a dedicated, low-privilege token.");
  }

  const failOn = parseSeverity(input("fail-on", "high"));
  const format = parseActionFormat(input("format", "markdown"));
  const outputFile =
    input("output-file") || (format === "sarif" ? "patscope-report.sarif" : "patscope-report.md");
  const permissionsInput = input("permissions");
  const reposInput = input("repos");

  const parsedPermissions = permissionsInput
    ? parsePermissionInput(permissionsInput)
    : { grants: [], errors: [] };
  if (parsedPermissions.errors.length > 0) {
    throw new Error(parsedPermissions.errors.join(" "));
  }

  const repos = reposInput
    ? reposInput
        .split(/[\s,]+/)
        .map((repo) => repo.trim())
        .filter(Boolean)
    : undefined;

  try {
    const report = await scanToken({
      token,
      permissions: parsedPermissions.grants,
      repos,
      source: "github-action",
      offline: false,
    });

    const markdown = renderReport(report, "markdown", false);
    let output: string;

    if (format === "sarif") {
      const markdownPath = /\.sarif$/i.test(outputFile)
        ? outputFile.replace(/\.sarif$/i, ".md")
        : `${outputFile}.md`;
      await writeFile(markdownPath, `${markdown}\n`, "utf8");
      output = renderReport(report, "sarif", false, { sarifLocation: markdownPath });
    } else {
      output = renderReport(report, format, false);
    }

    await writeFile(outputFile, `${output}\n`, "utf8");
    await appendSummary(markdown);
    if (!options.silent) {
      process.stdout.write(`${markdown}\n`);
    }

    setOutput("score", String(report.score.value));
    setOutput("level", report.score.level);
    setOutput("report", outputFile);

    if (report.scoreKnown && severityAtLeast(report.score.level, failOn)) {
      if (!options.silent) {
        process.stderr.write(
          `patscope: score ${report.score.value}/100 (${report.score.level}) meets or exceeds fail-on=${failOn}\n`,
        );
      }
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(redactSecrets(message));
  }
}
