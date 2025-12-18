# For Developers

CBD3 is an open-source project released under the MIT license. 

This section provides comprehensive technical information for developers who want to contribute to CBD3, extend its functionality, or build applications using our Project.

## Technology Stack

- **Frontend**: Vue 3, Pinia, Element Plus, ECharts
- **Backend**: Node.js, Express.js, MySQL
- **Documentation**: VitePress with Mermaid support
- **Testing**: Vitest, Jest, Supertest
- **Build Tools**: Vite, ESLint, Prettier

## Project Structure Overview

```
CBD3/
├── CBD-frontend/           # Frontend application
│   ├── docs/              # VitePress documentation
│   ├── src/               # Vue application source
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── stores/        # Pinia state stores
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   ├── package.json       # Dependencies and scripts
│   └── vite.config.js     # Vite configuration
└── CBD-backend/           # Backend application
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── middleware/    # Express middleware
    │   ├── services/      # Business logic
    │   └── utils/         # Utility functions
    ├── config/            # Configuration files
    └── package.json       # Dependencies and scripts
```

## Getting Help

- **Documentation**: Check the relevant documentation sections
- **GitHub Issues**: Search existing issues before creating new ones

## Details

For more details, please refer to [our Github repository page](https://github.com/WhyLIM/CBD-vue).