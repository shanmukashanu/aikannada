/**
 * Blog Listing Utilities
 * Provides common functionality for blog listing pages
 */

// Initialize blog listing page
function initBlogListing(category = null) {
    // Initialize article cards
    initArticleCards();
    
    // Set up filter buttons if they exist
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        setupFilterButtons(filterButtons);
    }
    
    // Load articles for this category
    loadArticles(category);
    
    // Set up newsletter form if it exists
    setupNewsletterForm();
}

// Set up filter buttons
function setupFilterButtons(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            const articles = document.querySelectorAll('.article-card');
            
            // Show/hide articles based on category
            articles.forEach(article => {
                const articleCategory = article.getAttribute('data-category');
                if (category === 'all' || articleCategory === category) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    });
}

// Sample articles for demonstration
const sampleArticles = [
    {
        id: 1,
        title: "Breakthrough in Natural Language Processing",
        excerpt: "Researchers have developed a new AI model that can understand and generate human-like text with unprecedented accuracy.",
        content: "In a significant advancement for artificial intelligence, researchers have unveiled a new language model that demonstrates remarkable capabilities in natural language understanding and generation. The model, trained on vast amounts of text data, shows improved contextual awareness and can generate coherent, relevant responses across a wide range of topics. This breakthrough has potential applications in customer service, content creation, and language translation.",
        category: "AI Research",
        author: "Dr. Sarah Chen",
        date: new Date().toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 2,
        title: "New AI Regulations Take Effect in Europe",
        excerpt: "The European Union has implemented comprehensive AI regulations to ensure ethical development and deployment of artificial intelligence technologies.",
        content: "The European Union's landmark AI Act has officially come into force, establishing the world's first comprehensive regulatory framework for artificial intelligence. The legislation classifies AI systems by risk level and imposes strict requirements on high-risk applications. The move aims to foster innovation while protecting fundamental rights and ensuring public trust in AI technologies.",
        category: "Policy",
        author: "Markus Weber",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 3,
        title: "AI-Powered Diagnostic Tool Detects Diseases Early",
        excerpt: "A new AI system has demonstrated remarkable accuracy in detecting early signs of various diseases from medical imaging.",
        content: "Researchers have developed an AI-powered diagnostic tool that can analyze medical images with accuracy surpassing that of human experts in some cases. The system, trained on millions of anonymized scans, can detect early signs of conditions such as cancer, cardiovascular disease, and neurological disorders. This technology has the potential to revolutionize early diagnosis and improve patient outcomes worldwide.",
        category: "Healthcare",
        author: "Dr. James Wilson",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 4,
        title: "AI Startup Secures $50M in Series B Funding",
        excerpt: "A promising AI startup has raised significant funding to expand its computer vision platform for industrial applications.",
        content: "TechVision AI, a startup specializing in industrial computer vision solutions, has successfully closed a $50 million Series B funding round. The investment will be used to accelerate product development and expand into new markets. The company's AI-powered platform helps manufacturers improve quality control, optimize processes, and reduce waste through advanced visual inspection systems.",
        category: "Startups",
        author: "Lisa Zhang",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
];

// Load articles from API or use sample data
async function loadArticles(category = null) {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = `
        <div class="loading-articles" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary);"></i>
            <p style="font-size: 1.1rem; color: var(--light-text);">Loading articles...</p>
        </div>`;
    
    try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be an API call:
        // const response = await fetch('/api/articles' + (category ? `?category=${encodeURIComponent(category)}` : ''));
        // const articles = await response.json();
        
        // For demo, filter sample articles by category if specified
        const articles = category && category !== 'all' 
            ? sampleArticles.filter(article => article.category === category)
            : sampleArticles;
        
        // Clear loading state
        container.innerHTML = '';
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="no-articles" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                    <i class="far fa-newspaper" style="font-size: 3rem; color: var(--light-text); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text); margin-bottom: 0.5rem;">No articles found</h3>
                    <p style="color: var(--light-text); max-width: 500px; margin: 0 auto;">We couldn't find any articles in this category. Please check back later for updates!</p>
                </div>`;
            return;
        }
        
        // Add articles to the page
        articles.forEach(article => {
            const card = createArticleCard(article);
            if (card) {
                container.innerHTML += card;
            }
        });
        
        // Initialize article cards to set up event listeners
        initArticleCards();
        
    } catch (error) {
        console.error('Error loading articles:', error);
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #e53e3e; margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text); margin-bottom: 0.5rem;">Error Loading Articles</h3>
                <p style="color: var(--light-text);">We're having trouble loading the latest articles. Please try again later.</p>
                <button onclick="window.location.reload()" class="btn btn-outline" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>`;
    }
}

// Show error message
function showErrorMessage(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="window.location.reload()" class="btn btn-outline">
                <i class="fas fa-sync-alt"></i> Try Again
            </button>
        </div>`;
}

// Set up newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            showFormError(this, 'Please enter a valid email address');
            return;
        }
        
        // In a real app, you would send this to your server
        console.log('Subscribing email:', email);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>Thank you for subscribing with ${email}! You'll receive our latest updates.</p>
        `;
        
        // Replace form with success message
        this.parentNode.replaceChild(successMessage, this);
        
        // Clear the input
        emailInput.value = '';
    });
}

// Show form error message
function showFormError(form, message) {
    let errorElement = form.querySelector('.form-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        form.prepend(errorElement);
    }
    
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get category from the page if it exists
    const categoryFilter = document.querySelector('.filter-buttons');
    const activeCategory = categoryFilter 
        ? categoryFilter.querySelector('.filter-btn.active')?.getAttribute('data-category')
        : null;
    
    // Initialize the blog listing
    initBlogListing(activeCategory);
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initBlogListing,
        setupFilterButtons,
        loadArticles,
        showErrorMessage,
        setupNewsletterForm,
        showFormError
    };
}
