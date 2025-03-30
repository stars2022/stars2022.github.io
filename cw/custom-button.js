class CustomButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initial state
    this._text = this.textContent || this.getAttribute('text') || 'Button';
    this._disabled = this.hasAttribute('disabled');
    this._variant = this.getAttribute('variant') || 'blur'; // blur 或 performance
    this._theme = this.getAttribute('theme') || 'light'; // light 或 dark
    
    // Create component HTML and CSS
    this.render();
    
    // Bind events
    this.bindEvents();
  }
  
  static get observedAttributes() {
    return ['text', 'disabled', 'variant', 'theme'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'text') {
      this._text = newValue || 'Button';
      this.updateText();
    } else if (name === 'disabled') {
      this._disabled = newValue !== null;
      this.updateDisabledState();
    } else if (name === 'variant') {
      this._variant = newValue || 'blur';
      this.updateClasses();
    } else if (name === 'theme') {
      this._theme = newValue || 'light';
      this.updateClasses();
    }
  }
  
  get text() {
    return this._text;
  }
  
  set text(value) {
    this._text = value;
    this.setAttribute('text', value);
    // 直接调用updateText确保立即更新DOM
    this.updateText();
  }
  
  get disabled() {
    return this._disabled;
  }
  
  set disabled(value) {
    this._disabled = value;
    
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
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
  
  updateText() {
    const button = this.shadowRoot.querySelector('.button');
    if (button) {
      button.textContent = this._text;
    }
  }
  
  updateDisabledState() {
    const button = this.shadowRoot.querySelector('.button');
    if (button) {
      if (this._disabled) {
        button.classList.add('disabled');
        button.setAttribute('aria-disabled', 'true');
      } else {
        button.classList.remove('disabled');
        button.removeAttribute('aria-disabled');
      }
    }
  }
  
  updateClasses() {
    const button = this.shadowRoot.querySelector('.button');
    if (button) {
      // 重置所有类名
      button.className = 'button';
      
      // 添加变体和主题类
      button.classList.add(`variant-${this._variant}`);
      button.classList.add(`theme-${this._theme}`);
      
      // 添加禁用状态
      if (this._disabled) {
        button.classList.add('disabled');
      }
    }
  }
  
  bindEvents() {
    const button = this.shadowRoot.querySelector('.button');
    
    // 修复：阻止原始事件冒泡，只使用自定义事件，防止事件触发两次
    button.addEventListener('click', (event) => {
      // 阻止原始事件冒泡
      event.stopPropagation();
      
      if (this._disabled) {
        event.preventDefault();
        return;
      }

      // 触发自定义事件，确保事件可以冒泡到文档
      const customEvent = new CustomEvent('click', {
        bubbles: true,
        composed: true // 关键：使事件可以穿越 Shadow DOM 边界
      });
      
      this.dispatchEvent(customEvent);
    });
    
    // 添加按下效果
    button.addEventListener('mousedown', () => {
      if (!this._disabled) {
        button.classList.add('active');
      }
    });
    
    button.addEventListener('mouseup', () => {
      button.classList.remove('active');
    });
    
    button.addEventListener('mouseleave', () => {
      button.classList.remove('active');
    });
    
    // 触摸设备支持
    button.addEventListener('touchstart', () => {
      if (!this._disabled) {
        button.classList.add('active');
      }
    });
    
    button.addEventListener('touchend', () => {
      button.classList.remove('active');
    });
    
    button.addEventListener('touchcancel', () => {
      button.classList.remove('active');
    });
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          font-weight: 500;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          outline: none;
          box-sizing: border-box;
        }
        
        /* 亮色主题 - 高性能模式 */
        .button.theme-light.variant-performance {
          background-color: #f0f0f0;
          color: #333;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .button.theme-light.variant-performance:hover {
          background-color: #e0e0e0;
        }
        
        .button.theme-light.variant-performance.active {
          transform: translateY(1px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        /* 亮色主题 - 模糊模式 */
        .button.theme-light.variant-blur {
          background: rgba(255, 255, 255, 0.2);
          color: #333;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .button.theme-light.variant-blur:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        
        .button.theme-light.variant-blur.active {
          transform: translateY(1px);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* 暗色主题 - 高性能模式 */
        .button.theme-dark.variant-performance {
          background-color: #333;
          color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .button.theme-dark.variant-performance:hover {
          background-color: #444;
        }
        
        .button.theme-dark.variant-performance.active {
          transform: translateY(1px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        /* 暗色主题 - 模糊模式 */
        .button.theme-dark.variant-blur {
          background: rgba(50, 50, 50, 0.4);
          color: #fff;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .button.theme-dark.variant-blur:hover {
          background: rgba(60, 60, 60, 0.6);
        }
        
        .button.theme-dark.variant-blur.active {
          transform: translateY(1px);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* 禁用状态 */
        .button.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }
      </style>
      <button class="button variant-${this._variant} theme-${this._theme} ${this._disabled ? 'disabled' : ''}" 
              ${this._disabled ? 'aria-disabled="true"' : ''} 
              part="button">
        ${this._text}
      </button>
    `;
  }
}

customElements.define('custom-button', CustomButton);