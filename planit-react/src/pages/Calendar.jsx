import Header from '../components/Header';
import Footer from '../components/Footer';

const Calendar = () => (
    <>
        <Header />
        <main className="p-6 max-w-6xl mx-auto pt-28 bg-creamy-bg">
            <h1 className="text-2xl font-merriweather mb-6">Calendar</h1>
            <div className="flex gap-8">
                <div className="flex flex-col gap-3">
                    <a href="#" title="Add New Event" className="flex items-center justify-center p-1 border-2 border-primary-brand rounded-lg bg-transparent text-primary-brand transition duration-200 hover:bg-primary-brand hover:text-creamy-bg">
                        <span className="material-symbols-outlined text-xl font-extrabold leading-none">add</span>
                    </a>
                    {/* Add more sidebar buttons as in HTML */}
                </div>
                <div className="calendar-grid bg-sepia-text border border-sepia-text overflow-hidden shadow-lg rounded-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, auto)', gap: '1px' }}>
                    {/* Headers: Sun-Sat */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="day-header bg-sepia-text text-creamy-bg text-center py-2 font-semibold rounded-t-xl first:rounded-l-xl last:rounded-r-xl">
                            {day}
                        </div>
                    ))}
                    {/* Days: Use array for 1-31 + empties; add events as props later */}
                    {Array.from({ length: 42 }, (_, i) => {
                        const dayNum = i < 31 ? i + 1 : '';
                        const isEmpty = i >= 31;
                        return (
                            <div key={i} className={`calendar-day bg-creamy-bg min-h-[100px] p-2 hover:bg-creamy-bg/80 cursor-pointer first:rounded-bl-xl last:rounded-br-xl ${isEmpty ? 'empty' : ''}`}>
                                {dayNum || ''}
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
        <Footer />
    </>
);

export default Calendar;