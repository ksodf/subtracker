const { Router } = require('express');
const auth = require('../middleware/auth');
const { status } = require('../controllers/syncController');

const router = Router();
router.use(auth);

router.get('/status', status);

module.exports = router;
