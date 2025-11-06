import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
// We no longer need Link here, as logout is a button
import { useAppContext } from '../hooks/useAppContext.js';

const Preferences = () => {
    // 1. Get all the data and functions we need from the context
    const {
        unavailableTimes,
        addUnavailableTime,
        removeUnavailableTime,
        logout
    } = useAppContext();

    const [day, setDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const times = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2); // 24-hour format
        const min = (i % 2) * 30;
        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    });

    const availableEndTimes = startTime
        ? times.filter(time => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = time.split(':').map(Number);
            return endHour > startHour || (endHour === startHour && endMin > startMin);
        })
        : [];

    const handleAddTime = () => {
        if (!day || !startTime || !endTime) {
            alert('Please select a day, start time, and end time.');
            return;
        }
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
            alert('End time must be after start time.');
            return;
        }

        // 2. Create the new time block object
        const newUnavailable = {
            // The server will assign the ID
            day: day,
            startTime: startTime,
            endTime: endTime
        };

        // 3. Call the context function to add the time
        addUnavailableTime(newUnavailable);

        // Reset local form state
        setDay('');
        setStartTime('');
        setEndTime('');
    };

    const handleRemoveTime = (id) => {
        // 4. Call the context function to remove the time
        removeUnavailableTime(id);
    };

    return (
        <>
            <Header />
            <main className="p-6 max-w-lg mx-auto pt-28 bg-creamy-bg">
                <h1 className="text-2xl font-merriweather mb-6">Preferences</h1>
                <div className="unavailable-times mb-8">
                    <label className="block font-bold mb-2">Unavailable days and times</label>
                    <div className="input-row flex flex-wrap gap-4 mb-2 items-end">
                        <label className="flex flex-col">
                            Day:
                            <select name="day" className="p-2 border border-sepia-text/30 rounded-md" value={day} onChange={e => setDay(e.target.value)}>
                                <option value="">Select Day</option>
                                {days.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col">
                            Start Time:
                            <select name="startTime" className="p-2 border border-sepia-text/30 rounded-md" value={startTime} onChange={e => {setStartTime(e.target.value); setEndTime(''); }}>
                                <option value="">Select Time</option>
                                {times.map(time => <option key={time} value={time}>{time}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col">
                            End Time:
                            <select name="endTime" className="p-2 border border-sepia-text/30 rounded-md" value={endTime} onChange={e => setEndTime(e.target.value)} disabled={!startTime}>
                                <option value="">Select Time</option>
                                {availableEndTimes.map(time => <option key={time} value={time}>{time}</option>)}
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={handleAddTime}
                            className="px-3 py-2 bg-primary-brand text-black rounded hover:bg-primary-brand/90 self-end text-sm font-semibold"
                        >
                            Add Time
                        </button>
                    </div>

                    {/* Render unavailable list */}
                    <div className="mt-4 space-y-2">
                        <h3 className="font-bold">Current Unavailable Times:</h3>
                        {unavailableTimes.length === 0 ? (
                            <p>No unavailable times added.</p>
                        ) : (
                            <ul className="list-disc pl-5">
                                {unavailableTimes.map(time => (
                                    <li key={time.id} className="flex justify-between items-center">
                                        <span>{time.day.charAt(0).toUpperCase() + time.day.slice(1)}: {time.startTime} - {time.endTime}</span>
                                        {/* 5. Hook up the remove button */}
                                        <button onClick={() => handleRemoveTime(time.id)} className="text-red-500 text-xs hover:underline ml-2">Remove</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* 6. Update Links */}
                <ul className="space-y-2">
                    {/* This link is for WebSocket, not yet implemented, so leave as # */}
                    <li><a href="#" className="text-primary-brand hover:underline">Invite User</a></li>

                    {/* This is now a real <a> tag pointing to our backend auth endpoint */}
                    <li><a href="/api/auth/google" className="text-primary-brand hover:underline">Sync with Google</a></li>

                    {/* This is now a button that calls the logout function */}
                    <li>
                        <button onClick={logout} className="text-primary-brand hover:underline p-0 m-0 bg-transparent border-none cursor-pointer">
                            Logout
                        </button>
                    </li>
                </ul>
            </main>
            <Footer />
        </>
    );
};

export default Preferences;