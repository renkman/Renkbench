// Check for ES6 support
var supportsES6 = function() {
    try {
      new Function("(a = 0) => a");
      return true;
    }
    catch (err) {
      return false;
    }
}();

if (supportsES6)
{ 
    var script = document.createElement("script");
    script.src = "workbench.js";
    script.type = "module";
    document.body.appendChild(script);
}
else 
{
    var workbench = document.getElementById("workbench");
    document.body.style.backgroundColor = "#000000";
    document.body.removeChild(workbench);    
    
    var guruMeditation = document.createElement("div");
    guruMeditation.className = "guru-meditation";
    document.body.appendChild(guruMeditation);
}
