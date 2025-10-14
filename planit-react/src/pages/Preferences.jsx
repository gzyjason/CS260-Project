import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Preferences = () => {
    const [unavailable, setUnavailable] = useState([]); // For dynamic adds later

    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const times = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 4) + 1;
        const min = (i % 4) * 15;
        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }).slice(0, 36); // Up to 12:00 as in HTML
    const ampm = ['am', 'pm'];

    return (
        <>
            <Header />
            <main className="p-6 max-w-lg mx-auto pt-28 bg-creamy-bg">
                <h1 className="text-2xl font-merriweather mb-6">Preferences</h1>
                <div className="unavailable-times mb-8">
                    <label className="block font-bold mb-2">Unavailable days and times</label>
                    <div className="input-row flex gap-4 mb-2">
                        <label className="flex flex-col">
                            Select Day:
                            <select name="day" className="p-2 border border-sepia-text/30 rounded-md">
                                <option value="">Select Day</option>
                                {days.map(day => <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col">
                            Select Time:
                            <select name="time" className="p-2 border border-sepia-text/30 rounded-md">
                                <option value="">Select Time</option>
                                {times.map(time => <option key={time} value={time}>{time}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col">
                            Select AM/PM:
                            <select name="ampm" className="p-2 border border-sepia-text/30 rounded-md">
                                <option value="">AM/PM</option>
                                {ampm.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                            </select>
                        </label>
                        <button className="px-4 py-2 bg-primary-brand text-white rounded hover:bg-primary-brand/90">+</button>
                    </div>
                    {/* Render unavailable list here with useState */}
                </div>
                <ul className="space-y-2">
                    <li><Link to="#" className="text-primary-brand hover:underline">Invite User</Link></li>
                    <li><Link to="#" className="text-primary-brand hover:underline">Sync with Google</Link></li>
                    <li><Link to="/login" className="text-primary-brand hover:underline">Logout</Link></li>
                </ul>
            </main>
            <Footer />
        </>
    );
};

export default Preferences;