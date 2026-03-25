// Shadow DOM isolated floating back button + loading indicator
(() => {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = `
    <style>
      a {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 8px 16px;
        border-radius: 20px;
        text-decoration: none;
        font: 14px/1 system-ui, -apple-system, sans-serif;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: opacity 0.2s;
        user-select: none;
      }
      a:hover {
        opacity: 0.8;
      }
    </style>
    <a href="/followAI/">← followAI</a>
  `;
  document.body.appendChild(host);
})();
