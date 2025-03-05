const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: "Skill",
  tableName: "SKILL",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      nullable: false
    }
  },
  relations: {
    CoachLinkSkill: {
      target: 'CoachLinkSkill',
      type: 'one-to-many',
      inverseSide: 'Skill',
      joinColumn: {
        name: 'skill_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'skill_coach_link_skill_fk'
      }
    }
  }
})