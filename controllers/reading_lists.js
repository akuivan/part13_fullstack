require('express-async-errors')

const router = require('express').Router()

const { ReadingList, User, Blog } = require('../models')


const errorHandler = (err, req, res, next) => {
    console.error(err)
    const status = err.status || 500 // Default to 500 if no status is set
    const message = err.message || 'Internal Server Error'
    res.status(status).json({ error: message })
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

router.use(errorHandler)

module.exports = router