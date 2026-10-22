import { createContext, useContext } from 'react';

export interface CartCtx { count: number; add: (n?: number) => void }
export const CartContext = createContext<CartCtx>({ count: 0, add: () => {} });
export const useCart = () => useContext(CartContext);
