import TaskWorkspace from "../../components/TaskWorkspace";
import SiteChrome from "../../components/SiteChrome";

export default function TasksPage() {
  return (
    <SiteChrome>
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-section-heading">
            <div>
              <span className="sb-eyebrow">Marketplace</span>
              <h1>Available work</h1>
            </div>
            <p>Browse available tasks and submit completed work from your account.</p>
          </div>
          <TaskWorkspace />
        </div>
      </section>
    </SiteChrome>
  );
}
