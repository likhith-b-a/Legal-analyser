import { useState } from "react";
import Upload from "./Tabs/Upload";
import Summary from "./Tabs/Summary";
import Chatbot from "./Tabs/Chatbot";
import Settings from "./Tabs/Settings";

function Sidebar() {
  const [activeTab, setActiveTab] = useState("upload");

  const renderTab = () => {
    switch (activeTab) {
      case "upload":
        return <Upload />;
      case "summary":
        return <Summary />;
      case "chatbot":
        return <Chatbot />;
      case "settings":
        return <Settings />;
      default:
        return <Upload />;
    }
  };

  return (
    <div className="h-screen w-80 bg-gray-100 p-4">
      <div className="flex space-x-2 mb-4">
        {["upload", "summary", "chatbot", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white text-black"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div>{renderTab()}</div>
    </div>
  );
}

export default Sidebar;
