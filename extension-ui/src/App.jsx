import { useState } from "react";
import Sidebar from "./components/Sidebar";

function App() {
  const [accepted, setAccepted] = useState(
    localStorage.getItem("accepted") === "true"
  );

  const handleAccept = () => {
    localStorage.setItem("accepted", "true");
    setAccepted(true);
  };

  if (!accepted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md max-w-sm text-center">
          <h2 className="text-lg font-bold mb-4">Terms & Conditions</h2>
          <p className="mb-4">
            You must accept before using the Legal AI Assistant.
          </p>
          <button
            onClick={handleAccept}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            I Accept
          </button>
        </div>
      </div>
    );
  }

  return <Sidebar />;
}

export default App;
