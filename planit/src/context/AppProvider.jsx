// planit/src/context/AppProvider.jsx

import { useState, useEffect } from 'react';
import { AppContext } from './AppContext.js';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for logout

const AppProvider = ({ children }) => {
    // 1. Read initial username from localStorage (like Simon's App.jsx)
    const [userName, setUserNameState] = useState(localStorage.getItem('userName') || 'Guest');

    // These still hold our local state, but they start empty.
    const [events, setEvents] = useState([]);
    const [unavailableTimes, setUnavailableTimes] = useState([]);

    const navigate = useNavigate(); // For redirecting on logout

    // 2. This hook fetches data from the API when the user logs in
    useEffect(() => {
        // Only fetch data if the user is actually logged in
        if (userName && userName !== 'Guest') {
            console.log("User logged in. Fetching data...");

            // Fetch events
            fetch('/api/events')
                .then(res => res.json())
                .then(data => {
                    // The API returns events, but the 'date' is a string.
                    // We must convert it back to a Date object for the calendar.
                    const parsedEvents = data.map(event => ({
                        ...event,
                        date: new Date(event.date)
                    }));
                    setEvents(parsedEvents);
                })
                .catch(err => console.error("Failed to fetch events:", err));

            // Fetch unavailable times
            fetch('/api/unavailable')
                .then(res => res.json())
                .then(data => setUnavailableTimes(data))
                .catch(err => console.error("Failed to fetch unavailable times:", err));
        } else {
            // User is 'Guest', so clear any existing data
            console.log("User is Guest. Clearing data.");
            setEvents([]);
            setUnavailableTimes([]);
        }
    }, [userName]); // This hook re-runs whenever 'userName' changes

    // 3. Create wrapper functions that update both API and local state

    // Special function to set the username AND update localStorage
    const setUserName = (newUserName) => {
        if (newUserName === 'Guest') {
            localStorage.removeItem('userName');
        } else {
            localStorage.setItem('userName', newUserName);
        }
        setUserNameState(newUserName);
    };

    // --- Event Functions ---
    const addEvent = (newEvent) => {
        // newEvent comes from AddEventModal. It doesn't have an ID yet.
        fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent)
        })
            .then(res => res.json())
            .then(createdEvent => {
                // The server sends back the event with its new ID.
                // We must parse the date string again.
                const parsedEvent = {
                    ...createdEvent,
                    date: new Date(createdEvent.date)
                };
                // Add the new event to our local state
                setEvents(currentEvents => [...currentEvents, parsedEvent]);
            })
            .catch(err => console.error("Failed to add event:", err));
    };

    // --- Unavailable Time Functions ---
    const addUnavailableTime = (newTime) => {
        // newTime comes from Preferences.jsx. No ID yet.
        fetch('/api/unavailable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTime)
        })
            .then(res => res.json())
            .then(createdTime => {
                // Server sends back the new time block with its ID
                setUnavailableTimes(currentTimes => [...currentTimes, createdTime]);
            })
            .catch(err => console.error("Failed to add unavailable time:", err));
    };

    const removeUnavailableTime = (id) => {
        fetch(`/api/unavailable/${id}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (res.ok) {
                    // If API call is successful, remove it from local state
                    setUnavailableTimes(currentTimes =>
                        currentTimes.filter(time => time.id !== id)
                    );
                } else {
                    console.error("Failed to delete time block on server");
                }
            })
            .catch(err => console.error("Failed to remove unavailable time:", err));
    };

    // --- Logout Function ---
    const logout = () => {
        fetch('/api/auth/logout', { method: 'DELETE' })
            .catch(err => console.error("Logout API failed:", err))
            .finally(() => {
                // Whether the API call fails or not, log the user out on the frontend
                setUserName('Guest'); // This will clear localStorage via our wrapper
                navigate('/'); // Redirect to login page
            });
    };


    // 4. Provide all the state and new functions to the context
    const contextValue = {
        userName,
        setUserName, // We provide our wrapped function
        events,
        // setEvents, // We no longer provide this directly
        addEvent, // Provide our new API-aware function

        unavailableTimes,
        // setUnavailableTimes, // We no longer provide this directly
        addUnavailableTime, // Provide new API-aware function
        removeUnavailableTime, // Provide new API-aware function

        logout // Provide the logout function
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;