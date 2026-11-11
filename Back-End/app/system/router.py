from fastapi import APIRouter

router = APIRouter(tags=["system"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Report that the API process is responding (does not check database connectivity)."""
    return {"status": "ok"}
