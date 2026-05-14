const { Router } = require('express');
const auth = require('../middleware/auth');
const { status, push, pull } = require('../controllers/syncController');

const router = Router();
router.use(auth);

router.get('/status', status);
router.post('/push', push);
router.post('/pull', pull);

module.exports = router;
