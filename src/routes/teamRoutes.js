const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createTeam, getTeams, addTeamMember } = require('../controllers/teamController');

router.use(protect);

router.route('/')
  .post(createTeam)
  .get(getTeams);

router.route('/:id/members')
  .post(addTeamMember);

module.exports = router;
