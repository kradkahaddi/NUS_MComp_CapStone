const div_block = document.createElement('div');
div_block.innerHTML = `
                    <div>
                        <span>This is a cookie consent form</span>
                        <span>
                            <button onclick="console.log('Accept')">
                                Accept
                            </button>
                        </span>
                        <span>
                            <button onclick="console.log('reject')">
                                Reject
                            </button>
                        </span>
                    </div>
                    `;

const body = document.getElementsByTagName('body')[0];

// console.log(body.innerHTML)
// body.appendChild(div_block);
function insertElement () {
    body.appendChild(div_block);
}

setTimeout(insertElement, 0);
