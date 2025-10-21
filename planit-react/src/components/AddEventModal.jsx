import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext.js';

const isSlotAvailable = (newAppt, existingAppointments, unavailableTimes, dayNames) => {
    const newStart = newAppt.date.getTime();
    const newEnd = newStart + newAppt.durationHours * 60 * 60 * 1000;
    const newDay = dayNames[newAppt.date.getDay()];

    for (const unavail of unavailableTimes) {
        if (unavail.day === newDay) {
            const [unavailStartHour, unavailStartMin] = unavail.startTime.split(':').map(Number);
            const [unavailEndHour, unavailEndMin] = unavail.endTime.split(':').map(Number);
            const unavailStartDate = new Date(newAppt.date);
            unavailStartDate.setHours(unavailStartHour, unavailStartMin, 0, 0);
            const unavailEndDate = new Date(newAppt.date);
            unavailEndDate.setHours(unavailEndHour, unavailEndMin, 0, 0);
            if (newStart < unavailEndDate.getTime() && newEnd > unavailStartDate.getTime()) {
                console.log(`Conflict with unavailable: ${unavail.day} ${unavail.startTime}-${unavail.endTime}`);
                return false;
            }
        }
    }
    for (const existing of existingAppointments) {
        const existingStart = existing.date.getTime();
        const existingEnd = existingStart + existing.durationHours * 60 * 60 * 1000;
        if (newStart < existingEnd && newEnd > existingStart) {
            console.log(`Conflict with existing: ${existing.title} at ${existing.date.toLocaleString()}`);
            return false;
        }
    }
    return true;
};
const findNextAvailableSlot = (duration, existingAppointments, unavailableTimes) => {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    let searchDate = new Date();
    const currentMinutes = searchDate.getMinutes();
    if (currentMinutes > 0 && currentMinutes <= 30) {
        searchDate.setMinutes(30, 0, 0);
    } else if (currentMinutes > 30) {
        searchDate.setHours(searchDate.getHours() + 1, 0, 0, 0);
    } else {
        searchDate.setMinutes(0, 0, 0);
    }

    if (searchDate.getHours() >= 17) {
        searchDate.setDate(searchDate.getDate() + 1);
        searchDate.setHours(9, 0, 0, 0);
    }
    if (searchDate.getHours() < 9) {
        searchDate.setHours(9, 0, 0, 0);
    }
    for (let i = 0; i < 30; i++) {
        console.log(`Searching day: ${searchDate.toLocaleDateString()}`);
        const dayOfWeek = searchDate.getDay();
        if (dayOfWeek > 0 && dayOfWeek < 6) {
            for (let hour = searchDate.getHours(); hour < 17; hour++) {
                for (let minute = (hour === searchDate.getHours() ? searchDate.getMinutes() : 0); minute < 60; minute += 30) {
                    const potentialEndDate = new Date(searchDate);
                    potentialEndDate.setHours(hour, minute, 0, 0);
                    potentialEndDate.setHours(potentialEndDate.getHours() + duration);
                    if (potentialEndDate.getHours() > 17 || (potentialEndDate.getHours() === 17 && potentialEndDate.getMinutes() > 0)) {
                        continue;
                    }
                    const currentSearchTime = new Date(searchDate);
                    currentSearchTime.setHours(hour, minute, 0, 0);

                    const newAppt = {
                        date: new Date(currentSearchTime),
                        durationHours: duration
                    };

                    console.log(`-- Checking slot: ${newAppt.date.toLocaleString()} for ${duration} hours`);

                    if (isSlotAvailable(newAppt, existingAppointments, unavailableTimes, dayNames)) {
                        console.log("-----> Slot FOUND!");
                        return newAppt.date;
                    }
                }
                if (hour < 16) searchDate.setMinutes(0, 0, 0);
            }
        }
        searchDate.setDate(searchDate.getDate() + 1);
        searchDate.setHours(9, 0, 0, 0);
    }
    console.log("No slot found within 30 days.");
    return null;
};

const AddEventModal = ({ isOpen, onClose }) => {
    const { events, setEvents, unavailableTimes } = useAppContext();
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(1);

    if (!isOpen) return null;

    const handleSmartSchedule = () => {
        if (!title.trim()) {
            alert('Please enter a task title.');
            return;
        }

        const foundDate = findNextAvailableSlot(duration, events, unavailableTimes);

        if (foundDate) {
            const newEvent = {
                id: Date.now() + Math.random(),
                title: title.trim(),
                date: foundDate,
                durationHours: duration
            };

            setEvents([...events, newEvent]);
            alert(`Task "${title.trim()}" scheduled successfully! \nOn: ${foundDate.toLocaleString()}`);
            onClose();

            setTitle('');
            setDuration(1);
        } else {
            alert('Could not find an available slot for this task within the next 30 weekdays (9am-5pm).');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[1050] flex justify-center items-center" // Increased z-index
            onClick={onClose}
        >
            <div
                className="bg-creamy-bg p-6 rounded-lg shadow-xl w-full max-w-md relative" // Added relative positioning
                onClick={e => e.stopPropagation()} // Prevent click inside modal from closing it
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-sepia-text text-2xl leading-none hover:text-red-600"
                    aria-label="Close"
                >
                    &times; {/* HTML entity for 'x' */}
                </button>

                <h2 className="text-2xl font-merriweather mb-4">Add New Task</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="task-title" className="block font-bold mb-1 text-sepia-text">Task Title:</label>
                        <input
                            type="text"
                            id="task-title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand"
                            placeholder="e.g., Project Meeting"
                        />
                    </div>
                    <div>
                        <label htmlFor="task-duration" className="block font-bold mb-1 text-sepia-text">Duration (hours):</label>
                        <select
                            id="task-duration"
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            className="w-full p-2 border border-sepia-text/30 rounded-md bg-white focus:ring-primary-brand focus:border-primary-brand" // Added bg-white for visibility
                        >
                            {[...Array(8).keys()].map(i => ( // Creates options for 1 to 8 hours
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} hour{i + 1 > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSmartSchedule}
                        className="w-full bg-primary-brand text-white py-2 px-4 rounded hover:bg-primary-brand/90 transition duration-150"
                    >
                        Find Slot & Schedule Automatically
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;