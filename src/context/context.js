import React, {Component} from 'react';
import {linkData} from "./linkData";
import {socialData} from './socialData'
import {items} from "./productData";
// 1. create context
const ProductContext = React.createContext();

// 2. provider, create a class, put the value and method
class ProductProvider extends Component{

    state = {
        sidebarOpen: false,
        cartOpen: false,
        links: linkData,
        socialIcons: socialData,
        cart: [],
        cartItems: 0,
        cartSubTotal: 0,
        cartTax: 0,
        cartTotal: 0,
        storeProducts: [],
        filteredProducts: [],
        featuredProducts: [],
        singleProduct: {},
        loading: true,
        search: "",
        price: 0,
        min: 0,
        max: 0,
        company: "all",
        shipping: false
    }

    // request data and handle data
    componentDidMount() {
        this.setProducts(items)
    }

    //set products
    setProducts = products => {
        let storeProducts = products.map(item => {
            const { id } = item.sys;
            const image = item.fields.image.fields.file.url;
            const product = { id, ...item.fields, image };
            return product;
        });
        //  featured products 用来展示作用
        let featuredProducts = storeProducts.filter(item => item.featured === true);

        // get max price 用来筛选
        let maxPrice = Math.max(...storeProducts.map(item => item.price));

        this.setState(
            {
                storeProducts,
                filteredProducts: storeProducts, // 页面第一次render后，筛选的产品就是所有产品
                featuredProducts,
                cart: this.getStorageCart(),
                singleProduct: this.getStorageProduct(),
                loading: false,
                price: maxPrice,
                max: maxPrice
            },
            () => {
                this.addTotals();
            }
        );
    };

    // get cart from local storage 从浏览器内存中获取到 已经添加到购物车中的东西
    getStorageCart = () => {
        let cart;
        if (localStorage.getItem("cart")) {
            cart = JSON.parse(localStorage.getItem("cart"));
        } else {
            cart = [];
        }
        return cart;
        /*
        cart [{
            company: 'google',
            count:14,
            description,
            featured:true,
            id:0,
            image,
            price:10,
            title,
            total: 14 * 10
        }]
         */
    };
    // get product from local storage
    getStorageProduct = () => {
        return localStorage.getItem("singleProduct")
            ? JSON.parse(localStorage.getItem("singleProduct"))
            : {};
    };

    // get totals 用于计算 state 中 的总价格
    getTotals = () => {
        let subTotal = 0;
        let cartItems = 0;
        this.state.cart.forEach(item => {
            subTotal += item.total; // 该类商品总价格（不包税
            cartItems += item.count; // 该类商品数量
        });

        subTotal = parseFloat(subTotal.toFixed(2));
        let tax = subTotal * 0.2;
        tax = parseFloat(tax.toFixed(2));
        let total = subTotal + tax;
        total = parseFloat(total.toFixed(2));
        return {
            cartItems,
            subTotal,
            tax,
            total
        };
    };

    //add totals， 更新状态
    addTotals = () => {
        const totals = this.getTotals();
        this.setState(() => {
            return {
                cartItems: totals.cartItems,
                cartSubTotal: totals.subTotal,
                cartTax: totals.tax,
                cartTotal: totals.total
            };
        });
    };

    // sync storage， 每次添加新产品后，调用
    syncStorage = () => {
        localStorage.setItem("cart", JSON.stringify(this.state.cart));
    };

    //add to cart
    addToCart = id => {
        let tempCart = [...this.state.cart];
        let tempProducts = [...this.state.storeProducts];

        // 现在目前购物车中找是否有同类的产品
        let tempItem = tempCart.find(item => item.id === id);
        if (!tempItem) {
            // 如果该类产品没有在购物车中存在，那么去总体产品中去找
            tempItem = tempProducts.find(item => item.id === id);
            let total = tempItem.price;
            let cartItem = { ...tempItem, count: 1, total }; // 创建一个新的 cart item，需要复合规则
            tempCart = [...tempCart, cartItem]; // 再将这个cart item 添加到已经有的cart中
        } else {
            // 如果该类产品已经在购物车中存在
            tempItem.count++;
            tempItem.total = tempItem.price * tempItem.count;
            tempItem.total = parseFloat(tempItem.total.toFixed(2));
        }
        this.setState(
            () => {
                return { cart: tempCart };
            },
            () => {
                this.addTotals();
                this.syncStorage();
                this.openCart();
            }
        );
    };

