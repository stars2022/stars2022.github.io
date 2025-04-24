class CustomSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initial state
    this._value = parseFloat(this.getAttribute('value')) || 0;
    this._min = parseFloat(this.getAttribute('min')) || 0;
    this._max = parseFloat(this.getAttribute('max')) || 100;
    this._step = parseFloat(this.getAttribute('step')) || 1;
    this._label = this.getAttribute('label') || 'Slider';
    this._disabled = false;
    this._variant = this.getAttribute('variant') || 'blur'; // blur 或 performance
    this._theme = this.getAttribute('theme') || 'light'; // light 或 dark
    this._orientation = this.getAttribute('orientation') || 'horizontal'; // horizontal 或 vertical
    this._showValue = this.getAttribute('show-value') !== 'false'; // 是否显示当前值
    this._valueText = this.getAttribute('value-text') || null; // 自定义值文本
    
    // Ensure value is within range
    this._value = Math.max(this._min, Math.min(this._max, this._value));
    
    // Create component HTML and CSS
    this.render();
    
    // Bind events
    this.bindEvents();
  }
  
  static get observedAttributes() {
    return ['value', 'min', 'max', 'step', 'label', 'disabled', 'variant', 'theme', 'orientation', 'show-value', 'value-text'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch(name) {
      case 'value':
        this._value = parseFloat(newValue) || 0;
        this._value = Math.max(this._min, Math.min(this._max, this._value));
        this.updateSliderPosition();
        break;
      case 'min':
        this._min = parseFloat(newValue) || 0;
        this._value = Math.max(this._min, Math.min(this._max, this._value));
        this.updateSliderPosition();
        break;
      case 'max':
        this._max = parseFloat(newValue) || 100;
        this._value = Math.max(this._min, Math.min(this._max, this._value));
        this.updateSliderPosition();
        break;
      case 'step':
        this._step = parseFloat(newValue) || 1;
        break;
      case 'label':
        this._label = newValue || 'Slider';
        this.shadowRoot.querySelector('.slider-label').textContent = this._label;
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        this.updateDisabledState();
        break;
      case 'variant':
        this._variant = newValue || 'blur';
        this.updateClasses();
        break;
      case 'theme':
        this._theme = newValue || 'light';
        this.updateClasses();
        break;
      case 'orientation':
        this._orientation = newValue || 'horizontal';
        this.updateOrientation();
        break;
      case 'show-value':
        this._showValue = newValue !== 'false';
        this.updateValueDisplay();
        break;
      case 'value-text':
        this._valueText = newValue;
        this.updateValueDisplay();
        break;
    }
  }
  
  get value() {
    return this._value;
  }
  
  set value(val) {
    const newValue = parseFloat(val);
    if (isNaN(newValue)) return;
    
    // Ensure the value is within min and max
    const boundedValue = Math.max(this._min, Math.min(this._max, newValue));
    
    // Round to the nearest step
    const steps = Math.round((boundedValue - this._min) / this._step);
    const steppedValue = this._min + (steps * this._step);
    
    // Apply precision to avoid floating-point errors
    const precision = this.getPrecision(this._step);
    this._value = parseFloat(steppedValue.toFixed(precision));
    
    this.setAttribute('value', this._value);
    this.updateSliderPosition();
    this.updateValueDisplay();
  }
  
  getPrecision(step) {
    const stepStr = step.toString();
    const decimal = stepStr.indexOf('.');
    return decimal === -1 ? 0 : stepStr.length - decimal - 1;
  }
  
  updateSliderPosition() {
    const track = this.shadowRoot.querySelector('.slider-track');
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    const progress = this.shadowRoot.querySelector('.slider-progress');
    
    if (!track || !thumb || !progress) return;
    
    // Calculate percentage of value within range
    const percentage = ((this._value - this._min) / (this._max - this._min)) * 100;
    
    if (this._orientation === 'horizontal') {
      thumb.style.left = `${percentage}%`;
      progress.style.width = `${percentage}%`;
    } else {
      thumb.style.bottom = `${percentage}%`;
      progress.style.height = `${percentage}%`;
    }
    
    // Update ARIA values
    thumb.setAttribute('aria-valuenow', this._value);
    
    if (this._valueText) {
      thumb.setAttribute('aria-valuetext', this._valueText.replace('{value}', this._value));
    } else {
      thumb.removeAttribute('aria-valuetext');
    }
    
    this.updateTrackStyle(percentage);
  }
  
  updateTrackStyle(percentage) {
    const track = this.shadowRoot.querySelector('.slider-track');
    const progress = this.shadowRoot.querySelector('.slider-progress');
    
    if (this._variant === 'blur') {
      // 模糊模式：使用透明和光效
      if (this._theme === 'light') {
        progress.style.background = `linear-gradient(145deg, rgba(0, 123, 255, 0.3), rgba(0, 255, 123, 0.3))`;
      } else {
        progress.style.background = `linear-gradient(145deg, rgba(0, 123, 255, 0.5), rgba(0, 255, 123, 0.5))`;
      }
    } else {
      // 高性能模式：不使用模糊和复杂光效
      if (this._theme === 'light') {
        progress.style.background = `linear-gradient(145deg, #5ECB71, #007bff)`;
      } else {
        progress.style.background = `linear-gradient(145deg, #008f45, #005bb9)`;
      }
    }
  }
  
  updateDisabledState() {
    const sliderContainer = this.shadowRoot.querySelector('.slider-container');
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    
    if (this._disabled) {
      sliderContainer.classList.add('disabled');
      thumb.setAttribute('aria-disabled', 'true');
      thumb.style.cursor = 'not-allowed';
    } else {
      sliderContainer.classList.remove('disabled');
      thumb.setAttribute('aria-disabled', 'false');
      thumb.style.cursor = 'grab';
    }
  }
  
  updateClasses() {
    const sliderContainer = this.shadowRoot.querySelector('.slider-container');
    const track = this.shadowRoot.querySelector('.slider-track');
    
    if (sliderContainer && track) {
      // Apply variant and theme classes
      track.className = 'slider-track';
      track.classList.add(`variant-${this._variant}`);
      track.classList.add(`theme-${this._theme}`);
      
      this.updateSliderPosition();
    }
  }
  
  updateOrientation() {
    const sliderContainer = this.shadowRoot.querySelector('.slider-container');
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    
    if (sliderContainer) {
      sliderContainer.classList.remove('horizontal', 'vertical');
      sliderContainer.classList.add(this._orientation);
      
      if (thumb) {
        thumb.setAttribute('aria-orientation', this._orientation);
      }
      
      this.updateSliderPosition();
    }
  }
  
  updateValueDisplay() {
    const valueDisplay = this.shadowRoot.querySelector('.slider-value');
    
    if (valueDisplay) {
      if (this._showValue) {
        valueDisplay.style.display = 'block';
        
        if (this._valueText) {
          valueDisplay.textContent = this._valueText.replace('{value}', this._value);
        } else {
          valueDisplay.textContent = this._value;
        }
      } else {
        valueDisplay.style.display = 'none';
      }
    }
  }
  
  bindEvents() {
    const track = this.shadowRoot.querySelector('.slider-track');
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    let isDragging = false;
    let startPosition, startValue;
    
    const startDrag = (event) => {
      if (this._disabled) return;
      
      isDragging = true;
      this.setFocus();
      
      // Record starting position
      if (this._orientation === 'horizontal') {
        startPosition = this.getEventPosition(event, 'x');
        const trackRect = track.getBoundingClientRect();
        startValue = this._value;
      } else {
        startPosition = this.getEventPosition(event, 'y');
        const trackRect = track.getBoundingClientRect();
        startValue = this._value;
      }
      
      // Add drag style
      thumb.style.cursor = 'grabbing';
      
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
      
      // Prevent default to avoid text selection during drag
      event.preventDefault();
    };
    
    const onMove = (event) => {
      if (!isDragging) return;
      
      // Calculate new position and value
      const trackRect = track.getBoundingClientRect();
      let newValue;
      
      if (this._orientation === 'horizontal') {
        const currentPosition = this.getEventPosition(event, 'x');
        const deltaRatio = (currentPosition - startPosition) / trackRect.width;
        const deltaValue = deltaRatio * (this._max - this._min);
        newValue = startValue + deltaValue;
      } else {
        const currentPosition = this.getEventPosition(event, 'y');
        const deltaRatio = (startPosition - currentPosition) / trackRect.height;
        const deltaValue = deltaRatio * (this._max - this._min);
        newValue = startValue + deltaValue;
      }
      
      this.value = newValue;
      this.dispatchChangeEvent();
      
      // Prevent scrolling on touch devices
      event.preventDefault();
    };
    
    const onEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      thumb.style.cursor = 'grab';
      
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      
      this.dispatchInputEvent();
    };
    
    // Track click handler
    track.addEventListener('click', (event) => {
      if (this._disabled) return;
      
      const trackRect = track.getBoundingClientRect();
      let percentage;
      
      if (this._orientation === 'horizontal') {
        const clickPosition = this.getEventPosition(event, 'x');
        percentage = (clickPosition - trackRect.left) / trackRect.width;
      } else {
        const clickPosition = this.getEventPosition(event, 'y');
        percentage = 1 - ((clickPosition - trackRect.top) / trackRect.height);
      }
      
      // Convert percentage to value within range
      const newValue = this._min + percentage * (this._max - this._min);
      this.value = newValue;
      
      this.dispatchChangeEvent();
      this.dispatchInputEvent();
      this.setFocus();
    });
    
    // Thumb event listeners
    thumb.addEventListener('mousedown', startDrag);
    thumb.addEventListener('touchstart', startDrag, { passive: false });
    
    // Keyboard navigation
    thumb.addEventListener('keydown', (event) => {
      if (this._disabled) return;
      
      let newValue = this._value;
      const bigStep = this._step * 10; // For page up/down
      
      switch(event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newValue += this._orientation === 'vertical' && event.key === 'ArrowUp' ? this._step : 
                     this._orientation === 'horizontal' && event.key === 'ArrowRight' ? this._step : 0;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue -= this._orientation === 'vertical' && event.key === 'ArrowDown' ? this._step : 
                     this._orientation === 'horizontal' && event.key === 'ArrowLeft' ? this._step : 0;
          break;
        case 'Home':
          newValue = this._min;
          break;
        case 'End':
          newValue = this._max;
          break;
        case 'PageUp':
          newValue += bigStep;
          break;
        case 'PageDown':
          newValue -= bigStep;
          break;
        default:
          return; // Exit if not handling this key
      }
      
      // Apply new value
      if (newValue !== this._value) {
        this.value = newValue;
        this.dispatchChangeEvent();
        this.dispatchInputEvent();
        event.preventDefault(); // Prevent page scrolling
      }
    });
    
    // Set focus when clicked
    thumb.addEventListener('click', (event) => {
      this.setFocus();
      event.stopPropagation();
    });
  }
  
  getEventPosition(event, axis) {
    // Get position from mouse or touch event
    const eventToUse = event.touches ? event.touches[0] : event;
    return axis === 'x' ? eventToUse.clientX : eventToUse.clientY;
  }
  
  setFocus() {
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    thumb.focus();
  }
  
  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      detail: {
        value: this._value
      }
    }));
  }
  
  dispatchInputEvent() {
    this.dispatchEvent(new CustomEvent('input', {
      bubbles: true,
      detail: {
        value: this._value
      }
    }));
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 100%;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .slider-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        
        .slider-label {
          font-size: 14px;
          font-weight: 500;
        }
        
        .slider-value {
          font-size: 14px;
          color: #666;
        }
        
        .slider-container {
          position: relative;
          touch-action: none;
        }
        
        /* Horizontal orientation */
        .slider-container.horizontal {
          height: 50px;
          width: 100%;
        }
        
        /* Vertical orientation */
        .slider-container.vertical {
          height: 200px;
          width: 50px;
        }
        
        .slider-track {
          position: absolute;
          border-radius: 10px;
          transition: background 0.3s ease, box-shadow 0.3s ease;
          transform: perspective(100px) translateZ(0);
        }
        
        /* Horizontal track */
        .slider-container.horizontal .slider-track {
          top: 50%;
          left: 0;
          width: 100%;
          height: 8px;
          transform: translateY(-50%);
        }
        
        /* Vertical track */
        .slider-container.vertical .slider-track {
          bottom: 0;
          left: 50%;
          width: 8px;
          height: 100%;
          transform: translateX(-50%);
        }
        
        .slider-progress {
          position: absolute;
          border-radius: 10px;
          transition: width 0.1s ease, height 0.1s ease, background 0.3s ease;
        }
        
        /* Horizontal progress */
        .slider-container.horizontal .slider-progress {
          top: 0;
          left: 0;
          height: 100%;
          width: 0%;
        }
        
        /* Vertical progress */
        .slider-container.vertical .slider-progress {
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0%;
        }
        
        .slider-thumb {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          cursor: grab;
          transition: transform 0.1s ease, box-shadow 0.3s ease;
          user-select: none;
          z-index: 10;
          outline: none;
        }
        
        .slider-thumb:focus {
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4);
        }
        
        .slider-thumb:active {
          transform: scale(0.95);
          cursor: grabbing;
        }
        
        /* Horizontal thumb */
        .slider-container.horizontal .slider-thumb {
          top: 50%;
          left: 0%;
          transform: translate(-50%, -50%);
        }
        
        /* Vertical thumb */
        .slider-container.vertical .slider-thumb {
          bottom: 0%;
          left: 50%;
          transform: translate(-50%, 50%);
        }
        
        /* Styles for light theme - performance variant */
        .slider-track.theme-light.variant-performance {
          background: linear-gradient(145deg, #e6e6e6, #f5f5f5);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* Styles for light theme - blur variant */
        .slider-track.theme-light.variant-blur {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.4));
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        
        /* Styles for dark theme - performance variant */
        .slider-track.theme-dark.variant-performance {
          background: linear-gradient(145deg, #333333, #444444);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        /* Styles for dark theme - blur variant */
        .slider-track.theme-dark.variant-blur {
          background: linear-gradient(145deg, rgba(50, 50, 50, 0.2), rgba(80, 80, 80, 0.4));
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        
        /* Thumb styles based on theme and variant */
        .slider-track.theme-light.variant-performance + .slider-thumb {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        .slider-track.theme-light.variant-blur + .slider-thumb {
          background: rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.6);
        }
        
        .slider-track.theme-dark.variant-performance + .slider-thumb {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }
        
        .slider-track.theme-dark.variant-blur + .slider-thumb {
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3), inset 0 0 8px rgba(255, 255, 255, 0.4);
        }
        
        /* Disabled state */
        .slider-container.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .slider-container.disabled .slider-track,
        .slider-container.disabled .slider-thumb {
          cursor: not-allowed;
        }
        
        /* Dark theme text colors */
        .theme-dark .slider-label,
        .theme-dark .slider-value {
          color: #ffffff;
        }
      </style>
      <div class="slider-wrapper">
        <div class="slider-header">
          <span class="slider-label">${this._label}</span>
          <span class="slider-value" style="display: ${this._showValue ? 'block' : 'none'}">${this._value}</span>
        </div>
        <div class="slider-container ${this._orientation} ${this._disabled ? 'disabled' : ''}">
          <div class="slider-track variant-${this._variant} theme-${this._theme}" part="track">
            <div class="slider-progress" part="progress"></div>
          </div>
          <div class="slider-thumb" 
               part="thumb"
               role="slider"
               tabindex="0"
               aria-valuemin="${this._min}"
               aria-valuemax="${this._max}"
               aria-valuenow="${this._value}"
               ${this._valueText ? `aria-valuetext="${this._valueText.replace('{value}', this._value)}"` : ''}
               aria-orientation="${this._orientation}"
               aria-disabled="${this._disabled}">
          </div>
        </div>
      </div>
    `;
    
    // Initialize slider position
    this.updateSliderPosition();
  }
}

customElements.define('custom-slider', CustomSlider);