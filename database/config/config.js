const username = "root"
const password = "30941767"
const database = "psi_db"

module.exports = 
{
  "development": {
    "username": username,
    "password": password,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": username,
    "password": password,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": username,
    "password": password,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

