/*!
 * ${copyright}
 */

sap.ui.define([
	"./SortFlex",
	"./ConditionFlex",
	"./GroupFlex"
], (
	SortFlex,
	ConditionFlex,
	GroupFlex
) => {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		removeSort: SortFlex.removeSort,
		addSort: SortFlex.addSort,
		moveSort: SortFlex.moveSort,
		addCondition: ConditionFlex.addCondition,
		removeCondition: ConditionFlex.removeCondition,
		removeGroup: GroupFlex.removeGroup,
		addGroup: GroupFlex.addGroup,
		moveGroup: GroupFlex.moveGroup
	};

});
