/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/rta/command/ManifestCommand"
], function(
	Lib,
	ManifestCommand
) {
	"use strict";

	/**
	 * Implementation of a command for Add Library change on Manifest
	 *
	 * @class
	 * @extends sap.ui.rta.command.ManifestCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.49
	 * @alias sap.ui.rta.command.manifest.AddLibrary
	 */
	const AddLibrary = ManifestCommand.extend("sap.ui.rta.command.manifest.AddLibrary", {
		metadata: {
			library: "sap.ui.rta",
			events: {}
		}
	});

	AddLibrary.prototype.init = function() {
		this.setChangeType("appdescr_ui5_addLibraries");
	};

	/**
	 * Execute the change (load the required libraries)
	 * @return {Promise} Resolves if libraries could be loaded; rejects if not
	 */
	AddLibrary.prototype.execute = function() {
		if (this.getParameters().libraries) {
			const aLibraries = Object.keys(this.getParameters().libraries);
			return Promise.all(aLibraries.map((sLibrary) => Lib.load({ name: sLibrary })));
		}

		return Promise.resolve();
	};

	return AddLibrary;
});