export type ShoppingItem = {
  id: number;
  userId: number;
  name: string;
  quantity: string | null;
  notes: string | null;
  isPurchased: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateShoppingItemInput = {
  name: string;
  quantity?: string | null;
  notes?: string | null;
  isPurchased?: boolean;
};