    // set single product 用于被点击后，跳转页面，然后展示被选中商品的具体信息
    setSingleProduct = id => {
        let product = this.state.storeProducts.find(item => item.id === id);
        localStorage.setItem("singleProduct", JSON.stringify(product));

        // 这个 product 也是一个 对象
        this.setState({
            singleProduct: { ...product },
            loading: false
        });
    };

    // handle sidebar
    handleSidebar = () => {
        this.setState({ sidebarOpen: !this.state.sidebarOpen });
    };
    // hanldle sart
    handleCart = () => {
        this.setState({ cartOpen: !this.state.cartOpen });
    };
    //close cart
    closeCart = () => {
        this.setState({ cartOpen: false });
    };
    // open
    openCart = () => {
        this.setState({ cartOpen: true });
    };
    //  cart functionality



    // increment
    increment = id => {
        let tempCart = [...this.state.cart];
        const cartItem = tempCart.find(item => item.id === id);
        cartItem.count++;
        cartItem.total = cartItem.count * cartItem.price;
        cartItem.total = parseFloat(cartItem.total.toFixed(2));
        this.setState(
            () => {
                return {
                    cart: [...tempCart]
                };
            },
            () => {
                this.addTotals();
                this.syncStorage();
            }
        );
    };
    // decrement
    decrement = id => {
        let tempCart = [...this.state.cart];
        const cartItem = tempCart.find(item => item.id === id);

        cartItem.count = cartItem.count - 1;
        if (cartItem.count === 0) {
            this.removeItem(id);
        } else {
            cartItem.total = cartItem.count * cartItem.price;
            cartItem.total = parseFloat(cartItem.total.toFixed(2));
            this.setState(
                () => {
                    return {
                        cart: [...tempCart]
                    };
                },
                () => {
                    this.addTotals();
                    this.syncStorage();
                }
            );
        }
    };
    // removeItem
    removeItem = id => {
        let tempCart = [...this.state.cart];
        tempCart = tempCart.filter(item => item.id !== id);
        this.setState(
            {
                cart: [...tempCart]
            },
            () => {
                this.addTotals();
                this.syncStorage();
            }
        );
    };
    clearCart = () => {
        this.setState(
            {
                cart: []
            },
            () => {
                this.addTotals();
                this.syncStorage();
            }
        );
    };

    //handle filtering
    handleChange = event => {
        const name = event.target.name;
        const value =
            event.target.type === "checkbox"
                ? event.target.checked
                : event.target.value;
        this.setState(
            {
                [name]: value
            },
            this.sortData
        );
    };

    sortData = () => {
        const { storeProducts, price, company, shipping, search } = this.state;

        let tempPrice = parseInt(price);

        let tempProducts = [...storeProducts];
        // filtering based on price
        tempProducts = tempProducts.filter(item => item.price <= tempPrice);
        // filtering based on company
        if (company !== "all") {
            tempProducts = tempProducts.filter(item => item.company === company);
        }
        if (shipping) {
            tempProducts = tempProducts.filter(item => item.freeShipping === true);
        }
        if (search.length > 0) {
            tempProducts = tempProducts.filter(item => {
                let tempSearch = search.toLowerCase();
                let tempTitle = item.title.toLowerCase().slice(0, search.length);
                if (tempSearch === tempTitle) {
                    return item;
                }
            });
        }
        this.setState({
            filteredProducts: tempProducts
        });
    };


    render(){
        return(
            <ProductContext.Provider
                value={{
                    ...this.state,
                    handleSidebar : this.handleSidebar,
                    handleCart : this.handleCart,
                    closeCart : this.closeCart,
                    openCart : this.openCart,

                    addToCart: this.addToCart,
                    setSingleProduct: this.setSingleProduct,
                    increment: this.increment,
                    decrement: this.decrement,
                    removeItem: this.removeItem,
                    clearCart: this.clearCart,
                    handleChange: this.handleChange

                }}
            >
                {this.props.children}
            </ProductContext.Provider>
        )
    }
}
// 3. consumer
const ProductConsumer = ProductContext.Consumer;

// 4. exposure product provider and consumer
export {ProductProvider, ProductConsumer}

// 5. in the index.js, import product provider

// 6. when need to use data, just import consumer