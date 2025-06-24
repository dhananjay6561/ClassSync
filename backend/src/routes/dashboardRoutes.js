const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');
const attachSchoolId = require('../middlewares/attachSchoolId');
const { getAdminDashboard, getAdminStats } = require('../controllers/dashboardController');

router.use(auth, attachSchoolId);

router.get('/admin', permit('admin'), getAdminDashboard);
router.get('/stats', permit('admin'), getAdminStats);

module.exports = router;
