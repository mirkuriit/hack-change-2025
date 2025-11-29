FROM python:3.13-slim

WORKDIR /src

RUN mkdir -p /src/data

COPY . /src

RUN pip install uv

RUN uv sync --locked

ENV FASTAPI_PORT=8000

CMD ["sh", "-c", "uv run uvicorn src.main:app --host 0.0.0.0 --port ${FASTAPI_PORT}"]
