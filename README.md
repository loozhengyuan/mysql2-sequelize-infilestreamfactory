# Handling `infileStreamFactory` at connection-level

This repository provides the code to reproduce the `infileStreamFactory` issue when working with the `sequelize` and `mysql2` packages.

As described in [sidorares/node-mysql#2151](https://github.com/sidorares/node-mysql2/issues/2151), the `infileStreamFactory` option only works when calling connection.query(), which is expected and [documented](https://github.com/sidorares/node-mysql2/blob/master/documentation/en/Extras.md#sending-tabular-data-with-load-infile-and-local-stream).

```js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test'
});

connection.query(
  "LOAD DATA LOCAL INFILE 'data/users.csv' INTO TABLE user;"
  function(err, results, fields) {
    console.log(results);
    console.log(fields);
  }
);
```

However, when working with ORMs like [`sequelize`](https://sequelize.org), we only have access to set these options at the connection-level using [`dialectOptions`](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/). Even if we do set the `infileStreamFactory` option, it is still ignored by `mysql2`:

```js
const fs = require("fs");

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  dialectOptions: {
    infileStreamFactory: (path) => fs.createReadStream(path),
  },
});

sequelize.query("LOAD DATA LOCAL INFILE 'data/users.csv' INTO TABLE user;");
```

```
Ignoring invalid configuration option passed to Connection: infileStreamFactory. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection

Error: As a result of LOCAL INFILE command server wants to read data/users.csv file, but as of v2.0 you must provide streamFactory option returning ReadStream.
```

## Usage

To reproduce this issue, start the `mysql-db` Docker container with the `--local-infile` flag enabled:

```shell
docker run \
	--detach \
	--rm \
	--name mysql-db \
	--publish 127.0.0.1:3306:3306/tcp \
	--env MYSQL_ROOT_PASSWORD=dbpassword \
	mysql:8.0.34-oracle \
  --local-infile=1
```

Next, install all dependencies and run the script to reproduce the issue:

```
npm ci
```

```
npm run start
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
