const router = require('express').Router();
router.get('/', (req, res) => res.send('admin route OK')); // or 'user route OK'
module.exports = router;