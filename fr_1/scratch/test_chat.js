require('dotenv').config({ path: '../backend/.env' });
const chatController = require('../backend/controllers/chatController');

(async () => {
  const req = {
    body: { message: "what materials are running low right now" },
    user: { id: 1, name: 'Admin', role: 'ADMIN', department: 'Management' }
  };
  
  const res = {
    json: (data) => {
      console.log('SUCCESS JSON:', JSON.stringify(data, null, 2));
    },
    status: (code) => ({
      json: (data) => {
        console.log(`ERROR ${code}:`, JSON.stringify(data, null, 2));
      }
    })
  };

  await chatController.handleChatMessage(req, res);
  process.exit(0);
})();
