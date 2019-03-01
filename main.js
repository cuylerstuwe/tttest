const {app, BrowserWindow, ipcMain, session, 
	net, Tray, Notification, Menu} = require('electron');
const path = require('path');
const electronLocalshortcut = require('electron-localshortcut');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('settings.json');
const db = low(adapter);





var validWindows = [];
let loginWindow;
let redditWindow;
let realMainWindow;
let scrapeListWindow;
let settingsWindow;
let optionsWindow;
let workWindow;
let currentWindow;

var settingsVal;
var dashboardData;
var chatToken;


//IPC
ipcMain.on('job', (event, ...args) => {
	switch(args[0]){
		case 'chat':
			let data = args[1].data;
			switch(args[1].task){
				case 'token':
					chatToken = data;
					redditWindow.close();
					break;
				case 'notoken':
					redditWindow.show();
					break;
				case 'loaded':
					redditWindow.close();
					break;
				case 'message':
					let info = {task:'message',data:data};
					realMainWindow.webContents.send('chat',info);
					break;

			}
			break;
		case 'dashboard':
			dashboardData=args[1];
			break;
		case 'login':
			windows.login(args[1]);	
			break;
		case 'dashboard-data':
			event.sender.send('dashboard-data', dashboardData);
			break;
		case 'queue':
			mTurk.getQ(event.sender);
			break;;
		case 'update':
			db.get('scraper').assign(args[1]).write();
			settingsVal.scraper = db.get('scraper').value();
			break;
		case 'scrape':
			switch(args[1].task){
				case 'start':
					if(mTurk.scraping){
						mTurk.stopScrape(event.sender);
					}else{
						mTurk.startScrape(event.sender);
					}
					break;
				case 'hit-info':
					let id = args[1].data;
					let check = [...mTurk.scrapeSet].filter(i => i.hit_set_id == id);
					let info = {task:'hit-info', data: check};
					event.sender.send('scrape',info);
					break;
				case 'list-manage':
					console.log(args[1].data);
					let tings = args[1].data;
					let listType = tings.listType;
					let action = tings.action;
					let item = tings.data;
					switch(listType){
						case 0:
							//Include List
							switch(action){
								case 0:
									//Add
									console.log(`add ${item} to include`);
									if(!mTurk.includeList.includes(item)){
										mTurk.includeList.push(item); 
									}
									console.log(mTurk.includeList);
									break;
								case 1:
									//Remove
									console.log("remove from include");
									break;
							}
							break;
						case 1:
							//BlockList
							break;

					}
					break;
				case 'list':
					windows.scraperList();
					break;
				case 'settings':
					windows.settings();	
					break;
			}
			break;

	}
})

//Main

const Main = {
	init(){
		Main.loadDefaults();
	},
	loadSettings(){
		settingsVal = db.value();
		Main.createWindow();
	},
	loadDefaults(){
		db.defaults({ 
			scraper: 
			{
				searchTerm:'',
				reward:1,
				qualified:true,
				masters: false,
				includes: false,
				blocks: false,
				hotkeys:
				{
					settings: 'F1',
					close:'Escape',
					scrape: 'Ctrl+1',
					watch: 'Ctrl+2',
					scrapeList: 'F2',
					watchList: 'F3',
				}
			}, 
			main: 
			{ 
				hotkeys:
				{
					settings: 'F1',
					close:'Escape',
					scrape: 'Ctrl+1',
					watch: 'Ctrl+2',
					scrapeList: 'F2',
					watchList: 'F3',
				}
			}
		})
			.write()
		Main.loadSettings();
	},
	createWindow(){

		loginWindow = new BrowserWindow({
			width: 800,
			height: 480,
			minWidth: 800,
			minHeight: 480,
			frame: false,
			show: false,
			webPreferences: {
				nodeIntegration: false,
				preload: path.join(__dirname, 'src/injects/login.js')
			}

		});

		currentWindow = loginWindow;
		loginWindow.setMenu(null);
		loginWindow.loadURL('https://worker.mturk.com/dashboard');
		//loginWindow.webContents.openDevTools()

		loginWindow.on('closed', function () {
			loginWindow = null
		});

	}

}

