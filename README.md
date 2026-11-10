# 🚗 Vial interactivo — Ley 769 de 2002 (Colombia)

Plataforma web interactiva gamificada diseñada específicamente para **Centros de Enseñanza Automovilística (CEA)**, academias de conducción y capacitadores viales en Colombia. Su objetivo es evaluar y reforzar el conocimiento del **Título III del Código Nacional de Tránsito Terrestre (Ley 769 de 2002)** y sus normativas actualizadas (incluyendo la Ley Julián Esteban 2251 de 2022 y la Ley 1696 de 2013 de embriaguez).

---

## 🎯 Características Principales

1. **Pantalla de Proyector / Docente (Host)**:
   - Código PIN aleatorio de 6 dígitos con formato `XXX-XXX` para fácil lectura.
   - Generación de **Código QR nativo y directo** listo para escanear con la cámara del celular.
   - Banco de preguntas oficial pre-cargado con justificación legal artículo por artículo.
   - Temporizador dinámico regresivo con efectos de sonido sintetizados (Web Audio API).
   - Gráfico de barras de respuestas en tiempo real y tabla de posiciones (*Leaderboard*).
   - Podio interactivo (1°, 2° y 3° puesto) con animación de confeti.

2. **Pantalla del Estudiante (Móvil)**:
   - Acceso sin registro de cuentas ni contraseñas.
   - Selección de todas las categorías oficiales de licencia de conducción colombiana (**A1, A2, B1, B2, B3, C1, C2, C3**).
   - Cuatro botones táctiles con formas de vehículos de alta visibilidad:
     - 🏍️ **Motocicleta (Rojo)**: Opción 1
     - 🚗 **Automóvil (Azul)**: Opción 2
     - 🚌 **Bus (Amarillo)**: Opción 3
     - 🚛 **Camión (Verde)**: Opción 4
   - Feedback instantáneo de respuesta recibida y cálculo de puntaje según velocidad.

3. **Gestor del Banco de Preguntas**:
   - Panel modal para **agregar, editar y eliminar preguntas** personalizadas.
   - Persistencia local en el navegador mediante `localStorage`.
   - Botón de restauración del banco oficial original de preguntas esenciales.

4. **100% Instalable y Descargable (PWA y Archivo Único)**:
   - **PWA (Progressive Web App)**: Se puede instalar como aplicación nativa en Windows, Mac, Android o iOS (Safari).
   - **Descarga en 1 solo archivo HTML (`Vial_interactivo_Ley769.html`)**: Funciona haciendo doble clic en cualquier computador sin necesidad de instalar NodeJS ni servidores.

---

## 📚 Banco de Preguntas Incluido (Ley 769 de 2002 - Título III)

El banco inicial incluye preguntas fundamentales con su sustento legal:

| # | Tema Clave | Artículo / Norma |
|---|------------|-------------------|
| 1 | Límites de velocidad en zonas urbanas | Art. 106 (modificado por Ley 2251 de 2022: máx 50 km/h, 30 km/h en zonas escolares/residenciales) |
| 2 | Prelación y derecho de paso en Glorietas | Art. 70 (vehículo que ya circula dentro de la rotonda tiene prelación) |
| 3 | Distancia de seguridad al adelantar ciclistas | Art. 60 y Ley 1811 de 2016 (mínimo 1.5 metros de distancia lateral) |
| 4 | Ubicación de menores de 10 años en el vehículo | Art. 82 (obligatorio asiento trasero; menores de 2 años en silla infantil) |
| 5 | Conducción bajo influjo de alcohol | Ley 1696 de 2013 y Art. 152 (sanciones severas, suspensión/cancelación y multas progresivas) |
| 6 | Uso de direccionales antes del giro | Art. 67 (señalización con al menos 30 metros de antelación en zona urbana y 60m en carretera) |
| 7 | Uso obligatorio del cinturón de seguridad | Art. 82 (obligatorio para conductor y acompañantes en asientos delanteros y traseros desde 2004) |
| 8 | Pasajeros en motocicleta | Art. 94 y 96 (máximo un acompañante con casco reglamentario NTC 4533 / Res. 20203040023385) |
| 9 | Prelación en intersecciones sin señalización | Art. 70 (prelación del vehículo que aparece por el lado derecho) |
| 10 | Estacionamiento en vías públicas | Art. 75 y 76 (prohibido sobre andenes, curvas, puentes y a menos de 5 metros de esquinas) |
| 11 | Comportamiento ante vehículo de emergencia | Art. 64 (orillarse inmediatamente a la derecha y detenerse si es necesario) |
| 12 | Límites de velocidad en carreteras nacionales | Art. 107 (máximo 90 km/h y 120 km/h en vías dobles calzadas sin pasos peatonales) |

---

## 🚀 Opciones de Despliegue y Uso en el Aula

### Opción A: En Línea con Node.js / Express (Desarrollo o Producción)

1. **Instalación de dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   El servidor se iniciará en `http://localhost:3000`.

3. **Compilar para producción**:
   ```bash
   npm run build
   npm start
   ```

---

### Opción B: Uso en Red Wi-Fi Local del Aula (Sin Internet ni Cuentas)

Para que los alumnos en el aula se conecten a la computadora del profesor sin pasar por proxies de Google:

1. Conecta la computadora del profesor y los teléfonos de los estudiantes a la misma red Wi-Fi del salón.
2. Averigua la dirección IP local de la computadora (ejemplo: `192.168.1.45`).
3. En la pantalla del profesor (Host), haz clic en **"Personalizar URL / IP"**.
4. Escribe `http://192.168.1.45:3000` y pulsa **"Aplicar"**.
5. El código QR se actualizará automáticamente con esa IP. Los alumnos escanean el QR y entrarán directamente sin inicio de sesión.

---

### Opción C: Archivo HTML Autónomo (Un solo archivo)

1. En la parte superior del Host, pulsa **"Descargar HTML Único"**.
2. Guarda el archivo `Vial_interactivo_Ley769.html`.
3. **¿Cómo usarlo?**:
   - **Para proyección individual**: Doble clic y abre directamente en Chrome, Edge o Safari.
   - **Para compartir con todo el grupo**: Arrastra el archivo a [Netlify Drop](https://app.netlify.com/drop) o súbelo a GitHub Pages / Vercel. Tendrás un enlace público instantáneo (`https://vial-interactivo.netlify.app`) que cualquier alumno puede abrir con datos 4G/5G.

---

### Opción D: Instalación como App (PWA)

1. Abre la aplicación en Google Chrome, Microsoft Edge o Safari (iOS).
2. Haz clic en el botón superior **"Descargar / Instalar App"**.
3. Sigue las instrucciones:
   - **Android / Chrome / Windows**: Pulsa "Instalar aplicación".
   - **iOS (iPhone / iPad)**: Abre en Safari, pulsa el botón *Compartir* (cuadrado con flecha hacia arriba) y selecciona *"Agregar al inicio"*.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion).
- **Backend / Sincronización**: Express 4, Server-Sent Events (SSE), Web Audio API, `BroadcastChannel` y bus de eventos.
- **Iconografía**: `lucide-react`.
- **Efectos Visuales**: `canvas-confetti` (sintetizado para podio) y generador de PWA.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **Apache 2.0**. Libre para uso educativo, comercial y de capacitación en Centros de Enseñanza Automovilística de Colombia.
