console.log('workRenderer.js');
const $ = jQuery = require('jquery');
const {remote,ipcRenderer} = require('electron')



let webView;

document.addEventListener("DOMContentLoaded", function(event) {
	webView = $('#mainView');
	var webViewElement = webView[0];

	webView.on('dom-ready', () => {
		webViewElement.openDevTools();
		console.log("loaded webview");
		webView.keydown(function(event){
			console.log(event);
		});

		/*
		require('electron-context-menu')({
			window: webViewElement,
			prepend: (params, browserWindow) => {
				//console.log($(webViewElement.shadowRoot).find('iframe')[0]);
				//console.log($(webViewElement.shadowRoot).find('iframe')[0]);
				var ting = $(webViewElement.shadowRoot).find('iframe')[0];
				//console.log(ting.contentWindow.document);
				//ipcRenderer.send('xy',{'x':params.x,'y':params.y});
				webViewElement.send('xy',{'x':params.x,'y':params.y});
				return [{
					label: 'Home', click(){

					}
				},
					{
						label: 'Back', click(){
						}
					}];
			}
		});
		*/

	})



});
ipcRenderer.on('dashboard-data', (event, arg) => {
});

