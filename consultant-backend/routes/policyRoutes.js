const express = require('express');
const policyController = require('../controllers/policyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new policy
router.post('/', authMiddleware, policyController.createPolicy);

// Get a policy by consultant ID
router.get('/:consultantId', authMiddleware, policyController.getPolicyByConsultantId);

// Update a policy by consultant ID
router.put('/:consultantId', authMiddleware, policyController.updatePolicy);

// Delete a policy by consultant ID
router.delete('/:consultantId', authMiddleware, policyController.deletePolicy);

module.exports = router;
