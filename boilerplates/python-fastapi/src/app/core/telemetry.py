from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from app.core.database import engine


def configure_telemetry(app: FastAPI, service_name: str, otlp_version: str) -> None:
    resource = Resource.create(attributes={"service_name": service_name})
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    exporter = OTLPSpanExporter(endpoint=otlp_version, insecure=True)
    processor = BatchSpanProcessor(exporter)
    provider.add_span_processor(processor)

    FastAPIInstrumentor().instrument_app(app)
    SQLAlchemyInstrumentor().instrument(
        engine=engine,
    )
