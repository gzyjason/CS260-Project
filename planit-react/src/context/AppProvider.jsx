import { useState } from 'react';
import { AppContext } from './AppContext.js';

const AppProvider = ({ children }) => {
    const [userName, setUserName] = useState('Guest');
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'CS260 Lecture',
            date: new Date(2025, 9, 21, 14, 0, 0),
            durationHours: 1,
        }
    ]);
    const [unavailableTimes, setUnavailableTimes] = useState([
        { id: 1, day: 'mon', startTime: '12:00', endTime: '13:00' }
    ]);

    const contextValue = {
        userName,
        setUserName,
        events,
        setEvents,
        unavailableTimes,
        setUnavailableTimes
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// Export *only* the component (as a default export)
export default AppProvider;