import { useEffect, useState } from 'preact/hooks';

export default function Cart() {
  const [cart, setCart] = useState({ id: null, lines: [] });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function getCart() {
      let localCartData = JSON.parse(
        window.localStorage.getItem('jamstackconf:shopify:cart'),
      );

      if (localCartData) {
        const existingCart = await fetch(
          `/api/load-cart?cartId=${localCartData.cartId}`,
        ).then((res) => res.json());

        setCart({
          id: localCartData.cartId,
          checkoutUrl: localCartData.checkoutUrl,
          estimatedCost: existingCart.cart.estimatedCost,
          lines: existingCart.cart.lines.edges,
        });

        return;
      }

      localCartData = await fetch('/api/create-cart').then((res) => res.json());

      setCart({
        id: localCartData.cartId,
        checkoutUrl: localCartData.checkoutUrl,
        estimatedCost: null,
        lines: [],
      });

      window.localStorage.setItem(
        'jamstackconf:shopify:cart',
        JSON.stringify(localCartData),
      );
    }

    getCart();

    setInterval(() => {
      const state = window.localStorage.getItem('jamstackconf:shopify:state');
      if (state && state === 'dirty') {
        getCart();
        window.localStorage.setItem('jamstackconf:shopify:state', 'clean');
      }
    }, 500);
  }, []);

  function toggleCart() {
    setOpen(!open);
  }

  function emptyCart() {
    window.localStorage.removeItem('jamstackconf:shopify:cart');
    window.localStorage.setItem('jamstackconf:shopify:state', 'dirty');
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
