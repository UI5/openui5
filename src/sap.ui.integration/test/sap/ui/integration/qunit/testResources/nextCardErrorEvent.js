sap.ui.define([], () => {
	"use strict";

	return (card) => {
		const {resolve, promise} = Promise.withResolvers();

		card.attachEventOnce("_error", resolve);

		return promise;
	};
});