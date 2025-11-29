#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 table1 table2 table3 ..."
    exit 1
fi

mkdir -p src/{db,repositories,routers,service}

touch .env
touch Dockerfile
touch docker-compose.yml
touch src/__init__.py
touch src/db/__init__.py
touch src/repositories/__init__.py
touch src/routers/__init__.py
touch src/service/__init__.py
touch src/schemas/__init__.py

cat > src/db/base.py << EOF
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
EOF

cat > src/config.py << EOF
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB")
    API_PREFIX: str = os.getenv("API_PREFIX")

config = Settings()
EOF

cat > .env << EOF
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=meditron_db
API_PREFIX="meditron-api/"
EOF

cat > src/db/tables.py << EOF
import uuid

from sqlalchemy.orm import mapped_column
from sqlalchemy import text
from sqlalchemy import ForeignKey, String, Integer, Boolean
from sqlalchemy.orm import Mapped

from src.db.base import Base

EOF

for table in "$@"; do
    class_name=$(echo "$table" | sed 's/_\([a-z]\)/\U\1/g; s/^[a-z]/\U&/')
    cat >> src/db/tables.py << EOF


class ${class_name}(Base):
    __tablename__ = "${table}"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text('gen_random_uuid()')
    )
EOF
done

# Создание файла db/initial.py
cat > src/db/initial.py << 'EOF'
from sqlalchemy import create_engine

from src.config import config
from src.db.tables import *
from src.db.base import Base

engine = create_engine(
    f"postgresql+psycopg://{config.POSTGRES_USER}:{config.POSTGRES_PASSWORD}@{config.POSTGRES_HOST}:{config.POSTGRES_PORT}/{config.POSTGRES_DB}",
    echo=True
)

def create_db():
    Base.metadata.create_all(bind=engine)

def drop_db():
    Base.metadata.drop_all(bind=engine)
EOF

touch src/db/session.py
touch src/main.py

for table in "$@"; do
    touch "src/repositories/${table}_repository.py"
    touch "src/service/${table}_service.py"
    touch "src/routers/${table}_router.py"
    touch "src/schemas/${table}_router.py"
done

echo "The files were created"

echo "Initialize uv"

uv init .
uv add fastapi asyncpg psycopg psycopg2-binary pydantic pydantic-settings uvicorn[standard] alembic loguru

cat >> pyproject.toml << 'EOF'
[tool.uv.build-backend]
module-name = "src"
module-root = ""

[build-system]
requires = ["uv_build>=0.8.10,<0.9.0"]
build-backend = "uv_build"

[project.scripts]
drop-db = "src.db.initial:drop_db"
init-db = "src.db.initial:create_db"
EOF

echo "The files were created"
echo "Alembic initialized"

uv run alembic init "src/db/migrations"

cat > src/db/migrations/env.py << 'EOF'
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from src.config import config as db_config
config.set_main_option("sqlalchemy.url", f"postgresql+psycopg2://{db_config.POSTGRES_USER}:{db_config.POSTGRES_PASSWORD}@{db_config.POSTGRES_HOST}:{db_config.POSTGRES_PORT}/{db_config.POSTGRES_DB}")

from src.db.tables import *
from src.db.tables import Base
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

EOF

cat > Makefile << 'MAKE_EOF'
#!/usr/bin/make

ifneq ($(if $(MAKECMDGOALS),$(words $(MAKECMDGOALS)),1),1)
.SUFFIXES:
TARGET := $(if $(findstring :,$(firstword $(MAKECMDGOALS))),,$(firstword $(MAKECMDGOALS)))
PARAMS := $(if $(findstring :,$(firstword $(MAKECMDGOALS))),$(MAKECMDGOALS),$(wordlist 2,100000,$(MAKECMDGOALS)))
.DEFAULT_GOAL = help
.PHONY: ONLY_ONCE
ONLY_ONCE:
	$(MAKE) $(TARGET) COMMAND_ARGS="$(PARAMS)"
%: ONLY_ONCE
	@:
else

help: ## Help
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

SHELL = /bin/bash
ifeq ($(filter help, $(MAKECMDGOALS)),)
-include .env
export $(shell sed '/^#/d; s/=.*//' .env)
endif

up: ## Up project with docker compose
	docker compose up -d --build --remove-orphans

down: ## Down project with docker compose
	docker compose down

setup-env: ## Setup python env
	uv sync --all-extras

dev: ## Run FastAPI in dev mode
	uv run uvicorn src.main:fastapi_app --reload --port 8002 --host 0.0.0.0

postgres: ## Start postgres + migrate
	uv sync --all-extras
	docker run --name postgres -p "5432:5432" -d --rm -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${POSTGRES_DB} postgres 2>/dev/null && echo "Postgres is starting" || echo "Postgres already running"

redis: ## Start redis
	docker run --name redis -d --rm -p "6379:6379" redis 2>/dev/null && echo "Redis is starting" || echo "Redis already running"

endif
MAKE_EOF

