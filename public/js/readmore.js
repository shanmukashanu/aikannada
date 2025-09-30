// Initialize Read More functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add Read More buttons to all truncated content
    const truncateElements = document.querySelectorAll('.truncate-text');
    
    truncateElements.forEach(element => {
        // Check if content is truncated
        if (element.scrollHeight > element.clientHeight) {
            const parent = element.parentElement;
            const readMoreBtn = document.createElement('button');
            readMoreBtn.className = 'show-more-btn';
            readMoreBtn.setAttribute('aria-expanded', 'false');
            readMoreBtn.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
            
            readMoreBtn.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                element.classList.toggle('expanded', !isExpanded);
                this.innerHTML = isExpanded 
                    ? 'Read More <i class="fas fa-chevron-down"></i>' 
                    : 'Show Less <i class="fas fa-chevron-up"></i>';
            });
            
            parent.appendChild(readMoreBtn);
        }
    });

    // Handle external links (for articles)
    const readMoreLinks = document.querySelectorAll('a.read-more[href^="/article/"]');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's a read more link that should expand content instead of navigating
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
                }
            }
        });
    });
});

// Function to truncate text with a read more link
function truncateText(selector, maxLength) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        const text = element.textContent;
        if (text.length > maxLength) {
            const truncated = text.substring(0, maxLength) + '...';
            const fullText = text;
            
            element.textContent = truncated;
            
            const readMoreLink = document.createElement('a');
            readMoreLink.href = '#';
            readMoreLink.className = 'read-more';
            readMoreLink.innerHTML = 'Read More <i class="fas fa-arrow-right"></i>';
            readMoreLink.addEventListener('click', function(e) {
                e.preventDefault();
                element.textContent = fullText;
                this.remove();
            });
            
            element.parentNode.insertBefore(readMoreLink, element.nextSibling);
        }
    });
}
