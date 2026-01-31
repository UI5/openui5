sap.ui.require([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Lib",
	"sap/m/Shell",
	"sap/ui/core/Component",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(ComponentContainer, Lib, Shell, Component, Storage, FlUtils, sinon) {
	"use strict";

	const oSandbox = sinon.createSandbox();
	const oStub = oSandbox.stub(sap.ui, "require");
	oStub.withArgs(["sap/ushell/api/RTA"]).callsFake((_, fnSuccess) => fnSuccess({}));
	oStub.callThrough();
	oSandbox.stub(FlUtils, "getUShellService").resolves();
	oSandbox.stub(FlUtils, "getUshellContainer").callsFake(() => ({
		getLogonSystem: () => ({ isTrial: () => false })
	}));
	oSandbox.stub(Storage, "loadFeatures").resolves({
		isKeyUser: true,
		isVersioningEnabled: true
	});

	let oContainer;
	let oShell;
	async function createComponentAndContainer() {
		const oComponent = await Component.create({
			id: "RTAReloadContainer",
			name: "sap.ui.rta.rtaReload",
			manifest: true
		});
		return new ComponentContainer({
			id: "componentContainerRTAReload",
			component: oComponent
		});
	}

	let trigger;
	// Called by app when buttion is pressed
	sap.ui.predefine("onStartAdaptation", [], function() {
		return () => {
			trigger.triggerStartRta();
		};
	});

	oSandbox.stub(FlUtils, "getUShellServices").resolves({
		AppLifeCycle: {
			async reloadCurrentApp() {
				// Simplified logic as in ushell AppLifeCycle
				window.reloaded = true;
				await trigger.triggerStopRta();
				oContainer.getComponentInstance().destroy();
				oContainer.destroy(); // Container must be recreated to avoid rerender issues
				// eslint-disable-next-line require-atomic-updates
				oContainer = await createComponentAndContainer();
				oShell.setApp(oContainer);

				trigger.onAppLoaded();
			}
		}
	});

	window.startUp = async function() {
		oContainer = await createComponentAndContainer();

		trigger = new Trigger(oContainer);
		oShell = new Shell({
			id: "shellRTAReload",
			app: oContainer
		});
		oShell.placeAt("content");
	};

	// Simplified version of sap/ushell/appRuntime/ui5/plugins/baseRta/Trigger
	const STATUS_STARTING = "STARTING";
	const STATUS_STARTED = "STARTED";
	const STATUS_STOPPING = "STOPPING";
	const STATUS_STOPPED = "STOPPED";
	const Trigger = function(oContainer) {
		this.sStatus = STATUS_STOPPED;
		this.oStartingPromise = null;
		this.oStoppingPromise = null;
		this.oContainer = oContainer;
	};
	Trigger.prototype.exitRta = function() {
		if (this._oRTA) {
			this._oRTA.destroy();
			this.sStatus = STATUS_STOPPED;
			this.oStartingPromise = null;
			this.oStoppingPromise = null;
			this._oRTA = null;
		}
	};

	function requireStartAdaptation() {
		return new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/rta/api/startAdaptation"], resolve, reject);
		});
	}
	Trigger.prototype.triggerStartRta = async function() {
		var { sStatus } = this;

		switch (sStatus) {
			case STATUS_STARTING:
				break;
			case STATUS_STARTED:
				this.oStartingPromise = Promise.resolve();
				break;
			case STATUS_STOPPING:
				await this.oStoppingPromise;
				this.oStartingPromise = this._startRta();
				break;
			case STATUS_STOPPED:
				this.oStartingPromise = this._startRta();
				break;
			default:
		}

		if (sStatus !== STATUS_STARTING) {
			this.oStartingPromise.then(function() {
				this.oStartingPromise = null;
			}.bind(this));
		}
		return this.oStartingPromise;
	};

	Trigger.prototype._startRta = async function() {
		this.sStatus = STATUS_STARTING;

		await Lib.load({ name: "sap.ui.rta" });

		const startAdaptation = await requireStartAdaptation();

		var mOptions = {
			rootControl: this.oContainer.getComponentInstance(),
			flexSettings: {
				layer: "CUSTOMER",
				developerMode: false
			}
		};

		try {
			this._oRTA = await startAdaptation(
				mOptions,
				async () => {}, // Load plugins
				() => {}, // onStart
				() => {}, // onError
				this.exitRta.bind(this) // onStop
			);

			this.sStatus = STATUS_STARTED;
		} catch (vError) {
			// Might happen e.g. when a reload is triggered during RTA startup
			this.sStatus = STATUS_STOPPED;
		}
	};

	Trigger.prototype.triggerStopRta = function(...args) {
		const { sStatus } = this;
		switch (sStatus) {
			case STATUS_STARTING:
				this.oStoppingPromise = this.oStartingPromise.then(function() {
					return this._stopRta(...args);
				}.bind(this));
				break;
			case STATUS_STARTED:
				this.oStoppingPromise = this._stopRta(...args);
				break;
			case STATUS_STOPPING:
				break;
			case STATUS_STOPPED:
				this.oStoppingPromise = Promise.resolve();
				break;
			default:
		}

		if (sStatus !== STATUS_STOPPING) {
			this.oStoppingPromise.then(() => {
				this.oStoppingPromise = null;
			});
		}
		return this.oStoppingPromise;
	};

	Trigger.prototype._stopRta = async function(...args) {
		if (this.sStatus === STATUS_STARTING) {
			await this.oStartingPromise;
		}
		// If RTA failed to start (e.g. due to reload) _oRTA is not set
		if (!this._oRTA) {
			this.sStatus = STATUS_STOPPED;
			return undefined;
		}
		this.sStatus = STATUS_STOPPING;
		await this._oRTA.stop(...args);
		return this.exitRta();
	};

	// From sap/ushell/appRuntime/ui5/plugins/baseRta/CheckConditions
	Trigger.prototype.checkRestartRTA = function() {
		const sLayer = "CUSTOMER";
		return !!window.sessionStorage.getItem(`sap.ui.rta.restart.${sLayer}`);
	};

	Trigger.prototype.onAppLoaded = function() {
		if (this.checkRestartRTA()) {
			this.triggerStartRta();
		}
	};
});