console.log("redditLogin.js");
const {remote, ipcRenderer} = require('electron');
const { session } = require('electron')
const queryString = require('query-string');

var thisWindow = remote.getCurrentWindow();
var found = false;
var info;
const filter = {
	urls: ['wss://*sendbird*']
}


thisWindow.webContents.session.webRequest.onSendHeaders((details, callback) =>{
	var urlTing = details.url;
	if(urlTing.includes('Mozilla')){
		try{
			var parsedTing = queryString.parse(urlTing);
			console.log(parsedTing.access_token);
			thisWindow.webContents.session.webRequest.onSendHeaders(null);
			found = true;
			info = {task:'token',data: {'token': parsedTing.access_token, 'userid': parsedTing.user_id}};
			//callback({cancel:true,  redirectUrl:"javascript:"});

		}catch(e){

		}
		if(found){
			console.log("SOMETHING");
			ipcRenderer.send('job','chat', info);
		}

	}

});

/*
thisWindow.webContents.session.webRequest.onCompleted(filter, (details, callback) => {
});
*/

ipcRenderer.on('final',(event, ...args) => {
	switch(args[0]){
		case "final":
			console.log("final");
			if(!found){
				console.log("NOTHING");
				info = {task:'notoken',data: null};
				ipcRenderer.send('job','chat', info);
			}




	}
});
