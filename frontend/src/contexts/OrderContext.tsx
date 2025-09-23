import React, { createContext, useContext, useState, ReactNode } from 'react'
import { MenuItem } from '../lib/api'

export interface CartItem {
  item: MenuItem
  quantity: number
}

export interface OrderContextType {
  cart: CartItem[]
  addToCart: (item: MenuItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

interface OrderProviderProps {
  children: ReactNode
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item._id === item._id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.item._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item._id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.item._id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, cartItem) => total + cartItem.quantity, 0)
  }

  const value: OrderContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}
