// Contentful
var client = contentful.createClient({
    space: 'y82ob3mdone8',
    accessToken: '-Ppo8HB3xuOV5SF5HpvTAeSe2T6pN7JHFdX79jb98kA',
  });

// variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart
let cart = [];
// buttons
let buttonsDOM = [];

// get products
class Products
{


    // method
    async getProducts()
    {
        try 
        {

            // LOCAL DATA
            // let result = await fetch('products.json');
            // let data = await result.json();
            // let products = data.items; // Product holds array

            // Contentful
            let contentful = await client.getEntries({content_type: "botanicBlazeProduct"});
            let products = contentful.items; 
            
            products = products.map(item =>
                {
                    const {title,price} = item.fields;
                    const {id} = item.sys;
                    const image = item.fields.image.fields.file.url; // deconstruct image
                    return {title,price,id,image}
                })
                return products
        }
        
        catch (error)
        
        {
            console.log(error);
        }
        
    }

}

// UI or displaying products
class UI
{
    displayProducts(products)
    {
        // Create instance of result
        let result = '';
        // Iterate through array of products
        products.forEach(product => {
            // String literal to insert into html
            result +=`
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="Product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Add To Cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            `;
        });
        // Insert using innerHTML along with query selector from above
        productsDOM.innerHTML = result;
    }

    getBagButtons()
    {
        const buttons = [...document.querySelectorAll(".bag-btn")]; // Three dots make it an array, spread operator
        buttonsDOM = buttons;
        // Node list might work better for this? idk look into later
        buttons.forEach(button =>
            {
                let id = button.dataset.id;
                let inCart = cart.find(item => item.id == id); // ===
                if(inCart)
                {
                    button.innerText = "In Cart";
                    button.disabled = true;
                }
                    // If not in cart, click will put in cart and disable
                    button.addEventListener('click',(event)=>
                    {
                        event.target.innerText = "In Cart";
                        event.target.disabled = true;

                        // get product from products
                        let cartItem = {...Storage.getProduct(id), amount: 1 }; // spread operator again
                        // add product to the cart
                        cart = [...cart, cartItem];
                        // save cart in local storage
                        Storage.saveCart(cart);
                        // set cart values
                        this.setCartValues(cart);
                        // display cart items
                        this.addCartItem(cartItem);
                        // Show the cart
                        this.showCart();
                    });
                });
    }

    setCartValues(cart)
    {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>
            {
                tempTotal += item.price * item.amount;
                itemsTotal += item.amount;
            });
            cartTotal.innerText = parseFloat(tempTotal.toFixed(2)); // Returns string so use parse float
            cartItems.innerText = itemsTotal;
    }

    addCartItem(item)
    {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src="${item.image}" alt="Product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;

        cartContent.appendChild(div);

    }

    showCart()
    {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupAPP()
    {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart)
    {
        cart.forEach(item =>this.addCartItem(item));
    }

    hideCart()
    {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic()
    {
        // clear cart button
        clearCartBtn.addEventListener('click', () =>
        {
            this.clearCart();
        });
        // cart functionality
        cartContent.addEventListener('click', event=>
        {
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains('fa-chevron-up'))
            {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-chevron-down'))
            {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0)
                {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else
                {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart()
    {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while(cartContent.children.length>0)
        {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id)
    {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id)
    {
        return buttonsDOM.find(button => button.dataset.id == id);
    }

}

// local storage
class Storage
{
    static saveProducts(products)
    {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id)
    {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id == id);
    }
    static saveCart(cart)
    {
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart()
    {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener("DOMContentLoaded",()=>
{
    // Create new instance of UI
    const ui = new UI();

    // Create new instance of Products
    const products = new Products();

    // Setup APP
    ui.setupAPP();

    // Get all products, call on ui instance method after we get products
    products.getProducts().then(products => {ui.displayProducts(products);
        // For thousands of products DO NOT USE THIS, but for the 8 this will do,
        // since going to contentful everytime is probably not smart
        Storage.saveProducts(products);
    }).then(()=> // use only because we load products when we load
    {
        ui.getBagButtons();
        ui.cartLogic();
        // Smooth scroll to the products section when clicking "Shop Now" button
        const shopNowBtn = document.getElementById('shopNowBtn');
        shopNowBtn.addEventListener('click', () => {
            const productsSection = document.getElementById('products');
            productsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }); 
});