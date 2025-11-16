
// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, AlertCircle, Plus, Settings, Sparkles, X } from 'lucide-react';
// import './App.css';

// // Utility functions (mirroring backend logic)
// const toMinutes = (time, period) => {
//   let [h, m] = time.split(":").map(Number);
//   if (period === "PM" && h !== 12) h += 12;
//   if (period === "AM" && h === 12) h = 0;
//   return h * 60 + m;
// };

// const toTimeString = (totalMinutes) => {
//   const h = Math.floor(totalMinutes / 60);
//   const m = totalMinutes % 60;
//   const period = h >= 12 ? "PM" : "AM";
//   const displayHour = h % 12 === 0 ? 12 : h % 12;
//   return {
//     time: `${displayHour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
//     period,
//   };
// };

// const hasConflict = (events, newEvent, excludeId = null) => {
//   const newStart = toMinutes(newEvent.startTime, newEvent.startPeriod);
//   const newEnd = toMinutes(newEvent.endTime, newEvent.endPeriod);

//   for (const ev of events) {
//     if (excludeId && ev.id === excludeId) continue;
//     const evStart = toMinutes(ev.startTime, ev.startPeriod);
//     const evEnd = toMinutes(ev.endTime, ev.endPeriod);
//     if (newStart < evEnd && newEnd > evStart) {
//       return true;
//     }
//   }
//   return false;
// };

// const SchedulerApp = () => {
//   const [events, setEvents] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showSettingsModal, setShowSettingsModal] = useState(false);
//   const [draggedEvent, setDraggedEvent] = useState(null);
//   const [conflictError, setConflictError] = useState(null);
//   const [workingHours, setWorkingHours] = useState({
//     start: { time: "08:00", period: "AM" },
//     end: { time: "06:00", period: "PM" }
//   });

//   // Form state
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     startTime: '09:00',
//     startPeriod: 'AM',
//     endTime: '10:00',
//     endPeriod: 'AM'
//   });

//   // Fetch events on mount
//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/events');
//       const data = await response.json();
//       setEvents(data);
//     } catch (error) {
//       console.error('Error fetching events:', error);
//     }
//   };
//   const normalizeTime = (t) => {
//     let [h, m] = t.split(":");
//     h = h.padStart(2, "0");
//     return `${h}:${m}`;
//   };
  
//   const handleAddEvent = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/events', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
    
//       const data = await response.json();
      
//       if (response.status === 409) {
//         // Conflict detected - show error with suggestion
//         setConflictError({
//           message: data.message,
//           suggestion: data.suggestion
//         });
//       } else if (response.ok) {
//         setEvents([...events, data]);
//         setShowAddModal(false);
//         setFormData({
//           title: '',
//           description: '',
//           startTime: '09:00',
//           startPeriod: 'AM',
//           endTime: '10:00',
//           endPeriod: 'AM'
//         });
//         setConflictError(null);
//       }
//     } catch (error) {
//       console.error('Error adding event:', error);
//       alert('Failed to add event. Make sure backend is running on port 5000.');
//     }
//   };

//   const handleAcceptSuggestion = () => {
//     if (!conflictError?.suggestion) return;
  
//     const [sugStartTime, sugStartPeriod] = conflictError.suggestion.start.split(" ");
//     const [sugEndTime, sugEndPeriod] = conflictError.suggestion.end.split(" ");
  
//     setFormData(prev => ({
//       ...prev,
//       startTime: normalizeTime(sugStartTime),
//       startPeriod: sugStartPeriod,
//       endTime: normalizeTime(sugEndTime),
//       endPeriod: sugEndPeriod
//     }));
  
//     setConflictError(null);
//   };
  

//   const handleDragStart = (event) => {
//     setDraggedEvent(event);
//   };

//   const handleDrop = (targetTime, period) => {
//     if (!draggedEvent) return;

