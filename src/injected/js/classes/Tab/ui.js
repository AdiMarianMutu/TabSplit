Tab.UI = class TabUI extends Tab._$ {
    #helper;
    #core;

    #mouse;
    #bodyHTML;

    #SMART_TAB_ARRANGEMENT;
    #TAB_MIN_WIDTH;
    #TAB_MIN_HEIGHT;
    #TOOLBAR_MIN_HEIGHT;
    #ENLARGED_ANIMATION_SPEED;

    constructor(settings, mainContainer, helper, core) {
        super();

        this.#init();
        this.settings = settings;
        this.mainContainer = mainContainer;
        this.#helper = helper;
        this.#core = core;

        this.#mouse = {x: null, y: null};
        this.#bodyHTML = $('body');

        this.#SMART_TAB_ARRANGEMENT = this.settings.get('smartTabArrangement');
        this.#TAB_MIN_WIDTH = this.settings.get('tabMinWidth');
        this.#TAB_MIN_HEIGHT = this.settings.get('tabMinHeight');
        this.#TOOLBAR_MIN_HEIGHT = this.settings.get('tabToolbarMinHeight');
        this.#ENLARGED_ANIMATION_SPEED = this.settings.get('tabEnlargedEffectDuration');
    }

    get #getWindow() {
        let win = $(window);

        return {w: win.width(), h: win.height()}; 
    }
    get #getWindowEnlargmentSectionsH() {
        return Math.ceil(this.#getWindow.h / 3);
    }

    /* ENLARGMENT */

    get #enlargmentDirectionsMap() {
        return {
            left: {
                top: {
                    mouseXMin: Number.MIN_SAFE_INTEGER,
                    mouseXMax: 0,
                    mouseYMin: Number.MIN_SAFE_INTEGER,
                    mouseYMax: this.#getWindowEnlargmentSectionsH,
                    class: 'left-top',
                    n: 'lt',
                    parent: 'left',
                    classWhenOccupied: ['left-bottom', 'right-bottom', 'right-top']
                },
                full: {
                    mouseXMin: Number.MIN_SAFE_INTEGER,
                    mouseXMax: 0,
                    mouseYMin: this.#getWindowEnlargmentSectionsH,
                    mouseYMax: this.#getWindowEnlargmentSectionsH * 2,
                    class: 'left-full',
                    n: 'lf',
                    parent: 'left',
                    classWhenOccupied: ['right-full', 'left-top', 'left-bottom']
                },
                bottom: {
                    mouseXMin: Number.MIN_SAFE_INTEGER,
                    mouseXMax: 0,
                    mouseYMin: this.#getWindowEnlargmentSectionsH * 2,
                    mouseYMax: this.#getWindow.h,
                    class: 'left-bottom',
                    n: 'lb',
                    parent: 'left',
                    classWhenOccupied: ['left-top', 'right-bottom', 'right-top']
                }
            },
            top: {
                full: {
                    mouseXMin: 1,
                    mouseXMax: this.#getWindow.w - 1,
                    mouseYMin: Number.MIN_SAFE_INTEGER,
                    mouseYMax: 0,
                    class: 'top-full',
                    n: 'tf',
                    parent: 'top',
                    classWhenOccupied: ['left-top', 'right-top']
                }
            },
            right: {
                top: {
                    mouseXMin: this.#getWindow.w,
                    mouseXMax: Number.MAX_SAFE_INTEGER,
                    mouseYMin: Number.MIN_SAFE_INTEGER,
                    mouseYMax: this.#getWindowEnlargmentSectionsH,
                    class: 'right-top',
                    n: 'rt',
                    parent: 'right',
                    classWhenOccupied: ['right-bottom', 'left-bottom', 'left-top']
                },
                full: {
                    mouseXMin: this.#getWindow.w,
                    mouseXMax: Number.MAX_SAFE_INTEGER,
                    mouseYMin: this.#getWindowEnlargmentSectionsH,
                    mouseYMax: this.#getWindowEnlargmentSectionsH * 2,
                    class: 'right-full',
                    n: 'rf',
                    parent: 'right',
                    classWhenOccupied: ['left-full', 'right-top', 'right-bottom']
                },
                bottom: {
                    mouseXMin: this.#getWindow.w,
                    mouseXMax: Number.MAX_SAFE_INTEGER,
                    mouseYMin: this.#getWindowEnlargmentSectionsH * 2,
                    mouseYMax: this.#getWindow.h,
                    class: 'right-bottom',
                    n: 'rb',
                    parent: 'right',
                    classWhenOccupied: ['right-top', 'left-bottom', 'left-top']
                }
            },
            bottom: {
                full: {
                    mouseXMin: 1,
                    mouseXMax: this.#getWindow.w - 1,
                    mouseYMin: this.#getWindow.h,
                    mouseYMax: Number.MAX_SAFE_INTEGER,
                    class: 'bottom-full',
                    n: 'bf',
                    parent: 'bottom',
                    classWhenOccupied: ['left-bottom', 'right-bottom']
                }
            }
        };
    }

    get #_enlargmentFindOccupiedSections() {
        let s = {
            'left-top': false,
            'left-full': false,
            'left-bottom': false,
            'bottom-full': false,
            'right-bottom': false,
            'right-full': false,
            'right-top': false,
            'top-full': false
        };

        for(let _s in s)
            s[_s] = $(`.${_s}`).not('.tab-enlargment-pre-effect').length > 0;

        return s;
    }

    #_enlargmentSectionIsOccupied(section) {
        let tabs = $(`.tab-enlarged[class*="${section.parent}"]`);

        if (tabs.length == 0)
                return false;
        else {
            if (tabs.hasClass(section.class) || tabs.attr('class').includes('full') || section.n.includes('f'))
                return true;
            
            return false;
        }
    }

    #enlargmentExecuteOnSections(win, callBack, extraParms = null) {
        if ((this.#mouse.x <= 0 || this.#mouse.x >= win.w) || (this.#mouse.y <= 0 || this.#mouse.y >= win.h)) {
            let sectionMap = this.#enlargmentDirectionsMap;

            _break:
            for(let sectionParent in sectionMap) {
                for(let sectionChild in sectionMap[sectionParent]) {
                    let _ = sectionMap[sectionParent][sectionChild];
 
                    if ((this.#mouse.x >= _.mouseXMin && this.#mouse.x <= _.mouseXMax) && (this.#mouse.y >= _.mouseYMin && this.#mouse.y <= _.mouseYMax)) {
                        if (extraParms === null)
                            callBack(_, this.#_enlargmentSectionIsOccupied(_));
                        else
                            callBack(_, this.#_enlargmentSectionIsOccupied(_), extraParms);

                        break _break;
                    }
                }
            }
        }
    }
    
    #enlargmentGetParentSectionClass(tab) { return tab.attr('class').split(' ').pop(); }

    #_enlargmentSequentiallyRetrieveFreeSection(currentSection) {
        let os = this.#_enlargmentFindOccupiedSections;

        for (let i = 0; i < currentSection.classWhenOccupied.length; i++) {
            let sectionIsOccupied = os[currentSection.classWhenOccupied[i]];
            if (sectionIsOccupied === false)
                return currentSection.classWhenOccupied[i];
        }


        return null;
    }

    #enlargmentFindFreeSection(currentSection) {
        let tabsEnlarged = $('.tab-enlarged').filter(function() { return $(this).attr('class').includes(currentSection.parent)});;
        let tEnLen = tabsEnlarged.length;

        if (tEnLen == 0)
            return currentSection.class;
        else {
            let remainingTabs = tabsEnlarged.not(`.${currentSection.class}`).find((e) => {
                if (typeof e !== 'function')
                    this.#enlargmentGetParentSectionClass($(e)) !== currentSection.class
            });
            
            if (remainingTabs.length == 0) {
                let s = this.#_enlargmentSequentiallyRetrieveFreeSection(currentSection);

                if (s != null)
                    return s;
                    
                // No free space found
                return currentSection.class;
            }
        }
    }

    #_enlargmentPreviewEffectDraw(section, alreadyOccupied) {
        let previewEl = $('.tab-enlargment-pre-effect');
        let drawInProgress = (previewEl.length > 0);

        if (drawInProgress == false) {
            previewEl = $('<div>')
                        .addClass('tab-enlargment-pre tab-enlargment-pre-effect')
                        .css({'width': 0, 'height': 0, 'z-index': this.#core.tabzIndex - 2})
                        .appendTo(this.mainContainer);
        } else
            this.#enlargmentReset(previewEl);

        if (alreadyOccupied && this.#SMART_TAB_ARRANGEMENT == true)
            // If it is already occupied, we try to find a free space, otherwise the tab will be anchored to the edge to which was dragged
            section.class = this.#enlargmentFindFreeSection(section);
        
        previewEl.addClass(section.class);
        
        // Small delay used to allow the effect to take place
        setTimeout(() => { previewEl.css({'width': '', 'height': ''}); }, 1);
    }

    #enlargmentInit(tab, prop) {
        let win = this.#getWindow;
        let toolbar = tab.find('.toolbar');
        let offsetX;
        let offsetY;

        if ((this.#mouse.x <= 0 || this.#mouse.x >= win.w) || (this.#mouse.y <= 0 || this.#mouse.y >= win.h))
            this.#enlargmentExecuteOnSections(win, (s, ao) => { this.#_enlargmentPreviewEffectDraw(s, ao); } );
        else
            // Mouse not near any edge anymore
            this.#enlargmentPreviewRemove($('.tab-enlargment-pre-effect'));


        if (prop.isEnlarged == false) {
            // If the tab has been maximized, when dragging we will have the mouse at the center of the tab's x axes
            if (tab.hasAttr('maximize')) {
                this.#tabToolbarResizerBtnsClicked(tab, 'maximize-btn', true);

                toolbar.attr({'offset-x': this.#mouse.x - (tab.position().left + tab.width())});
            }

            offsetX = this.#mouse.x + parseInt(toolbar.attr('offset-x'));
            offsetY = this.#mouse.y + parseInt(toolbar.attr('offset-y'));
        } else {
            // If the tab is enlarged and misses the transition css, we must add it back (usually this happens when the tab has been resized while being enlarged)
            if (tab.css('transition').includes('auto'))
                tab.css('transition', `width ${this.#ENLARGED_ANIMATION_SPEED}ms, height ${this.#ENLARGED_ANIMATION_SPEED}ms`);

            // Removes the enlargment classes
            this.#enlargmentReset(tab);
            // The tab has been anchored to an edge, we bring back his original dimensions
            let origW = parseInt(tab.attr('original-width'));
            let origH = parseInt(tab.attr('original-height'));
            // Recalculates the new offset
            tab.css({'width': origW, 'height': origH});
            offsetX = this.#mouse.x - (origW / 2);
            offsetY = this.#mouse.y - 10;
        }

        tab.css({'left': `${offsetX}px`, 'top': `${offsetY}px`});
    }

    #_enlargeTabExecute(section, alreadyOccupied, tab) {
        if (alreadyOccupied && this.#SMART_TAB_ARRANGEMENT == true)
            section.class = this.#enlargmentFindFreeSection(section);

        this.#enlargmentPrepareTab(tab);
        tab.addClass(section.class);
    }

    #enlargeTab(tab) {
        let win = this.#getWindow;

        this.#enlargmentPreviewRemove($('.tab-enlargment-pre-effect'));

        tab.attr({
            'enlarged': true,
            'original-width': tab.width(),
            'original-height': tab.height()
        }).addClass('tab-enlarged'); // The tab-enlarged class is used for the expansion effect
         

        // Custom animation duration loaded from the settings
        if (this.#ENLARGED_ANIMATION_SPEED != 500)
            tab.css('transition', `width ${this.#ENLARGED_ANIMATION_SPEED}ms, height ${this.#ENLARGED_ANIMATION_SPEED}ms`);

        this.#enlargmentExecuteOnSections(win, (s, ac, t) => { this.#_enlargeTabExecute(s, ac, t); }, tab);
    }

    #enlargmentPreviewRemove(prvw) {
        if (prvw.length != 0)
            prvw.fadeOut(100, function() { prvw.remove(); });
    }

    #enlargmentPrepareTab(tab) {
        tab.css({
            'top': '',
            'bottom': '',
            'right': '',
            'left': '',
            'width': '',
            'height': '',
            'transform': ''
        });
    }

    #enlargmentReset(tab) { tab.removeClass('left-full left-top top-full right-top right-full right-bottom bottom-full left-bottom'); }

    /* END ENLARGMENT */

    /* RESIZING */

    #resizing(tab, prop) {
        let win = this.#getWindow;
        let border = tab.find('[resizing="true"]');
        let dir = border.attr('resizing-border');
        let tabTop = parseInt(tab.css('top'));
        let tabLeft = parseInt(tab.css('left'));
        let _resTabW = parseInt(border.attr('tab-width'));
        let _resTabH = parseInt(border.attr('tab-height'));
        let _resTabTop = parseInt(border.attr('tab-top'));
        let _resTabLeft = parseInt(border.attr('tab-left'));
        let tabWResized = -1;
        let tabHResized = -1;

        // Removes the minimized/maximized status
        if (prop.isMinimized)
            this.#tabToolbarResizerBtnsClicked(tab, 'minimize-btn', false);
        if (prop.isMaximized)
            this.#tabToolbarResizerBtnsClicked(tab, 'maximize-btn', false);

        // Must remove the transition to avoid the delay animation when resizing an enlarged window
        if (prop.isEnlarged)
            tab.css('transition', 'auto');

        if (dir.includes('top')) {
            tabHResized = (_resTabH + _resTabTop) - this.#mouse.y;
        } 
        if (dir.includes('right')) {
            tabWResized = this.#mouse.x - tabLeft;
        } 
        if (dir.includes('bottom')) {
            tabHResized = (this.#mouse.y - tabTop);
        } 
        if (dir.includes('left')) {
            tabWResized = (_resTabW - this.#mouse.x) + _resTabLeft;
        }

        if (dir == 'top') {
            if (this.#mouse.y > 0 && tabHResized > (((parseInt(tab.find('.toolbar').css('height')) + 1) + this.#TAB_MIN_HEIGHT)))
                tab.css({'top': this.#mouse.y, 'height': tabHResized});
        } else if (dir == 'top-right') {
            if (tabWResized >= this.#TAB_MIN_WIDTH)
                tab.css('width', tabWResized);

            if (this.#mouse.y > 0 && (tabHResized > (((parseInt(tab.find('.toolbar').css('height')) + 1) + this.#TAB_MIN_HEIGHT))))
                tab.css({'top': this.#mouse.y, 'height': tabHResized});
        } else if (dir == 'right') {
            if (tabWResized >= this.#TAB_MIN_WIDTH)
                tab.css('width', tabWResized);
        } else if (dir == 'bottom-right') {
            if (tabWResized >= this.#TAB_MIN_WIDTH)
                tab.css('width', tabWResized);
            if (this.#mouse.y < win.h && (tabHResized > (((parseInt(tab.find('.toolbar').css('height')) + 1) + this.#TAB_MIN_HEIGHT))))
                tab.css('height', tabHResized);
        } else if (dir == 'bottom') {
            if (this.#mouse.y < win.h && tabHResized > (((parseInt(tab.find('.toolbar').css('height')) + 1) + this.#TAB_MIN_HEIGHT)))
                tab.css('height', tabHResized);
        } else if (dir == 'bottom-left') {
            if (tabWResized >= this.#TAB_MIN_WIDTH)
                tab.css({'left': this.#mouse.x, 'width': tabWResized});
            if (this.#mouse.y < win.h && (tabHResized > (((parseInt(tab.find('.toolbar').css('height')) + 1) + this.#TAB_MIN_HEIGHT))))
                tab.css('height', tabHResized);
        } else if (dir == 'left') {
            if (tabWResized >= this.#TAB_MIN_WIDTH)
                tab.css({'left': this.#mouse.x, 'width': tabWResized});
        } else {
            if (tabWResized >= this.#TAB_MIN_WIDTH)
                tab.css({'left': this.#mouse.x, 'width': tabWResized});

            if (this.#mouse.y > 0 && (tabHResized > (((parseInt(tab.find('.toolbar').css('height')) + 1) + this.#TAB_MIN_HEIGHT))))
                tab.css({'top': this.#mouse.y, 'height': tabHResized});
        }
    }

    /* END RESIZING  */


    #init() {
        let _;
        
        $(window).on('mouseup', (e) => {
            _ = this.mainContainer.find('[resizing="true"]');
            
            if (_.length > 0)
                this.#tabResizingDraggingComplete($(_.offsetParent()), _, (_.attr('dragging') == 'true'));

            // Used to restore the initial values of the buttons
            this.#toolBarBtnsRestore();
        }).on('mousemove', (e) => {
            this.#mouse = {x: e.clientX, y: e.clientY};

            _ = this.mainContainer.find('[resizing="true"]');

            if(_.length != 0) {
                let tab = $(_.offsetParent());
                let dragging = (_.attr('dragging') === 'true');
                let tabProp = {
                    isEnlarged: (tab.attr('enlarged') === 'true'),
                    isMaximized: (tab.attr('maximize') === 'true'),
                    isMinimized: (tab.attr('minimize') === 'true')
                };
                
                if (dragging)
                    this.#enlargmentInit(tab, tabProp);
                else 
                    this.#resizing(tab, tabProp);
            }
        });
    }

    makeFocusable(tab) {
        tab.addClass('focusable');

        this.mainContainer.find('.focusable').on('mousedown', (e) => {
            if (e.which == 1) {
                e.stopPropagation();
                e.stopImmediatePropagation();

                this.#tabFocus($(e.currentTarget));

                // Forces to hide the context menu if it is present
                this.#core.contextMenu.showHideContextMenu(null, false);
            }
        });
    }

    #tabFocus(tab, e = null) {
        let tabs = this.mainContainer.find('.tab').not(tab);
        let tabsCnt = tabs.length;
        const minzIndex = 9999999;
        const maxzIndex = minzIndex + tabsCnt;
    
        // Bring to top the focused tab
        tab.css('z-index', maxzIndex);

        // And behind the remaining non focused tab(s)
        for (let i = tabsCnt - 1; i >= 0; i--) {
            let tJq = $(tabs[i]);
            let tzIndex = parseInt(tJq.css('z-index'));
    
            tJq.css('z-index', tzIndex - 1);
        }

        // Do not disable the pointer events if the click is on a toolbar button
        if (true === (e == null ? true : !this.#clickIsOnAToolbarBtn(e))) {
            // Disables the pointer events for the body element, focused tab and all the tabs iframes
            tab.css({'pointer-events': 'none', 'transform': ''});
            this.mainContainer.find('iframe').css('pointer-events', 'none');
            $('body').css({'pointer-events': 'none', 'user-select': 'none'});
        }
    }

    #toolBarBtnsRestore() { 
        let btns = this.mainContainer.find('._btn');

        $.each(btns, (i, btn) => {
            let _b = $(btn);

            if (_b.attr('active') !== 'true')
                _b.css('background-color', '');

            _b.css('border', '');
        });
    }

    #generateToolbarBtn(tab, symbol, _class, tooltip, hoverColor, callback) {
        let toolbar = tab.find('.toolbar');
        
        toolbar.append(
            $('<button>').attr(
                {
                    'type': 'button',
                    'class': `_btn ${_class}`,
                    'title': tooltip
                }
            ).css('top', `${(this.#TOOLBAR_MIN_HEIGHT / 2) - 15}px`)
            .on('mousedown', (e) => {
                if (e.which == 1) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    $(e.currentTarget).css({ 'border': '1px solid', 'background-color': hoverColor});

                    // Manually trigger the focus tab method
                    this.#tabFocus($(e.currentTarget).offsetParent(), e);
                }
            })
            .on('click', (e) => { callback($(e.currentTarget).offsetParent()); })
            .append($('<span>').addClass('__btn').text(symbol))
        );
    }

    generateToolbar(tabId) {
        let tab = this.#helper.getTab(tabId).element;

        tab.prepend(
            $($('<div>').css(
                {
                    'min-height': `${this.#TOOLBAR_MIN_HEIGHT}px`,
                    'background-color': this.settings.get('toolbarBgColor'),
                    'border-bottom': this.settings.get('tabBorder')
                }
            ).attr('class', 'toolbar'))
            .on('mousedown', (e) => {
                if (e.which == 1 && this.#clickIsOnAToolbarBtn(e) == false) {
                    let _ = $(e.currentTarget);
                    let tab = $(_.offsetParent());

                    _.css('cursor', 'grabbing');
                    _.attr(
                        {
                            'resizing': true,
                            'dragging': true,
                            'offset-x': tab.position().left - e.clientX,
                            'offset-y': tab.position().top - e.clientY
                        }
                    );
                }
            })
        );

        this.#generateToolbarBtn(tab, 'X', 'close-btn', 'Close', '#e25260', (t) => { this.#core.destroy(t); });
        this.#generateToolbarBtn(tab, '▭', 'maximize-btn', 'Maximize', '#757575', (t) => { this.#tabToolbarResizerBtnsClicked(t, 'maximize-btn'); });
        this.#generateToolbarBtn(tab, '—', 'minimize-btn', 'Minimize', '#757575', (t) => { this.#tabToolbarResizerBtnsClicked(t, 'minimize-btn'); });
        //this.#generateToolbarBtn(tab, '⇀', 'hide-btn', 'Hide', '#757575', (t) => { this.tabToolbarHideBtnClicked(t); });
    }

    #getToolbarH(tabId) { return parseInt(this.#helper.getTab(tabId).element.find('.toolbar').css('height')); }

    generateResizableBorders(tabId) {
        let tab = this.#helper.getTab(tabId).element;

        let directions = {
            'resize-top': 'top',
            'resize-top-right': 'top-right',
            'resize-right': 'right',
            'resize-bottom-right': 'bottom-right',
            'resize-bottom': 'bottom',
            'resize-bottom-left': 'bottom-left',
            'resize-left': 'left',
            'resize-top-left': 'top-left'
        };

        for(let dir in directions) {
            tab.append(
                $($($('<div>').attr('class', dir)).on('mousedown', (e) => {
                    $(e.currentTarget).attr(
                        this.#resizableBordersOnClickDataAttr($(e.currentTarget).offsetParent(), directions[dir])
                    );
                })) 
            );
        }
    }

    #resizableBordersOnClickDataAttr(_, direction) {
        return {
            'resizing': true,
            'resizing-border': direction,
            'tab-top': parseInt(_.css('top')),
            'tab-left': parseInt(_.css('left')),
            'tab-width': _.width(),
            'tab-height': _.height()
        }
    }

    fixIframeHeight(tabId, tabEl) { tabEl.find('iframe').css('height', `calc(100% - ${this.#getToolbarH(tabId)}px)`); }

    #tabResizingDraggingComplete(tab, toolbar, dragging) {
        // Global mouse up callback event //

        let win = this.#getWindow;
        let tabEnlarged = (tab.attr('enlarged') === 'true');

        // Enables the pointer events for the iframe
        tab.css('pointer-events', '');
        this.mainContainer.find('iframe[style*="pointer-events: none;"]').css('pointer-events', '');
        this.#bodyHTML.css({'pointer-events': '', 'user-select': 'auto'});

        if (dragging) {
            let mouseOffsetClickX = parseInt(toolbar.attr('offset-x'));
            let mouseOffsetClickY = parseInt(toolbar.attr('offset-y'));
            let mouseOffsetCurrentX = tab.position().left - this.#mouse.x;
            let mouseOffsetCurrentY = tab.position().top - this.#mouse.y;
            
            toolbar.css('cursor', 'grab');
            toolbar.removeAttr('resizing dragging offset-x offset-y');

            // If the tab is enlarged, we must assure that when the mouseup fires the tab has been dragged from the edge
            if (tabEnlarged && (mouseOffsetClickX != mouseOffsetCurrentX && mouseOffsetClickY != mouseOffsetCurrentY)) {
                if (this.#mouse.y > 0 && this.#mouse.x != 0 && this.#mouse.x < win.w) {
                    tab.css('transition', ''); // Removes the transition on mouseup in order to avoid problems while resizing the tab
                    tab.removeAttr('enlarged original-width original-height');
                    tab.removeClass('tab-enlarged');

                    // If custom transitition duration, we must remove the css
                    if (this.#ENLARGED_ANIMATION_SPEED != 500)
                        tab.css('transition', '');
                }
            }

            // On mouse up when mouse near edges
            // Resizes the tab based on the edge (like Windows OS) with animations
            if (this.#mouse.y <= 0 || this.#mouse.y >= win.h || this.#mouse.x <= 0 || this.#mouse.x >= win.w) {
                //$(window).css()

                if (tab.find('.toolbar').find('[active="true"]').length > 0) {
                    this.#helper.showMessage("You can't enlarge a tab while it is either maximized or minimized...");
                 
                    // Because the mouse can go outside the window, we are going to use the enlargments class of the preview animation
                    // in order to place back the tab to the most correct position on the screen
                    let previewEnlargmentEl = this.mainContainer.find('.tab-enlargment-pre-effect');
                    let posByEnlargmentEffect = previewEnlargmentEl.attr('class').split(' ')[2];
                    previewEnlargmentEl.remove();
                    tab.css({'top': '', 'left': ''});
                    // We add the class just to save the top/left values
                    tab.addClass(posByEnlargmentEffect);
                    let top = parseInt(tab.css('top'));
                    let left = parseInt(tab.css('left'));
                    tab.removeClass(posByEnlargmentEffect);

                    tab.css({'top': top, 'left': left});
                } else
                    this.#enlargeTab(tab);
            }
        } else
            toolbar.removeAttr('resizing resizing-border tab-top tab-left tab-width tab-height');
    }

    #clickIsOnAToolbarBtn(e) { return $(e.target).hasClasses('_btn __btn'); }

    #tabToolbarResizerBtnsClicked(tab, btnClass, restoreOriginalDimensions = true) {
        let firstCharToCapital = (str) => { return str.charAt(0).toUpperCase() + str.slice(1); };

        let action = btnClass.split('-')[0];
        let btn = tab.find(`.${btnClass}`);

        ['minimize', 'maximize'].forEach((e) => {
            if (e !== action) {
                tab.removeAttr(e);
                tab.find(`.${e}-btn`)
                   .css('background-color', '')
                   .removeAttr('active')
                   .attr('title', firstCharToCapital(e));
            }
        });

        tab.find('.toolbar').find('[active="true"]').css('background-color', '').removeAttr('active');

        if (tab.attr('enlarged') === 'true') {
            this.#helper.showMessage(`You can't ${action} a tab while it is enlarged!`);
            return null;
        }

        if (tab.attr(action) != 'true') {
            if (tab.attr('original-height') === undefined) 
                tab.attr({'original-width': tab.width(), 'original-height': tab.height()});

            if (action == 'maximize') {
                tab.css({'top': 0, 'left': 0, 'width': '100%', 'height': '100%' });

                btn.attr({'active': true, 'title': 'Maximized - Click to restore the last dimensions'});
            } else if (action == 'minimize') {
                tab.attr('title', tab.find('iframe').attr('src'));

                tab.css({
                    'left': tab.position().left + (tab.width() / 2), // After the minimization, show the tab at the center of his original width
                    'width': this.#TAB_MIN_WIDTH,
                    'height': (((parseInt(tab.find('.toolbar').css('height')) + 1) + this.#TAB_MIN_HEIGHT))
                })

                btn.attr({'active': true, 'title': 'Minimized - Click to restore the last dimensions'});

                if (parseInt(tab.css('left')) <= 0)
                    tab.css('left', 0);
            }


            btn.css('background-color', '#757575');
            tab.attr(action, true);
        } else {
            if (restoreOriginalDimensions) {
                let origW = parseInt(tab.attr('original-width'));
                let origH = parseInt(tab.attr('original-height'));
                let offsetX = this.#mouse.x - (origW / 2);
                let offsetY = this.#mouse.y - 10;
        
                tab.css({
                    'left': offsetX, 'top': offsetY,
                    'width': origW, 'height': origH
                });
            }
            
            tab.removeAttr(`${action} original-width original-height title`);
            btn.css('background-color', '').attr('title', firstCharToCapital(action))
            .removeAttr('active');
        }
    }

    tabToolbarHideBtnClicked(tab) {
        let isHidden = tab.hasAttr('_hidden');

        if (isHidden) {
            tab.css('display', '');
            tab.removeAttr('_hidden');
        } else {
            tab.css('display', 'none');
            tab.attr('_hidden', true);
        }
    }
};