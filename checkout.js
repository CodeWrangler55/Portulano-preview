(function () {
  const form = document.querySelector("#checkout-form");
  const message = document.querySelector("#checkout-message");

  if (!form || !message) {
    return;
  }

  const products = {
    S: { price: "$75.16" },
    M: { price: "$75.16" },
    L: { price: "$75.16" },
    XL: { price: "$75.16" },
    "2XL": { price: "$77.16" },
    "3XL": { price: "$79.16" }
  };
  const price = form.querySelector("[data-price]");
  const total = form.querySelector("[data-total]");
  const standardShipping = "$4.59";

  const setMessage = (text, isError) => {
    message.textContent = text;
    message.dataset.state = isError ? "error" : "idle";
  };

  const updatePrice = (size) => {
    const product = products[size];

    if (!product || !price || !total) {
      return;
    }

    price.textContent = product.price;
    total.textContent = `${product.price} + ${standardShipping} shipping`;
  };

  form.addEventListener("change", (event) => {
    if (event.target.name === "size") {
      updatePrice(event.target.value);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const size = formData.get("size");
    const submit = form.querySelector("button[type='submit']");
    const endpoint = window.PORTULANO_CHECKOUT_ENDPOINT || "/api/create-checkout-session";

    if (!size) {
      setMessage("Choose a shirt size before checkout.", true);
      return;
    }

    submit.disabled = true;
    setMessage("Opening secure checkout...", false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ size })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Checkout is not available yet.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      setMessage(error.message || "Checkout is not available yet.", true);
      submit.disabled = false;
    }
  });

  updatePrice(form.querySelector("input[name='size']:checked")?.value);
})();
