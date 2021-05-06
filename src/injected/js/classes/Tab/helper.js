Tab.Helper = class TabHelper extends Tab._$ {
    #core;

    constructor(mainContainer, core) {
        super();
        this.mainContainer = mainContainer;
        this.#core = core;
    }

    get mainContainer() { return this.mainContainer; } 
    get allTabs() { return this.tabs; }
    //getTabIdFromChild(el) { return parseInt($(el).offsetParent().attr('tab-id')); }
    getTab(tabId) { return this.tabs.find(tab => tab.id == tabId); }

    showMessage(message, align = 'alert-right') {
        let soundEnabled = this.#core.settings.get('sound');
        let fastNot = this.#core.settings.get('fastNotifications');
        let c = $('.alert-container');

        if (c.length != 0)
            c.remove();
        
        c = $('<div>').addClass(`alert-container ${align}`);

        $('<div>').addClass('extension-title').html('<b>Tab Split</b>').appendTo(c);
        $('<hr>').appendTo(c);
        $('<div>').html(message).appendTo(c);

        c.prependTo(this.mainContainer);

        c.fadeOut(fastNot ? 3000 : 8500, () => { c.remove(); });

        if (soundEnabled)
            (new Audio(alertMessage)).play();
    }
}


/* Independent Methods */
/*
    Misc
*/
function getDomainWithExtensionOnly(urlStr = null) {
    let url = urlStr === null ? window.location.href.split('/') : urlStr.split('/');
    return (url[1] + url[2]).replace('www.', '');
}
/* 
    jQuery extensions
*/
$.fn.hasClasses = function(classes) {
    let _c = classes.split(' ');
    let _cLen = _c.length;

    for (let i = 0; i < _cLen; i++) {
        if ($(this).hasClass(_c[i]))
            return true;
    }

    return false;
}
$.fn.hasAttr = function(attr) {
    let _a = attr.split(' ');
    let _aLen = _a.length;

    for (let i = 0; i < _aLen; i++) {
        if ($(this).attr(_a[i]) !== undefined)
            return true;
    }

    return false;
}