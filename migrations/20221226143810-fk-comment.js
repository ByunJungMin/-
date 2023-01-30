'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */           
    await queryInterface.addColumn('Comments', 'user_Id', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addConstraint('Comments', {
      fields: ['user_Id'],
      type: 'foreign key',
      name: 'users_comment_id_fk',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Comments', 'user_Id');
  }
};
