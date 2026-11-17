import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { addCartItem, setCartQuantity, getCartQuote } from './cart/cartModel.js';
import { readCart, writeCart, getStorage, CART_KEY } from './cart/cartStorage.js';
import { emptyDraft } from './checkout/checkoutValidation.js';
import { readReceipt, RECEIPT_KEY } from './checkout/receiptStorage.js';
import { resetDemoOrders } from './checkout/demoOrderService.js';
import { catalogById } from './data/catalog.js';
const StoreContext = createContext(null);
export function StorefrontProviders({ children }) {
  const [items, setItems] = useState(() => readCart());
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [receipt, setReceipt] = useState(() => readReceipt());
  const [pending, setPending] = useState(false);
  const [cartNotice, setCartNotice] = useState('');
  const [storageWarning, setStorageWarning] = useState(!getStorage());
  const [theme, setTheme] = useState(() => {
    try {
      return getStorage()?.getItem('se347.theme.v1') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const abortRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    if (!writeCart(getStorage(), items))
      Promise.resolve().then(() => {
        if (active) setStorageWarning(true);
      });
    return () => {
      active = false;
    };
  }, [items]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      getStorage()?.setItem('se347.theme.v1', theme);
    } catch {
      /* Memory theme still works. */
    }
  }, [theme]);
  const addItem = (id, quantity) => {
    if (pending) return;
    const product = catalogById[id];
    if (!product) return;
    const limit = Math.min(99, product.stock);
    const room = limit - (items.find((item) => item.productId === id)?.quantity || 0);
    setCartNotice(
      room <= 0
        ? `Giỏ đã đạt giới hạn ${limit} ${product.name.toLowerCase()}.`
        : quantity > room
          ? `Đã thêm ${room} ${product.name.toLowerCase()}. Giỏ đã đạt giới hạn ${limit}.`
          : `Đã thêm ${quantity} ${product.name.toLowerCase()} vào giỏ.`,
    );
    setItems((current) => addCartItem(current, id, quantity));
  };
  const setQuantity = (id, quantity) => {
    if (!pending) setItems((current) => setCartQuantity(current, id, quantity));
  };
  const removeItem = (id) => {
    if (!pending) setItems((current) => current.filter((item) => item.productId !== id));
  };
  function resetStorefront() {
    abortRef.current?.abort();
    setPending(false);
    setItems([]);
    setDraft({ ...emptyDraft });
    setReceipt(null);
    resetDemoOrders();
    try {
      getStorage()?.removeItem(CART_KEY);
      getStorage('sessionStorage')?.removeItem(RECEIPT_KEY);
    } catch {
      /* Reset memory even when storage is blocked. */
    }
    navigate('/');
  }
  return (
    <StoreContext.Provider
      value={{
        items,
        quote: getCartQuote(items),
        addItem,
        setQuantity,
        removeItem,
        clearCart: () => setItems([]),
        draft,
        setDraft,
        receipt,
        setReceipt,
        pending,
        setPending,
        abortRef,
        storageWarning,
        cartNotice,
        theme,
        toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
        resetStorefront,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw Error('useStore requires StorefrontProviders');
  return value;
}
