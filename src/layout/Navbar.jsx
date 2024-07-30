import React, { useState } from 'react';

function Navbar({ exportJson, onSave, onRestore }) {
  const [showIframe, setShowIframe] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const toggleIframe = () => {
    setShowIframe(!showIframe);
    setIframeKey(prevKey => prevKey + 1); // Increment iframeKey to force iframe reload
  };

  return (
    <nav className="bg-white  border-gray-200 shadow-lg fixed w-full left-0 top-0 z-10">
      <div className="flex flex-wrap items-center justify-between p-4 w-full">
        <a href="#" className="flex items-center">
          <img src="imgs/Chat-icon.png" className="h-8 mr-3" alt="Flowbite Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">Chatbot Admin Panel</span>
        </a>
        <button data-collapse-toggle="navbar-multi-level" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-multi-level" aria-expanded="false">
          <span className="sr-only">Open main menu</span>
          <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
        </button>
        <div className="hidden w-full md:block md:w-auto" id="navbar-multi-level">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 dark:border-gray-700">
            <li>
              <button className="border w-24 py-2 border-gray-300 hover:border-gray-400" onClick={exportJson}>Export</button>
            </li>
            <li>
              <button className="border w-24 py-2 border-gray-300 hover:border-gray-400" onClick={onSave}>Save</button>
            </li>
            {/* <li>
              <button className="border w-24 py-2 border-gray-300 hover:border-gray-400" onClick={onRestore}>Restore</button>
            </li> */} 
            <li>
              <button onClick={toggleIframe} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h8m-8 4h6" />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
      {showIframe && (
        <div className="absolute top-16 right-4 bg-white shadow-lg border rounded-lg p-4" style={{ width: '450px', height: '650px' }}>
          <iframe key={iframeKey} src="http://127.0.0.1:5500/index.html" width="100%" height="100%" title="Iframe Example"></iframe>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
