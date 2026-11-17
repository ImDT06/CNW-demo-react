import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { useStore } from '../StorefrontProviders.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
import { OrderSummary } from './OrderSummary.jsx';
import { CartLines } from './CartLines.jsx';
import { storeMotion } from '../motion.js';
export function CartDrawer({ open, onClose, lastAddedProductId, keyboardOpen = false }) {
  const dialog = useRef(null);
  const controls = useAnimationControls();
  const reduce = useReducedMotion();
  const immediate = useRef(false);
  const { items, quote, cartNotice } = useStore();
  useEffect(() => {
    const el = dialog.current;
    let active = true;
    const previousOverflow = document.body.style.overflow;
    if (open) {
      if (!el.open) el.showModal();
      document.body.style.overflow = 'hidden';
      if (reduce || keyboardOpen) controls.set({ transform: 'translateX(0%)', opacity: 1 });
      else
        controls.start({
          transform: 'translateX(0%)',
          opacity: 1,
          transition: { duration: 0.26, ease: storeMotion.drawer },
        });
    } else if (el.open) {
      const finish = () => {
        if (active) {
          el.close();
          document.body.style.overflow = '';
        }
      };
      if (reduce || immediate.current) {
        controls.set({ transform: 'translateX(100%)', opacity: 0 });
        finish();
      } else
        controls
          .start({
            transform: 'translateX(100%)',
            opacity: 0,
            transition: { duration: 0.2, ease: storeMotion.drawer },
          })
          .then(finish);
    }
    immediate.current = false;
    return () => {
      active = false;
      document.body.style.overflow = previousOverflow;
    };
  }, [open, controls, reduce, keyboardOpen]);
  const closeForNavigation = () => {
    immediate.current = true;
    onClose();
  };
  return (
    <dialog
      ref={dialog}
      className="cart-dialog"
      aria-labelledby="drawer-title"
      onCancel={(e) => {
        e.preventDefault();
        immediate.current = true;
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="cart-drawer"
        initial={{ transform: 'translateX(100%)', opacity: 0 }}
        animate={controls}
      >
        <div className="drawer-heading">
          <div>
            <h2 id="drawer-title">
              Giỏ của bạn <span>({quote.totalQuantity})</span>
            </h2>
          </div>
          <button
            className="os-icon"
            aria-label="Đóng giỏ hàng"
            onClick={(e) => {
              immediate.current = e.detail === 0;
              onClose();
            }}
            autoFocus
          >
            <StoreIcon name="close" />
          </button>
        </div>
        {items.length ? (
          <>
            <div className="drawer-content">
              {lastAddedProductId && (
                <p className="added-note" role="status">
                  <StoreIcon name="check" size={16} /> {cartNotice}
                </p>
              )}
              <CartLines lastAddedProductId={lastAddedProductId} onNavigate={closeForNavigation} />
            </div>
            <OrderSummary quote={quote} totalTestId="drawer-total">
              <Link className="os-button primary full" to="/checkout" onClick={closeForNavigation}>
                Tiếp tục đặt hàng <StoreIcon name="arrow" size={18} />
              </Link>
              <Link className="drawer-cart-link" to="/cart" onClick={closeForNavigation}>
                Xem và chỉnh sửa giỏ hàng
              </Link>
            </OrderSummary>
          </>
        ) : (
          <div className="drawer-empty">
            <span className="empty-symbol">
              <StoreIcon name="bag" size={38} />
            </span>
            <h3>Giỏ đang chờ ngụm đầu tiên.</h3>
            <p>Chọn một món nhỏ để bắt đầu ngày dễ chịu.</p>
            <Link className="os-button primary" to="/shop" onClick={closeForNavigation}>
              Ghé cửa hàng <StoreIcon name="arrow" size={18} />
            </Link>
          </div>
        )}
      </motion.div>
    </dialog>
  );
}
