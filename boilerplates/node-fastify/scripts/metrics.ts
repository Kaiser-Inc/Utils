#!/usr/bin/env tsx
/**
 * scripts/metrics.ts — Node.js/TypeScript quality metrics
 * Produces JSON in MetriKa-compatible schema
 *
 * Usage:
 *   npm run metrics
 *   tsx scripts/metrics.ts --output-dir /custom/path
 *
 * Prerequisites:
 *   npm run test:coverage  → gera coverage/coverage-final.json
 */

import { parse } from "@typescript-eslint/typescript-estree";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, resolve, dirname } from "node:path";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "src");
const PROJECT = "node-fastify";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd: string): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { code: 0, stdout: stdout.toString(), stderr: "" };
  } catch (e: unknown) {
    const err = e as {
      status?: number;
      stdout?: Buffer | string;
      stderr?: Buffer | string;
    };
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".d.ts") &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".spec.ts")
    ) {
      files.push(join(entry.parentPath ?? (entry as unknown as { path: string }).path, entry.name));
    }
  }
  return files;
}

// ─── CC Analysis ─────────────────────────────────────────────────────────────

const FUNCTION_NODES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

/** Count decision points in a subtree, stopping at nested function boundaries */
function countDecisions(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const n = node as Record<string, unknown>;
  const t = n.type as string | undefined;

  // Stop recursing into nested functions — they get their own CC score
  if (t && FUNCTION_NODES.has(t) && !n.__isRoot) return 0;

  let count = 0;

  if (
    t === "IfStatement" ||
    t === "WhileStatement" ||
    t === "DoWhileStatement" ||
    t === "ForStatement" ||
    t === "ForInStatement" ||
    t === "ForOfStatement" ||
    t === "CatchClause" ||
    t === "ConditionalExpression"
  ) {
    count++;
  }
  if (t === "SwitchCase" && n.test !== null) count++;
  if (
    t === "LogicalExpression" &&
    (n.operator === "&&" || n.operator === "||" || n.operator === "??")
  ) {
    count++;
  }

  for (const val of Object.values(n)) {
    if (Array.isArray(val)) {
      for (const child of val) {
        if (child && typeof child === "object" && (child as Record<string, unknown>).type) {
          count += countDecisions(child);
        }
      }
    } else if (val && typeof val === "object" && (val as Record<string, unknown>).type) {
      count += countDecisions(val);
    }
  }
  return count;
}

interface HalsteadResult {
  volume: number;
  effort: number;
  estimatedBugs: number;
}

interface FuncResult {
  name: string;
  cc: number;
  loc: number;
  halstead: HalsteadResult;
}

/** Extract all function-like nodes from the AST with CC + per-function Halstead */
function analyzeFunctions(ast: unknown): FuncResult[] {
  const results: FuncResult[] = [];

  function visit(node: unknown): void {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    const t = n.type as string | undefined;

    if (t && FUNCTION_NODES.has(t) && n.body) {
      const body = n.body as Record<string, unknown>;
      const cc = 1 + countDecisions(body);
      const loc =
        n.loc && typeof n.loc === "object"
          ? ((n.loc as Record<string, Record<string, number>>).end.line -
              (n.loc as Record<string, Record<string, number>>).start.line +
              1)
          : 5; // default fallback
      // Compute Halstead per function body (mirrors radon's per-function approach)
      const hal = collectHalstead(body);
      results.push({ name: "<function>", cc, loc, halstead: hal });
    }

    for (const val of Object.values(n)) {
      if (Array.isArray(val)) {
        for (const child of val) {
          if (child && typeof child === "object" && (child as Record<string, unknown>).type) {
            visit(child);
          }
        }
      } else if (val && typeof val === "object" && (val as Record<string, unknown>).type) {
        visit(val);
      }
    }
  }

  visit(ast);
  return results;
}

// ─── Halstead Analysis ───────────────────────────────────────────────────────

