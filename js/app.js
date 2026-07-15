// --- GLOBAL STATE ---
let cart = [];
let activeTab = "propuesta"; // Current SPA route: propuesta, demo-web, admin-panel, portafolio
let selectedCategoryFilter = "Todos";
let searchQuery = "";

// --- INIT APP ---
document.addEventListener("DOMContentLoaded", () => {
  setupRouting();
  renderCatalog();
  initQuotes();
  renderAdmin();
  
  // Connect cart backdrop click
  const backdrop = document.getElementById("drawerBackdrop");
  if (backdrop) {
    backdrop.addEventListener("click", toggleCartDrawer);
  }

  // Setup search input
  const searchInput = document.getElementById("catalogSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCatalog();
    });
  }

  // Default toast
  showToast("Portal de Propuesta Cargado. Explora el Demo de Concepto.", "success");
});

// --- SPA ROUTING ---
function setupRouting() {
  const links = document.querySelectorAll(".nav-link");
  
  // Read hash on load
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    if (["propuesta", "demo-web", "admin-panel", "portafolio"].includes(hash)) {
      activeTab = hash;
    }
  }

  switchTab(activeTab);

  // Link click handlers
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabName = link.getAttribute("href").substring(1);
      window.location.hash = tabName;
      switchTab(tabName);
    });
  });

  // Watch hash change
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1);
    if (["propuesta", "demo-web", "admin-panel", "portafolio"].includes(hash)) {
      switchTab(hash);
    }
  });
}

