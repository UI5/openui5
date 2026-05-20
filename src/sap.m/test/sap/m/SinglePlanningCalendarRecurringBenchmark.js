// Note: the HTML page 'SinglePlanningCalendarRecurringBenchmark.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/SinglePlanningCalendar",
	"sap/m/SinglePlanningCalendarDayView",
	"sap/m/SinglePlanningCalendarWeekView",
	"sap/m/SinglePlanningCalendarWorkWeekView",
	"sap/m/SinglePlanningCalendarMonthView",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/unified/RecurringCalendarAppointment",
	"sap/ui/unified/RecurrenceRule",
	"sap/ui/core/date/UI5Date"
], (SinglePlanningCalendar, DayView, WeekView, WorkWeekView, MonthView, nextUIUpdate, CalendarAppointment, RecurringCalendarAppointment, RecurrenceRule, UI5Date) => {
	"use strict";

	const aColors = ["Type01","Type02","Type03","Type04","Type05","Type06","Type07","Type08","Type09"];

	// ──────────────────────────────────────────────
	// Data generation (pre-created, outside timing)
	// ──────────────────────────────────────────────

	const fnGenerateExpandedAppointments = (iSeriesCount, oStartDate, oEndDate) => {
		const aApps = [];
		for (let iSeries = 0; iSeries < iSeriesCount; iSeries++) {
			const iHour = 8 + (iSeries % 10);
			const iDay = iSeries % 7;
			const oCurrent = UI5Date.getInstance(oStartDate);
			while (oCurrent.getDay() !== iDay) {
				oCurrent.setDate(oCurrent.getDate() + 1);
			}
			while (oCurrent <= oEndDate) {
				aApps.push(new CalendarAppointment({
					title: `Meeting ${iSeries + 1}`,
					text: `Weekly series ${iSeries + 1}`,
					type: aColors[iSeries % aColors.length],
					startDate: UI5Date.getInstance(oCurrent.getFullYear(), oCurrent.getMonth(), oCurrent.getDate(), iHour, 0),
					endDate: UI5Date.getInstance(oCurrent.getFullYear(), oCurrent.getMonth(), oCurrent.getDate(), iHour + 1, 0)
				}));
				oCurrent.setDate(oCurrent.getDate() + 7);
			}
		}
		return aApps;
	};

	const fnGenerateRecurringAppointments = (iSeriesCount, oStartDate, oEndDate) => {
		const aApps = [];
		for (let iSeries = 0; iSeries < iSeriesCount; iSeries++) {
			const iHour = 8 + (iSeries % 10);
			const iDay = iSeries % 7;
			const oSeriesStart = UI5Date.getInstance(oStartDate);
			while (oSeriesStart.getDay() !== iDay) {
				oSeriesStart.setDate(oSeriesStart.getDate() + 1);
			}
			aApps.push(new RecurringCalendarAppointment({
				title: `Meeting ${iSeries + 1}`,
				text: `Weekly series ${iSeries + 1}`,
				type: aColors[iSeries % aColors.length],
				startDate: UI5Date.getInstance(oSeriesStart.getFullYear(), oSeriesStart.getMonth(), oSeriesStart.getDate(), iHour, 0),
				endDate: UI5Date.getInstance(oSeriesStart.getFullYear(), oSeriesStart.getMonth(), oSeriesStart.getDate(), iHour + 1, 0),
				recurrenceType: "Weekly",
				recurrencePattern: 1,
				recurrenceEndDate: oEndDate,
				recurrenceRule: new RecurrenceRule({ days: [iDay] })
			}));
		}
		return aApps;
	};

	// ──────────────────────────────────────────────
	// Benchmark helpers
	// ──────────────────────────────────────────────

	/** Wait for browser to paint, then resolve */
	const fnNextFrame = () => new Promise((fnResolve) => {
		requestAnimationFrame(() => requestAnimationFrame(fnResolve));
	});

	/** Measure full flow including browser layout/paint (ms).
	 *  Uses double rAF to ensure at least one full frame has been painted
	 *  before reading the total elapsed time.
	 */
	const fnMeasureWithPaint = (fnAction) => {
		const fStart = performance.now();
		fnAction();
		const fSync = performance.now() - fStart;
		return new Promise((fnResolve) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					fnResolve({ sync: fSync, total: performance.now() - fStart });
				});
			});
		});
	};

	const fnMedian = (aValues) => {
		const aSorted = aValues.slice().sort((a, b) => a - b);
		return aSorted[Math.floor(aSorted.length / 2)];
	};

	const fnAvg = (aValues) => aValues.reduce((fSum, fVal) => fSum + fVal, 0) / aValues.length;

	const fnSetStatus = (sText) => {
		document.getElementById("status").textContent = sText;
	};

	const fnSetCanvasLabel = (sText) => {
		document.getElementById("canvasLabel").textContent = sText;
	};

	const fnFmt = (fMs) => fMs < 1 ? fMs.toFixed(3) : fMs.toFixed(2);

	// ──────────────────────────────────────────────
	// Results rendering
	// ──────────────────────────────────────────────

	const fnMakeStats = (aSyncArr, aTotalArr) => ({
		sync: { median: fnMedian(aSyncArr), avg: fnAvg(aSyncArr), min: Math.min(...aSyncArr), max: Math.max(...aSyncArr) },
		total: { median: fnMedian(aTotalArr), avg: fnAvg(aTotalArr), min: Math.min(...aTotalArr), max: Math.max(...aTotalArr) }
	});

	const fnRenderTable = (aRows, sTitle) => {
		const oResultsEl = document.getElementById("results");
		let sHtml = `<div class="benchmark-panel"><div class="benchmark-header">${sTitle}</div>`;
		sHtml += '<table><thead><tr><th>Scenario</th><th colspan="4" style="text-align:center">UI5 Sync (ms)</th><th colspan="4" style="text-align:center">Total incl. Paint (ms)</th><th>Objects</th></tr>';
		sHtml += '<tr><th></th><th>Median</th><th>Avg</th><th>Min</th><th>Max</th><th>Median</th><th>Avg</th><th>Min</th><th>Max</th><th></th></tr></thead><tbody>';
		aRows.forEach((oRow) => {
			sHtml += `<tr><td>${oRow.label}</td>`;
			sHtml += `<td>${fnFmt(oRow.sync.median)}</td><td>${fnFmt(oRow.sync.avg)}</td><td>${fnFmt(oRow.sync.min)}</td><td>${fnFmt(oRow.sync.max)}</td>`;
			sHtml += `<td><strong>${fnFmt(oRow.total.median)}</strong></td><td>${fnFmt(oRow.total.avg)}</td><td>${fnFmt(oRow.total.min)}</td><td>${fnFmt(oRow.total.max)}</td>`;
			sHtml += `<td>${oRow.count}</td></tr>`;
		});
		sHtml += '</tbody></table>';
		if (aRows.length === 2) {
			const fSyncRatio = aRows[0].sync.median / aRows[1].sync.median;
			const fTotalRatio = aRows[0].total.median / aRows[1].total.median;
			sHtml += '<div class="summary">';
			if (fTotalRatio > 1) {
				sHtml += `<strong class="winner">Recurring is ${fTotalRatio.toFixed(1)}x faster (total) / ${fSyncRatio.toFixed(1)}x (sync)</strong>`;
			} else {
				sHtml += `<strong class="neutral">Similar performance — total: ${(1 / fTotalRatio).toFixed(1)}x, sync: ${(1 / fSyncRatio).toFixed(1)}x</strong>`;
			}
			sHtml += ` &nbsp;|&nbsp; ${aRows[0].count} objects → ${aRows[1].count} objects`;
			sHtml += '</div>';
		}
		sHtml += '</div>';
		oResultsEl.innerHTML += sHtml;
	};

	const fnCleanCanvas = (oCanvas) => {
		oCanvas.querySelectorAll("[id]").forEach((oEl) => oEl.remove());
	};

	// ──────────────────────────────────────────────
	// Main benchmark — focused on rendering
	// ──────────────────────────────────────────────

	window.runBenchmark = async () => {
		document.getElementById("btnRun").disabled = true;
		document.getElementById("results").innerHTML = "";
		const oCanvas = document.getElementById("benchCanvas");
		oCanvas.style.display = "block";

		const iSeriesCount = parseInt(document.getElementById("seriesCount").value) || 20;
		const iMonths = parseInt(document.getElementById("monthSpan").value) || 12;
		const iIterations = parseInt(document.getElementById("iterations").value) || 5;
		const sView = document.getElementById("viewSelect").value;

		const oStart = UI5Date.getInstance(2024, 0, 1);
		const oEnd = UI5Date.getInstance(2024, 0, 1);
		oEnd.setMonth(oEnd.getMonth() + iMonths);

		const iWeeks = Math.round((oEnd - oStart) / (7 * 24 * 60 * 60 * 1000));
		const iTotalExp = iSeriesCount * iWeeks;

		const fnMakeView = (sKey) => {
			switch (sKey) {
				case "day":   return new DayView({ key: "v", title: "Day" });
				case "work":  return new WorkWeekView({ key: "v", title: "Work Week" });
				case "month": return new MonthView({ key: "v", title: "Month" });
				default:      return new WeekView({ key: "v", title: "Week" });
			}
		};

		// ═══════════════════════════════════════════
		// TEST 1: Initial Render
		// ═══════════════════════════════════════════
		const aExpInitSync = [], aExpInitTotal = [], aRecInitSync = [], aRecInitTotal = [];

		for (let i = 0; i < iIterations; i++) {
			// Expanded — data generation is part of the timed section so that
			// the total cost (build + render) is compared fairly against recurring,
			// which always computes occurrences at render time.
			fnSetStatus(`Test 1/4: Initial render — Expanded, iteration ${i + 1}/${iIterations}`);
			fnSetCanvasLabel(`EXPANDED — ${iTotalExp} CalendarAppointments`);
			await fnNextFrame();

			const oSPCExp = new SinglePlanningCalendar({ startDate: oStart, views: [fnMakeView(sView)] });
			let oMeasure = await fnMeasureWithPaint(() => {
				fnGenerateExpandedAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCExp.addAppointment(oApp));
				oSPCExp.placeAt("benchCanvas");
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			aExpInitSync.push(oMeasure.sync);
			aExpInitTotal.push(oMeasure.total);
			oSPCExp.destroy();
			fnCleanCanvas(oCanvas);

			// Recurring
			fnSetStatus(`Test 1/4: Initial render — Recurring, iteration ${i + 1}/${iIterations}`);
			fnSetCanvasLabel(`RECURRING — ${iSeriesCount} RecurringCalendarAppointments`);
			await fnNextFrame();

			const oSPCRec = new SinglePlanningCalendar({ startDate: oStart, views: [fnMakeView(sView)] });
			fnGenerateRecurringAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCRec.addAppointment(oApp));
			oMeasure = await fnMeasureWithPaint(() => {
				oSPCRec.placeAt("benchCanvas");
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			aRecInitSync.push(oMeasure.sync);
			aRecInitTotal.push(oMeasure.total);
			oSPCRec.destroy();
			fnCleanCanvas(oCanvas);
		}

		fnRenderTable([
			{ label: "Expanded", count: iTotalExp, ...fnMakeStats(aExpInitSync, aExpInitTotal) },
			{ label: "Recurring", count: iSeriesCount, ...fnMakeStats(aRecInitSync, aRecInitTotal) }
		], `1. Initial Render (${sView} view)`);

		// ═══════════════════════════════════════════
		// TEST 2: Navigation Re-render
		// ═══════════════════════════════════════════
		const iNavSteps = 8;
		const iStepDays = (sView === "day") ? 1 : (sView === "month") ? 30 : 7;

		// — Expanded navigation —
		fnSetCanvasLabel(`EXPANDED — navigating ${iNavSteps} steps`);
		const oSPCExpNav = new SinglePlanningCalendar({ startDate: oStart, views: [fnMakeView(sView)] });
		fnGenerateExpandedAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCExpNav.addAppointment(oApp));
		oSPCExpNav.placeAt("benchCanvas");
		nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
		await fnNextFrame();

		const aExpNavSync = [], aExpNavTotal = [];
		for (let i = 0; i < iIterations; i++) {
			oSPCExpNav.setStartDate(UI5Date.getInstance(oStart));
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			fnSetStatus(`Test 2/4: Navigation — Expanded, iteration ${i + 1}/${iIterations}`);

			for (let iStep = 0; iStep < iNavSteps; iStep++) {
				const oDate = UI5Date.getInstance(oSPCExpNav.getStartDate());
				oDate.setDate(oDate.getDate() + iStepDays);
				const oMeasure = await fnMeasureWithPaint(() => {
					oSPCExpNav.setStartDate(oDate);
					nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
				});
				aExpNavSync.push(oMeasure.sync);
				aExpNavTotal.push(oMeasure.total);
			}
		}
		oSPCExpNav.destroy();
		fnCleanCanvas(oCanvas);

		// — Recurring navigation —
		fnSetCanvasLabel(`RECURRING — navigating ${iNavSteps} steps`);
		const oSPCRecNav = new SinglePlanningCalendar({ startDate: oStart, views: [fnMakeView(sView)] });
		fnGenerateRecurringAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCRecNav.addAppointment(oApp));
		oSPCRecNav.placeAt("benchCanvas");
		nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
		await fnNextFrame();

		const aRecNavSync = [], aRecNavTotal = [];
		for (let i = 0; i < iIterations; i++) {
			oSPCRecNav.setStartDate(UI5Date.getInstance(oStart));
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			fnSetStatus(`Test 2/4: Navigation — Recurring, iteration ${i + 1}/${iIterations}`);

			for (let iStep = 0; iStep < iNavSteps; iStep++) {
				const oDate = UI5Date.getInstance(oSPCRecNav.getStartDate());
				oDate.setDate(oDate.getDate() + iStepDays);
				const oMeasure = await fnMeasureWithPaint(() => {
					oSPCRecNav.setStartDate(oDate);
					nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
				});
				aRecNavSync.push(oMeasure.sync);
				aRecNavTotal.push(oMeasure.total);
			}
		}
		oSPCRecNav.destroy();
		fnCleanCanvas(oCanvas);

		fnRenderTable([
			{ label: `Expanded (per step, ${iIterations * iNavSteps} samples)`, count: iTotalExp, ...fnMakeStats(aExpNavSync, aExpNavTotal) },
			{ label: `Recurring (per step, ${iIterations * iNavSteps} samples)`, count: iSeriesCount, ...fnMakeStats(aRecNavSync, aRecNavTotal) }
		], `2. Navigation Re-render (median per step, ${iNavSteps} steps × ${iStepDays} days forward)`);

		// ═══════════════════════════════════════════
		// TEST 3: View Switch (Week → Month → Week)
		// ═══════════════════════════════════════════

		// — Expanded view switch —
		fnSetCanvasLabel("EXPANDED — view switch Week ↔ Month");
		const oSPCExpVS = new SinglePlanningCalendar({ startDate: oStart, views: [
			new WeekView({ key: "week", title: "Week" }),
			new MonthView({ key: "month", title: "Month" })
		]});
		fnGenerateExpandedAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCExpVS.addAppointment(oApp));
		oSPCExpVS.placeAt("benchCanvas");
		nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
		await fnNextFrame();

		const aExpVSSync = [], aExpVSTotal = [];
		for (let i = 0; i < iIterations; i++) {
			fnSetStatus(`Test 3/4: View switch — Expanded, iteration ${i + 1}/${iIterations}`);
			let fSyncTime = 0, fTotalTime = 0;

			let oMeasure = await fnMeasureWithPaint(() => {
				oSPCExpVS.setSelectedView(oSPCExpVS.getViews()[1]); // → Month
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			fSyncTime += oMeasure.sync;
			fTotalTime += oMeasure.total;

			oMeasure = await fnMeasureWithPaint(() => {
				oSPCExpVS.setSelectedView(oSPCExpVS.getViews()[0]); // → Week
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			fSyncTime += oMeasure.sync;
			fTotalTime += oMeasure.total;

			aExpVSSync.push(fSyncTime);
			aExpVSTotal.push(fTotalTime);
		}
		oSPCExpVS.destroy();
		fnCleanCanvas(oCanvas);

		// — Recurring view switch —
		fnSetCanvasLabel("RECURRING — view switch Week ↔ Month");
		const oSPCRecVS = new SinglePlanningCalendar({ startDate: oStart, views: [
			new WeekView({ key: "week", title: "Week" }),
			new MonthView({ key: "month", title: "Month" })
		]});
		fnGenerateRecurringAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCRecVS.addAppointment(oApp));
		oSPCRecVS.placeAt("benchCanvas");
		nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
		await fnNextFrame();

		const aRecVSSync = [], aRecVSTotal = [];
		for (let i = 0; i < iIterations; i++) {
			fnSetStatus(`Test 3/4: View switch — Recurring, iteration ${i + 1}/${iIterations}`);
			let fSyncTime = 0, fTotalTime = 0;

			let oMeasure = await fnMeasureWithPaint(() => {
				oSPCRecVS.setSelectedView(oSPCRecVS.getViews()[1]);
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			fSyncTime += oMeasure.sync;
			fTotalTime += oMeasure.total;

			oMeasure = await fnMeasureWithPaint(() => {
				oSPCRecVS.setSelectedView(oSPCRecVS.getViews()[0]);
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			fSyncTime += oMeasure.sync;
			fTotalTime += oMeasure.total;

			aRecVSSync.push(fSyncTime);
			aRecVSTotal.push(fTotalTime);
		}
		oSPCRecVS.destroy();
		fnCleanCanvas(oCanvas);

		fnRenderTable([
			{ label: "Expanded (Week→Month→Week)", count: iTotalExp, ...fnMakeStats(aExpVSSync, aExpVSTotal) },
			{ label: "Recurring (Week→Month→Week)", count: iSeriesCount, ...fnMakeStats(aRecVSSync, aRecVSTotal) }
		], "3. View Switch Render (Week ↔ Month)");

		// ═══════════════════════════════════════════
		// TEST 4: Invalidation + Re-render
		// ═══════════════════════════════════════════

		// — Expanded invalidation —
		fnSetCanvasLabel("EXPANDED — full invalidation");
		const oSPCExpInv = new SinglePlanningCalendar({ startDate: oStart, views: [fnMakeView(sView)] });
		fnGenerateExpandedAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCExpInv.addAppointment(oApp));
		oSPCExpInv.placeAt("benchCanvas");
		nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
		await fnNextFrame();

		const aExpInvSync = [], aExpInvTotal = [];
		for (let i = 0; i < iIterations; i++) {
			fnSetStatus(`Test 4/4: Invalidation — Expanded, iteration ${i + 1}/${iIterations}`);
			const oMeasure = await fnMeasureWithPaint(() => {
				oSPCExpInv.invalidate();
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			aExpInvSync.push(oMeasure.sync);
			aExpInvTotal.push(oMeasure.total);
		}
		oSPCExpInv.destroy();
		fnCleanCanvas(oCanvas);

		// — Recurring invalidation —
		fnSetCanvasLabel("RECURRING — full invalidation");
		const oSPCRecInv = new SinglePlanningCalendar({ startDate: oStart, views: [fnMakeView(sView)] });
		fnGenerateRecurringAppointments(iSeriesCount, oStart, oEnd).forEach((oApp) => oSPCRecInv.addAppointment(oApp));
		oSPCRecInv.placeAt("benchCanvas");
		nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
		await fnNextFrame();

		const aRecInvSync = [], aRecInvTotal = [];
		for (let i = 0; i < iIterations; i++) {
			fnSetStatus(`Test 4/4: Invalidation — Recurring, iteration ${i + 1}/${iIterations}`);
			const oMeasure = await fnMeasureWithPaint(() => {
				oSPCRecInv.invalidate();
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			});
			aRecInvSync.push(oMeasure.sync);
			aRecInvTotal.push(oMeasure.total);
		}
		oSPCRecInv.destroy();
		fnCleanCanvas(oCanvas);

		fnRenderTable([
			{ label: "Expanded", count: iTotalExp, ...fnMakeStats(aExpInvSync, aExpInvTotal) },
			{ label: "Recurring", count: iSeriesCount, ...fnMakeStats(aRecInvSync, aRecInvTotal) }
		], "4. Full Invalidation + Re-render");

		// ── Final summary ──
		const oResultsEl = document.getElementById("results");
		oResultsEl.innerHTML += `<div class="summary">
			<div class="benchmark-header">Configuration</div>
			<div class="result-row"><span class="result-label">Weekly series:</span><span class="result-value">${iSeriesCount}</span></div>
			<div class="result-row"><span class="result-label">Time span:</span><span class="result-value">${iMonths} months (${iWeeks} weeks)</span></div>
			<div class="result-row"><span class="result-label">Expanded approach:</span><span class="result-value loser">${iTotalExp} CalendarAppointment objects</span></div>
			<div class="result-row"><span class="result-label">Recurring approach:</span><span class="result-value winner">${iSeriesCount} RecurringCalendarAppointment objects</span></div>
			<div class="result-row"><span class="result-label">Object reduction:</span><span class="result-value winner">${(iTotalExp / iSeriesCount).toFixed(0)}×</span></div>
		</div>`;

		fnSetStatus("Done.");
		fnSetCanvasLabel("");
		oCanvas.style.display = "none";
		document.getElementById("btnRun").disabled = false;
	};
});