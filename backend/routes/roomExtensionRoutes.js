const express = require('express');
const router = express.Router();
const roomExtensionController = require('../controllers/roomExtensionController');
const auth = require('../middleware/auth');

// Guest routes
router.get('/guest/requests', auth, roomExtensionController.getExtensionRequestsForGuest);
router.post('/guest/request', auth, roomExtensionController.createExtensionRequest);

// Staff/Admin routes
router.get('/', auth, roomExtensionController.getAllExtensionRequests);
router.put('/:id', auth, roomExtensionController.updateExtensionRequest);

module.exports = router;

