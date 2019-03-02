console.log('index.js');
const $ = jQuery = require('jquery');
const {remote,ipcRenderer} = require('electron');
const nsb = require('sendbird');
var path = require('path');


var chatBox = null;
var cArea;
var terminal;
var gc;
var users = [];
var musr="";

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

	},{
		//Bootleg autocomplete users
		keydown: function(e) {
			let term = cArea.terminal();
			let word = term.before_cursor(true);
			let ting = "";
			if (e.which == 9) {
				if(word.substring(0,1) == "@"){
					ting = users.filter(a=>{
						return a.indexOf(word.substring(1,word.length)) !== -1;
					});
					if(ting != ""){
						term.insert(ting[0].substring(word.length-1,ting[0].length));
						musr=ting[0];
					}

				}
			}
		},
		prompt: color("b","red","> ") , echoCommand: false, greetings: 'F6 to connect',
		onCommandNotFound:function(cmd,term){
			term.echo(`<${color("b","green","You")}> ${color("","white",cmd)}`);
			chatBox = term;
			sendMessageG(gc,cmd,musr);
			$('.chatArea')[0].scrollIntoView(false);
		},exceptionHandler:function(exception){
			console.log(exception.message);
		if(exception.message.includes("sendUserMessage") && exception.message.includes("undefined")){
			chatBox.error("You aren't connected");
		}
	},completion: ['blah','donkey']

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
	switch(args[0]){
		case 'scraping':
			if(args[1]){
				//Scraping start
				$('#statusScraperLabel').addClass('green');
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
						//cArea.echo("Connected");
						cArea.clear();
						gc = groupChannel;
						gc.members.forEach(i=>{
							users.push(i.nickname);
						});

						var participantListQuery = gc.createMemberListQuery();

						participantListQuery.next(function (participantList, error) {
							if (error) {
								return;
							}
							participantList.forEach(i=>{
								users.push(i.nickname);
							});
						});
						//cArea.terminal({completion: ['blah','donkey']});
						

						
						var prevMessageListQuery = groupChannel.createPreviousMessageListQuery();
						prevMessageListQuery.limit = 20;
						prevMessageListQuery.reverse = false;

						prevMessageListQuery.load(function(messages, error) {
							if (error) {
								return;
							}
							messages.forEach(a=>{
								let message = color("b","grey",a.message);	
								let sender = color("b","white",a._sender.nickname);
								let info = `+<${sender}> ${message}`;
								cArea.echo(info);

							});
						});
						gc.refresh();

					});

				}
			});

			break;
		case 'message':
			cArea.insert(ting);
			break;
	}
});

ch.onMessageReceived = function(channel, message) {
	try{
		gsender = message._sender.nickname.toString();
	}catch(e){
		console.log("PARSE ERROR");
	}
	cArea.echo(`<${color("b","blue",gsender)}> ${color("","white",message.message)}`);
};

sb.addChannelHandler(groupHandlerID, ch);

//Send message with mention
function sendMessageG(gc,m,usr){
	var params = new sb.UserMessageParams();
	params.message = m;
	if(usr != ""){
		params.mentionedUserIds = [usr];
		console.log("Mentioning "+usr);
	}

	gc.sendUserMessage(params, function(message, error) {
		if (error) {
			return;
		}
	});
	usr="";
}

