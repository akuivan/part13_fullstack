require('express-async-errors')

const router = require('express').Router()

const { User, Blog } = require('../models')

const errorHandler = (error, req, res, next) => {
    console.error(error)
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message)
        return res.status(400).json({ error: messages })
    }
    const status = error.status || 500 // Default to 500 if no status is set
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
}

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
        model: Blog
    }
  })
  res.json(users)
})

router.get('/:id', async (req, res) => {
    const { id } = req.params
  
    const user = await User.findByPk(id, {
      include: {
        model: Blog,
        through: { attributes: ['read', 'id'] },
        attributes: ['id', 'url', 'title', 'author', 'likes', 'year'] 
      }
    })
  
    if (user) {
      const response = {
        name: user.name,
        username: user.username,
        readings: user.blogs.map(blog => {
          const readinglist = blog.ReadingList ? [{
            read: blog.ReadingList.read,
            id: blog.ReadingList.id
          }] : []  // Empty array if no join table entry

          return {
            id: blog.id,
            url: blog.url,
            title: blog.title,
            author: blog.author,
            likes: blog.likes,
            year: blog.year,
            readinglists: readinglist.length > 0 ? readinglist : []  // Ensure only one object in the array, or empty array
          }
        })
      }
      res.json(response)
    } else {
      const error = new Error('User not found')
      error.status = 404
      throw error
    }
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