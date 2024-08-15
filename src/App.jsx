import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';


const GeminiChat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState(null);
  

  const API_KEY = 'AIzaSyAB-kOBwSoHZRlnUZf7Stacnpxzywc_LhY';
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse('');
    setSelectedHistoryItem(null);
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
    let date_range = "";
    if (startDate && endDate) {
      date_range = ` using dates from ${startDate} to ${endDate}`;
    }
  
    let file_reference = "";
    if (file) {
      file_reference = ` using the file ${file.name}`;
    }
    
    const input_final = `${input}${date_range}${file_reference}`;
  
    try {
      const result = await model.generateContent(input_final);
      const responseText = await result.response.text();
      setResponse(responseText);
      
      const newHistoryItem = { query: input_final, response: responseText };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error:', error);
      setError({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred'
      });
    }
  };

  const handleHistoryItemClick = (item) => {
    setInput(item.query);
    setSelectedHistoryItem(item);
    setResponse(item.response);
  };

  const ErrorPrompt = ({ error }) => (
    <div style={{ 
      backgroundColor: '#ffebee', 
      border: '1px solid #ef9a9a', 
      borderRadius: '4px', 
      padding: '16px', 
      marginTop: '16px' 
    }}>
      <h3 style={{ color: '#c62828', marginTop: 0 }}>Error Occurred</h3>
      <p><strong>Error Code:</strong> {error.code}</p>
      <p><strong>Message:</strong> {error.message}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ 
        width: '300px', 
        borderRight: '1px solid #ccc', 
        padding: '20px',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h3>Search History</h3>
        {history.map((item, index) => (
          <div key={index} style={{ 
            marginBottom: '10px', 
            padding: '8px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => handleHistoryItemClick(item)}
          >
            {item.query}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
      <form onSubmit={handleSubmit}>
  <div style={{ marginBottom: '10px' }}>
    <label htmlFor="startDate">Start Date: </label>
    <input
      type="date"
      id="startDate"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label htmlFor="endDate">End Date: </label>
    <input
      type="date"
      id="endDate"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label htmlFor="file">File: </label>
    <input
      type="file"
      id="file"
      onChange={(e) => setFile(e.target.files[0])}
    />
  </div>
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask Gemini something..."
    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
  />
  <button type="submit" style={{ padding: '10px 20px' }}>Submit</button>
</form>
        {error && <ErrorPrompt error={error} />}
        {(response || selectedHistoryItem) && (
          <div>
            <h3>Response:</h3>
            <p>{selectedHistoryItem ? selectedHistoryItem.response : response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiChat;