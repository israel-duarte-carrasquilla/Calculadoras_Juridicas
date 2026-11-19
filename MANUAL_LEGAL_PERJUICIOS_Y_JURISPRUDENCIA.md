# 🇨🇴 Manual Forense de Liquidación de Perjuicios y Jurisprudencia Unificada (Colombia 2026)

**Guía de Tasación, Fórmulas Actuariales y Baremos Jurisprudenciales para Responsabilidad Civil y Contencioso Administrativa**  
*Consejo de Estado (Sección Tercera) • Corte Suprema de Justicia (Sala de Casación Civil) • Corte Constitucional*

---

## 🏛️ 1. Marco Constitucional y Legal

El principio de **reparación integral** del daño antijurídico y de los perjuicios civiles constituye la columna vertebral del derecho de daños en Colombia.

### 1.1. Principio Constitucional de Responsabilidad Patrimonial del Estado
* **Artículo 90 de la Constitución Política:**  
  > *"El Estado responderá patrimonialmente por los daños antijurídicos que le sean imputables, causados por la acción o la omisión de las autoridades públicas."*  
  Consagra una cláusula general de responsabilidad estatal objetiva o por falla del servicio, exigiendo dos elementos estructurales:
  1. Un **daño antijurídico**: lesión patrimonial o extrapatrimonial que la víctima no está en el deber jurídico de soportar.
  2. Una **imputación**: fáctica y jurídica a la entidad pública demandada (falla en el servicio, riesgo excepcional o daño especial).

### 1.2. Régimen del Código Civil Colombiano
* **Artículo 1613 (Indemnización de perjuicios):** Comprende el daño emergente y el lucro cesante, ya provengan de no haberse cumplido la obligación, o de haberse cumplido imperfectamente, o de haberse retardado el cumplimiento.
* **Artículo 1614 (Daño emergente y lucro cesante):**
  * **Daño emergente:** El perjuicio o la pérdida que proviene de no haberse cumplido la obligación o de haberse destruido la cosa.
  * **Lucro cesante:** La ganancia o provecho que deja de reportarse a consecuencia de no haberse cumplido la obligación, o cumplídola imperfectamente, o retardado su cumplimiento.
* **Artículo 1616 (Previsibilidad del daño contractual):** Si no se puede imputar dolo al deudor, solo es responsable de los perjuicios que se previeron o pudieron preverse al tiempo del contrato. Si hay dolo, es responsable de todos los perjuicios que fueron una consecuencia inmediata o directa de no haberse cumplido la obligación o de haberse demorado su cumplimiento.
* **Artículo 1617 (Interés legal civil):** Fija el interés legal en el 6% anual (0.5% mensual) para obligaciones de pagar sumas de dinero cuando no se hubiere pactado el interés moratorio.
* **Artículo 2341 (Responsabilidad Extracontractual):** El que ha cometido un delito o culpa, que ha inferido daño a otro, es obligado a la indemnización; sin perjuicio de la pena principal que la ley imponga por la culpa o el delito cometido.

### 1.3. Régimen del CPACA (Ley 1437 de 2011)
* **Artículo 140 (Reparación Directa):** Medio de control procesal idóneo para demandar la indemnización de perjuicios causados por hechos, omisiones, operaciones administrativas o la ocupación temporal o permanente de inmuebles por causa de trabajos públicos.

---

## 📊 2. Tipología Dogmática de los Perjuicios

```
                               PERJUICIOS INDEMNIZABLES
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
PERJUICIOS MATERIALES (PATRIMONIALES)             PERJUICIOS INMATERIALES (EXTRAPATRIMONIALES)
        │                                                                 │
   ┌────┴──────────────────────────┐             ┌────────────────────────┼────────────────────────┐
   ▼                               ▼             ▼                        ▼                        ▼
DAÑO EMERGENTE               LUCRO CESANTE   PERJUICIO MORAL        DAÑO A LA SALUD       BIENES CONST. Y CONV.
 - Consolidado (Pasado)       - Consolidado  (Pretium Doloris)      (Fisiológico /         PROTEGIDOS
 - Futuro (Cuidadores,        - Futuro       (Baremo CE 28/08/14    Vida de Relación       (Libertad, Buen Nombre,
   prótesis, tratamientos)    (Actuarial)     Hasta 100 SMMLV)      Hasta 100-400 SMMLV)   Hasta 100 SMMLV)
```

---

## 📐 3. Fórmulas Matemáticas Actuariales de Liquidación

