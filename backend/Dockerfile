FROM python:3.12.15-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt requirements-prod.txt ./
RUN pip install -r requirements-prod.txt

RUN useradd --create-home --uid 1000 app \
    && mkdir -p /app/staticfiles \
    && chown app /app/staticfiles

COPY . .

USER app

EXPOSE 8000

CMD ["sh", "docker-entrypoint.sh"]
