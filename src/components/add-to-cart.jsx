import { useEffect, useState } from 'preact/hooks';

export default function AddToCart({ variantId, buttonText, options = false }) {
  const [id, setId] = useState(variantId);

  function handleChange(event) {
    setId(event.target.value);
  }

  async function addToCart() {
    let localCartData = JSON.parse(
      window.localStorage.getItem('jamstackconf:shopify:cart'),
    );

    if (!localCartData.cartId) {
      console.error('There was error loading your cart');
      return;
    }

    const result = await fetch('/api/add-to-cart', {
      method: 'POST',
      body: JSON.stringify({ cartId: localCartData.cartId, variantId: id }),
    });

    if (!result.ok) {
      console.error('There was a problem adding the item to the cart');
      return;
    }

    window.localStorage.setItem('jamstackconf:shopify:status', 'dirty');
  }

  // TODO: check for quantity and set to sold out if 0
  // query variant ID or product available for sale

  return (
    <>
      {options && (
        <select name="variant" class="options" onChange={handleChange}>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <button class="button" onClick={addToCart}>
        {buttonText}
      </button>
    </>
  );
}
