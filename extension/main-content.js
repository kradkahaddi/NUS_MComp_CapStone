console.log('\n\n\nLoaded the main content script.\n\n\n')
var APIURL = "http://127.0.0.1:8000/"

// var count_global = 0
var PROCESSED_POP = false
// Need two functions:
// One to message and find the cookie banner
// Two to find the best button

function api_check_cookie_fragment(query, url, fragment, source) {
    return new Promise((resolve, reject)=>{
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: query,
                url: url,
                body: fragment,
                lang: document.documentElement.lang
            }, (response) => {
                // console.log("testing frag api")
                if (response!=undefined && response !=""){
                    checkFlag=JSON.parse(response).check;
                        if(checkFlag===true){
                            console.log('api check - found cookie candidate', source)
                            resolve(response)
                        }
                }
                else {
                    console.log("API was non responsive")
                    reject(response)
                }
            }
        )
    })
}

function api_check_buttons_first(query, url, button_labels, options) {
    return new Promise((resolve, reject)=>{
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: query,
                url: url,
                button_labels: button_labels,
                options: options,
                lang: document.documentElement.lang
            }, (response) => {
                // console.log("testing first button api response", response)
                console.log('testing the first button api response')
                response = JSON.parse(response)
                // console.log(response)

                if (response!=undefined && response !=""){
                    checkFlag=response.check;
                        if(checkFlag===true){
                            // console.log('api check - found cookie candidate', source)
                            console.log('found something interesting')
                            resolve(response)
                        }
                        else{
                            console.log('no relevant buttons')
                            resolve(response)
                        }
                }
                else {
                    console.log("API was non responsive")
                    reject(response)
                }
            }
        )
    })
}

async function get_cookie_child(currentNode, source, observer=null) {

    nodeType = currentNode.nodeType
    style = window.getComputedStyle(currentNode)
    nodeName = currentNode.nodeName

    if ((nodeType == 1) && ((style.visibility === 'hidden')
        ||(style.visibility === 'none') || (style.display === 'hidden')
        ||(style.display === 'none'))) {
            // console.log('returning NULL because viz is hidden or none')
            return null
        }

    // making sure none of the parent nodes are set to hidden. Thus hiding the rest
    let curr = currentNode
    while (curr.nodeName !== 'BODY') {
        if (curr.parentNode != null) {
            curr = curr.parentNode;
            if ((curr.nodeType == 1) && 
                ((window.getComputedStyle(curr).display === 'hidden')
                ||(window.getComputedStyle(curr).display === 'none'))) {
                    // console.log('returning NULL because parent is disabled')
                    return null
                }
        }
    }

    if ((currentNode.firstChild == null)) {
        // console.log('returning NULL because the node is empty')
        return null
    }
    
    // if  (currentNode.firstChild.nodeValue == null) {
    //     return null
    // }

    if ((nodeName !== 'BUTTON') && (nodeName !== 'SCRIPT') && (nodeName !== 'A')
        && (nodeName !== 'NAV') && (nodeName !== 'FOOTER') && (nodeName !== 'HEADER')) {
        
        // one option is to use direct inner text, other is to use child inner text
        // 1.
        // const currText = currentNode.innerText;

        // b.childNodes.forEach((x)=>{if (x.nodeName === 'A' || x.nodeName==="P"){console.log(x.textContent)} else if (x.nodeValue!=null) {console.log(x.nodeValue)} }) 
        var currText = ""
        for (x of currentNode.childNodes){
            if (x.nodeName==="P")
                {
                    currText += ' '+ x.textContent
                } 
            else if (x.nodeValue!=null) 
                {
                    if (x.nodeValue!=""){currText += ' '+ x.nodeValue}
                }
            }
        
        currText = currText.trim();
        // 2.
        // const currText = currentNode.firstChild.nodeValue;

        // if (currentNode.firstChild.nodeValue!=null){
        //     var currText = currentNode.firstChild.nodeValue
        // }
        // else if (currentNode.firstChild.nodeName === 'A' || currentNode.firstChild.nodeName==="P"){
        //     var currText = currentNode.firstChild.textContent
        // }
        // else {
        //     var currText = null
        // }
        
        // console.log('text under consideration is:', currText)

        if ((currText != undefined) && (currText != null) && (currText.length > 20)){
            var checkFlag = false
            // console.log(currText)
            // console.log('pinging api to check for cookies');
            
            result = await api_check_cookie_fragment("TestingFrag",
                    APIURL+"fragtest",
                    currText.toLowerCase(), source)
            
            result = JSON.parse(result)
            
            // console.log('api result returned', result, typeof(result));

            setTimeout(()=>{return false}, 100);
            
            // var counter = 5;

            if ((result.check === true) && (PROCESSED_POP===false)){
                var loopFlag = true
                while ((loopFlag===true)) {
                    if(PROCESSED_POP===true){
                        return null
                    }
                    console.log('in the loop')
                    buttons = currentNode.getElementsByTagName('button');
                    console.log(buttons)
                    
                    if(PROCESSED_POP===true){
                        return null
                    }

                    if (buttons.length>0){
                        
                        if(PROCESSED_POP===true){
                            return null
                        }

                        console.log('has buttons')
                        // check the button
                        buttons_labels = []
                        for (const button of buttons){
                            var label_string = ""
                            if (button.labels.length>0){
                                console.log('has labels')
                                for (const label of button.labels){
                                    label_string += label + ' ';
                            }
                            }
                            else {
                                console.log('no labels')
                                label_string = button.innerText
                            }
                            
                            if(PROCESSED_POP===true){
                                return null
                            }

                            console.log("button label is ", label_string)
                            buttons_labels.push(label_string)
                        }
                        if(PROCESSED_POP===true){
                            return null
                        }
                        console.log('sending buttons')
                        button_check_result = await api_check_buttons_first(
                            "TestingFirstButtons", APIURL+'firstbuttons',
                            JSON.stringify(buttons_labels).toLowerCase(),
                            "some string representing nuanced options"
                        )
                        if(PROCESSED_POP===true){
                            return null
                        }
                        console.log('receiving response for buttons')
                        loopFlag = false
                        if (typeof(button_check_result)==='string'){
                            button_check_result = JSON.parse(button_check_result);
                        }
                        console.log(button_check_result)
                        
                        if(PROCESSED_POP===true){
                            return null
                        }
                        if ((button_check_result.check) && (!PROCESSED_POP)){
                            // do some processing
                            // click some button - Accept first, reject second, nuance third
                            buttons[button_check_result.best_index].click()
                            if (button_check_result.solved){
                                console.log('resolved the pop up')
                                PROCESSED_POP = true
                                loopFlag = false
                                return null
                            }
                            else {
                                // go into detailed options
                                loopFlag=false

                            }
                        }
                        else{
                            if(PROCESSED_POP===true){
                                return null
                            }
                            console.log('moving to parent - had buttons')
                            currentNode = currentNode.parentNode;
                            loopFlag = true;
                            // counter = counter -1;
                        }
                    }
                    else {
                        console.log('moving to parent - no buttons')
                        currentNode = currentNode.parentNode;
                        // counter = counter -1;
                    }
                }
            }

            // if (result.check===true) {
            //     // return currentNode;
            //     // console.log(currentNode)

            //     buttons = currentNode.getElementsByTagName('button');
            //     // console.log(buttons)
            //     if (buttons.length>0){
            //         console.log('found cookie candidate', currentNode)
            //         console.log(buttons)
            //         if (observer != null) {
            //             // actually only do something when the banner is processed
            //             console.log('disconnecting the observer')
            //             observer.disconnect();
            //         }
            //     }

            // }
            // else{
            //     return null;
            // }
        }
    }
    else {
        for (const child in currentNode.childList) {
            currentNode = await get_cookie_child(child, source, observer);
            
            console.log("recursive search", currentNode)
            if (currentNode != null){
                return (currentNode)
            }
            return null
        }
        return null
    }

    // console.log('finally', checkFlag, currentNode)
    // count_global = count_global +1
    // return null
}

