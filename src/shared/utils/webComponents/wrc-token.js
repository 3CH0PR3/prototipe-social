class WrcToken extends HTMLElement {
  constructor() {
    super();

    // No usamos Shadow DOM para que los estilos de Vue se apliquen
    // this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // El contenido ya está dentro del elemento, solo lo mantenemos
    // Puedes agregar lógica adicional aquí si necesitas
    this.setAttribute('data-wrc-component', 'token');
  }

  disconnectedCallback() {
    // Cleanup si es necesario
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Reaccionar a cambios de atributos si necesitas
  }

  static get observedAttributes() {
    return []; // Lista de atributos a observar
  }
}

// Registrar el Web Component
customElements.define('wrc-token', WrcToken);

export default WrcToken;
