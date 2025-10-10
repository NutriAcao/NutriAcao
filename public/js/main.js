import { initMenu } from "./menu.js";
import { initScrollHeader } from "./scroll.js";
import { initAccordion } from "./accordion.js";
import { loadOngs } from "./map.js";
import { initSearch } from "./search.js";

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initScrollHeader();
  initAccordion();
  loadOngs();
  initSearch();
});
