const express = require('express');
const serviceUsageController = require('../controllers/serviceUsageController');

const router = express.Router();

router.post('/', serviceUsageController.createServiceUsage);
router.get('/', serviceUsageController.getAllServiceUsages);
router.get('/:id', serviceUsageController.getServiceUsageById);
router.put('/:id', serviceUsageController.updateServiceUsage);
router.delete('/:id', serviceUsageController.deleteServiceUsage);

module.exports = router;
