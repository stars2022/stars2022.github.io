class CardElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initial state
    this._title = this.getAttribute('title') || '卡片标题';
    this._variant = this.getAttribute('variant') || 'blur'; // blur 或 performance
    this._theme = this.getAttribute('theme') || 'light'; // light 或 dark
    
    // Create component HTML and CSS
    this.render();
  }
  
  static get observedAttributes() {
    return ['title', 'variant', 'theme'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'title') {
      this._title = newValue || '卡片标题';
      this.updateTitle();
    } else if (name === 'variant') {
      this._variant = newValue || 'blur';
      this.updateClasses();
    } else if (name === 'theme') {
      this._theme = newValue || 'light';
      this.updateClasses();
    }
  }
  
  get title() {
    return this._title;
  }
  
  set title(value) {
    this._title = value;
    this.setAttribute('title', value);
  }
  
  get variant() {
    return this._variant;
  }
  
  set variant(value) {
    this._variant = value;
    this.setAttribute('variant', value);
  }
  
  get theme() {
    return this._theme;
  }
  
  set theme(value) {
    this._theme = value;
    this.setAttribute('theme', value);
  }
  
  updateTitle() {
    const titleElement = this.shadowRoot.querySelector('.card-title');
    if (titleElement) {
      titleElement.textContent = this._title;
    }
  }
  
  updateClasses() {
    const cardElement = this.shadowRoot.querySelector('.card');
    if (cardElement) {
      // 重置所有类名
      cardElement.className = 'card';
      // 添加变体和主题类
      cardElement.classList.add(`variant-${this._variant}`);
      cardElement.classList.add(`theme-${this._theme}`);
    }
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 300px;
          padding: 20px;
          border-radius: 15px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: all 0.3s ease;
          text-align: center;
        }
        
        /* 亮色主题 - 高性能模式（不使用透明和模糊效果） */
        .card.theme-light.variant-performance {
          background: #ffffff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          color: #000000;
        }
        
        /* 亮色主题 - 模糊模式 */
        .card.theme-light.variant-blur {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #000000;
        }
        
        /* 暗色主题 - 高性能模式 */
        .card.theme-dark.variant-performance {
          background: #1e1e1e;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }
        
        /* 暗色主题 - 模糊模式 */
        .card.theme-dark.variant-blur {
          background: rgba(30, 30, 30, 0.8);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          color: #ffffff;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .card-title {
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 15px;
          text-align: center;
          width: 100%;
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        
        ::slotted(*) {
          margin: 0;
          text-align: center;
          max-width: 100%;
        }
      </style>
      <div class="card variant-${this._variant} theme-${this._theme}" part="card">
        <span class="card-title">${this._title}</span>
        <div class="card-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('custom-card', CardElement);