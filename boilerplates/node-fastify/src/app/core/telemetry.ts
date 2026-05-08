import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { settings } from "./settings.js";

export function setupTelemetry(): NodeSDK {
  const exporter = new OTLPTraceExporter({
    url: settings.OTLP_ENDPOINT,
  });

  const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk.shutdown().finally(() => process.exit(0));
  });

  return sdk;
}
