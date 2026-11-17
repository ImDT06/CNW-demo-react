import { formatPrice } from '../data/catalog.js';
import { FREE_SHIPPING_THRESHOLD } from './cartModel.js';
export function OrderSummary({ quote, children, totalTestId = 'store-total' }) {
  return (
    <div className="order-summary">
      <div className="summary-row">
        <span>Tạm tính</span>
        <span>{formatPrice(quote.subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Phí giao hàng</span>
        <span>{quote.shipping ? formatPrice(quote.shipping) : 'Miễn phí'}</span>
      </div>
      <div className="summary-total">
        <span>Tổng cộng</span>
        <strong data-testid={totalTestId}>{formatPrice(quote.total)}</strong>
      </div>
      {quote.subtotal > 0 && quote.subtotal < FREE_SHIPPING_THRESHOLD && (
        <p className="shipping-hint">
          Thêm {formatPrice(FREE_SHIPPING_THRESHOLD - quote.subtotal)} để được giao hàng miễn phí.
        </p>
      )}
      {children}
    </div>
  );
}
