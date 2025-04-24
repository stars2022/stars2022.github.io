// CustomPersona 组件
// 用于展示个人资料信息，包括头像、姓名、职位和简介

class CustomPersona extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['name', 'title', 'avatar', 'description', 'theme', 'variant', 'size'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    // 添加点击事件监听
    const personaContent = this.shadowRoot.querySelector('.persona-content');
    if (personaContent) {
      personaContent.addEventListener('click', this.handleClick.bind(this));
    }
  }

  disconnectedCallback() {
    // 移除事件监听
    const personaContent = this.shadowRoot.querySelector('.persona-content');
    if (personaContent) {
      personaContent.removeEventListener('click', this.handleClick.bind(this));
    }
  }

  handleClick() {
    // 触发自定义事件
    const event = new CustomEvent('persona-click', {
      bubbles: true,
      composed: true,
      detail: {
        name: this.getAttribute('name'),
        title: this.getAttribute('title')
      }
    });
    this.dispatchEvent(event);
  }

  getSizeStyles() {
    const size = this.getAttribute('size') || 'medium';
    
    const sizes = {
      small: {
        containerPadding: '8px',
        avatarSize: '40px',
        nameSize: '16px',
        titleSize: '12px',
        descSize: '12px',
        width: '220px'
      },
      medium: {
        containerPadding: '12px',
        avatarSize: '60px',
        nameSize: '18px',
        titleSize: '14px',
        descSize: '14px',
        width: '280px'
      },
      large: {
        containerPadding: '16px',
        avatarSize: '80px',
        nameSize: '22px',
        titleSize: '16px',
        descSize: '15px',
        width: '320px'
      }
    };
    
    return sizes[size] || sizes.medium;
  }

  render() {
    const name = this.getAttribute('name') || '未知姓名';
    const title = this.getAttribute('title') || '';
    const avatar = this.getAttribute('avatar') || '';
    const description = this.getAttribute('description') || '';
    const theme = this.getAttribute('theme') || 'light';
    const variant = this.getAttribute('variant') || 'blur';
    
    const sizeStyles = this.getSizeStyles();
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#333333';
    const secondaryTextColor = isDark ? '#cccccc' : '#666666';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: ${sizeStyles.width};
          border-radius: 15px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: all 0.3s ease;
          cursor: pointer;
          padding: 20px;
          box-sizing: border-box;
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

        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        .persona-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }
        
        .persona-avatar {
          width: ${sizeStyles.avatarSize};
          height: ${sizeStyles.avatarSize};
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 15px;
          border: 1px solid ${borderColor};
        }
        
        .persona-info {
          text-align: center;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .persona-name {
          margin: 0 0 5px 0;
          font-size: ${sizeStyles.nameSize};
          font-weight: 600;
          text-align: center;
        }
        
        .persona-title {
          margin: 0 0 8px 0;
          font-size: ${sizeStyles.titleSize};
          color: ${secondaryTextColor};
          text-align: center;
        }
        
        .persona-description {
          font-size: ${sizeStyles.descSize};
          margin: 0;
          color: ${secondaryTextColor};
          line-height: 1.4;
          text-align: center;
          max-width: 100%;
        }
        
        .social-links {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          justify-content: center;
        }
        
        .social-link {
          width: 24px;
          height: 24px;
          color: ${secondaryTextColor};
        }

        /* 实现响应式设计 */
        @media (max-width: 768px) {
          .card {
            width: 100%;
            max-width: ${sizeStyles.width};
          }
        }
      </style>
      
      <div class="card variant-${variant} theme-${theme}">
        <div class="persona-content">
          ${avatar ? `<img src="${avatar}" alt="${name}" class="persona-avatar">` : 
           `<div class="persona-avatar" style="background-color: ${secondaryTextColor}; display: flex; justify-content: center; align-items: center; color: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'}; font-size: ${parseInt(sizeStyles.avatarSize)/2}px;">
              ${name.charAt(0).toUpperCase()}
            </div>`}
          <div class="persona-info">
            <h3 class="persona-name">${name}</h3>
            ${title ? `<p class="persona-title">${title}</p>` : ''}
            ${description ? `<p class="persona-description">${description}</p>` : ''}
          </div>
          <slot name="social-links"></slot>
        </div>
      </div>
    `;
  }
}

// 注册自定义元素
customElements.define('custom-persona', CustomPersona);