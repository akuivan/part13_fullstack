require('express-async-errors')

const router = require('express').Router()

const jwt = require('jsonwebtoken')

const { ReadingList, User, Blog } = require('../models')
const { SECRET } = require('../util/config')


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

router.post('/', async (req, res) => {
    const blogId = req.body.blogId
    const userId = req.body.userId
    
    const user = await User.findByPk(userId)
    const blog = await Blog.findByPk(blogId)

    if(user && blog){
        // Check if the blog is already in the user's reading list
        const existingEntry = await ReadingList.findOne({ where: { userId, blogId } })
        if (existingEntry) {
            const error = new Error(`This blog is already in the user's reading list.`)
            error.status = 400
            throw error
        } else {
            // Create a new reading list entry
            const readingList = await ReadingList.create({ userId, blogId })
            res.json(readingList)
        }
    } else {
        const error = new Error(`User or blog not found, unable to add blog to an user's reading list`)
        error.status = 404
        throw error
    }
})

router.put('/:id', tokenExtractor, async (req,res) => {
    const readingListId = req.params.id
    const { read }= req.body

    // Validate the read field
    if (typeof read !== 'boolean') {
        const error = new Error('Invalid value for "read" field')
        error.status = 400
        throw error
    }
        
    const readingListEntry = await ReadingList.findByPk(readingListId)
    
    if (readingListEntry) {
        if (readingListEntry.userId !== req.decodedToken.id) {
            const error = new Error('Unauthorized access to this reading list entry')
            error.status = 403
            throw error
        } else {
            readingListEntry.read = read
            await readingListEntry.save()
            res.json(readingListEntry)
        }
    } else {
        const error = new Error(`Reading list not found`)
        error.status = 404
        throw error
    }
})

router.use(errorHandler)

module.exports = router