require('express-async-errors')

const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const Session = require('../models/session')
const userDisabledCheck = require('../middleware/userDisabledCheck')


const errorHandler = (err, req, res, next) => {
    console.error(err)
    const status = err.status || 500 // Default to 500 if no status is set
    const message = err.message || 'Internal Server Error'
    res.status(status).json({ error: message })
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        try {
            const token = authorization.substring(7)
            req.token = token
            req.decodedToken = jwt.verify(token, SECRET)
        } catch {
            return res.status(401).json({ error: 'Token invalid' })
        }
    } else {
        return res.status(401).json({ error: 'Token missing' })
    }
    next()
}

router.delete('/', tokenExtractor, userDisabledCheck, async (req, res, next) => {
  const decodedToken = req.decodedToken.id

  if (!decodedToken || !req.token) {
      const error = new Error('Token missing or invalid')
      error.status = 401
      throw error
  }

  // Delete all user's sessions
  await Session.destroy({
      where: {
          user_id: decodedToken,  // Using user ID from the decoded token
      }
  })
  console.log(`User's token deleted from sessions table`)
  res.status(204).end()
})

router.use(errorHandler)

module.exports = router
