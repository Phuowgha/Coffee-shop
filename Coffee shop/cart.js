document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    updateCartSummary();
});

function displayCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>Giỏ hàng của bạn đang trống</p>
            </div>
        `;
        return;
    }

    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="product-info">
                <div class="product-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="product-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
            <div class="quantity">
                <input type="number" 
                       class="quantity-input" 
                       value="${item.quantity}" 
                       min="0" 
                       onchange="updateQuantity(${item.id}, this.value)">
            </div>
            <div class="price">${formatPrice(item.price)}</div>
            <div class="subtotal">${formatPrice(item.price * item.quantity)}</div>
            <button class="remove-btn" onclick="removeItem(${item.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function updateQuantity(itemId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 0) newQuantity = 0;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        if (newQuantity === 0) {
            removeItem(itemId);
            return;
        }
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
    }
}

function removeItem(itemId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    displayCartItems();
    updateCartSummary();
}

function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 30000 : 0; // 30,000₫ shipping fee if cart is not empty
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = formatPrice(shipping);
    document.getElementById('total').textContent = formatPrice(total);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Handle checkout button
document.querySelector('.checkout-btn').addEventListener('click', () => {
    alert('Chức năng thanh toán đang được phát triển!');
}); 