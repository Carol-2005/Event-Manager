import { events } from "../data/events.js";
import { hasConflict, suggestSlot } from "../utils/hasConflict.js";

export const getEvents = (req, res) => {
  res.json(events);
};

export const createEvents = (req, res) => {
  const { title, startTime, endTime, startPeriod, endPeriod, description } = req.body;

  // Validate required fields
  if (!title || !startTime || !endTime) {
    return res.status(400).json({
      message: "Title, startTime, and endTime are required",
    });
  }

  // Build new event object
  const newEvent = {
    id: events.length + 1,
    title,
    description: description || "",
    startTime,
    endTime,
    startPeriod,
    endPeriod,
  };

  // Check conflict
  const conflict = hasConflict(events, newEvent);
   console.log('Conflict check for new event',newEvent,conflict);
   
  if (conflict) {
    const suggestion = suggestSlot(newEvent, events);
     console.log("The suggestion is",suggestion);
    return res.status(409).json({
      message: "Event conflicts with an existing event.",
      suggestion,
    });
  }

  // No conflict → save
  events.push(newEvent);
  return res.status(201).json(newEvent);
};
