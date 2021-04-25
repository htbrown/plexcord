const { ipcRenderer, shell } = require('electron');

let quit = () => {
    document.getElementById('quit').classList.add('is-loading');
    ipcRenderer.sendSync('quit');
    document.getElementById('quit').classList.remove('is-loading');
}

document.body.addEventListener('click', event => {
    if (event.target.tagName.toLowerCase() === 'a' && event.target.protocol != 'file:' && event.target.href) {
      event.preventDefault();
      shell.openExternal(event.target.href);
    }
});