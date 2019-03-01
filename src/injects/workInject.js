console.log("workInject.js");
const {remote,ipcRenderer} = require('electron')
const hotkeys = require('hotkeys-js');
var tmpKey;
ipcRenderer.on('xy', (event, arg) => {
	console.log(arg);
	console.log(document.elementFromPoint(arg.x, arg.y));
	tmpKey = document.elementFromPoint(arg.x, arg.y);

});


hotkeys('f5', function(event, handler){
  // Prevent the default refresh event under WINDOWS system
  event.preventDefault()
  console.log('you pressed F5!')
	console.log(tmpKey);
	tmpKey.click();
});




document.addEventListener("DOMContentLoaded", function(event) {
});
