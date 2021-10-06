import { useEffect, useState } from 'preact/hooks';

export default function AddToCart({ variantId, buttonText, options = false }) {
  const [id, setId] = useState(variantId);

  function handleChange(event) {
    setId(event.target.value);
  }

  async function addToCart() {
    // TODO
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
