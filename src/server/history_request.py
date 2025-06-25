from typing import List, Optional
from pydantic import BaseModel


class HistoryMessage(BaseModel):
    id: str
    role: str
    agent: Optional[str] = None
    content: str


class HistorySaveRequest(BaseModel):
    id: str
    title: str
    messages: List[HistoryMessage]
