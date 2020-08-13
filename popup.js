//get url 
document.getElementById('add-website').onclick = async function(){

    let url = document.getElementById('website').value;
    console.log(url);

    let message = {'blockUrl' : url};
    await sendUrlToBackground(message);
}


//send entered url to background.js
function sendUrlToBackground(message){
    return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage(message, function(response) {
            console.log(response);
          });
    })
}