import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css'; // Ensure you have the CSS file for card styling

const HomePage = () => {
  const navigate = useNavigate();
  const [chatFlows, setChatFlows] = useState([]);

  useEffect(() => {
    // Retrieve saved chat flows from localStorage
    const savedChatFlows = Object.keys(localStorage)
      .filter(key => key.startsWith('chatflow_'))
      .map(key => {
        const flow = JSON.parse(localStorage.getItem(key));
        return {
          name: key.replace('chatflow_', ''),
          key,
          description: flow.description || '',
        };
      });
    setChatFlows(savedChatFlows);
  }, []);

  const handleCreateNewChatFlow = () => {
    navigate('/dashboard', { state: { action: 'createNew' } });
  };

  const handleLoadChatFlow = (chatFlowKey) => {
    navigate('/dashboard', { state: { action: 'loadSpecific', chatFlowKey } });
  };

  const handleDeleteChatFlow = (e, chatFlowKey) => {
    e.stopPropagation(); // Prevent triggering the load event
    localStorage.removeItem(chatFlowKey);
    setChatFlows(chatFlows.filter(chatFlow => chatFlow.key !== chatFlowKey));
  };

  const handleEditChatFlow = (e, chatFlowKey) => {
    e.stopPropagation(); // Prevent triggering the load event
    navigate('/dashboard', { state: { action: 'edit', chatFlowKey } });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Chat Flows</h1>
        <button
          onClick={handleCreateNewChatFlow}
          className="inline-flex items-center p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <span className="mr-2">Create New Chat Flow</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {chatFlows.length > 0 ? (
          chatFlows.map((chatFlow) => (
            <div
              key={chatFlow.key}
              className="card"
              onClick={() => handleLoadChatFlow(chatFlow.key)}
            >
              <div className="card-content">
                <div className="card-top">
                  <span className="card-title">{chatFlow.name}</span>
                  <div className="flex space-x-2">
                    <button
                      className="icon-button text-gray-400 hover:text-blue-600"
                      onClick={(e) => handleEditChatFlow(e, chatFlow.key)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12h.01M19.5 11A2.5 2.5 0 0017 8.5H7A2.5 2.5 0 004.5 11v5A2.5 2.5 0 007 18.5h10a2.5 2.5 0 002.5-2.5v-5z" />
                      </svg>
                    </button>
                    <button
                      className="icon-button text-gray-400 hover:text-red-600"
                      onClick={(e) => handleDeleteChatFlow(e, chatFlow.key)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="card-bottom">
                  <p>{chatFlow.description || 'No description provided'}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">No saved chat flows found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
