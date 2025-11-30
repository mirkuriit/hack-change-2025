from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.config import config

from fastapi.middleware.cors import CORSMiddleware
from src.db.initial import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

def create_app() -> FastAPI:
    app = FastAPI(docs_url=f'/{config.API_PREFIX}/docs',
                  lifespan=lifespan)

    from src.routers.user_router import router as user_router
    from src.routers.sentimental_report_router import router as report_router
    from src.routers.sentimental_router import router as sentimental_router

    app.include_router(user_router)
    app.include_router(report_router)
    app.include_router(sentimental_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app





app = create_app()
