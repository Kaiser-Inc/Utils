#!/usr/bin/env ruby
# frozen_string_literal: true

# scripts/metrics.rb — Ruby on Rails quality metrics
# Produces JSON in MetriKa-compatible schema
#
# Usage:
#   bundle exec ruby scripts/metrics.rb
#   bundle exec ruby scripts/metrics.rb --output-dir /custom/path
#
# Prerequisites:
#   bundle exec rspec  → gera coverage/.last_run.json via SimpleCov

require "json"
require "open3"
require "date"
require "fileutils"
require "optparse"

ROOT    = File.expand_path("..", __dir__)
PROJECT = "ruby-on-rails"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def run(cmd)
  stdout, stderr, status = Open3.capture3(cmd, chdir: ROOT)
  { code: status.exitstatus, stdout: stdout.to_s, stderr: stderr.to_s }
end

def check_tool(bin)
  result = run("which #{bin}")
  result[:code].zero?
end

def puts_step(msg)
  puts "  → #{msg}..."
end

# ─── Collect Complexity (Flog) ────────────────────────────────────────────────

def collect_flog
  # flog outputs per-method scores: "  12.3: ClassName#method  path/to/file.rb:10"
  result = run("bundle exec flog --all app/ lib/")
  output = result[:stdout]

  methods   = []
  by_file   = Hash.new { |h, k| h[k] = [] }

  # Header lines: "   17.9: flog total", "    8.9: flog/method average"
  # Method lines: "   12.3: ClassName#method              path/file.rb:10"
  output.each_line do |line|
    next if line =~ /flog total|flog\/method average|^\s*$/

    # Match method lines with optional file path
    if (m = line.match(/^\s*([\d.]+):\s+([^\s]+)\s*(\S+:\d+)?\s*$/))
      score    = m[1].to_f
      method   = m[2]
      location = m[3]

      file_key = if location
                   location.sub(/:(\d+)$/, "").strip
      else
                   # Infer file from class name heuristics
                   class_name = method.split("#").first.split(".").last
                   guessed_file(class_name)
      end

      methods << { name: method, score: score, file: file_key }
      by_file[file_key] << score
    end
  end

  return empty_complexity if methods.empty?

  scores   = methods.map { |m| m[:score] }
  avg      = scores.sum / scores.size.to_f
  per_file = by_file.transform_values { |s| (s.sum / s.size.to_f).round(2) }

  {
    summary: {
      average:         avg.round(2),
      max:             scores.max.round(2),
      min:             scores.min.round(2),
      total_functions: methods.size,
      grade:           grade_cc(avg),
      per_file:        per_file
    }
  }
rescue StandardError => e
  { error: e.message, summary: empty_complexity[:summary] }
end

def guessed_file(class_name)
  # Strip well-known Rails suffixes before snake-casing to avoid double-suffix
  # e.g. "ApplicationController" → "Application" → "application_controller.rb"
  base = class_name
           .sub(/Controller$/, "")
           .sub(/Service$/, "")
           .sub(/Model$/, "")
           .sub(/Concern$/, "")
  snake = base.gsub(/(.)([A-Z][a-z]+)/, '\1_\2')
              .gsub(/([a-z\d])([A-Z])/, '\1_\2')
              .downcase
  candidates = case class_name
  when /Controller$/ then [ "app/controllers/#{snake}_controller.rb",
                                        "app/controllers/concerns/#{snake}.rb" ]
  when /Service$/    then [ "app/services/#{snake}_service.rb",
                                        "app/organizers/#{snake}_service.rb" ]
  else                    [ "app/models/#{snake}.rb",
                                        "app/services/#{snake}.rb",
                                        "lib/#{snake}.rb" ]
  end
  # Return first path that actually exists, else best guess
  candidates.find { |f| File.exist?(File.join(ROOT, f)) } ||
    candidates.first ||
    "unknown"
end

def empty_complexity
  {
    summary: {
      average: 0, max: 0, min: 0, total_functions: 0, grade: "N/A", per_file: {}
    }
  }
end

# ─── Collect CC via RuboCop (McCabe) ─────────────────────────────────────────

