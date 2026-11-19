# Marco Normativo y Metodología: Calculadora Pensional Colombia (Actualizado 2026)

Este documento detalla los fundamentos legales, constitucionales, matemáticos y actuariales incorporados en la **Calculadora Pensional de Colombia**, contrastando el régimen tradicional con el nuevo sistema pensional e incorporando el **piso legal constitucional** y el **descuento obligatorio de salud**.

---

## 1. Principio Fundamental: Piso Legal Constitucional

* **Artículo 48 de la Constitución Política de Colombia:**
  > *"En ningún caso la pensión podrá ser inferior al salario mínimo legal mensual vigente."*
* **Ley 100 de 1993, Artículo 35:**
  > *"El monto mensual de la pensión de vejez (...) no podrá ser inferior al salario mínimo legal mensual vigente, ni superior a veinticinco (25) veces dicho salario."*
* **Salario Mínimo Legal Mensual Vigente (SMMLV 2026):**
  * **$1.750.905 COP**
  * Ninguna persona que cumpla los requisitos de edad y semanas para una pensión de vejez puede recibir una mesada bruta inferior a **$1.750.905 COP**.
  * Si la fórmula matemática de liquidación ($IBL \times \text{tasa}$) arroja un valor inferior, la ley eleva la mesada automáticamente al piso de 1 SMMLV.

---

## 2. Descuento Obligatorio de Aporte a Salud para Pensionados

En Colombia, los pensionados deben realizar un aporte obligatorio al Sistema General de Seguridad Social en Salud (SGSSS), reglamentado por la Ley 2010 de 2019, Ley 2294 de 2023 y ratificado en la Ley 2381 de 2024:

| Rango de la Mesada Pensional | Tarifa de Aporte a Salud | Descuento para 1 SMMLV ($1.750.905) | Mesada Neta en Mano |
| :--- | :---: | :---: | :---: |
| **Exactamente 1 SMMLV** | **4%** | **-$70.036** | **$1.680.869** |
| **Mayor a 1 y hasta 2 SMMLV** | **10%** | Variable | $IBL \times 0.90$ |
| **Mayor a 2 y hasta 25 SMMLV** | **12%** | Variable | $IBL \times 0.88$ |

---

## 3. Régimen Tradicional (Ley 100 de 1993 y Ley 797 de 2003)

### A. Régimen de Prima Media (RPM - Colpensiones)
* **Edad de Pensión:**
  * Mujeres: 57 años.
  * Hombres: 62 años.
* **Semanas Mínimas Exigidas:**
  * Histórico general: 1.300 semanas.
  * *Sentencia C-197 de 2023 de la Corte Constitucional:* Reducción progresiva para mujeres de 25 semanas por año desde 2026 hasta llegar a 1.000 semanas en 2036.
* **Ingreso Base de Liquidación (IBL):**
  * Promedio de los salarios cotizados en los últimos 10 años anteriores al reconocimiento de la pensión, actualizados por IPC.
* **Tasa de Reemplazo ($r$):**
  $$r = 65.5 - 0.5 \times s$$
  Donde $s$ es el número de Salarios Mínimos (SMMLV) del IBL.
  * Por cada 50 semanas adicionales a las 1.300 semanas mínimas, se suma un 1.5% adicional al porcentaje de reemplazo (tope máximo del 80%).

### B. Régimen de Ahorro Individual con Solidaridad (RAIS - Fondos Privados)
* **Garantía de Pensión Mínima (FGPM):**
  * Si el saldo de la cuenta individual no alcanza para financiar una pensión por capital, a las **1.150 semanas cotizadas** y cumplida la edad (57 mujer / 62 hombre), el Estado y el FGPM financian una pensión de **1 SMMLV ($1.750.905)**.

---

## 4. Nuevo Sistema de Protección Social Integral para la Vejez (Ley 2381 de 2024 / Hacia 2027)

### A. Régimen de Transición (Arts. 75 y 76)
* **Conservan el régimen anterior de la Ley 100/797:**
  * **Mujeres:** $\ge 750$ semanas cotizadas.
  * **Hombres:** $\ge 900$ semanas cotizadas.
* **Ventana de Oportunidad de Traslado:**
  * Plazo de **dos (2) años** para trasladarse de régimen sin el veto anterior de los 10 años previos a la pensión.

### B. Sistema de Pilares Integrados
1. **Pilar Solidario:** Renta básica no contributiva para adultos mayores en pobreza extrema.
2. **Pilar Semicontributivo:** Para quienes cotizaron entre 300 y menos de las semanas requeridas de pensión. Otorga una renta vitalicia ajustada por IPC con subsidio estatal (20% hombres, 30% mujeres).
3. **Pilar Contributivo:**
   * **Componente de Prima Media (Colpensiones):** Cotización obligatoria sobre los primeros **2.3 SMMLV ($4.027.082)**.
   * **Componente Complementario de Ahorro Individual (AFP):** Cotización obligatoria por el excedente que supere los 2.3 SMMLV.
   * **Piso Legal:** La mesada integrada nunca será inferior a 1 SMMLV ($1.750.905).
4. **Enfoque Diferencial de Género (Mujeres):**
   * Reducción de la meta de semanas a 1.000 semanas.
   * Beneficio por cuidado de hijos: **50 semanas de reducción por cada hijo** nacido vivo o adoptado (máximo 3 hijos = hasta 150 semanas de reducción).

---

## 5. Fuentes y Enlaces Oficiales

* [Colpensiones: Reajuste Pensional 2026 y SMMLV](https://www.colpensiones.gov.co/publicaciones/5147/pensiones-en-colombia-se-reajustan-en-2026-mas-del-60-suben-con-el-salario-minimo-y-el-resto-con-la-inflacion/)
* [Sede Electrónica Colpensiones - Historia Laboral](https://sede.colpensiones.gov.co/tramite/updInfo/74/)
* [ABC del Sistema Pensional Colombiano](https://www.colpensiones.gov.co/educacion/publicaciones/2841/como-funciona-el-sistema-pensional-colombiano/)
