require "opentelemetry/sdk"
require "opentelemetry/instrumentation/rails"
require "opentelemetry/instrumentation/active_record"
require "opentelemetry/exporter/otlp"

OpenTelemetry::SDK.configure do |c|
  c.service_name = ENV.fetch("OTEL_SERVICE_NAME", "rails-boilerplate")

  c.add_span_processor(
    OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
      OpenTelemetry::Exporter::OTLP::Exporter.new(
        endpoint: ENV.fetch("OTLP_ENDPOINT", "http://localhost:4317")
      )
    )
  )

  c.use "OpenTelemetry::Instrumentation::Rails"
  c.use "OpenTelemetry::Instrumentation::ActiveRecord"
end
