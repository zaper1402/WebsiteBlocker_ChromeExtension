let allBlockedUrls = [];
const TIME_ALLOWED_PER_DAY_IN_SECONDS = 10;

//getting current tab
//promisify get tabs function
function doInCurrentTab() {
    return new Promise(function (resolve, reject) {
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabArray) { resolve(tabArray[0]); }
        );
    })
}

//function to close tab 
function closeTab(tabId) {
    return new Promise(function (resolve, reject) {
        chrome.tabs.remove(tabId, function () {
            resolve();
        });
    })
}


//chrome storage API save to storage 
function saveToStorage(key, value) {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.set({ [key]: value }, function () {
            resolve();
        });
    })
}

//function to get data from storage
function getFromStorage(key) {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.get([key], function (result) {
            resolve(result[key]);
        });
    })
}

//function to get all keys to iterate
function getAllKeys() {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.get(null, function (items) {
            var allKeys = Object.keys(items);
            console.log(allKeys);
            resolve(allKeys);
        });
    })
}


//badge on extension icon
function setBadgeText(text){
    return new Promise(function(resolve, reject) {
        chrome.browserAction.setBadgeText({text: text}, function(){
            resolve();
        });
    })
}

//get current url's hostname
function getHostName(url) {
    let host = new URL(url).hostname;
    return host;
}

// {'www.facebook.com' : 0 }


//start iffie
(async function starter() {

    await saveToStorage('www.facebook.com', 0);

    allBlockedUrls = await getAllKeys();

    //polling chrome apis to get current tab every second
    (async function pollToGetCurrentTab() {

        let tab = await doInCurrentTab();

        if (tab !== undefined) {
            let url = getHostName(tab.url);

            if (allBlockedUrls.indexOf(url) != -1) {

                let timeSpent = await getFromStorage(url);
                console.log(url + " , " + timeSpent);

                await setBadgeText((TIME_ALLOWED_PER_DAY_IN_SECONDS - timeSpent) + "");
                if (timeSpent >= TIME_ALLOWED_PER_DAY_IN_SECONDS) {
                    await closeTab(tab.id);
                } else {
                    await saveToStorage(url, timeSpent + 1);
                }

            } else {
                await setBadgeText('')
            }
        }

        setTimeout(pollToGetCurrentTab, 1000);
    })();
})();


//message listenend from popup.js
chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.blockUrl != undefined) {
            await saveToStorage(request.blockUrl, 0);
            allBlockedUrls.push(request.blockUrl);
        }
    });