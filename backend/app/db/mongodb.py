from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: AsyncIOMotorClient | None = None


async def get_database() -> AsyncIOMotorDatabase:
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.mongodb_url)
    return client[settings.database_name]
