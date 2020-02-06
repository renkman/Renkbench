const nano = require('nano')(process.env.DB_URL);
const windowFactory = require('../contracts/window');

init = name => {  
  if(!name)
    throw "Parameter name is not set";

  const SYSTEM_DATABASES = ['_replicator', '_users'];
  let installedDatabases = [];

  async function loadDatabases() {
    const databases = await nano.db.list();
    installedDatabases = databases;
  }

  initSystemDatabases = () => {
    SYSTEM_DATABASES.forEach(db => {
      if(!installedDatabases.includes(db))
          nano.db.create(db).catch(e => console.log(e));          
    });
  }

  async function initDatabase() {
    try {
      await loadDatabases();
      initSystemDatabases();
      if (installedDatabases.includes(name))
        return;
      await nano.db.create(name);
      return seedDatabase(name);
    }
    catch (e) {
      return console.log(e);
    }
  }

  seedDatabase = name =>
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