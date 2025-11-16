import { events } from "../data/events";
import {hasConflict} from '../utils/hasConflict.js';
import { suggestSlot } from "../utils/hasConflict.js";
export const getEvents = (req, res) => {
    res.json(events);
};

export const createEvents=(req, res) => {
    const { title, startTime, endTime ,startPeriod,endPeriod,description} = req.body;

    if (!title || !start || !end || !description) {
        return res.status(400).json({ message: 'Title, start, and end are required.' });
    }

    const newEvent = { id: events.length + 1,  title,description: description || "",  startTime, endTime ,startPeriod,endPeriod};
    const conflict= hasConflict(events, newEvent);
    if (conflict) {
        const suggestion= suggestSlot(newEvent, events);
        
        return res.status(409).json({ message: 'Event conflicts with an existing event.' ,
            suggestion
        });
    }

    events.push(newEvent);
    res.status(201).json(newEvent);
}