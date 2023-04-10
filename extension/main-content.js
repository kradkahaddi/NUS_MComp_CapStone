console.log('\n\n\nLoaded the main content script.\n\n\n')
var APIURL = "http://127.0.0.1:8000/"

// var count_global = 0
var PROCESSED_POP_INIT = false
var DETAIL_PROCESSED_POP = false
// Need two functions:
// One to message and find the cookie banner
// Two to find the best button
const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )
const getLocalData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )

function sleep_func(milliseconds){
    new Promise((resolve, reject)=>setTimeout(()=>{return False}, milliseconds)
                                ?reject(Error('something weird'))
                                :resolve("done sleeping"))
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

function api_check_buttons_first(query, url, button_labels, options,  badButtons) {
    return new Promise((resolve, reject)=>{
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: query,
                url: url,
                button_labels: button_labels,
                options: options,
                lang: document.documentElement.lang,
                bad_buttons: badButtons
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

function api_check_buttons_detailed(query, url, button_labels, options,  badButtons) {
    return new Promise((resolve, reject)=>{
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: query,
                url: url,
                button_labels: button_labels,
                options: options,
                lang: document.documentElement.lang,
                bad_buttons: badButtons
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


async function resolve_cookie_detailed(currentNode, policy, badButtons){
    console.log('INSIDE DETAIL SELECTOR found input labels')
                            // console.log(document.activeElement)
    var buttons = currentNode.getElementsByTagName('button');
    if(DETAIL_PROCESSED_POP===true){
        return null
    }

    button_text = []
    button_labels = []
    input_labels = []
    labelled_buttons = []
    text_buttons  = []
    cleaned_inputs = []
    console.log('declared arrays')
    
    if(DETAIL_PROCESSED_POP===true){
        return null
    }

    inputs = currentNode.getElementsByTagName('input');
    for (inp of inputs){
        style=window.getComputedStyle(inp)
        if (!((style.visibility === 'hidden')
            ||(style.visibility === 'none') || (style.display === 'hidden')
            ||(style.display === 'none'))&&(inp.disabled===false))
            {
                // console.log(inp.disabled)
                cleaned_inputs.push(inp)
            }
    }
    
    if(DETAIL_PROCESSED_POP===true){
        return null
    }

    console.log('processed input tags')

    for (var inp of cleaned_inputs){
        var input_string = "";
        if (inp.labels.length>0){
            for (const label of inp.labels){
                input_string += label.textContent.toLowerCase() + ' ';
            }
            input_labels.push(input_string.trim())
        }
        else{
            while(true){
                inp = inp.parentNode
                // for (const child of inp.childNodes){
                //     // https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
                    
                //     // if((child.nodeName=='P')||(child.nodeName=='DIV')||(child.node)){
                        
                //     // }
                // }
                // console.log(inp.textContent)
                text = inp.textContent.replace(/\r?\n|\r/g, "").trim().toLowerCase()
                if (text.length>0){
                    input_labels.push(text)
                    break
                }
                continue
            }
        }
    }

    if(DETAIL_PROCESSED_POP===true){
        return null
    }

    console.log('processed input labels')
    console.log(input_labels)

    for (const button of buttons){
        var label_string = ""
        if (button.disabled){
            continue
        }
        if (button.labels.length>0){
            // console.log('has labels')
            for (const label of button.labels){
                label_string += label + ' ';
            }
            button_labels.push(label_string)
            labelled_buttons.push(button)
        }
        else {
            // console.log('no labels')
            label_string = button.innerText
            button_text.push(label_string)
            text_buttons.push(button)
        }
    }
    
    if(DETAIL_PROCESSED_POP===true){
        return null
    }

    var inputs_for_check = {
        button_text: JSON.stringify(button_text).toLowerCase(),
        button_label: JSON.stringify(button_labels).toLowerCase(),
        input_label: JSON.stringify(input_labels).toLowerCase()
    }
    console.log(inputs_for_check)
    console.log('inputs')
    for (const inp of cleaned_inputs){
        console.log(inp)
    }
    console.log('text buttons')
    text_buttons.forEach((x)=>console.log(x))
    console.log('labelled buttons', labelled_buttons)
    var button_check_result = await api_check_buttons_detailed(
        "TestingDetailedButtons", APIURL+'detailedoptions',
        JSON.stringify(inputs_for_check).toLowerCase(),
        JSON.stringify(policy.policy).toLowerCase(), 
        JSON.stringify(badButtons).toLowerCase()
        )
    
    if(DETAIL_PROCESSED_POP===true){
        return null
    }

    console.log("returned from detailed button func")
    
    if (typeof(button_check_result)==='string'){
        button_check_result = JSON.parse(button_check_result);
    }
    console.log(button_check_result)
    
    // DO CHECK FOR SAVE BUTTON
    if (!button_check_result.has_save_button){
        console.log('no save button')
        console.log("current", currentNode, currentNode.nodeName)
        console.log("parent", currentNode.parentNode)
        await Promise.all([resolve_cookie_detailed(currentNode.parentNode, policy, badButtons)])
    }
    else {
        // DETAIL_PROCESSED_POP = true
        console.log('has save button')
    }

    if((button_check_result.is_reject!=undefined)&&(DETAIL_PROCESSED_POP===false)){
        if (button_check_result.is_reject===true){
            DETAIL_PROCESSED_POP = true
            console.log('rejecting all')
            text_buttons[button_check_result.best_index].click()
            
            button_check_result['url'] = document.URL
            button_check_result['policy'] = policy
            logs = await getLocalData('cookie-extension-batch-logs');
            logs = logs['cookie-extension-batch-logs']
            logs[document.title] = button_check_result
            chrome.storage.local.set({
                'cookie-extension-batch-logs': logs
            })

            return new Promise((resolve) =>{
                resolve(button_check_result)
                })
        }
    }

    if((button_check_result.solved===true)&&(DETAIL_PROCESSED_POP===false)){
        // do all the checkbox actions or press all the buttons
        if (button_check_result.checkbox===true){
            var processing = cleaned_inputs
        } else {
            var processing = labelled_buttons
        }
        
        for (idx of button_check_result.pos_labels){
            if ((button_check_result.checkbox)){
                if ((processing[idx].checked!=undefined)&&(processing[idx]!=null)){
                    processing[idx].checked=true;
                }
            } else {
                processing[idx].click()
            }
        }

        // press save
        console.log('saving preferences')
        text_buttons[button_check_result.best_index].click()
        
        button_check_result['url'] = document.URL
        button_check_result['policy'] = policy
        logs = await getLocalData('cookie-extension-batch-logs');
        logs = logs['cookie-extension-batch-logs']
        logs[document.title] = button_check_result
        chrome.storage.local.set({
            'cookie-extension-batch-logs': logs
        })
        DETAIL_PROCESSED_POP = true 
    }
    return new Promise((resolve) =>{
        resolve(button_check_result)
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
            var badButtons = []
            // console.log(currText)
            // console.log('pinging api to check for cookies');
            
            result = await api_check_cookie_fragment("TestingFrag",
                    APIURL+"fragtest",
                    currText.toLowerCase(), source)
            
            result = JSON.parse(result)
            
            // console.log('api result returned', result, typeof(result));

            setTimeout(()=>{return false}, 100);
            
            // var counter = 5;
            var policy = await getStorageData('policy');
            if (policy.policy === undefined){
                policy = {policy:{policy:'necessary'}}
            }

            console.log(policy)

            if ((result.check === true) && (PROCESSED_POP_INIT===false)){
                var loopFlag = true
                while ((loopFlag===true)) {

                    if(PROCESSED_POP_INIT===true){
                        return null
                    }
                    console.log('in the loop')
                    var buttons = currentNode.getElementsByTagName('button');
                    console.log(buttons)
                    
                    if(PROCESSED_POP_INIT===true){
                        return null
                    }

                    if (buttons.length>0){
                        
                        if(PROCESSED_POP_INIT===true){
                            return null
                        }

                        console.log('has buttons')
                        // check the button
                        button_text = []
                        button_labels = []
                        input_labels = []
                        labelled_buttons = []
                        text_buttons  = []
                        cleaned_inputs = []

                        inputs = currentNode.getElementsByTagName('input');
                        for (inp of inputs){
                            style=window.getComputedStyle(inp)
                            if (!((style.visibility === 'hidden')
                                ||(style.visibility === 'none') || (style.display === 'hidden')
                                ||(style.display === 'none')))
                                {
                                    cleaned_inputs.push(inp)
                                }
                        }
                        for (const inp of cleaned_inputs){
                            var input_string = "";
                            if (inp.labels.length>0){
                                for (const label of inp.labels){
                                    input_string += label + ' ';
                                }
                                input_labels.push(input_string)
                            }
                        }
                        
                        for (const button of buttons){
                            var label_string = ""
                            if (button.labels.length>0){
                                // console.log('has labels')
                                for (const label of button.labels){
                                    label_string += label + ' ';
                                }
                                button_labels.push(label_string)
                                labelled_buttons.push(button)
                            }
                            else {
                                // console.log('no labels')
                                label_string = button.innerText
                                button_text.push(label_string)
                                text_buttons.push(button)
                            }
                            
                            if(PROCESSED_POP_INIT===true){
                                return null
                            }

                            // console.log("button label is ", label_string)
                        }
                        if(PROCESSED_POP_INIT===true){
                            return null
                        }
                        console.log('sending buttons')
                        // if button_text only has elements
                        if ((button_text.length>0) && ((input_labels.length===0)&&(button_labels.length===0))){
                            button_check_result = await api_check_buttons_first(
                                "TestingFirstButtons", APIURL+'firstbuttons',
                                JSON.stringify(button_text).toLowerCase(),
                                JSON.stringify(policy.policy).toLowerCase(), 
                                JSON.stringify(badButtons).toLowerCase()
                            )
                            if(PROCESSED_POP_INIT===true){
                                return null
                            }
                            console.log('receiving response for buttons')
                            loopFlag = false
                            
                            if (typeof(button_check_result)==='string'){
                                button_check_result = JSON.parse(button_check_result);
                            }
                            console.log(button_check_result)
                            
                            if(PROCESSED_POP_INIT===true){
                                return null
                            }

                            if ((button_check_result.check) && (!PROCESSED_POP_INIT)){
                                // do some processing
                                // click some button - Accept first, reject second, nuance third
                                buttons[button_check_result.best_index].click()
                                
                                if (button_check_result.solved){
                                    console.log('resolved the pop up')
                                    button_check_result['url'] = document.URL
                                    button_check_result['policy'] = policy
                                    logs = await getLocalData('cookie-extension-batch-logs');
                                    logs = logs['cookie-extension-batch-logs']
                                    logs[document.title] = button_check_result
                                    chrome.storage.local.set({
                                        'cookie-extension-batch-logs': logs
                                        })
                                    PROCESSED_POP_INIT = true
                                    loopFlag = false
                                    return null
                                }
                                else {
                                    // go into detailed options
                                    console.log('going into detailed options')
                                    loopFlag=true
                                    
                                    await Promise.all([timeout(2000)])

                                    // console.log('after time out', Date.now())
                                    currentNode = document.activeElement
                                    console.log(currentNode)
                                    console.log(currentNode.nodeName)
                                    // console.log('done check')
                                    PROCESSED_POP_INIT=true
                                    var effectiveNode = null
                                    if ((currentNode.nodeName==='BODY')){
                                        for (const child of currentNode.querySelectorAll('*')){
                                            if ((child.nodeName!=='SCRIPT')&&(child.nodeValue==null)){
                                                style=window.getComputedStyle(child)
                                                
                                                var old_z = -1000
                                                var z = style.zIndex
    
                                                if (!((style.visibility === 'hidden')
                                                ||(style.visibility === 'none') || (style.display === 'hidden')
                                                ||(style.display === 'none'))&&(z>old_z)&&(z!=='auto'))
                                                {
                                                    console.log(z, old_z)
                                                    console.log(child, effectiveNode)
                                                    effectiveNode = child
                                                    old_z = z
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        effectiveNode = currentNode
                                        while((effectiveNode.getElementsByTagName('input').length<2)
                                            ||(effectiveNode.getElementsByTagName('button').length<1)){
                                            effectiveNode = effectiveNode.parentNode
                                            console.log('no. labels', effectiveNode.getElementsByTagName('input').length)
                                            console.log('no. buttons', effectiveNode.getElementsByTagName('button').length)
                                        }
                                    }
                                    
                                    console.log(effectiveNode)
                                    await Promise.all([resolve_cookie_detailed(effectiveNode, policy, badButtons)])
                                    console.log('returned from cookie resolution function')
                                    // // return null 
                                    return null
                                }
                            }
                            else{
                                if(PROCESSED_POP_INIT===true){
                                    return null
                                }
                                console.log('moving to parent - had buttons')
                                badButtons.push(...button_labels)
                                currentNode = currentNode.parentNode;
                                loopFlag = true;
                                // counter = counter -1;
                            }
                        }
                        else if ((input_labels.length>0)||(button_labels.length>0)){
                            PROCESSED_POP_INIT = true
                            
                            await Promise.all([resolve_cookie_detailed(currentNode, policy, badButtons)])
                            if(PROCESSED_POP_INIT===true){
                                return null
                            }
                                
                            return null

                        }
                    }
                    else {
                        console.log('moving to parent - no buttons')
                        currentNode = currentNode.parentNode;
                        // counter = counter -1;
                    }
                }
            }
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

    
}

const mutationCallback = (mutationList, observer) => {

    for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
            var addedNodes = mutation.addedNodes
            for (const node of addedNodes){
                // console.log(node)
                if ((node.innerText != null) && (node.innerText != undefined)){
                    const cookie_node = get_cookie_child(node, 'mutation', observer);
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
        const cookieNode = get_cookie_child(element, 'tangible');
    }
}


setTimeout(tangible_cookie_check, 2000);

const launch_observer = () => {
    console.log("\n\n\nobserver launched\n\n\n")
    observer.observe(body, config)};
