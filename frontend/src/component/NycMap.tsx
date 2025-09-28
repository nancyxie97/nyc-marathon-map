import React, { useEffect, useState } from "react";
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl/mapbox';
import "mapbox-gl/dist/mapbox-gl.css";
import * as toGeoJSON from "togeojson";
import { DOMParser } from "xmldom";
import * as turf from "@turf/turf";
import { MileDialog } from "./MileDialog";

const NycMap = () => {
    const [routeData, setRouteData] = useState();
    const [mileMarkers, setMileMarkers] = useState([]);
    const [selected, setSelected] = useState()
    const [clicked, setClicked] = useState(false)


    useEffect(() => {
        async function loadGpx() {
            const response = await fetch("/nyc_gpx.gpx");
            const text = await response.text();

            const xml = new DOMParser().parseFromString(text, "text/xml");
            const geojson = toGeoJSON.gpx(xml);
            setRouteData(geojson);
            const markers = getMileMarkers(geojson);
            setMileMarkers(markers);

        }
        loadGpx();
    }, []);

    function getMileMarkers(routeGeoJson) {
        // Assumes your route is a LineString
        const line = routeGeoJson.features[0];

        // Total route length (in miles)
        const length = turf.length(line, { units: "miles" });

        // Compute points every mile
        const markers = [];
        for (let i = 1; i <= Math.floor(length); i++) {
            const point = turf.along(line, i, { units: "miles" });
            markers.push({
                mile: i,
                coords: point.geometry.coordinates, // [lng, lat]
            });
        }

        return markers;
    }
    return (
        <> <Map
            initialViewState={{
                longitude: -73.9654,
                latitude: 40.7829,
                zoom: 11,
            }}
            style={{ width: "100vw", height: "100vh" }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
            {routeData?.features?.length > 0 && (
                <Source id="route" type="geojson" data={routeData?.features[0]}>
                    <Layer
                        id="route-line"
                        type="line"
                        paint={{
                            "line-color": "#FF0000",
                            "line-width": 3,
                        }}
                    />
                </Source>
            )}
            {mileMarkers.map((m) => (
                <Marker
                    key={m.mile}
                    longitude={m.coords[0]}
                    latitude={m.coords[1]}
                    onClick={() => {
                        setSelected(m)
                        setClicked(true)
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            border: '1px solid blue',
                            color: "blue",
                            borderRadius: "50%",
                            width: 25,
                            height: 25,
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0 0 6px rgba(0,0,0,0.5)"
                        }}
                    >{m.mile}

                    </div>
                </Marker>
            ))}


        </Map>
            {
                selected && (
                    <MileDialog mileDetails={selected} setSelected={setSelected} />
                )
            }</>
    )
}

export default NycMap