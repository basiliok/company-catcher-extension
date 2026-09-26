function highlightCompanies(site) {
	const STORAGE_KEY = "companies";
	const CARD_TONE_ATTRIBUTE = "data-company-catcher-card";
	const NAME_TONE_ATTRIBUTE = "data-company-catcher-name";
	const SUMMARY_ATTRIBUTE = "data-company-catcher-summary";

	if (!document.body) return;

	let companiesLongestFirst = [];

	function normalize(text) {
		return text.replace(/\s+/g, " ").toLowerCase();
	}

	function findMatchingCompany(companyName) {
		const normalizedName = normalize(companyName);
		return companiesLongestFirst.find((company) =>
			normalizedName.includes(normalize(company.name)),
		);
	}

	function highlightCard(card) {
		const cardParts = site.findTitleAndCompanyName(card);
		if (!cardParts) return;

		const { titleElement, companyNameElement } = cardParts;
		const company = findMatchingCompany(companyNameElement.textContent);
		if (company) {
			card.setAttribute(CARD_TONE_ATTRIBUTE, company.tone);
			companyNameElement.setAttribute(NAME_TONE_ATTRIBUTE, company.tone);
			titleElement.setAttribute(SUMMARY_ATTRIBUTE, "");
			companyNameElement.setAttribute(SUMMARY_ATTRIBUTE, "");
		} else {
			card.removeAttribute(CARD_TONE_ATTRIBUTE);
			companyNameElement.removeAttribute(NAME_TONE_ATTRIBUTE);
			titleElement.removeAttribute(SUMMARY_ATTRIBUTE);
			companyNameElement.removeAttribute(SUMMARY_ATTRIBUTE);
		}
	}

	function highlightAllCards() {
		for (const card of document.querySelectorAll(site.jobCardSelector)) {
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
}
