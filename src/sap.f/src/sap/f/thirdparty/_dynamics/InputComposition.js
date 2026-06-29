sap.ui.define(['exports'], (function (exports) { 'use strict';

    class InputComposition {
        constructor(component) {
            this._onComposition = () => {
                this._component.updateCompositionState(true);
            };
            this._onCompositionEnd = () => {
                this._component.updateCompositionState(false);
            };
            this._component = component;
        }
        addEventListeners() {
            const el = this._component.getInputEl();
            if (!el) {
                return;
            }
            el.addEventListener("compositionstart", this._onComposition);
            el.addEventListener("compositionupdate", this._onComposition);
            el.addEventListener("compositionend", this._onCompositionEnd);
        }
        removeEventListeners() {
            const el = this._component.getInputEl();
            if (!el) {
                return;
            }
            el.removeEventListener("compositionstart", this._onComposition);
            el.removeEventListener("compositionupdate", this._onComposition);
            el.removeEventListener("compositionend", this._onCompositionEnd);
        }
    }

    exports.default = InputComposition;

}));
