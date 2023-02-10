console.log('\n\n\nLoaded the main content script.\n\n\n')
// Need two functions:
// One to message and find the cookie banner
// Two to find the best button
const mutationCallback = (mutationList, observer) => {
    console.log('inside the mutation callback')
    for (const mutation of mutationList) {
        console.log('some mutation detected')
        if (mutation.type === 'childList') {
            // cycle through all the mutations here to find the right one with the 
            // cookies or privacy policy
            console.log('\n\n\n\nsubtree has changed\n\n\n\n');
            console.log(mutation.addedNodes[0].innerHTML);
            console.log('\n\n\n')
        }
    }
}
const config = { attributes: false, childList: true, subtree: true};
observer = new MutationObserver(mutationCallback);

const body = document.getElementsByTagName('body')[0];

const tangible = document.body.getElementsByTagName("*");
console.log(tangible)
// https://stackoverflow.com/questions/53405535/how-to-enable-fetch-post-in-chrome-extension-contentscript

for (const element of tangible) {
    // console.log(element.childElementCount, element.childNodes);
    // console.log(element.firstChild.)
    if ((element.firstChild != null) && (element.firstChild.nodeValue != null)) {
        // console.log(element.firstChild);
        // console.log(element.firstChild.nodeName, element.firstChild.nodeValue);
        if (element.firstChild.nodeValue.includes('cookie')){
        console.log("found the banner");
        // console.log(element.nodeValue);
        console.log(element.parentNode.innerHTML);
        const parentNode = element.parentNode;
        const options = parentNode.getElementsByTagName('button')
        // console.log(options)
        for (const option of options) {
            console.log(option)
            console.log('clicking button')
            option.click()
        }
        }
    }
}


observer.observe(body, config);