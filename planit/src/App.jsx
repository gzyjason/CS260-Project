import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import About from './pages/About';
import Calendar from './pages/Calendar';
import Preferences from './pages/Preferences';
import ProtectedRoute from './components/ProtectedRoute'; // 1. Import ProtectedRoute

function App() {
    return (
        <Routes>
            {/* These routes are public */}
            <Route path="/" element={<Login />} />
            <Route path="/about" element={<About />} />

            {/* 2. Wrap Calendar in ProtectedRoute */}
            <Route
                path="/calendar"
                element={
                    <ProtectedRoute>
                        <Calendar />
                    </ProtectedRoute>
                }
            />

            {/* 3. Wrap Preferences in ProtectedRoute */}
            <Route
                path="/preferences"
                element={
                    <ProtectedRoute>
                        <Preferences />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;