app.on('ready', Main.init)
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
app.on('activate', function () {
	if (loginWindow === null) {
		Main.createWindow()
	}
})


//Windows
const windows = {
	//Hotkeys
	hotkeys(){
		for(i in settingsVal.main.hotkeys){
			let key = settingsVal.main.hotkeys[i];
			switch(i){
				case 'settings':
					electronLocalshortcut.register(currentWindow, key, () => windows.settings());
					break;
				case 'close':
					electronLocalshortcut.register(currentWindow, key, () => {
						for(i in validWindows){
							try{
								validWindows[i].close();
							}catch(e){
								//Destroyed window
							}
						}
					});
					break;
				case 'scrape':
					electronLocalshortcut.register(currentWindow, key, () => {
						if(mTurk.scraping){
							mTurk.stopScrape(realMainWindow.webContents);
						}else{
							mTurk.startScrape(realMainWindow.webContents);
						}
					});
					break;
				case 'watch':
					//TODO
					break;
				case 'scrapeList':
					electronLocalshortcut.register(currentWindow, key, () => windows.scraperList());
					break;
				case 'watchList':
					//TODO
					break;
			}

			electronLocalshortcut.register(currentWindow, 'F6', () => {
				windows.reddit();
			});
			electronLocalshortcut.register(currentWindow, 'F7', () => {
				windows.reddit2();
			});

		}
	},
	//Login Check
	login: (boolTing) =>{
		if(boolTing){
			realMainWindow = new BrowserWindow({
				height: 500,
				minWidth: 800,
				minHeight: 500,
				backgroundColor: "#555",
				useContentSize:true,
				frame: false
			});

			currentWindow = realMainWindow;
			realMainWindow.webContents.openDevTools()
			realMainWindow.loadFile('src/views/index.html');
			realMainWindow.on('closed', function () {
				realMainWindow = null
			});
			realMainWindow.webContents.on('did-finish-load', function() {
				realMainWindow.show();
				validWindows.push(realMainWindow);
			});

			loginWindow.close()
				}else{
					loginWindow.show();
					validWindows.push(loginWindow);
				}
		windows.hotkeys();	

	},
	//Settings
	settings(){
		if(settingsWindow == null){
			settingsWindow = new BrowserWindow({
				width: 800,
				height: 600,
				useContentSize:true,
				frame: false,
				show: false,
			});

			//settingsWindow.webContents.openDevTools()
			settingsWindow.loadFile('src/views/settings.html');
			settingsWindow.webContents.on('did-finish-load', function() {
				settingsWindow.show();
				settingsWindow.webContents.send('settings',db.get('scraper').value());
				validWindows.push(settingsWindow);
			});
			settingsWindow.on('closed', function () {
				settingsWindow = null
			});
		}

	},
	//Scraper List
	scraperList: () => {
		if(scrapeListWindow){

		}else{

			scrapeListWindow = new BrowserWindow({
				width: 800,
				height: 600,
				useContentSize:true,
				frame: false,
				show: false
				//parent: realMainWindow
			});

			//scrapeListWindow.webContents.openDevTools()
			scrapeListWindow.loadFile('src/views/scrapeIndex.html');
			scrapeListWindow.webContents.on('did-finish-load', function() {
				let info = {task:'init', data: settingsVal.scraper, lists:{include: mTurk.includeList, block: mTurk.blockList}};
				scrapeListWindow.webContents.send('scrape',info);
				scrapeListWindow.show();
				validWindows.push(scrapeListWindow);
			});
			scrapeListWindow.on('closed', function () {
				scrapeListWindow = null
			});

		}
	},
	reddit(){
		redditWindow = new BrowserWindow({
			width: 800,
			height: 600,
			useContentSize:true,
			frame: false,
			show: true,
			webPreferences: {
				nodeIntegration: false,
				preload: path.join(__dirname, 'src/injects/redditLogin.js')
			}

		});

		//redditWindow.webContents.openDevTools()
		redditWindow.loadURL('https://www.reddit.com/chat/r/turkers/channel/7308797_b0bcd5ad6b2df37866f21e2ef14391566c42f1b4');
		redditWindow.once('ready-to-show', function() {
			//realMainWindow.webContents.send('chat', info);
			redditWindow.webContents.send('final', 'final');
			validWindows.push(redditWindow);
		});
		redditWindow.on('closed', function () {
			redditWindow = null;
			let info = {task:'token',data:chatToken};
			realMainWindow.webContents.send('chat', info);
		});

	},
	reddit2(){
		redditWindow.loadURL('https://www.reddit.com');
	}

}



