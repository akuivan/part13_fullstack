const { User } = require('../models')

const userDisabledCheck = async (req, res, next) => {
  const userId = req.decodedToken.id
  
  try {
    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.disabled) {
      return res.status(403).json({ error: 'User is disabled' })
    }

    // Proceed to next middleware or route handler if the user is active
    next()
  } catch (error) {
    console.error('User check error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = userDisabledCheck