def collect_rubocop_cc
  # Use a temp config that sets Max: 1 so RuboCop reports ALL methods (not just violating ones).
  # Each offense message has the actual complexity: "Cyclomatic complexity for foo is too high. [8/1]"
  tmp_path = File.join(ROOT, ".rubocop_metrics_tmp.yml")

  begin
    File.write(tmp_path, <<~YAML)
      inherit_from: .rubocop.yml
      Metrics/CyclomaticComplexity:
        Enabled: true
        Max: 1
    YAML

    result = run("bundle exec rubocop --config .rubocop_metrics_tmp.yml --only Metrics/CyclomaticComplexity --format json app/ lib/")
  ensure
    File.delete(tmp_path) rescue nil
  end

  begin
    parsed = JSON.parse(result[:stdout])
  rescue JSON::ParserError
    return empty_complexity
  end

  files_data = parsed["files"] || []
  per_file   = {}
  all_cc     = []
  total_fns  = 0

  files_data.each do |f|
    file_key = f["path"].to_s.sub("#{ROOT}/", "")
    file_ccs = []

    (f["offenses"] || []).each do |o|
      # Extract actual CC from message bracket notation: "[8/1]"
      if (m = o["message"].match(/\[(\d+)\/\d+\]/))
        cc = m[1].to_i
        file_ccs << cc
        all_cc << cc
        total_fns += 1
      end
    end

    per_file[file_key] = (file_ccs.sum.to_f / file_ccs.size).round(2) if file_ccs.any?
  end

  return empty_complexity if all_cc.empty?

  avg = all_cc.sum.to_f / all_cc.size
  {
    summary: {
      average:         avg.round(2),
      max:             all_cc.max,
      min:             all_cc.min,
      total_functions: total_fns,
      grade:           grade_cc_mccabe(avg),
      per_file:        per_file
    }
  }
rescue StandardError => e
  { error: e.message, summary: empty_complexity[:summary] }
end

# ─── Collect Halstead via Ruby Ripper ────────────────────────────────────────

def collect_halstead_ripper
  require "ripper"

  # Structural keywords — declaration/block delimiters, not computational operators.
  # Halstead counts only operators that affect program logic/computation.
  # Kept: if, unless, while, until, for, case, when, return, yield, raise, rescue,
  #        and, or, not, nil, true, false, else, elsif, then, in, break, next, retry.
  structural_kw = %w[def end class module do begin ensure self super alias undef].freeze

  ruby_files = Dir.glob(File.join(ROOT, "app/**/*.rb")) +
               Dir.glob(File.join(ROOT, "lib/**/*.rb"))

  total_bugs    = 0.0
  total_effort  = 0.0
  files_analyzed = 0
  per_file_volume = {}

  ruby_files.each do |file|
    source = File.read(file, encoding: "utf-8")
    tokens = Ripper.lex(source)

    ops  = Hash.new(0) # operators
    opds = Hash.new(0) # operands

    tokens.each do |_pos, type, value|
      case type
      when :on_op
        ops[value] += 1
      when :on_kw
        # Keep control-flow / logical / boolean keywords as operators (if, while,
        # return, and, or, not, nil, true, false, rescue, raise, yield, etc.).
        # Exclude purely structural keywords that inflate vocabulary artificially.
        next if structural_kw.include?(value)
        ops[value] += 1
      when :on_ident, :on_const, :on_cvar, :on_ivar, :on_gvar
        opds[value] += 1
      when :on_int, :on_float, :on_tstring_content
        opds[value] += 1
      end
    end

    n1 = ops.keys.size
    n2 = opds.keys.size
    n1_total = ops.values.sum
    n2_total = opds.values.sum

    vocab  = n1 + n2
    length = n1_total + n2_total
    volume = vocab > 0 ? length * Math.log2([ vocab, 1 ].max) : 0.0
    difficulty = n2 > 0 ? (n1.to_f / 2) * (n2_total.to_f / n2) : 0.0
    effort = difficulty * volume
    estimated_bugs = volume / 3000.0

    rel = file.sub("#{ROOT}/", "")
    per_file_volume[rel] = volume.round(2)
    total_bugs   += estimated_bugs
    total_effort += effort
    files_analyzed += 1
  rescue StandardError
    next
  end

  {
    summary: {
      estimated_bugs: total_bugs.round(4),
      total_effort:   total_effort.round(2),
      files_analyzed: files_analyzed
    },
    per_file_volume: per_file_volume
  }
