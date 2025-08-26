/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
],
function(
	FlexCommand
) {
	"use strict";

	/**
	 * Move Element from one place to another
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Move
	 */
	const Move = FlexCommand.extend("sap.ui.rta.command.Move", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				movedElements: {
					type: "any[]",
					group: "content"
				},
				target: {
					type: "any",
					group: "content"
				},
				source: {
					type: "any",
					group: "content"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	Move.prototype._getChangeSpecificData = function() {
		const mSource = this.getSource();
		const mTarget = this.getTarget();

		// replace elements by their id, unify format and help with serialization
		if (mSource.parent) {
			mSource.id = mSource.parent.getId();
			delete mSource.parent;
		}
		if (mTarget.parent) {
			mTarget.id = mTarget.parent.getId();
			delete mTarget.parent;
		}
		const mSpecificInfo = {
			changeType: this.getChangeType(),
			content: {
				source: mSource,
				target: mTarget,
				movedElements: []
			}
		};

		this.getMovedElements().forEach(function(mMovedElement) {
			mSpecificInfo.content.movedElements.push({
				id: mMovedElement.id || (mMovedElement.element && mMovedElement.element.getId()),
				sourceIndex: mMovedElement.sourceIndex,
				targetIndex: mMovedElement.targetIndex
			});
		});
		return mSpecificInfo;
	};

	return Move;
});