let currentRole = "admin"; // Default simulation role
let adminTotalSales = 2450000; // Shared state for sales tracking

function setRole(role) {
  currentRole = role;
  
  // Highlight active role button
  const buttons = document.querySelectorAll(".role-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-role") === role) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Display toast
  let roleText = "Administrador General";
  if (role === "gestor") roleText = "Gestor de Repuestos (Bodega)";
  if (role === "ingeniero") roleText = "Ingeniero de Proyectos";
  showToast(`Simulador: Rol cambiado a ${roleText}`, "success");

  // Re-render the admin views based on the new role
  renderAdmin();
}

function renderAdmin() {
  const container = document.getElementById("adminViewContent");
  if (!container) return;

  // Render structure
  container.innerHTML = `
    <!-- Stats Cards -->
    <div class="admin-grid" id="adminStats"></div>
    
    <!-- Workspace Tabs -->
    <div class="eng-tabs" style="margin-bottom: 24px;">
      <button class="eng-tab-btn active" id="btnAdminTabShop" onclick="toggleAdminTab('shop')">
        <i class="fas fa-boxes"></i> Inventario & Precios (E-Commerce)
      </button>
      <button class="eng-tab-btn" id="btnAdminTabProjects" onclick="toggleAdminTab('projects')">
        <i class="fas fa-folder-open"></i> Proyectos & Cotizaciones
      </button>
    </div>

    <!-- Inventory Tab Content -->
    <div id="adminTabShopContent" class="admin-table-container">
      <div class="table-header-row">
        <h3>Control de Catálogo y Repuestos</h3>
        <span class="logo-sub">Gestión de Precios e IVA</span>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto / Servicio</th>
            <th>Categoría</th>
            <th>Precio Neto (CLP)</th>
            <th>Impuesto</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="adminProductsTableBody"></tbody>
      </table>
    </div>

    <!-- Projects Tab Content (Confidential Shielded) -->
    <div id="adminTabProjectsContent" class="admin-table-container" style="display: none;">
      <div class="table-header-row">
        <h3>Bandeja de Proyectos de Ingeniería</h3>
        <span class="logo-sub">Planos CAD y Requerimientos</span>
      </div>
      <div id="projectConfidentialShield" class="confidential-shield">
        <i class="fas fa-shield-alt confidential-icon"></i>
        <h2>ACCESO RESTRINGIDO</h2>
        <p>Este módulo contiene información confidencial de clientes, presupuestos y planos CAD de ingeniería.</p>
        <p style="color: var(--color-primary); font-weight: 600;">Solo visible para el rol "Ingeniero de Proyectos" o "Administrador".</p>
      </div>
      <table class="admin-table" id="adminProjectsTable" style="width: 100%;">
        <thead>
          <tr>
            <th>ID Cotización</th>
            <th>Cliente</th>
            <th>Especialidad</th>
            <th>Fecha</th>
            <th>Planos Adjuntos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="adminQuotesTableBody"></tbody>
      </table>
    </div>
  `;

  // Render Stats
  renderStats();
  
  // Render Tables
  renderProductsTable();
  renderQuotesTable();

  // Apply Role restrictions immediately
  applyRoleRestrictions();
}

function renderStats() {
  const statsDiv = document.getElementById("adminStats");
  if (!statsDiv) return;

  const totalSales = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(adminTotalSales);
  const pendingQuotes = quoteRequests.filter(q => q.status === "pending").length;
  const totalProducts = products.length;
  const projectSuccessRate = "92%";

  if (currentRole === "gestor") {
    statsDiv.innerHTML = `
      <div class="stat-card">
        <div class="stat-num">${totalProducts}</div>
        <div class="stat-label">Productos en Catálogo</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">5 items</div>
        <div class="stat-label">Stock Crítico (< 6)</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">3</div>
        <div class="stat-label">Categorías Activas</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">4 Afectos / 4 Exentos</div>
        <div class="stat-label">Detalle Impositivo</div>
      </div>
    `;
  } else if (currentRole === "ingeniero") {
    statsDiv.innerHTML = `
      <div class="stat-card">
        <div class="stat-num">${quoteRequests.length}</div>
        <div class="stat-label">Cotizaciones Totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${pendingQuotes}</div>
        <div class="stat-label">Pendientes de Revisión</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${projectSuccessRate}</div>
        <div class="stat-label">Efectividad de Proyectos</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">Active</div>
        <div class="stat-label">Conexión Google Drive CAD</div>
      </div>
    `;
  } else {
    // Administrator
    statsDiv.innerHTML = `
      <div class="stat-card">
        <div class="stat-num">${totalSales}</div>
        <div class="stat-label">Facturación Mensual Tienda</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${pendingQuotes}</div>
        <div class="stat-label">Cotizaciones Pendientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${totalProducts}</div>
        <div class="stat-label">Items en Catálogo</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">100% OK</div>
        <div class="stat-label">Respaldo Google Drive Semanal</div>
      </div>
    `;
  }
}

