const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
const UserFetchService = require("../services/userService");

router.get("/get-message", async (req, res, next) => {
  try {
    const newStatusInfo = await UserFetchService.fetchUsers();
    res.status(200).json({user: newStatusInfo.user.data, status: 200});
  } catch (err) {
    res.status(500).json({ message: 500 });  
  }
});

module.exports = router;