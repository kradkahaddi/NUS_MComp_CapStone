const div_block = document.createElement('div');
div_block.innerHTML = `
                        <p>Cookie Banner sample Text.</p>
                        <div>
                            <button>
                                Button
                            </button>
                        </div>
                        `;

const body = document.getElementsByTagName('body')[0];

// console.log(body.innerHTML)
// body.appendChild(div_block);
function insertElement () {
    body.appendChild(div_block);
}

setTimeout(insertElement, 5000);
