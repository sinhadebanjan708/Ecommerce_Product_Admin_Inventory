const authService = require('../services/auth.service');


  exports.refreshToken = async (req, res) => {
    try {

      const { refreshToken } = req.body;
      console.log('rr__',refreshToken)
      const result = await authService.refreshToken(
        refreshToken
      );

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {

      return res.status(401).json({
        success: false,
        message: error.message
      });

    }
  }

exports.sendRegisterOtp = async (req, res) => {
  try {
    const result = await authService.sendRegisterOtp(req.body);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyRegisterOtp = async (req, res) => {
  try {
     console.log('Request Body:', req.body);
    const result = await authService.verifyRegisterOtp(req.body);
    return res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.sendLoginOtp = async (req, res) => {
  try {

    const result = await authService.sendLoginOtp(req.body);

    if (result.status === 'NOT_REGISTERED') {
      return res.status(404).json({
        success: false,
        ...result
      });
    }

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.verifyLoginOtp = async (req, res) => {
  try {

    const result = await authService.verifyLoginOtp(req.body);

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.logout = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const result = await authService.logout({
        refreshToken
      });

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  exports.existingUser = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      const result = await authService.existingUser({ email });

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
  }