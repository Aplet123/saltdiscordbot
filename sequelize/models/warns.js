const obj = {
  warns: sql.define(`warns`, {
    serverid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    userid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    warn: Sequelize.TEXT,
    moderatorid: Sequelize.STRING,
    warnedat: Sequelize.STRING
  })
};
module.exports = obj;