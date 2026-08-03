require('dotenv').config();
const chatController = require('./controllers/chatController');

(async () => {
  const query = process.argv[2] || "how many leaves do I have left";
  console.log(`\n--- TESTING EMPLOYEE QUERY: "${query}" ---\n`);
  
  const req = {
    body: { message: query },
    user: { id: 2, name: 'John Doe', role: 'Employee', department: 'Operations' } // Ensure user 2 is an employee
  };
  
  const res = {
    json: (data) => {
      console.log('SUCCESS JSON Response:\n', JSON.stringify(data, null, 2));
    },
    status: (code) => ({
      json: (data) => {
        console.log(`ERROR ${code}:\n`, JSON.stringify(data, null, 2));
      }
    })
  };

  try {
    await chatController.handleChatMessage(req, res);
  } catch (err) {
    console.error("UNHANDLED EXCEPTION:", err);
  }
  process.exit(0);
})();
