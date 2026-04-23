// Pizza Delivery Tracker

// Pricing Array
const prices = {
  size: { Small: 8.99, Medium: 11.99, Large: 14.99, "Extra Large": 17.99 },
  crust: { Thin: 0, Regular: 0, Thick: 1.5, Stuffed: 2.5 },
  topping: 1.25,
};

// Steps Array
const steps = [
    //1
  { id: "step1", label: "Order Received", time: 0 },
  //2
  { id: "step2", label: "Preparing", time: 3000 },
  //3
  { id: "step3", label: "In the Oven", time: 6000 },
  //4
  { id: "step4", label: "Quality Check", time: 9000 },
  //5
  { id: "step5", label: "Out for Delivery", time: 12000 },
  //6
  { id: "step6", label: "Delivered", time: 15000 },
];

let countdownInterval = null;
let stepTimeouts = [];

// Update order summary panel
function updateOrderSummary() {
    //size = 12, 10, 14, 16
  const size = document.getElementById("pizzaSize").value;
  //crust = thin, regular, thick, stuffed
  const crust = document.getElementById("crustType").value;
  //toppings = pepperoni, mushrooms, onions, sausage, bacon, extra cheese, black olives, green peppers, pineapple, spinach
  const toppingSelect = document.getElementById("toppings");
  // Get selected toppings as an array of names
  const selectedToppings = Array.from(toppingSelect.selectedOptions).map(
    (o) => o.text
  );

  const basePrice = prices.size[size];
  const crustPrice = prices.crust[crust];
  const toppingPrice = selectedToppings.length * prices.topping;
  const total = basePrice + crustPrice + toppingPrice;

  const toppingText =
    selectedToppings.length > 0 ? selectedToppings.join(", ") : "None";


    //update the order summary content (Shows to user)
  document.getElementById("orderSummary").innerHTML = `
    <div class="summary-title">Order Summary</div>
    <div class="summary-item"><span>${size} Pizza</span><span>$${basePrice.toFixed(2)}</span></div>
    <div class="summary-item"><span>${crust} Crust</span><span>${crustPrice > 0 ? "$" + crustPrice.toFixed(2) : "Included"}</span></div>
    <div class="summary-item"><span>Toppings (${toppingText})</span><span>${toppingPrice > 0 ? "$" + toppingPrice.toFixed(2) : "None"}</span></div>
    <div class="summary-total">Total: $${total.toFixed(2)}</div>
  `;
}

// Start the delivery simulation
function startDeliveryProcess() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  //Making sure info is inserted
  if (!name || !phone || !address) {
    alert("Please fill in your name, phone number, and delivery address.");
    return;
  }

  // Generate random order number 
  const orderNum = "#" + Math.floor(10000 + Math.random() * 90000);
  document.getElementById("orderNumber").textContent = orderNum;

  // Show tracker, hide order section
  document.getElementById("orderSection").style.display = "none";
  document.getElementById("trackerSection").style.display = "block";

  // Show notification (Order process)
  showNotification("Your order has been placed!");

  // Reset progress
  steps.forEach((s) => {
    const el = document.getElementById(s.id);
    el.classList.remove("active", "completed");
  });
  document.getElementById("progressFill").style.width = "0%";
  document.getElementById("updateList").innerHTML = "";
  document.getElementById("currentStatus").textContent = "Order Received";

  // Mark first step active and log update
  document.getElementById("step1").classList.add("active");
  addUpdate("Order Received", `Order ${orderNum} placed for ${name}.`);

  // Start countdown timer (15 minutes = 900 seconds)
  let secondsLeft = 15 * 60;
  document.getElementById("estimatedTime").textContent = formatTime(secondsLeft);
  countdownInterval = setInterval(() => {
    secondsLeft--;
    document.getElementById("estimatedTime").textContent =
      formatTime(secondsLeft);
    if (secondsLeft <= 0) clearInterval(countdownInterval);
  }, 1000);

  // Schedule each step
  steps.forEach((step, index) => {
    if (index === 0) return;
    const timeout = setTimeout(() => {
      advanceToStep(index);
    }, step.time);
    stepTimeouts.push(timeout);
  });
}

// Advance the progress bar to a given step index
function advanceToStep(index) {
  const totalSteps = steps.length;
  const progressPercent = (index / (totalSteps - 1)) * 100;

  document.getElementById("progressFill").style.width = progressPercent + "%";
  document.getElementById("currentStatus").textContent = steps[index].label;

  // Mark previous steps completed, current step active
  for (let i = 0; i < totalSteps; i++) {
    const el = document.getElementById(steps[i].id);
    el.classList.remove("active", "completed");
    if (i < index) el.classList.add("completed");
    else if (i === index) el.classList.add("active");
  }

  addUpdate(steps[index].label, getStatusMessage(steps[index].label));

  if (index === totalSteps - 1) {
    // Order delivered — stop countdown
    clearInterval(countdownInterval);
    document.getElementById("estimatedTime").textContent = "Delivered!";
    showNotification("🍕 Your pizza has been delivered! Enjoy!");
  }
}

// Status update on page (User view)
function getStatusMessage(label) {
  const messages = {
    Preparing: "Our chefs are preparing your pizza with fresh ingredients.",
    "In the Oven": "Your pizza is baking to golden perfection!",
    "Quality Check": "We're making sure your order is perfect.",
    "Out for Delivery": "Your driver is on the way!",
    Delivered: "Your pizza has arrived. Bon appétit!",
  };
  return messages[label] || label;
}

// Add an entry to the update list
function addUpdate(title, message) {
  const list = document.getElementById("updateList");
  const now = new Date();
  const timeStr =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  const item = document.createElement("div");
  item.className = "update-item";
  item.innerHTML = `<span class="update-time">${timeStr}</span><span class="update-text"><strong>${title}</strong> — ${message}</span>`;
  list.prepend(item);
}

// Format seconds (Into propper format)
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Show notification message
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 3500);
}

// Reset back to order form
function resetProcess() {
  // Clear all pending timeouts
  stepTimeouts.forEach(clearTimeout);
  stepTimeouts = [];
  clearInterval(countdownInterval);

  // Reset 
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";

  document.getElementById("trackerSection").style.display = "none";
  document.getElementById("orderSection").style.display = "block";
}

// Loader
updateOrderSummary();
