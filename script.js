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
        const minRequiredItems = 1 + numDuplicatesStart + numDuplicatesEnd;

        if (galleryItems.length < minRequiredItems) {
            console.warn(`Not enough gallery items (${galleryItems.length}). Need at least ${minRequiredItems}. Skipping gallery JS.`);
            if (galleryLeftButton) galleryLeftButton.style.display = 'none';
            if (galleryRightButton) galleryRightButton.style.display = 'none';
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

        window.addEventListener('load', () => {
            // Defer initial scroll slightly to ensure all styles and dimensions are applied
            setTimeout(() => {
                const initialScrollLeft = getScrollLeftToCenterItem(numDuplicatesStart);
                galleryTrack.scrollTo({ left: initialScrollLeft, behavior: 'instant' });
                // console.log(`Gallery: Initial scroll to center item index ${numDuplicatesStart} (${initialScrollLeft}px)`);
            }, 100); // Small delay
        }, { once: true });

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
            const trackWidth = galleryTrack.offsetWidth;
            const firstRealItemIndex = numDuplicatesStart;
            const lastRealItemIndex = galleryItems.length - 1 - numDuplicatesEnd;

            // Boundaries for "real" content based on centering the first/last real item
            const startBoundary = getScrollLeftToCenterItem(firstRealItemIndex) - loopTolerance;
            const endBoundary = getScrollLeftToCenterItem(lastRealItemIndex) + loopTolerance;

            if (scrollLeft < startBoundary) {
                // console.log("Gallery: Scrolled to left duplicates, jumping to end.");
                isHandlingLoop = true;
                const jumpTargetScrollLeft = getScrollLeftToCenterItem(lastRealItemIndex);
                galleryTrack.scrollTo({ left: jumpTargetScrollLeft, behavior: 'instant' });
                requestAnimationFrame(() => { isHandlingLoop = false; });
            } else if (scrollLeft > endBoundary) {
                // console.log("Gallery: Scrolled to right duplicates, jumping to start.");
                isHandlingLoop = true;
                const jumpTargetScrollLeft = getScrollLeftToCenterItem(firstRealItemIndex);
                galleryTrack.scrollTo({ left: jumpTargetScrollLeft, behavior: 'instant' });
                requestAnimationFrame(() => { isHandlingLoop = false; });
            }
        });

        document.addEventListener('keydown', (event) => {
            const gallerySection = document.getElementById('gallery');
            // Check if the event target is not an input field to avoid interference
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


    const burgerMenu = document.querySelector('.burger-menu');
    const innerNav = document.querySelector('nav.inner-nav');
    if (burgerMenu && innerNav) {
    }

    if (typeof anime !== 'undefined') {

    } else {
        console.warn("Anime.js not found. Some animations will be skipped.");
    }

}); // END OF SINGLE DOMContentLoaded


// script.js

