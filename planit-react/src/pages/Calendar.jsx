import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Calendar.module.css';
import { useAppContext } from '../hooks/useAppContext.js';
import AddEventModal from '../components/AddEventModal';


const getCalendarDays = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon,...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];

    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push({
            date: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + 1 + i),
            isCurrentMonth: false,
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push({
            date: new Date(year, month, i),
            isCurrentMonth: true,
        });
    }

    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
        daysArray.push({
            date: new Date(year, month + 1, i),
            isCurrentMonth: false,
        });
    }

    return daysArray;
};



const Calendar = () => {
    const { events } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 21));
    const [isModalOpen, setIsModalOpen] = useState(false);

    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const calendarDays = getCalendarDays(currentYear, currentMonth);

    const getEventsForDay = (dayDate) => {
        return events.filter(event =>
            event.date.getDate() === dayDate.getDate() &&
            event.date.getMonth() === dayDate.getMonth() &&
            event.date.getFullYear() === dayDate.getFullYear()
        ).sort((a, b) => a.date.getHours() - b.date.getHours());
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };


    return (
        <>
            <Header />
            <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <main className="p-6 max-w-screen-2xl mx-auto pt-28 min-h-screen">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-merriweather">{monthName} {currentYear}</h1>
                    <div className="flex gap-2">
                        <button onClick={goToPreviousMonth} className="px-3 py-1 md:px-4 md:py-2 bg-primary-brand text-white rounded hover:bg-primary-brand/90 text-sm md:text-base transition duration-150">&lt; Prev</button>
                        <button onClick={goToToday} className="px-3 py-1 md:px-4 md:py-2 bg-primary-brand text-white rounded hover:bg-primary-brand/90 text-sm md:text-base transition duration-150">Today</button>
                        <button onClick={goToNextMonth} className="px-3 py-1 md:px-4 md:py-2 bg-primary-brand text-white rounded hover:bg-primary-brand/90 text-sm md:text-base transition duration-150">Next &gt;</button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    <div className="flex flex-row md:flex-col gap-3 justify-center md:justify-start">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            title="Add New Event"
                            className="flex items-center justify-center p-2 border-2 border-primary-brand rounded-lg bg-transparent text-primary-brand transition duration-200 hover:bg-primary-brand hover:text-white"
                        >
                            <span className="material-symbols-outlined text-xl font-extrabold leading-none">add</span>
                        </button>

                        <a href="#" title="Share Calendar" className="flex items-center justify-center p-2 border-2 border-primary-brand rounded-lg bg-transparent text-primary-brand transition duration-200 hover:bg-primary-brand hover:text-white">
                            <span className="material-symbols-outlined text-xl font-extrabold leading-none">share</span>
                        </a>
                        <a href="#" title="Sync with Google Calendar" className="flex items-center justify-center p-2 border-2 border-primary-brand rounded-lg bg-transparent text-primary-brand transition duration-200 hover:bg-primary-brand hover:text-white">
                            <span className="font-bold text-xl">G</span>
                        </a>
                    </div>

                    <div className={`${styles.calendarGrid} w-full`}>
                        {dayHeaders.map(day => (
                            <div key={day} className={`${styles.dayHeader} bg-primary-brand text-creamy-bg text-center py-2 font-semibold text-sm md:text-base`}>
                                {day}
                            </div>
                        ))}

                        {calendarDays.map((dayObj, index) => {
                            const dayEvents = dayObj.isCurrentMonth ? getEventsForDay(dayObj.date) : [];
                            const today = new Date();
                            const isToday = dayObj.isCurrentMonth &&
                                dayObj.date.getDate() === today.getDate() &&
                                dayObj.date.getMonth() === today.getMonth() &&
                                dayObj.date.getFullYear() === today.getFullYear();

                            const dayCellStyle = dayObj.isCurrentMonth
                                ? 'bg-creamy-bg'
                                : 'bg-creamy-bg/50 text-sepia-text/50';

                            return (
                                <div
                                    key={`${dayObj.date.toISOString()}-${index}`}
                                    className={`${styles.calendarDay} ${dayCellStyle} p-1 md:p-2 cursor-pointer min-h-[100px] md:min-h-[150px] flex flex-col`}
                                >
                                    <span className={`font-bold text-xs md:text-sm self-start ${isToday ? 'bg-primary-brand text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center' : ''}`}>
                                        {dayObj.date.getDate()}
                                    </span>
                                    <div className="flex-grow overflow-auto text-[10px] md:text-xs mt-1 space-y-1">
                                        {dayEvents.map(event => (
                                            <div key={event.id} className="bg-primary-brand/80 text-white p-1 rounded leading-tight">
                                                {event.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit'})} - {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Calendar;