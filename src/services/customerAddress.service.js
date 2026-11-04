const db = require("../models");

const { Address } = db;
const sequelize = db.sequelize;

const customerAddressService = {

  // ADD ADDRESS
  async addAddress(userId, data) {

    const transaction = await sequelize.transaction();

    try {
      const {
        full_name,
        address_line1,
        city,
        state,
        pincode,
        latitude,
        longitude,
        location_accuracy,
        is_default
      } = data;
      console.log("req-body-address",full_name,
        address_line1,
        city,
        state,
        pincode,
        is_default)

      const addressCount = await Address.count({
        where: { user_id: userId },
        transaction
      });

      const makeDefault =
        is_default === true || is_default === 1 || addressCount === 0;

      if (makeDefault) {
        await Address.update(
          { is_default: false },
          {
            where: { user_id: userId },
            transaction
          }
        );
      }

      const address = await Address.create(
        {
          user_id: userId,
          full_name,
          address_line1,
          city,
          state,
          pincode,
          latitude,
          longitude,
          location_accuracy,
          is_default: makeDefault
        },
        { transaction }
      );

      await transaction.commit();

      return {
        message: "Address added successfully",
        address
      };

    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  },


  // GET ALL ADDRESSES
  async getAddresses(userId) {

    return await Address.findAll({
      where: { user_id: userId },
      order: [
        ["is_default", "DESC"],
        ["created_at", "DESC"]
      ]
    });

  },


  // GET ADDRESS BY ID
  async getAddressById(userId, addressId) {

    const address = await Address.findOne({
      where: {
        id: addressId,
        user_id: userId
      }
    });

    if (!address) {
      throw new Error("Address not found");
    }

    return address;
  },


  // UPDATE ADDRESS
  async updateAddress(userId, addressId, data) {

    const transaction = await sequelize.transaction();

    try {
      const address = await Address.findOne({
        where: {
          id: addressId,
          user_id: userId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!address) {
        throw new Error("Address not found");
      }

      const allowedFields = [
        "full_name",
        "address_line1",
        "city",
        "state",
        "pincode",
        "latitude",
        "longitude",
        "location_accuracy",
        "is_default"
      ];

      const updateData = Object.fromEntries(
        Object.entries(data).filter(([key]) =>
          allowedFields.includes(key)
        )
      );

      if (
        updateData.is_default === true ||
        updateData.is_default === 1
      ) {
        await Address.update(
          { is_default: false },
          {
            where: { user_id: userId },
            transaction
          }
        );
      }

      await address.update(updateData, { transaction });

      await transaction.commit();

      return {
        message: "Address updated successfully",
        address
      };

    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  },


  // DELETE ADDRESS
  async deleteAddress(userId, addressId) {

    const transaction = await sequelize.transaction();

    try {
      const address = await Address.findOne({
        where: {
          id: addressId,
          user_id: userId
        },
        transaction
      });

      if (!address) {
        throw new Error("Address not found");
      }

      const wasDefault = address.is_default;

      await address.destroy({ transaction });

      // If the deleted address was default,
      // make another saved address the default.
      if (wasDefault) {
        const nextAddress = await Address.findOne({
          where: { user_id: userId },
          order: [["created_at", "ASC"]],
          transaction
        });

        if (nextAddress) {
          await nextAddress.update(
            { is_default: true },
            { transaction }
          );
        }
      }

      await transaction.commit();

      return {
        message: "Address deleted successfully"
      };

    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

};

module.exports = customerAddressService;