document.addEventListener('DOMContentLoaded', () => {
    const IS_ANIME_LOADED = typeof anime !== 'undefined';

    if (!IS_ANIME_LOADED) {
        console.warn("Anime.js not found. Animations will be skipped.");
        // return; // Không return ở đây nếu vẫn muốn các logic khác chạy
    }

    // ... (Các hàm và logic khác của bạn như Gallery, Burger Menu, Intro, Scroll Animations) ...


    /**
     * ------------------------------------------------------------------------
     * HERO SECTION ANIMATIONS (Bao gồm cả nhân vật)
     * ------------------------------------------------------------------------
     */
    function setupHeroAnimations() {
        if (!IS_ANIME_LOADED) {
            // console.warn("Anime.js not found. Skipping Hero section animations."); // Đã cảnh báo ở trên
            return;
        }

        const heroLogo = document.querySelector('.hero-content img.logo');
        const heroPriceLetters = document.querySelectorAll('.hero-price .letter');
        const heroPriceContainer = document.querySelector('.hero-price');
        const heroH1 = document.querySelector('.hero-content h1');
        const heroH2 = document.querySelector('.hero-content h2');
        const heroParagraph = document.querySelector('.hero-content > p');
        const heroCtaButton = document.querySelector('.hero .hero-cta');

        // THÊM SELECTOR CHO NHÂN VẬT
        const characterLeft = document.querySelector('.hero-character-left');
        const characterRight = document.querySelector('.hero-character-right');

        // Tách chữ giá tiền (giữ nguyên logic này)
        const priceTextWrapper = document.querySelector('.hero-price span');
        if (priceTextWrapper && priceTextWrapper.textContent) {
            const originalText = priceTextWrapper.textContent.trim();
            priceTextWrapper.innerHTML = originalText.replace(/\S/g, "<span class='letter'>$&</span>");
            // Cập nhật lại heroPriceLetters sau khiinnerHTML thay đổi
            // heroPriceLetters = document.querySelectorAll('.hero-price .letter'); // Không cần thiết nếu query 1 lần ở trên đã đủ
        }

        // Set initial states
        const elementsToFadeInSlideUp = [heroLogo, heroPriceContainer, heroH1, heroH2, heroParagraph, heroCtaButton].filter(el => el);
        if (elementsToFadeInSlideUp.length > 0) {
            anime.set(elementsToFadeInSlideUp, { opacity: 0, translateY: 25 });
        }
        const currentPriceLetters = document.querySelectorAll('.hero-price .letter'); // Query lại để chắc chắn
        if (currentPriceLetters.length > 0) {
            anime.set(currentPriceLetters, { opacity: 0, translateY: "1.1em" });
        }

        // Set initial states cho nhân vật (ngoài màn hình)
        if (characterLeft) {
            anime.set(characterLeft, { opacity: 0, translateX: '-100%', translateY: '-50%' }); // translateY để giữ căn giữa dọc
        }
        if (characterRight) {
            anime.set(characterRight, { opacity: 0, translateX: '100%', translateY: '-50%' }); // translateY để giữ căn giữa dọc
        }


        const tl = anime.timeline({
            easing: 'easeOutExpo',
            duration: 850,
            complete: () => animateCtaPulse(heroCtaButton) // Truyền target vào
        });

        // Logo Animation
        if (heroLogo) {
            tl.add({
                targets: heroLogo,
                opacity: 1,
                translateY: 0,
                scale: [0.7, 1],
                duration: 900
            }, 0); // Bắt đầu tại thời điểm 0
        }

        // Price Letters Animation
        if (currentPriceLetters.length > 0) {
            tl.add({
                targets: currentPriceLetters,
                opacity: 1,
                translateY: 0,
                delay: anime.stagger(35)
            }, (heroLogo ? 100 : 50)); // Bắt đầu sau logo một chút
        }

        // Price Container (chỉ để hiện ra, không có animation phức tạp)
        if (heroPriceContainer) {
            tl.add({
                targets: heroPriceContainer,
                opacity: 1,
                translateY: 0,
                duration: 700
            }, (heroLogo ? 100 : 50)); // Cùng lúc với price letters
        }

        // Text Elements (H1, H2, P)
        const textElements = [heroH1, heroH2, heroParagraph].filter(el => el);
        if (textElements.length > 0) {
            tl.add({
                targets: textElements,
                opacity: 1,
                translateY: 0,
                delay: anime.stagger(100, {start: (heroLogo ? 300 : 150)}) // Delay bắt đầu cho nhóm này
            }, 0); // Thêm vào timeline, delay nội bộ sẽ xử lý
        }

        // CTA Button
        if (heroCtaButton) {
            tl.add({
                targets: heroCtaButton,
                opacity: 1,
                translateY: 0,
                duration: 800,
            }, 500 ); // Bắt đầu sau text hoặc sau logo/price
        }


        // === ANIMATION CHO NHÂN VẬT ===
        const characterAnimationDelay = heroLogo ? 400 : 200; // Delay sau khi logo bắt đầu (hoặc sớm hơn nếu không có logo)
        const characterDuration = 1500; // Thời gian nhân vật di chuyển vào
        const characterEasing = 'easeOutQuint'; // Easing mượt mà hơn cho di chuyển dài

        if (characterLeft) {
            tl.add({
                targets: characterLeft,
                opacity: [0, 1], // Fade in
                translateX: ['-100%', '0'], // Từ ngoài vào và dừng lại hơi ló ra (điều chỉnh -15% nếu muốn)
                                                // Hoặc translateX: ['-100%', '0%'] nếu muốn vào hẳn
                translateY: '-50%', // Giữ nguyên căn giữa dọc
                duration: characterDuration,
                easing: characterEasing
            }, characterAnimationDelay); // Offset dựa trên thời điểm bắt đầu của timeline
        }

        if (characterRight) {
            tl.add({
                targets: characterRight,
                opacity: [0, 1],
                translateX: ['100%', '0'], // Từ ngoài vào và dừng lại hơi ló ra (điều chỉnh 15% nếu muốn)
                                               // Hoặc translateX: ['100%', '0%'] nếu muốn vào hẳn
                translateY: '-50%', // Giữ nguyên căn giữa dọc
                duration: characterDuration,
                easing: characterEasing
            }, characterAnimationDelay); // Bắt đầu cùng lúc với characterLeft
        }
    }

    function animateCtaPulse(target) { // Thêm tham số target
        if (IS_ANIME_LOADED && target) {
            anime({
                targets: target,
                scale: [{ value: 1, duration: 500 }, { value: 1.05, duration: 600 }, { value: 1, duration: 500 }],
                easing: 'easeInOutSine',
                loop: true
            });
        }
    }

    // Gọi hàm setup chính
    setupHeroAnimations();


    // --- (CÁC PHẦN CODE JS KHÁC CỦA BẠN NHƯ SCROLL ANIMATIONS, GALLERY, BURGER...) ---

}); // END OF SINGLE DOMContentLoaded






