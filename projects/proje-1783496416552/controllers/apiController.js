const express = require('express');
const router = express.Router();

// Basit bilgiler için bir endpoint ekle
router.get('/simple', (req, res) => {
    res.json({ message: "Basit bilgiler" });
});

module.exports = router;