Tanto la **Sección Tercera del Consejo de Estado** (en su *Guía de Liquidación de Perjuicios*) como la **Sala de Casación Civil de la Corte Suprema de Justicia** utilizan matemática financiera actuarial basada en anualidades uniformes vencidas e indexación por inflación.

### 3.1. Corrección Monetaria (Indexación por IPC DANE)
Todo cálculo debe partir de la moneda constante para salvaguardar el poder adquisitivo frente al fenómeno inflacionario:

$$V_a = V_h \times \left( \frac{\text{IPC}_{\text{final}}}{\text{IPC}_{\text{inicial}}} \right)$$

* $V_a$: Valor actualizado a la fecha de corte o sentencia.
* $V_h$: Valor histórico (ingreso mensual devengado o desembolso efectuado al momento del hecho dañoso).
* $\text{IPC}_{\text{final}}$: Índice de Precios al Consumidor certificado por el DANE correspondiente al mes de la liquidación.
* $\text{IPC}_{\text{inicial}}$: Índice de Precios al Consumidor certificado por el DANE correspondiente al mes en que ocurrió el hecho dañoso o el gasto.

### 3.2. Determinación del Ingreso Base de Liquidación ($R_a$)
Para tasar el lucro cesante, la jurisprudencia unificada aplica tres reglas imperativas:
1. **Factor Prestacional del 25%:**  
   Si la víctima tenía vinculación laboral formal, al salario base devengado se le adiciona el **25%** por concepto de prestaciones sociales de ley (cesantías, intereses a las cesantías, prima de servicios y vacaciones). Si era independiente o informal, no se aplica este factor.
2. **Deducción del 25% por Autosostenimiento Propio (Exclusivo en Muerte):**  
   * **En caso de Muerte:** La jurisprudencia presume que la persona destinaba el 25% de sus ingresos para su propio sostenimiento individual. Por ende, la masa indemnizable para los dependientes económicos (cónyuge e hijos) es el **75%** del ingreso neto actualizado ($R_a \times 0.75$).
   * **En caso de Lesiones Personales:** **NO se realiza deducción alguna del 25%**, pues la persona sigue con vida y requiere el 100% de su capacidad económica para su propia subsistencia.
3. **Pérdida de Capacidad Laboral (PCL %):**  
   En eventos de lesiones, la renta mensual se modula multiplicándola por el porcentaje de invalidez fijado en el dictamen pericial (Junta de Calificación de Invalidez o Instituto Nacional de Medicina Legal):
   $$R_a = \text{Ingreso Actualizado} \times \left( \frac{\text{PCL}}{100} \right)$$
4. **Presunción de 1 SMMLV:**  
   Si no se logra demostrar el monto exacto de los ingresos pero se acredita que la víctima era una persona en edad productiva laboralmente activa, la jurisprudencia presume como ingreso base **un (1) Salario Mínimo Legal Mensual Vigente (SMMLV)** (Sentencias de Unificación Consejo de Estado y CSJ SC-10297-2014).

---

### 3.3. Tasa Pura de Interés Mensual ($i$)
Para evitar el anatocismo o la doble compensación inflacionaria, la jurisprudencia colombiana exige liquidar sobre la base de una **tasa pura o real de interés** (que no incluya componente inflacionario, pues este ya fue reconocido en la indexación del IPC):
* **Línea del Consejo de Estado (Tasa Pura Técnica):**  
  Equivalente financiero exacto al 6% anual efectivo capitalizable mensualmente:
  $$i = \sqrt[12]{1 + 0.06} - 1 \approx 0.00486755 \quad (0.4867\% \text{ mensual})$$
* **Línea Tradicional de la Corte Suprema de Justicia (Tasa Nominal):**  
  División aritmética simple de la tasa legal civil del 6% anual entre 12 meses:
  $$i = \frac{0.06}{12} = 0.005000 \quad (0.5\% \text{ mensual})$$

---

### 3.4. Lucro Cesante Consolidado (Pasado)
Comprende las sumas que se dejaron de percibir desde la fecha del hecho dañoso (o fecha de retiro de salarios/incapacidad) hasta la fecha de corte de la liquidación o sentencia ($m$ meses transcurridos).

Fórmula de acumulación con interés compuesto de anualidades vencidas:

$$S_c = R_a \times \left[ \frac{(1 + i)^m - 1}{i} \right]$$

* $S_c$: Lucro cesante consolidado total.
* $R_a$: Renta mensual neta actualizada indemnizable.
* $i$: Tasa pura mensual ($0.004867$ o $0.005$).
* $m$: Número de meses transcurridos entre la fecha del hecho y la fecha de liquidación.

---

### 3.5. Lucro Cesante Futuro
Comprende la indemnización descontada a **valor presente neto (VPN)** de las rentas periódicas futuras que la víctima o sus dependientes habrían de percibir en el porvenir ($n$ meses futuros).

Fórmula de valor presente de rentas periódicas uniformes vencidas:

$$S_f = R_a \times \left[ \frac{(1 + i)^n - 1}{i \cdot (1 + i)^n} \right]$$

* $S_f$: Lucro cesante futuro a valor presente.
* $n$: Número de meses futuros indemnizables.

#### Reglas de Determinación de $n$ (Meses Futuros):
1. **Lesiones Corporales e Invalidez:**  
   $n$ se extiende desde la fecha de corte hasta el límite de la **expectativa de vida probable** de la víctima según las Tablas de Mortalidad de Rentistas de la Superintendencia Financiera de Colombia (Resolución 1555 de 2010), menos la edad alcanzada al momento del corte.
2. **Muerte de la Víctima:**
   * **Para el Cónyuge o Compañero(a) Permanente:** Se toma la **menor** entre la vida probable del causante fallecido y la vida probable del cónyuge supérstite.
   * **Para los Hijos Menores:** El periodo indemnizable se computa hasta cumplir **veinticinco (25) años de edad**, condicionado a la acreditación de estudios formales continuos (criterio unificado del Consejo de Estado y CSJ). Si no estudian, hasta la mayoría de edad (18 años).
   * **Para Hijos con Discapacidad Absoluta:** Se liquida por toda la vida probable del hijo o de los padres (la menor).
   * **Para Padres de la Víctima (si dependían económicamente):** Hasta la vida probable de los padres o del causante (la menor).

---

## ⚖️ 4. Baremos Jurisprudenciales de Perjuicios Inmateriales

### 4.1. Perjuicio Moral (Pretium Doloris)
El Consejo de Estado, en su histórica **Sentencia de Unificación de Sala Plena de Sección Tercera del 28 de agosto de 2014 (Radicación 32.988, M.P. Ramiro Pazos Guerrero)**, estableció el baremo vinculante para la tasación del daño moral en Salarios Mínimos Mensuales Legales Vigentes (SMMLV):

| Nivel de Parentesco / Afecto | Familiares Incluidos | Porcentaje de la Tarifa | Tope Máximo en Muerte o PCL $\ge 50\%$ |
| :--- | :--- | :---: | :---: |
| **Nivel 1** | Cónyuge, compañera(o) permanente, padres, hijos | **100%** | **100 SMMLV** |
| **Nivel 2** | Nietos, abuelos, hermanos | **50%** | **50 SMMLV** |
| **Nivel 3** | Tíos, sobrinos | **35%** | **35 SMMLV** |
| **Nivel 4** | Primos hermanos | **15%** | **15 SMMLV** |
| **Nivel 5** | Terceros damnificados no familiares con afecto probado | **15%** | **15 SMMLV** |

#### Regla de Modulación en Caso de Lesiones Personales:
Cuando la víctima directa no fallece sino que sufre lesiones corporales, la indemnización moral de todo el núcleo familiar se gradúa de conformidad con el porcentaje de Pérdida de Capacidad Laboral (PCL):
* $\text{PCL} \ge 50\%$: **100%** del tope del nivel correspondiente.
* $\text{PCL entre } 40\% \text{ y } 49.99\%$: **80%** del tope.
* $\text{PCL entre } 30\% \text{ y } 39.99\%$: **60%** del tope.
* $\text{PCL entre } 20\% \text{ y } 29.99\%$: **40%** del tope.
* $\text{PCL entre } 10\% \text{ y } 19.99\%$: **20%** del tope.
* $\text{PCL entre } 1\% \text{ y } 9.99\%$: **10%** del tope.

---

### 4.2. Daño a la Salud (o Perjuicio Fisiológico / Daño a la Vida de Relación)
* **Reconocimiento Exclusivo:** El daño a la salud solo puede predicarse de la **víctima directa** que experimentó la afectación en su integridad psicofísica (no de sus familiares o terceros).
* **Escala Unificada del Consejo de Estado (Sentencias Rad. 19.031 de 2011 y 32.988 de 2014):**
  * $\text{PCL} \ge 50\%$: **100 SMMLV**.
  * $\text{PCL entre } 40\% \text{ y } 49.99\%$: **80 SMMLV**.
  * $\text{PCL entre } 30\% \text{ y } 39.99\%$: **60 SMMLV**.
  * $\text{PCL entre } 20\% \text{ y } 29.99\%$: **40 SMMLV**.
  * $\text{PCL entre } 10\% \text{ y } 19.99\%$: **20 SMMLV**.
  * $\text{PCL entre } 1\% \text{ y } 9.99\%$: **10 SMMLV**.
