// Global state for quote requests, pre-populated with realistic client engineering projects
let quoteRequests = [
  {
    id: "COT-2026-001",
    clientName: "Codelco - División El Teniente",
    email: "proyectos@codelco.cl",
    phone: "+56 9 8765 4321",
    projectType: "Mecanica",
    description: "Diseño y fabricación de tolva de descarga para correa transportadora principal. Se requiere simulación de flujo y planos certificados.",
    status: "pending",
    date: "2026-07-10",
    files: ["TOLVA_DISEÑO_PRELIMINAR.dwg", "ESPECIFICACIONES_TECNICAS.pdf"]
  },
  {
    id: "COT-2026-002",
    clientName: "AES Andes SpA",
    email: "mantenimiento@aesandes.cl",
    phone: "+56 2 2456 7890",
    projectType: "Electrica",
    description: "Estudio de flujo de carga y coordinación de protecciones para subestación de respaldo de planta generadora.",
    status: "approved",
    date: "2026-07-12",
    files: ["DIAGRAMA_UNILINEAR_SUBESTACION.pdf"]
  }
];

let selectedFiles = [];

// Initialize quote functionality
function initQuotes() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const filesList = document.getElementById("filesList");
  const quoteForm = document.getElementById("quoteForm");

  if (!dropzone) return;

  // Handle clicking on dropzone to upload
  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  // Drag and Drop styling events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  });

  // Handle Form Submit
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const clientName = document.getElementById("clientName").value;
    const email = document.getElementById("clientEmail").value;
    const phone = document.getElementById("clientPhone").value;
    const projectType = document.getElementById("projectType").value;
    const description = document.getElementById("projectDesc").value;

    if (!clientName || !email || !projectType) {
      showToast("Por favor complete los campos obligatorios.", "error");
      return;
    }

    const newQuote = {
      id: `COT-2026-0${quoteRequests.length + 1}`,
      clientName,
      email,
      phone,
      projectType,
      description,
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      files: selectedFiles.map(f => f.name)
    };

    // Add to shared memory array
    quoteRequests.unshift(newQuote);

    // Visual feedback
    showToast(`Cotización ${newQuote.id} enviada correctamente.`, "success");
    quoteForm.reset();
    selectedFiles = [];
    renderSelectedFiles();
    
    // Update admin view immediately if active
    if (typeof renderAdmin === 'function') {
      renderAdmin();
    }
  });
}

function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Check file size (mock limit 50MB)
    if (file.size > 50 * 1024 * 1024) {
      showToast(`El archivo ${file.name} supera los 50MB.`, "error");
      continue;
    }
    
    // Add to list and simulate upload progress
    selectedFiles.push(file);
  }
  renderSelectedFiles();
}

function renderSelectedFiles() {
  const filesList = document.getElementById("filesList");
  if (!filesList) return;
  
  filesList.innerHTML = "";

  if (selectedFiles.length === 0) {
    filesList.style.display = "none";
    return;
  }

  filesList.style.display = "flex";
  
  selectedFiles.forEach((file, index) => {
    const fileRow = document.createElement("div");
    fileRow.className = "file-row";
    
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileIcon = getFileIcon(file.name);

    fileRow.innerHTML = `
      <div class="file-info">
        <i class="fas ${fileIcon}"></i>
        <span class="file-name">${file.name}</span>
        <span class="file-size">(${sizeInMB} MB)</span>
      </div>
      <button type="button" class="file-remove" onclick="removeSelectedFile(${index})">
        <i class="fas fa-trash"></i>
      </button>
    `;
    filesList.appendChild(fileRow);
  });
}

function removeSelectedFile(index) {
  selectedFiles.splice(index, 1);
  renderSelectedFiles();
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['dwg', 'dxf', 'rvt', 'sldprt'].includes(ext)) {
    return 'fa-drafting-compass'; // CAD icons
  }
  if (ext === 'pdf') {
    return 'fa-file-pdf';
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return 'fa-file-excel';
  }
  return 'fa-file';
}
