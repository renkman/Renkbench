const nano = require('nano')('http://localhost:5984');

createWindowRepository = (() => {  
  let renkbench = nano.use('renkbench');
  
  getWindow = name => {
    let result;    
    renkbench.get(name)
    .then(window => {
      result = window;
    });
    return result;
  }

  addWindow = window => {
    renkbench.insert(window)
  }

  return {
    getWindow : getWindow,
    addWindow : addWindow
  };
})();

module.exports = createWindowRepository;