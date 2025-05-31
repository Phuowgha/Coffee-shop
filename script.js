document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Cart functionality
    const cartIcon = document.querySelector('.nav-cart');
    const cartDropdown = document.querySelector('.cart-dropdown');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const viewCartBtn = document.querySelector('.view-cart-btn');
    let cartItems = [];
    let cartCount = 0;

    // View cart button click handler
    viewCartBtn.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

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

    // Function to update cart count
    function updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        cartCountElement.textContent = cartCount;
    }

    // Function to update cart total
    function updateCartTotal() {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalElement = document.querySelector('.cart-total-price');
        cartTotalElement.textContent = `${total.toLocaleString()}₫`;
    }

    // Function to add item to cart
    function addToCart(item) {
        const existingItem = cartItems.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
            // If cart is open, animate the quantity change
            if (cartDropdown.classList.contains('active')) {
                const quantitySpan = document.querySelector(`.cart-item[data-id="${item.id}"] .cart-item-quantity span`);
                if (quantitySpan) {
                    quantitySpan.classList.remove('quantity-changed');
                    // Trigger reflow
                    void quantitySpan.offsetWidth;
                    quantitySpan.classList.add('quantity-changed');
                }
            }
        } else {
            cartItems.push({ ...item, quantity: 1 });
        }
        cartCount += 1;
        updateCartCount();
        updateCartTotal();
        renderCartItems();
        saveCartToLocalStorage();
        
        // Show cart if it's not already visible
        if (!cartDropdown.classList.contains('active')) {
            cartDropdown.classList.add('active');
        }
    }

    // Function to save cart to localStorage
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }

    // Load cart from localStorage on page load
    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            updateCartCount();
            updateCartTotal();
            renderCartItems();
        }
    }

    // Load cart on page load
    loadCartFromLocalStorage();

    // Function to render cart items
    function renderCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Giỏ hàng trống</p>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()}₫</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease">-</button>
                    <input type="number" min="1" value="${item.quantity}" class="quantity-input">
                    <button class="quantity-btn increase">+</button>
                </div>
            </div>
        `).join('');

        // Add event listeners for quantity buttons and inputs
        cartItemsContainer.querySelectorAll('.cart-item').forEach(cartItem => {
            const itemId = cartItem.dataset.id;
            const quantityInput = cartItem.querySelector('.quantity-input');
            const decreaseBtn = cartItem.querySelector('.decrease');
            const increaseBtn = cartItem.querySelector('.increase');

            // Handle manual input
            quantityInput.addEventListener('change', (e) => {
                let newQuantity = parseInt(e.target.value);
                const item = cartItems.find(i => i.id === itemId);
                const oldQuantity = item.quantity;

                if (newQuantity <= 0) {
                    // Remove item from cart
                    cartItems = cartItems.filter(i => i.id !== itemId);
                    cartCount -= oldQuantity;
                    updateCartCount();
                    updateCartTotal();
                    renderCartItems();
                    saveCartToLocalStorage();
                    return;
                }
                
                item.quantity = newQuantity;
                cartCount += (newQuantity - oldQuantity);
                
                updateCartCount();
                updateCartTotal();
                saveCartToLocalStorage();
                
                // Add animation class
                quantityInput.classList.remove('quantity-changed');
                void quantityInput.offsetWidth;
                quantityInput.classList.add('quantity-changed');
            });

            // Handle keyboard input
            quantityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    quantityInput.blur(); // Remove focus to trigger change event
                }
            });

            // Prevent non-numeric input
            quantityInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });

            // Button handlers
            decreaseBtn.addEventListener('click', () => {
                const item = cartItems.find(i => i.id === itemId);
                item.quantity -= 1;
                cartCount -= 1;

                if (item.quantity <= 0) {
                    // Remove item from cart
                    cartItems = cartItems.filter(i => i.id !== itemId);
                    updateCartCount();
                    updateCartTotal();
                    renderCartItems();
                    saveCartToLocalStorage();
                    return;
                }

                quantityInput.value = item.quantity;
                quantityInput.classList.remove('quantity-changed');
                void quantityInput.offsetWidth;
                quantityInput.classList.add('quantity-changed');
                
                updateCartCount();
                updateCartTotal();
                saveCartToLocalStorage();
            });

            increaseBtn.addEventListener('click', () => {
                const item = cartItems.find(i => i.id === itemId);
                item.quantity += 1;
                cartCount += 1;
                quantityInput.value = item.quantity;
                
                quantityInput.classList.remove('quantity-changed');
                void quantityInput.offsetWidth;
                quantityInput.classList.add('quantity-changed');
                
                updateCartCount();
                updateCartTotal();
                saveCartToLocalStorage();
            });
        });
    }

    // Add to cart button click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
        const addButton = document.createElement('button');
        addButton.className = 'cta-button add-to-cart-btn';
        addButton.textContent = 'Thêm vào giỏ';
        
        addButton.addEventListener('click', () => {
            const itemData = {
                id: item.dataset.id || Math.random().toString(36).substr(2, 9),
                name: item.querySelector('h3').textContent,
                price: parseInt(item.querySelector('.menu-item-price').textContent.replace(/[^\d]/g, '')),
                image: item.querySelector('img').src
            };
            addToCart(itemData);
        });

        item.querySelector('.menu-item-info').appendChild(addButton);
    });

    // Existing mobile menu code
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });

    // Smooth scroll for navigation links (except menu link)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip if it's the menu link
        if (anchor.getAttribute('href') === 'menu.html') return;
        
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu after clicking a link
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    });

    // Highlight active section on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active');
            }
        });
    });
});