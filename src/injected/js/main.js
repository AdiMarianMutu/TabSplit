(async () => {
    let _s = new Settings();
    // Key: DefaultValue on undefined
    await _s.loadFromStorage({
        debugProperties: {
            active: true,
            windowSections: false,
            windowSectionsBorder: {
                lt: '1px dotted #e8b09f',
                lf: '1px dotted #7ad175',
                lb: '1px dotted #cbb2e4',
                rt: '1px dotted #d1bf53',
                rf: '1px dotted #5fcfc9',
                rb: '1px dotted #a8c3b6'
            },
            tabDebug: false,
            toolbarBorder: '1px dotted red',
            resizingBorder: '5px dashed blue',
            tabLabelInfoRefresh: 500
        },
        smartTabArrangement: true,
        fastNotifications: false,
        sound: true,
        toolbarBgColor: '#3B3B3B',
        tabBorder: '1px solid white',
        tabToolbarMinHeight: 50,
        tabMinWidth: 150,
        tabMinHeight: 50,
        tabEnlargedEffectDuration: 500,
        showOnlyFor: []
    });

    let showOnlyFor = _s.get('showOnlyFor');
    if (showOnlyFor.includes(getDomainWithExtensionOnly()) || showOnlyFor.length == 0) {
        tabSplit = new Tab.Core(_s, true);

        /*tabSplit.create('https://kaiserprotect.ro/', '50%', 0, '550px', '350px');
        tabSplit.create('https://ign.com/', '50px', '100px', '450px', '300px');
        tabSplit.create('https://facebook.com/', '520px', '100px', '450px', '300px');
        tabSplit.create('https://facebook.com/', '520px', '100px', '450px', '300px');
        tabSplit.create('https://facebook.com/', '520px', '100px', '450px', '300px');*/
    }

    // Bridge communication between content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const type = message.type;
        const p = message.params;

        if (type == 'alert') {
            tabSplit.helper.showMessage(p.message, 'alert-left');
        } else if (type == 'tabCreate') {
            tabSplit.create(p.link, p.x, p.y, p.w, p.h);
        }
    });
})();