function collectHalstead(ast: unknown): {
  n1: number; n2: number; N1: number; N2: number;
  volume: number; effort: number; estimatedBugs: number;
} {
  const ops = new Map<string, number>();
  const opds = new Map<string, number>();

  function addOp(op: string) { ops.set(op, (ops.get(op) ?? 0) + 1); }
  function addOpd(opd: string) { opds.set(opd, (opds.get(opd) ?? 0) + 1); }

  function visit(node: unknown): void {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;

    // Halstead operators: arithmetic, comparison, logical, assignment, unary
    // Excludes MemberExpression and CallExpression — these are structural, not
    // semantic operators (radon/Halstead classic definition excludes them too)
    switch (n.type as string) {
      case "BinaryExpression":
      case "LogicalExpression":
        addOp(n.operator as string);
        break;
      case "UnaryExpression":
        addOp(`unary_${n.operator as string}`);
        break;
      case "AssignmentExpression":
        addOp(n.operator as string);
        break;
      case "UpdateExpression":
        addOp(n.operator as string);
        break;
      case "ConditionalExpression":
        addOp("?:");
        break;
      case "Identifier":
        if (n.name && typeof n.name === "string") addOpd(n.name);
        break;
      case "Literal":
        addOpd(String(n.value));
        break;
    }

    for (const val of Object.values(n)) {
      if (Array.isArray(val)) {
        for (const child of val) {
          if (child && typeof child === "object" && (child as Record<string, unknown>).type) {
            visit(child);
          }
        }
      } else if (val && typeof val === "object" && (val as Record<string, unknown>).type) {
        visit(val);
      }
    }
  }

  visit(ast);

  const n1 = ops.size;
  const n2 = opds.size;
  const N1 = Array.from(ops.values()).reduce((a, b) => a + b, 0);
  const N2 = Array.from(opds.values()).reduce((a, b) => a + b, 0);
  const vocabulary = n1 + n2;
  const length = N1 + N2;
  const volume = vocabulary > 0 ? length * Math.log2(Math.max(vocabulary, 1)) : 0;
  const difficulty = n2 > 0 ? (n1 / 2) * (N2 / n2) : 0;
  const effort = difficulty * volume;
  const estimatedBugs = volume / 3000;

  return { n1, n2, N1, N2, volume, effort, estimatedBugs };
}

// ─── MI Calculation ──────────────────────────────────────────────────────────

function computeMI(halsteadVolume: number, avgCC: number, loc: number): number {
  if (loc <= 0) return 100;
  const mi =
    171 -
    5.2 * Math.log(Math.max(halsteadVolume, 1)) -
    0.23 * avgCC -
    16.2 * Math.log(Math.max(loc, 1));
  return Math.max(0, Math.min(100, (mi * 100) / 171));
}

// ─── Collect Complexity ───────────────────────────────────────────────────────

