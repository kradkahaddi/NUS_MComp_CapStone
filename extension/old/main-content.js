console.log('\n\n\nLoaded the main content script.\n\n\n')
var APIURL = "http://127.0.0.1:8000/"

// Need two functions:
// One to message and find the cookie banner
// Two to find the best button
function get_cookie_child(currentNode) {
    // if ((element.firstChild != null) && (element.firstChild.nodeValue != null)) {
    //     // console.log(element.firstChild);
    //     // console.log(element.firstChild.nodeName, element.firstChild.nodeValue);
    //     if (element.firstChild.nodeValue.toLowerCase().includes('cookie') &&
    //         element.nodeName !== 'BUTTON') {
    //         console.log("found the banner");
    //         console.log(element.nodeName)
    //         console.log(window.getComputedStyle(element).visibility)
    //         // console.log(element.nodeValue);
    //         console.log(element.parentNode.innerHTML);
    //         const parentNode = element.parentNode;
    //         const options = parentNode.getElementsByTagName('button')
    //         // console.log(options)
    //         for (const option of options) {
    //             console.log(option)
    //             // console.log('clicking button')
    //             // option.click()
    //         }
    //     }
    // }
    // console.log(currentNode.nodeName, window.getComputedStyle(currentNode).visibility)
    if ((currentNode.nodeType == 1) && 
        ((window.getComputedStyle(currentNode).visibility === 'hidden')
        ||(window.getComputedStyle(currentNode).visibility === 'none'))) {
            return null
        }

        if ((currentNode.nodeType == 1) && 
        ((window.getComputedStyle(currentNode).display === 'hidden')
        ||(window.getComputedStyle(currentNode).display === 'none'))) {
            return null
        }
    
    let curr = currentNode
    while (curr.nodeName !== 'BODY') {
        if (curr.parentNode != null) {
            curr = curr.parentNode;
            if ((curr.nodeType == 1) && 
                ((window.getComputedStyle(curr).display === 'hidden')
                ||(window.getComputedStyle(curr).display === 'none'))) {
                    return null
                }
        }
    }

    if ((currentNode.firstChild == null)) {
        return null
    }

    if  (currentNode.firstChild.nodeValue == null) {
        return null
    }

    if (currentNode.firstChild.nodeValue.toLowerCase().includes('cookie') &&
        (currentNode.nodeName !== 'BUTTON') && (currentNode.nodeName !=='A')
        && (currentNode.nodeName !== 'SCRIPT')) {
        console.log('inside get_cookie_child func')
        // console.log(currentNode.nodeName)
        return currentNode
    }
    else {
        for (const child in currentNode.childList) {
            currentNode = get_cookie_child(child);
            if (currentNode != null){
                return currentNode
            }
        }
    }
    return null
}

const mutationCallback = (mutationList, observer) => {
    // observer.disconnect();
    // setTimeout(observer.observe(body, config);)
    console.log('inside mutation callback')
    // console.log(observer)
    // console.log(mutationList)
    for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            // if (mutation.hasAttribute('addedNode'))
            console.log(mutation.addedNodes)
            const node = mutation.addedNodes[0];
            if (node != null){
                const cookieNode = get_cookie_child(node);
        
                if (cookieNode != null){
                    // Get the buttons
                    console.log('found the cookie mutation')
                    console.log(cookieNode)
                    cookieButtons = cookieNode.parentNode.getElementsByTagName('button');
                    for (const option of cookieButtons) {
                        console.log(option)
                    }
                    // break if both conditions are met.
                    break;
                }
            }
        }
    }
}
// const mutationCallback = (mutationList, observer) => {
//     // console.log('inside the mutation callback')
//     for (const mutation of mutationList) {
//         console.log('some mutation detected')
//         if (mutation.type === 'childList') {
//             // cycle through all the mutations here to find the right one with the 
//             // cookies or privacy policy
//             // console.log('\n\n\n\nsubtree has changed\n\n\n\n');
//             // console.log(mutation.addedNodes[0].innerHTML);
//             const node = mutation.addedNodes[0]
//             if ((node.innerHTML != null)) {
//                 if (node.innerHTML.toLowerCase().includes('cookie')) {
//                     // console.log(node.innerHTML)

//                 }
//             }
//             console.log('\n\n\n')
//         }
//     }
// }

const config = { attributes: false, childList: true, subtree: true};
observer = new MutationObserver(mutationCallback);

const body = document.getElementsByTagName('body')[0];

const html = document.getElementsByTagName('html')[0];

// console.log('\n\n\n\n', html.parentNode.parentNode, '\n\n\n\n\n\n\n')

const tangible = document.body.getElementsByTagName("*");
// console.log(tangible)
// https://stackoverflow.com/questions/53405535/how-to-enable-fetch-post-in-chrome-extension-contentscript

for (const element of tangible) {
    // // This works now ----------------------------------------------------------------------------------->
    // // console.log(element.childElementCount, element.childNodes);
    // // console.log(element.firstChild.)
    // if ((element.firstChild != null) && (element.firstChild.nodeValue != null)) {
    //     // console.log(element.firstChild);
    //     // console.log(element.firstChild.nodeName, element.firstChild.nodeValue);
    //     if (element.firstChild.nodeValue.toLowerCase().includes('cookie') &&
    //         element.nodeName !== 'BUTTON') {
    //         console.log("found the banner");
    //         console.log(element.nodeName)
    //         console.log(window.getComputedStyle(element).visibility)
    //         // console.log(element.nodeValue);
    //         console.log(element.parentNode.innerHTML);
    //         const parentNode = element.parentNode;
    //         const options = parentNode.getElementsByTagName('button')
    //         // console.log(options)
    //         for (const option of options) {
    //             console.log(option)
    //             // console.log('clicking button')
    //             // option.click()
    //         }
    //     }
    // }
    // // end of currently working code -------------------------------------------------------------------->

    // Get the cookie tag
    const cookieNode = get_cookie_child(element);
    
    if (cookieNode != null){
        // Get the buttons
        // console.log('found the cookie banner')
        // console.log(cookieNode)
        console.log(cookieNode.nodeName, window.getComputedStyle(cookieNode).display);
        cookieButtons = cookieNode.parentNode.getElementsByTagName('button');
        for (const option of cookieButtons) {
            console.log(option)
        }
        // break if both conditions are met.
        // break;

    }


}

console.log("sending whole body")

chrome.runtime.sendMessage(
    {
        contentScriptQuery: "TestingWhole",
        url: APIURL+"wholetest",
        body: body.innerHTML,
        baseLang: document.documentElement.lang
    }, (response) => {
        console.log("TESTING THE WHOLE BODY API");
        if (response != undefined && response !="") {
            // do further action here
            console.log(response);
        }
        else {
            console.log("whole test api was not responsive");
        }
    }
)

console.log("sent whole body")

//// TESTING MESSAGE PASSING
// console.log("sending message")
// chrome.runtime.sendMessage(
//     {
//         contentScriptQuery: "TestAPI",
//         url: APIURL+"testingapi"
//     }, function (response){
//         console.log("TESTING API")
//         if (response!=undefined && response !=""){
//             console.log(response)
//         }
//         else {
//             console.log("API was non responsive")
//         }
//     }
// )
// console.log("sent message")




observer.observe(body, config);