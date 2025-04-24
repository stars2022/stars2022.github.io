class CustomInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._theme = 'light';
    this._variant = 'blur';
    this._type = 'text';
    this._placeholder = ' ';
    this._value = '';
    this._label = '';
    this._required = false;
    this._disabled = false;
    this._focused = false;
  }

  static get observedAttributes() {
    return ['theme', 'variant', 'type', 'placeholder', 'label', 'value', 'required', 'disabled'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch(name) {
        case 'theme':
        case 'variant':
        case 'type':
        case 'placeholder':
        case 'label':
          this[`_${name}`] = newValue;
          this.render();
          break;
        case 'value':
          this[`_${name}`] = newValue;
          this.updateValue(newValue);
          break;
        case 'required':
        case 'disabled':
          this[`_${name}`] = newValue !== null;
          this.updateAttribute(name, newValue !== null);
          break;
      }
    }
  }

  connectedCallback() {
    // Initialize properties from attributes
    this._theme = this.getAttribute('theme') || 'light';
    this._variant = this.getAttribute('variant') || 'blur';
    this._type = this.getAttribute('type') || 'text';
    this._placeholder = this.getAttribute('placeholder') || ' ';
    this._label = this.getAttribute('label') || '';
    this._value = this.getAttribute('value') || '';
    this._required = this.hasAttribute('required');
    this._disabled = this.hasAttribute('disabled');
    
    this.render();
  }
  
  get value() {
    const input = this.shadowRoot.querySelector('input');
    return input ? input.value : this._value;
  }
  
  set value(val) {
    this._value = val;
    this.updateValue(val);
    this.setAttribute('value', val);
  }

  updateValue(value) {
    const input = this.shadowRoot.querySelector('input');
    if (input && input.value !== value) {
      input.value = value;
      this.updateLabelState();
    }
  }

  updateAttribute(name, value) {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      if (value) {
        input.setAttribute(name, '');
      } else {
        input.removeAttribute(name);
      }
    }
  }

  updateLabelState() {
    const input = this.shadowRoot.querySelector('input');
    const label = this.shadowRoot.querySelector('label');
    
    if (input && label) {
      const hasValue = input.value || this._focused;
      label.classList.toggle('active', hasValue);
    }
  }

  setupEventListeners() {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return;

    // Input events
    input.addEventListener('input', (e) => {
      this._value = e.target.value;
      this.updateLabelState();
      this.dispatchEvent(new CustomEvent('input', {
        bubbles: true,
        composed: true,
        detail: { value: this._value }
      }));
    });

    input.addEventListener('change', (e) => {
      this._value = e.target.value;
      this.updateLabelState();
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value: this._value }
      }));
    });

    input.addEventListener('focus', () => {
      this._focused = true;
      this.updateLabelState();
      this.dispatchEvent(new CustomEvent('focus', {
        bubbles: true,
        composed: true
      }));
    });

    input.addEventListener('blur', () => {
      this._focused = false;
      this.updateLabelState();
      this.dispatchEvent(new CustomEvent('blur', {
        bubbles: true,
        composed: true
      }));
    });
  }

  getStyles() {
    const isDark = this._theme === 'dark';
    
    // Colors based on theme
    const backgroundColor = isDark 
      ? 'rgba(30, 30, 30, 0.3)' 
      : 'rgba(255, 255, 255, 0.3)';
    const borderColor = isDark ? '#444' : '#ddd';
    const textColor = isDark ? '#fff' : '#333';
    const labelColor = isDark ? '#777' : '#999';
    const focusBorderColor = '#4a90e2';
    const focusLabelColor = '#4a90e2';
    const labelBackgroundColor = isDark ? '#121212' : '#f5f5f5';
    
    return `
      :host {
        display: block;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin-bottom: 20px;
        width: 100%;
      }
      
      .input-container {
        position: relative;
      }
      
      input {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        font-size: 16px;
        transition: all 0.3s ease;
        background-color: transparent;
        color: ${textColor};
        box-sizing: border-box;
        outline: none;
      }
      
      /* 亮色主题 - 高性能模式 */
      .theme-light.variant-performance input {
        background-color: #ffffff;
      }
      
      /* 暗色主题 - 高性能模式 */
      .theme-dark.variant-performance input {
        background-color: #1e1e1e;
      }
      
      /* 亮色主题 - 模糊模式 */
      .theme-light.variant-blur input {
        background-color: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      /* 暗色主题 - 模糊模式 */
      .theme-dark.variant-blur input {
        background-color: rgba(30, 30, 30, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      label {
        position: absolute;
        left: 15px;
        top: 12px;
        color: ${labelColor};
        transition: all 0.3s ease;
        pointer-events: none;
        padding: 0 5px;
        font-size: 16px;
        transform-origin: left top;
        background-color: transparent;
      }
      
      input:focus {
        border-color: ${focusBorderColor};
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
      }
      
      label.active {
        transform: translateY(-22px) scale(0.8);
        background-color: ${labelBackgroundColor};
        color: ${focusLabelColor};
        left: 10px;
      }
      
      input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .error-message {
        color: ${isDark ? '#ff6b6b' : '#e74c3c'};
        font-size: 14px;
        margin-top: 5px;
        display: none;
      }
      
      .error-message.visible {
        display: block;
      }
    `;
  }

  render() {
    // Clear existing content while preserving input state
    const oldInput = this.shadowRoot.querySelector('input');
    const oldValue = oldInput ? oldInput.value : this._value;
    const wasFocused = oldInput === document.activeElement;
    
    const themeClass = `theme-${this._theme}`;
    const variantClass = `variant-${this._variant}`;
    
    // Create the new component HTML
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="input-container ${themeClass} ${variantClass}">
        <input 
          type="${this._type}" 
          placeholder="${this._placeholder}" 
          value="${oldValue}"
          ${this._required ? 'required' : ''}
          ${this._disabled ? 'disabled' : ''}>
        <label ${(oldValue || this._focused) ? 'class="active"' : ''}>${this._label}</label>
        <div class="error-message" id="error-message"></div>
      </div>
    `;
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Restore focus if it was focused before
    if (wasFocused) {
      const input = this.shadowRoot.querySelector('input');
      if (input) {
        input.focus();
        // Place cursor at the end
        const len = input.value.length;
        input.selectionStart = len;
        input.selectionEnd = len;
      }
    }
  }

  // Public methods
  setErrorMessage(message) {
    const errorElement = this.shadowRoot.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.toggle('visible', !!message);
    }
  }

  clearError() {
    this.setErrorMessage('');
  }

  focus() {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      input.focus();
    }
  }
}

// 注册组件
customElements.define('custom-input', CustomInput);