require('dotenv').config();
const chatController = require('./controllers/chatController');

(async () => {
  const query = process.argv[2] || "what materials are running low right now";
  console.log(`\n--- TESTING QUERY: "${query}" ---\n`);
  
  const req = {
    body: { message: query },
    user: { id: 1, name: 'Admin', role: 'ADMIN', department: 'Management' }
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
