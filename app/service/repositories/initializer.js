const nano = require('nano')(process.env.DB_URL);
const windowFactory = require('../contracts/window');

init = function (name) {  
  if(!name)
    throw "Parameter name is not set";

  const SYSTEM_DATABASES = ['_replicator', '_users'];
  let installedDatabases = [];
  
  function loadDatabases() {
    return nano.db.list().then(databases => {    
      installedDatabases=databases;
    });
  }  

  function initSystemDatabases() {
    SYSTEM_DATABASES.forEach(db => {
      if(!installedDatabases.includes(db))
          nano.db.create(db).catch(e => console.log(e));          
    });
  }

  function initDatabase() {
    loadDatabases().then(() => {
      initSystemDatabases();

      if(installedDatabases.includes(name))
        return;
      
      nano.db.create(name)
        .then(db => seedDatabase(name))
        .catch(e => console.log(e));      
    });
  }

  function seedDatabase(name)
  {
    var database = nano.db.use(name);
    database.insert(windowFactory.create(1, 0, "Renkbench")).catch(e=>console.log(e));
    database.insert(windowFactory.create(2, 0, "Note!")).catch(e=>console.log(e));
    database.insert(windowFactory.create(3, 1, "Edit")).catch(e=>console.log(e));
  }

  return {
    initDatabase : initDatabase
  };
}

module.exports = init;