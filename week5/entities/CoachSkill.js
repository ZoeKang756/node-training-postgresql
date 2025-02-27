const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CoachSkill',
    tableName: 'COACH_LINK_SKILL',
    columns: {
      id: {
        primary: true,
        type: 'uuid',
        generated: 'uuid',
        nullable: false
      },
      coach_id: {
        type: 'uuid',
        nullable: false,
        foreignKey: {
            name: 'coach_user_id_fkey',
            columnNames: ['coach_id'],
            referencedTableName: 'USER',
            referencedColumnNames: ['id']
          }

      },
      skill_id: {
        type: 'uuid',
        nullable: false,
        foreignKey: {
            name: 'coach_skill_id_fkey',
            columnNames: ['skill_id'],
            referencedTableName: 'SKILL',
            referencedColumnNames: ['id']
          }
      },
      created_at: {
        type: "timestamp",
        createDate: true,
        nullable: false
      }, 
    }
  })