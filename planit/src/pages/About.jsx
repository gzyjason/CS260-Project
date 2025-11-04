import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => (
    <>
        <Header />
        <main className="p-6 max-w-4xl mx-auto pt-28 bg-creamy-bg">
            <h1 className="text-2xl font-merriweather mb-6">What is PlanIt?</h1>
            <p>PlanIt is a smart calendar solution that can automatically add your tasks and events to your calendar according to your preferences.</p>
            <p>It also has built-in collaboration features, so you can work on the perfect plan with everyone in your group.</p>
            <p>Sign up today to start planning ahead!</p>
        </main>
        <Footer />
    </>
);

export default About;