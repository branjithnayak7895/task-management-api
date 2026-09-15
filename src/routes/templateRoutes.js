const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTemplates, createTemplate, instantiateTemplate } = require('../controllers/templateController');

router.use(protect);

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.post('/:id/instantiate', instantiateTemplate);

module.exports = router;
