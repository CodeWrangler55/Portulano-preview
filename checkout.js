(function () {
  const form = document.querySelector("#checkout-form");
  const message = document.querySelector("#checkout-message");

  if (!form || !message) {
    return;
  }

  const setMessage = (text, isError) => {
    message.textContent = text;
    message.dataset.state = isError ? "error" : "idle";
  };

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
})();
