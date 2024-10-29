require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize')
const express = require('express')
const app = express()

const sequelize = new Sequelize(process.env.DATABASE_URL)

class Blog extends Model {} 
Blog.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    author: {
        type: DataTypes.TEXT
    },
    url : {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title : {
        type: DataTypes.TEXT,
        allowNull: false
    },
    likes : {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'blog'
})

Blog.sync()

app.use(express.json())

app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})

app.post('/api/blogs', async (req, res) => {
    try {
        console.log(req.body)
        const blog = await Blog.create(req.body)
        return res.json(blog)
      } catch(error) {
        return res.status(400).json({ error })
      }
})

app.delete('/api/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id)

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found'})
        }

        await blog.destroy()

        res.status(204).end()
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'An error occurred while deleting the blog'})
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})