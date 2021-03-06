import { Sequelize, sql } from "../../util/deps";

export const mutes = sql.define(`mutes`, {
    serverid: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    muteRoleID: Sequelize.STRING,
});

export const immunemutes = sql.define(`immunemutes`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  channelid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
});

export const activemutes = sql.define(`activemutes`, {
  serverid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  timestamp: Sequelize.STRING,
  permanent: Sequelize.BOOLEAN,
});
