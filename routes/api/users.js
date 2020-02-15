const express = require("express");
// Define express Router
const router = express.Router();

// @route   GET /api/users/test
// @desc    Tests get route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works!!" });
});

module.exports = router;
