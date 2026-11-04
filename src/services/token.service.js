
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../models');
const { User, Otp, Role, UserRole , RefreshToken } = db;

class TokenService {

  hashToken(token) {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  async generateAuthTokens(user, role, transaction = null) {

  const tokenId = crypto.randomUUID();

  const payload = {
    user_id: user.id,
    role: role,
    email: user.email,
    phone: user.phone,
    jti: tokenId
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const tokenHash = this.hashToken(refreshToken);

  await RefreshToken.create({
    user_id: user.id,
    jti: tokenId,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }, transaction ? { transaction } : {});

  return {
    accessToken,
    refreshToken
  };
}
}

module.exports = new TokenService();
