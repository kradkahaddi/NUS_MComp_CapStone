console.log('\n\n\nLoaded the main content script.\n\n\n')
var APIURL = "http://127.0.0.1:8000/"

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
                console.log("testing frag api")
                if (response!=undefined && response !=""){
                    checkFlag=JSON.parse(response).check;
                        if(checkFlag===true){
                            console.log('FOUND THE COOKIE', source)
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
async function get_cookie_child(currentNode, source) {

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
    
    if ((nodeName !== 'BUTTON') && (nodeName !== 'SCRIPT') && (nodeName !== 'A')
        && (nodeName !== 'NAV') && (nodeName !== 'FOOTER') && (nodeName !== 'HEADER')) {
        if (currentNode.innerText != undefined || currentNode.innerText != null){
            
            var checkFlag = false

            console.log('pinging api to check for cookies');
            
            result = await api_check_cookie_fragment("TestingFrag",
                    APIURL+"fragtest",
                    currentNode.innerText.toLowerCase(), source)
            
            console.log('api result returned');
            
            if (result.check==true) {
                return currentNode;
            }
            else{
                return null;
            }
        }
    }
    else {
        for (const child in currentNode.childList) {
            currentNode = await get_cookie_child(child, source);
            console.log("recursive search", currentNode)
            if (currentNode != null){
                return (currentNode)
            }
        }
    }
    console.log('finally', checkFlag, currentNode)
    return null
}

const mutationCallback = (mutationList, observer) => {

    for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            // if (mutation.hasAttribute('addedNode'))
            // console.log(mutation.addedNodes);
            if (mutation.addedNodes.length>4){
                var addedNodes = mutation.addedNodes.slice(0,3)
            }
            else {
                var addedNodes = mutation.addedNodes
            }
            // const node = mutation.addedNodes[0];
            for (const node of addedNodes){
                // console.log(node)
                // console.log(node.nodeName, node.innerText)
                // console.log(node.innerHTML)
                if ((node.innerText != null) && (node.innerText!=undefined)){
                    // console.log('getting cookie check')
                    const cookie_node = get_cookie_child(node, 'mutation')
                                            .then(response => response)
                                            .then(response => response);
                    // console.log('done with cookie check')

                    // console.log('mutation callback',cookie_node)
                    
                    if (cookie_node != null){
                        console.log('found it')
                        console.log('disconnecting observer')
                        observer.disconnect()
                        break
                    }
                }
                // if (node.innerText != null && (node.innerText != undefined)){
                //     // const cookieNode = get_cookie_child(node);
                //     if (node.innerText != null){
                //         console.log(node.innertext)
                //         if (node.innerText.toLowerCase().includes('cookie')){
                //             console.log('found the cookie mutation');
                //             console.log(node)
                //     }}
                //     // if (cookieNode != null){
                //     //     // Get the buttons
                //     //     console.log('found the cookie mutation')
                //     //     console.log(cookieNode)
                //     //     cookieButtons = cookieNode.parentNode.getElementsByTagName('button');
                //     //     for (const option of cookieButtons) {
                //     //         console.log(option)
                //     //     }
                //     //     // break if both conditions are met.
                //     //     break;
                //     // }
                // }
            }
        }
    }

    // console.log('leaving mutation callback')
    // setTimeout('', 1000);
}

const config = { attributes: false, childList: true, subtree: true};
observer = new MutationObserver(mutationCallback);

const body = document.getElementsByTagName('body')[0];

const html = document.getElementsByTagName('html')[0];

// console.log('\n\n\n\n', html.parentNode.parentNode, '\n\n\n\n\n\n\n')

const tangible = document.body.getElementsByTagName("*");
// console.log(tangible)
// https://stackoverflow.com/questions/53405535/how-to-enable-fetch-post-in-chrome-extension-contentscript

console.log(tangible)

function tangible_cookie_check(tangible){
    for (const element of tangible) {
        // Get the cookie tag
        
        // console.log('tangible func', element.firstChild)
        
        const cookieNode = get_cookie_child(element, 'tangible')
        
        if (cookieNode != null){
            console.log('cookie is in', cookieNode)
            // console.log(cookieNode.nodeName, window.getComputedStyle(cookieNode).display);
            // cookieButtons = cookieNode.parentNode.getElementsByTagName('button');
            // for (const option of cookieButtons) {
            //     console.log(option)
            // }
            // break if both conditions are met.
            // break;

        }
    }
}

tangible_cookie_check(tangible);

// console.log("sending whole body")

// chrome.runtime.sendMessage(
//     {
//         contentScriptQuery: "TestingWhole",
//         url: APIURL+"wholetest",
//         body: body.innerHTML,
//         baseLang: document.documentElement.lang
//     }, (response) => {
//         console.log("TESTING THE WHOLE BODY API");
//         if (response != undefined && response !="") {
//             // do further action here
//             console.log(response);
//         }
//         else {
//             console.log("whole test api was not responsive");
//         }
//     }
// )

// console.log("sent whole body")

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


const launch_observer = () => {
    console.log("\n\n\nobserver launched\n\n\n")
    observer.observe(body, config)};

setTimeout(launch_observer, 1500)