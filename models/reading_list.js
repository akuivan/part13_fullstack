const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../util/db')

class ReadingList extends Model {}

ReadingList.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'blogs',
      key: 'id'
    },
    field: 'blog_id'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  timestamps: false,
  tableName: 'reading_list'
})

module.exports = ReadingList
