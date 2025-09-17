'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AppointmentServices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '服務名稱',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '服務描述',
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '實際價格',
      },
      showTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '顯示時間',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序',
      },
      isRemove: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已軟刪除',
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否公開於 Client',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    })

    // Add indexes for better query performance
    await queryInterface.addIndex('AppointmentServices', ['id'])
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('AppointmentServices')
  },
}