//     const duration = toMinutes(draggedEvent.endTime, draggedEvent.endPeriod) - 
//                      toMinutes(draggedEvent.startTime, draggedEvent.startPeriod);
    
//     const newStartMins = toMinutes(targetTime, period);
//     const newEndMins = newStartMins + duration;
//     const endTimeObj = toTimeString(newEndMins);

//     const updatedEvent = {
//       ...draggedEvent,
//       startTime: targetTime,
//       startPeriod: period,
//       endTime: endTimeObj.time,
//       endPeriod: endTimeObj.period
//     };

//     // Check for conflicts locally
//     if (hasConflict(events, updatedEvent, draggedEvent.id)) {
//       alert('Cannot move event here - time slot conflict! Try another time or add a new event for suggestions.');
//       setDraggedEvent(null);
//       return;
//     }

//     // Update locally (you would typically POST/PUT to backend here)
//     setEvents(events.map(e => e.id === draggedEvent.id ? updatedEvent : e));
//     setDraggedEvent(null);
//   };

//   const renderTimeSlots = () => {
//     const slots = [];
//     const startHour = toMinutes(workingHours.start.time, workingHours.start.period) / 60;
//     const endHour = toMinutes(workingHours.end.time, workingHours.end.period) / 60;

//     for (let hour = Math.floor(startHour); hour <= Math.ceil(endHour); hour++) {
//       const displayHour = hour % 12 === 0 ? 12 : hour % 12;
//       const period = hour >= 12 ? 'PM' : 'AM';
//       const timeString = `${displayHour.toString().padStart(2, '0')}:00`;

//       slots.push(
//         <div
//           key={hour}
//           className="border-b border-gray-200/50 relative h-24 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all cursor-pointer group"
//           onDragOver={(e) => e.preventDefault()}
//           onDrop={() => handleDrop(timeString, period)}
//         >
//           <span className="absolute -left-20 -top-3 text-xs font-bold text-gray-400 group-hover:text-indigo-600 transition-colors w-16 text-right">
//             {timeString} {period}
//           </span>
//           <div className="absolute inset-0 border-l-2 border-transparent group-hover:border-indigo-300 transition-colors"></div>
//         </div>
//       );
//     }
//     return slots;
//   };

//   const renderEvents = () => {
//     return events.map(event => {
//       const startMins = toMinutes(event.startTime, event.startPeriod);
//       const endMins = toMinutes(event.endTime, event.endPeriod);
//       const duration = endMins - startMins;
      
//       const workingStartMins = toMinutes(workingHours.start.time, workingHours.start.period);
//       const topOffset = ((startMins - workingStartMins) / 60) * 96; // Changed from 64 to 96 (matches new h-24)
//       const height = (duration / 60) * 96;

//       return (
//         <div
//           key={event.id}
//           draggable
//           onDragStart={() => handleDragStart(event)}
//           className="absolute left-24 right-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl p-4 shadow-xl cursor-move hover:shadow-2xl hover:scale-[1.01] transition-all border border-white/20 backdrop-blur-sm"
//           style={{ top: `${topOffset}px`, height: `${height}px`, minHeight: '80px' }}
//         >
//           <div className="flex flex-col h-full justify-center">
//             <div className="font-bold text-lg mb-1">{event.title}</div>
//             <div className="text-xs opacity-90 font-medium flex items-center gap-1.5 mb-2">
//               <Clock className="w-3.5 h-3.5" />
//               {event.startTime} {event.startPeriod} - {event.endTime} {event.endPeriod}
//             </div>
//             {event.description && (
//               <div className="text-xs opacity-80 line-clamp-2 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
//                 {event.description}
//               </div>
//             )}
//           </div>
//           <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-white/40 to-transparent rounded-r-xl"></div>
//         </div>
//       );
//     });
//   };

//   return (
//     <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
//       {/* Animated background elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
//       </div>