function collectComplexity() {
  const files = findTsFiles(SRC);
  const perFile: Record<string, number> = {};
  const perFileMI: Record<string, number> = {};
  const allCC: number[] = [];
  let totalFunctions = 0;
  let totalEstimatedBugs = 0;
  let totalEffort = 0;
  let filesAnalyzed = 0;

  for (const filePath of files) {
    const relPath = relative(ROOT, filePath);
    try {
      const source = readFileSync(filePath, "utf8");
      const ast = parse(source, {
        loc: true,
        range: false,
        jsx: false,
        errorOnUnknownASTType: false,
      });

      const funcs = analyzeFunctions(ast);

      if (funcs.length > 0) {
        const fileCCs = funcs.map((f) => f.cc);
        const avgCC = fileCCs.reduce((a, b) => a + b, 0) / fileCCs.length;
        perFile[relPath] = Number(avgCC.toFixed(2));
        allCC.push(...fileCCs);
        totalFunctions += funcs.length;

        // MI per function (mirrors radon: use each function's own LOC + Halstead)
        const funcMIs = funcs.map((f) => computeMI(f.halstead.volume, f.cc, f.loc));
        perFileMI[relPath] = Number(
          (funcMIs.reduce((a, b) => a + b, 0) / funcMIs.length).toFixed(2),
        );

        for (const f of funcs) {
          totalEstimatedBugs += f.halstead.estimatedBugs;
          totalEffort += f.halstead.effort;
        }
      } else {
        perFile[relPath] = 1;
        allCC.push(1);
        totalFunctions += 1;
        perFileMI[relPath] = 100; // files with no functions are trivially maintainable
      }

      filesAnalyzed++;
    } catch {
      // skip unparseable files
    }
  }

  const avg = allCC.length > 0 ? allCC.reduce((a, b) => a + b, 0) / allCC.length : 0;
  const max = allCC.length > 0 ? Math.max(...allCC) : 0;
  const min = allCC.length > 0 ? Math.min(...allCC) : 0;

  const avgMI =
    Object.values(perFileMI).length > 0
      ? Object.values(perFileMI).reduce((a, b) => a + b, 0) / Object.values(perFileMI).length
      : 0;
  const maxMI = Object.values(perFileMI).length > 0 ? Math.max(...Object.values(perFileMI)) : 0;
  const minMI = Object.values(perFileMI).length > 0 ? Math.min(...Object.values(perFileMI)) : 0;

  return {
    cyclomatic_complexity: {
      summary: {
        average: Number(avg.toFixed(2)),
        max: Number(max.toFixed(2)),
        min: Number(min.toFixed(2)),
        total_functions: totalFunctions,
        grade: gradeCC(avg),
        per_file: perFile,
      },
    },
    maintainability_index: {
      summary: {
        average: Number(avgMI.toFixed(2)),
        min: Number(minMI.toFixed(2)),
        max: Number(maxMI.toFixed(2)),
        grade: gradeMI(avgMI),
        per_file: perFileMI,
      },
    },
    halstead: {
      summary: {
        estimated_bugs: Number(totalEstimatedBugs.toFixed(4)),
        total_effort: Number(totalEffort.toFixed(2)),
        files_analyzed: filesAnalyzed,
      },
    },
  };
}

// ─── Collect Coverage ─────────────────────────────────────────────────────────

/**
 * Files excluded from vitest coverage (see vitest.config.ts coverage.exclude).
 * These are infrastructure files with no testable business logic.
 * We document them explicitly so the reported % is understood as intentional.
 */
const COVERAGE_EXCLUDED = [
  "src/main.ts",
  "src/app/core/telemetry.ts",
  "src/app/core/database.ts",
  "src/app/repositories/drizzle",
];