const mutationCallback = (mutationList, observer) => {

    for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            // if (mutation.hasAttribute('addedNode'))
            // console.log(mutation.addedNodes);
            // if (mutation.addedNodes.length>4){
            //     var addedNodes = mutation.addedNodes.slice(0,3)
            // }
            // else {
            //     var addedNodes = mutation.addedNodes
            // }
            var addedNodes = mutation.addedNodes
            // const node = mutation.addedNodes[0];
            for (const node of addedNodes){
                // console.log(node)
                if ((node.innerText != null) && (node.innerText != undefined)){
                    // console.log(node)
                    // console.log(node.innerText)
                    const cookie_node = get_cookie_child(node, 'mutation', observer);

                    // if (cookie_node != null){
                    //     console.log('found it')
                    //     console.log('disconnecting observer')
                    //     observer.disconnect()
                    //     break
                    // }
                }
            }
        }
    }


}

const config = { attributes: false, childList: true, subtree: true};
observer = new MutationObserver(mutationCallback);

const body = document.getElementsByTagName('body')[0];

const html = document.getElementsByTagName('html')[0];

const tangible = document.body.getElementsByTagName("*");
// https://stackoverflow.com/questions/53405535/how-to-enable-fetch-post-in-chrome-extension-contentscript

console.log(tangible)

function tangible_cookie_check(){
    for (const element of tangible) {
        // Get the cookie tag
        
        // console.log('tangible func', element.firstChild)
        
        const cookieNode = get_cookie_child(element, 'tangible');
        
        // if (cookieNode != null){
        //     console.log('cookie is in', cookieNode)
        // }
        // else {
        //     console.log(element, "has no cookies")
        // }
    }
}

setTimeout(tangible_cookie_check, 2000);


// setTimeout(tangible_cookie_check, 5000);

// setTimeout(()=>console.log("\n\n\n\n\n\n\nCOUNT IS:", count_global, "\n\n\n\n\n\n\n"), 10000);

const launch_observer = () => {
    console.log("\n\n\nobserver launched\n\n\n")
    observer.observe(body, config)};

// setTimeout(launch_observer, 1500)



// function sendMessage(query, url) {
//     return new Promise((resolve, reject)=>{
//         chrome.runtime.sendMessage(
//             {
//                 contentScriptQuery: query,
//                 url: url
//             }, (response) => {
//                 console.log("TESTING API")
//                 if (response!=undefined && response !=""){
//                     console.log('returning response')
//                     resolve(response)
//                 }
//                 else {
//                     console.log("API was non responsive")
//                     reject(response)
//                 }
//             }
//         )
//     })
// }

// const checker = async (query, url) => {
//     console.log('querying');
//     console.log('outside', await sendMessage(query, url));
//     console.log('done querying');
//     // console.log(await result);
// }

// checker("TestAPI", APIURL+"testingapi");

// console.log(await checker("TestAPI", APIURL+"testingapi"));



// endpt();

