import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import React, { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react"
import { Badge } from "../components/ui/badge";

const subwayColors = {
    A: "#0039A6", B: "#EB6800", C: "#0039A6", D: "#EB6800", E: "#0039A6",
    F: "#EB6800", G: "#6CBE45", J: "#996633", L: "#A7A9AC", M: "#EB6800",
    N: "#FCCC0A", Q: "#FCCC0A", R: "#FCCC0A", S: "#A7A9AC", W: "#FCCC0A",
    Z: "#996633", 1: "#EE352E", 2: "#EE352E", 3: "#EE352E",
    4: "#00933C", 5: "#00933C", 6: "#00933C", 7: "#B933AD",
    8: "#B933AD", 9: "#B933AD", T: "#00ADD0"
};

export function MileDialog({ mileDetails, setSelected }) {
    const mile = mileDetails.mile;
    const [nearestSubway, setNearestSubway] = useState([]);
    const [specators, setSpectators] = useState([]);
    const [formData, setFormData] = useState({
        mile: mileDetails.mile,
        names: "",
        description: "",
        side: ""
    })

    useEffect(() => {
        const fetchNearestSubway = async () => {
            const address =
                import.meta.env.VITE_ENDPOINT_ADDRESS.trim() + "/nearest_sub_station";
            await fetch(address, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    longitude: mileDetails.coords[0],
                    latitude: mileDetails.coords[1],
                }),
            })
                .then((resp) => resp.json())
                .then((data) => setNearestSubway(data));
        };
        const fetchParticipants = async () => {
            const address =
                import.meta.env.VITE_ENDPOINT_ADDRESS.trim() + "/get_spectator/" + mileDetails.mile;
            fetch(address, {
                method: 'GET',
                headers: { "Content-Type": "application/json" }
            }).then(resp => resp.json())
                .then(data => setSpectators(data))
        }
        fetchNearestSubway();
        fetchParticipants();
    }, [mileDetails]);

    const postParticipants = async (e) => {
        e.preventDefault()
        const empty = Object.values(formData).includes("")
        if (!empty) {
            const address =
                import.meta.env.VITE_ENDPOINT_ADDRESS.trim() + "/register_spectator"
            await fetch(address, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            setSelected(null)
        }

    }
    const handleForm = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    return (
        <Dialog open={!!mile} onOpenChange={() => !!mile && setSelected(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mile {mile}</DialogTitle>
                </DialogHeader>

                {/* Nearest Subway */}
                <DialogDescription>
                    <div className="font-extrabold">Nearest Station:</div>
                    {nearestSubway.map(({ stop_name, trains, distance }, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center pb-1"
                        >
                            <div className="flex items-center space-x-2">
                                <div className="flex gap-1 pr-1 text-sm">
                                    {trains.split(" ").map((train) => (
                                        <div
                                            key={train}
                                            className="flex justify-center items-center text-white w-5 h-5 p-0.5 rounded-full text-xs"
                                            style={{ backgroundColor: subwayColors[train] }}
                                        >
                                            {train}
                                        </div>
                                    ))}
                                </div>
                                <div className="font-semibold text-xs">{stop_name}</div>
                            </div>
                            <div className="text-xs">~{distance} miles</div>
                        </div>
                    ))}
                </DialogDescription>
                {/* Cheer Form */}
                <DialogDescription>
                    <div className="font-extrabold">Cheer us on!</div>
                    <form className="space-y-2 text-xs" onSubmit={postParticipants}>
                        <input
                            type="text"
                            placeholder="Your name(s)"
                            className="text-xs border rounded w-full p-1"
                            name="names"
                            value={formData.names}
                            onChange={handleForm}
                        />
                        <textarea
                            placeholder="Message / Look for signs"
                            className="text-xs border rounded w-full p-1"
                            name="description"
                            value={formData.description}
                            onChange={handleForm}
                        />
                        <div className="flex items-center gap-5 pb-2">
                            <span>Side: </span>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="side"
                                    value="right"
                                    onChange={handleForm}
                                    checked={formData.side === "right"}
                                    className="w-4 h-4"
                                />
                                <span>Right</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="side"
                                    value="left"
                                    checked={formData.side === "left"}
                                    onChange={handleForm}
                                    className="w-4 h-4"
                                />
                                <span>Left</span>
                            </label>
                        </div>

                        <Button type="submit">Submit</Button>
                    </form>
                </DialogDescription>
                {/* Other Spectators */}
                <DialogDescription>
                    <Collapsible style={{}}>
                        <CollapsibleTrigger className="font-bold flex items-center justify-between w-full border-b bg-gray-100 px-2 py-1 rounded">Other Spectators<ChevronsUpDown size={14} /></CollapsibleTrigger>

                        <CollapsibleContent className="pt-2 gap-4 flex flex-wrap">
                            {
                                specators.map(spec => <Badge className="bg-blue-200" variant={'secondary'}>{spec.names}</Badge>)
                            }
                        </CollapsibleContent>
                    </Collapsible>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}
