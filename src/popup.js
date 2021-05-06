(async () => {
    $(document).ready(() => {
        getCurrentWindowUrl();

        $('#create-new-tab').on('click', () => {
            let frm = $('#tab-creation-form');
            let url = frm.find('#url').val();
            let x = frm.find('#x').val();
            let y = frm.find('#y').val();
            let w = frm.find('#w').val();
            let h = frm.find('#h').val();

            if (url === '')
                sendMessage('alert', {message: 'Please insert an URL'});
            else {
                sendMessage('tabCreate', {
                    link: url,
                    x: `${x}px`,
                    y: `${y}px`,
                    w: `${w}px`,
                    h: `${h}px`
                });
            }
        });
    });
})();

function sendMessage(type, params) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: type,
            params: params
        });
    });
}

function getCurrentWindowUrl() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        $('#tab-creation-form').find('#url').val(tabs[0].url);
    });
}