// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// // const config = require('../../config/config').development;

// // const sequelize = new Sequelize(config.url, { dialect: 'postgres', logging: false });

// const dbInfo = {};

// // ✅ Import all models
// dbInfo.Users = require("./Users");
// dbInfo.Clients = require("./Clients");
// // dbInfo.UserClientMap = require("./UserClientMap");
// dbInfo.Colors = require("./colors");
// dbInfo.Application = require("./Application");
// dbInfo.Module = require("./Module");
// dbInfo.ApplicationModule = require("./ApplicationModule");
// dbInfo.Report = require("./Report");
// dbInfo.TicketingSystem = require("./ticketingSystem");
// dbInfo.TaskExecutionStatus = require("./taskExecutionStatus");
// dbInfo.TaskStatusAuditTrail = require("./taskStatusAuditTrail");
// dbInfo.TaskStatusInfo = require("./taskStatusInfo");
// dbInfo.TaskDetail = require("./taskDetails");

// // 🧩 Debug: Log model import status
// console.log("🧠 Model files loaded:");
// Object.entries(dbInfo).forEach(([key, value]) => {
//   if (value && typeof value.init === "function") {
//     console.log(`   ✅ ${key} -> Sequelize model class detected`);
//   } else {
//     console.log(`${key} -> Not a Sequelize model class or missing init()`);
//   }
// });

// // Associations
// // User.hasMany(Task, { foreignKey: 'createdBy' });
// // Task.belongsTo(User, { foreignKey: 'createdBy' });

// // Task.hasMany(Audit, { foreignKey: 'taskId' });
// // Audit.belongsTo(Task, { foreignKey: 'taskId' });

// // ✅ Define associations
// //
// dbInfo.TaskExecutionStatus.belongsTo(dbInfo.Users, {
//   foreignKey: "logged_user",
//   as: "user",
// });
// dbInfo.Users.hasMany(dbInfo.TaskExecutionStatus, {
//   foreignKey: "logged_user",
//   as: "executed_tasks",
// });

// // TASK_STATUS_INFO ↔ TASK_STATUS_AUDIT_TRAIL

// dbInfo.TaskStatusInfo.hasMany(dbInfo.TaskStatusAuditTrail, {
//   as: "audit_trails",
//   foreignKey: "task_status_id",
// });
// dbInfo.TaskStatusAuditTrail.belongsTo(dbInfo.TaskStatusInfo, {
//   as: "taskstatusinfo",
//   foreignKey: "task_status_id",
// });

// // TICKETING_SYSTEM ↔ TASK_STATUS_INFO
// dbInfo.TaskStatusInfo.hasMany(dbInfo.TicketingSystem, {
//   foreignKey: "ticket_id",
// });
// dbInfo.TicketingSystem.belongsTo(dbInfo.TaskStatusInfo, {
//   foreignKey: "ticket_id",
// });

// // APPLICATION ↔ TICKETING_SYSTEM
// // dbInfo.Application.hasMany(dbInfo.TicketingSystem, {
// //   foreignKey: "app_id",
// //   as: "tickets",
// // });
// // dbInfo.TicketingSystem.belongsTo(dbInfo.Application, {
// //   foreignKey: "app_id",
// //   as: "application",
// // });

// // TASK DETAIL ↔ TASK_STATUS_INFO

// dbInfo.TaskStatusInfo.hasMany(dbInfo.TaskDetail, {
//   foreignKey: "tstatusId",
//   as: "taskstaskdetails",
// });
// dbInfo.TaskDetail.belongsTo(dbInfo.TaskStatusInfo, {
//   foreignKey: "tstatusId",
//   as: "taskstatusinfo",
// });

// // First
// // dbInfo.TaskDetail.belongsTo(dbInfo.Report, {
// //   foreignKey: "report_id",
// //   as: "report",
// // });

// // // Then
// // dbInfo.Report.hasMany(dbInfo.TaskDetail, {
// //   foreignKey: "report_id",
// //   as: "taskDetails",
// // });

// // Task Status Info ↔ COLORS
// dbInfo.Colors.hasMany(dbInfo.TaskStatusInfo, {
//   foreignKey: "color_id",
//   as: "task",
// });

// dbInfo.TaskStatusInfo.belongsTo(dbInfo.Colors, {
//   foreignKey: "color_id",
//   as: "color",
// });

