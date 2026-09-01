import Navbar from '../components/Navbar';
import SkillBridgeTaskDashboard from '../components/SkillBridgeTaskDashboard';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <h1 className="title">Welcome to My Next.js App</h1>
        <SkillBridgeTaskDashboard studentId="demo-student" studentStatus="Intermediate" />
      </main>
    </>
  );
}
