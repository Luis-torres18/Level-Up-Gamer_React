import Header from "../Components/Header";
import Footer from "../Components/Footer";
import '/src/index.css'

function inicio() {

    return <>

        <Header/>

        <main>
            <section class="hero-section">
            <div class="hero-container">
                <div class="hero-content">
                <h1>ELEVA TU NIVEL <span>GAMER</span> AL MÁXIMO</h1>
                <p>Equipamiento de alto rendimiento, consolas de última generación y juegos de mesa clásicos con envíos rápidos y seguros a todo Chile.</p>
                <a href="#catalogo" class="btn-cta">Ver Productos</a>
                </div>
            </div>
            </section>
        
            <section id="catalogo" class="catalog-section">
            <div class="section-header">
                <h2>CATÁLOGO DESTACADO</h2>
                <p>Equípate con los favoritos de nuestra comunidad</p>
            </div>

            <div class="products-grid">

                <article class="product-card">
                <figure>
                    <img src="https://devirinvestments.s3.eu-west-1.amazonaws.com/img/catalog/product/8436017220100-1200-frontflat.jpg" alt="Juego de Mesa Catan"/>
                </figure>
                <span class="product-tag">Juegos de Mesa</span>
                <h3 class="product-title">Catan</h3>
                <p class="product-desc">Clásico juego de estrategia para colonizar la isla de Catan (3-4 jugadores).</p>
                <div class="product-footer">
                    <span class="product-price">$29.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('JM001')">Añadir</button>
                </div>
                </article>

                <article class="product-card">
                <figure>
                    <img src="https://www.geekz.cl/web/image/product.template/21455/image" alt="Juego de Mesa Carcassonne"/>
                </figure>
                <span class="product-tag">Juegos de Mesa</span>
                <h3 class="product-title">Carcassonne</h3>
                <p class="product-desc">Coloca losetas y domina fortalezas medievales con tu estrategia.</p>
                <div class="product-footer">
                    <span class="product-price">$24.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('JM002')">Añadir</button>
                </div>
                </article>

                <article class="product-card">
                <figure>
                    <img src="https://i5.walmartimages.com/seo/Microsoft-Xbox-One-Bluetooth-Wireless-Controller-Black_b30e1557-556d-4638-a692-7b42cb425b52_1.3d21d0fb85ffc29ebc3435b2d1bd3d75.jpeg" alt="Controlador Inalámbrico Xbox Series X"/>
                </figure>
                <span class="product-tag">Accesorios</span>
                <h3 class="product-title">Control Xbox Series X</h3>
                <p class="product-desc">Agarre texturizado y precisión inalámbrica para Xbox y PC.</p>
                <div class="product-footer">
                    <span class="product-price">$59.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('AC001')">Añadir</button>
                </div>
                </article>

                <article class="product-card">
                <figure>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdO6mRCcRglH7n3EMSCivY3XAlU0QezZArTzefhyhxrnk54EqblxI_yQCN&s=10" alt="Auriculares Gamer HyperX Cloud II"/>
                </figure>
                <span class="product-tag">Accesorios</span>
                <h3 class="product-title">HyperX Cloud II</h3>
                <p class="product-desc">Audio envolvente virtual 7.1 con máxima comodidad de espuma viscoelástica.</p>
                <div class="product-footer">
                    <span class="product-price">$79.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('AC002')">Añadir</button>
                </div>
                </article>

                <article class="product-card">
                <figure>
                    <img src="https://www.weplay.cl/pub/media/wysiwyg/PRODUCTOS/IMAGENES/PLAYSTATION/711719570820_2.jpg" alt="Consola PlayStation 5 de Sony"/>
                </figure>
                <span class="product-tag">Consolas</span>
                <h3 class="product-title">PlayStation 5</h3>
                <p class="product-desc">Gráficos 4K con trazado de rayos y retroalimentación háptica inmersiva.</p>
                <div class="product-footer">
                    <span class="product-price">$549.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('CO001')">Añadir</button>
                </div>
                </article>

                <article class="product-card">
                <figure>
                    <img src="https://rimage.ripley.cl/home.ripley/Attachment/WOP/1/2000408648833/full_image-2000408648833" alt="PC Gamer ASUS ROG Strix"/>
                </figure>
                <span class="product-tag">Computadores</span>
                <h3 class="product-title">PC ASUS ROG Strix</h3>
                <p class="product-desc">Componentes de vanguardia para jugar sin límites competitivos.</p>
                <div class="product-footer">
                    <span class="product-price">$1.299.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('CG001')">Añadir</button>
                </div>
                </article>

                <article class="product-card">
                <figure>
                    <img src="https://m.media-amazon.com/images/I/41wKF+jkOAL._AC_.jpg" alt="Silla Gamer Secretlab Titan"/>
                </figure>
                <span class="product-tag">Sillas Gamers</span>
                <h3 class="product-title">Secretlab Titan</h3>
                <p class="product-desc">Ergonomía superior diseñada para sesiones intensas de juego.</p>
                <div class="product-footer">
                    <span class="product-price">$349.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('SG001')">Añadir</button>
                </div>
                </article>

                <article class="product-card">
                <figure>
                    <img src="https://http2.mlstatic.com/D_NQ_NP_913004-MLA99443804514_112025-O.webp" alt="Mouse Gamer Logitech G502 HERO"/>
                </figure>
                <span class="product-tag">Mouse</span>
                <h3 class="product-title">Logitech G502 HERO</h3>
                <p class="product-desc">Sensor de alta precisión de 25.600 DPI con 11 botones personalizables.</p>
                <div class="product-footer">
                    <span class="product-price">$49.990</span>
                    <button class="btn-add-cart" onclick="agregarProductoAlCarrito('MS001')">Añadir</button>
                </div>
                </article>
            </div>
            </section>
        </main>

        <Footer/>
    </>
}

export default inicio;