function collectCoverage() {
  const coverageFile = join(ROOT, "coverage", "coverage-final.json");
  if (!existsSync(coverageFile)) {
    return {
      error: "coverage/coverage-final.json não encontrado — execute `npm run test:coverage` primeiro",
      percent: 0,
      reported_coverage: 0,
      covered_lines: 0,
      missing_lines: 0,
      num_statements: 0,
      by_file: {} as Record<string, number>,
      excluded_files: COVERAGE_EXCLUDED,
      excluded_note: "Arquivos de infraestrutura sem lógica testável",
    };
  }

  const data = JSON.parse(readFileSync(coverageFile, "utf8")) as Record<
    string,
    { s: Record<string, number>; statementMap: Record<string, unknown> }
  >;

  const byFile: Record<string, number> = {};
  let totalStatements = 0;
  let coveredStatements = 0;

  // Covered files (those included in vitest coverage report)
  for (const [absPath, fileData] of Object.entries(data)) {
    const relPath = relative(ROOT, absPath);
    const stmts = fileData.s ?? {};
    const total = Object.keys(stmts).length;
    const covered = Object.values(stmts).filter((v) => v > 0).length;
    totalStatements += total;
    coveredStatements += covered;
    byFile[relPath] = total > 0 ? Number(((covered / total) * 100).toFixed(2)) : 100;
  }

  const reportedCoverage = totalStatements > 0
    ? Number(((coveredStatements / totalStatements) * 100).toFixed(2))
    : 0;

  // Count statements in excluded files to compute real coverage
  let excludedStatements = 0;
  for (const file of findTsFiles(SRC)) {
    const relPath = relative(ROOT, file);
    const isExcluded = COVERAGE_EXCLUDED.some((excl) => relPath.startsWith(excl));
    if (isExcluded) {
      try {
        const source = readFileSync(file, "utf8");
        const ast = parse(source, { loc: false, range: false, jsx: false, errorOnUnknownASTType: false });
        // Rough statement count: count top-level statement-like nodes via AST
        function countStmts(node: unknown): number {
          if (!node || typeof node !== "object") return 0;
          const n = node as Record<string, unknown>;
          let c = 0;
          const STMT_TYPES = new Set([
            "ExpressionStatement", "VariableDeclaration", "ReturnStatement",
            "IfStatement", "ThrowStatement", "TryStatement", "ForStatement",
            "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement",
          ]);
          if (STMT_TYPES.has(n.type as string)) c = 1;
          for (const val of Object.values(n)) {
            if (Array.isArray(val)) for (const child of val) c += countStmts(child);
            else if (val && typeof val === "object") c += countStmts(val);
          }
          return c;
        }
        excludedStatements += countStmts(ast);
      } catch {
        excludedStatements += 10; // conservative estimate if unparseable
      }
    }
  }

  const realTotal = totalStatements + excludedStatements;
  const realCoverage = realTotal > 0
    ? Number(((coveredStatements / realTotal) * 100).toFixed(2))
    : reportedCoverage;

  // Parse test counts from vitest JSON reporter
  let testsPassed = 0;
  let testsFailed = 0;
  let testsTotal = 0;
  const vitestResult = run("npx vitest run --reporter=json 2>/dev/null");
  try {
    const vj = JSON.parse(vitestResult.stdout) as {
      numPassedTests?: number;
      numFailedTests?: number;
      numTotalTests?: number;
    };
    testsPassed = vj.numPassedTests ?? 0;
    testsFailed = vj.numFailedTests ?? 0;
    testsTotal = vj.numTotalTests ?? (testsPassed + testsFailed);
  } catch {
    const m = vitestResult.stdout.match(/(\d+)\s+passed/);
    if (m) testsPassed = Number(m[1]);
    testsTotal = testsPassed;
  }

  return {
    // reported_coverage: coverage % considering only included files (vitest config)
    reported_coverage: reportedCoverage,
    // real_coverage: coverage % including excluded infrastructure files (always 0% for them)
    real_coverage: realCoverage,
    percent: reportedCoverage, // kept for backwards compat with existing report consumers
    covered_lines: coveredStatements,
    missing_lines: totalStatements - coveredStatements,
    num_statements: totalStatements,
    excluded_statements_estimate: excludedStatements,
    by_file: byFile,
    excluded_files: COVERAGE_EXCLUDED,
    excluded_note: "Arquivos de infraestrutura excluídos propositalmente (sem lógica testável)",
    tests_passed: testsPassed,
    tests_failed: testsFailed,
    tests_total: testsTotal,
  };
}

// ─── Collect Lint (Biome) ─────────────────────────────────────────────────────

function collectLint() {
  const { stdout } = run("npx biome check --reporter=json src/");

  let diagnostics: Array<{
    category?: string;
    severity?: string;
  }> = [];

  try {
    const parsed = JSON.parse(stdout) as { diagnostics?: typeof diagnostics };
    diagnostics = parsed.diagnostics ?? [];
  } catch {
    // stdout might have mixed content — try extracting JSON
    const match = stdout.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as { diagnostics?: typeof diagnostics };
        diagnostics = parsed.diagnostics ?? [];
      } catch {
        // ignore
      }
    }
  }

  const byType: Record<string, number> = {};
  let errors = 0;
  let warnings = 0;

  for (const d of diagnostics) {
    const sev = d.severity ?? "warning";
    if (sev === "error" || sev === "fatal") errors++;
    else warnings++;

    // Extract category group (e.g., lint/suspicious/noDebugger → suspicious)
    const parts = (d.category ?? "other").split("/");
    const group = parts.length >= 2 ? parts[1] : parts[0];
    byType[group] = (byType[group] ?? 0) + 1;
  }

  const totalIssues = errors + warnings;
  const files = findTsFiles(SRC).length;
  // Score 0–10: penalize errors more than warnings
  const score = Math.max(0, 10 - (errors * 2 + warnings * 0.5) / Math.max(1, files));

  return {
    lint: {
      summary: {
        total_issues: totalIssues,
        by_type: byType,
        score_line: `Biome: ${errors} errors, ${warnings} warnings (${totalIssues} total)`,
        score: Number(score.toFixed(2)),
      },
    },
  };
}

