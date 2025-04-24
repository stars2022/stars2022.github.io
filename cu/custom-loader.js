class CustomLoader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._theme = 'light';
    this._variant = 'blur';
    this._size = 'medium'; // small, medium, large
    this._type = 'spinner'; // spinner, dots, pulse
    this._visible = true;
  }

  static get observedAttributes() {
    return ['theme', 'variant', 'size', 'type', 'visible'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'theme' || name === 'variant' || name === 'size' || name === 'type') {
        this[`_${name}`] = newValue;
        this.render();
      } else if (name === 'visible') {
        this._visible = newValue !== null;
        this.render();
      }
    }
  }

  connectedCallback() {
    this._theme = this.getAttribute('theme') || 'light';
    this._variant = this.getAttribute('variant') || 'blur';
    this._size = this.getAttribute('size') || 'medium';
    this._type = this.getAttribute('type') || 'spinner';
    this._visible = this.hasAttribute('visible') ? this.getAttribute('visible') !== 'false' : true;
    
    this.render();
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    this._visible = Boolean(value);
    this.render();
  }

  show() {
    this._visible = true;
    this.render();
  }

  hide() {
    this._visible = false;
    this.render();
  }

  getStyles() {
    const darkMode = this._theme === 'dark';
    
    // 尺寸配置
    let sizeConfig = {
      small: { size: '20px', borderWidth: '2px', dotSize: '6px', textSize: '12px' },
      medium: { size: '30px', borderWidth: '3px', dotSize: '8px', textSize: '14px' },
      large: { size: '40px', borderWidth: '4px', dotSize: '10px', textSize: '16px' }
    }[this._size] || sizeConfig.medium;
    
    // 颜色配置
    const primaryColor = darkMode ? '#ffffff' : '#333333';
    const secondaryColor = darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    
    return `
      :host {
        display: ${this._visible ? 'inline-flex' : 'none'};
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }
      
      .loader-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 15px;
        border-radius: 8px;
      }
      
      /* 亮色主题 - 高性能模式 */
      .theme-light.variant-performance {
        background: #ffffff;
      }
      
      /* 暗色主题 - 高性能模式 */
      .theme-dark.variant-performance {
        background: #1e1e1e;
      }
      
      /* 亮色主题 - 模糊模式 */
      .theme-light.variant-blur {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      /* 暗色主题 - 模糊模式 */
      .theme-dark.variant-blur {
        background: rgba(30, 30, 30, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .loader-label {
        margin-top: 10px;
        color: ${primaryColor};
        font-size: ${sizeConfig.textSize};
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      
      /* 旋转加载器 */
      .spinner {
        width: ${sizeConfig.size};
        height: ${sizeConfig.size};
        border: ${sizeConfig.borderWidth} solid ${secondaryColor};
        border-top: ${sizeConfig.borderWidth} solid ${primaryColor};
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* 点加载器 */
      .dots {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
      }
      
      .dot {
        width: ${sizeConfig.dotSize};
        height: ${sizeConfig.dotSize};
        background-color: ${primaryColor};
        border-radius: 50%;
        opacity: 0.6;
      }
      
      .dot:nth-child(1) {
        animation: fade 1.4s infinite ease-in-out both;
        animation-delay: -0.32s;
      }
      
      .dot:nth-child(2) {
        animation: fade 1.4s infinite ease-in-out both;
        animation-delay: -0.16s;
      }
      
      .dot:nth-child(3) {
        animation: fade 1.4s infinite ease-in-out both;
      }
      
      @keyframes fade {
        0%, 80%, 100% { opacity: 0.2; }
        40% { opacity: 1; }
      }
      
      /* 脉冲加载器 */
      .pulse {
        width: ${sizeConfig.size};
        height: ${sizeConfig.size};
        border-radius: 50%;
        background-color: ${primaryColor};
        animation: pulse 1.2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
    `;
  }

  render() {
    const label = this.getAttribute('label') || '';
    const themeClass = `theme-${this._theme}`;
    const variantClass = `variant-${this._variant}`;
    
    let loaderHtml = '';
    if (this._type === 'dots') {
      loaderHtml = `
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      `;
    } else if (this._type === 'pulse') {
      loaderHtml = `<div class="pulse"></div>`;
    } else {
      // 默认为spinner
      loaderHtml = `<div class="spinner"></div>`;
    }
    
    // 标签HTML
    let labelHtml = '';
    if (label) {
      labelHtml = `<div class="loader-label">${label}</div>`;
    }
    
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="loader-container ${themeClass} ${variantClass}">
        ${loaderHtml}
        ${labelHtml}
      </div>
    `;
  }
}

// 注册组件
customElements.define('custom-loader', CustomLoader);