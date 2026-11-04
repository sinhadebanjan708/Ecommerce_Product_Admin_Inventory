const express = require("express");
const router = express.Router();

const customerAddressController = require(
  "../controllers/customerAddress.controller"
);

const {authMiddleware} = require(
  "../middleware/authMiddleWare"
);


// Add address
router.post(
  "/add-address",
  authMiddleware,
  customerAddressController.addAddress
);

// Get all addresses
router.get(
  "/get-address",
  authMiddleware,
  customerAddressController.getAddresses
);

// Get address by ID
router.get(
  "/get-address/:addressId",
  authMiddleware,
  customerAddressController.getAddressById
);

// Update address
router.put(
  "/put-address/:addressId",
  authMiddleware,
  customerAddressController.updateAddress
);

// Delete address
router.delete(
  "/del-address/:addressId",
  authMiddleware,
  customerAddressController.deleteAddress
);

module.exports = router;