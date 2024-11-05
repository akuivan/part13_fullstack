const router = require('express').Router()
const { Op, fn, col } = require('sequelize')

const { Blog } = require('../models')

const errorHandler = (err, req, res, next) => {
    console.error(err)
    const status = err.status || 500 // Default to 500 if no status is set
    const message = err.message || 'Internal Server Error'
    res.status(status).json({ error: message })
}

router.get('/', async (req, res) => {
    const authorsValues = await Blog.findAll({
        attributes: [
            'author',
            [fn('COUNT', col('id')), 'articles'], // Count total number of blogs by the author
            [fn('SUM', col('likes')), 'likes'] 
        ],
        group: 'author',
        order: [[fn('SUM', col('likes')), 'DESC']]
    })

    const result = authorsValues.map(author => ({
        author: author.author, 
        articles: author.dataValues.articles,
        likes: author.dataValues.likes
    }))

    res.json(result)
})

router.use(errorHandler)

module.exports = router
