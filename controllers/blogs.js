require('express-async-errors')

const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { Op } = require('sequelize')

const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}

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
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      } catch{
        return res.status(401).json({ error: 'token invalid' })
      }
    }  else {
      return res.status(401).json({ error: 'token missing' })
    }
    next()
}

router.get('/', async (req, res) => {
    const where = {}

    if (req.query.search) {
        where[Op.or] = [
            { title: { [Op.iLike]: `%${req.query.search}%` } },
            { author: { [Op.iLike]: `%${req.query.search}%` } }
        ]
    }

    const blogs = await Blog.findAll({
        include: {
            model: User
        },
        where,
        order: [['likes', 'DESC']]
    })

    res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res) => {
    const user = await User.findByPk(req.decodedToken.id)
    if(user){
        const blog = await Blog.create({...req.body, userId: user.id, date: new Date()})
        res.json(blog)   
    } else {
        const error = new Error('User not found, unable to create a blog')
        error.status = 404
        throw error
    }
})

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
    if (req.blog) {
        // Check if the requesting user is the same as the blog's user
        if (req.blog.userId === req.decodedToken.id) {
            await req.blog.destroy()
            res.status(204).end()
        } else {
            const error = new Error('User not authorized to delete this blog')
            error.status = 403
            throw error
        }
    } else {
        const error = new Error('Blog not found')
        error.status = 404
        throw error
    }
})

router.put('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        req.blog.likes = req.body.likes
        await req.blog.save()
        res.json(req.blog)
    } else {
        const error = new Error('Blog not found')
        error.status = 404
        throw error
    }
})

router.use(errorHandler)

module.exports = router