// ─── Collect Audit (npm audit) ────────────────────────────────────────────────

function collectAudit() {
  const { stdout } = run("npm audit --json");

  let vulns: { info: number; low: number; moderate: number; high: number; critical: number; total: number } =
    { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };

  try {
    const parsed = JSON.parse(stdout) as {
      metadata?: { vulnerabilities?: typeof vulns };
    };
    vulns = parsed.metadata?.vulnerabilities ?? vulns;
  } catch {
    // ignore
  }

  const passed = vulns.high === 0 && vulns.critical === 0;
  const summary = [
    vulns.critical > 0 ? `${vulns.critical} critical` : null,
    vulns.high > 0 ? `${vulns.high} high` : null,
    vulns.moderate > 0 ? `${vulns.moderate} moderate` : null,
    vulns.low > 0 ? `${vulns.low} low` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    security: {
      passed,
      output: summary
        ? `npm audit: ${summary} vulnerabilities`
        : "npm audit: no vulnerabilities found",
      thresholds: {
        max_absolute: "0 high/critical",
        max_modules: "0 high/critical",
        max_average: "—",
      },
    },
  };
}

// ─── Grades ───────────────────────────────────────────────────────────────────

function gradeCC(avg: number): string {
  if (avg <= 5) return "A";
  if (avg <= 10) return "B";
  if (avg <= 15) return "C";
  if (avg <= 20) return "D";
  if (avg <= 25) return "E";
  return "F";
}

function gradeMI(avg: number): string {
  if (avg >= 85) return "A";
  if (avg >= 65) return "B";
  if (avg >= 40) return "C";
  if (avg >= 20) return "D";
  return "F";
}

// ─── Markdown Generator ───────────────────────────────────────────────────────