//       {/* Compact Header */}
//       <div className="relative bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 z-40 flex-shrink-0">
//         <div className="px-8 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
//               <Calendar className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                 Smart Scheduler
//               </h1>
//             </div>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={() => setShowSettingsModal(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all shadow-md hover:shadow-lg border border-gray-200"
//             >
//               <Settings className="w-4 h-4" />
//               <span className="font-medium text-sm">Settings</span>
//             </button>
//             <button
//               onClick={() => setShowAddModal(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
//             >
//               <Plus className="w-4 h-4" />
//               <span className="font-medium text-sm">New Event</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Full Screen Calendar */}
//       <div className="flex-1 overflow-hidden px-8 py-6">
//         <div className="h-full bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col">
//           <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200/50 flex-shrink-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
//                 <Clock className="w-5 h-5 text-indigo-600" />
//               </div>
//               <div>
//                 <h2 className="text-lg font-bold text-gray-800">Today's Schedule</h2>
//                 <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
//               </div>
//             </div>
//             <div className="text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-lg border border-gray-200">
//               {events.length} {events.length === 1 ? 'event' : 'events'}
//             </div>
//           </div>
          
//           <div className="flex-1 overflow-y-auto px-8 py-6">
//             <div className="relative pl-24 min-h-full">
//               {renderTimeSlots()}
//               {renderEvents()}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Add Event Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
//                   <Sparkles className="w-5 h-5 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800">Create Event</h3>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowAddModal(false);
//                   setConflictError(null);
//                 }}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             {conflictError && (
//               <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg">
//                 <div className="flex items-start gap-3">
//                   <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
//                   <div className="flex-1">
//                     <p className="text-sm font-bold text-red-800 mb-1">{conflictError.message}</p>
//                     {conflictError.suggestion ? (
//                       <div className="mt-3">
//                         <p className="text-sm text-red-700 mb-2">
//                           💡 Try: <span className="font-semibold">{conflictError.suggestion.start} - {conflictError.suggestion.end}</span>
//                         </p>
//                         <button
//                           onClick={handleAcceptSuggestion}
//                           className="text-sm px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
//                         >
//                           Use This Time
//                         </button>
//                       </div>
//                     ) : (
//                       <p className="text-sm text-red-700 mt-1">No available slots found</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   onChange={(e) => setFormData({...formData, title: e.target.value})}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                   placeholder="Team standup meeting"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({...formData, description: e.target.value})}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
//                   rows="2"
//                   placeholder="Quick description..."
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="time"
//                       value={formData.startTime}
//                       onChange={(e) => setFormData({...formData, startTime: e.target.value})}
//                       className="flex-1 px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                     />
//                     <select
//                       value={formData.startPeriod}
//                       onChange={(e) => setFormData({...formData, startPeriod: e.target.value})}
//                       className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
//                     >
//                       <option>AM</option>
//                       <option>PM</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="time"
//                       value={formData.endTime}
//                       onChange={(e) => setFormData({...formData, endTime: e.target.value})}
//                       className="flex-1 px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                     />
//                     <select
//                       value={formData.endPeriod}
//                       onChange={(e) => setFormData({...formData, endPeriod: e.target.value})}
//                       className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
//                     >
//                       <option>AM</option>
//                       <option>PM</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   onClick={() => {
//                     setShowAddModal(false);
//                     setConflictError(null);
//                   }}
//                   className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddEvent}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
//                 >
//                   Create Event
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Settings Modal */}
//       {showSettingsModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in slide-in-from-bottom-4 duration-300">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
//                   <Settings className="w-5 h-5 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800">Working Hours</h3>
//               </div>
//               <button
//                 onClick={() => setShowSettingsModal(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
//                 <div className="flex gap-2">
//                   <input
//                     type="time"
//                     value={workingHours.start.time}
//                     onChange={(e) => setWorkingHours({
//                       ...workingHours,
//                       start: {...workingHours.start, time: e.target.value}
//                     })}
//                     className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                   />
//                   <select
//                     value={workingHours.start.period}
//                     onChange={(e) => setWorkingHours({
//                       ...workingHours,
//                       start: {...workingHours.start, period: e.target.value}
//                     })}
//                     className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
//                   >
//                     <option>AM</option>
//                     <option>PM</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
//                 <div className="flex gap-2">
//                   <input
//                     type="time"
//                     value={workingHours.end.time}
//                     onChange={(e) => setWorkingHours({
//                       ...workingHours,
//                       end: {...workingHours.end, time: e.target.value}
//                     })}
//                     className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                   />
//                   <select
//                     value={workingHours.end.period}
//                     onChange={(e) => setWorkingHours({
//                       ...workingHours,
//                       end: {...workingHours.end, period: e.target.value}
//                     })}
//                     className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
//                   >
//                     <option>AM</option>
//                     <option>PM</option>
//                   </select>
//                 </div>
//               </div>

