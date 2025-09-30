/**
 * Article Utilities
 * Provides consistent functionality for article cards and read more features
 */

// Initialize article cards with read more functionality
function initArticleCards() {
    // Add read more buttons to truncated content
    document.querySelectorAll('.article-card').forEach(card => {
        const excerpt = card.querySelector('.article-excerpt');
        const fullContent = card.querySelector('.article-full');
        const readMoreBtn = card.querySelector('.read-more');
        
        if (excerpt && fullContent) {
            // Hide full content by default
            fullContent.style.display = 'none';
            
            // Add click handler for read more button
            if (readMoreBtn) {
                readMoreBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const isExpanded = fullContent.style.display === 'block';
                    
                    // Toggle content
                    fullContent.style.display = isExpanded ? 'none' : 'block';
                    excerpt.style.display = isExpanded ? 'block' : 'none';
                    
                    // Update button text and icon
                    if (isExpanded) {
                        this.innerHTML = 'Read More <i class="fas fa-arrow-right"></i>';
                        this.setAttribute('aria-expanded', 'false');
                        // Scroll to top of card
                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    } else {
                        this.innerHTML = 'Show Less <i class="fas fa-arrow-up"></i>';
                        this.setAttribute('aria-expanded', 'true');
                    }
                });
            }
        }
    });
    
    // Handle external article links
    document.querySelectorAll('a.read-more[href^="/article/"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's a read more link inside an article card, handle it with JS
            if (this.closest('.article-card')) {
                e.preventDefault();
                const card = this.closest('.article-card');
                const excerpt = card.querySelector('.article-excerpt');
                const fullContent = card.querySelector('.article-full');
                
                if (fullContent) {
                    const isExpanded = fullContent.style.display === 'block';
                    fullContent.style.display = isExpanded ? 'none' : 'block';
                    excerpt.style.display = isExpanded ? 'block' : 'none';
                    this.innerHTML = isExpanded 
                        ? 'Read More <i class="fas fa-arrow-right"></i>'
                        : 'Show Less <i class="fas fa-arrow-up"></i>';
                    
                    if (!isExpanded) {
                        // Scroll to the top of the card when expanding
                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            }
        });
    });
}

// Format date to a readable format
function formatArticleDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Generate article card HTML
function createArticleCard(article) {
    const date = formatArticleDate(article.publishedAt || article.date || new Date().toISOString());
    const category = article.category || 'Uncategorized';
    
    // Default image if none provided
    const defaultImages = [
        'https://images.unsplash.com/photo-1677442135136-760c813a743f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ];
    
    // Select a default image based on category or random
    const defaultImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    const imageUrl = article.imageUrl || article.urlToImage || defaultImage;
    const articleSlug = article.title ? article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    
    return `
        <article class="article-card" data-category="${category.toLowerCase()}">
            <div class="article-image">
                <img src="${imageUrl}" alt="${article.title || 'Article Image'}" loading="lazy">
                <span class="article-category">${category}</span>
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-date"><i class="far fa-calendar-alt"></i> ${date}</span>
                    ${article.author ? `<span class="article-author"><i class="fas fa-user"></i> ${article.author}</span>` : ''}
                </div>
                <h2 class="article-title">${article.title || 'Untitled Article'}</h2>
                <div class="article-excerpt">
                    <p>${article.excerpt || article.description || 'No excerpt available.'}</p>
                    <a href="#" class="read-more" aria-expanded="false">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="article-full" style="display: none;">
                    <p>${article.content || article.excerpt || article.description || 'No content available.'}</p>
                    <a href="#" class="read-more">Show Less <i class="fas fa-arrow-up"></i></a>
                </div>
            </div>
        </article>`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initArticleCards();
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initArticleCards,
        formatArticleDate,
        createArticleCard
    };
}
