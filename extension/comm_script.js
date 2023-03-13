console.log('Comm service worker online')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // printing on service worker's isolated world
    console.log('some message received')
    console.log(request)

    if (request.contentScriptQuery=="TestAPI") {
        var url = request.url;
        console.log("url is:",url)
        fetch(url)
            .then(response => response.text())
            .then(response => sendResponse(response))
            .catch()
        return true;
    }

    else if (request.contentScriptQuery=="TestingWhole") {
        var url = request.url;
        console.log("whole testing url is: ", url);
        // var body = JSON.stringify(request.body);
        fetch(url, {
                method: "POST",
                // mode: "cors",
                // cache: "no-cache",
                // credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({string: request.body, lang: request.lang}),
            })
            .then(response => response.text())
            .then(response => sendResponse(response))
            .catch();
        return true;
    }

    else if (request.contentScriptQuery=="TestingFrag") {
        var url = request.url;
        console.log("frag testing url is: ", url);
        // var body = JSON.stringify(request.body);
        fetch(url, {
                method: "POST",
                // mode: "cors",
                // cache: "no-cache",
                // credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({string: request.body, lang: request.lang}),
            })
            .then(response => response.text())
            .then(response => sendResponse(response))
            .catch();
        return true;
    }

    else if (request.contentScriptQuery=="TestingFirstButtons") {
        var url = request.url;
        console.log("first button testing url is: ", url);
        // var body = JSON.stringify(request.body);
        fetch(url, {
                method: "POST",
                // mode: "cors",
                // cache: "no-cache",
                // credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({buttons: request.button_labels, 
                    options:request.options, 
                    lang: request.lang, bad_buttons:request.bad_buttons}),
            })
            .then(response => response.text())
            .then(response => sendResponse(response))
            .catch();
        return true;
    }
    
})
