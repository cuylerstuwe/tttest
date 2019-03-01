console.log('chatRenderer.js');
const $ = jQuery = require('jquery');
const {remote,ipcRenderer} = require('electron')
const nsb = require('sendbird');


var chatBox = null;
var cArea;
var gc;

function color(style,color,message) {
    return `[[${style};${color};black]` + message + "]";
}

window.addEventListener("load", function(event) {
	require('jquery.terminal')($);

	cArea = $('.chatArea').terminal({
		tt: function(i){  
			this.echo(i);
		}
	}, { prompt: '> ', echoCommand: false, greetings: 'Welcome to chat. Behave.',
		onCommandNotFound:function(cmd,term){
			term.echo(`<${color("b","green","You")}> ${color("","white",cmd)}`);
			chatBox = term;
			sendMessageG(gc,cmd);
			$('.chatArea')[0].scrollIntoView(false);
		}
	});

	//console.log(cArea);

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


ch.onMessageReceived = function(channel, message) {

	var participantListQuery = channel.createMemberListQuery();

	participantListQuery.next(function (participantList, error) {
		if (error) {
			return;
		}

		for(i in participantList){
			//console.log(participantList[i].parse());
		}
	});
	try{
		gsender = message._sender.nickname.toString();
	}catch(e){
		console.log("PARSE ERROR");
	}
	//chatBox.echo(`<${gsender}> ${message.message}`);
	cArea.echo(`<${color("b","blue",gsender)}> ${color("","white",message.message)}`);
	//console.log(cArea);
	//sendMessageG(message._sender.userId,"test");
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

/*
$('#scrapeButton').on('click', (ting)=>{
	ipcRenderer.send('job', 'scrape','start');
});
$('#scrapeList').on('click', (ting)=>{
	ipcRenderer.send('job', 'scrape','list');
});
*/

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

						console.log(groupChannel);
						gc = groupChannel;
						// Successfully fetched the channel.
						// Do something with groupChannel.
					});

					//console.log(sb);

				}
			});

			break;
		case 'message':
			cArea.insert(ting);
			break;
	}
});


