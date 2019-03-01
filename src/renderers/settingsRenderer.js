console.log("scrapeSettingsRenderer.js");
const {remote,ipcRenderer} = require('electron')
const {Menu, MenuItem} = remote;
const menu = new remote.Menu();
const electronLocalshortcut = require('electron-localshortcut');
window.$ = window.jQuery = require("jquery");

const win = remote.getCurrentWindow();

var values;


document.addEventListener("DOMContentLoaded", function(event) {
	window.$ = $;
	$('.top.menu .item').tab();
		console.log("Values:");
	console.log(values);

});

//IPC
ipcRenderer.on('settings', (event, ...args) => {
	console.log(args);
	let settingsVals = args[0];
	//Fill scrape fields
	$('#searchTerm').val(settingsVals.searchTerm);
	$('#pay').val(settingsVals.reward);
	$('#qualBox').prop('checked',settingsVals.qualified);
	$('#mastersBox').prop('checked',settingsVals.masters);
	$('#includeBox').prop('checked',settingsVals.includes);
	$('#blockBox').prop('checked',settingsVals.blocks);

	
	let hotkeys = settingsVals.hotkeys;
	//Fill hotkey fields
	$('#settingsScrapeSettingsKey').val(hotkeys.settings);
	$('#settingsScrapeListKey').val(hotkeys.scrapeList);
	$('#settingsScrapeScrapeKey').val(hotkeys.scrape);
	$('#settingsScrapeDonkeyKey').val(hotkeys.close);
});


//Hotkeys

electronLocalshortcut
        .register(win, 'Escape', () => {
                window.close();
})

//Button event handlers
$('body').on('click',(ting)=>{

	console.log(ting.target.id);
	switch(ting.target.id){
		case 'scrapeClose':
			console.log("close");
			 var window = remote.getCurrentWindow();
       			window.close();
		break;
		case 'applyButton':
			values = {
				searchTerm: $('#searchTerm').val(),
				reward: $('#pay').val(),
				qualified: $('#qualBox').prop('checked'),
				masters: $('#mastersBox').prop('checked'),
				includes: $('#includeBox').prop('checked'),
				blocks: $('#blockBox').prop('checked')
			}
			ipcRenderer.send('job','update',values);
			console.log("APPLY");
			break;
	}

});
