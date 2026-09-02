/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/commands/RenameVisualization",
	"sap/ui/rta/util/changeVisualization/commands/MoveVisualization",
	"sap/ui/rta/util/changeVisualization/commands/CombineVisualization",
	"sap/ui/rta/util/changeVisualization/commands/SplitVisualization",
	"sap/ui/rta/util/changeVisualization/commands/CreateContainerVisualization",
	"sap/ui/rta/util/changeVisualization/commands/AddIFrameVisualization"
], function(
	RenameVisualization,
	MoveVisualization,
	CombineVisualization,
	SplitVisualization,
	CreateContainerVisualization,
	AddIFrameVisualization
) {
	"use strict";

	const mCommands = {
		rename: RenameVisualization,
		move: MoveVisualization,
		combine: CombineVisualization,
		split: SplitVisualization,
		createContainer: CreateContainerVisualization,
		addIFrame: AddIFrameVisualization
	};

	return function(mIndicatorInformation) {
		let sCommandName = mIndicatorInformation.commandName;

		// Settings commands can be assigned to existing categories
		// (e.g. "move" to display the "Show Source" button)
		if (sCommandName === "settings") {
			sCommandName = mIndicatorInformation.changeCategory;
		}
		return mCommands[sCommandName];
	};
});