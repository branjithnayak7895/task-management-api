const Team = require('../models/Team');
const logAudit = require('../middleware/auditLogger');

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({
      name,
      description,
      leader: req.user._id,
      members: [{ user: req.user._id, role: 'leader' }]
    });
    await logAudit(req, 'CREATE_TEAM', 'Team', team._id, `Created team: ${team.name}`);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id
    }).populate('leader', 'username email').populate('members.user', 'username email role');

    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const exists = team.members.find(m => m.user.toString() === userId);
    if (exists) {
      exists.role = role || exists.role;
    } else {
      team.members.push({ user: userId, role: role || 'developer' });
    }

    await team.save();
    await logAudit(req, 'ADD_TEAM_MEMBER', 'Team', team._id, `Added member to team ${team.name}`);
    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
