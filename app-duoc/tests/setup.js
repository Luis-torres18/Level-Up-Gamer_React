import "@testing-library/jest-dom";

// jsdom no implementa scrollIntoView; la página Inicio lo usa en modo admin.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