end

# ─── Compute MI per file ──────────────────────────────────────────────────────

def compute_maintainability(cc_per_file, hal_volume_per_file)
  ruby_files = Dir.glob(File.join(ROOT, "app/**/*.rb")) +
               Dir.glob(File.join(ROOT, "lib/**/*.rb"))

  loc_per_file = {}
  ruby_files.each do |file|
    rel = file.sub("#{ROOT}/", "")
    loc_per_file[rel] = File.readlines(file).reject { |l| l.strip.empty? || l.strip.start_with?("#") }.size
  rescue StandardError
    loc_per_file[rel] = 10
  end

  all_files = (cc_per_file.keys | hal_volume_per_file.keys).uniq
  all_mi = []
  per_file = {}

  all_files.each do |f|
    cc    = cc_per_file[f]     || 1.0
    vol   = hal_volume_per_file[f] || 0.0
    loc   = loc_per_file[f]    || 10

    raw = 171 - 5.2 * Math.log([ vol, 1 ].max) - 0.23 * cc - 16.2 * Math.log([ loc, 1 ].max)
    mi  = [ [ raw * 100.0 / 171.0, 0 ].max, 100 ].min.round(2)

    per_file[f] = mi
    all_mi << mi
  end

  return { summary: { average: 0.0, min: 0.0, max: 0.0, grade: "N/A", per_file: {} } } if all_mi.empty?

  avg = all_mi.sum / all_mi.size
  {
    summary: {
      average:  avg.round(2),
      min:      all_mi.min.round(2),
      max:      all_mi.max.round(2),
      grade:    grade_mi_ruby(avg),
      per_file: per_file
    }
  }
end

# ─── Collect Coverage (SimpleCov) ────────────────────────────────────────────

def collect_coverage
  # SimpleCov generates coverage/.last_run.json (summary only)
  # and coverage/coverage.json (per-file) when simplecov_json_formatter is used
  last_run = File.join(ROOT, "coverage", ".last_run.json")
  full_json = File.join(ROOT, "coverage", "coverage.json")

  # Prefer full coverage.json for per-file data
  if File.exist?(full_json)
    parse_full_coverage(full_json)
  elsif File.exist?(last_run)
    parse_last_run_coverage(last_run)
  else
    {
      error: "coverage/.last_run.json não encontrado — execute `bundle exec rspec` com SimpleCov configurado",
      percent:        0,
      covered_lines:  0,
      missing_lines:  0,
      num_statements: 0,
      by_file:        {}
    }
  end
end

def parse_full_coverage(path)
  data    = JSON.parse(File.read(path))
  by_file = {}

  total_lines   = 0
  covered_lines = 0

  # SimpleCov JSON format (simplecov_json_formatter):
  # { "meta": {...}, "coverage": { "/abs/path/file.rb" => { "lines" => [1, nil, 0, ...] } }, "groups": {} }
  # lines array: nil = not executable, 0 = not covered, n > 0 = covered
  coverage_hash = data["coverage"] || {}
  coverage_hash.each do |abs_path, file_data|
    lines = file_data.is_a?(Hash) ? (file_data["lines"] || []) : []
    executable = lines.compact          # remove nil (non-executable)
    covered    = executable.count { |n| n.to_i > 0 }
    missed     = executable.size - covered

    rel = abs_path.to_s.sub("#{ROOT}/", "")
    pct = executable.empty? ? 100.0 : (covered.to_f / executable.size * 100).round(2)
    by_file[rel] = pct

    total_lines   += executable.size
    covered_lines += covered
  end

  missing = total_lines - covered_lines
  pct     = total_lines.positive? ? (covered_lines.to_f / total_lines * 100).round(2) : 0

  # Parse test counts from .rspec_status (persisted by RSpec without re-running)
  tests_passed = 0
  tests_failed = 0
  rspec_status_file = File.join(ROOT, ".rspec_status")
  if File.exist?(rspec_status_file)
    File.readlines(rspec_status_file).each do |line|
      next if line.start_with?("example_id") || line.strip.empty?
      tests_passed += 1 if line.include?("| passed |")
      tests_failed += 1 if line.include?("| failed |")
    end
  end
  tests_total = tests_passed + tests_failed

  {
    percent:        pct,
    covered_lines:  covered_lines,
    missing_lines:  missing,
    num_statements: total_lines,
    by_file:        by_file,
    tests_passed:   tests_passed,
    tests_failed:   tests_failed,
    tests_total:    tests_total
  }
