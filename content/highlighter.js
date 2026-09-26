(() => {
	const STORAGE_KEY = "companies";
	const JOB_CARD_SELECTOR = 'a[aria-labelledby*="job-posting"]';
	const CARD_HEADER_SELECTOR = '[id^="header-col-job-posting-"]';
	const CARD_TONE_ATTRIBUTE = "data-company-catcher-card";
	const NAME_TONE_ATTRIBUTE = "data-company-catcher-name";

	if (!document.body) return;

	let companiesLongestFirst = [];

	function normalize(text) {
		return text.replace(/\s+/g, " ").toLowerCase();
	}

	function findCompanyNameElement(card) {
		const header = card.querySelector(CARD_HEADER_SELECTOR);
		if (!header) return null;

		// Orden en el header: fecha (h3), título (h2), empresa (h3), valoración (h3).
		const headings = [...header.querySelectorAll("h2, h3")];
		const titleIndex = headings.findIndex(
			(heading) => heading.localName === "h2",
		);
		if (titleIndex === -1) return null;

		return headings[titleIndex + 1] ?? null;
	}

	function findMatchingCompany(companyName) {
		const normalizedName = normalize(companyName);
		return companiesLongestFirst.find((company) =>
			normalizedName.includes(normalize(company.name)),
		);
	}

	function highlightCard(card) {
		const nameElement = findCompanyNameElement(card);
		if (!nameElement) return;

		const company = findMatchingCompany(nameElement.textContent);
		if (company) {
			card.setAttribute(CARD_TONE_ATTRIBUTE, company.tone);
			nameElement.setAttribute(NAME_TONE_ATTRIBUTE, company.tone);
		} else {
			card.removeAttribute(CARD_TONE_ATTRIBUTE);
			nameElement.removeAttribute(NAME_TONE_ATTRIBUTE);
		}
	}

	function highlightAllCards() {
		for (const card of document.querySelectorAll(JOB_CARD_SELECTOR)) {
			highlightCard(card);
		}
	}

	function applyCompanies(storedCompanies) {
		const companies = Array.isArray(storedCompanies) ? storedCompanies : [];
		companiesLongestFirst = companies.toSorted(
			(a, b) => b.name.length - a.name.length,
		);
		highlightAllCards();
	}

	new MutationObserver(highlightAllCards).observe(document.body, {
		childList: true,
		characterData: true,
		subtree: true,
	});

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area === "local" && STORAGE_KEY in changes) {
			applyCompanies(changes[STORAGE_KEY].newValue);
		}
	});

	chrome.storage.local
		.get(STORAGE_KEY)
		.then((stored) => applyCompanies(stored[STORAGE_KEY]));
})();
