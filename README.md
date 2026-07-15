# Propuesta Técnica y Económica: Portal Web Corporativo, E-Commerce y Cotizador
### Cliente: Jürgen Von Arnim SpA
### Proveedor: KVRVA Software Studio (Operado legalmente por Viewled Chile SpA)

---

## 📝 Enfoque de Desarrollo
El desarrollo se realizará con un **diseño visual (frontend) 100% personalizado y programado desde cero a la medida de su marca**, el cual estará conectado a un **motor administrativo (backend) basado en WordPress y WooCommerce**. Esto garantiza un diseño visual único y una lógica de cotización a medida, al mismo tiempo que provee un panel de administración autogestionable, seguro y estandarizado para el control del inventario y las cotizaciones.

---

## 🔗 Enlace a la Demo Interactiva
El prototipo funcional e interactivo de esta propuesta está publicado y listo para ser probado por el cliente en el siguiente enlace:
👉 **[Previsualizar Demo de Propuesta en Vivo](https://kvrva.github.io/jurgen-propuesta/)**

*(Puedes navegar por las secciones corporativas, realizar compras simuladas con Webpay Plus y simular el panel de administración técnica de ingeniería en tiempo real).*

---

## 📅 Cronograma de Ejecución (Plazo: 5 Semanas)

Para asegurar el éxito del proyecto sin comprometer la calidad, el desarrollo activo se distribuye de la siguiente manera:

*   **Semana 1: Fase 1 - Infraestructura & Base CMS**
    *   Provisión del servidor VPS definitivo y configuración del entorno de base de datos.
    *   Levantamiento de WordPress Core y estructura base de datos MariaDB/MySQL.
    *   Alineación del diseño premium y maquetación responsive fluida (Mobile First).
*   **Semana 2: Fase 2 - Secciones de Ingeniería**
    *   Carga de información corporativa y división de especialidades (Mecánica, Eléctrica, Civil).
    *   Maquetación del catálogo y fichas de servicios especializados.
*   **Semanas 3 - 4: Fase 3 - Catálogo WooCommerce, Pasarela & API de Drive**
    *   Configuración de WooCommerce (reglas de IVA 19% / Exento).
    *   Integración del script de carga por partes (*chunks*) para planos pesados (DWG/PDF).
    *   Conexión de la API de Google Drive y ordenamiento automático de carpetas por cliente.
    *   Implementación de pasarela de pagos real (Transbank Webpay Plus o Flow en modo de pruebas).
*   **Semana 5: Fase 4 - Marcha Blanca, Pruebas y Lanzamiento**
    *   Pruebas reales de transacciones de pago e integraciones de subida de archivos CAD.
    *   Configuración de seguridad activa (firewall Wordfence, Cloudflare CDN) y respaldos automatizados.
    *   Entrega de credenciales, documentación técnica y capacitación al equipo de Jürgen SpA.

---

## 🛠️ Especificaciones Técnicas del Proyecto

### 1. CMS & Base de Datos (WordPress + WooCommerce)
*   **Servidor Web:** Nginx o LiteSpeed sobre VPS dedicado para garantizar un tiempo de respuesta menor a 200ms.
*   **Motor de Base de Datos:** MariaDB / MySQL con indexación optimizada en columnas clave (`rut`, `email`, `id_cotizacion`) para soportar +10.000 clientes de forma fluida.
*   **Estructura Impositiva:** Configuración diferenciada de IVA (19% para repuestos físicos y 0% exento para consultorías técnicas y firmas de memorias de cálculo).

### 2. Pasarela de Pagos (Webpay Plus)
*   Integración directa de Transbank Webpay Plus o pasarela alternativa (Flow / Mercado Pago) a través del plugin oficial de WooCommerce o desarrollo de SDK a medida en PHP.

### 3. Carga CAD y Resguardo Seguro (Google Drive API)
*   **Subida en Chunks (Fragmentación):** Los archivos planos de ingeniería (.dwg, .pdf, .dxf) de gran tamaño (hasta 50MB) se subirán en partes consecutivas de 2MB para evitar caídas de timeout del hosting.
*   **Sincronización en la Nube:** Tras ensamblarse, el archivo se transfiere mediante la API de Google Cloud directamente a la cuenta de Google Drive corporativa del cliente, eliminándolo del hosting para mantener el servidor óptimo y proteger la confidencialidad.

### 4. Seguridad y Roles Administrativos
*   **Control de Accesos:** Roles definidos para *Gestor de Repuestos* (modificación de precios y stock), *Ingeniero de Proyectos* (revisión de planos e ingreso de cotizaciones técnicas) y *Administrador* (acceso completo).
*   **Seguridad Activa:** Configuración de DNS en Cloudflare (Firewall WAF y CDN) y Wordfence a nivel de CMS para evitar ataques de inyección y fuerza bruta.

---

## 💰 Propuesta Económica y Metodología de Pago

La inversión total del proyecto es de **$1.400.000 CLP + IVA (Valores Netos)**, facturado electrónicamente desde Viewled Chile SpA.

La distribución de pagos se define bajo los siguientes hitos de avance:

| Hito | Entregable | Porcentaje | Monto (Neto) |
| :--- | :--- | :---: | :---: |
| **Anticipo de Inicio** | Firma de acuerdo y provisión de entornos de desarrollo. | 40% | **$560.000 CLP + IVA** |
| **Entrega de Avance** | Catálogo e-commerce cargado y sistema de subida CAD conectado (Fin Semana 3). | 40% | **$560.000 CLP + IVA** |
| **Cierre de Proyecto** | Certificación de pasarela de pago, capacitaciones y lanzamiento (Semana 5). | 20% | **$280.000 CLP + IVA** |

---

## ✉️ Contacto y Canales de Comunicación
*   **Responsable Técnico:** Julián Martínez (Director de KVRVA / Software Engineer)
*   **Correo de Contacto:** [contacto@kvrva.com](mailto:contacto@kvrva.com)
*   **Sitio Web Corporativo:** [https://kvrva.com](https://kvrva.com)
*   **GitHub Oficial:** [https://github.com/kvrva](https://github.com/kvrva)
*   **Ubicación:** Santiago, Chile
