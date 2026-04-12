const { AuthService} = require("../services/auth");

const  requestResetController = async (req, res) => {
  const { email } = req.body;
  //get IP of user
  const ip = req.ip || req.connection.remoteAddress;

  try {
    const { resetToken, expiresAt } = await AuthService.requestReset(email, ip);
    return res.status(202).json({ resetToken, expiresAt });
  } catch (error) {
    if (error.message.includes("Bad Request")){return res.status(400).json({error: error.message})};
    if (error.message.includes("Too many requests")){return res.status(429).json({ error: error.message })};
  }
};

const resetOrActivateController = async (req, res) => {
    const { email, password } = req.body;
    const resetToken = req.params.resetToken;

    try {
        const updated = await AuthService.resetOrActivateService(email, password, resetToken);
        return res.status(200).json(updated);
    } catch (error) {
        if (error.message.includes("Bad Request")){
            return res.status(400).json({error: error.message});
        }
        if (error.message.includes("Unauthorized") ) {
            return res.status(401).json({ error: error.message });
        }
        if (error.message.includes("Not Found")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Gone")) {
            return res.status(410).json({ error: error.message });
        }
    }
};

// POST /auth/tokens
const authenticateUserController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { token, expiresAt } = await AuthService.generateTokenService(email, password);
        return res.status(200).json({ token, expiresAt });
    } catch (error) {
        if (error.message.includes("Bad Request")){
            return res.status(400).json({error: error.message});
        }
        if (error.message.includes("Unauthorized")) {
            return res.status(401).json({ error: error.message });
        }
        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ error: error.message });
        }
    }
};

module.exports = { requestResetController, resetOrActivateController, authenticateUserController };