document.addEventListener('DOMContentLoaded', () => {
    const IS_ANIME_LOADED = typeof anime !== 'undefined';

    if (!IS_ANIME_LOADED) {
        console.warn("Anime.js not found. Scroll and hover animations will be skipped.");
        return; // Exit if Anime.js is not available
    }

    /**
     * ------------------------------------------------------------------------
     * SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
     * ------------------------------------------------------------------------
     */
    const defaultObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible (slightly earlier)
    };

    const animateOnScrollCallback = (entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                let animationParams = {
                    opacity: [0, 1],
                    translateY: [20, 0], // Default slide-up
                    duration: 700,
                    easing: 'easeOutCubic', // Consistent default easing
                    delay: 0
                };

                // Customize animation based on element type/selector
                if (element.matches('.content-section h2, #trailer .video-placeholder')) {
                    animationParams.translateY = [30, 0];
                    animationParams.duration = 800;
                    animationParams.delay = parseInt(element.dataset.scrollDelay) || 50; // Use data-attribute or default
                } else if (element.matches('#intro p')) {
                    animationParams.delay = (element.id === 'still' ? 150 : 300); // Stagger intro paragraphs
                    // Keep translateY from default
                } else if (element.matches('.feature-item')) {
                    animationParams.translateY = [40, 0];
                    animationParams.duration = 600;
                    animationParams.easing = 'easeOutExpo';
                    animationParams.delay = Array.from(element.parentNode.children)
                                            .filter(child => child.matches('.feature-item'))
                                            .indexOf(element) * 100;
                } else if (element.matches('.pricing-card')) { // Added Pricing Card
                    animationParams.translateY = [40, 0];
                    animationParams.duration = 600;
                    animationParams.easing = 'easeOutCubic';
                    animationParams.delay = Array.from(element.parentNode.children)
                                            .filter(child => child.matches('.pricing-card'))
                                            .indexOf(element) * 120; // Stagger pricing cards
                    if (element.classList.contains('featured')) {
                        animationParams.scale = [0.95, 1];
                        animationParams.duration = 700;
                        animationParams.easing = 'easeOutElastic(1, .8)';
                    }
                } else if (element.matches('.about-item')) {
                    const isOddItem = Array.from(element.parentNode.children)
                                        .filter(child => child.matches('.about-item'))
                                        .indexOf(element) % 2 === 0;
                    animationParams.translateX = [isOddItem ? -40 : 40, 0]; // Consistent slide distance
                    animationParams.duration = 800;
                    delete animationParams.translateY; // Remove default translateY for side slide
                }else if (element.matches('#community .community-intro-text')) {
                    animationParams.translateY = [25, 0]; // Giống social-links hoặc tùy chỉnh
                    animationParams.delay = 150;      // Xuất hiện sau tiêu đề một chút (nếu tiêu đề có delay 50)
                    animationParams.duration = 650;
                }
                else if (element.matches('.requirements-list, .social-links')) {
                    animationParams.translateY = [25, 0]; // Đổi lại thành 25px cho nhất quán
                    animationParams.delay = (element.matches('.social-links') ? 300 : 50); // Social links có thể delay nhiều hơn
                }
                
                // Add more 'else if' for other specific elements if needed

                // Apply animation if the element is currently hidden (avoids re-animating)
                if (getComputedStyle(element).opacity === '0') { // Check computed opacity
                    anime({ targets: element, ...animationParams });
                }
                observerInstance.unobserve(element);
            }
        });
    };

    const scrollObserver = new IntersectionObserver(animateOnScrollCallback, defaultObserverOptions);

    const elementsToAnimateOnScroll = document.querySelectorAll(
       '.content-section h2, #intro p, .feature-item, .pricing-card, .about-item, .requirements-list, #community .community-intro-text, .social-links, #trailer .video-placeholder, .black-break-section .centered-break-image'
        // Added .pricing-card, footer elements, and black-break image
    );

    elementsToAnimateOnScroll.forEach(el => {
        // IMPORTANT: Ensure elements start hidden via CSS for a smooth effect
        // CSS example:
        // .content-section h2, #intro p, /* etc... */ { opacity: 0; transform: translateY(20px); }
        // If not set in CSS, set it here, but CSS is preferred for FOUC prevention.
        if (getComputedStyle(el).opacity !== '0') { // Only set if not already set by CSS
             el.style.opacity = '0';
             // Consider setting initial transform here too if not in CSS,
             // matching the starting point of your animations (e.g., translateY(20px))
             // el.style.transform = 'translateY(20px)';
        }
        scrollObserver.observe(el);
    });

    /**
     * ------------------------------------------------------------------------
     * GENERIC HOVER SCALE ANIMATIONS
     * ------------------------------------------------------------------------
     */
    const hoverScaleElements = document.querySelectorAll(
        '.cta-button, .gallery-nav-button, .social-links a, nav.inner-nav ul li a, header .logo a, .pricing-card .btn-buy' // Added .btn-buy
    );

    hoverScaleElements.forEach(el => {
        let currentHoverAnimation; // To manage and pause ongoing animations
        const baseScale = 1;
        const hoverScale = el.matches('header .logo a') ? 1.1 : 1.05; // Logo scales a bit more

        const animationConfig = {
            targets: el,
            duration: 200,
            easing: 'easeOutSine'
        };

        el.addEventListener('mouseenter', () => {
            if (currentHoverAnimation) {
                currentHoverAnimation.pause(); // Pause any existing animation
            }
            currentHoverAnimation = anime({ ...animationConfig, scale: hoverScale });
        });

        el.addEventListener('mouseleave', () => {
            if (currentHoverAnimation) {
                currentHoverAnimation.pause();
            }
            currentHoverAnimation = anime({ ...animationConfig, scale: baseScale, duration: 300 }); // Slower return
        });
    });

    // --- (OTHER JS MODULES LIKE GALLERY, HERO ANIMATIONS, BURGER MENU, INTRO HIGHLIGHT WOULD BE HERE) ---

}); // END OF SINGLE DOMContentLoaded


