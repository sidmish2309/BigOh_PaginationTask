let itemsToSkip = 30;
const apiEndpoint = `https://dummyjson.com/products?limit=0&skip=`;
let allProducts = [];
let visibleProducts = [];
let tempProductStorage = [];
let shoppingCart = [];
let currentPageNumber = 1;
let itemsPerPageLimit = 30;
let isLoading = false;
let totalProducts = 0;

class ProductApi {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    
    async fetchProducts(skip = 0) {
        try {
            const response = await fetch(this.apiEndpoint+skip);
            console.log(this.apiEndpoint+skip);

            const data = await response.json();
            // console.log(data);
            totalProducts = data.total;
            allProducts = [...allProducts, ...data.products];
            // console.log(allProducts.length);
            visibleProducts = allProducts;
            tempProductStorage.push(data.products);
            
            setupPagination();
            displayProducts();
            isLoading = false;
        } catch (error) {
            console.log("Error Fetching Products", error);
        }
     
    }
}

// Helper function to check if the product is in local storage
function isProductInLocalStorage(key) {
    return localStorage.getItem(key) != null;
}

// Function to filter products based on the search term
function filterVisibleProducts() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    visibleProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    );
    currentPageNumber = 1;
    displayProducts(true);
    setupPagination();
}

// Function to sort products based on price
function sortVisibleProducts() {
    const sortOrder = document.getElementById('sort').value;
    visibleProducts.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.price - b.price;
        } else {
            return b.price - a.price;
        }
    });
    displayProducts(true);
}

// Function to render products on the page
//productcontainer----> products
function displayProducts(reset = false) {
    const productContainer = document.getElementById('product-list');
    if (reset) {
        productContainer.innerHTML = '';
    }
    const start = (currentPageNumber - 1) * itemsPerPageLimit;
    const end = start + itemsPerPageLimit;
    const currentProducts = visibleProducts.slice(start, end);
    currentProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.id = `${product.id}`;

        productElement.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <p>${product.description}</p>
            <button id="${product.id}" onclick="addProductToCart(${product.id})">Add to Cart</button>
        `;
        productContainer.appendChild(productElement);
    });
}

// Function to render pagination buttons
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const itemsPerPageDropdown = document.createElement('select');
    itemsPerPageDropdown.id = "itemsPerPageDropdown";
    itemsPerPageDropdown.innerHTML = `
        <option value="10" ${itemsPerPageLimit === 10 ? 'selected' : ''}>10</option>
        <option value="20" ${itemsPerPageLimit === 20 ? 'selected' : ''}>20</option>
        <option value="30" ${itemsPerPageLimit === 30 ? 'selected' : ''}>30</option>
    `;
    itemsPerPageDropdown.addEventListener('change', (event) => {
        itemsPerPageLimit = parseInt(event.target.value, 10);

        // console.log("sid",itemsPerPageLimit);

        currentPageNumber = 1; // Reset to the first page when items per page change
        allProducts = []; // Clear all products to refetch based on new limit
        // console.log(allProducts.length)
        // productApi.fetchProducts(0);
        displayProducts(true);
        setupPagination();
    });
    paginationContainer.appendChild(itemsPerPageDropdown);

    const pageCount = Math.ceil(totalProducts / itemsPerPageLimit);

    const prevButton = document.createElement('button');
    prevButton.innerHTML = "Prev";
    prevButton.className = "prev";
    prevButton.disabled = currentPageNumber === 1;
    prevButton.addEventListener('click', () => {
        if (currentPageNumber > 1) {
            currentPageNumber--;
            displayProducts(true);
            setupPagination();
        }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= pageCount; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPageNumber = i;
            displayProducts(true);
            setupPagination();
        });
        if (i === currentPageNumber) {
            pageButton.style.fontWeight = 'bold';
            pageButton.style.backgroundColor = 'grey';
        }
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.className = "next";
    nextButton.innerHTML = "Next";
    nextButton.disabled = currentPageNumber === pageCount;
    nextButton.addEventListener('click', () => {
        if (currentPageNumber < pageCount) {
            currentPageNumber++;
            displayProducts(true);
            setupPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Event listener for infinite scrolling (stack overflow logic)

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight-200 && !isLoading) {
        isLoading = true;
        currentPageNumber++;
        console.log(currentPageNumber);
        productApi.fetchProducts((currentPageNumber - 1) * itemsPerPageLimit);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    productApi.fetchProducts();
    document.getElementById('search').addEventListener('input', filterVisibleProducts);
    document.getElementById('sort').addEventListener('change', sortVisibleProducts);

});


const productApi = new ProductApi(apiEndpoint);

/*
input
change
scroll
click
*/