function switchTab(tabName) {
  activeTab = tabName;
  
  // Update nav active classes
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => {
    if (link.getAttribute("href") === `#${tabName}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Show/Hide section content
  const sections = document.querySelectorAll(".tab-content");
  sections.forEach(sec => {
    if (sec.id === `section-${tabName}`) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update layout if admin is active
  if (tabName === "admin-panel") {
    renderAdmin();
  }
}

// --- WOOCOMMERCE CATALOG SYSTEM ---
function filterCatalogCategory(category) {
  selectedCategoryFilter = category;
  
  // Highlight active filter button
  const filters = document.querySelectorAll(".filter-label");
  filters.forEach(filter => {
    const radio = filter.querySelector("input");
    if (radio && radio.value === category) {
      radio.checked = true;
    }
  });

  renderCatalog();
}

function renderCatalog() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  grid.innerHTML = "";

  // Filter products
  const filtered = products.filter(p => {
    const matchesCategory = selectedCategoryFilter === "Todos" || p.category === selectedCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px; display:block;"></i>
        No se encontraron repuestos o servicios que coincidan con la búsqueda.
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    // Icon selection
    let iconClass = "fa-cog";
    if (p.icon === "bolt") iconClass = "fa-bolt";
    if (p.icon === "droplet") iconClass = "fa-droplet";
    if (p.icon === "toggle-right") iconClass = "fa-toggle-on";
    if (p.icon === "wrench") iconClass = "fa-wrench";
    if (p.icon === "layout") iconClass = "fa-drafting-compass";
    if (p.icon === "file-text") iconClass = "fa-file-signature";
    if (p.icon === "activity") iconClass = "fa-chart-line";

    const formattedPrice = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(p.price);
    const badgeTaxClass = p.taxStatus === "afecto" ? "tax-afecto" : "tax-exento";

    card.innerHTML = `
      <div class="product-img-wrapper">
        <span class="product-tax-badge ${badgeTaxClass}">${p.taxStatus}</span>
        <i class="fas ${iconClass} product-icon"></i>
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h4 class="product-name">${p.name}</h4>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">${p.description}</p>
        <div class="product-footer">
          <div class="product-price">
            ${formattedPrice}
            <span>${p.taxStatus === 'afecto' ? '+ IVA' : 'Exento'}</span>
          </div>
          <button class="btn btn-primary btn-icon" onclick="addToCart(${p.id})">
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- SHOPPING CART STATE & CALCULATIONS ---
function toggleCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  
  if (drawer.classList.contains("open")) {
    drawer.classList.remove("open");
    backdrop.classList.remove("active");
  } else {
    drawer.classList.add("open");
    backdrop.classList.add("active");
  }
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.product.id === productId);

  if (existingItem) {
    if (existingItem.qty >= product.stock && product.category !== "Servicios") {
      showToast(`Stock crítico: Solo quedan ${product.stock} unidades de este producto.`, "error");
      return;
    }
    existingItem.qty += 1;
  } else {
    cart.push({ product, qty: 1 });
  }

  showToast(`'${product.name}' agregado al carro.`, "success");
  updateCartUI();
}

function updateCartQty(productId, delta) {
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;

  if (item.qty + delta <= 0) {
    cart = cart.filter(i => i.product.id !== productId);
    showToast(`'${item.product.name}' eliminado del carro.`, "info");
  } else {
    // Check stock limit for products, services have stock 99 (virtual)
    if (delta > 0 && item.qty >= item.product.stock && item.product.category !== "Servicios") {
      showToast("No hay suficiente stock disponible.", "error");
      return;
    }
    item.qty += delta;
  }

  updateCartUI();
}

function updateCartUI() {
  // Update header cart counter badge
  const badge = document.getElementById("cartCountBadge");
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  
  if (badge) {
    badge.innerText = totalQty;
    badge.style.display = totalQty > 0 ? "flex" : "none";
  }

  // Render items list inside drawer
  const itemsContainer = document.getElementById("cartItems");
  if (!itemsContainer) return;

  itemsContainer.innerHTML = "";

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <i class="fas fa-shopping-bag cart-empty-icon"></i>
        <p>Tu carro está vacío</p>
      </div>
    `;
    renderCartTotals(0, 0, 0, 0);
    return;
  }

  let totalNetoAfecto = 0;
  let totalNetoExento = 0;

  cart.forEach(item => {
    const p = item.product;
    const itemTotal = p.price * item.qty;

    if (p.taxStatus === "afecto") {
      totalNetoAfecto += itemTotal;
    } else {
      totalNetoExento += itemTotal;
    }

    const itemRow = document.createElement("div");
    itemRow.className = "cart-item";
    
    const formattedItemTotal = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(itemTotal);
    const badgeClass = p.taxStatus === "afecto" ? "tax-afecto" : "tax-exento";

    itemRow.innerHTML = `
      <div class="cart-item-details">
        <h5 class="cart-item-name">${p.name}</h5>
        <span class="cart-item-tax-status ${badgeClass}">${p.taxStatus}</span>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="updateCartQty(${p.id}, -1)">-</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(${p.id}, 1)">+</button>
          </div>
          <span class="cart-item-price">${formattedItemTotal}</span>
        </div>
      </div>
    `;
    itemsContainer.appendChild(itemRow);
  });

  // Calculate taxes: IVA is 19% over Afecto Net in Chile
  const iva = totalNetoAfecto * 0.19;
  const grandTotal = totalNetoAfecto + totalNetoExento + iva;

  renderCartTotals(totalNetoAfecto, totalNetoExento, iva, grandTotal);
}

function renderCartTotals(netoAfecto, netoExento, iva, total) {
  const fmt = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  
  const elAfecto = document.getElementById("cartNetoAfecto");
  const elExento = document.getElementById("cartNetoExento");
  const elIva = document.getElementById("cartIva");
  const elTotal = document.getElementById("cartTotal");

  if (elAfecto) elAfecto.innerText = fmt(netoAfecto);
  if (elExento) elExento.innerText = fmt(netoExento);
  if (elIva) elIva.innerText = fmt(iva);
  if (elTotal) elTotal.innerText = fmt(total);
}

// --- WEBPAY SIMULATOR FUNCTIONS ---
let activeWebpayTab = "card";
let webpayAmountVal = 0;
let webpayOrderIdVal = "";

function checkoutMock() {
  if (cart.length === 0) return;
  
  // Calculate total amount in cart
  let totalNetoAfecto = 0;
  let totalNetoExento = 0;
  cart.forEach(item => {
    const p = item.product;
    const itemTotal = p.price * item.qty;
    if (p.taxStatus === "afecto") {
      totalNetoAfecto += itemTotal;
    } else {
      totalNetoExento += itemTotal;
    }
  });
  const iva = totalNetoAfecto * 0.19;
  webpayAmountVal = totalNetoAfecto + totalNetoExento + iva;

  // Generate random Order ID
  webpayOrderIdVal = `OC-${Math.floor(10000 + Math.random() * 90000)}`;

  // Display Webpay modal
  document.getElementById("webpayModal").style.display = "flex";
  document.getElementById("webpayAmount").innerText = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(webpayAmountVal);
  document.getElementById("webpayOrderId").innerText = webpayOrderIdVal;

  // Reset view panels to card-tab active
  document.getElementById("webpayFormCard").style.display = "flex";
  document.getElementById("webpayFormCard").classList.add("active");
  document.getElementById("webpayFormBank").style.display = "none";
  document.getElementById("webpayFormBank").classList.remove("active");
  document.getElementById("webpayProcessing").style.display = "none";
  document.getElementById("webpaySuccess").style.display = "none";
  
  document.getElementById("btnWebpayTabCard").classList.add("active");
  document.getElementById("btnWebpayTabBank").classList.remove("active");

  // Show footer buttons and reset Pay button
  document.getElementById("webpayFooterActions").style.display = "flex";
  document.getElementById("btnWebpayPay").style.display = "inline-flex";

  // Close cart drawer
  toggleCartDrawer();
}

function switchWebpayTab(tab) {
  activeWebpayTab = tab;
  const btnCard = document.getElementById("btnWebpayTabCard");
  const btnBank = document.getElementById("btnWebpayTabBank");
  const formCard = document.getElementById("webpayFormCard");
  const formBank = document.getElementById("webpayFormBank");

  if (tab === "card") {
    btnCard.classList.add("active");
    btnBank.classList.remove("active");
    formCard.style.display = "flex";
    formBank.style.display = "none";
  } else {
    btnCard.classList.remove("active");
    btnBank.classList.add("active");
    formCard.style.display = "none";
    formBank.style.display = "flex";
  }
}

function closeWebpayModal() {
  document.getElementById("webpayModal").style.display = "none";
  showToast("Pago cancelado por el usuario.", "error");
}

function processWebpayPayment() {
  // Hide forms
  document.getElementById("webpayFormCard").style.display = "none";
  document.getElementById("webpayFormBank").style.display = "none";
  document.getElementById("btnWebpayPay").style.display = "none";
  
  // Show processing loader
  const processingDiv = document.getElementById("webpayProcessing");
  const statusText = document.getElementById("webpayStatusText");
  processingDiv.style.display = "flex";
  statusText.innerText = "Conectando con la pasarela Transbank...";

  setTimeout(() => {
    statusText.innerText = activeWebpayTab === "card" 
      ? "Autorizando transacción con el banco emisor..." 
      : "Validando transferencia en CuentaRUT...";
      
    setTimeout(() => {
      statusText.innerText = "Registrando transacción y emitiendo comprobante...";
      
      setTimeout(() => {
        // Complete Payment
        processingDiv.style.display = "none";
        document.getElementById("webpayFooterActions").style.display = "none";
        
        // Show success screen
        document.getElementById("webpaySuccess").style.display = "flex";
        
        // Set dynamic auth code and receipt details
        const authCode = Math.floor(100000 + Math.random() * 900000);
        document.getElementById("webpayAuthCode").innerText = authCode;
        
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
        document.getElementById("webpayDate").innerText = dateStr;
        document.getElementById("webpaySuccessOrderId").innerText = webpayOrderIdVal;
        
        // Log in the global sales total of admin dashboard
        if (typeof addSaleToAdminStats === "function") {
          addSaleToAdminStats(webpayAmountVal);
        }
      }, 900);
    }, 1000);
  }, 900);
}

function closeWebpaySuccess() {
  // Close modal
  document.getElementById("webpayModal").style.display = "none";
  
  // Empty shopping cart and update UI
  cart = [];
  updateCartUI();
  
  showToast("¡Compra completada con éxito! Comprobante emitido.", "success");
}

// --- DEMO ENGINEERING TABS ---
function toggleEngineeringTab(tabId) {
  const tabs = document.querySelectorAll(".eng-tab-btn");
  const contents = document.querySelectorAll(".eng-tab-content");

  tabs.forEach(tab => {
    if (tab.getAttribute("data-tab") === tabId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  contents.forEach(content => {
    if (content.id === `eng-tab-${tabId}`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}

// --- TOAST SYSTEM ---
function showToast(message, type = "info") {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast`;
  
  let borderLeftColor = "var(--color-primary)";
  let icon = "fa-info-circle";
  
  if (type === "success") {
    borderLeftColor = "var(--text-success)";
    icon = "fa-check-circle";
  } else if (type === "error") {
    borderLeftColor = "var(--text-danger)";
    icon = "fa-exclamation-triangle";
  }

  toast.style.borderLeftColor = borderLeftColor;

  toast.innerHTML = `
    <i class="fas ${icon}" style="color: ${borderLeftColor}"></i>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
