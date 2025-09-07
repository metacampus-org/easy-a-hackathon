declare global {
  interface Window {
    algorand?: {
      isExodus?: boolean;
      connect: () => Promise<{
        accounts: Array<{ address: string }>;
      }>;
    };
    lute?: {
      connect: () => Promise<{
        accounts: string[];
      }>;
    };
  }
}

export {};
