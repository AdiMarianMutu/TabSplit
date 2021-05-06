let Tab = {
    Core: null,
    UI: null,
    Helper: null,
    Debug: null,
    _$: class _$ { // Parent class
        settings;
        mainContainer;
        tabs = [];
    
        updateTabsArray(newTabId, newTabEl) {
            // When newTabId is null means that we want to push a complete new array
            // This will happen when a tab is destroyed
            if (newTabId == null)
                this.tabs = newTabEl; // newTabEl in this context is the new tabs array
            else
                this.tabs.push({
                    'id': newTabId,
                    'element': newTabEl
                });
        }
    }
};