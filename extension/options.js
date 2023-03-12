console.log("options loaded")
// details on chrome storage sync
// https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync
const acceptButton = document.getElementById('accept')
const rejectButton = document.getElementById('reject')
const necessaryButton = document.getElementById('necessary')
const customButton = document.getElementById('custom')

const perfButton = document.getElementById('performance')
const funcButton = document.getElementById('functional')
const tarButton = document.getElementById('targeting')

const customDiv = document.getElementById('customDiv')

customButton.addEventListener('change', e=>{
    if (e.target.checked===true){
        customDiv.style.display='block'
        acceptButton.checked=false
        rejectButton.checked=false
        necessaryButton.checked=false
    }
    else {
        customDiv.style.display='none'
    }
})

acceptButton.addEventListener('change', e=>{
    if (e.target.checked===true){
        customButton.checked=false
        rejectButton.checked=false
        necessaryButton.checked=false
    }
})

rejectButton.addEventListener('change', e=>{
    if (e.target.checked===true){
        acceptButton.checked=false
        customButton.checked=false
        necessaryButton.checked=false
    }
    else {
        customDiv.style.display='none'
    }
})

necessaryButton.addEventListener('change', e=>{
    if (e.target.checked===true){
        acceptButton.checked=false
        rejectButton.checked=false
        customButton.checked=false
    }

})
var policyGlobal = null

// taken from:
// https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync
const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )

async function testFunc(){
    console.log('await sync')
    policyGlobal = await getStorageData('policy')
    console.log(policyGlobal)
    console.log('after await')
}

const saveButton = document.getElementById('saveButton')

const checkAll = ()=>{
    if ((!acceptButton.checked) && (!necessaryButton.checked) 
        && (!rejectButton.checked) && (!customButton.checked)){
            return false
        }
    else {
        return true
    }
}
saveButton.onclick = () => {
    if (!checkAll()){
        document.getElementById('warn').style.display='block';
    }
    else{
        document.getElementById('warn').style.display='none';
        if (customButton.checked){
            var policyObj = {
                policy:"custom",
                perf:perfButton.checked,
                func:funcButton.checked,
                tar:tarButton.checked
            }
        }
        else if (acceptButton.checked){
            var policyObj = {
                policy:'accept',
            }
        }
        else if (rejectButton.checked){
            var policyObj = {
                policy:'reject',
            }
        }
        else if (necessaryButton.checked){
            var policyObj = {
                policy:'necessary',
            }
        }

        chrome.storage.sync.set({
            'policy': policyObj
        })
        
        testFunc()
    }
}