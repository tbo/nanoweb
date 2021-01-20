let counterState = 0;

class Counter extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    const output = document.createElement("SPAN");
    root.appendChild(document.createElement("SLOT"));
    root.appendChild(output);
    const increase = () => {
      counterState++;
      render();
    };
    const render = () => {
      output.innerText = `Counter state: ${counterState}`;
    };
    this.addEventListener("click", increase);
    render();
  }
}

window.customElements.define("x-counter", Counter);
