console.log('index.js');
const $ = jQuery = require('jquery');
const {remote,ipcRenderer} = require('electron');
const nsb = require('sendbird');
var path = require('path');
var farmhash = require('farmhash');


var chatBox = null;
var cArea;
var terminal;
var gc;

function color(style,color,message) {
	return `[[${style};${color};black]` + message + "]";
}


/*
ipcRenderer.send('job', 'dashboard-data', true);
ipcRenderer.send('job', 'queue');
TODO */

document.addEventListener("DOMContentLoaded", function(event) {
	require( path.resolve( __dirname, "js/jquery.terminal.js" ) )($);
	cArea = $('.chatArea').terminal({
		"tt":function(comand,option){
			let ldata;
			let info;
			switch(comand){
				case 'ladd':
					cArea.error("Adding: "+option);
					ldata = {listType:0, action:0, data:option}
					info = {task:'list-manage', data: ldata};
					ipcRenderer.send('job', 'scrape', info);
					break;
				case 'ldel':
					cArea.error("Deleting: "+option);
					ldata = {listType:0, action:1, data:option}
					info = {task:'list-manage', data: ldata};
					ipcRenderer.send('job', 'scrape', info);
					break;

			}
		},
		"at":function(comand,option){
			cArea.error(comand);
		}

	}, { prompt: color("b","red","> ") , echoCommand: false, greetings: 'Welcome to chat. Behave.',
		onCommandNotFound:function(cmd,term){
			term.echo(`<${color("b","green","You")}> ${color("","white",cmd)}`);
		chatBox = term;
		sendMessageG(gc,cmd);
		$('.chatArea')[0].scrollIntoView(false);
	},exceptionHandler:function(exception){
		console.log(exception.message);
		if(exception.message.includes("sendUserMessage") && exception.message.includes("undefined")){
			chatBox.error("You aren't connected");
		}
	}
});

});
var userid = "";
var sbid = "2515BDA8-9D3A-47CF-9325-330BC37ADA13";
var token = "";
var CHANNEL_URL = "https://www.reddit.com/chat/r/turkers/channel/7308797_b0bcd5ad6b2df37866f21e2ef14391566c42f1b4";
var generalTurkerChannelURL = "sendbird_group_channel_7308797_b0bcd5ad6b2df37866f21e2ef14391566c42f1b4";
var groupHandlerID = 1;
var sb = new nsb({
	appId: sbid
});

var ch = new sb.ChannelHandler();



ipcRenderer.on('scrape', (event, ...args) => {
	//console.log(args);
	switch(args[0]){
		case 'scraping':
			if(args[1]){
				//Scraping start
				$('#statusScraperLabel').addClass('green');
				console.log(cArea);
				cArea.terminal().set_prompt(color("b","green","Scraping>"));
			}else{
				//Scraping stop
				$('#statusScraperLabel').removeClass('green');
				cArea.terminal().set_prompt(color("b","red",">"));
			}

			break;
	}
});

ipcRenderer.on('chat', (event, ...args) => {
	let ting = args[0].data;
	switch(args[0].task){
		case 'token':
			sb.connect(ting.userid, ting.token, (me, err) => {
				if (err) {
					console.log(err.message);
				}else{
					sb.GroupChannel.getChannel(generalTurkerChannelURL, function(groupChannel, error) {
						if (error) {
							return;
						}
						cArea.echo("Connected");
						gc = groupChannel;
					});

				}
			});

			break;
		case 'message':
			cArea.insert(ting);
			break;
	}
});

ch.onMessageReceived = async function(channel, message) {

	var participantListQuery = channel.createMemberListQuery();

	participantListQuery.next(function (participantList, error) {
		if (error) {
			return;
		}

		for(i in participantList){
			//TODO: Add accessible channel participants somewhere.
		}
	});
	try{
		gsender = message._sender.nickname.toString();
	}catch(e){
		console.log("PARSE ERROR");
	}

	const usernameHash = farmhash.hash32(gsender);
	const usernameHashHex = usernameHash.toString(16);

	cArea.echo(`<${color("b",`#${usernameHashHex.substr(0, 6)}`,gsender)}> ${color("","white",message.message)}`);
};

sb.addChannelHandler(groupHandlerID, ch);

//Send message to group
function sendMessageG(groupChannel, message) {
	groupChannel.sendUserMessage(message, null, null, function(message, error) {
		if (error) {
			return;
		}
	});
}

