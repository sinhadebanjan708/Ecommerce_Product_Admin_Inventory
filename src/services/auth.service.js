const db = require('../models');
const { User, Otp, Role, UserRole , RefreshToken , RolePermission , Permission} = db;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const sequelize = db.sequelize;
//  const smsService = require('./sms.service');
 const emailService = require('./email.service');
const crypto = require('crypto');
const tokenId = crypto.randomUUID();
const tokenService = require('./token.service');
const { channel } = require('diagnostics_channel');

class AuthService {
  
  // Generate 6-digit OTP
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP (Register)
 async refreshToken(refreshToken) {

    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    let decoded;

    // Step 1: Verify refresh token signature and expiry
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (error) {
      console.error("JWT Verification Error:", error.name);
  console.error("JWT Error Message:", error.message);

      throw new Error('Invalid or expired refresh token');
    }

    console.log('token structure__',decoded)
    // Step 2: Validate token structure
    if (!decoded.user_id || !decoded.jti || !decoded.role) {
      throw new Error('Invalid refresh token');
    }

    // Step 3: Begin database transaction
    const transaction = await sequelize.transaction();

    try {

      // Step 4: Find existing refresh token
      const existingToken = await RefreshToken.findOne({
        where: {
          user_id: decoded.user_id,
          token_hash: tokenService.hashToken(refreshToken),
          revoked_at: null
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!existingToken) {
        throw new Error('Refresh token has already been used or revoked');
      }

      // Step 5: Check database expiry
      if (new Date(existingToken.expires_at) <= new Date()) {
        throw new Error('Refresh token expired');
      }

      // Step 6: Find user
      const user = await User.findByPk(decoded.user_id, {
        transaction
      });

      if (!user || !user.status) {
        throw new Error('User account is inactive or unavailable');
      }

      // Step 7: Revoke old refresh token
      await existingToken.update(
        {
          revoked_at: new Date()
        },
        { transaction }
      );

      // Step 8: Generate new access and refresh tokens
      const tokens = await tokenService.generateAuthTokens(
        user,
         decoded.role,
        transaction
      );

      // Step 9: Commit transaction
      await transaction.commit();

      return {
        message: 'Token refreshed successfully',
        ...tokens
      };

    } catch (error) {

      await transaction.rollback();

      throw error;
    }
  }

async existingUser({ email }) {
  const existingUser = await User.findOne({
    where: {
      email: email
    }
  });

  if (existingUser) {
    throw new Error("User Already Exists!");
  }

  return {
    exists: false,
    message: "Email is available"
  };
}


async sendRegisterOtp({ first_name, last_name, email }) {
  // ... existing validation code ...

  const otpCode = this.generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const channel = email ? 'email' : 'phone';

  await Otp.create({
    email: email || null,
    otp_code: otpCode,
    otp_type: 'register-customer',
    channel,
    expires_at: expiresAt
  });

  // Send OTP according to selected channel
  if (channel === 'phone') {

    await smsService.sendOTP(phone, otpCode);

  } else {

    await emailService.sendEmailOTP({
      email,
      first_name,
      last_name,
      otp: otpCode
    });

  }

  return {
    message: `OTP sent to your ${channel}`,
    channel,
    expires_in: '10 minutes'
  };
}

  // Verify OTP & Create Customer
  async verifyRegisterOtp({ email, role, otp, first_name, last_name }) {
    console.log('email or phone',email , otp)
    const transaction = await sequelize.transaction();
    const whereCondition = {
      otp_code: otp,
      otp_type: 'register-customer',
      is_used: false,
      expires_at: { [Op.gt]: new Date() }
    };

    // if (phone) whereCondition.phone = phone;
     if (email) whereCondition.email = email;
    else throw new Error('Email or Phone is required');

    const otpRecord = await Otp.findOne({ where: whereCondition });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as used
    otpRecord.is_used = true;
    await otpRecord.save();

    // Create User
    const user = await User.create({
      first_name,
      last_name,
      email: email || null,
      // phone: phone || null,
      email_verified: email ? true : false,
      phone_verified: false,
      status: 'active'
    });

    // Assign CUSTOMER role
    const customerRole = await Role.findOne({ where: { role_name: 'CUSTOMER' } });
    
    if (!customerRole) {
      throw new Error('CUSTOMER role not found in database');
    }

    await UserRole.create({
      user_id: user.id,
      role_id: customerRole.id,
      assigned_by: null
    });

    // Generate Tokens
    const tokens =await this.generateTokens(user, 'CUSTOMER', transaction);

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        // phone: user.phone,
        role: role
      },
      ...tokens
    };
  }

  // Generate JWT Tokens
 async generateTokens(user, role, transaction = null) {

  // Generate unique JWT ID
  const tokenId = crypto.randomUUID();

  const payload = {
    user_id: user.id,
    role: role,
    email: user.email,
    phone: user.phone,
    jti: tokenId
  };

  // Generate access token
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: '15m'
    }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d'
    }
  );

  // Hash refresh token
  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // Store refresh token
  await RefreshToken.create({
    user_id: user.id,
    jti: tokenId,
    token_hash: tokenHash,
    expires_at: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    )
  }, transaction ? { transaction } : {});

  return {
    accessToken,
    refreshToken
  };
}

  // Login flow
