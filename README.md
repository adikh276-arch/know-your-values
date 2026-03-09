# Know Your Values

Understand what matters to you. Identifying and living by your core values is essential for personal growth and fulfillment.

## Features

- **Value Assessment**: Discover your core values through a guided process.
- **Internationalization**: Support for 20 languages.
- **Responsive Design**: Works on mobile and desktop.
- **Docker Ready**: Easy deployment with Docker and Nginx.

## Technologies

- **Vite**
- **TypeScript**
- **React**
- **shadcn/ui**
- **Tailwind CSS**
- **i18next**

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adikh276-arch/know-your-values
   cd know-your-values
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

## Deployment

This project includes a `Dockerfile` and `vite-nginx.conf` for hosting on a subpath `/know_your_values/`.

### Docker Build

```bash
docker build -t know-your-values .
```

### GitHub Actions

The repository is configured with GitHub Actions to automatically build and push the Docker image on changes to the `main` branch.
