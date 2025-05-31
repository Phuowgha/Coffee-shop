document.addEventListener('DOMContentLoaded', () => {
    // Cart functionality
    const cartIcon = document.querySelector('.nav-cart');
    const cartDropdown = document.querySelector('.cart-dropdown');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const viewCartBtn = document.querySelector('.view-cart-btn');
    const cartButtons = document.querySelector('.cart-dropdown .cart-buttons');

    // Hide cart dropdown buttons if we're on the cart page
    if (window.location.pathname.includes('cart.html') && cartButtons) {
        cartButtons.style.display = 'none';
    }

    // Open cart dropdown
    cartIcon.addEventListener('click', (e) => {
        cartDropdown.classList.add('active');
        e.stopPropagation();
    });

    // Close cart with close button only
    cartCloseBtn.addEventListener('click', () => {
        cartDropdown.classList.remove('active');
    });

    // Prevent cart from closing when clicking inside it
    cartDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartDropdown.contains(e.target) && !cartIcon.contains(e.target)) {
            cartDropdown.classList.remove('active');
        }
    });

    // View cart button click handler
    viewCartBtn.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    // Initialize both cart displays
    displayCartItems();
    displayDropdownCart();
    updateCartSummary();
    updateHeaderCartCount();

    // Function to display main cart items
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
                        <p>${item.description || ''}</p>
                    </div>
                </div>
                <div class="quantity">
                    <button class="quantity-btn decrease">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="0">
                    <button class="quantity-btn increase">+</button>
                </div>
                <div class="price">${formatPrice(item.price)}</div>
                <div class="subtotal">${formatPrice(item.price * item.quantity)}</div>
                <button class="remove-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners for quantity controls
        addQuantityControlListeners();
    }

    // Function to display dropdown cart items
    function displayDropdownCart() {
        const dropdownCartItems = document.querySelector('.cart-dropdown .cart-items');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            dropdownCartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Giỏ hàng trống</p>
                </div>
            `;
            return;
        }

        dropdownCartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase">+</button>
                </div>
            </div>
        `).join('');

        // Add event listeners for dropdown quantity controls
        addDropdownQuantityListeners();
    }

    function addQuantityControlListeners() {
        const cartItems = document.querySelectorAll('#cart-items-container .cart-item');
        
        cartItems.forEach(item => {
            const itemId = item.dataset.id;
            const quantityInput = item.querySelector('.quantity-input');
            const decreaseBtn = item.querySelector('.decrease');
            const increaseBtn = item.querySelector('.increase');
            const removeBtn = item.querySelector('.remove-btn');

            // Handle manual input
            quantityInput.addEventListener('change', (e) => {
                let newQuantity = parseInt(e.target.value);
                if (isNaN(newQuantity) || newQuantity < 0) newQuantity = 0;
                updateItemQuantity(itemId, newQuantity);
            });

            // Prevent non-numeric input
            quantityInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });

            // Handle keyboard input
            quantityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    quantityInput.blur(); // Remove focus to trigger change event
                }
            });

            decreaseBtn.addEventListener('click', () => {
                const currentQuantity = parseInt(quantityInput.value);
                const newQuantity = currentQuantity - 1;
                if (newQuantity >= 0) {
                    updateItemQuantity(itemId, newQuantity);
                }
            });

            increaseBtn.addEventListener('click', () => {
                const currentQuantity = parseInt(quantityInput.value);
                updateItemQuantity(itemId, currentQuantity + 1);
            });

            removeBtn.addEventListener('click', () => {
                removeItem(itemId);
            });
        });
    }

    function addDropdownQuantityListeners() {
        const dropdownItems = document.querySelectorAll('.cart-dropdown .cart-item');
        
        dropdownItems.forEach(item => {
            const itemId = item.dataset.id;
            const quantitySpan = item.querySelector('.cart-item-quantity span');
            const decreaseBtn = item.querySelector('.decrease');
            const increaseBtn = item.querySelector('.increase');

            decreaseBtn.addEventListener('click', () => {
                const currentQuantity = parseInt(quantitySpan.textContent);
                const newQuantity = currentQuantity - 1;
                if (newQuantity >= 0) {
                    updateItemQuantity(itemId, newQuantity);
                }
            });

            increaseBtn.addEventListener('click', () => {
                const currentQuantity = parseInt(quantitySpan.textContent);
                updateItemQuantity(itemId, currentQuantity + 1);
            });
        });
    }

    function updateItemQuantity(itemId, newQuantity) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            if (newQuantity <= 0) {
                removeItem(itemId);
                return;
            }
            
            cart[itemIndex].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            
            displayCartItems();
            displayDropdownCart();
            updateCartSummary();
            updateHeaderCartCount();
        }
    }

    function removeItem(itemId) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const updatedCart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        
        displayCartItems();
        displayDropdownCart();
        updateCartSummary();
        updateHeaderCartCount();
    }

    function updateCartSummary() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = cart.length > 0 ? 30000 : 0;
        const total = subtotal + shipping;

        // Update main cart summary
        document.getElementById('subtotal').textContent = formatPrice(subtotal);
        document.getElementById('shipping').textContent = formatPrice(shipping);
        document.getElementById('total').textContent = formatPrice(total);

        // Update dropdown cart total
        const dropdownTotalElement = document.querySelector('.cart-dropdown .cart-total-price');
        if (dropdownTotalElement) {
            dropdownTotalElement.textContent = formatPrice(total);
        }
    }

    function updateHeaderCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all cart count elements
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = cartCount;
        });
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    // Handle checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Chức năng thanh toán đang được phát triển!');
        });
    }

    // Handle continue shopping button
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'menu.html';
        });
    }
}); 