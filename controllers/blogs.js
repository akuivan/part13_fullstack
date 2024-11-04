require('express-async-errors')

const router = require('express').Router()

const { Blog } = require('../models')

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}

const errorHandler = (err, req, res, next) => {
    console.error(err);
    const status = err.status || 500; // Default to 500 if no status is set
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
};


router.get('/', async (req, res) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})

router.post('/', async (req, res) => {
    const blog = await Blog.create(req.body)
    return res.json(blog)   
})

router.delete('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        await req.blog.destroy()
        res.status(204).end()            
    } else {
        const error = new Error('Blog not found');
        error.status = 404;
        throw error;
    }
})

router.put('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        req.blog.likes = req.body.likes
        await req.blog.save()
        res.json(req.blog)
    } else {
        const error = new Error('Blog not found');
        error.status = 404;
        throw error;
    }
})

router.use(errorHandler);

module.exports = router