const fs = require("fs");

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  host: "127.0.0.1",
  port: 3306,
  database: "mysql",
  username: "root",
  password: "dbpassword",
  dialectOptions: {
    infileStreamFactory: (path) => fs.createReadStream(path),
  },
});

sequelize.query(
  "CREATE TABLE IF NOT EXISTS user (name VARCHAR(20), organization VARCHAR(20));"
);

sequelize.query("LOAD DATA LOCAL INFILE 'data/users.csv' INTO TABLE user;");
