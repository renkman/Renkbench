const nano = require('nano')('http://localhost:5984');
const window = require('../contracts/window');

init = function (name) {  
  function checkDatabase () {
    nano.db.list().then(databases => {    
      return databases.some(db=>db.name===name);
    });
  }

  function initDatabase() {
    if(checkDatabase())
      return;
    
    nano.db.create(name);    
    seedDatabase();
  }

  function seedDatabase()
  {
    let database = nano.use(name);
    database.insert(window.create(1, 0, "Renkbench"));
    database.insert(window.create(2, 0, "Note!"));
    database.insert(window.create(3, 1, "Edit"));
  }

  return {
    initDatabase : initDatabase
  };
}();

module.exports = init;