# NYC Marathon Map Project 

### Description
This is a side project I have wanted to work on for a bit of time now. The initial push was because I am running the 2025 NYC Marathon and I have a lot of friends who want to come cheer me on. There wasnt a good way to keep track and have everyone tell me where they'd want to come see me run so I created something to have them input that data 

## Frontend 
Stack: React, TailwindCSS, shadcn, react-map-gl


To start it please run:

`npm install` - to install packages

`npm run dev` - unfort it will not run without a mapbox key so you will have to get your own

## Backend
Stack: Python, FastAPI, Pandas

Endpoints: 

nearest_sub_station - gets the nearest subway station with a post request. taken from data from the Baruch website

get_spectators/{mile} - gets the spectators & information for each mile to show others who will be there 

register_spectator - add spectator info to the page



## Other Info 
Database: Posgres on Supabase

Sever: <TBD>