rescue StandardError => e
  { error: e.message, percent: 0, covered_lines: 0, missing_lines: 0, num_statements: 0, by_file: {} }
end

def parse_last_run_coverage(path)
  data = JSON.parse(File.read(path))
  # { "result": { "covered_percent": 87.5 }, "timestamp": "..." }
  result = data["result"] || {}
  pct    = (result["covered_percent"] || 0).round(2)

  {
    percent:        pct,
    covered_lines:  result["covered_lines"].to_i,
    missing_lines:  result["missed_lines"].to_i,
    num_statements: (result["covered_lines"].to_i + result["missed_lines"].to_i),
    by_file:        {}
  }
rescue StandardError => e
  { error: e.message, percent: 0, covered_lines: 0, missing_lines: 0, num_statements: 0, by_file: {} }
end

# ─── Collect Lint (RuboCop) ──────────────────────────────────────────────────

def collect_lint
  result = run("bundle exec rubocop --format json app/ lib/ spec/")
  output = result[:stdout]

  parsed = JSON.parse(output)
  files_data = parsed["files"] || []

  by_type = Hash.new(0)
  total_offenses = 0

  files_data.each do |f|
    (f["offenses"] || []).each do |o|
      cop_name = o["cop_name"] || "unknown"
      # RuboCop cop_name: "Style/StringLiterals" → group by "Style"
      group = cop_name.split("/").first || "other"
      by_type[group] += 1
      total_offenses += 1
    end
  end

  total_files = files_data.size
  # Score 0–10: similar to pylint scoring
  offense_rate = total_files.positive? ? total_offenses.to_f / total_files : 0
  score = [ 0, 10 - offense_rate ].max.round(2)

  summary_data = parsed["summary"] || {}
  inspected    = summary_data["inspected_file_count"] || total_files

  {
    lint: {
      summary: {
        total_issues: total_offenses,
        by_type:      by_type.transform_values(&:to_i),
        score_line:   "RuboCop: #{total_offenses} offenses in #{inspected} files",
        score:        score
      }
    }
  }
rescue StandardError => e
  {
    lint: {
      summary: {
        total_issues: 0,
        by_type:      {},
        score_line:   "RuboCop error: #{e.message}",
        score:        nil
      }
    }
  }
end

# ─── Collect Security (Brakeman + bundler-audit) ──────────────────────────────

def collect_security
  # Brakeman static analysis
  brakeman_result  = run("bundle exec brakeman -f json -q .")
  bundler_result   = run("bundle exec bundle-audit check --update")

  # Brakeman output
  brakeman_warnings = 0
  brakeman_errors   = 0

  begin
    brakeman_data     = JSON.parse(brakeman_result[:stdout])
    brakeman_warnings = (brakeman_data.dig("scan_info", "security_warnings") || 0).to_i
    brakeman_errors   = (brakeman_data.dig("scan_info", "errors") || 0).to_i
  rescue StandardError
    # ignore parse errors — brakeman may produce warnings on stderr
    brakeman_warnings = brakeman_result[:stderr].scan(/warning/i).size
  end

  # bundler-audit: exit code 0 = clean, 1 = vulnerabilities found
  bundler_clean     = bundler_result[:code].zero?
  bundler_vulns     = bundler_clean ? 0 : bundler_result[:stdout].scan(/Name:/).size

  passed = brakeman_warnings.zero? && brakeman_errors.zero? && bundler_clean

  parts = []
  parts << "Brakeman: #{brakeman_warnings} warnings" if brakeman_warnings.positive?
  parts << "Brakeman: #{brakeman_errors} errors"     if brakeman_errors.positive?
  parts << "bundler-audit: #{bundler_vulns} vulnerabilities" if !bundler_clean
  output_line = parts.empty? ? "Brakeman: clean, bundler-audit: clean" : parts.join(", ")

  {
    security: {
      passed:     passed,
      output:     output_line,
      thresholds: {
        max_absolute: "0 brakeman warnings",
        max_modules:  "0 bundler-audit vulnerabilities",
        max_average:  "—"
      }
    }
  }
