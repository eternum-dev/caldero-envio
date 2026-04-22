# Caldero Envío

- [English](#english)

---

## Tabla de Contenidos

- [Visión General](#visión-general)
  - [Proyecto](#proyecto)
  - [Capturas de Pantalla](#capturas-de-pantalla)
- [Mi Proceso](#mi-proceso)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
  - [Instalación](#instalación)
  - [Scripts del Proyecto](#scripts-del-proyecto)
- [Autor](#autor)

---

## Visión General

### Proyecto

**Caldero Envío** es una aplicación de gestión de entregas para negocios locales con servicio de delivery.

**Problema original**: Los locales dependían del criterio de cada repartidor para definir precios y tiempos de entrega, lo cual generaba inconsistencias e insatifacción en los clientes.

**Solución**: Un sistema que calcula automáticamente rutas, tiempos y precios basado en la distancia y reglas de precio configurables.

### Capturas de Pantalla

*(Próximamente)*

---

## Mi Proceso

### Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS |
| Routing | React Router v6 |
| Backend | Firebase (Auth + Firestore) |
| Mapas | Mapbox GL JS |

### Configuración de Variables de Entorno

1. Copia el archivo `.env.example` a `.env` en la raíz del proyecto
2. Completa las variables requeridas

```env
# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=tu_mapbox_token
```

> **Nota**: Obtén tus credenciales de Firebase en [Firebase Console](https://console.firebase.google.com/) y tu token de Mapbox en [Mapbox](https://www.mapbox.com/).

### Instalación

#### Clonar este repositorio

```bash
git clone https://github.com/eternum-dev/caldero-envio.git
```

#### Acceder a la carpeta del proyecto

```bash
cd caldero-envio
```

#### Instalar dependencias

```bash
npm install
```

### Scripts del Proyecto

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Construir para producción |
| `npm run preview` | Previsualizar build de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run lint:fix` | Ejecutar ESLint con correcciones automáticas |
| `npm run format` | Formatear archivos con Prettier |

---

## Autor

### Alejandro Thon

- LinkedIn - [Alejandro Thon](https://www.linkedin.com/in/alejandrothon/)
- Email - alejandro.thon.j@gmail.com

---

# Caldero Envío <a id="english"></a>

## Table of Contents

- [Overview](#overview)
  - [Project](#project)
  - [Screenshots](#screenshots)
- [My Process](#my-process)
  - [Tech Stack](#tech-stack)
  - [Environment Variables Configuration](#environment-variables-configuration)
  - [Installation](#installation)
  - [Project Scripts](#project-scripts)
- [Author](#author)

---

## Overview

### Project

**Caldero Envío** is a delivery management application for local businesses with delivery service.

**Original problem**: Local businesses relied on each courier's judgment to set delivery prices and times, leading to inconsistencies and customer dissatisfaction.

**Solution**: A system that automatically calculates routes, times, and prices based on distance and configurable pricing rules.

### Screenshots

*(Coming soon)*

---

## My Process

### Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend | Firebase (Auth + Firestore) |
| Maps | Mapbox GL JS |

### Environment Variables Configuration

1. Copy `.env.example` to `.env` in the project root
2. Complete the required variables

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

> **Note**: Get your Firebase credentials at [Firebase Console](https://console.firebase.google.com/) and your Mapbox token at [Mapbox](https://www.mapbox.com/).

### Installation

#### Clone this repository

```bash
git clone https://github.com/eternum-dev/caldero-envio.git
```

#### Navigate to the project folder

```bash
cd caldero-envio
```

#### Install dependencies

```bash
npm install
```

### Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format files with Prettier |

---

## Author

### Alejandro Thon

- LinkedIn - [Alejandro Thon](https://www.linkedin.com/in/alejandrothon/)
- Email - alejandro.thon.j@gmail.com