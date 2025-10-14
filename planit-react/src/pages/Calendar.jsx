import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Calendar.module.css'; // This import is correct

const Calendar = () => {
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <>
            <Header />
            <main className="p-6 max-w-screen-2xl mx-auto pt-28">
                <h1 className="text-2xl font-merriweather mb-6">Calendar</h1>
                <div className="flex gap-8">
                    {/* Sidebar Buttons */}
                    <div className="flex flex-col gap-3">
                        <a href="#" title="Add New Event" className="flex items-center justify-center p-1 border-2 border-primary-brand rounded-lg bg-transparent text-primary-brand transition duration-200 hover:bg-primary-brand hover:text-white">
                            <span className="material-symbols-outlined text-xl font-extrabold leading-none">add</span>
                        </a>
                        <a href="#" title="Share Calendar" className="flex items-center justify-center p-1 border-2 border-primary-brand rounded-lg bg-transparent text-primary-brand transition duration-200 hover:bg-primary-brand hover:text-white">
                            <span className="material-symbols-outlined text-xl font-extrabold leading-none">share</span>
                        </a>
                        <a href="#" title="Sync with Google Calendar" className="flex items-center justify-center p-1 border-2 border-primary-brand rounded-lg bg-transparent text-primary-brand transition duration-200 hover:bg-primary-brand hover:text-white">
                            <span className="font-bold text-xl">G</span>
                        </a>
                    </div>

                    {/* Main Calendar Grid */}
                    <div className={styles.calendarGrid}>
                        {/* Map over the headers and apply the dayHeader style */}
                        {dayHeaders.map(day => (
                            <div key={day} className={`${styles.dayHeader} bg-primary-brand text-creamy-bg text-center py-2 font-semibold`}>
                                {day}
                            </div>
                        ))}

                        {/* Map over the days and apply the calendarDay style */}
                        {Array.from({ length: 35 }, (_, i) => {
                            const dayNum = i < 31 ? i + 1 : null;
                            return (
                                <div
                                    key={`day-${i}`}
                                    className={`${styles.calendarDay} bg-creamy-bg p-2 cursor-pointer min-h-[180px]`}
                                >
                                    {dayNum}
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
