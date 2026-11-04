const Sequelize = require("sequelize");
const dbConfig = require("./db.config.js");

let sequelize;

if (process.env.NODE_ENV === "production") {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: dbConfig.production.dialect,
    dialectOptions: dbConfig.production.dialectOptions || {},
    pool: dbConfig.production.pool,
    logging: false
  });
} else {
  // Development
  sequelize = new Sequelize(
    dbConfig.development.DB,
    dbConfig.development.USER,
    dbConfig.development.PASSWORD,
    {
      host: dbConfig.development.HOST,
      port: process.env.DB_PORT || 3306,
      dialect: dbConfig.development.dialect,
      pool: dbConfig.development.pool,
      logging: console.log          // set to false if you want less noise
    }
  );
}

module.exports = sequelize;