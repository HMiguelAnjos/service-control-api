declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        planId: number | null;
        businessId: number | null;
        isActive: boolean;
      };
    }
  }
}

export {};
