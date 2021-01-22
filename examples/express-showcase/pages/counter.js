const { html } = require('@nanoweb/template');

const CounterExample = () => html`
  <div style="display: grid; place-items: center; height: 300px">
    <x-counter>
      <button type="button" class="btn btn-primary" style="margin-right: 30px">
        Increase
      </button>
    </x-counter>
  </div>
`;

module.exports = CounterExample;