// async sendLoginOtp({ email, role }) {

//     if (!email || !role) {
//         throw new Error('Email and role are required');
//     }

//     // Step 1: Validate role
//     const allowedRoles = ['CUSTOMER', 'SELLER', 'ADMIN'];

//     role = role.toUpperCase();

//     if (!allowedRoles.includes(role)) {
//         throw new Error('Invalid login role');
//     }

//     // Step 2: Find active user
//     const user = await User.findOne({
//         where: {
//             email,
//             status: 'active'
//         }
//     });

//     if (!user) {
//         return {
//             status: 'NOT_REGISTERED',
//             message: `${role} account does not exist.`
//         };
//     }

//     // Step 3: Find requested role
//     const requestedRole = await Role.findOne({
//         where: {
//             role_name: role
//         }
//     });

//     if (!requestedRole) {
//         throw new Error(`${role} role not found`);
//     }

//     // Step 4: Verify user role assignment
//     const userRole = await UserRole.findOne({
//         where: {
//             user_id: user.id,
//             role_id: requestedRole.id
//         }
//     });

//     if (!userRole) {
//         throw new Error(`You are not authorized to login as ${role}`);
//     }

//     // Step 5: Generate OTP
//     const otp = Math.floor(
//         100000 + Math.random() * 900000
//     ).toString();

//     const otpTypeMap = {
//     ADMIN: 'admin-login',
//     CUSTOMER: 'customer-login',
//     SELLER: 'seller-login'
// };

// const otpType = otpTypeMap[role];

//     // Step 6: Store OTP
//     await Otp.create({
//         email: user.email,
//         otp_code: otp,
//         otp_type: otpType,
//         is_used: false,
//         channel: 'email',
//         expires_at: new Date(Date.now() + 5 * 60 * 1000)
//     });

//     // Step 7: Send OTP email
//     await emailService.sendEmailOTP({
//         email: user.email,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         otp
//     });

