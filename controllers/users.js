require('express-async-errors')

const router = require('express').Router()

const { User } = require('../models')

const errorHandler = (err, req, res, next) => {
    console.error(err)
    const status = err.status || 500 // Default to 500 if no status is set
    const message = err.message || 'Internal Server Error'
    res.status(status).json({ error: message })
}

router.get('/', async (req, res) => {
  const users = await User.findAll()
  res.json(users)
})

router.put('/:username', async (req, res) => {
    const { username } = req.params
    const { username: newUsername } = req.body
    
    const user = await User.findOne({ where: { username } })
    
    if (user) {
        user.username= newUsername
        await user.save()
        res.json(user)
    } else {
        const error = new Error('User not found')
        error.status = 404
        throw error
    }
})

router.post('/', async (req, res) => {
    const user = await User.create(req.body)
    res.json(user)
})

router.use(errorHandler)

module.exports = router