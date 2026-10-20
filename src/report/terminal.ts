import pc from "picocolors";
import pkg from "../../package.json";
import type { Report, Severity } from "../types";

type Colors = ReturnType<typeof pc.createColors>;

function severityColor(colors: Colors, severity: Severity, text: string): string {
  switch (severity) {
    case "critical":
      return colors.red(colors.bold(text));
    case "high":
      return colors.magenta(text);
    case "medium":
      return colors.yellow(text);
    case "low":
      return colors.blue(text);
  }
}

function severityLabel(severity: Severity): string {
  return severity.toUpperCase();
}

function truncate(value: string, length: number): string {
  if (value.length <= length) return value;
  return `${value.slice(0, Math.max(0, length - 1))}…`;
}

function identityLine(report: Report): string {
  if (!report.identity) return "(unavailable)";
  const name = report.identity.name ? ` (${report.identity.name})` : "";
  return `@${report.identity.login}${name}`;
}

function scoreBar(value: number): string {
  const filled = Math.max(0, Math.min(20, Math.round(value / 5)));
  return `${"█".repeat(filled)}${"░".repeat(20 - filled)}`;
}

export function renderTerminal(report: Report, color: boolean): string {
  const c = pc.createColors(color);
  const lines: string[] = [];

  lines.push(`${c.bold("patscope")} ${pkg.version}`);
  const label = (value: string) => c.dim(value.padEnd(11));
  lines.push(`${label("identity")} ${identityLine(report)}`);
  lines.push(
    `${label("token")} ${report.token.redacted} ${c.dim(`(${report.token.typeLabel})`)}`,
  );
  lines.push(
    `${label("scopes")} ${report.token.scopes.length > 0 ? report.token.scopes.length : "none"}`,
  );
  if (report.token.permissions.length > 0) {
    lines.push(
      `${label("permissions")} ${report.token.permissions.length} ${c.dim("(self-reported)")}`,
    );
  }
  lines.push(`${label("source")} ${report.token.source}`);
  if (report.repositories.length > 0) {
    const accessible = report.repositories.filter((repo) => repo.accessible).length;
    lines.push(
      `${label("repos")} ${report.repositories.length} probed, ${accessible} accessible`,
    );
  }
  if (report.orgs.length > 0) {
    const shown = report.orgs.slice(0, 5).map((org) => org.login);
    const suffix = report.orgs.length > 5 ? ` +${report.orgs.length - 5} more` : "";
    lines.push(`${label("orgs")} ${shown.join(", ")}${suffix}`);
  }
  if (report.rateLimit?.remaining != null && report.rateLimit.limit != null) {
    lines.push(
      `${label("rate limit")} ${report.rateLimit.remaining}/${report.rateLimit.limit}`,
    );
  }

  lines.push("");

  if (!report.scoreKnown) {
    lines.push(`${c.bold("Blast radius")}  ${c.yellow("UNKNOWN")}  permissions are not exposed by this token type`);
  } else {
    const level = severityLabel(report.score.level);
    const badge = severityColor(c, report.score.level, level.padEnd(8));
    const raw =
      report.score.rawValue !== report.score.value
        ? c.dim(` (raw ${report.score.rawValue})`)
        : "";
    lines.push(`${c.bold("Blast radius")}  ${badge} ${scoreBar(report.score.value)} ${report.score.value}/100${raw}`);
  }

  if (report.capabilities.length > 0) {
    lines.push("");
    lines.push(c.bold("Top risks"));
    for (const capability of report.capabilities.slice(0, 5)) {
      lines.push(
        `  ${severityColor(c, capability.severity, "!")} ${c.bold(capability.title)} ${c.dim(`[${capability.id}]`)}`,
      );
      lines.push(`    ${c.dim(capability.description)}`);
      lines.push(`    ${c.dim("granted by")} ${capability.matchedScopes.join(", ")}`);
    }

    lines.push("");
    lines.push(c.bold("Capabilities"));
    lines.push(
      `  ${c.dim("SEVERITY".padEnd(9))}${c.dim("CAPABILITY".padEnd(36))}${c.dim("GRANTED BY")}`,
    );
    for (const capability of report.capabilities) {
      lines.push(
        `  ${severityColor(c, capability.severity, severityLabel(capability.severity).padEnd(9))}${truncate(capability.title, 35).padEnd(36)}${capability.matchedScopes.join(", ")}`,
      );
    }
  } else {
    lines.push("");
    lines.push(c.green("No capabilities matched the known scope matrix."));
  }

  if (report.warnings.length > 0) {
    lines.push("");
    lines.push(c.bold("Warnings"));
    for (const warning of report.warnings) {
      lines.push(`  ${c.yellow("!")} ${warning}`);
    }
  }

  lines.push("");
  lines.push(
    c.dim(
      report.token.source === "offline"
        ? "Offline scan. No network requests were made."
        : "Local-only scan. The token was sent only to api.github.com.",
    ),
  );

  return lines.join("\n");
}