//     return {
//         status: 'OTP_SENT',
//         message: `${role} login OTP sent successfully`,
//         email: user.email,
//         role
//     };
// }
async sendLoginOtp({ email }) {

    if (!email) {
        throw new Error("Email is required");
    }

    // Step 1: Find active user
    const user = await User.findOne({
        where: {
            email,
            status: "active"
        }
    });

    if (!user) {
        return {
            status: "NOT_REGISTERED",
            message: "Account does not exist."
        };
    }

    // Step 2: Fetch all roles assigned to the user
    const userRoles = await UserRole.findAll({
        where: {
            user_id: user.id
        },
        include: [
            {
                model: Role,
                as: "role",
                attributes: ["id", "role_name"]
            }
        ]
    });

    if (!userRoles.length) {
        throw new Error("No role assigned to this account");
    }

    const roles = userRoles
        .filter(ur => ur.role)
        .map(ur => ur.role.role_name);

    // Step 3: Generate OTP
    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    // Step 4: Store OTP
    await Otp.create({
        email: user.email,
        otp_code: otp,
        otp_type: "login",
        is_used: false,
        channel: "email",
        expires_at: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Step 5: Send OTP email
    await emailService.sendEmailOTP({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        otp
    });

    return {
        status: "OTP_SENT",
        message: "Login OTP sent successfully",
        email: user.email,
        roles
    };
}

  
// async verifyLoginOtp({ email, otp, role }) {

//     if (!email || !otp || !role) {
//         throw new Error('Email, OTP and role are required');
//     }

//     role = role.toUpperCase();

//     // Only allow supported login roles
//     const allowedRoles = ['CUSTOMER', 'ADMIN','SELLER'];

//     if (!allowedRoles.includes(role)) {
//         throw new Error('Invalid login role');
//     }

//     const transaction = await sequelize.transaction();

//     try {

//         // Step 1: Find active user
//         const user = await User.findOne({
//             where: {
//                 email,
//                 status: 'active'
//             },
//             transaction
//         });

//         if (!user) {
//             throw new Error('Account not found or inactive');
//         }

//         const otpTypeMap = {
//     ADMIN: 'admin-login',
//     CUSTOMER: 'customer-login',
//     SELLER: 'seller-login'
// };

// const otpType = otpTypeMap[role];

//         // Step 2: Find valid login OTP
//         const otpRecord = await Otp.findOne({
//             where: {
//                 email,
//                 otp_code: otp,
//                 otp_type: otpType,
//                 channel: 'email',
//                 is_used: false,
//                 expires_at: {
//                     [Op.gt]: new Date()
//                 }
//             },
//             transaction,
//             lock: transaction.LOCK.UPDATE
//         });

//         if (!otpRecord) {
//             throw new Error('Invalid or expired OTP');
//         }

//         // Step 3: Find requested role
//         const requestedRole = await Role.findOne({
//             where: {
//                 role_name: role
//             },
//             transaction
//         });

//         if (!requestedRole) {
//             throw new Error(`${role} role not found`);
//         }

//         // Step 4: Verify user role assignment
//         const userRole = await UserRole.findOne({
//             where: {
//                 user_id: user.id,
//                 role_id: requestedRole.id
//             },
//             transaction
//         });

//         if (!userRole) {
//             throw new Error(`You are not authorized to login as ${role}`);
//         }

//         // Step 5: Fetch permissions for requested role
//         const rolePermissions = await RolePermission.findAll({
//             where: {
//                 role_id: requestedRole.id
//             },
//             include: [
//                 {
//                     model: Permission,
//                     as: 'permission',
//                     attributes: [
//                         'id',
//                         'permission_name',
//                         'module'
//                     ]
//                 }
//             ],
//             transaction
//         });

//         // Step 6: Populate permission objects
//         const permissions = rolePermissions
//             .filter(rp => rp.permission)
//             .map(rp => ({
//                 id: rp.permission.id,
//                 permission_name: rp.permission.permission_name,
//                 module: rp.permission.module
//             }));

//         // Step 7: Mark OTP as used
//         otpRecord.is_used = true;

//         await otpRecord.save({
//             transaction
//         });

//         // Step 8: Generate access and refresh tokens
//         const tokens = await this.generateTokens(
//             user,
//             role,
//             transaction
//         );

//         // Step 9: Commit transaction
//         await transaction.commit();

//         // Step 10: Return response
//         return {
//             message: `${role} login successful`,

//             user: {
//                 id: user.id,
//                 first_name: user.first_name,
//                 last_name: user.last_name,
//                 email: user.email,
//                 phone: user.phone,
//                 role
//             },

//             permissions,

//             ...tokens
//         };

//     } catch (error) {

//         if (!transaction.finished) {
//             await transaction.rollback();
//         }

//         throw error;
//     }
// }
async verifyLoginOtp({ email, otp }) {

    if (!email || !otp) {
        throw new Error("Email and OTP are required");
    }

    const transaction = await sequelize.transaction();

    try {

        // Step 1: Find active user
        const user = await User.findOne({
            where: {
                email,
                status: "active"
            },
            transaction
        });

        if (!user) {
            throw new Error("Account not found or inactive");
        }

        // Step 2: Find valid OTP
        const otpRecord = await Otp.findOne({
            where: {
                email,
                otp_code: otp,
                otp_type: "login",
                channel: "email",
                is_used: false,
                expires_at: {
                    [Op.gt]: new Date()
                }
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!otpRecord) {
            throw new Error("Invalid or expired OTP");
        }

        // Step 3: Fetch assigned roles
        const userRoles = await UserRole.findAll({
            where: {
                user_id: user.id
            },
            include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["id", "role_name"]
                }
            ],
            transaction
        });

        const roles = userRoles
            .filter(ur => ur.role)
            .map(ur => ur.role.role_name);

        if (!roles.length) {
            throw new Error("No role assigned to this account");
        }

        // Step 4: Fetch permissions for all assigned roles
        const roleIds = userRoles
            .filter(ur => ur.role)
            .map(ur => ur.role.id);

        const rolePermissions = await RolePermission.findAll({
            where: {
                role_id: {
                    [Op.in]: roleIds
                }
            },
            include: [
                {
                    model: Permission,
                    as: "permission",
                    attributes: [
                        "id",
                        "permission_name",
                        "module"
                    ]
                }
            ],
            transaction
        });

        const permissions = [
            ...new Map(
                rolePermissions
                    .filter(rp => rp.permission)
                    .map(rp => [
                        rp.permission.id,
                        {
                            id: rp.permission.id,
                            permission_name: rp.permission.permission_name,
                            module: rp.permission.module
                        }
                    ])
            ).values()
        ];

        // Step 5: Mark OTP as used
        otpRecord.is_used = true;

        await otpRecord.save({ transaction });

        // Step 6: Generate tokens
        // Your generateTokens function must support multiple roles.
        const tokens = await this.generateTokens(
            user,
            roles,
            transaction
        );

        await transaction.commit();

        return {
            message: "Login successful",

            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                roles
            },

            permissions,
            ...tokens
        };

    } catch (error) {

        if (!transaction.finished) {
            await transaction.rollback();
        }

        throw error;
    }
}

async logout({ refreshToken }) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    let decoded;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await RefreshToken.findOne({
      where: {
        user_id: decoded.user_id,
        token_hash: tokenHash,
        revoked_at: null
      }
    });

    if (!storedToken) {
      throw new Error("Refresh token already revoked or not found");
    }

    await storedToken.update({
      revoked_at: new Date()
    });

    return {
      message: "Logout successful"
    };
  }

}

module.exports = new AuthService();