//Mturk!
var mTurk = {
	version : 1, scraping : false, oldScrape: {}, newScrape: {}, scrapeSet: null, scrapeTimeout: null, 
	includeList : [], blockList: [],
	startScrape(rec){
		this.scraping = true;
		try{
			realMainWindow.webContents.executeJavaScript(`fetch('https://worker.mturk.com/?page_size=40&filters%5Bqualified%5D=${settingsVal.scraper.qualified}&filters%5Bmasters%5D=${settingsVal.scraper.masters}&sort=updated_desc&filters%5Bmin_reward%5D=${settingsVal.scraper.reward}',{
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},})
				.then((resp) => resp.json())
				.catch(function(error) {
					console.log(error);
				});	
				`,true)
				.then((result) => {
					//Yeeboi
					mTurk.newScrape = result.results;
					if( Object.keys(mTurk.oldScrape).length > 0){
						for (i in mTurk.newScrape){
							let hit = mTurk.newScrape[i];
							let check = [...mTurk.scrapeSet].filter(i => i.hit_set_id == hit.hit_set_id);
							if(check.length){
								//Hit is in the bank!
								//TODO: Check hit creation date/time to see if it is outdated compared to the new hit
								//if it is different then throw it out of the bank.
							}else{
								//New hit!
								mTurk.scrapeSet.add(hit);
								if(mTurk.includeList.includes(hit.requester_name)){
									var player = require('play-sound')(opts = {})
									player.play('audio/beep.mp3');

								}
								if(scrapeListWindow){
									let info = {task:'update', data: settingsVal.scraper};
									scrapeListWindow.webContents.send('scrape',info);
									info = {task:'new-hit', data: hit};
									scrapeListWindow.webContents.send('scrape',info);

								}else{

								}

							}
						}

					}else{
						mTurk.scrapeSet = new Set(mTurk.newScrape);
					}
					mTurk.oldScrape = mTurk.newScrape;
					this.scrapeTimeout = setTimeout((a) => {if(mTurk.scraping) mTurk.startScrape(rec)},1000);
					if(rec != null)	
						realMainWindow.send('scrape','scraping',true);
				});
		}catch(e){
			console.log(e);
		}

	},
	stopScrape(rec){
		this.scraping = false;
		//clearTimeout(this.scrapeTimeout);
		if(rec != null)	
			realMainWindow.send('scrape','scraping',false);
	},
	getQ(rec){

		//https://worker.mturk.com/tasks
		realMainWindow.webContents.executeJavaScript(`fetch('https://worker.mturk.com/tasks',{
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},})
			.then((resp) => resp.json())
			.catch(function(error) {
				console.log(error);
			});	
			`,true)
			.then((result) => {
				rec.send('queue',result);
			});

	},
	addList(item,list){
		console.log(item);
		//list.filter(i=>	
	},
	removeList(item,list){
		console.log(item);
	}


}
