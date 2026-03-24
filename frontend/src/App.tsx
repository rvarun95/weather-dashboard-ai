import { Dashboard } from "./components/Dashboard";

const App = () => {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Weather Dashboard</h1>
        <p>Search cities, pin widgets, and monitor live conditions.</p>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
};

export default App;

