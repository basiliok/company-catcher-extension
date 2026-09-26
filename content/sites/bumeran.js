(() => {
	const JOB_CARD_SELECTOR = 'a[aria-labelledby*="job-posting"]';
	const CARD_HEADER_SELECTOR = '[id^="header-col-job-posting-"]';

	function findTitleAndCompanyName(card) {
		const header = card.querySelector(CARD_HEADER_SELECTOR);
		if (!header) return null;

		// Orden en el header: fecha (h3), título (h2), empresa (h3), valoración (h3).
		const headings = [...header.querySelectorAll("h2, h3")];
		const titleIndex = headings.findIndex(
			(heading) => heading.localName === "h2",
		);
		if (titleIndex === -1) return null;

		const titleElement = headings[titleIndex];
		const companyNameElement = headings[titleIndex + 1];
		if (!companyNameElement) return null;

		return { titleElement, companyNameElement };
	}

	highlightCompanies({
		jobCardSelector: JOB_CARD_SELECTOR,
		findTitleAndCompanyName,
	});
})();
