const customerAddressService = require(
  "../services/customerAddress.service"
);

const customerAddressController = {

  // ADD ADDRESS
  addAddress: async (req, res) => {
    try {
      const userId = req.user.user_id;

      const result = await customerAddressService.addAddress(
        userId,
        req.body
      );

      return res.status(201).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error("Add Address Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },


  // GET ALL ADDRESSES
  getAddresses: async (req, res) => {
    try {
      const userId = req.user.user_id;

      const addresses = await customerAddressService.getAddresses(
        userId
      );

      return res.status(200).json({
        success: true,
        count: addresses.length,
        addresses
      });

    } catch (error) {
      console.error("Get Addresses Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },


  // GET ADDRESS BY ID
  getAddressById: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { addressId } = req.params;

      const address = await customerAddressService.getAddressById(
        userId,
        addressId
      );

      return res.status(200).json({
        success: true,
        address
      });

    } catch (error) {
      console.error("Get Address Error:", error);

      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },


  // UPDATE ADDRESS
  updateAddress: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { addressId } = req.params;

      const result = await customerAddressService.updateAddress(
        userId,
        addressId,
        req.body
      );

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error("Update Address Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },


  // DELETE ADDRESS
  deleteAddress: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { addressId } = req.params;

      const result = await customerAddressService.deleteAddress(
        userId,
        addressId
      );

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error("Delete Address Error:", error);

      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

};

module.exports = customerAddressController;