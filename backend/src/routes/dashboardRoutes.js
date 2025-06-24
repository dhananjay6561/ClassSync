const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');
const { getAdminDashboard } = require('../controllers/dashboardController');

router.use(auth);

router.get('/admin', permit('admin'), getAdminDashboard);

module.exports = router;