document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-menu');
    const innerNav = document.querySelector('nav.inner-nav'); // Target nav.inner-nav
    // const navLinks = document.querySelectorAll('nav.inner-nav ul li a');

    if (burgerMenu && innerNav) {
        burgerMenu.addEventListener('click', () => {
            innerNav.classList.toggle('nav-active');
            burgerMenu.classList.toggle('active');
            const isExpanded = innerNav.classList.contains('nav-active');
            burgerMenu.setAttribute('aria-expanded', isExpanded);

            if (innerNav.classList.contains('nav-active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

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
});


// script.js

document.addEventListener('DOMContentLoaded', () => {
    // ... (code JS hiện có của bạn cho Gallery, Hero, Burger Menu, Intro highlight ...) ...

    const IS_ANIME_LOADED = typeof anime !== 'undefined';

    if (IS_ANIME_LOADED) {
        // ... (các khối animation khác của bạn) ...

        /**
         * ------------------------------------------------------------------------
         * PRICING SECTION ANIMATIONS (SIMPLE VERSION)
         * ------------------------------------------------------------------------
         */
        const pricingCards = document.querySelectorAll('#pricing .pricing-card');

        if (pricingCards.length > 0) {
            const pricingObserverOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.15 // Kích hoạt khi 15% của card hiển thị
            };

            const pricingObserverCallback = (entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const card = entry.target;
                        const cardIndex = Array.from(pricingCards).indexOf(card);

                        anime({
                            targets: card,
                            opacity: [0, 1],
                            translateY: [30, 0], // Từ dưới lên
                            duration: 500,       // Thời gian animation ngắn hơn
                            easing: 'easeOutQuad', // Easing mượt mà, không quá phức tạp
                            delay: cardIndex * 100 // Stagger delay ngắn hơn
                        });

                        observerInstance.unobserve(card); // Ngừng observe sau khi animate
                    }
                });
            };

            const pricingScrollObserver = new IntersectionObserver(pricingObserverCallback, pricingObserverOptions);
            pricingCards.forEach(card => {
                // CSS đã đặt opacity: 0 và transform
                pricingScrollObserver.observe(card);
            });
        } // End if (pricingCards.length > 0)

    } // End if (IS_ANIME_LOADED)

    // ... (code JS còn lại của bạn) ...

}); // END OF SINGLE DOMContentLoaded