function renderProductsTable() {
  const tbody = document.getElementById("adminProductsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");
    
    // Format price in CLP format
    const formattedPrice = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(p.price);
    const badgeClass = p.taxStatus === "afecto" ? "tax-afecto" : "tax-exento";

    // Disable controls if the role is Project Engineer (who has no permission to edit price)
    const isRestricted = currentRole === "ingeniero";
    const disabledAttr = isRestricted ? "disabled" : "";
    const styleOpacity = isRestricted ? "opacity: 0.6; cursor: not-allowed;" : "";

    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 600;">${p.sku}</td>
      <td style="font-weight: 600;">${p.name}</td>
      <td>${p.category}</td>
      <td>
        <span id="price-span-${p.id}">${formattedPrice}</span>
      </td>
      <td>
        <span class="product-tax-badge ${badgeClass}">${p.taxStatus}</span>
      </td>
      <td>
        <div class="qty-control" style="${styleOpacity}">
          <button class="qty-btn" onclick="updateAdminProductStock(${p.id}, -1)" ${disabledAttr}>-</button>
          <span class="qty-num">${p.stock}</span>
          <button class="qty-btn" onclick="updateAdminProductStock(${p.id}, 1)" ${disabledAttr}>+</button>
        </div>
      </td>
      <td>
        <button class="btn btn-outline-primary" style="padding: 6px 12px; font-size: 11px; ${styleOpacity}" onclick="editProductPricePrompt(${p.id})" ${disabledAttr}>
          <i class="fas fa-edit"></i> Precio
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderQuotesTable() {
  const tbody = document.getElementById("adminQuotesTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  quoteRequests.forEach(q => {
    const tr = document.createElement("tr");
    
    // Status color
    let statusClass = "status-pending";
    let statusText = "Pendiente";
    if (q.status === "approved") {
      statusClass = "status-approved";
      statusText = "Aprobado";
    } else if (q.status === "review") {
      statusClass = "status-review";
      statusText = "En Revisión";
    }

    // Files HTML list
    let filesHTML = "Ninguno";
    if (q.files && q.files.length > 0) {
      filesHTML = q.files.map(f => `
        <div style="display:flex; align-items:center; gap:6px; font-size:11px; margin-top:2px;">
          <i class="fas fa-file-pdf" style="color:var(--color-primary);"></i>
          <span title="${f}" style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f}</span>
        </div>
      `).join("");
    }

    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 600;">${q.id}</td>
      <td>
        <div style="font-weight: 600;">${q.clientName}</div>
        <div style="font-size:11px; color:var(--text-muted);">${q.email}</div>
      </td>
      <td><span class="status-badge" style="background:rgba(0,122,204,0.1); color:#82b1ff;">${q.projectType}</span></td>
      <td>${q.date}</td>
      <td>${filesHTML}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 11px; color:#000; display:flex; align-items:center; gap:4px;" onclick="openQuoteDetailModal('${q.id}')">
          <i class="fas fa-folder-open"></i> Revisar / Cotizar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Role-based Access Rules
function applyRoleRestrictions() {
  const shopTab = document.getElementById("adminTabShopContent");
  const projectsTab = document.getElementById("adminTabProjectsContent");
  const shield = document.getElementById("projectConfidentialShield");
  const table = document.getElementById("adminProjectsTable");

  const btnShop = document.getElementById("btnAdminTabShop");
  const btnProjects = document.getElementById("btnAdminTabProjects");

  if (!shopTab || !projectsTab) return;

  if (currentRole === "gestor") {
    // Inventory Manager cannot view projects - show shield
    shield.classList.add("active");
    if (table) table.style.display = "none";
  } else {
    // Admin or Engineer can view projects
    shield.classList.remove("active");
    if (table) table.style.display = "table";
  }
}

// Switch tabs inside admin panel
function toggleAdminTab(tab) {
  const shopTab = document.getElementById("adminTabShopContent");
  const projectsTab = document.getElementById("adminTabProjectsContent");
  const btnShop = document.getElementById("btnAdminTabShop");
  const btnProjects = document.getElementById("btnAdminTabProjects");

  if (tab === 'shop') {
    shopTab.style.display = "block";
    projectsTab.style.display = "none";
    btnShop.classList.add("active");
    btnProjects.classList.remove("active");
  } else {
    shopTab.style.display = "none";
    projectsTab.style.display = "block";
    btnShop.classList.remove("active");
    btnProjects.classList.add("active");
  }

  applyRoleRestrictions();
}

// Inventory management simulator actions (Gestor & Admin)
function updateAdminProductStock(productId, diff) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  if (product.stock + diff < 0) {
    showToast("El stock no puede ser menor a 0.", "error");
    return;
  }

  product.stock += diff;
  renderAdmin();
  showToast(`Stock de '${product.name}' actualizado a ${product.stock}.`, "success");
}

function editProductPricePrompt(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const newPriceStr = prompt(`Ingrese el nuevo precio neto para ${product.name}:`, product.price);
  if (newPriceStr === null) return;

  const newPrice = parseInt(newPriceStr, 10);
  if (isNaN(newPrice) || newPrice <= 0) {
    showToast("Ingrese un precio numérico válido mayor a 0.", "error");
    return;
  }

  product.price = newPrice;
  renderAdmin();
  showToast(`Precio de '${product.name}' actualizado a $${newPrice.toLocaleString('es-CL')} CLP.`, "success");
  
  // Update catalog shop display if it exists
  if (typeof renderCatalog === 'function') {
    renderCatalog();
  }
}

// Project engineering simulator actions (Engineer & Admin)
function changeQuoteStatus(quoteId, status) {
  if (currentRole === "gestor") {
    showToast("Acción bloqueada: Tu rol de Gestor de Repuestos no permite modificar proyectos.", "error");
    return;
  }

  const quote = quoteRequests.find(q => q.id === quoteId);
  if (!quote) return;

  quote.status = status;
  renderAdmin();
  
  const statusLabel = status === 'approved' ? 'Aprobado' : 'En Revisión';
  showToast(`Estado de cotización ${quoteId} cambiado a ${statusLabel}.`, "success");
}

function addSaleToAdminStats(amount) {
  adminTotalSales += amount;
}

// --- QUOTE DETAIL MODAL INTERACTIVE SIMULATOR ---
let selectedReviewQuoteId = null;

function openQuoteDetailModal(quoteId) {
  if (currentRole === "gestor") {
    showToast("Acción bloqueada: Tu rol no permite revisar proyectos.", "error");
    return;
  }
  
  const quote = quoteRequests.find(q => q.id === quoteId);
  if (!quote) return;
  
  selectedReviewQuoteId = quoteId;
  
  // Set text contents
  document.getElementById("modalQuoteId").innerText = quote.id;
  document.getElementById("modalClientName").innerText = quote.clientName;
  document.getElementById("modalClientEmail").innerText = quote.email;
  document.getElementById("modalClientPhone").innerText = quote.phone || "+56 9 XXXXXXXX";
  document.getElementById("modalDate").innerText = quote.date;
  document.getElementById("modalDescription").innerText = quote.description;
  
  // Specialty badge
  const specEl = document.getElementById("modalSpecialty");
  specEl.innerText = quote.projectType.toUpperCase();
  
  // Status badge
  const statusEl = document.getElementById("modalStatus");
  statusEl.innerText = quote.status === "approved" ? "Aprobado" : (quote.status === "review" ? "En Revisión" : "Pendiente");
  statusEl.className = "status-badge " + (quote.status === "approved" ? "status-approved" : (quote.status === "review" ? "status-review" : "status-pending"));

  // Reset Form
  document.getElementById("modalComments").value = quote.comments || "";
  document.getElementById("modalPrice").value = quote.price || "";
  document.getElementById("modalFileNameLabel").innerText = quote.quoteFileName || "Ninguno";
  
  // Render attached files list
  const filesList = document.getElementById("modalFilesList");
  filesList.innerHTML = "";
  if (quote.files && quote.files.length > 0) {
    quote.files.forEach(f => {
      const fileDiv = document.createElement("div");
      fileDiv.style = "display:flex; justify-content:space-between; align-items:center; background:#151e2e; padding:8px 12px; border-radius:6px; border:1px solid var(--border-color); font-size:11px;";
      
      const fileIcon = f.endsWith(".pdf") ? "fa-file-pdf" : "fa-file-code";
      const fileColor = f.endsWith(".pdf") ? "var(--color-accent)" : "var(--color-primary)";
      
      fileDiv.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <i class="fas ${fileIcon}" style="color:${fileColor}; font-size:14px;"></i>
          <span style="color:#fff; font-weight:600;">${f}</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size:10px; border-color:rgba(255,255,255,0.05); color:var(--color-primary);" onclick="showToast('Abriendo visor web de AutoCAD para ${f}...', 'info')"><i class="fas fa-eye"></i> Visor CAD</button>
          <a href="#" class="btn btn-secondary" style="padding: 4px 8px; font-size:10px; border-color:rgba(255,255,255,0.05);" onclick="showToast('Descargando plano original de Google Drive...', 'success'); return false;"><i class="fas fa-download"></i></a>
        </div>
      `;
      filesList.appendChild(fileDiv);
    });
  } else {
    filesList.innerHTML = `<span style="color:var(--text-muted); font-size:11px; font-style:italic;">No hay archivos adjuntos.</span>`;
  }
  
  // Reset processing views
  document.getElementById("modalReviewActionForm").style.display = "block";
  document.getElementById("modalReviewFooter").style.display = "flex";
  document.getElementById("modalReviewProcessing").style.display = "none";
  
  // Open modal
  document.getElementById("quoteDetailModal").style.display = "flex";
}

function closeQuoteDetailModal() {
  document.getElementById("quoteDetailModal").style.display = "none";
  selectedReviewQuoteId = null;
}

function handleModalFileChange() {
  const fileInput = document.getElementById("modalQuoteFileInput");
  const label = document.getElementById("modalFileNameLabel");
  if (fileInput.files.length > 0) {
    label.innerText = fileInput.files[0].name;
    label.style.color = "var(--color-primary)";
  }
}

function processQuoteReviewSubmit(targetStatus) {
  if (!selectedReviewQuoteId) return;
  
  const quote = quoteRequests.find(q => q.id === selectedReviewQuoteId);
  if (!quote) return;
  
  const comments = document.getElementById("modalComments").value;
  const price = document.getElementById("modalPrice").value;
  const fileInput = document.getElementById("modalQuoteFileInput");
  
  // Start loading animation inside modal
  document.getElementById("modalReviewActionForm").style.display = "none";
  document.getElementById("modalReviewFooter").style.display = "none";
  
  const processingDiv = document.getElementById("modalReviewProcessing");
  const statusText = document.getElementById("modalReviewStatusText");
  processingDiv.style.display = "flex";
  
  if (targetStatus === "approved") {
    statusText.innerText = "Registrando observaciones técnicas...";
    
    setTimeout(() => {
      statusText.innerText = "Subiendo cotización formal en PDF a Google Drive...";
      
      setTimeout(() => {
        statusText.innerText = "Notificando aprobación al cliente...";
        
        setTimeout(() => {
          // Commit changes
          quote.status = "approved";
          quote.comments = comments;
          quote.price = price;
          if (fileInput.files.length > 0) {
            quote.quoteFileName = fileInput.files[0].name;
          } else {
            quote.quoteFileName = "COTIZACION_FORMAL_FIRMADA.pdf";
          }
          
          // Complete
          closeQuoteDetailModal();
          renderAdmin();
          showToast(`Cotización ${quote.id} aprobada y enviada con éxito al cliente.`, "success");
        }, 900);
      }, 900);
    }, 800);
  } else {
    statusText.innerText = "Registrando solicitud de cambios...";
    
    setTimeout(() => {
      statusText.innerText = "Notificando observaciones al cliente por correo...";
      
      setTimeout(() => {
        // Commit changes
        quote.status = "review";
        quote.comments = comments;
        quote.price = price;
        
        // Complete
        closeQuoteDetailModal();
        renderAdmin();
        showToast(`Cotización ${quote.id} marcada en revisión. Solicitud de cambios enviada.`, "success");
      }, 1000);
    }, 800);
  }
}
