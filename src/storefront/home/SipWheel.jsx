import { useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { catalog, formatPrice } from '../data/catalog.js';
import { useStore } from '../StorefrontProviders.jsx';

const SLICE_COLORS = ['#ffdc5e', '#cfe9b8', '#ffd2bf', '#fff1b3', '#b9dca0', '#ffc2a8'];
// In-stock drinks only; the wheel shows at most six so each slice stays readable.
const wheelItems = catalog
  .filter((p) => (p.category === 'drinks' || p.category === 'coffee') && p.stock > 0)
  .slice(0, 6);

export function SipWheel() {
  const { addItem, pending } = useStore();
  const { onItemAdded } = useOutletContext();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const pickRef = useRef(null);
  const count = wheelItems.length;
  const slice = 360 / count;

  function spin() {
    if (spinning || !count) return;
    const index = Math.floor(Math.random() * count);
    pickRef.current = wheelItems[index];
    // Land the chosen slice's centre under the pointer at the top, after 5 full turns.
    const target = 360 - (index * slice + slice / 2);
    const current = rotation % 360;
    setRotation(rotation + 5 * 360 + ((target - current + 360) % 360));
    setResult(null);
    setSpinning(true);
  }

  function handleStop() {
    setSpinning(false);
    setResult(pickRef.current);
  }

  const gradient = wheelItems
    .map((_, i) => `${SLICE_COLORS[i % SLICE_COLORS.length]} ${i * slice}deg ${(i + 1) * slice}deg`)
    .join(', ');

  return (
    <section className="sip-wheel wrap" aria-labelledby="wheel-title">
      <div className="wheel-copy">
        <p className="eyebrow">Phân vân quá?</p>
        <h2 id="wheel-title">
          Để OneSip <em>chọn giúp.</em>
        </h2>
        <p>Quay một vòng, ngụm hôm nay do may mắn quyết định.</p>
        <button className="os-button primary" onClick={spin} disabled={spinning}>
          {spinning ? 'Đang quay…' : result ? 'Quay lại' : 'Quay'}
        </button>
        <div className="wheel-result" role="status">
          {result && (
            <>
              <img src={result.thumbnail} alt="" width="56" height="56" />
              <div>
                <Link to={`/products/${result.slug}`}>{result.name}</Link>
                <span>{formatPrice(result.price)}</span>
              </div>
              <button
                className="os-button secondary"
                disabled={pending}
                onClick={(event) => {
                  addItem(result.id, 1);
                  onItemAdded(result.id, event.detail === 0);
                }}
              >
                Thêm vào giỏ
              </button>
            </>
          )}
        </div>
      </div>
      <div className="wheel-stage">
        <span className="wheel-pointer" aria-hidden="true" />
        <div
          className="wheel-disc"
          style={{ transform: `rotate(${rotation}deg)`, background: `conic-gradient(${gradient})` }}
          onTransitionEnd={handleStop}
          aria-hidden="true"
        >
          {wheelItems.map((p, i) => (
            <span
              key={p.id}
              className="wheel-label"
              style={{ transform: `rotate(${i * slice + slice / 2}deg)` }}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
