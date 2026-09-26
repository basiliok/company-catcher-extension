const STORAGE_KEY = "companies";

/* -- Buscar elementos del DOM -- */
const addCompanyForm = document.getElementById("add-form");
const companyInput = document.getElementById("company-input");
const companyList = document.getElementById("company-list");

let companies = [];

function renderCompanyList() {
	companyList.replaceChildren(...companies.map(createCompanyItem));
}

function saveCompanies() {
	chrome.storage.local.set({ [STORAGE_KEY]: companies });
}

function addCompany(rawName) {
	companyInput.setCustomValidity("");
	const name = rawName.trim();
	if (!name) return false;

	const duplicate = companies.some(
		(company) => company.name.toLowerCase() === name.toLowerCase(),
	);
	if (duplicate) {
		companyInput.setCustomValidity("Esa empresa ya está en la lista");
		companyInput.reportValidity();
		return false;
	}

	companies.push({ name, tone: "positive" });
	saveCompanies();
	renderCompanyList();
	return true;
}

function changeTone(name, tone) {
	companies = companies.map((company) =>
		company.name === name ? { ...company, tone } : company,
	);
	saveCompanies();
}

function removeCompany(name) {
	companies = companies.filter((company) => company.name !== name);
	saveCompanies();
	renderCompanyList();
}

addCompanyForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const added = addCompany(companyInput.value);
	if (added) companyInput.value = "";

	companyInput.focus();
});

companyInput.addEventListener("input", () =>
	companyInput.setCustomValidity(""),
);

chrome.storage.local.get(STORAGE_KEY).then((stored) => {
	companies = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
	renderCompanyList();
});

/* -- Crear elementos -- */
function createCompanyItem(company) {
	const item = document.createElement("li");

	const label = document.createElement("span");
	label.className = "company-name";
	label.textContent = company.name;

	item.append(label, createToneSwitch(company), createRemoveButton(company));
	return item;
}

function createToneSwitch(company) {
	const toneSwitch = document.createElement("input");
	toneSwitch.type = "checkbox";
	toneSwitch.className = "tone-switch";
	toneSwitch.setAttribute("role", "switch");
	toneSwitch.setAttribute("aria-label", `Resaltar ${company.name} en verde`);
	toneSwitch.checked = company.tone === "positive";
	toneSwitch.addEventListener("change", () => {
		const tone = toneSwitch.checked ? "positive" : "negative";
		changeTone(company.name, tone);
	});
	return toneSwitch;
}

function createRemoveButton(company) {
	const removeButton = document.createElement("button");
	removeButton.type = "button";
	removeButton.className = "remove";
	removeButton.textContent = "✕";
	removeButton.setAttribute("aria-label", `Quitar ${company.name}`);
	removeButton.addEventListener("click", () => removeCompany(company.name));
	return removeButton;
}
