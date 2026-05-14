const { Router } = require('express');
const auth = require('../middleware/auth');
const { getAll, create, update, remove } = require('../controllers/subscriptionController');

const router = Router();
router.use(auth);          // all subscription routes require a valid JWT

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
