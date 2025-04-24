class CustomMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
    this._open = false;
    this._theme = 'light';
    this._variant = 'blur';
  }

  static get observedAttributes() {
    return ['theme', 'variant', 'label'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'theme' || name === 'variant') {
        this[`_${name}`] = newValue;
        this.render();
      } else if (name === 'label') {
        this._label = newValue;
        this.render();
      }
    }
  }

  connectedCallback() {
    this._label = this.getAttribute('label') || '菜单';
    this._theme = this.getAttribute('theme') || 'light';
    this._variant = this.getAttribute('variant') || 'blur';
    
    // 解析菜单项
    try {
      const itemsAttr = this.getAttribute('items');
      if (itemsAttr) {
        this._items = JSON.parse(itemsAttr);
      }
    } catch (e) {
      console.error('解析菜单项失败:', e);
      this._items = [];
    }
    
    this.render();
    this.addEventListeners();

    // 添加slot变化监听器
    this.shadowRoot.querySelector('slot')?.addEventListener('slotchange', () => {
      this.updateSlottedItems();
    });
  }

  updateSlottedItems() {
    // 获取所有分配给menu-item插槽的元素
    const slottedItems = this.shadowRoot.querySelector('slot[name="menu-item"]')?.assignedElements() || [];
    
    // 如果存在slot菜单项，则更新事件处理
    if (slottedItems.length > 0) {
      slottedItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          this.handleSlotItemClick(index, item);
          this.closeMenu();
        });
      });
    }
  }

  handleSlotItemClick(index, item) {
    // 触发菜单项点击事件
    const detail = { 
      index: index,
      item: item
    };
    
    this.dispatchEvent(new CustomEvent('menu-select', { 
      detail: detail,
      bubbles: true, 
      composed: true 
    }));
  }

  addEventListeners() {
    // 菜单切换
    this.shadowRoot.querySelector('.menu-button').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });
    
    // 点击外部关闭菜单
    document.addEventListener('click', () => {
      if (this._open) {
        this.closeMenu();
      }
    });
    
    // 阻止菜单内部点击冒泡
    this.shadowRoot.querySelector('.menu-dropdown').addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // 菜单项点击处理（针对非slot方式）
    if (this._items.length > 0) {
      this.shadowRoot.querySelectorAll('.menu-item').forEach((item, index) => {
        item.addEventListener('click', () => {
          this.handleItemClick(index);
        });
      });
    }
  }

  toggleMenu() {
    if (this._open) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this._open = true;
    this.render();
  }

  closeMenu() {
    this._open = false;
    this.render();
  }

  handleItemClick(index) {
    const item = this._items[index];
    this.closeMenu();
    
    // 触发菜单项点击事件
    const detail = { 
      index: index,
      value: item.value, 
      text: item.text 
    };
    
    this.dispatchEvent(new CustomEvent('menu-select', { 
      detail: detail,
      bubbles: true, 
      composed: true 
    }));
  }

  setItems(items) {
    this._items = items;
    this.render();
  }

  getStyles() {
    const darkMode = this._theme === 'dark';
    
    const textColor = darkMode ? '#ffffff' : '#333333';
    const borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const hoverColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    
    return `
      :host {
        display: inline-block;
        position: relative;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      
      .menu-container {
        position: relative;
      }
      
      .menu-button {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        color: ${textColor};
        border: 1px solid ${borderColor};
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        font-size: 14px;
      }
      
      /* 亮色主题 - 高性能模式 */
      .theme-light.variant-performance .menu-button {
        background: #ffffff;
      }
      
      /* 暗色主题 - 高性能模式 */
      .theme-dark.variant-performance .menu-button {
        background: #1e1e1e;
      }
      
      /* 亮色主题 - 模糊模式 */
      .theme-light.variant-blur .menu-button {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      /* 暗色主题 - 模糊模式 */
      .theme-dark.variant-blur .menu-button {
        background: rgba(30, 30, 30, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .menu-button:hover {
        background: ${darkMode ? 'rgba(50, 50, 50, 0.85)' : 'rgba(240, 240, 240, 0.85)'};
      }
      
      .menu-button svg {
        margin-left: 5px;
        width: 12px;
        height: 12px;
        transition: transform 0.2s ease;
      }
      
      .menu-button.open svg {
        transform: rotate(180deg);
      }
      
      .menu-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 100;
        min-width: 150px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        margin-top: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
        opacity: 0;
        transform: translateY(-10px);
        visibility: hidden;
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
      }
      
      /* 亮色主题 - 高性能模式 */
      .theme-light.variant-performance .menu-dropdown {
        background: #ffffff;
      }
      
      /* 暗色主题 - 高性能模式 */
      .theme-dark.variant-performance .menu-dropdown {
        background: #1e1e1e;
      }
      
      /* 亮色主题 - 模糊模式 */
      .theme-light.variant-blur .menu-dropdown {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      /* 暗色主题 - 模糊模式 */
      .theme-dark.variant-blur .menu-dropdown {
        background: rgba(40, 40, 40, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .menu-dropdown.open {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
      }
      
      .menu-items {
        max-height: 300px;
        overflow-y: auto;
      }
      
      .slotted-menu-items ::slotted([slot="menu-item"]) {
        display: block;
        padding: 8px 12px;
        cursor: pointer;
        color: ${textColor};
        transition: background 0.2s ease;
        font-size: 14px;
      }
      
      .slotted-menu-items ::slotted([slot="menu-item"]:hover) {
        background: ${hoverColor};
      }
      
      .menu-item {
        padding: 8px 12px;
        cursor: pointer;
        color: ${textColor};
        transition: background 0.2s ease;
        font-size: 14px;
      }
      
      .menu-item:hover {
        background: ${hoverColor};
      }
      
      .menu-separator {
        height: 1px;
        background: ${borderColor};
        margin: 4px 0;
      }
    `;
  }

  render() {
    const dropdownClass = this._open ? 'menu-dropdown open' : 'menu-dropdown';
    const buttonClass = this._open ? 'menu-button open' : 'menu-button';
    const themeClass = `theme-${this._theme}`;
    const variantClass = `variant-${this._variant}`;
    
    // 创建菜单项HTML（针对非slot方式）
    let itemsHtml = '';
    if (this._items.length > 0) {
      this._items.forEach((item, index) => {
        if (item.type === 'separator') {
          itemsHtml += `<div class="menu-separator"></div>`;
        } else {
          itemsHtml += `<div class="menu-item" data-index="${index}">${item.text || ''}</div>`;
        }
      });
    }
    
    // 渲染组件
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="menu-container ${themeClass} ${variantClass}">
        <div class="${buttonClass}">
          ${this._label}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="${dropdownClass}">
          <div class="menu-items">
            ${this._items.length > 0 ? itemsHtml : ''}
            <div class="slotted-menu-items">
              <slot name="menu-item"></slot>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 重新添加事件监听器
    this.addEventListeners();
    // 更新slot菜单项
    this.updateSlottedItems();
  }
}

// 注册组件
customElements.define('custom-menu', CustomMenu);