import { useState } from 'react';

const CollabModal = ({ isOpen, onClose }) => {
    const [teammateEmail, setTeammateEmail] = useState('');
    const [message, setMessage] = useState(null);

    if (!isOpen) return null;

    const handleAddTeammate = async () => {
        if (!teammateEmail) return;
        setMessage('Adding...');

        try {
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teammateEmail: teammateEmail })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(`Success: ${data.msg}`);
                setTeammateEmail('');
                // Optional: Close after a delay or let user close manually
                setTimeout(() => {
                    setMessage(null);
                    onClose();
                }, 1500);
            } else {
                setMessage(`Error: ${data.msg}`);
            }
        } catch (err) {
            setMessage(`Network error: ${err.message}`);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[1050] flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-sepia-text text-2xl leading-none hover:text-red-600"
                    aria-label="Close"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-merriweather mb-4">Collaborate</h2>
                <p className="text-sm mb-4 text-sepia-text">
                    Add a friend's email to let them see your calendar updates in real-time.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="collab-email" className="block font-bold mb-1 text-sepia-text">Friend's Email:</label>
                        <input
                            type="email"
                            id="collab-email"
                            value={teammateEmail}
                            onChange={e => setTeammateEmail(e.target.value)}
                            className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand"
                            placeholder="friend@example.com"
                        />
                    </div>

                    {message && (
                        <div className={`p-2 rounded text-sm ${message.startsWith('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleAddTeammate}
                        className="w-full py-2 px-4 rounded hover:opacity-90 transition duration-150 mt-2 border-2 shadow-md font-semibold"
                        style={{
                            backgroundColor: '#FFA500',
                            color: 'black',
                            borderColor: '#FFA500',
                        }}
                    >
                        Add to Team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollabModal;