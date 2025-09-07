declare global {
  interface Window {
    algorand?: {
      isExodus?: boolean;
      isLute?: boolean;
      connect: () => Promise<{
        accounts: Array<{ address: string }>;
      }>;
    };
  }
}

export {};
