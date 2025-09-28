import math
import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

from fastapi import FastAPI, Request, Depends
import json
import pandas as pd
from math import radians, sin, cos, sqrt, atan2

from starlette.middleware.cors import CORSMiddleware

from models import SubwayReq, SubwayResp, SpectatorResp, SpectatorReq
from supabase import create_client

app = FastAPI()

load_dotenv()

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, PUT, etc
    allow_headers=["*"],          # Allow all headers
)
DB_ADDRESS =  os.getenv("DB_ADDRESS")
DB_KEY =  os.getenv("DB_KEY")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

with open("files/nyc_subway_data.json", "r") as f:
    data = json.load(f)

def haversine(lat1, lon1, row):
    R = 3958.8  # Radius of Earth in miles
    lat2 = row["stop_lat"]
    lon2 = row["stop_lon"]
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    return R * c

@app.on_event("startup")
async def startup():
    # Create Supabase client and store globally on app.state
    app.state.supabase = create_client(DB_ADDRESS, DB_KEY)

# Dependency to access supabase client in routes
def get_supabase(request: Request):
    return request.app.state.supabase

def send_to_self(name, mile, email):
    sender = EMAIL_USER
    receiver = EMAIL_USER   # sending to yourself
    password = EMAIL_PASS      # use Gmail app password

    subject = f"{name} - Just Registered for {mile} mile"
    body = f"Someone signed up!\n\n{email.dict()}"

    # Create email
    msg = MIMEText(body, "plain")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = receiver

    # Send via Gmail SMTP
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender, password)
        server.sendmail(sender, receiver, msg.as_string())

@app.post("/nearest_sub_station")
def post_nearest_subway_station(req: SubwayReq):
    properties = [item["properties"] for item in data['features']]
    df = pd.DataFrame(properties, columns=properties[0].keys())
    df["distance"] = df.apply(lambda row: haversine(req.latitude, req.longitude, row),axis=1)
    nearest = df[df["distance"] <= .5]
    stations = []
    for stop_name, group in nearest.groupby("stop_name"):
        all_trains = " ".join(group["trains"].str.split().sum())
        avg_distance = math.trunc(group["distance"].mean() * 100) / 100
        stations.append(SubwayResp(stop_name=stop_name, trains= all_trains, distance= avg_distance))
    stations = sorted(stations, key=lambda x: x.distance)

    return stations


@app.get("/get_spectator/{mile}")
async def get_spectator_by_mile(mile: int,supabase=Depends(get_supabase)):

    response = supabase.table("nycm_register_qa").select("id_register, mile, names, description, side").in_("mile", [mile]).execute()
    print(response)

    return [SpectatorResp(**row) for row in response.data]

@app.post("/register_spectator")
async def post_spectator_by_mile(req: SpectatorReq,supabase=Depends(get_supabase)):
    response = supabase.table("nycm_register_qa").insert(req.dict()).execute()
    send_to_self(req.names, req.mile, req)
    print(response)
    return response