document.addEventListener('DOMContentLoaded', () => {
    const highlightSpan = document.querySelector('#still .highlight-yellow');
    const backgroundImage = document.querySelector('.intro-background-image');
    const foregroundImage = document.querySelector('.intro-foreground-image');
    const appearParagraph = document.querySelector('#appear');

    function splitSpanText(el) {
        const text = el.textContent;
        const newText = text.replace(/\S/g, "<span class='letter'>$&</span>");
        el.innerHTML = newText;
    }

    if (highlightSpan) {
        splitSpanText(highlightSpan); // Tách chữ
    }

    // Animate từng chữ khi vừa load
    // Animate từng chữ khi load
anime({
    targets: '.highlight-yellow .letter',
    opacity: [0, 1],
    translateY: ["1em", 0],
    duration: 300,
    delay: anime.stagger(30),
    easing: "easeOutExpo",
    complete: () => {
        // Sau khi load xong, bắt đầu chớp tắt vô hạn
        anime({
            targets: '.highlight-yellow .letter',
            opacity: [
                { value: 0.8, duration: 500 },
                { value: 1, duration: 500 }
            ],
            loop: true,
            easing: 'easeInOutSine',
            delay: anime.stagger(50, { from: 'center' }) // nhấp nháy như sóng
        });
    }
});

    
    if (appearParagraph) {
        appearParagraph.style.display = 'none'; // Ẩn ban đầu
        appearParagraph.style.opacity = '0'; // Đặt opacity sẵn sàng cho animation
        appearParagraph.style.transform = 'translateY(15px)'; // Đặt transform sẵn sàng
    }

    if (highlightSpan && backgroundImage && appearParagraph) {

        highlightSpan.addEventListener('mouseenter', () => {
            // Làm mờ ảnh nền
            anime({
                targets: backgroundImage,
                filter: ['blur(0px)', 'blur(5px)'],
                duration: 300,
                easing: 'easeInOutQuad'
            });

             // 2. Làm RÕ ảnh tay (hand.png)
             anime({
                targets: foregroundImage,
                filter: ['blur(4px)', 'blur(0px)'], // Từ mờ -> rõ (dùng giá trị blur ban đầu)
                duration: 300,
                easing: 'easeInOutQuad'
            });

            // Hiện đoạn #appear
            appearParagraph.style.display = 'block';
            requestAnimationFrame(() => { // Hoặc setTimeout(() => { ... }, 0);
                anime({
                    targets: appearParagraph,
                    opacity: [0, 1],
                    translateY: ['50px', '0px'],
                    duration: 500,
                    easing: 'easeInOutQuad'
                });
            });
        });

        highlightSpan.addEventListener('mouseleave', () => {
            // Làm rõ ảnh nền
            anime({
                targets: backgroundImage,
                filter: ['blur(5px)', 'blur(0px)'],
                duration: 300,
                easing: 'easeInOutQuad'
            });

            // 2. Làm MỜ ảnh tay (hand.png) trở lại
            anime({
                targets: foregroundImage,
                filter: ['blur(0px)', 'blur(4px)'], // Từ rõ -> mờ (về giá trị blur ban đầu)
                duration: 300,
                easing: 'easeInOutQuad'
            });

            // Ẩn đoạn #appear
            anime({
                targets: appearParagraph,
                opacity: [1, 0],
                translateY: ['0px', '50px'],
                duration: 500,
                easing: 'easeInOutQuad',
                complete: function(anim) {
                    // 3. Đặt lại display: none sau khi animation hoàn tất
                    appearParagraph.style.display = 'none';
                }
            });
        });

    } else {
        console.error("Không tìm thấy một hoặc nhiều phần tử cần thiết cho hoạt ảnh.");
    }
});


