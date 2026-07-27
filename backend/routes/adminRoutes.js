const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  toggleBlockUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here require admin access
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/block', toggleBlockUser);

module.exports = router;
