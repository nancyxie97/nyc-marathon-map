from pydantic import BaseModel

class SubwayReq(BaseModel):
    longitude: float
    latitude: float

class TrainInfo(BaseModel):
    trains: str
    distance: float

class SubwayResp(BaseModel):
    stop_name: str
    trains: str
    distance: float

class SpectatorResp(BaseModel):
    id_register: int
    mile: int
    names: str
    description: str
    side: str

class SpectatorReq(BaseModel):
    names: str
    description: str
    side: str
    mile: int


