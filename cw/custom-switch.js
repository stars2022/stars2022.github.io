class CustomSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initial state
    this._checked = false;
    this._label = this.getAttribute('label') || '开关';
    this._disabled = false;
    this._variant = this.getAttribute('variant') || 'blur'; // blur 或 performance
    this._theme = this.getAttribute('theme') || 'light'; // light 或 dark
    
    // Create component HTML and CSS
    this.render();
    
    // Bind events
    this.bindEvents();
  }
  
  static get observedAttributes() {
    return ['checked', 'label', 'disabled', 'variant', 'theme'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'checked') {
      this._checked = newValue !== null;
      this.updateSwitchState();
    } else if (name === 'label') {
      this._label = newValue || '开关';
      this.shadowRoot.querySelector('.switch-label').textContent = this._label;
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
  
  get checked() {
    return this._checked;
  }
  
  set checked(value) {
    if (this._checked === value) return;
    this._checked = value;
    
    if (value) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    
    this.updateSwitchState();
  }
  
  get label() {
    return this._label;
  }
  
  set label(value) {
    this._label = value;
    this.setAttribute('label', value);
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
    
    this.updateDisabledState();
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
  
  updateSwitchState() {
    const switchElement = this.shadowRoot.querySelector('.switch');
    const slider = this.shadowRoot.querySelector('.slider');
    
    if (this._checked) {
      switchElement.classList.add('on');
      slider.style.left = '31px';
    } else {
      switchElement.classList.remove('on');
      slider.style.left = '1px';
    }
    
    // 应用样式的逻辑转移到updateClasses方法中
    this.updateSliderStyle();
  }
  
  updateSliderStyle() {
    const switchElement = this.shadowRoot.querySelector('.switch');
    const slider = this.shadowRoot.querySelector('.slider');
    
    // 基于当前的variant和theme组合应用适当的样式
    if (this._variant === 'performance') {
      // 高性能模式：不使用模糊和复杂光效
      if (this._checked) {
        switchElement.style.background = 'linear-gradient(145deg,#5ECB71, #5ECB71)';
      } else {
        switchElement.style.background = 'linear-gradient(145deg,#E3E3E3, #E3E3E3)';
      }
      
      slider.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
    } else {
      // 模糊模式：使用透明和光效
      if (this._checked) {
        switchElement.style.background = 'linear-gradient(145deg, rgba(0, 123, 255, 0.3), rgba(0, 255, 123, 0.3))';
        slider.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 123, 255, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.6)';
      } else {
        switchElement.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.4))';
        slider.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.6)';
      }
    }
  }
  
  updateDisabledState() {
    const switchElement = this.shadowRoot.querySelector('.switch');
    
    if (this._disabled) {
      switchElement.classList.add('disabled');
      switchElement.style.opacity = '0.6';
      switchElement.style.cursor = 'not-allowed';
    } else {
      switchElement.classList.remove('disabled');
      switchElement.style.opacity = '1';
      switchElement.style.cursor = 'pointer';
    }
  }
  
  updateClasses() {
    const switchElement = this.shadowRoot.querySelector('.switch');
    
    if (switchElement) {
      // 重置所有类名
      switchElement.className = 'switch';
      // 添加当前的状态类
      if (this._checked) {
        switchElement.classList.add('on');
      }
      if (this._disabled) {
        switchElement.classList.add('disabled');
      }
      
      // 添加变体和主题类
      switchElement.classList.add(`variant-${this._variant}`);
      switchElement.classList.add(`theme-${this._theme}`);
      
      // 应用样式
      this.updateSliderStyle();
    }
  }
  
  bindEvents() {
    const switchElement = this.shadowRoot.querySelector('.switch');
    const slider = this.shadowRoot.querySelector('.slider');
    let isDragging = false;
    let initialX, initialLeft;
    
    switchElement.addEventListener('click', (event) => {
      if (this._disabled || isDragging) return;
      this.toggleSwitch();
    });
    
    const startDrag = (event) => {
      if (this._disabled) return;
      
      isDragging = true;
      initialX = event.clientX || event.touches[0].clientX;
      initialLeft = parseInt(window.getComputedStyle(slider).left, 10);
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('touchmove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchend', onMouseUp);
    };
    
    const onMouseMove = (event) => {
      const clientX = event.clientX || event.touches[0].clientX;
      const deltaX = clientX - initialX;
      let newLeft = initialLeft + deltaX;
      newLeft = Math.max(1, Math.min(newLeft, 31));
      slider.style.left = newLeft + 'px';
      
      // 如果是模糊模式，设置动态光效
      if (this._variant === 'blur') {
        const percentage = (newLeft - 1) / 30;
        const startColor = [255, 255, 255];
        const endColor = [0, 123, 255];
        const currentColor = startColor.map((start, index) => {
          return Math.round(start + (endColor[index] - start) * percentage);
        });
        switchElement.style.background = `linear-gradient(145deg, rgba(${currentColor.join(',')}, 0.3), rgba(0, 255, 123, 0.3))`;
        
        const glowIntensity = 0.6 * percentage;
        slider.style.boxShadow = `0 8px 15px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 123, 255, ${glowIntensity}), inset 0 0 8px rgba(255, 255, 255, 0.6)`;
      }
    };
    
    const onMouseUp = () => {
      if (!isDragging) return;
      
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
      
      const switchRect = switchElement.getBoundingClientRect();
      const sliderRect = slider.getBoundingClientRect();
      const switchCenter = switchRect.left + switchRect.width / 2;
      const sliderCenter = sliderRect.left + sliderRect.width / 2;
      
      this.checked = sliderCenter >= switchCenter;
      this.dispatchChangeEvent();
    };
    
    slider.addEventListener('mousedown', startDrag);
    slider.addEventListener('touchstart', startDrag);
    slider.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!this._disabled && !isDragging) {
        this.toggleSwitch();
      }
    });
  }
  
  toggleSwitch() {
    this.checked = !this.checked;
    this.dispatchChangeEvent();
  }
  
  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      detail: {
        checked: this._checked
      }
    }));
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        .switch-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .switch-label {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .switch {
          position: relative;
          width: 60px;
          height: 30px;
          border-radius: 15px;
          cursor: pointer;
          transition: background 0.3s ease, box-shadow 0.3s ease;
          transform: perspective(100px) translateZ(0);
          user-select: none;
        }
        
        /* 亮色主题 - 高性能模式（不使用透明、模糊和光效） */
        .switch.theme-light.variant-performance {
          background: linear-gradient(145deg, #e6e6e6, #f5f5f5);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .switch.theme-light.variant-performance.on {
          background: linear-gradient(145deg, #007bff, #00ff7b);
        }
        
        /* 亮色主题 - 模糊模式 */
        .switch.theme-light.variant-blur {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.4));
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        .switch.theme-light.variant-blur.on {
          background: linear-gradient(145deg, rgba(0, 123, 255, 0.3), rgba(0, 255, 123, 0.3));
        }
        
        /* 暗色主题 - 高性能模式 */
        .switch.theme-dark.variant-performance {
          background: linear-gradient(145deg, #333333, #444444);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          color: #ffffff;
        }
        .switch.theme-dark.variant-performance.on {
          background: linear-gradient(145deg, #007bff, #00ff7b);
        }
        
        /* 暗色主题 - 模糊模式 */
        .switch.theme-dark.variant-blur {
          background: linear-gradient(145deg, rgba(50, 50, 50, 0.2), rgba(80, 80, 80, 0.4));
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          color: #ffffff;
        }
        .switch.theme-dark.variant-blur.on {
          background: linear-gradient(145deg, rgba(0, 123, 255, 0.3), rgba(0, 255, 123, 0.3));
        }
        
        .slider {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          top: 1px;
          left: 1px;
          transition: left 0.3s, transform 0.3s, box-shadow 0.3s;
          transform: translateZ(0);
          user-select: none;
        }
        
        /* 高性能模式下的滑块样式 - 不使用透明和光效 */
        .switch.variant-performance .slider {
          background: #ffffff;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* 带模糊效果模式下的滑块样式 */
        .switch.variant-blur .slider {
          background: rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.6);
        }
        
        .slider:active {
          transform: scale(0.9) translateZ(0);
        }
        
        .switch.on .slider {
          left: 31px;
        }
        
        /* 高性能模式下开启状态的滑块 - 不使用光效 */
        .switch.variant-performance.on .slider {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* 带模糊效果模式下开启状态的滑块 - 带光效 */
        .switch.variant-blur.on .slider {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 123, 255, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.6);
        }
        
        /* 暗色主题下的滑块样式调整 */
        .switch.theme-dark .switch-label {
          color: #ffffff;
        }
      </style>
      <div class="switch-container">
        <span class="switch-label">${this._label}</span>
        <div class="switch variant-${this._variant} theme-${this._theme} ${this._checked ? 'on' : ''}" part="switch">
          <div class="slider" part="slider"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('custom-switch', CustomSwitch);