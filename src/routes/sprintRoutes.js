const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createSprint, getSprints, getBurndown } = require('../controllers/sprintController');

router.use(protect);

router.route('/')
  .post(createSprint)
  .get(getSprints);

router.get('/:id/burndown', getBurndown);

module.exports = router;
