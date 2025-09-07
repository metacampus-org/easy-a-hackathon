declare global {
  interface Window {
    algorand?: {
      isExodus?: boolean;
      isLute?: boolean;
      connect: () => Promise<{
        accounts: Array<{ address: string }>;
      }>;
    };
    lute?: {
      connect: () => Promise<{
        accounts: string[];
      }>;
    };
    LuteWallet?: {
      connect: () => Promise<{
        accounts: string[];
      }>;
    };
  }
}

export {};