end

# ─── Grade Helpers ────────────────────────────────────────────────────────────

# Flog scores: <10 good, <20 fair, <40 bad, >40 terrible
def grade_cc(avg)
  if    avg <= 10 then "A"
  elsif avg <= 20 then "B"
  elsif avg <= 30 then "C"
  elsif avg <= 40 then "D"
  elsif avg <= 50 then "E"
  else                 "F"
  end
end

# McCabe Cyclomatic Complexity grades (standard: A ≤ 5, B ≤ 10, etc.)
def grade_cc_mccabe(avg)
  if    avg <= 5  then "A (simples)"
  elsif avg <= 10 then "B (bem estruturado)"
  elsif avg <= 15 then "C (levemente complexo)"
  elsif avg <= 20 then "D (complexo)"
  elsif avg <= 25 then "E (muito complexo)"
  else                 "F (instável)"
  end
end

# Maintainability Index grades (0–100 scale)
def grade_mi_ruby(avg)
  if    avg >= 20 then "Alta manutenibilidade"
  elsif avg >= 10 then "Manutenibilidade moderada"
  else                 "Baixa manutenibilidade"
  end
end

# ─── Markdown Generator ───────────────────────────────────────────────────────

def generate_markdown(report)
  ts   = report[:generated_at]
  cc   = report[:cyclomatic_complexity][:summary]
  flog = report[:flog_score][:summary]
  mi   = report[:maintainability_index][:summary]
  hal  = report[:halstead][:summary]
  cov  = report[:test_coverage]
  lint = report[:lint][:summary]
  sec  = report[:security]

  lines = []
  lines << "# Relatório de Métricas — #{report[:project]}"
  lines << ""
  lines << "Gerado em: `#{ts}`"
  lines << ""
  lines << "## 1. Complexidade Ciclomática McCabe (RuboCop)"
  lines << ""
  lines << "Mede caminhos independentes de execução por método (McCabe 1976)."
  lines << "Referência: A ≤ 5 | B ≤ 10 | C ≤ 15 | D ≤ 20 | E ≤ 25 | F > 25"
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Média   | **#{cc[:average]}** |"
  lines << "| Máximo  | #{cc[:max]} |"
  lines << "| Mínimo  | #{cc[:min]} |"
  lines << "| Métodos analisados | #{cc[:total_functions]} |"
  lines << "| Classificação | **#{cc[:grade]}** |"
  lines << ""
  lines << "## 2. Índice de Manutenibilidade (MI)"
  lines << ""
  lines << "Fórmula: `171 - 5.2·ln(HalsteadVolume) - 0.23·CC - 16.2·ln(LOC)`. Escala 0–100."
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Média   | **#{mi[:average]}** |"
  lines << "| Mínimo  | #{mi[:min]} |"
  lines << "| Máximo  | #{mi[:max]} |"
  lines << "| Classificação | **#{mi[:grade]}** |"
  lines << ""
  lines << "## 3. Métricas de Halstead (Ripper)"
  lines << ""
  lines << "Derivadas de operadores/operandos via tokenização Ruby nativa."
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Bugs estimados | **#{hal[:estimated_bugs]}** |"
  lines << "| Esforço total  | #{hal[:total_effort]} |"
  lines << "| Arquivos       | #{hal[:files_analyzed]} |"
  lines << ""
  lines << "## 4. Flog Score (code pain metric)"
  lines << ""
  lines << "> Flog não é Complexidade Ciclomática. Mede 'dor de código' (assignments, branches, calls)."
  lines << "> Use para identificar métodos candidatos a refactoring, não como CC."
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Média   | #{flog[:average]} |"
  lines << "| Máximo  | #{flog[:max]} |"
  lines << "| Mínimo  | #{flog[:min]} |"
  lines << "| Métodos | #{flog[:total_functions]} |"
  lines << "| Grade (Flog) | #{flog[:grade]} |"
  lines << ""
  lines << "## 5. Cobertura de Testes (SimpleCov)"
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Total   | **#{cov[:percent]}%** |"
  lines << "| Cobertos| #{cov[:covered_lines]} |"
  lines << "| Faltando| #{cov[:missing_lines]} |"
  lines << "| Statements | #{cov[:num_statements]} |"
  lines << ""
  lines << "## 6. Lint (RuboCop)"
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Total   | #{lint[:total_issues]} |"
  lines << "| Score   | #{lint[:score]}/10 |"
  lines << "| Resumo  | #{lint[:score_line]} |"
  lines << ""
  lines << "## 7. Segurança (Brakeman + bundler-audit)"
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Status  | #{sec[:passed] ? "✅ Passou" : "❌ Falhou"} |"
  lines << "| Resultado | #{sec[:output]} |"
  lines << ""
  lines << "---"
  lines << ""
  lines << "## Arquivos de Saída"
  lines << ""
  lines << "| Arquivo | Conteúdo |"
  lines << "|---------|----------|"
  lines << "| `report_#{ts}.json` | Dados brutos completos |"
  lines << "| `report_#{ts}.md`   | Este relatório |"

  lines.join("\n")
