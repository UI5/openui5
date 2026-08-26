/**
 * Performance Test Page for Enhanced Tooltips
 */
sap.ui.require([
	"sap/m/Title",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/m/MessageStrip",
	"sap/ui/core/library"
], function (
	Title,
	Page,
	App,
	VBox,
	HBox,
	Button,
	Panel,
	MessageStrip,
	coreLibrary
) {
	"use strict";

	const TextDirection = coreLibrary.TextDirection;

	const aTestStrings = [
		{ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", lang: "en", label: "English (Latin)" },
		{ text: "การเขียนโปรแกรมคอมพิวเตอร์เป็นทักษะที่สำคัญในยุคดิจิทัลสมัยใหม่และช่วยให้เราสามารถสร้างสรรค์นวัตกรรมใหม่ๆได้", lang: "th", label: "Thai" },
		{ text: "计算机编程是数字时代的重要技能，它使我们能够创造新的创新并解决复杂的问题从而推动社会进步", lang: "zh-CN", label: "Chinese (Simplified)" },
		{ text: "計算機編程是數字時代的重要技能，它使我們能夠創造新的創新並解決複雜的問題從而推動社會進步", lang: "zh-TW", label: "Chinese (Traditional)" },
		{ text: "コンピュータプログラミングはデジタル時代の重要なスキルであり、新しいイノベーションを生み出し複雑な問題を解決することができます", lang: "ja", label: "Japanese" },
		{ text: "컴퓨터 프로그래밍은 디지털 시대의 중요한 기술이며 새로운 혁신을 창출하고 복잡한 문제를 해결할 수 있게 해줍니다", lang: "ko", label: "Korean" },
		{ text: "कंप्यूटर प्रोग्रामिंग डिजिटल युग में एक महत्वपूर्ण कौशल है जो हमें नए नवाचार बनाने और जटिल समस्याओं को हल करने में सक्षम बनाता है", lang: "hi", label: "Hindi (Devanagari)" },
		{ text: "برمجة الكمبيوتر هي مهارة أساسية في العصر الرقمي وتمكننا من إنشاء ابتكارات جديدة وحل المشكلات المعقدة", lang: "ar", label: "Arabic" },
		{ text: "תכנות מחשבים היא מיומנות חיונית בעידן הדיגיטלי ומאפשרת לנו ליצור חידושים חדשים ולפתור בעיות מורכבות", lang: "he", label: "Hebrew" },
		{ text: "Компьютерное программирование является важным навыком в цифровую эпоху и позволяет нам создавать новые инновации и решать сложные проблемы", lang: "ru", label: "Russian" },
		{ text: "কম্পিউটার প্রোগ্রামিং ডিজিটাল যুগের একটি গুরুত্বপূর্ণ দক্ষতা এবং এটি আমাদের নতুন উদ্ভাবন তৈরি করতে এবং জটিল সমস্যা সমাধান করতে সক্ষম করে", lang: "bn", label: "Bengali" },
		{ text: "கணினி நிரலாக்கம் டிஜிட்டல் யுகத்தில் ஒரு முக்கியமான திறன் மற்றும் புதிய கண்டுபிடிப்புகளை உருவாக்க மற்றும் சிக்கலான சிக்கல்களை தீர்க்க உதவுகிறது", lang: "ta", label: "Tamil" },
		{ text: "Lập trình máy tính là một kỹ năng quan trọng trong thời đại kỹ thuật số và cho phép chúng ta tạo ra những đổi mới mới và giải quyết các vấn đề phức tạp", lang: "vi", label: "Vietnamese" },
		{ text: "Ο προγραμματισμός υπολογιστών είναι μια σημαντική δεξιότητα στην ψηφιακή εποχή και μας επιτρέπει να δημιουργούμε νέες καινοτομίες και να λύνουμε πολύπλοκα προβλήματα", lang: "el", label: "Greek" },
		{ text: "🚀 Technology innovation drives progress forward 💡 enabling new possibilities for humanity 🌍 through collaboration and creativity ✨", lang: "en", label: "English with Emojis" }
	];

	const aTitleItems = [];
	const currentDirection = TextDirection.LTR;

	function createTitlesFromTestData() {
		const items = [];

		for (let i = 0; i < 10; i++) {
			aTestStrings.forEach((testData, index) => {
				items.push(
					new Title({
						text: testData.text + " - #" + (i + 1),
						width: "500px",
						wrapping: false,
						titleStyle: "H3",
						textDirection: currentDirection,
						tooltip: "Custom tooltip for " + testData.label + " - Item " + (i + 1)
					}).addStyleClass("sapUiSmallMarginBottom")
				);
			});
		}

		return items;
	}

	aTitleItems.push(...createTitlesFromTestData());

	const oVBox = new VBox({
		items: aTitleItems
	}).addStyleClass("sapUiSmallMargin");

	const oStressTestButton = new Button({
		text: "Run Stress Test (Dynamic Creation + Resize)",
		press: function() {
			oStressTestButton.setEnabled(false);
			runStressTest();
		}
	});

	function runStressTest() {
		// Clear existing titles
		oVBox.removeAllItems();
		aTitleItems.length = 0;

		let iCreated = 0;
		const iTotalToCreate = 150; // 10 iterations × 15 test strings
		const iCreateInterval = 50; // ms between each title creation
		const iResizeInterval = 1000; // ms between each container resize (slower, only 3 resizes during creation)

		// Start creating titles progressively
		const createInterval = setInterval(function() {
			if (iCreated >= iTotalToCreate) {
				clearInterval(createInterval);
				oStressTestButton.setEnabled(true);
				oStressTestButton.setText("Run Stress Test Again");
				return;
			}

			const testData = aTestStrings[iCreated % aTestStrings.length];
			const iIteration = Math.floor(iCreated / aTestStrings.length) + 1;

			const oTitle = new Title({
				text: testData.text + " - #" + iIteration,
				width: "500px",
				wrapping: false,
				titleStyle: "H3",
				textDirection: currentDirection,
				tooltip: "Custom tooltip for " + testData.label + " - Item " + iIteration
			}).addStyleClass("sapUiSmallMarginBottom");

			oVBox.addItem(oTitle);
			aTitleItems.push(oTitle);
			iCreated++;
		}, iCreateInterval);

		// Resize the container a few times during title creation to trigger relayout
		// (not continuously - just enough to stress-test the lazy truncation check)
		const aWidths = ["300px", "500px", "700px"];
		let iResizeCount = 0;

		const resizeInterval = setInterval(function() {
			if (iResizeCount >= aWidths.length || iCreated >= iTotalToCreate) {
				clearInterval(resizeInterval);
				// Final resize back to default after creation completes
				setTimeout(function() {
					aTitleItems.forEach(function(oTitle) {
						oTitle.setWidth("500px");
					});
				}, 100);
				return;
			}

			const sNewWidth = aWidths[iResizeCount];
			// Resize all existing titles
			aTitleItems.forEach(function(oTitle) {
				oTitle.setWidth(sNewWidth);
			});
			iResizeCount++;
		}, iResizeInterval);
	}

	const oInstructionsStrip = new MessageStrip({
		text: "Use this page to measure performance using Chrome DevTools (F12 > Performance tab). There should be no layout thrashing and no blockage on the main thread during rendering. Press Shift+Alt+F6 to toggle Extended Keyboard Navigation. To test RTL mode, add ?sap-ui-rtl=true to the URL and reload.",
		type: "Information",
		showIcon: true
	}).addStyleClass("sapUiSmallMarginBottom");

	const oPage = new Page({
		title: "Title Tooltips Test - Multilingual Performance Test",
		content: [
			oInstructionsStrip,
			new HBox({
				items: [oStressTestButton]
			}).addStyleClass("sapUiSmallMargin"),
			oVBox
		]
	});

	const oApp = new App({
		pages: [oPage]
	});

	oApp.placeAt("body");
});