* **Tope Excepcional de 400 SMMLV:** En situaciones de extrema gravedad (paraplejia, estado vegetativo persistente, quemaduras severas de tercer grado en el rostro o pérdida de múltiples extremidades), el juez contencioso administrativo puede motivar una condena de hasta 400 SMMLV.

---

### 4.3. Bienes Constitucional y Convencionalmente Protegidos
* Introducido para reparar violaciones graves a derechos humanos, libertad personal (privación injusta de la libertad), dignidad humana o discriminación sistemática.
* Se otorga principalmente a través de **medidas no pecuniarias** (actos de desagravio público, disculpas oficiales, difusión de la sentencia, capacitaciones en DD.HH.).
* De forma excepcional y subsidiaria, se fijan indemnizaciones de hasta **100 SMMLV** para la víctima directa y su familia.

---

## 📝 5. El Juramento Estimatorio (Artículo 206 del CGP)

El Artículo 206 del Código General del Proceso (Ley 1564 de 2012) modificó radicalmente la técnica procesal de reclamación de perjuicios en Colombia:

1. **Obligatoriedad:** Quien pretenda el reconocimiento de una indemnización, compensación o el pago de frutos o mejoras, **deberá estimarlo razonadamente bajo juramento en la demanda o petición correspondiente**.
2. **Discriminación Rigurosa:** La estimación debe individualizar de manera clara cada concepto (daño emergente consolidado, lucro cesante consolidado, lucro cesante futuro, daño emergente futuro) y aportar las bases matemáticas que la sustentan.
3. **Inaplicabilidad a Perjuicios Extrapatrimoniales:** Mediante la **Sentencia C-157 de 2013 de la Corte Constitucional**, se declaró la exequibilidad condicionada del Art. 206 CGP en el entendido de que **los perjuicios extrapatrimoniales (morales y a la salud) NO son susceptibles de juramento estimatorio**, toda vez que su cuantificación escapa al cálculo económico exacto y compete privativamente al arbitrio judicial reglado.
4. **Sanción Económica Procesal por Sobreestimación:**
   * Si la cantidad estimada excede en el **cincuenta por ciento (50%)** a la que resulte probada en el proceso, se condenará al demandante al pago de una suma equivalente al **diez por ciento (10%)** de la diferencia a favor del Consejo Superior de la Judicatura.
   * Si no se prueba la causación de ningún perjuicio por dolo o culpa grave, la sanción será del **cinco por ciento (5%)** del monto pretendido.

---

## 📚 6. Repertorio Jurisprudencial Hito

1. **Consejo de Estado - Sala Plena Sección Tercera, Sentencia de 28 de agosto de 2014 (Rad. 32.988):**
   * *M.P. Ramiro Pazos Guerrero.*
   * Establece el baremo universal de 5 niveles para perjuicios morales y consolida el daño a la salud como categoría unívoca en lo contencioso.
2. **Consejo de Estado - Sección Tercera, Sentencia de 14 de septiembre de 2011 (Rad. 19.031 y 38.222):**
   * *M.P. Enrique Gil Botero.*
   * Define y delimita el Daño a la Salud frente a la tipología del daño a la vida de relación, fijando la tabla de 100 SMMLV según gravedad médica.
3. **Corte Suprema de Justicia - Sala de Casación Civil, Sentencia SC-10297-2014:**
   * *M.P. Ariel Salazar Ramírez.*
   * Doctrina sobre la tasación del lucro cesante y la vigencia del daño a la vida de relación en el derecho civil privado.
4. **Corte Suprema de Justicia - Sala de Casación Civil, Sentencia SC-917-2022:**
   * *M.P. Luis Alonso Rico Puerta.*
   * Reglas sobre aplicación de la tasa pura del 6% y compatibilidad de la indexación con la restitución de valores patrimoniales.
5. **Corte Constitucional - Sentencia C-157 de 2013:**
   * *M.P. Mauricio González Cuervo.*
   * Exclusión de perjuicios inmateriales de la sanción y rigor del Juramento Estimatorio del Art. 206 CGP.
