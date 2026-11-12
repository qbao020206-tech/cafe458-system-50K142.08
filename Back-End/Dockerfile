FROM python:3.12-slim

WORKDIR /app

ENV TZ=Asia/Ho_Chi_Minh \
    DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && python scripts/seed_owner.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
