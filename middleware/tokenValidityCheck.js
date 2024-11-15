const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const { Session } = require('../models')

const tokenValityCheck = async (req, res, next) => {
  const authorization = req.get('authorization')
  
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Token missing or invalid' })
  }

  const token = authorization.substring(7)
  try {
    const decodedToken = jwt.verify(token, SECRET)
    req.decodedToken = decodedToken

    // Check if session exists in the database
    const session = await Session.findOne({
      where: {
        user_id: decodedToken.id,
        token: token
      }
    })
    
    if (!session) {
      return res.status(401).json({ error: 'Session not found or expired' })
    }

    // Proceed to next middleware or route handler
    next()
  } catch (error) {
    console.error('Token validation error:', error)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = tokenValityCheck
