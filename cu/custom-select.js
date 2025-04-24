class CustomSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._options = [];
    this._open = false;
    this._theme = 'light';
    this._variant = 'blur';
    this._selectedIndex = -1;
    this._selectedValue = '';
  }

  static get observedAttributes() {
    return ['theme', 'variant', 'label', 'placeholder', 'disabled'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'theme' || name === 'variant') {
        this[`_${name}`] = newValue;
        this.render();
      } else if (name === 'label' || name === 'placeholder') {
        this[`_${name}`] = newValue;
        this.render();
      } else if (name === 'disabled') {
        this._disabled = newValue !== null;
        this.render();
      }
    }
  }

  connectedCallback() {
    this._label = this.getAttribute('label') || '';
    this._placeholder = this.getAttribute('placeholder') || '请选择';
    this._theme = this.getAttribute('theme') || 'light';
    this._variant = this.getAttribute('variant') || 'blur';
    this._disabled = this.hasAttribute('disabled');
    
    // 解析选项
    try {
      const optionsAttr = this.getAttribute('options');
      if (optionsAttr) {
        this._options = JSON.parse(optionsAttr);
      }
    } catch (e) {
      console.error('解析选择项失败:', e);
      this._options = [];
    }
    
    // 获取默认选中值
    const defaultValue = this.getAttribute('value');
    if (defaultValue && this._options.length > 0) {
      const index = this._options.findIndex(opt => opt.value === defaultValue);
      if (index !== -1) {
        this._selectedIndex = index;
        this._selectedValue = this._options[index].value;
      }
    }
    
    this.render();
    this.addEventListeners();
  }

  addEventListeners() {
    if (this._disabled) return;

    // 选择框切换
    this.shadowRoot.querySelector('.select-field').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    // 点击外部关闭下拉框
    document.addEventListener('click', () => {
      if (this._open) {
        this.closeDropdown();
      }
    });
    
    // 阻止下拉框内部点击冒泡
    this.shadowRoot.querySelector('.select-dropdown').addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // 选项点击处理
    this.shadowRoot.querySelectorAll('.select-option').forEach((option, index) => {
      option.addEventListener('click', () => {
        this.selectOption(index);
      });
    });
  }

  toggleDropdown() {
    if (this._disabled) return;
    
    if (this._open) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this._open = true;
    this.render();
    
    // 获取下拉菜单和选择框的DOM元素
    const dropdown = this.shadowRoot.querySelector('.select-dropdown');
    const selectField = this.shadowRoot.querySelector('.select-field');
    
    // 添加动画起点样式
    requestAnimationFrame(() => {
      dropdown.style.transformOrigin = 'top center';
    });
  }

  closeDropdown() {
    // 首先添加收回动画，然后等待动画完成后再更新DOM
    const dropdown = this.shadowRoot.querySelector('.select-dropdown');
    if (dropdown && dropdown.classList.contains('open')) {
      dropdown.classList.add('closing');
      dropdown.classList.remove('open');
      
      // 等待动画完成后再更新DOM
      setTimeout(() => {
        this._open = false;
        this.render();
      }, 200); // 匹配动画持续时间
    } else {
      this._open = false;
      this.render();
    }
  }

  selectOption(index) {
    if (this._disabled) return;
    
    const prevSelected = this._selectedIndex;
    this._selectedIndex = index;
    this._selectedValue = this._options[index].value;
    this.closeDropdown();
    
    // 仅当选择变化时触发事件
    if (prevSelected !== index) {
      const detail = { 
        index: index,
        value: this._options[index].value, 
        text: this._options[index].text 
      };
      
      this.dispatchEvent(new CustomEvent('change', { 
        detail: detail,
        bubbles: true, 
        composed: true 
      }));
    }
  }

  // 外部API方法
  get value() {
    return this._selectedValue;
  }

  set value(val) {
    const index = this._options.findIndex(opt => opt.value === val);
    if (index !== -1) {
      this._selectedIndex = index;
      this._selectedValue = val;
      this.render();
    }
  }

  get selectedIndex() {
    return this._selectedIndex;
  }

  set selectedIndex(index) {
    if (index >= -1 && index < this._options.length) {
      this._selectedIndex = index;
      this._selectedValue = index > -1 ? this._options[index].value : '';
      this.render();
    }
  }

  setOptions(options) {
    this._options = options;
    this._selectedIndex = -1;
    this._selectedValue = '';
    this.render();
  }

  getStyles() {
    const darkMode = this._theme === 'dark';
    const isBlur = this._variant === 'blur';
    
    const baseBackground = darkMode 
      ? 'rgba(30, 30, 30, 0.85)' 
      : 'rgba(255, 255, 255, 0.85)';
    
    const dropdownBackground = darkMode 
      ? 'rgba(40, 40, 40, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)';
    
    const textColor = darkMode ? '#ffffff' : '#333333';
    const placeholderColor = darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
    const borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const hoverColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const labelColor = darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
    
    return `
      :host {
        display: inline-block;
        position: relative;
        width: 100%;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      
      .select-container {
        position: relative;
        width: 100%;
      }

      .select-label {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
        color: ${labelColor};
      }
      
      .select-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 8px 12px;
        color: ${textColor};
        border: 1px solid ${borderColor};
        border-radius: 4px;
        cursor: ${this._disabled ? 'not-allowed' : 'pointer'};
        user-select: none;
        transition: all 0.2s ease;
        font-size: 14px;
        opacity: ${this._disabled ? '0.6' : '1'};
        box-sizing: border-box;
      }
      
      /* 亮色主题 - 高性能模式 */
      .theme-light.variant-performance .select-field {
        background: #ffffff;
      }
      
      /* 暗色主题 - 高性能模式 */
      .theme-dark.variant-performance .select-field {
        background: #1e1e1e;
      }
      
      /* 亮色主题 - 模糊模式 */
      .theme-light.variant-blur .select-field {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      /* 暗色主题 - 模糊模式 */
      .theme-dark.variant-blur .select-field {
        background: rgba(30, 30, 30, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .select-field:hover {
        background: ${this._disabled ? baseBackground : (darkMode ? 'rgba(50, 50, 50, 0.85)' : 'rgba(240, 240, 240, 0.85)')};
      }
      
      .select-value {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .select-placeholder {
        color: ${placeholderColor};
      }
      
      .select-arrow {
        margin-left: 5px;
        width: 12px;
        height: 12px;
        transition: transform 0.2s ease;
      }
      
      .select-arrow.open {
        transform: rotate(180deg);
      }
      
      .select-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 100;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        margin-top: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
        opacity: 0;
        transform: translateY(-8px);
        visibility: hidden;
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
        transform-origin: top center;
      }
      
      /* 亮色主题 - 高性能模式 */
      .theme-light.variant-performance .select-dropdown {
        background: #ffffff;
      }
      
      /* 暗色主题 - 高性能模式 */
      .theme-dark.variant-performance .select-dropdown {
        background: #1e1e1e;
      }
      
      /* 亮色主题 - 模糊模式 */
      .theme-light.variant-blur .select-dropdown {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      /* 暗色主题 - 模糊模式 */
      .theme-dark.variant-blur .select-dropdown {
        background: rgba(40, 40, 40, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .select-dropdown.open {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        animation: menuFadeIn 0.25s cubic-bezier(0.2, 0, 0.13, 1.5);
      }
      
      .select-dropdown.closing {
        opacity: 0;
        transform: translateY(-8px);
        visibility: visible;
        animation: menuFadeOut 0.2s cubic-bezier(0.55, 0, 0.55, 0.2);
      }
      
      @keyframes menuFadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes menuFadeOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-8px);
        }
      }
      
      .select-options {
        max-height: 200px;
        overflow-y: auto;
      }
      
      .select-option {
        padding: 8px 12px;
        cursor: pointer;
        color: ${textColor};
        transition: background 0.2s ease;
        font-size: 14px;
      }
      
      .select-option:hover {
        background: ${hoverColor};
      }
      
      .select-option.selected {
        background: ${darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
      }
      
      .select-empty {
        padding: 8px 12px;
        font-size: 14px;
        color: ${placeholderColor};
        font-style: italic;
      }
    `;
  }

  render() {
    const dropdownClass = this._open ? 'select-dropdown open' : 'select-dropdown';
    const arrowClass = this._open ? 'select-arrow open' : 'select-arrow';
    const themeClass = `theme-${this._theme}`;
    const variantClass = `variant-${this._variant}`;
    
    // 当前选中值
    let currentValueHtml = '';
    if (this._selectedIndex >= 0 && this._options[this._selectedIndex]) {
      currentValueHtml = `<div class="select-value">${this._options[this._selectedIndex].text}</div>`;
    } else {
      currentValueHtml = `<div class="select-value select-placeholder">${this._placeholder}</div>`;
    }
    
    // 创建选项HTML
    let optionsHtml = '';
    if (this._options.length === 0) {
      optionsHtml = '<div class="select-empty">无选项</div>';
    } else {
      this._options.forEach((option, index) => {
        const isSelected = index === this._selectedIndex;
        const selectedClass = isSelected ? 'select-option selected' : 'select-option';
        optionsHtml += `<div class="${selectedClass}" data-index="${index}">${option.text || ''}</div>`;
      });
    }
    
    // 标签HTML
    let labelHtml = '';
    if (this._label) {
      labelHtml = `<label class="select-label">${this._label}</label>`;
    }
    
    // 渲染组件
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="select-container ${themeClass} ${variantClass}">
        ${labelHtml}
        <div class="select-field">
          ${currentValueHtml}
          <svg class="${arrowClass}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="${dropdownClass}">
          <div class="select-options">
            ${optionsHtml}
          </div>
        </div>
      </div>
    `;
    
    // 重新添加事件监听器
    this.addEventListeners();
  }
}

// 注册组件
customElements.define('custom-select', CustomSelect);