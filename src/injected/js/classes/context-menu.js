class ContextMenu {
    // At HTML level will exists only one context menu
    // Every option it is saved inside the tabs.ctx array
    // In order to have a dinamic context menu which it is personally linked to each tab

    #container = $('.tab-split-context-menu');
    #tabs = []; // Keesp track of all the ctx options for each individual tab
    #tabId; // The tab id from the invoked context menu

    constructor(core) { 
        this.#_init();
        this.core = core;
    }

     // Option ctx on click call back
     #optionClick(id, optionEl) {
        let tab =  this.#tabs[this.#getTabIndex(this.#tabId)].tab.element;

        if (id == 'debugModeEnable') {
            this.core.debug.enableDisableForTabs(true, tab, true);

            this.replaceOption('debugModeEnable', {
                id: 'debugModeDisable',
                str: 'Disable Debug Mode',
                toolTip: 'Disable the debug mode',
                disabled: false,
                visible: this.core.settings.get('debugProperties').active
            });
        } else if (id == 'debugModeDisable') {
            this.core.debug.enableDisableForTabs(false, tab, true);

            this.replaceOption('debugModeDisable', {
                id: 'debugModeEnable',
                str: 'Enable Debug Mode',
                toolTip: 'Enable the debug mode',
                disabled: false,
                visible: this.core.settings.get('debugProperties').active
            });
        }

        this.showHideContextMenu(null, false);
    }

    #_init() {
        $(window).on('mousedown', (e) => {
            if (e.which == 3) {
                if ($(e.target).hasClass('toolbar')) {
                    this.#tabId = $(e.target).offsetParent().attr('tab-id');

                    this.showHideContextMenu({x: e.clientX, y: e.clientY}, true);
                }
            } else if (!$(e.target).offsetParent().hasClass('tab-split-context-menu'))
                this.showHideContextMenu(null, false);
        });
    }

    // Used exclusively by the Core class while creating a new tab
    bindToTab(tab, options) {
        this.#tabs.push({
            tab: tab,
            ctx: options
        });
    }
    
    showHideContextMenu(mouse, show) {
        let ctx = this.#container;

        this.#clearCtx();
        if (show) {
            let _opts = this.#tabs[this.#getTabIndex(this.#tabId)].ctx;

            if (_opts.length > 0) {
                this.addOptions(null, _opts);

                ctx.removeClass('ctx-isHidden')
                .css({'left': mouse.x, 'top': mouse.y});
            }
        } else
            ctx.addClass('ctx-isHidden');
    }
    
    addOptions(tabId, options) {
        let ctx = this.#container.find('ul');

        options.forEach((ctxOpt) => {
            if (ctxOpt.visible) {
                let opt = $('<li>').addClass(`ctx-option${ctxOpt.disabled ? ' ctx-disabled' : ''}`)
                .attr({id: ctxOpt.id, 'title': ctxOpt.toolTip});
                $('<span>').text(ctxOpt.str).appendTo(opt);

                opt.on('click', () => { if (!ctxOpt.disabled) this.#optionClick(ctxOpt.id, opt); })
                .on('mousedown', function() {
                    if (ctxOpt.disabled == false)
                        $(this).addClass('ctx-option-clicked'); 
                })
                .on('mouseup mouseleave', function() { $(this).removeClass('ctx-option-clicked') } )
                .appendTo(ctx);

                // If a tab it is specified, we also push to the tabs ctx the new options
                // When tab id null => the options ctx were added with the bindToTab method from the Core class
                if (tabId !== null)
                    this.#tabs[this.#getTabIndex(tabId)].ctx.push(ctxOpt);
            }
        });
    }

    // Removes a single option ctx by giving the id
    // Or if the id is null, all the ctx options will be deleted
    removeOption(id, tabId = null) {
        this.#clearCtx(id);

        let tabObj = this.#getTabObj(tabId);
        if (id !== null) {
            let newTabCtx = tabObj.obj.ctx.filter((t) => { return t.id !== id});
            this.#tabs[tabObj.index].ctx = newTabCtx;

            //this.addOptions(tabId, newTabCtx);
        } else
            this.#tabs[tabObj.index].ctx = [];
    }

    // Clears the HTML options from the context menu
    // Without touching the internal context structure
    #clearCtx(byId = null) { 
        this.#container.find(`ul > ${byId === null ? 'li' : `[id="${byId}"]`}`).remove(); 
    }

    // Useful for toggle options (like debug on/off for current tab)
    replaceOption(id, ctxData, tabId = null) {
        let tabObj = this.#getTabObj(tabId);
        let optEl = this.#container.find(`ul > [id="${id}"]`);

        this.#tabs[tabObj.index].ctx[this.#getTabCtxOptionIndx(id, tabId)] = ctxData;

        optEl.find('span').text(ctxData.str);

        $(optEl.attr({
            'id': ctxData.id,
            'class': `ctx-option${ctxData.disabled ? ' ctx-disabled' : ''}`,
            'title': ctxData.toolTip
        }))
        .off('click mousedown')
        .on('click', () => { if (!ctxData.disabled) this.#optionClick(ctxData.id, optEl) });
    }

    // Retrieves the this.#tabs index filtered by the tab id
    #getTabIndex(tabId = null) {
        let len = this.#tabs.length;
        let _tabId = tabId === null ? this.#tabId : tabId;

        for (let i = 0; i < len; i++) {
            if (this.#tabs[i].tab.id == _tabId)
                return i;
        }

        return -1;
    }

    // Returns all the tab object with also the index from the this.#tabs
    // obj contains the Tab obj (id, element) and the ctx options
    #getTabObj(tabId = null) {
        let tabIndx = this.#getTabIndex(tabId);

        return { index: tabIndx, obj: this.#tabs[tabIndx] };
    }

    // Returns the option ctx index by giving the option id (the context menu button id)
    #getTabCtxOptionIndx(optId, tabId = null) {
        let opts = this.#getTabObj(tabId).obj.ctx;

        for (let i = 0; i < opts.length; i++) {
            if (opts[i].id === optId)
                return i;
        }

        return -1;
    }
}