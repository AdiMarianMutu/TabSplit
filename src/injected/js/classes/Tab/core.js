Tab.Core = class TabCore extends Tab._$ {
    #tabId = 0;
    tabzIndex = 9999999;

    constructor(settings, debugMode = false) {
        super();

        this.#initTabMainContainer();
        this.settings = settings;
        this.mainContainer = $('#tabs-split-container');
        this.helper = new Tab.Helper(this.mainContainer, this);
        this.debug = new Tab.Debug(this.settings.get('debugProperties'), this.mainContainer, debugMode);
        this.ui = new Tab.UI(this.settings, this.mainContainer, this.helper, this);
        this.contextMenu = new ContextMenu(this);
    }

    #initTabMainContainer() {
        $('body').append(
            $('<div>').attr({'class': 'main-container', 'id': 'tabs-split-container'})
            .append($('<div>').addClass('tab-split-context-menu ctx-isHidden')
            .attr('oncontextmenu', 'return false;')
            .append('<ul>'))
        );
    }
    #_updateTabsArray(tabId, newTabEl) {
        this.updateTabsArray(tabId, newTabEl);
        this.helper.tabs = this.tabs;
        this.debug.tabs = this.tabs;
    }

    #completeTabCreation(tabId, newTabEl) {
        this.#_updateTabsArray(tabId, newTabEl);
        this.ui.generateToolbar(tabId);
        this.ui.generateResizableBorders(tabId);
        this.ui.makeFocusable(newTabEl);
        this.ui.fixIframeHeight(tabId, newTabEl);
        this.contextMenu.bindToTab({id: tabId, element: newTabEl}, [
            {
                id: 'changeUrl',
                str: 'Change URL',
                toolTip: 'Change the URL (coming soon)',
                disabled: true,
                visible: true
            },
            {
                id: 'debugModeEnable',
                str: 'Enable Debug Mode',
                toolTip: 'Enable the debug mode',
                disabled: false,
                visible: this.settings.get('debugProperties').active
            }
        ]);

        // Activates the debug mode if it was initialized with the debugMode flag
        if (this.debug.isEnabled)
            this.debug.enableDisableForTabs(true, tabId);
    }

    create(url, posX, posY, w, h) {
        let tabCss = {};
            tabCss['top'] = posY;
            tabCss['left'] = posX;
            tabCss['min-width'] = this.settings.get('tabMinWidth');
            tabCss['min-height'] = this.settings.get('tabMinHeight');
            tabCss['width'] = w;
            tabCss['height'] = h;
            tabCss['border'] = this.settings.get('tabBorder');
            tabCss['z-index'] = this.tabzIndex; this.tabzIndex++;
        let tabId = this.#tabId; this.#tabId++;

        let newTabEl = $($('<div>').css(tabCss).attr(
            {
                'class': 'tab',
                'tab-id': tabId,
                'oncontextmenu': 'return false;'
            }
            )).append($('<iframe>').attr({
                'class': 'iframe', 'src': url,
                'sandbox': 'allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-downloads'
            })).appendTo(this.mainContainer);
        
        this.#completeTabCreation(tabId, newTabEl);
    }

    destroy(tabIdOrEl) {
        let tabEl = tabIdOrEl;

        if (typeof tabIdOrEl === 'number')
            tabEl = this.tabs.find((tab) => tab.id === tabIdOrEl).element;
		this.tabs = this.tabs.filter((tab) => { return tab.element.is(tabEl) == false; });

		tabEl.remove();
        this.#_updateTabsArray(null, this.tabs);
	}
};