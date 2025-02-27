document.addEventListener("DOMContentLoaded", function() {
    const productId = localStorage.getItem('selectedProductId');
    const catID = localStorage.getItem('catID'); // Obtener el catID desde el localStorage para formar la URL
    const user = localStorage.getItem('user');
      
        if (productId && catID) {
            const DATA_URL = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;
      
            fetch(DATA_URL)
                .then(response => response.json())
                .then(data => {
                    const product = data.products.find(p => p.id == productId);
                    if (product) {
                        mostrarProducto(product, catID);
                    }
                })
                .catch(error => console.error("Error al obtener el producto:", error));
        } else {
            console.error("No se encontró el ID del producto.");
        }
      
        // Función para mostrar el producto
        function mostrarProducto(product, catID) {
            const productDetailContainer = document.getElementById('product-detail');
      
            productDetailContainer.innerHTML = `
                <div class="container my-5">
                    <div class="row">
                        <div class="col-md-6">
                            <img id= "product-image" src="${product.image}" class="img-fluid rounded" alt="${product.name}">
                        </div>
                        <div class="col-md-6">
                            <p class="text-muted">Categorías / Autos</p>
                            <h2 id= "product-name">${product.name}</h2>
                            <span class="badge bg-success mb-3">Disponible</span>
                            <h3 id= "product-price" class="text-dark">${product.currency} ${product.cost.toLocaleString()}</h3>
                            <p class="text-muted">${product.soldCount} vendidos</p>
                            <button id="buy-button" class="btn btn-warning btn-lg w-100 mb-3">Comprar</button>
                            <div class="accordion" id="productDescription">
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingOne">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                            Descripción
                                        </button>
                                    </h2>
                                    <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#productDescription">
                                        <div class="accordion-body">
                                            ${product.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-4" id="gallery"></div>
                </div>
            `;


           // Guardar la información del producto en localStorage al hacer clic en "Comprar"
           document.getElementById('buy-button').addEventListener('click', function () {
            // Obtener el precio y eliminar todo lo que no sea un número o un punto decimal
            const priceText = document.getElementById('product-price').textContent;
            const price = parseFloat(priceText.replace(/[^0-9]/g, '').replace(',', ''));

            const productComprar = {
                name: document.getElementById('product-name').textContent,
                price: price,
                currency: product.currency,
                quantity: 1, // Por defecto, cantidad 1
                image: document.getElementById('product-image').src
            };


                // Obtener los productos actuales en el carrito
                let cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];

                // Comprobar si el producto ya está en el carrito
                const existingProductIndex = cartProducts.findIndex(item => item.name === productComprar.name);

                if (existingProductIndex !== -1) {
                    // Si el producto ya existe, incrementar la cantidad
                    cartProducts[existingProductIndex].quantity += 1;
                } else {
                    // Si no existe, agregar el nuevo producto al carrito
                    cartProducts.push(productComprar);
                }

                // Guardar el carrito actualizado en localStorage
                localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

                // Navegar al carrito
                window.location.href = 'cart.html';
            });

            generarGaleria(productId);
            cargarProductosRelacionados(productId); // Llamar a la función para cargar productos relacionados
        }
    
        // Función para generar galería
        function generarGaleria(productId) {
            const gallery = document.getElementById('gallery');
            const numImages = 3;
            for (let i = 2; i <= numImages + 1; i++) {
                const img = document.createElement("img");
                img.src = `img/prod${productId}_${i}.jpg`;
                img.classList.add("img-fluid", "rounded");
                const col = document.createElement("div");
                col.classList.add("col-4");
                col.appendChild(img);
                gallery.appendChild(col);
            }
        }

  
    
    // Función para cargar productos relacionados
    function cargarProductosRelacionados(productId) {
        const PRODUCT_URL = `https://japceibal.github.io/emercado-api/products/${productId}.json`;
    
        fetch(PRODUCT_URL)
            .then(response => response.json())
            .then(data => {
                const relatedProductsList = document.getElementById('related-products-list');
                relatedProductsList.innerHTML = ''; // Limpiar lista anterior
    
                if (data.relatedProducts && data.relatedProducts.length) {
                    data.relatedProducts.forEach(relatedProduct => {
                        const productItem = document.createElement('div');
                        productItem.classList.add('col-md-3', 'text-center');
                                console.log('related product', relatedProduct.id);
                                
                        productItem.innerHTML = `
                            <a href="#" data-products-id="${relatedProduct.id}">
                                <img src="${relatedProduct.image}" class="img-fluid" alt="${relatedProduct.name}">
                                <p>${relatedProduct.name}</p>
                            </a>
                        `;
    
                        productItem.querySelector('a').addEventListener('click', function (event) {
                            const productId = this.getAttribute('data-products-id'); // Obtener el ID del producto
                            console.log(productId)
                            localStorage.setItem('selectedProductId', productId); // Guardar en localStorage
                        // window.location.href = 'product-info.html'; // Redirigir a la página de información del producto
                        window.location.reload()
                        })
                        relatedProductsList.appendChild(productItem);
                        
                    });
                } else {
                    relatedProductsList.innerHTML = '<p>No hay productos relacionados disponibles.</p>';
                }
            })
            .catch(error => console.error("Error al cargar productos relacionados:", error));
    }
    
    
    
    
    
      
        //////////////////////////////////////////////////////////////////////////////////////////////////
        // Manejo del formulario de reseñas
        const reviewForm = document.getElementById('review-form');
        const reviewsList = document.getElementById('reviews-list');
      
        // Cargar reseñas desde la URL de JSON
        const COMMENTS_URL = `https://japceibal.github.io/emercado-api/products_comments/${productId}.json`; // Reemplazar con la URL del JSON que contiene los comentarios
      
        function cargarComentariosJSON() {
            fetch(COMMENTS_URL)
                .then(response => response.json())
                .then(data => {
                    const comentarios = data.filter(comentario => comentario.product === parseInt(productId));
                    comentarios.forEach(comentario => {
                        const comentarioHTML = `
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">${comentario.user}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">Puntuación: ${'⭐'.repeat(comentario.score)}</h6>
                                    <p class="card-text">${comentario.description}</p>
                                    <p class="text-muted">Enviado el: ${comentario.dateTime}</p>
                                </div>
                            </div>
                        `;
                        reviewsList.innerHTML += comentarioHTML;
                    });
                })
                .catch(error => console.error("Error al cargar los comentarios:", error));
        }
    
        // Cargar comentarios desde el JSON
        cargarComentariosJSON();
      
        // Cargar reseñas almacenadas del producto actual
        cargarReseñas(productId);
      // Al cargar la página, verificamos si hay un nombre de usuario guardado en localStorage
document.addEventListener('DOMContentLoaded', function() {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
    }
});

