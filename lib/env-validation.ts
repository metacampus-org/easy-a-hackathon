/**
 * Environment Variable Validation
 * 
 * This module validates required environment variables on app startup
 * and provides helpful error messages if configuration is missing or invalid.
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates all required environment variables for MetaCAMPUS
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables for new Pera Wallet + Smart Contract architecture
  const requiredVars = {
    NEXT_PUBLIC_ALGOD_URL: process.env.NEXT_PUBLIC_ALGOD_URL,
    NEXT_PUBLIC_INDEXER_URL: process.env.NEXT_PUBLIC_INDEXER_URL,
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
    NEXT_PUBLIC_SUPER_ADMIN_WALLET: process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET,
  };

  // Legacy variables (optional, for backward compatibility)
  const legacyVars = {
    NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    NEXT_PUBLIC_WEB3AUTH_NETWORK: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
    NEXT_PUBLIC_ALGORAND_APP_ID: process.env.NEXT_PUBLIC_ALGORAND_APP_ID,
  };

  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value === '' || value.includes('YOUR_')) {
      // Allow localhost URLs for development
      if (key.includes('URL') && value?.includes('localhost')) {
        return;
      }
      // Allow APP_ID of 0 before deployment
      if (key === 'NEXT_PUBLIC_APP_ID' && value === '0') {
        warnings.push(
          `${key} is set to 0. Update this after deploying the smart contract.`
        );
        return;
      }
      errors.push(
        `Missing or invalid ${key}. Please check your .env.local file.`
      );
    }
  });

  // Validate Algod URL
  const algodUrl = requiredVars.NEXT_PUBLIC_ALGOD_URL;
  if (algodUrl && !algodUrl.startsWith('http://') && !algodUrl.startsWith('https://')) {
    errors.push(
      'NEXT_PUBLIC_ALGOD_URL must start with http:// or https://'
    );
  }

  // Validate Indexer URL
  const indexerUrl = requiredVars.NEXT_PUBLIC_INDEXER_URL;
  if (indexerUrl && !indexerUrl.startsWith('http://') && !indexerUrl.startsWith('https://')) {
    errors.push(
      'NEXT_PUBLIC_INDEXER_URL must start with http:// or https://'
    );
  }

  // Validate Super Admin Wallet format (basic Algorand address validation)
  const superAdminWallet = requiredVars.NEXT_PUBLIC_SUPER_ADMIN_WALLET;
  if (superAdminWallet && !superAdminWallet.includes('YOUR_')) {
    // Algorand addresses are 58 characters long and base32 encoded
    if (superAdminWallet.length !== 58) {
      warnings.push(
        'NEXT_PUBLIC_SUPER_ADMIN_WALLET does not appear to be a valid Algorand address (should be 58 characters).'
      );
    }
  }

  // Validate App ID
  const appId = requiredVars.NEXT_PUBLIC_APP_ID;
  if (appId && appId !== '0' && isNaN(Number(appId))) {
    errors.push(
      'NEXT_PUBLIC_APP_ID must be a valid number.'
    );
  }

  // Validate network configuration
  const network = process.env.NEXT_PUBLIC_ALGORAND_NETWORK;
  const validNetworks = ['testnet', 'mainnet'];
  if (network && !validNetworks.includes(network)) {
    warnings.push(
      `NEXT_PUBLIC_ALGORAND_NETWORK is "${network}". Recommended values: ${validNetworks.join(', ')}`
    );
  }

  // Check for .env.local file existence (development only)
  if (process.env.NODE_ENV === 'development') {
    const hasEnvFile = Object.keys(requiredVars).some(key => 
      process.env[key] && !process.env[key]?.includes('YOUR_')
    );
    
    if (!hasEnvFile) {
      errors.push(
        'No .env.local file detected. Please copy .env.local.example to .env.local and configure your environment variables.'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Logs validation results to console with appropriate formatting
 */
export function logValidationResults(result: EnvValidationResult): void {
  if (result.errors.length > 0) {
    console.error('\n❌ Environment Configuration Errors:\n');
    result.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    console.error('\n📖 Setup Instructions:');
    console.error('  1. Copy .env.local.example to .env.local');
    console.error('  2. Follow the setup guide in docs/EC2_ALGORAND_NODE_SETUP.md');
    console.error('  3. Deploy the smart contract (task 2)');
    console.error('  4. Configure all required environment variables\n');
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Configuration Warnings:\n');
    result.warnings.forEach((warning, index) => {
      console.warn(`  ${index + 1}. ${warning}`);
    });
    console.warn('');
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ Environment configuration validated successfully\n');
  }
}

/**
 * Validates environment and throws error if invalid (for app startup)
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment();
  logValidationResults(result);

  if (!result.isValid) {
    throw new Error(
      'Invalid environment configuration. Please check the errors above and update your .env.local file.'
    );
  }
}

/**
 * Gets a required environment variable or throws an error
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  
  if (!value || value === '' || value.includes('your_') || value.includes('YOUR_')) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env.local file.`
    );
  }
  
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  const value = process.env[key];
  
  if (!value || value === '' || value.includes('your_') || value.includes('YOUR_')) {
    return defaultValue;
  }
  
  return value;
}

/**
 * Environment configuration object with validated values
 */
export const envConfig = {
  algorand: {
    algodUrl: () => getOptionalEnv('NEXT_PUBLIC_ALGOD_URL', 'http://localhost:8080'),
    indexerUrl: () => getOptionalEnv('NEXT_PUBLIC_INDEXER_URL', 'http://localhost:8980'),
    algodToken: () => getOptionalEnv('NEXT_PUBLIC_ALGOD_TOKEN', ''),
    indexerToken: () => getOptionalEnv('NEXT_PUBLIC_INDEXER_TOKEN', ''),
    appId: () => getOptionalEnv('NEXT_PUBLIC_APP_ID', '0'),
    network: () => getOptionalEnv('NEXT_PUBLIC_ALGORAND_NETWORK', 'testnet'),
  },
  auth: {
    superAdminWallet: () => getOptionalEnv('NEXT_PUBLIC_SUPER_ADMIN_WALLET', ''),
  },
  storage: {
    sqliteDbPath: () => getOptionalEnv('SQLITE_DB_PATH', './data/metacampus.db'),
  },
  features: {
    enableUniversitySignup: () => getOptionalEnv('NEXT_PUBLIC_ENABLE_UNIVERSITY_SIGNUP', 'true') === 'true',
    enableIpfs: () => getOptionalEnv('NEXT_PUBLIC_ENABLE_IPFS', 'false') === 'true',
  },
  debug: {
    authLogging: () => getOptionalEnv('NEXT_PUBLIC_DEBUG_AUTH', 'false') === 'true',
  },
  // Legacy configuration (for backward compatibility)
  legacy: {
    web3authClientId: () => getOptionalEnv('NEXT_PUBLIC_WEB3AUTH_CLIENT_ID', ''),
    web3authNetwork: () => getOptionalEnv('NEXT_PUBLIC_WEB3AUTH_NETWORK', ''),
    algorandAppId: () => getOptionalEnv('NEXT_PUBLIC_ALGORAND_APP_ID', ''),
  },
};