//               <button
//                 onClick={() => setShowSettingsModal(false)}
//                 className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold mt-2"
//               >
//                 Save Settings
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SchedulerApp;
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Plus, Settings, Sparkles, X, ChevronLeft, ChevronRight, Zap, Move, CheckCircle } from 'lucide-react';

// Utility functions
const toMinutes = (time, period) => {
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const toTimeString = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return {
    time: `${displayHour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
    period,
  };
};

const hasConflict = (events, newEvent, excludeId = null) => {
  const newStart = toMinutes(newEvent.startTime, newEvent.startPeriod);
  const newEnd = toMinutes(newEvent.endTime, newEvent.endPeriod);

  for (const ev of events) {
    if (excludeId && ev.id === excludeId) continue;
    const evStart = toMinutes(ev.startTime, ev.startPeriod);
    const evEnd = toMinutes(ev.endTime, ev.endPeriod);
    if (newStart < evEnd && newEnd > evStart) {
      return true;
    }
  }
  return false;
};

const SchedulerApp = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Morning Standup",
      description: "Daily team sync",
      startTime: "09:00",
      startPeriod: "AM",
      endTime: "09:30",
      endPeriod: "AM"
    },
    {
      id: 2,
      title: "Design Review",
      description: "Product design feedback session",
      startTime: "11:00",
      startPeriod: "AM",
      endTime: "12:00",
      endPeriod: "PM"
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [conflictError, setConflictError] = useState(null);
  const [workingHours, setWorkingHours] = useState({
    start: { time: "08:00", period: "AM" },
    end: { time: "06:00", period: "PM" }
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    startPeriod: 'AM',
    endTime: '10:00',
    endPeriod: 'AM'
  });

  const normalizeTime = (t) => {
    let [h, m] = t.split(":");
    h = h.padStart(2, "0");
    return `${h}:${m}`;
  };
  
  const handleAddEvent = async () => {
    const newEvent = {
      ...formData,
      id: Date.now()
    };

    if (hasConflict(events, newEvent)) {
      setConflictError({
        message: "Time slot conflict detected",
        suggestion: null
      });
      return;
    }

    setEvents([...events, newEvent]);
    setShowAddModal(false);
    setFormData({
      title: '',
      description: '',
      startTime: '09:00',
      startPeriod: 'AM',
      endTime: '10:00',
      endPeriod: 'AM'
    });
    setConflictError(null);
  };

  const handleDragStart = (event) => {
    setDraggedEvent(event);
  };

  const handleDrop = (targetTime, period) => {
    if (!draggedEvent) return;

    const duration = toMinutes(draggedEvent.endTime, draggedEvent.endPeriod) - 
                     toMinutes(draggedEvent.startTime, draggedEvent.startPeriod);
    
    const newStartMins = toMinutes(targetTime, period);
    const newEndMins = newStartMins + duration;
    const endTimeObj = toTimeString(newEndMins);

    const updatedEvent = {
      ...draggedEvent,
      startTime: targetTime,
      startPeriod: period,
      endTime: endTimeObj.time,
      endPeriod: endTimeObj.period
    };

    if (hasConflict(events, updatedEvent, draggedEvent.id)) {
      alert('Cannot move event here - time slot conflict!');
      setDraggedEvent(null);
      return;
    }

    setEvents(events.map(e => e.id === draggedEvent.id ? updatedEvent : e));
    setDraggedEvent(null);
  };

  const renderTimeSlots = () => {
    const slots = [];
    const startHour = toMinutes(workingHours.start.time, workingHours.start.period) / 60;
    const endHour = toMinutes(workingHours.end.time, workingHours.end.period) / 60;

    for (let hour = Math.floor(startHour); hour <= Math.ceil(endHour); hour++) {
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour >= 12 ? 'PM' : 'AM';
      const timeString = `${displayHour.toString().padStart(2, '0')}:00`;

      slots.push(
        <div
          key={hour}
          className="relative h-28 group"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(timeString, period)}
        >
          <div className="absolute -left-24 top-0 text-sm font-medium text-emerald-600/60 w-20 text-right">
            {timeString}
            <span className="text-xs ml-1">{period}</span>
          </div>
          <div className="h-full border-t border-emerald-100/50 hover:bg-teal-50/20 transition-colors cursor-pointer"></div>
        </div>
      );
    }
    return slots;
  };

  const renderEvents = () => {
    return events.map(event => {
      const startMins = toMinutes(event.startTime, event.startPeriod);
      const endMins = toMinutes(event.endTime, event.endPeriod);
      const duration = endMins - startMins;
      
      const workingStartMins = toMinutes(workingHours.start.time, workingHours.start.period);
      const topOffset = ((startMins - workingStartMins) / 60) * 112;
      const height = (duration / 60) * 112;

      return (
        <div
          key={event.id}
          draggable
          onDragStart={() => handleDragStart(event)}
          className="absolute left-28 right-6 bg-gradient-to-br from-teal-500/90 via-cyan-500/90 to-blue-500/90 text-white rounded-2xl p-5 shadow-lg cursor-move hover:shadow-xl hover:scale-[1.02] transition-all backdrop-blur-sm border border-white/20"
          style={{ top: `${topOffset}px`, height: `${height}px`, minHeight: '96px' }}
        >
          <div className="flex flex-col h-full justify-center">
            <div className="font-semibold text-base mb-2">{event.title}</div>
            <div className="text-xs text-white/80 flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5" />
              {event.startTime} {event.startPeriod} - {event.endTime} {event.endPeriod}
            </div>
            {event.description && (
              <div className="text-xs text-white/70">
                {event.description}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/40 to-blue-50/60">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-emerald-200/30 sticky top-0 z-50 shadow-sm">
        <div className="px-10 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  EventFlow
                </h1>
                <p className="text-xs text-teal-600/70 font-medium mt-0.5">Intelligent Scheduling Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-teal-50/50 text-teal-700 rounded-xl transition-all shadow-sm border border-teal-200/40 hover:border-teal-300/60"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium text-sm">Settings</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium text-sm">Add Event</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-10 py-12">
        <div className="bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl p-10 border border-teal-200/30 backdrop-blur-sm mb-8">
          <div>
            <h2 className="text-3xl font-bold text-teal-900 mb-4">
              Effortless Event Management
            </h2>
            <p className="text-lg text-teal-700/80 leading-relaxed mb-6">
              Transform the way you organize your schedule with our intuitive drag-and-drop interface. 
              EventFlow empowers you to seamlessly manage your time with intelligent conflict detection 
              and real-time visual feedback.
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-500/20 rounded-lg mt-1">
                  <Move className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-900 mb-1">Drag & Drop</h3>
                  <p className="text-sm text-teal-700/70">Simply drag events to reschedule - instant visual updates</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg mt-1">
                  <Zap className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-900 mb-1">Smart Conflicts</h3>
                  <p className="text-sm text-teal-700/70">Automatic detection prevents overlapping schedules</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-900 mb-1">Real-Time Sync</h3>
                  <p className="text-sm text-teal-700/70">Changes reflect instantly across your timeline</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-teal-200/30 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-10 py-6 border-b border-teal-200/30 bg-gradient-to-r from-teal-50/50 to-cyan-50/50">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-teal-100/50 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-teal-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-teal-900">Today's Schedule</h2>
                <p className="text-sm text-teal-600/70 mt-0.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button className="p-2 hover:bg-teal-100/50 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-teal-600" />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-white/70 px-5 py-3 rounded-xl border border-teal-200/40">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-teal-700">
                {events.length} {events.length === 1 ? 'Event' : 'Events'} Scheduled
              </span>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="overflow-y-auto px-10 py-8" style={{ maxHeight: 'calc(100vh - 480px)' }}>
            <div className="relative pl-28 min-h-full">
              {renderTimeSlots()}
              {renderEvents()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-teal-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-md">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-teal-900">Create Event</h3>
                  <p className="text-sm text-teal-600/70 mt-1">Add a new event to your schedule</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setConflictError(null);
                }}
                className="p-2 hover:bg-teal-100/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-teal-600" />
              </button>
            </div>
            
            {conflictError && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">{conflictError.message}</p>
                    <p className="text-xs text-red-600/80 mt-1">Please choose a different time slot to avoid conflicts</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-teal-900 mb-3">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-teal-900 placeholder:text-teal-400/60 bg-teal-50/30"
                  placeholder="e.g., Team Meeting"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-teal-900 mb-3">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none text-teal-900 placeholder:text-teal-400/60 bg-teal-50/30"
                  rows="3"
                  placeholder="Add details about your event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-teal-900 mb-3">Start Time</label>
                  <div className="flex gap-3">
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="flex-1 px-4 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-teal-900 bg-teal-50/30"
                    />
                    <select
                      value={formData.startPeriod}
                      onChange={(e) => setFormData({...formData, startPeriod: e.target.value})}
                      className="px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-semibold text-teal-900 bg-teal-50/30"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-teal-900 mb-3">End Time</label>
                  <div className="flex gap-3">
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="flex-1 px-4 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-teal-900 bg-teal-50/30"
                    />
                    <select
                      value={formData.endPeriod}
                      onChange={(e) => setFormData({...formData, endPeriod: e.target.value})}
                      className="px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-semibold text-teal-900 bg-teal-50/30"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setConflictError(null);
                  }}
                  className="flex-1 px-6 py-4 bg-teal-100/50 hover:bg-teal-100 text-teal-700 rounded-xl transition-all font-semibold border border-teal-200/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-teal-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-md">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-teal-900">Working Hours</h3>
                  <p className="text-sm text-teal-600/70 mt-1">Set your available time</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-teal-100/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-teal-600" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-teal-900 mb-3">Start Time</label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    value={workingHours.start.time}
                    onChange={(e) => setWorkingHours({
                      ...workingHours,
                      start: {...workingHours.start, time: e.target.value}
                    })}
                    className="flex-1 px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-teal-900 bg-teal-50/30"
                  />
                  <select
                    value={workingHours.start.period}
                    onChange={(e) => setWorkingHours({
                      ...workingHours,
                      start: {...workingHours.start, period: e.target.value}
                    })}
                    className="px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-semibold text-teal-900 bg-teal-50/30"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-teal-900 mb-3">End Time</label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    value={workingHours.end.time}
                    onChange={(e) => setWorkingHours({
                      ...workingHours,
                      end: {...workingHours.end, time: e.target.value}
                    })}
                    className="flex-1 px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-teal-900 bg-teal-50/30"
                  />
                  <select
                    value={workingHours.end.period}
                    onChange={(e) => setWorkingHours({
                      ...workingHours,
                      end: {...workingHours.end, period: e.target.value}
                    })}
                    className="px-5 py-4 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-semibold text-teal-900 bg-teal-50/30"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold mt-4"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerApp;