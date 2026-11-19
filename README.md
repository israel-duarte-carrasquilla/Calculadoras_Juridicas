# 🇨🇴 Suite Jurídica & Forense de Colombia (Vigencia 2026 - 2027)

Plataforma profesional unificada de peritaje, liquidación judicial y dictámenes periciales para Colombia, desarrollada para abogados litigantes, peritos forenses, auxiliares de la justicia, centros de conciliación, juzgados y consultorios jurídicos.

🌐 **Acceso en Producción:** [https://solutiontech.lat/Calculadoras_Legales/](https://solutiontech.lat/Calculadoras_Legales/)  
📂 **Repositorio Oficial:** [https://github.com/israel-duarte-carrasquilla/Calculadoras_Juridicas.git](https://github.com/israel-duarte-carrasquilla/Calculadoras_Juridicas.git)

---

## 🔒 Control de Acceso y Sistema de Tokens

La Suite cuenta con un **Portal de Acceso / Login Gatekeeper Obligatorio**:
* **Seguridad y Privacidad:** Ningún usuario puede visualizar ni interactuar con las herramientas sin previa autenticación autorizada.
* **Sesión Segura y Cierre de Sesión:** Opción de recordar sesión en el equipo y botón permanente de **"Cerrar Sesión"** en la barra superior.
* **Perfiles Precargados con Acceso Rápido (1-Clic):**
  * 👑 **Israel** (`israel`): Superadministrador con **consultas ilimitadas ($\infty$)**, panel de creación y edición de usuarios, auditoría forense y asignador de tokens.
  * 🛡️ **Juan Carlos Oyola** (`jcarlos`): Administrador con **100 tokens iniciales** y autorización de recarga.
  * 👤 **Usuario de Prueba** (`prueba`): Consultor con **5 tokens iniciales**.
* **Consumo de Tokens Transversal:** Cada liquidación judicial oficial en cualquiera de los 4 módulos descuenta 1 token del saldo del usuario, bloqueando la consulta cuando el saldo llega a 0 y emitiendo alerta de recarga.

---

## ⚖️ Módulos Unificados en la Suite (Selector Maestro de 4 Calculadoras)

Todas las calculadoras se encuentran integradas en una **misma página responsiva (`index.html`)** con conmutación instantánea:

### 1. 🏛️ Calculadora Pensional de Colombia (Ley 100/93 vs. Ley 2381/24)
* **Paralelo Comparativo:** Régimen tradicional (Colpensiones vs. AFP) frente al Nuevo Sistema de Pilares.
* **Régimen de Transición:** Comprobación estricta de 750 semanas en mujeres y 900 semanas en hombres (Arts. 75 y 76).
* **Piso Legal Constitucional:** Garantía de mesada mínima de 1 SMMLV 2026 ($1.750.905 COP).
* **Descuento de Salud Progresivo:** Aplicación automática según Ley 2381 (4%, 10%, 12%).
* **Dictamen Pericial y Guía Paso a Paso:** Hoja de ruta procesal, acciones de tutela y jurisprudencia pensional vinculante.

---

### 2. 👶 Calculadora Judicial de Alimentos, Mora 6% & REDAM
* **Marco Legal:** Código Civil (Arts. 411 a 427), Ley 1098 de 2006 (Código de Infancia y Adolescencia) y Ley 2097 de 2020.
* **Alimentos Congruos vs. Necesarios:** C-1033/02 y Art. 413 C.C.
* **Tope Absoluto del 50%:** Control legal para salvaguardar el mínimo vital del obligado (Art. 130 Ley 1098).
* **Economía del Cuidado (T-261/22 y T-103/23):** Cuantificación monetaria de las labores domésticas y de crianza no remuneradas aportadas por el progenitor custodio.
* **Liquidador de Cuotas Atrasadas:** Interés legal civil de mora del **6% E.A. (0.5% mensual)** conforme al Art. 1617 C.C. y precedente de la Corte Suprema (SC-917-2022).
* **Semáforo y Alerta REDAM:** Detección automática al acumular 3 o más cuotas en mora con desglose de inhabilidades legales.
* **Generador de Minutas:** Acta de Conciliación, Requerimiento Prejudicial REDAM y Demanda Ejecutiva.

---

### 3. 💳 Calculadora y Liquidador Judicial de Créditos & Usura (CGP Art. 446)
* **Marco Procesal:** Código General del Proceso (Arts. 422, 446 y 366), Código de Comercio (Art. 884) y Código Civil (Art. 1653).
* **Histórico Oficial de Tasas SFC:** Liquidación cronológica mes a mes con las tasas certificadas por la Superintendencia Financiera de Colombia (IBC x 1.5).
* **Control de Usura:** Reducción automática de intereses al tope legal máximo y auditoría de la sanción del Art. 72 de la Ley 45 de 1990.
* **Imputación Imperativa de Pagos (Art. 1653 C.C.):** Prelación obligatoria (1° Mora, 2° Corrientes, 3° Capital).
* **Simulador de Amortización:** Sistema Francés, Alemán, Americano y UVR (Ley 546/99).
* **Exportación Forense:** Descarga de tablas de liquidación completas en Excel (XLSX) y TSV para anexar a demandas y memoriales.

---

### 4. ⚖️ Calculadora Forense de Perjuicios e Indemnizaciones (Consejo de Estado)
* **Principio de Reparación Integral:** Art. 16 Ley 446 de 1998, Arts. 2341 y 2356 del Código Civil, sentencias de unificación de la Sección Tercera del Consejo de Estado y Sala Civil CSJ.
* **Lucro Cesante Consolidado y Futuro:** Fórmulas actuariales con interés puro del 6% anual (0.4867% mensual) y tablas de vida probable de la Superintendencia Financiera (Resolución 1555 de 2010).
* **Daño Emergente:** Pasado y futuro indexado por IPC oficial del DANE.
* **Perjuicios Morales e Inmateriales:** Baremos oficiales tasados en SMMLV 2026 ($1.750.905 COP) por niveles de cercanía o gravedad de la lesión.
* **Generador Procesal:** Juramento Estimatorio formal (Art. 206 CGP) y Dictamen Pericial Forense.

---

## 📁 Archivos del Proyecto

| Archivo | Descripción |
|---|---|
| `index.html` | **Página Maestra Unificada** con Login Gate, 4 Calculadoras, Control de Tokens y Panel Admin |
| `calculadora_alimentos.html` | Versión autónoma del módulo de alimentos y REDAM con login gate |
| `calculadora_creditos.html` | Versión autónoma del liquidador judicial de créditos y usura con login gate |
| `calculadora_perjuicios.html` | Versión autónoma de la calculadora de perjuicios con login gate |
| `MANUAL_LEGAL_PENSIONAL.md` | Compendio normativo y jurisprudencial pensional |
| `GUIA_PASO_A_PASO_PENSION_Y_JURISPRUDENCIA.md` | Protocolo procesal de traslados y tutelas |
| `MANUAL_LEGAL_ALIMENTOS_Y_JURISPRUDENCIA.md` | Manual de alimentos, economía del cuidado y REDAM |
| `MANUAL_LEGAL_CREDITOS_Y_JURISPRUDENCIA.md` | Manual forense de liquidación judicial de créditos |
| `MANUAL_LEGAL_PERJUICIOS_Y_JURISPRUDENCIA.md` | Manual jurisprudencial de perjuicios Consejo de Estado y CSJ |

---

## 🚀 Despliegue e Instalación

La suite está diseñada con arquitectura **Zero-Dependency (Client-Side Vanilla JS)**, lo que permite ejecutarla tanto localmente abriendo el archivo `index.html` en cualquier navegador moderno, como en servidores web (LiteSpeed, Apache, Nginx) sin necesidad de backend o bases de datos externas.
