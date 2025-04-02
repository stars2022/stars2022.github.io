class CustomNotification extends HTMLElement {
  // 保存当前显示的所有通知
  static activeNotifications = [];
  // 通知之间的间距
  static NOTIFICATION_GAP = 10;
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initial state
    this._message = this.getAttribute('message') || '通知消息';
    this._duration = parseInt(this.getAttribute('duration') || '5000', 10);
    this._variant = this.getAttribute('variant') || 'blur'; // blur 或 performance
    this._theme = this.getAttribute('theme') || 'light'; // light 或 dark
    this._type = this.getAttribute('type') || 'info'; // info, success, warning, error
    this._visible = false;
    this._timeoutId = null;
    
    // 创建组件HTML和CSS
    this.render();
    
    // 加入到活动通知列表，新通知加到列表最前面
    CustomNotification.activeNotifications.unshift(this);
    
    // 立即显示
    this.show();
  }
  
  static get observedAttributes() {
    return ['message', 'duration', 'variant', 'theme', 'type'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'message') {
      this._message = newValue || '通知消息';
      this.updateMessage();
    } else if (name === 'duration') {
      this._duration = parseInt(newValue || '3000', 10);
    } else if (name === 'variant') {
      this._variant = newValue || 'blur';
      this.updateClasses();
    } else if (name === 'theme') {
      this._theme = newValue || 'light';
      this.updateClasses();
    } else if (name === 'type') {
      this._type = newValue || 'info';
      this.updateClasses();
    }
  }
  
  get message() {
    return this._message;
  }
  
  set message(value) {
    this._message = value;
    this.setAttribute('message', value);
  }
  
  get duration() {
    return this._duration;
  }
  
  set duration(value) {
    this._duration = value;
    this.setAttribute('duration', value.toString());
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
  
  get type() {
    return this._type;
  }
  
  set type(value) {
    this._type = value;
    this.setAttribute('type', value);
  }
  
  updateMessage() {
    const messageElement = this.shadowRoot.querySelector('.notification-message');
    if (messageElement) {
      messageElement.textContent = this._message;
    }
  }
  
  updateClasses() {
    const notification = this.shadowRoot.querySelector('.notification');
    if (notification) {
      // 重置所有类名
      notification.className = 'notification';
      
      // 添加变体和主题类
      notification.classList.add(`variant-${this._variant}`);
      notification.classList.add(`theme-${this._theme}`);
      notification.classList.add(`type-${this._type}`);
      
      // 添加可见状态
      if (this._visible) {
        notification.classList.add('visible');
      }
    }
  }
  
  // 显示通知
  show() {
    if (this._visible) return;
    
    this._visible = true;
    
    // 更新样式
    const notification = this.shadowRoot.querySelector('.notification');
    if (notification) {
      notification.classList.add('visible');
    }
    
    // 更新所有通知的位置
    CustomNotification.updateAllPositions();
    
    // 设置自动关闭
    if (this._duration > 0) {
      this._timeoutId = setTimeout(() => {
        this.close();
      }, this._duration);
    }
    
    // 绑定关闭按钮事件
    const closeBtn = this.shadowRoot.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }
  }
  
  // 关闭通知
  close() {
    if (!this._visible) return;
    
    this._visible = false;
    
    // 清除定时器
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
    
    // 更新样式，触发退出动画
    const notification = this.shadowRoot.querySelector('.notification');
    if (notification) {
      // 移除visible类并添加closing类以应用退出动画
      notification.classList.remove('visible');
      notification.classList.add('closing');
      
      // 动画结束后移除元素
      notification.addEventListener('animationend', () => {
        // 从活动通知列表中移除
        const index = CustomNotification.activeNotifications.indexOf(this);
        if (index > -1) {
          CustomNotification.activeNotifications.splice(index, 1);
          // 更新其他通知的位置
          CustomNotification.updateAllPositions();
        }
        
        // 从DOM中移除
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      }, { once: true });
    }
  }
  
  // 更新位置
  updatePosition() {
    const notification = this.shadowRoot.querySelector('.notification');
    if (!notification) return;
    
    const index = CustomNotification.activeNotifications.indexOf(this);
    if (index > -1) {
      const offset = index * (notification.offsetHeight + CustomNotification.NOTIFICATION_GAP);
      notification.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out, top 0.3s ease-out';
      notification.style.top = `${offset}px`;
    }
  }
  
  // 更新所有通知的位置
  static updateAllPositions() {
    CustomNotification.activeNotifications.forEach((notification, index) => {
      notification.updatePosition();
    });
  }
  
  // 创建并显示新通知的静态方法
  static show(options = {}) {
    const notification = document.createElement('custom-notification');
    
    if (options.message) {
      notification.setAttribute('message', options.message);
    }
    
    if (options.duration !== undefined) {
      notification.setAttribute('duration', options.duration.toString());
    }
    
    if (options.variant) {
      notification.setAttribute('variant', options.variant);
    }
    
    if (options.theme) {
      notification.setAttribute('theme', options.theme);
    }
    
    if (options.type) {
      notification.setAttribute('type', options.type);
    }
    
    document.body.appendChild(notification);
    return notification;
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 1000;
          pointer-events: none;
        }
        
        .notification {
          position: absolute;
          top: 0;
          right: 20px;
          min-width: 280px;
          max-width: 350px;
          padding: 16px;
          border-radius: 15px;
          margin-top: 20px;
          transform: translateX(120%) scale(0.8);
          opacity: 0;
          pointer-events: all;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          will-change: transform, opacity, top;
        }
        
        @keyframes notification-enter {
          0% { transform: translateX(120%) scale(0.8); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        
        @keyframes notification-exit {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(120%) scale(0.8); opacity: 0; }
        }
        
        .notification.visible {
          animation: notification-enter 0.3s ease-out forwards;
        }
        
        .notification.closing {
          animation: notification-exit 0.3s ease-in forwards;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-message {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .notification-close {
          position: absolute;
          top: -6px;
          left: -8px;
          background:rgb(154, 155, 156);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease, transform 0.2s ease;
          opacity: 0;
          z-index: 2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .notification:hover .notification-close {
          opacity: 1;
        }
        
        .notification.theme-dark .notification-close {
          background:rgba(43, 44, 44, 0.98);
          border: 1px solid rgba(70, 70, 70, 0.5);
        }

        .notification.theme-light .notification-close {
          background:rgb(255, 255, 255);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        .notification-close::before,
        .notification-close::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 1.5px;
        }
        
        /* 亮色主题下叉号为深色 */
        .notification.theme-light .notification-close::before,
        .notification.theme-light .notification-close::after {
          background-color: #939394;
        }
        
        /* 暗色主题下叉号为浅色 */
        .notification.theme-dark .notification-close::before,
        .notification.theme-dark .notification-close::after {
          background-color: #7F8080;
        }
        
        .notification-close::before {
          transform: rotate(45deg);
        }
        
        .notification-close::after {
          transform: rotate(-45deg);
        }
        
        /* 亮色主题 - 高性能模式 */
        .notification.theme-light.variant-performance {
          background-color: #ffffff;
          color: #333333;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        /* 亮色主题 - 毛玻璃模式 */
        .notification.theme-light.variant-blur {
          background:rgba(255, 255, 255, 0.75);
          color: #333333;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        /* 暗色主题 - 高性能模式 */
        .notification.theme-dark.variant-performance {
          background-color: #333333;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        /* 暗色主题 - 毛玻璃模式 */
        .notification.theme-dark.variant-blur {
          background: rgba(44, 45, 46, 0.75);
          color: #ffffff;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(70, 70, 70, 0.5);
        }
        
        /* 通知类型样式 */
        .notification.type-info {
          border-left: 4px solid #2196F3;
        }
        
        .notification.type-success {
          border-left: 4px solid #4CAF50;
        }
        
        .notification.type-warning {
          border-left: 4px solid #FF9800;
        }
        
        .notification.type-error {
          border-left: 4px solid #F44336;
        }
      </style>
      
      <div class="notification variant-${this._variant} theme-${this._theme} type-${this._type}">
        <div class="notification-content">
          <p class="notification-message">${this._message}</p>
        </div>
        <button class="notification-close" aria-label="关闭通知"></button>
      </div>
    `;
  }
  
  disconnectedCallback() {
    // 清除定时器
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
    
    // 从活动通知列表中移除
    const index = CustomNotification.activeNotifications.indexOf(this);
    if (index > -1) {
      CustomNotification.activeNotifications.splice(index, 1);
      // 更新其他通知的位置
      CustomNotification.updateAllPositions();
    }
  }
}

customElements.define('custom-notification', CustomNotification);