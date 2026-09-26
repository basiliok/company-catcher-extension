(() => {
	// El componentkey se repite en un div interno; role="button" deja solo la tarjeta.
	const JOB_CARD_SELECTOR =
		'div[role="button"][componentkey^="job-card-component-ref-"]';

	function findTitleAndCompanyName(card) {
		// Orden de los párrafos en la tarjeta: título, empresa, ubicación.
		const [titleElement, companyNameElement] = card.querySelectorAll("p");
		if (!titleElement || !companyNameElement) return null;

		return { titleElement, companyNameElement };
	}

	highlightCompanies({
		jobCardSelector: JOB_CARD_SELECTOR,
		findTitleAndCompanyName,
	});
})();
