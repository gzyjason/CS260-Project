import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import About from './pages/About';
import Calendar from './pages/Calendar';
import Preferences from './pages/Preferences';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/preferences" element={<Preferences />} />
            </Routes>
        </Router>
    );
}

export default App;