end

# ─── Main ─────────────────────────────────────────────────────────────────────

def main
  output_dir = File.join(ROOT, "metrics")

  OptionParser.new do |opts|
    opts.on("--output-dir DIR", "Diretório de saída") { |d| output_dir = File.expand_path(d) }
  end.parse!

  FileUtils.mkdir_p(output_dir)

  ts = Time.now.strftime("%Y-%m-%d_%H%M%S")

  puts "📊 Coletando métricas de #{ROOT}..."

  puts_step "Complexidade Ciclomática McCabe (RuboCop)"
  cc_data = collect_rubocop_cc

  puts_step "Flog Score (code pain metric)"
  flog_data = collect_flog

  puts_step "Métricas Halstead (Ripper)"
  hal_data = collect_halstead_ripper

  puts_step "Índice de Manutenibilidade (CC + Halstead + LOC)"
  cc_per_file  = cc_data.dig(:summary, :per_file) || {}
  hal_vol_file = hal_data[:per_file_volume] || {}
  mi_data = compute_maintainability(cc_per_file, hal_vol_file)

  puts_step "Lendo cobertura de testes (SimpleCov)"
  coverage = collect_coverage

  puts_step "Executando RuboCop"
  lint = collect_lint

  puts_step "Executando Brakeman + bundler-audit"
  security = collect_security

  report = {
    generated_at:          ts,
    project:               PROJECT,
    cyclomatic_complexity: cc_data,
    flog_score:            flog_data,
    maintainability_index: mi_data,
    halstead:              { summary: hal_data[:summary] },
    test_coverage:         coverage,
    **lint,
    **security
  }

  base     = File.join(output_dir, "report_#{ts}")
  json_path = "#{base}.json"
  md_path   = "#{base}.md"

  File.write(json_path, JSON.pretty_generate(report))
  puts "\n✅ JSON  → #{json_path}"

  File.write(md_path, generate_markdown(report))
  puts "✅ MD    → #{md_path}"

  cc_sum  = report[:cyclomatic_complexity][:summary]
  mi_sum  = report[:maintainability_index][:summary]
  cov_sum = report[:test_coverage]
  sec_sum = report[:security]

  puts "\n📋 Resumo:"
  puts "   CC avg:      #{cc_sum[:average]} (#{cc_sum[:grade]})"
  puts "   MI avg:      #{mi_sum[:average]} (#{mi_sum[:grade]})"
  puts "   Cobertura:   #{cov_sum[:percent]}%"
  puts "   Lint score:  #{report[:lint][:summary][:score]}/10"
  puts "   Segurança:   #{sec_sum[:passed] ? "✅" : "❌"} #{sec_sum[:output]}"
end

main
