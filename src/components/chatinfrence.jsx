import React, { useState } from 'react';
import '../chatinfrenece.css'

const ChatInterface = ({ conversation, handleUserInput }) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (userInput.trim()) {
      handleUserInput(userInput);
      setUserInput('');
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {conversation.map((message, index) => (
          <div key={index} className={`message ${message.id === 'user' ? 'user-message' : 'bot-message'}`}>
            {message.content && (
              <p dangerouslySetInnerHTML={{ __html: message.content.content }} />
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatInterface;
