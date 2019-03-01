console.log("scrapeRenderer.js");
const {remote,ipcRenderer} = require('electron');
const {Menu, MenuItem} = remote;
const menu = new remote.Menu();
const electronLocalshortcut = require('electron-localshortcut');
const dialog = require('electron').remote.dialog

window.$ = window.jQuery = require("jquery");
const win = remote.getCurrentWindow();

var scrapeVals;
var includeList = [];
var blockList = [];

document.addEventListener("DOMContentLoaded", function(event) {
	window.$ = $;
});

function color(style,color,message) {
        return `[[${style};${color};black]` + message + "]";
}
//IPC

ipcRenderer.on('scrape', (event, ...args) => {
	switch(args[0].task){
		case 'hit-info':
			let hitData = args[0].data[0];
				const options = {
					type: 'none',
					buttons: ['Accept', 'Block', 'Share','Close'],
					cancelId: 3,
					defaultId: 1,
					title: hitData.requester_name,
					message: hitData.title,
					detail: `${hitData.description} ${hitData.creation_time}`,
				};
				dialog.showMessageBox(null, options, (response, checkboxChecked) => {
					switch(response){
						case 0:
							break;
						case 1:
							break;
						case 2:
							let line = `${hitData.requester_name} - ${hitData.title} LINK: https://worker.mturk.com${hitData.accept_project_task_url}`;
							let info = {task:'message', data: line};
							ipcRenderer.send('job','chat',info);
							break;
					}
				});
			break;
		case 'new-hit':
			let hit = args[0].data;
			var headers = {"assignable_hits_count":'',"requester_name":"","monetary_reward.amount_in_dollar":""};

			let title = `<span style="color:white"> ${hit.title}</span>`;
			let color = "white";

			if(includeList.includes(hit.requester_name)){
				color = "green";
			}

			let req_name = `<span style="color:${color}"> ${hit.requester_name}</span>`;
			let m = new Date;
			let date = `<span style="color:white"> ${m.getHours() + ":" + m.getMinutes() +(m.getHours() >= 12 ? 'pm' : 'am')}</span>`;
			let pay = `<span style="color:white">${hit.reward} </span>`;
			let line = `${date} - ${req_name} - ${title}`;

			$('#resultDiv').prepend(`<div hid=${hit.hit_set_id} class="spid" style="color:white;white-space:nowrap;">${line}</span>`);
			break;
		case 'update':
			scrapeVals = args[0].data;
			//setHotkeys(scrapeVals);
			break;
		case 'init':
			scrapeVals = args[0].data;

			$('#scrapeVals').html(`<div> Pay: ${scrapeVals.reward} </div>`);

			let lists = args[0].lists;
			includeList = lists.include;
			setHotkeys(scrapeVals);
			break;

	}

});

function setHotkeys(vals){
	//Hotkeys
	for(i in vals.hotkeys){
		let key = vals.hotkeys[i];
		switch(i){
			case 'settings':
				electronLocalshortcut.register(win, key, () => {
					let info = {task:'settings',data:null};
					ipcRenderer.send('job','scrape',info);
				});
				break;
			case 'close':
				electronLocalshortcut.register(win, key, () => {
					win.close();
				});
				break;
			case 'scrape':
				electronLocalshortcut.register(win, key, () => {
					let info = {task:'start',data:null};
					ipcRenderer.send('job','scrape',info);
				});
				break;
			case 'watch':
				//TODO
				break;
			case 'scrapeList':
				electronLocalshortcut.register(win, key, () => {

				});
				break;
			case 'watchList':
				//TODO
				break;
		}

	}
}

//Button event handlers
$('body').on('click',(ting)=>{
	switch(ting.target.id){
		case 'scrapeSettings':
			let info = {task:'settings',data:null};
			ipcRenderer.send('job','scrape',info);
			break;
		case 'scrapeClose':
       			win.close();
			break;
		case "":
			var el = $(ting.target);
			if(el[0].className == "spid"){

				let id = el.attr('hid');
				let info = {task:'hit-info',data:id};
				ipcRenderer.send('job','scrape',info);
			}
			break;
	}
});
