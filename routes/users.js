const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    res.send('Hello user route');
})

module.exports = router;