// // Many-to-Many with Role
// dbInfo.Application.hasMany(dbInfo.Module, {
//   foreignKey: "app_id",
//   as: "module",
// });

// dbInfo.Module.belongsTo(dbInfo.Application, {
//   foreignKey: "app_id",
//   as: "applications",
// });

// // USER CLIENT MAP ASSOCIATIONS
// // dbInfo.Users.belongsToMany(dbInfo.Clients, {
// //   through: dbInfo.UserClientMap,
// //   foreignKey: "user_id",
// //   otherKey: "client_id",
// //   as: "clients",
// // });

// // dbInfo.Clients.belongsToMany(dbInfo.Users, {
// //   through: dbInfo.UserClientMap,
// //   foreignKey: "client_id",
// //   otherKey: "user_id",
// //   as: "users",
// // });

// // dbInfo.UserClientMap.belongsTo(dbInfo.Users, { foreignKey: "user_id" });
// // dbInfo.UserClientMap.belongsTo(dbInfo.Clients, { foreignKey: "client_id" });

// // dbInfo.Users.hasMany(dbInfo.UserClientMap, { foreignKey: "user_id" });
// // dbInfo.Clients.hasMany(dbInfo.UserClientMap, { foreignKey: "client_id" });

// // TASK DETAIL ↔ APPLICATION

// // dbInfo.TaskDetail.belongsTo(dbInfo.Application, {
// //   foreignKey: "app_id",
// //   targetKey: "id",
// //   as: "application",
// // });

// // dbInfo.TaskDetail.belongsTo(dbInfo.Report, {
// //   foreignKey: "report_id",
// //   targetKey: "id",
// //   as: "report",
// // });

// // dbInfo.TaskDetail.belongsToMany(dbInfo.Application, {
// //   through: dbInfo.TaskDetailApplicationMap,
// //   foreignKey: "task_detail_id",
// //   otherKey: "application_id",
// //   as: "applications",
// // });

// // dbInfo.Application.belongsToMany(dbInfo.TaskDetail, {
// //   through: dbInfo.TaskDetailApplicationMap,
// //   foreignKey: "application_id",
// //   otherKey: "task_detail_id",
// //   as: "taskDetails",
// // });

// // ✅ Attach Sequelize references at the end

// // 🧩 Debug: Confirm all associations and model count
// console.log("\n🔗 Associations and Sequelize initialized:");
// console.log("   Models loaded:", Object.keys(dbInfo));
// // ✅ Initialize sequelize on models if not already done
// Object.values(dbInfo).forEach((model) => {
//   if (model.init && !model.sequelize) {
//     model.sequelize = sequelize;
//   }
// });
// sequelize
//   .sync({ alter: false })
//   .then(() => console.log("✅ All models synced successfully"))
//   .catch((err) => console.error("❌ Model sync failed:", err));

// dbInfo.sequelize = sequelize;
// dbInfo.Sequelize = Sequelize;

// module.exports = dbInfo;

// // module.exports = {
// //   sequelize,
// //   Sequelize,
// //   User,
// //   Task,
// //   Setting,
// //   Audit
// // };




const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();

const basename = path.basename(__filename);
const dbConfig = require('../config/db.config.js');
const db = {};

// Determine environment
const env = process.env.NODE_ENV || 'development';

// Get environment-specific configuration
const config = dbConfig[env];

if (!config) {
  throw new Error(`Database configuration not found for ${env}`);
}

// Create Sequelize instance
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    port: process.env.DB_PORT || 3306,
    dialect: config.dialect,
    pool: config.pool,
    dialectOptions: config.dialectOptions || {},
    logging: env === 'development' ? console.log : false
  }
);

// Load all model files
// fs.readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       !file.endsWith('.test.js')
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(
//       sequelize,
//       Sequelize.DataTypes
//     );

//     db[model.name] = model;
//   });


fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.endsWith('.test.js')
    );
  })
  .forEach(file => {

    console.log("Loading model:", file);

    const modelFactory = require(path.join(__dirname, file));

    const model = modelFactory(
      sequelize,
      Sequelize.DataTypes
    );

    if (!model) {
      throw new Error(
        `Model initialization failed: ${file} returned undefined`
      );
    }

    db[model.name] = model;

  });

console.log("Loaded models:", Object.keys(db));

console.log("Category:", !!db.Category);
console.log("Subcategory:", !!db.Subcategory);
// Define model associations
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Export database objects
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

