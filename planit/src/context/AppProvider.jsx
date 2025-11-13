import { useState, useEffect, useCallback } from 'react';
import { AppContext } from './AppContext.js';
import { useNavigate } from 'react-router-dom';

const AppProvider = ({ children }) => {
    const [userName, setUserNameState] = useState(localStorage.getItem('userName') || 'Guest');
    const [events, setEvents] = useState([]);
    const [unavailableTimes, setUnavailableTimes] = useState([]);
    const [authStatus, setAuthStatus] = useState({ hasGoogleAuth: false }); // <-- NEW STATE
    const navigate = useNavigate();

    // --- FUNCTION DEFINITIONS (Moved up) ---

    // We wrap these in useCallback so they don't cause the useEffect hook
    // to re-run unnecessarily.

    const setUserName = useCallback((newUserName) => {
        if (newUserName === 'Guest') {
            localStorage.removeItem('userName');
        } else {
            localStorage.setItem('userName', newUserName);
        }
        setUserNameState(newUserName);
    }, []); // No dependencies, this function is stable

    const logout = useCallback(() => {
        fetch('/api/auth/logout', { method: 'DELETE' })
            .catch(err => console.error("Logout API failed:", err))
            .finally(() => {
                setUserName('Guest'); // This clears localStorage via our wrapper
                navigate('/');
            });
    }, [navigate, setUserName]); // Depends on navigate and setUserName

    // --- DATA FETCHING (Now uses the functions) ---

    useEffect(() => {
        if (userName && userName !== 'Guest') {
            console.log("User logged in. Fetching data...");

            // --- NEW: Fetch Auth Status ---
            fetch('/api/auth/status')
                .then(res => {
                    if (!res.ok) { // Check if response is successful
                        throw new Error(`Auth status failed with ${res.status}`);
                    }
                    return res.json();
                })
                .then(status => {
                    setAuthStatus(status); // status is { email: '...', hasGoogleAuth: true/false }
                })
                .catch(err => {
                    console.error("Failed to fetch auth status:", err.message);
                    logout(); // If this fails, we're not authenticated.
                });

            // --- Robust Fetch for Events ---
            fetch('/api/events')
                .then(res => {
                    if (!res.ok) { // <-- FIX 1: Check if response is successful
                        throw new Error(`Server responded with ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    const parsedEvents = data.map(event => ({
                        ...event,
                        date: new Date(event.date)
                    }));
                    setEvents(parsedEvents);
                })
                .catch(err => {
                    console.error("Failed to fetch events:", err.message);
                    // If we get a 401 or other error, log out
                    logout(); // <-- FIX 2: Log out on error
                });

            // --- Robust Fetch for Unavailable Times ---
            fetch('/api/unavailable')
                .then(res => {
                    if (!res.ok) { // <-- FIX 1
                        throw new Error(`Server responded with ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => setUnavailableTimes(data))
                .catch(err => {
                    console.error("Failed to fetch unavailable times:", err.message);
                    logout(); // <-- FIX 2
                });
        } else {
            console.log("User is Guest. Clearing data.");
            setEvents([]);
            setUnavailableTimes([]);
            setAuthStatus({ hasGoogleAuth: false }); // Reset auth status
        }
        // --- FIX: Add state setters and logout's dependencies to array ---
    }, [userName, logout, setEvents, setUnavailableTimes, setAuthStatus, navigate, setUserName]);


    // --- API-Modifying Functions ---

    const addEvent = (newEvent) => {
        fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent)
        })
            .then(res => res.json())
            .then(createdEvent => {
                const parsedEvent = {
                    ...createdEvent,
                    date: new Date(createdEvent.date)
                };
                setEvents(currentEvents => [...currentEvents, parsedEvent]);
            })
            .catch(err => console.error("Failed to add event:", err));
    };

    const addUnavailableTime = (newTime) => {
        fetch('/api/unavailable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTime)
        })
            .then(res => res.json())
            .then(createdTime => {
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
                    setUnavailableTimes(currentTimes =>
                        currentTimes.filter(time => time.id !== id)
                    );
                } else {
                    console.error("Failed to delete time block on server");
                }
            })
            .catch(err => console.error("Failed to remove unavailable time:", err));
    };

    // --- Context Value ---

    const contextValue = {
        userName,
        setUserName,
        events,
        addEvent,
        unavailableTimes,
        addUnavailableTime,
        removeUnavailableTime,
        logout,
        authStatus // <-- PASS NEW STATE
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;