function generateMarkdown(report: Record<string, unknown>): string {
  const ts = report.generated_at as string;
  const cc = (report.cyclomatic_complexity as { summary: Record<string, unknown> }).summary;
  const mi = (report.maintainability_index as { summary: Record<string, unknown> }).summary;
  const hal = (report.halstead as { summary: Record<string, unknown> }).summary;
  const cov = report.test_coverage as Record<string, unknown>;
  const lint = (report.lint as { summary: Record<string, unknown> }).summary;
  const sec = report.security as Record<string, unknown>;

  const lines = [
    `# Relatório de Métricas — ${report.project}`,
    ``,
    `Gerado em: \`${ts}\``,
    ``,
    `## Complexidade Ciclomática (CC)`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Média   | ${cc.average} |`,
    `| Máximo  | ${cc.max} |`,
    `| Mínimo  | ${cc.min} |`,
    `| Funções | ${cc.total_functions} |`,
    `| Grade   | ${cc.grade} |`,
    ``,
    `## Índice de Manutenibilidade (MI)`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Média   | ${mi.average} |`,
    `| Máximo  | ${mi.max} |`,
    `| Mínimo  | ${mi.min} |`,
    `| Grade   | ${mi.grade} |`,
    ``,
    `## Halstead`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Bugs estimados | ${(hal.estimated_bugs as number).toFixed(4)} |`,
    `| Esforço total  | ${Math.round(hal.total_effort as number)} |`,
    `| Arquivos       | ${hal.files_analyzed} |`,
    ``,
    `## Cobertura de Testes`,
    ``,
    `> **Nota:** \`reported_coverage\` considera apenas arquivos incluídos no vitest (exclui infra).`,
    `> \`real_coverage\` inclui estimativa dos arquivos de infraestrutura (sempre 0% cobertos).`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Cobertura reportada | ${(cov as Record<string, unknown>).reported_coverage ?? cov.percent}% |`,
    `| Cobertura real (c/ infra) | ${(cov as Record<string, unknown>).real_coverage ?? "N/A"}% |`,
    `| Linhas cobertas | ${cov.covered_lines} |`,
    `| Linhas faltando | ${cov.missing_lines} |`,
    `| Total stmts (incluídos) | ${cov.num_statements} |`,
    `| Stmts excluídos (estimativa) | ${(cov as Record<string, unknown>).excluded_statements_estimate ?? "N/A"} |`,
    ``,
    `**Arquivos excluídos da cobertura:**`,
    ``,
    ...((cov as Record<string, unknown>).excluded_files as string[] ?? []).map((f) => `- \`${f}\``),
    ``,
    `## Lint (Biome)`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Total issues | ${lint.total_issues} |`,
    `| Score (0–10) | ${lint.score} |`,
    `| Resumo       | ${lint.score_line} |`,
    ``,
    `## Segurança (npm audit)`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Status  | ${(sec.passed as boolean) ? "✅ Passou" : "❌ Falhou"} |`,
    `| Resultado | ${sec.output} |`,
    ``,
    `---`,
    ``,
    `## Arquivos de Saída`,
    ``,
    `| Arquivo | Conteúdo |`,
    `|---------|----------|`,
    `| \`report_${ts}.json\` | Dados brutos completos |`,
    `| \`report_${ts}.md\`   | Este relatório |`,
  ];

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // Parse --output-dir argument
  let outputDir = join(ROOT, "metrics");
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--output-dir");
  if (outIdx !== -1 && args[outIdx + 1]) {
    outputDir = resolve(args[outIdx + 1]);
  }

  mkdirSync(outputDir, { recursive: true });

  const ts = new Date()
    .toISOString()
    .replace("T", "_")
    .replace(/:/g, "")
    .slice(0, 15);

  console.log(`📊 Coletando métricas de ${SRC}...`);

  console.log("  → Analisando complexidade (CC/MI/Halstead)...");
  const complexity = collectComplexity();

  console.log("  → Lendo cobertura de testes...");
  const coverage = collectCoverage();

  console.log("  → Executando biome check...");
  const lint = collectLint();

  console.log("  → Executando npm audit...");
  const audit = collectAudit();

  const report = {
    generated_at: ts,
    project: PROJECT,
    ...complexity,
    test_coverage: coverage,
    ...lint,
    ...audit,
  };

  const base = join(outputDir, `report_${ts}`);

  const jsonPath = `${base}.json`;
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ JSON  → ${jsonPath}`);

  const mdPath = `${base}.md`;
  writeFileSync(mdPath, generateMarkdown(report));
  console.log(`✅ MD    → ${mdPath}`);

  const cc = report.cyclomatic_complexity.summary;
  const cov = report.test_coverage;
  const sec = report.security;

  console.log(`\n📋 Resumo:`);
  const covTyped = cov as { percent: number; reported_coverage?: number; real_coverage?: number };
  console.log(`   CC avg:           ${cc.average} (${cc.grade})`);
  console.log(`   MI avg:           ${report.maintainability_index.summary.average}`);
  console.log(`   Cobertura:        ${covTyped.reported_coverage ?? covTyped.percent}% (reportada)`);
  console.log(`   Cobertura real:   ${covTyped.real_coverage ?? "N/A"}% (com infra excluída)`);
  console.log(`   Lint score:       ${report.lint.summary.score}/10`);
  console.log(`   Segurança:        ${sec.passed ? "✅" : "❌"} ${sec.output}`);
}

main();