// Evento para manejar el envío de la reseña
reviewForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const message = document.getElementById('review-message').value;
    const rating = document.getElementById('review-rating').value;

    // Guardar el nombre de usuario en localStorage para que no se pierda
    localStorage.setItem('username', username);

    const now = new Date();
    // Obtener los componentes de la fecha
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses empiezan en 0
    const day = String(now.getDate()).padStart(2, '0');

    // Formatear la fecha
    const dateTime = `${year}-${month}-${day}`;

    // Configuración para la hora en formato de 24 horas
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Formato 24 horas
    };

    const time = now.toLocaleTimeString('es-ES', options); // Obtener la hora
    const date = `${dateTime} ${time}`; // Combinar fecha y hora

    const reviewHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${username}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Puntuación: ${'⭐'.repeat(rating)}</h6>
                <p class="card-text">${message}</p>
                <p class="text-muted">Enviado el: ${date}</p>
            </div>
        </div>
    `;

    reviewsList.innerHTML += reviewHTML;

    guardarReseña(productId, username, message, rating, date);

    // Solo reseteamos el mensaje y la puntuación, pero no el nombre de usuario
    document.getElementById('review-message').value = '';
    document.getElementById('review-rating').value = '5'; // Valor por defecto para la calificación
});

      
        // Función para cargar reseñas almacenadas
        function cargarReseñas(productId) {
            const reseñas = JSON.parse(localStorage.getItem(`reseñas_${productId}`)) || [];
            reseñas.forEach(res => {
                const reviewHTML = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${res.username}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Puntuación: ${'⭐'.repeat(res.rating)}</h6> <!-- Cambiado aquí para mostrar estrellas -->
                            <p class="card-text">${res.message}</p>
                            <p class="text-muted">Enviado el: ${res.date}</p>
                        </div>
                    </div>
                `;
                reviewsList.innerHTML += reviewHTML;
            });
        }
      
        // Función para guardar reseña en localStorage
        function guardarReseña(productId, username, message, rating, date) {
            const reseñas = JSON.parse(localStorage.getItem(`reseñas_${productId}`)) || [];
            reseñas.push({ username, message, rating, date });
            localStorage.setItem(`reseñas_${productId}`, JSON.stringify(reseñas));
        }
    
      
        if (!user && !confirmShown) {
            // Muestra la alerta
            const userConfirmed = confirm('No has iniciado sesión. ¿Deseas iniciar sesión ahora?');
    
            if (userConfirmed) {
                // Redirigir al login si el usuario desea iniciar sesión
                window.location.href = 'login.html';
            }else{
                window.location.href = 'redireccion_login.html';
            }
    
            // Marca que la alerta ya se ha mostrado en la sesión actual
            sessionStorage.setItem('confirmShown', 'true');
        }
    
        if (user) {
            
            const usernameInput = document.getElementById('username');
       

            // Cargar datos de perfil si ya existen en localStorage
            const profileData = JSON.parse(localStorage.getItem('profileData'));
            
            if (profileData) {
                // Mostrar el nombre guardado en la bienvenida
                document.getElementById('user-name').textContent = `Bienvenid@, ${profileData.nombre}`;
                usernameInput.value = ` ${profileData.nombre} ${profileData.apellido}`; // Colocar el nombre del usuario en el campo de nombre
                usernameInput.disabled = true; // Deshabilitar el campo para que no sea editable
            } else {
                // Si no hay perfil guardado, mostrar el email como nombre
                document.getElementById('user-name').textContent = `Bienvenid@, ${user}`;
                usernameInput.value = ` ${user}`; // Colocar el nombre del usuario en el campo de nombre
                usernameInput.disabled = true; // Deshabilitar el campo para que no sea editable
                }
        }


          // Verificar si el usuario está logueado y actualizar el campo de nombre
     if (nombreUsuario) {
        const usernameInput = document.getElementById('username');
        usernameInput.value = ` ${nombreUsuario}`; // Colocar el nombre del usuario en el campo de nombre
        usernameInput.disabled = true; // Deshabilitar el campo para que no sea editable
        document.getElementById('user-name').textContent = `Bienvenid@, ${user}`;
    } else {
        alert('Debes iniciar sesión para dejar una reseña');
        window.location.href = 'login.html'; // Redirigir al usuario a la página de login si no está autenticado
    }
    });