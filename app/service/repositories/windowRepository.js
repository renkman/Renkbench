const nano = require('nano')('http://localhost:5984');

createWindowRepository = function () {  
  let renkbench = nano.use('renkbench');

  function getWindow(name) {
    let result;    
    renkbench.get(name)
    .then(window =>{
      result = window;
    });
    return result;
  }

  function addWindow(window) {
    renkbench.insert(window)
  }

  return {
    getWindow : getWindow,
    addWindow : addWindow
  };
}();

module.exports = createWindowRepository;