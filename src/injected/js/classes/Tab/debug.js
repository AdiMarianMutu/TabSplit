Tab.Debug = class TabDebug extends Tab._$ {
    #active;
    _labelInfoIntervalCallback;

    constructor(settings, mainContainer, active = false) {
        super();
        this.#active = active;
        this.settings = settings;
        this.mainContainer = mainContainer;

        if (active)
            this.enableDisableAll(true)
    }

    get isEnabled() { return this.#active; }

    enableDisableForWindowSections(enable, forceEnableOrDisable = false) {
        if (this.settings.windowSections == enable || forceEnableOrDisable == true) {
            if (enable) {
                let dbSectionsC = $('<div>').addClass('debug-win-sections-container').appendTo(this.mainContainer);

                for(let sec in this.settings.windowSectionsBorder) {
                    let el = $($('<div>')
                    .addClass(`debug-win-section ${sec} debug-win-section-label`)
                    .css('border', this.settings.windowSectionsBorder[sec])
                    .text(sec));

                    // Adds the top-full and bottom-full text
                    if (sec.includes('r')) {
                        if (sec == 'rt')
                            $('<div>').addClass('tf').text('tf').appendTo(el);
                        else if (sec == 'rb')
                            $('<div>').addClass('bf').text('bf').appendTo(el);
                    }
                    
                    el.appendTo(dbSectionsC);
                }
            } else
                $('.debug-win-sections-container').remove();

            this.#active = enable;
        }
    }

    #_debugEnableDisableForTab(tEl, enable) {
        tEl = $(tEl);

        // Tab
        tEl.css('mix-blend-mode', enable ? 'difference' : '');
        // Toolbar
        tEl.find('.toolbar').css('border', enable ? this.settings.toolbarBorder : '');
        // Resizing border
        tEl.find('.resize-top').css('border-top', enable ? this.settings.resizingBorder : '');
        tEl.find('.resize-right').css('border-right', enable ? this.settings.resizingBorder : '');
        tEl.find('.resize-bottom').css('border-bottom', enable ? this.settings.resizingBorder : '');
        tEl.find('.resize-left').css('border-left', enable ? this.settings.resizingBorder : '');
        // Label info
        if (enable) {
            let i = this.#getTabInfo(tEl);
            tEl.find('.toolbar').append($('<span>').addClass('debug-tab-info-label').text('Waiting for callback to fire...'));

            // Creates only one interval
            if (this._labelInfoIntervalCallback === undefined) {
                this._labelInfoIntervalCallback = setInterval(() => {
                    this.tabs.forEach((t) => { this.#updateTabLabelInfo(t.element); });
                }, this.settings.tabLabelInfoRefresh);
            }
        } else
            tEl.find('.debug-tab-info-label').remove();

    }
    enableDisableForTabs(enable, tabIdOrEl = null, forceEnableOrDisable = false) {
        if (this.settings.tabDebug == enable || forceEnableOrDisable == true) {
            if (this.tabs.length !== 0 && tabIdOrEl === null) {
                this.tabs.forEach((t) => {
                    this.#_debugEnableDisableForTab(t.element, enable);
                });

                // Disables the interval only when disabling the debug for all tabs
                if (enable == false) {
                    clearInterval(this._labelInfoIntervalCallback);
                    this._labelInfoIntervalCallback = undefined;
                }
            } else if (tabIdOrEl !== null) {
                if (typeof tabIdOrEl === 'number')
                    this.#_debugEnableDisableForTab(this.tabs.find(t => t.id == tabIdOrEl).element, enable);
                else
                    this.#_debugEnableDisableForTab(tabIdOrEl, enable);
            }

            this.#active = enable;
        }
    }
    #updateTabLabelInfo(tabEl) {
        let i = this.#getTabInfo(tabEl);
        let _str = '';

        for(let v in i)
            _str += `${v}: ${i[v]}, `;

        tabEl.find('.debug-tab-info-label').text(_str);
    }
    #getTabInfo(tabEl) {
        let info = {
            id: -1,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            zIndx: 0
        };

        info.id = tabEl.attr('tab-id');
        info.x = tabEl.css('left');
        info.y = tabEl.css('top');
        info.w = tabEl.css('width');
        info.h = tabEl.css('height');
        info.zIndx = tabEl.css('z-index');

        return info;
    }

    enableDisableAll(enable, force) {
        this.enableDisableForWindowSections(enable, force);
        this.enableDisableForTabs(enable, null, force);

        this.#active = enable;
    }
};