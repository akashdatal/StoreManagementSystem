const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.send('admin route OK'));
module.exports = router;
