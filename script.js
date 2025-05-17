// Nuoc Mong - script.js
console.log("Nuoc Mong JS Loaded!");

document.addEventListener('DOMContentLoaded', () => {
    /**
     * ------------------------------------------------------------------------
     * GALLERY SCROLLING AND LOOPING LOGIC
     * ------------------------------------------------------------------------
     */
    const galleryTrack = document.querySelector('.fluid-gallery-track');
    const galleryItems = galleryTrack ? Array.from(galleryTrack.querySelectorAll('.gallery-item')) : [];
    const galleryLeftButton = document.querySelector('.gallery-nav-button.left');
    const galleryRightButton = document.querySelector('.gallery-nav-button.right');

    function setupGallery() {
        if (!galleryTrack || galleryItems.length === 0 || !galleryLeftButton || !galleryRightButton) {
            console.warn("Gallery elements not fully found. Skipping gallery JS.");
            if (galleryLeftButton) galleryLeftButton.style.display = 'none';
            if (galleryRightButton) galleryRightButton.style.display = 'none';
            return;
        }

        const numDuplicatesStart = 2;
        const numDuplicatesEnd = 2;
        const minRequiredItems = 1 + numDuplicatesStart + numDuplicatesEnd; // Minimum 1 real item + duplicates

        // If there are not enough items to create a meaningful loop (e.g., only 1 real item), hide buttons.
        // The number of "real" items is galleryItems.length - numDuplicatesStart - numDuplicatesEnd.
        // If this is less than, say, 3, then looping might not feel very effective.
        const realItemCount = galleryItems.length - numDuplicatesStart - numDuplicatesEnd;
        if (realItemCount < 1 ) { // Or a higher threshold like 3 if you want more items before enabling loop/buttons
            console.warn(`Not enough real gallery items (${realItemCount}) to enable full gallery functionality. Hiding nav buttons.`);
            if (galleryLeftButton) galleryLeftButton.style.display = 'none';
            if (galleryRightButton) galleryRightButton.style.display = 'none';
            galleryTrack.style.overflowX = 'auto'; // Allow natural scroll if not enough for JS enhancements
            galleryTrack.style.scrollSnapType = 'none'; // Disable snap if not enough items
            return;
        }


        function getScrollLeftToCenterItem(index) {
            if (index < 0 || index >= galleryItems.length) {
                console.warn(`Gallery: Invalid index ${index} for getScrollLeftToCenterItem.`);
                return galleryTrack.scrollLeft; // Return current scroll position as a fallback
            }
            const item = galleryItems[index];
            const itemLeft = item.offsetLeft;
            const itemWidth = item.offsetWidth;
            const trackWidth = galleryTrack.offsetWidth;
            return itemLeft - (trackWidth / 2) + (itemWidth / 2);
        }

        // Defer initial scroll slightly to ensure all styles and dimensions are applied
        // Using requestAnimationFrame for smoother initial rendering and to wait for layout
        requestAnimationFrame(() => {
            const initialScrollLeft = getScrollLeftToCenterItem(numDuplicatesStart);
            galleryTrack.scrollTo({ left: initialScrollLeft, behavior: 'instant' });
        });


        function scrollGallery(direction) {
            const firstItem = galleryItems[0];
            if (!firstItem) return;

            const itemWidth = firstItem.offsetWidth;
            const gapStyle = getComputedStyle(galleryTrack).gap;
            const gap = (gapStyle && gapStyle !== 'normal') ? parseFloat(gapStyle) : 15;
            const scrollStep = itemWidth + gap;

            galleryTrack.scrollBy({ left: direction * scrollStep, behavior: 'smooth' });
        }

        galleryLeftButton.addEventListener('click', () => scrollGallery(-1));
        galleryRightButton.addEventListener('click', () => scrollGallery(1));

        let isHandlingLoop = false;
        const loopTolerance = 20; // Pixels tolerance for boundary checks

        galleryTrack.addEventListener('scroll', () => {
            if (isHandlingLoop || galleryItems.length < minRequiredItems) return;

            const scrollLeft = galleryTrack.scrollLeft;
            // const trackWidth = galleryTrack.offsetWidth; // Not directly used in boundary calc here
            const firstRealItemIndex = numDuplicatesStart;
            const lastRealItemIndex = galleryItems.length - 1 - numDuplicatesEnd;
            
            // Make sure items exist before trying to get their properties
            if (!galleryItems[firstRealItemIndex] || !galleryItems[lastRealItemIndex]) return;


            // Boundaries for "real" content based on centering the first/last real item
            const startBoundary = getScrollLeftToCenterItem(firstRealItemIndex) - loopTolerance;
            const endBoundary = getScrollLeftToCenterItem(lastRealItemIndex) + loopTolerance;


            if (scrollLeft < startBoundary) {
                isHandlingLoop = true;
                const jumpTargetScrollLeft = getScrollLeftToCenterItem(lastRealItemIndex);
                galleryTrack.scrollTo({ left: jumpTargetScrollLeft, behavior: 'instant' });
                requestAnimationFrame(() => { isHandlingLoop = false; });
            } else if (scrollLeft > endBoundary) {
                isHandlingLoop = true;
                const jumpTargetScrollLeft = getScrollLeftToCenterItem(firstRealItemIndex);
                galleryTrack.scrollTo({ left: jumpTargetScrollLeft, behavior: 'instant' });
                requestAnimationFrame(() => { isHandlingLoop = false; });
            }
        });

        document.addEventListener('keydown', (event) => {
            const gallerySection = document.getElementById('gallery');
            const isInputFocused = ['input', 'textarea', 'select'].includes(event.target.tagName.toLowerCase());

            if (!isInputFocused && gallerySection && gallerySection.getBoundingClientRect().top < window.innerHeight && gallerySection.getBoundingClientRect().bottom > 0) {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault(); galleryLeftButton.click();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault(); galleryRightButton.click();
                }
            }
        });
    }
    setupGallery();


    /**
     * ------------------------------------------------------------------------
     * YOUTUBE FACADE LOGIC
     * ------------------------------------------------------------------------
     */
    function setupYouTubeFacades() {
        const facades = document.querySelectorAll('.youtube-facade');
        facades.forEach(facade => {
            facade.addEventListener('click', () => {
                const videoId = facade.dataset.youtubeId;
                if (videoId) {
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('width', facade.offsetWidth); // Use facade's current width
                    iframe.setAttribute('height', facade.offsetHeight); // Use facade's current height
                    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
                    iframe.setAttribute('title', 'YouTube video player'); // Accessible title
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                    iframe.setAttribute('allowfullscreen', '');

                    facade.parentNode.replaceChild(iframe, facade);
                }
            });
        });
    }
    setupYouTubeFacades();


    const IS_ANIME_LOADED = typeof anime !== 'undefined';

    if (!IS_ANIME_LOADED) {
        console.warn("Anime.js not found. Animations will be skipped.");
    }

    /**
     * ------------------------------------------------------------------------
     * HERO SECTION ANIMATIONS
     * ------------------------------------------------------------------------
     */
    function setupHeroAnimations() {
        if (!IS_ANIME_LOADED) return;

        const heroLogo = document.querySelector('.hero-content img.logo');
        // Price letters are now created dynamically if not present, no need to queryAll here initially
        const heroPriceContainer = document.querySelector('.hero-price');
        const heroH1 = document.querySelector('.hero-content h1');
        const heroH2 = document.querySelector('.hero-content h2');
        const heroParagraph = document.querySelector('.hero-content > p');
        const heroCtaButton = document.querySelector('.hero .hero-cta');
        const characterLeft = document.querySelector('.hero-character-left');
        const characterRight = document.querySelector('.hero-character-right');

        const priceTextWrapper = document.querySelector('.hero-price span');
        if (priceTextWrapper && priceTextWrapper.textContent && !priceTextWrapper.querySelector('.letter')) { // Check if letters are not already spans
            const originalText = priceTextWrapper.textContent.trim();
            priceTextWrapper.innerHTML = originalText.replace(/\S/g, "<span class='letter'>$&</span>");
        }
        // Query for letters *after* potentially creating them
        const heroPriceLetters = document.querySelectorAll('.hero-price .letter');


        const elementsToFadeInSlideUp = [heroLogo, heroPriceContainer, heroH1, heroH2, heroParagraph, heroCtaButton].filter(el => el);
        if (elementsToFadeInSlideUp.length > 0) {
            anime.set(elementsToFadeInSlideUp, { opacity: 0, translateY: 25 });
        }
        if (heroPriceLetters.length > 0) {
            anime.set(heroPriceLetters, { opacity: 0, translateY: "1.1em" });
        }

        if (characterLeft) {
            anime.set(characterLeft, { opacity: 0, translateX: '-100%', translateY: '-50%' });
        }
        if (characterRight) {
            anime.set(characterRight, { opacity: 0, translateX: '100%', translateY: '-50%' });
        }

        const tl = anime.timeline({
            easing: 'easeOutExpo',
            duration: 850,
            complete: () => animateCtaPulse(heroCtaButton)
        });

        if (heroLogo) {
            tl.add({
                targets: heroLogo,
                opacity: 1,
                translateY: 0,
                scale: [0.7, 1],
                duration: 900
            }, 0);
        }

        if (heroPriceLetters.length > 0) {
            tl.add({
                targets: heroPriceLetters,
                opacity: 1,
                translateY: 0,
                delay: anime.stagger(35)
            }, (heroLogo ? 100 : 50));
        }

        if (heroPriceContainer) {
            tl.add({
                targets: heroPriceContainer,
                opacity: 1,
                translateY: 0,
                duration: 700
            }, (heroLogo ? 100 : 50));
        }

        const textElements = [heroH1, heroH2, heroParagraph].filter(el => el);
        if (textElements.length > 0) {
            tl.add({
                targets: textElements,
                opacity: 1,
                translateY: 0,
                delay: anime.stagger(100, {start: (heroLogo ? 300 : 150)})
            }, 0);
        }

        if (heroCtaButton) {
            tl.add({
                targets: heroCtaButton,
                opacity: 1,
                translateY: 0,
                duration: 800,
            }, 500 );
        }

        const characterAnimationDelay = heroLogo ? 400 : 200;
        const characterDuration = 1500;
        const characterEasing = 'easeOutQuint';

        if (characterLeft) {
            tl.add({
                targets: characterLeft,
                opacity: [0, 1],
                translateX: ['-100%', '0%'], // Adjusted to '0%' to fully enter
                translateY: '-50%',
                duration: characterDuration,
                easing: characterEasing
            }, characterAnimationDelay);
        }

        if (characterRight) {
            tl.add({
                targets: characterRight,
                opacity: [0, 1],
                translateX: ['100%', '0%'], // Adjusted to '0%' to fully enter
                translateY: '-50%',
                duration: characterDuration,
                easing: characterEasing
            }, characterAnimationDelay);
        }
    }

    function animateCtaPulse(target) {
        if (IS_ANIME_LOADED && target) {
            anime({
                targets: target,
                scale: [{ value: 1, duration: 500 }, { value: 1.05, duration: 600 }, { value: 1, duration: 500 }],
                easing: 'easeInOutSine',
                loop: true
            });
        }
    }
    setupHeroAnimations();


    /**
     * ------------------------------------------------------------------------
     * SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
     * ------------------------------------------------------------------------
     */
    if (IS_ANIME_LOADED) { // Only run if Anime.js is loaded
        const defaultObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const animateOnScrollCallback = (entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    let animationParams = {
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 700,
                        easing: 'easeOutCubic',
                        delay: 0
                    };

                    if (element.matches('.content-section h2, #trailer .video-container')) { // Updated selector for trailer
                        animationParams.translateY = [30, 0];
                        animationParams.duration = 800;
                        animationParams.delay = parseInt(element.dataset.scrollDelay) || 50;
                    } else if (element.matches('#intro p')) {
                        animationParams.delay = (element.id === 'still' ? 150 : 300);
                    } else if (element.matches('.feature-item')) {
                        animationParams.translateY = [40, 0];
                        animationParams.duration = 600;
                        animationParams.easing = 'easeOutExpo';
                        animationParams.delay = Array.from(element.parentNode.children)
                                                .filter(child => child.matches('.feature-item'))
                                                .indexOf(element) * 100;
                    } else if (element.matches('.pricing-card')) {
                        animationParams.translateY = [40, 0];
                        animationParams.duration = 600;
                        animationParams.easing = 'easeOutCubic';
                        animationParams.delay = Array.from(element.parentNode.children)
                                                .filter(child => child.matches('.pricing-card'))
                                                .indexOf(element) * 120;
                        if (element.classList.contains('featured')) {
                            animationParams.scale = [0.95, 1];
                            animationParams.duration = 700;
                            animationParams.easing = 'easeOutElastic(1, .8)';
                        }
                    } else if (element.matches('.about-item')) {
                        const isOddItem = Array.from(element.parentNode.children)
                                            .filter(child => child.matches('.about-item'))
                                            .indexOf(element) % 2 === 0;
                        animationParams.translateX = [isOddItem ? -40 : 40, 0];
                        animationParams.duration = 800;
                        delete animationParams.translateY;
                    } else if (element.matches('#community .community-intro-text')) {
                        animationParams.translateY = [25, 0];
                        animationParams.delay = 150;
                        animationParams.duration = 650;
                    } else if (element.matches('.requirements-list, .social-links')) {
                        animationParams.translateY = [25, 0];
                        animationParams.delay = (element.matches('.social-links') ? 300 : 50);
                    } else if (element.matches('.black-break-section .centered-break-image')) {
                        // Custom animation for dragon divider, e.g., scale and fade
                        animationParams.scale = [0.8, 1];
                        animationParams.duration = 900;
                        animationParams.easing = 'easeOutElastic(1, .7)';
                    }


                    if (getComputedStyle(element).opacity === '0') {
                        anime({ targets: element, ...animationParams });
                    }
                    observerInstance.unobserve(element);
                }
            });
        };

        const scrollObserver = new IntersectionObserver(animateOnScrollCallback, defaultObserverOptions);
        const elementsToAnimateOnScroll = document.querySelectorAll(
           '.content-section h2, #intro p, .feature-item, .pricing-card, .about-item, .requirements-list, #community .community-intro-text, .social-links, #trailer .video-container, .black-break-section .centered-break-image'
        );

        elementsToAnimateOnScroll.forEach(el => {
            // CSS should handle initial state (opacity: 0, transform: translateY(20px))
            // This JS is just a fallback if CSS isn't perfectly set, but CSS is preferred.
            // No need to set style.opacity = '0' here if it's already done in CSS.
            // If you are certain CSS handles this, you can remove the following if-block.
            if (getComputedStyle(el).opacity !== '0') { 
                 // console.warn("Element for scroll animation was not initially hidden by CSS:", el);
                 // el.style.opacity = '0'; 
                 // el.style.transform = 'translateY(20px)'; // Match default animation start
            }
            scrollObserver.observe(el);
        });
    }


    /**
     * ------------------------------------------------------------------------
     * GENERIC HOVER SCALE ANIMATIONS
     * ------------------------------------------------------------------------
     */
    if (IS_ANIME_LOADED) { // Only run if Anime.js is loaded
        const hoverScaleElements = document.querySelectorAll(
            '.cta-button, .gallery-nav-button, .social-links a, nav.inner-nav ul li a, header .logo a, .pricing-card .btn-buy'
        );

        hoverScaleElements.forEach(el => {
            let currentHoverAnimation;
            const baseScale = 1;
            const hoverScale = el.matches('header .logo a') ? 1.1 : 1.05;

            const animationConfig = {
                targets: el,
                duration: 200,
                easing: 'easeOutSine'
            };

            el.addEventListener('mouseenter', () => {
                if (currentHoverAnimation) currentHoverAnimation.pause();
                currentHoverAnimation = anime({ ...animationConfig, scale: hoverScale });
            });

            el.addEventListener('mouseleave', () => {
                if (currentHoverAnimation) currentHoverAnimation.pause();
                currentHoverAnimation = anime({ ...animationConfig, scale: baseScale, duration: 300 });
            });
        });
    }


    /**
     * ------------------------------------------------------------------------
     * BURGER MENU LOGIC
     * ------------------------------------------------------------------------
     */
    const burgerMenu = document.querySelector('.burger-menu');
    const innerNav = document.querySelector('nav.inner-nav');

    if (burgerMenu && innerNav) {
        burgerMenu.addEventListener('click', () => {
            innerNav.classList.toggle('nav-active');
            burgerMenu.classList.toggle('active');
            const isExpanded = innerNav.classList.contains('nav-active');
            burgerMenu.setAttribute('aria-expanded', isExpanded);
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });

        const navLinks = innerNav.querySelectorAll('ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (innerNav.classList.contains('nav-active')) {
                    innerNav.classList.remove('nav-active');
                    burgerMenu.classList.remove('active');
                    burgerMenu.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });
    }


    /**
     * ------------------------------------------------------------------------
     * INTRO SECTION HIGHLIGHT & IMAGE EFFECTS
     * ------------------------------------------------------------------------
     */
    if (IS_ANIME_LOADED) { // Only run if Anime.js is loaded
        const highlightSpan = document.querySelector('#still .highlight-yellow');
        const backgroundImage = document.querySelector('.intro-background-image');
        const foregroundImage = document.querySelector('.intro-foreground-image');
        const appearParagraph = document.querySelector('#appear');

        function splitSpanText(el) {
            if (!el || !el.textContent) return;
            const text = el.textContent;
            // Only wrap if not already wrapped
            if (!el.querySelector('.letter')) {
                const newText = text.replace(/\S/g, "<span class='letter'>$&</span>");
                el.innerHTML = newText;
            }
        }

        if (highlightSpan) {
            splitSpanText(highlightSpan);
            const highlightLetters = highlightSpan.querySelectorAll('.letter');
            if (highlightLetters.length > 0) {
                anime({
                    targets: highlightLetters,
                    opacity: [0, 1],
                    translateY: ["1em", 0],
                    duration: 300,
                    delay: anime.stagger(30),
                    easing: "easeOutExpo",
                    complete: () => {
                        anime({
                            targets: highlightLetters,
                            opacity: [ { value: 0.8, duration: 500 }, { value: 1, duration: 500 } ],
                            loop: true,
                            easing: 'easeInOutSine',
                            delay: anime.stagger(50, { from: 'center' })
                        });
                    }
                });
            }
        }

        if (appearParagraph) {
            //CSS should handle initial state (display: none, opacity: 0, transform)
            // appearParagraph.style.display = 'none';
            // appearParagraph.style.opacity = '0';
            // appearParagraph.style.transform = 'translateY(15px)';
        }

        if (highlightSpan && backgroundImage && foregroundImage && appearParagraph) {
            highlightSpan.addEventListener('mouseenter', () => {
                anime({ targets: backgroundImage, filter: ['blur(0px)', 'blur(5px)'], duration: 300, easing: 'easeInOutQuad' });
                anime({ targets: foregroundImage, filter: ['blur(4px)', 'blur(0px)'], duration: 300, easing: 'easeInOutQuad' });
                appearParagraph.style.display = 'block'; // Make it visible before animating opacity/transform
                requestAnimationFrame(() => { // Ensures display:block is applied before animation starts
                    anime({ targets: appearParagraph, opacity: [0, 1], translateY: ['50px', '0px'], duration: 500, easing: 'easeInOutQuad' });
                });
            });

            highlightSpan.addEventListener('mouseleave', () => {
                anime({ targets: backgroundImage, filter: ['blur(5px)', 'blur(0px)'], duration: 300, easing: 'easeInOutQuad' });
                anime({ targets: foregroundImage, filter: ['blur(0px)', 'blur(4px)'], duration: 300, easing: 'easeInOutQuad' });
                anime({
                    targets: appearParagraph,
                    opacity: [1, 0],
                    translateY: ['0px', '50px'],
                    duration: 500,
                    easing: 'easeInOutQuad',
                    complete: () => { appearParagraph.style.display = 'none'; } // Hide after animation
                });
            });
        }
    }


}); // END OF DOMContentLoaded


document.addEventListener('DOMContentLoaded', function() {
    const imageToAnimate = document.querySelector('.slide-down-on-load');
    if (imageToAnimate) {
        // Thêm một chút delay nhỏ để trình duyệt có thời gian "thở" trước khi bắt đầu transition
        setTimeout(() => {
            imageToAnimate.classList.add('loaded');
        }, 100); // 100ms delay, có thể điều chỉnh
    }
});