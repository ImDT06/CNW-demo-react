import { formatPrice } from '../data/catalog.js';
export function OrderSummary({ quote, children }) {
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
        <strong data-testid="store-total">{formatPrice(quote.total)}</strong>
      </div>
      {quote.subtotal > 0 && quote.subtotal < 150000 && (
        <p className="shipping-hint">
          Thêm {formatPrice(150000 - quote.subtotal)} để được giao hàng miễn phí.
        </p>
      )}
      {children}
    </div>
  );
}
