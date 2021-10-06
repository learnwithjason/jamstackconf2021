import { useEffect, useState } from 'preact/hooks';

export default function Cart() {
  const [cart, setCart] = useState({ id: null, lines: [] });
  const [open, setOpen] = useState(false);

  function toggleCart() {
    setOpen(!open);
  }

  function emptyCart() {
    // TODO
  }

  let cost = Number(cart?.estimatedCost?.totalAmount?.amount || 0);

  if (
    cart.lines.some(
      (e) =>
        e.node.merchandise?.product?.title ===
        'Jamstack Conf 2021 Slap Bracelet',
    )
  ) {
    cost = cost - 10;
  }

  return (
    <div class="cart">
      <button class="icon" onClick={toggleCart}>
        <img src="/images/cart.svg" alt="cart" />
        <div class="count">{cart.lines.length}</div>
      </button>
      <div class={`drawer ${open ? 'open' : ''}`}>
        <button class="close" onClick={toggleCart}>
          &times; close
        </button>

        <h3>Your Cart</h3>
        {cart.lines.length > 0 ? (
          <>
            <ul>
              {cart.lines.map(({ node: item }) => (
                <li>
                  <p>
                    {item.quantity} &times; {item.merchandise?.product?.title}
                  </p>
                </li>
              ))}
              <li class="total">
                <p>Total: {cost === 0 ? 'FREE' : `$${cost}`}</p>
              </li>
            </ul>
            <a class="button" href={`${cart.checkoutUrl}?discount=JAMSLAP`}>
              Check Out
            </a>
            <button class="empty-cart" onClick={emptyCart}>
              empty cart
            </button>
          </>
        ) : (
          <p class="no-items">your cart is empty</p>
        )}
      </div>
    </div>
  );
}
