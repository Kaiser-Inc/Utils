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
  snake = class_name.gsub(/(.)([A-Z][a-z]+)/, '\1_\2')
                    .gsub(/([a-z\d])([A-Z])/, '\1_\2')
                    .downcase
  # Try common Rails paths
  ["app/controllers/#{snake}_controller.rb",
   "app/models/#{snake}.rb",
   "app/services/#{snake}.rb",
   "lib/#{snake}.rb"].first || "unknown"
end

def empty_complexity
  {
    summary: {
      average: 0, max: 0, min: 0, total_functions: 0, grade: "N/A", per_file: {}
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
  score = [0, 10 - offense_rate].max.round(2)

  summary_data = parsed["summary"] || {}
  inspected    = summary_data["inspected_file_count"] || total_files

  {
    pylint: {
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
    pylint: {
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
    xenon: {
      passed:     passed,
      output:     output_line,
      thresholds: {
        max_absolute: "0 brakeman warnings",
        max_modules:  "0 bundler-audit vulnerabilities",
        max_average:  "brakeman + bundler-audit"
      }
    }
  }
end

# ─── Grade Helpers ────────────────────────────────────────────────────────────

def grade_cc(avg)
  # Flog scores: <10 good, <20 fair, <40 bad, >40 terrible
  # Map to A–F like Python CC grades
  if    avg <= 10 then "A"
  elsif avg <= 20 then "B"
  elsif avg <= 30 then "C"
  elsif avg <= 40 then "D"
  elsif avg <= 50 then "E"
  else                 "F"
  end
end

# ─── Markdown Generator ───────────────────────────────────────────────────────

def generate_markdown(report)
  ts   = report[:generated_at]
  cc   = report[:cyclomatic_complexity][:summary]
  cov  = report[:test_coverage]
  lint = report[:pylint][:summary]
  sec  = report[:xenon]

  lines = []
  lines << "# Relatório de Métricas — #{report[:project]}"
  lines << ""
  lines << "Gerado em: `#{ts}`"
  lines << ""
  lines << "## Complexidade (Flog)"
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Média   | #{cc[:average]} |"
  lines << "| Máximo  | #{cc[:max]} |"
  lines << "| Mínimo  | #{cc[:min]} |"
  lines << "| Métodos | #{cc[:total_functions]} |"
  lines << "| Grade   | #{cc[:grade]} |"
  lines << ""
  lines << "## Cobertura de Testes (SimpleCov)"
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Total   | #{cov[:percent]}% |"
  lines << "| Cobertos| #{cov[:covered_lines]} |"
  lines << "| Faltando| #{cov[:missing_lines]} |"
  lines << "| Total   | #{cov[:num_statements]} |"
  lines << ""
  lines << "## Lint (RuboCop)"
  lines << ""
  lines << "| Métrica | Valor |"
  lines << "|---------|-------|"
  lines << "| Total   | #{lint[:total_issues]} |"
  lines << "| Score   | #{lint[:score]}/10 |"
  lines << "| Resumo  | #{lint[:score_line]} |"
  lines << ""
  lines << "## Segurança (Brakeman + bundler-audit)"
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

  puts_step "Analisando complexidade (Flog)"
  cc_data = collect_flog

  puts_step "Lendo cobertura de testes (SimpleCov)"
  coverage = collect_coverage

  puts_step "Executando RuboCop"
  lint = collect_lint

  puts_step "Executando Brakeman + bundler-audit"
  security = collect_security

  report = {
    generated_at:            ts,
    project:                 PROJECT,
    cyclomatic_complexity:   cc_data,
    maintainability_index: {
      summary: {
        average: 0, min: 0, max: 0,
        grade:    "N/A",
        per_file: {}
      }
    },
    halstead: {
      summary: {
        estimated_bugs: 0,
        total_effort:   0,
        files_analyzed: 0
      }
    },
    test_coverage: coverage,
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
  cov_sum = report[:test_coverage]
  sec_sum = report[:xenon]

  puts "\n📋 Resumo:"
  puts "   CC avg:      #{cc_sum[:average]} (#{cc_sum[:grade]})"
  puts "   Cobertura:   #{cov_sum[:percent]}%"
  puts "   Lint score:  #{report[:pylint][:summary][:score]}/10"
  puts "   Segurança:   #{sec_sum[:passed] ? "✅" : "❌"} #{sec_sum[:output]}"
end

main
