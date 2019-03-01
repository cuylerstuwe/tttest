const {remote,ipcRenderer,session } = require('electron')
const {Menu, MenuItem} = remote;
const menu = new remote.Menu();


window.addEventListener('load', function(event) {
	var $ = require('jquery');
	window.$ = $;

	console.log("LOGIN TEST");
	try{
		const name = Array.prototype.slice.call(document.getElementsByTagName("a")).filter(a => a.pathname == "/account")[0]; 
		var totals = $('.daily-worker-statistics').children('.table-row').eq(0).children('.desktop-row').children().eq(7).text();
		//var totals = document.getElementsByClassName('daily-worker-statistics')[0].childNodes[2].childNodes[1].childNodes[7].textContent;
		console.log(totals);
		//$('body').empty();
		ipcRenderer.send('job', 'dashboard',{name:name.innerHTML, total:totals})
		ipcRenderer.send('job', 'login',true)
	}catch(e){
		console.log("not logged in");
		console.log(e);
		ipcRenderer.send('job', 'login',false)
	}

},false);



