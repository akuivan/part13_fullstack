const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')

router.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  const passwordCorrect = body.password === 'secret'

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  // Token expires in 1 hour
  const token = jwt.sign(userForToken, SECRET, { expiresIn: '1h' })
  console.log(token)
  
  const userExists = await User.findOne({ where: { id: user.id } })
  if (!userExists) {
    console.log('User not found')
  }

  try {
    session = await Session.create({
      user_id: user.id,
      token: token
    })
  } catch (error) {
    console.error('Error creating session:', error)
  }

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router