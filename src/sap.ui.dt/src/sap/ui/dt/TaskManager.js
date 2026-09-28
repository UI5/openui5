/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/util/isPlainObject"
],
function(
	ManagedObject,
	isPlainObject
) {
	"use strict";
	/**
	 * Constructor for a new TaskManager.
	 *
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The TaskManager keeps list of task and allows to manage them via simple API.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.54
	 * @alias sap.ui.dt.TaskManager
	 */
	var TaskManager = ManagedObject.extend("sap.ui.dt.TaskManager", {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				suppressEvents: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				add: {
					parameters: {
						taskId: "int"
					}
				},
				complete: {
					parameters: {
						taskId: "array"
					}
				}
			}
		},
		constructor: function(...aArgs) {
			ManagedObject.apply(this, aArgs);
			// Each list maps a task type to a Map of task id -> task. Using a Map per type keeps
			// insertion order (so tasks run in the order they were added) while allowing O(1)
			// completion by id, instead of filtering an array on every complete() call.
			this._mQueuedTasks = {};
			this._mPendingTasks = {};
			// Index: task id -> task type. The type never changes after a task is added, so this
			// stays valid even when a task moves from the queued to the pending list. It lets
			// complete() locate the owning type bucket in O(1) without scanning all buckets.
			this._mTaskIdToType = {};
		},
		/**
		 * IDs counter
		 * @type {number}
		 * @private
		 */
		_iNextId: 0,
		_iTaskCounter: 0
	});

	function validateTask(mTask) {
		if (
			!isPlainObject(mTask)
			|| !mTask.type
			|| typeof mTask.type !== "string"
		) {
			throw new Error("Invalid task specified");
		}
	}

	function getTaskIdentifierFunction(vTaskIdentifier) {
		let fnTaskIdentifier;
		if (typeof vTaskIdentifier === "string") {
			fnTaskIdentifier = (mTask) => mTask[vTaskIdentifier];
		} else if (typeof vTaskIdentifier === "function") {
			fnTaskIdentifier = vTaskIdentifier;
		} else {
			throw new Error("Validator needs to be a function or a string");
		}
		return fnTaskIdentifier;
	}

	/**
	 * Removes a task from the given list and keeps the counter and the id->type index in sync.
	 * @param {object} mTask - Task to be removed
	 * @param {string} sListName - Name of the list (<code>_mQueuedTasks</code> or <code>_mPendingTasks</code>)
	 * @private
	 */
	TaskManager.prototype._deleteTask = function(mTask, sListName) {
		const mBucket = this[sListName][mTask.type];
		if (mBucket && mBucket.delete(mTask.id)) {
			this._iTaskCounter--;
			delete this._mTaskIdToType[mTask.id];
		}
	};

	TaskManager.prototype._removeTasksByIdentifier = function(mTask, vTaskIdentifier, sListName) {
		if (vTaskIdentifier) {
			const fnTaskIdentifier = getTaskIdentifierFunction(vTaskIdentifier);
			const sNewTaskIdentifier = fnTaskIdentifier(mTask);
			const mBucket = this[sListName][mTask.type];
			if (mBucket && sNewTaskIdentifier) {
				[...mBucket.values()].forEach((mLocalTask) => {
					if (fnTaskIdentifier(mLocalTask) === sNewTaskIdentifier) {
						this._deleteTask(mLocalTask, sListName);
					}
				});
			}
		}
	};

	TaskManager.prototype._removeTaskById = function(iTaskId, sType) {
		const mTask = { id: iTaskId, type: sType };
		this._deleteTask(mTask, "_mQueuedTasks");
		this._deleteTask(mTask, "_mPendingTasks");
	};

	TaskManager.prototype._addTask = function(mTask) {
		const iTaskId = this._iNextId++;
		this._mQueuedTasks[mTask.type] ||= new Map();
		this._mQueuedTasks[mTask.type].set(iTaskId, { ...mTask, id: iTaskId });
		this._mTaskIdToType[iTaskId] = mTask.type;
		this._iTaskCounter++;
		if (!this.getSuppressEvents()) {
			this.fireAdd({
				taskId: iTaskId
			});
		}
		return iTaskId;
	};

	/**
	 * Adds new task into the list.
	 * @param {object} mTask - Task definition map
	 * @param {string} mTask.type - Task type
	 * @param {function|string} [vDoubleIdentifier] - Identifier for outdated tasks in <code>TaskManager</code>. The identifier is invoked for each element in task list to generate
	 * the criterion by which the existing tasks are compared with the new one. The existing tasks that are identified
	 * by <code>vDoubleIdentifier</code> are removed before adding the new task.
	 * @return {number} Task ID
	 */
	TaskManager.prototype.add = function(mTask, vDoubleIdentifier) {
		validateTask(mTask);
		this._removeTasksByIdentifier(mTask, vDoubleIdentifier, "_mQueuedTasks");
		return this._addTask(mTask);
	};

	/**
	 * Completes the task by its ID
	 * @param {number} iTaskId - Task ID
	 */
	TaskManager.prototype.complete = function(iTaskId) {
		const sType = this._mTaskIdToType[iTaskId];
		if (sType !== undefined) {
			this._removeTaskById(iTaskId, sType);
		}
		if (!this.getSuppressEvents()) {
			this.fireComplete({
				taskId: [iTaskId]
			});
		}
	};

	/**
	 * Completes the tasks by the task definition. It is also possible to filter
	 * by parts of the existing task definitions.
	 * @param {object} mTask - Task definition map
	 * @param {object} mTask.type - Task type
	 */
	TaskManager.prototype.completeBy = function(mTask) {
		validateTask(mTask);
		const aCompletedTaskIds = [];
		// TODO: get rid of filtering other task parameters then type for performance reasons
		const removeTasksByDefinition = (sListName) => {
			const mBucket = this[sListName][mTask.type];
			if (!mBucket) {
				return;
			}
			[...mBucket.values()].forEach((mLocalTask) => {
				const bCompleteTask = Object.keys(mTask).every(
					(sKey) => mLocalTask[sKey] && mLocalTask[sKey] === mTask[sKey]
				);
				if (bCompleteTask) {
					aCompletedTaskIds.push(mLocalTask.id);
					this._deleteTask(mLocalTask, sListName);
				}
			});
		};
		removeTasksByDefinition("_mQueuedTasks");
		removeTasksByDefinition("_mPendingTasks");
		if (!this.getSuppressEvents()) {
			this.fireComplete({
				taskId: aCompletedTaskIds
			});
		}
	};

	/**
	 * Cancels the task by its ID
	 * @param {number} iTaskId - Task ID
	 */
	TaskManager.prototype.cancel = function(iTaskId) {
		this.complete(iTaskId);
	};

	/**
	 * Cancels the task typespecific by its parameters defined by the callbackfunction
	 *
	 * @param {object} mTask - Task definition map
	 * @param {string} mTask.type - Task type
	 * @param {string} sTaskIdentifier - Identifier for tasks in <code>TaskManager</code> related to the specific task type.
	 *  The existing tasks that are identified by <code>sTaskIdentifier</code> are removed
	 */
	TaskManager.prototype.cancelBy = function(mTask, sTaskIdentifier) {
		this._removeTasksByIdentifier(mTask, sTaskIdentifier, "_mQueuedTasks");
		this._removeTasksByIdentifier(mTask, sTaskIdentifier, "_mPendingTasks");
	};

	/**
	 * Checks if the queue is empty
	 * @return {boolean} <code>true</code> if there is no pending task
	 */
	TaskManager.prototype.isEmpty = function() {
		return this._iTaskCounter === 0;
	};

	/**
	 * Returns amount of the tasks in the queue
	 * @param {string} [sType] - type of pending tasks to be counted. When <code>undefined</code> the count will be returned for all tasks
	 * @return {number} Amount of tasks
	 */
	TaskManager.prototype.count = function(sType) {
		return this.getList(sType).length;
	};

	TaskManager.prototype._markAsPending = function(sType, aTasks) {
		this._mPendingTasks[sType] ||= new Map();
		aTasks.forEach(function(mTask) {
			this._mPendingTasks[sType].set(mTask.id, mTask);
		}, this);
		this._mQueuedTasks[sType] = new Map();
	};

	TaskManager.prototype._getTypedList = function(sTaskType, bMarkAsPending) {
		let aTasks = [];
		if (this._mQueuedTasks[sTaskType]) {
			aTasks = [...this._mQueuedTasks[sTaskType].values()];
		}
		if (bMarkAsPending) {
			this._markAsPending(sTaskType, aTasks);
		} else if (this._mPendingTasks[sTaskType]) {
			aTasks = aTasks.concat([...this._mPendingTasks[sTaskType].values()]);
		}
		return aTasks;
	};

	TaskManager.prototype._getAllTasks = function(bMarkAsPending) {
		let aAllTasks = [];
		aAllTasks = Object.keys(this._mQueuedTasks).reduce(function(aResult, _sType) {
			aResult = aResult.concat([...this._mQueuedTasks[_sType].values()]);
			if (bMarkAsPending) {
				this._markAsPending(_sType, [...this._mQueuedTasks[_sType].values()]);
			}
			return aResult;
		}.bind(this), []);
		if (!bMarkAsPending) {
			aAllTasks = aAllTasks.concat(
				Object.keys(this._mPendingTasks).reduce(function(aResult, _sType) {
					return aResult.concat([...this._mPendingTasks[_sType].values()]);
				}.bind(this), [])
			);
		}
		return aAllTasks;
	};

	/**
	 * Returns list of tasks.
	 * @param {string} [sType] - type of tasks to be returned. When <code>undefined</code> all tasks will be returned
	 * @return {array} List copy of pending tasks
	 */
	TaskManager.prototype.getList = function(sType) {
		if (sType) {
			return this._getTypedList(sType, false);
		}
		return this._getAllTasks(false);
	};

	/**
	 * Returns list of open (queued) tasks that are not pending yet and mark them as pending. Another call of this function
	 * would not longer return the tasks from the first call. Although they are not yet completed.
	 * @param {string} [sType] - type of tasks to be returned. When <code>undefined</code> all open (queued) tasks will be returned
	 * @return {array} List copy of open (queued) tasks
	 */
	TaskManager.prototype.getQueuedTasks = function(sType) {
		if (sType) {
			return this._getTypedList(sType, true);
		}
		return this._getAllTasks(true);
	};

	/**
	 * @override
	 */
	TaskManager.prototype.destroy = function(...aArgs) {
		this.setSuppressEvents(true);
		this.getList().forEach(function(oTask) {
			this.cancel(oTask.id);
		}, this);
		ManagedObject.prototype.destroy.apply(this, aArgs);
	};

	return TaskManager;
});
