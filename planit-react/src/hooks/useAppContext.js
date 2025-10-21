import { useContext } from 'react';
import { AppContext } from '../context/AppContext.js'; // Import the context

// This file *only* exports a hook (a function)
export const useAppContext = () => {
    const context = useContext(AppContext);

    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }

    return context;
};