const { Router } = require('express');
const auth = require('../middleware/auth');
const { downloadCsv, downloadPdf } = require('../controllers/reportController');

const router = Router();
router.use(auth);

router.get('/subscriptions.csv', downloadCsv);
router.get('/subscriptions.pdf', downloadPdf);

module.exports = router;
