const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const permit = require('../middlewares/roleMiddleware');
const { getConflicts } = require('../controllers/conflictController');

router.use(auth);
router.get('/', permit('admin'), getConflicts);

module.exports = router;
