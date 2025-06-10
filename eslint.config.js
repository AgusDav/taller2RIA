module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true 
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: { 
    react: { 
      version: '18.2' 
    } 
  },
  plugins: ['react-refresh'],
  rules: {
    // React rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off', // Deshabilitado para simplificar
    'react/no-unescaped-entities': 'warn',
    
    // General rules
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': ['warn', { 
      allow: ['warn', 'error'] 
    }],
    'prefer-const': 'warn',
    'no-var': 'error',
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'multi-line'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    
    // Styling (handled by Prettier, but some exceptions)
    'max-len': ['warn', { 
      code: 100, 
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }]
  },
};