from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ImageData(BaseModel):
    width: int
    height: int
    data: List[int]  # Lista de pixels 0-255

class Node(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Optional[Dict[str, float]] = None

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class ProcessRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class ProcessResponse(BaseModel):
    results: Dict[str, Any]
    error: Optional[str] = None
