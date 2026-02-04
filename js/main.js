// Main JavaScript - Optimizado y Modularizado
class IAWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupAnimations();
        this.setupInteractions();
        this.setupScrollEffects();
        this.setupSearch();
        this.setupDemo();
        console.log('🚀 IA Website - Inicializado correctamente');
    }

    setupAnimations() {
        // Observer para animaciones de entrada
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar elementos animados
        document.querySelectorAll('.animate-fadeInUp, .animate-scaleIn').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });

        // Contadores animados
        this.setupCounters();
    }

    setupCounters() {
        const counters = document.querySelectorAll('.counter');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    const target = parseInt(entry.target.dataset.target);
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;
                    
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            entry.target.textContent = Math.floor(current).toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            entry.target.textContent = target.toLocaleString();
                            entry.target.classList.add('counted');
                        }
                    };
                    
                    updateCounter();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    setupInteractions() {
        // Efecto magnético en botones
        const magneticButtons = document.querySelectorAll('.magnetic-button');
        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0) scale(1)';
            });
        });

        // Sistema de tabs
        this.setupTabs();
        
        // Efectos ripple
        this.setupRippleEffects();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const productCards = document.querySelectorAll('.product-card');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.tab;
                
                // Actualizar botón activo
                tabButtons.forEach(btn => {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('text-slate-600', 'dark:text-slate-400');
                });
                button.classList.remove('text-slate-600', 'dark:text-slate-400');
                button.classList.add('bg-primary', 'text-white');
                
                // Filtrar productos
                this.filterProducts(category);
            });
        });
    }

    filterProducts(category) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            const cardCategory = card.dataset.category;
            
            if (category === 'all' || cardCategory === category) {
                setTimeout(() => {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 100);
            } else {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }, index * 50);
            }
        });
    }

    setupRippleEffects() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.magnetic-button, .tab-btn, .product-card button')) {
                const button = e.target.closest('button');
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');
                
                ripple.style.position = 'absolute';
                ripple.style.width = '20px';
                ripple.style.height = '20px';
                ripple.style.background = 'rgba(255, 255, 255, 0.5)';
                ripple.style.borderRadius = '50%';
                ripple.style.transform = 'translate(-50%, -50%)';
                ripple.style.pointerEvents = 'none';
                ripple.style.animation = 'ripple 0.6s ease-out';
                
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            }
        });
    }

    setupScrollEffects() {
        // Scroll suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Parallax
        const parallaxElements = document.querySelectorAll('.parallax-slow');
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.2 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });

            // Indicador de progreso
            this.updateProgressBar(scrolled);
        });

        // Partículas
        this.animateParticles();
    }

    updateProgressBar(scrolled) {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / height) * 100;
        
        if (!this.progressBar) {
            this.progressBar = document.createElement('div');
            this.progressBar.className = 'fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-300';
            this.progressBar.style.width = '0%';
            document.body.appendChild(this.progressBar);
        }
        
        this.progressBar.style.width = progress + '%';
    }

    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            particles.forEach((particle, index) => {
                const speed = 0.2 + (index * 0.1);
                particle.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    setupSearch() {
        // Búsqueda global (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.showGlobalSearch();
            }
        });
    }

    showGlobalSearch() {
        const searchModal = document.createElement('div');
        searchModal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn';
        searchModal.innerHTML = `
            <div class="bg-white dark:bg-[#1a2333] rounded-2xl p-6 w-full max-w-2xl mx-4 animate-scaleIn">
                <div class="flex items-center gap-4 mb-4">
                    <span class="material-symbols-outlined text-2xl text-primary">search</span>
                    <input type="text" placeholder="Buscar productos, servicios..." 
                           class="flex-1 text-lg outline-none bg-transparent dark:text-white"
                           id="globalSearchInput">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">Sugerencias:</p>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm cursor-pointer hover:bg-primary hover:text-white transition-all">Bots IA</span>
                        <span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm cursor-pointer hover:bg-primary hover:text-white transition-all">Automatización</span>
                        <span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm cursor-pointer hover:bg-primary hover:text-white transition-all">Análisis Predictivo</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchModal);
        
        // Enfocar input
        setTimeout(() => {
            document.getElementById('globalSearchInput').focus();
        }, 100);
        
        // Cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                searchModal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Cerrar al hacer clic fuera
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        });
    }

    setupDemo() {
        // Funciones globales para demo
        window.clearChat = () => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = `
                    <div class="flex gap-3 animate-fadeInUp">
                        <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-primary text-sm">smart_toy</span>
                        </div>
                        <div class="bg-primary/10 text-primary p-3 rounded-lg max-w-xs">
                            <p class="text-sm">¡Hola! Soy tu asistente IA. Pregúntame anything sobre nuestros servicios.</p>
                        </div>
                    </div>
                `;
            }
        };

        window.sendMessage = () => {
            const input = document.getElementById('chatInput');
            const chatMessages = document.getElementById('chatMessages');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Agregar mensaje del usuario
            const userMessage = document.createElement('div');
            userMessage.className = 'flex gap-3 justify-end animate-fadeInUp';
            userMessage.innerHTML = `
                <div class="bg-slate-800 text-white p-3 rounded-lg max-w-xs">
                    <p class="text-sm">${message}</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-white text-sm">person</span>
                </div>
            `;
            chatMessages.appendChild(userMessage);
            
            // Limpiar input
            input.value = '';
            
            // Simular respuesta
            setTimeout(() => this.simulateAIResponse(chatMessages), 1000);
            
            // Scroll al final
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        window.analyzeSentiment = () => {
            const input = document.getElementById('sentimentInput');
            const result = document.getElementById('sentimentResult');
            const text = input.value.trim();
            
            if (!text) {
                result.classList.add('hidden');
                return;
            }
            
            result.classList.remove('hidden');
            
            // Simular análisis
            const positive = Math.floor(Math.random() * 40) + 30;
            const negative = Math.floor(Math.random() * 20) + 5;
            const neutral = 100 - positive - negative;
            
            // Animar contadores
            this.animateCounter('positiveScore', positive);
            this.animateCounter('negativeScore', negative);
            this.animateCounter('neutralScore', neutral);
            
            // Actualizar texto
            const sentimentText = document.getElementById('sentimentText');
            if (positive > 50) {
                sentimentText.textContent = 'Sentimiento predominantemente positivo 😊';
            } else if (negative > 30) {
                sentimentText.textContent = 'Sentimiento predominantemente negativo 😔';
            } else {
                sentimentText.textContent = 'Sentimiento neutro 😐';
            }
        };
    }

    simulateAIResponse(chatMessages) {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'flex gap-3 animate-fadeInUp';
        
        const responses = [
            "¡Excelente pregunta! Nuestra IA puede ayudarte con eso.",
            "Entiendo perfectamente. Nuestros sistemas están diseñados para maximizar tu eficiencia.",
            "Gracias por tu interés. Te recomiendo explorar nuestros productos destacados.",
            "¡Claro que sí! Puedo mostrarte cómo funciona nuestro análisis de sentimiento.",
            "Nuestra plataforma utiliza los modelos más avanzados para garantizar resultados precisos."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        aiMessage.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-primary text-sm">smart_toy</span>
            </div>
            <div class="bg-primary/10 text-primary p-3 rounded-lg max-w-xs">
                <p class="text-sm">${randomResponse}</p>
            </div>
        `;
        chatMessages.appendChild(aiMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        const duration = 1000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current) + '%';
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '%';
            }
        };
        
        updateCounter();
    }
}

// Estilos CSS dinámicos
const dynamicStyles = `
    @keyframes ripple {
        to {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
    @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
    }
    @keyframes blink {
        0%, 50% { border-color: transparent; }
        51%, 100% { border-color: #256af4; }
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Agregar estilos dinámicos
    const style = document.createElement('style');
    style.textContent = dynamicStyles;
    document.head.appendChild(style);
    
    // Inicializar aplicación
    new IAWebsite();
});
