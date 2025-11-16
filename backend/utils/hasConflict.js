export function toMinutes(time, period) {

    const [h, m] = time.split(":").map(Number);
    let hour = h;

    if (period === "AM") {
        if (hour === 12) hour = 0; 
    } else if (period === "PM") {
        if (hour !== 12) hour += 12;
    }

    return hour * 60 + m; 
}

export function toTimeString(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;

    const period = h >= 12 ? "PM" : "AM";

    if (h === 0) h = 12;
    else if (h > 12) h -= 12;

    return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}


export function hasConflict(events, newEvent) {
    const newStart = toMinutes(newEvent.startTime, newEvent.startPeriod);
    const newEnd   = toMinutes(newEvent.endTime, newEvent.endPeriod);

    for (const ev of events) {
        const start = toMinutes(ev.startTime, ev.startPeriod);
        const end   = toMinutes(ev.endTime, ev.endPeriod);

        if (newStart < end && newEnd > start) {
            return true;
        }
    }
    return false;
}

export function suggestSlot(newEvent, events) {
    const duration =
        toMinutes(newEvent.endTime, newEvent.endPeriod) -
        toMinutes(newEvent.startTime, newEvent.startPeriod);

    if (events.length === 0) {
        return {
            start: newEvent.startTime + " " + newEvent.startPeriod,
            end: newEvent.endTime + " " + newEvent.endPeriod
        };
    }

    const lastEventEnd = Math.max(
        ...events.map(ev => toMinutes(ev.endTime, ev.endPeriod))
    );

    const suggestedStart = lastEventEnd;
    const suggestedEnd = lastEventEnd + duration;

    return {
        start: toTimeString(suggestedStart),
        end: toTimeString(suggestedEnd)
    };
}
