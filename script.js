// Nuoc Mong - script.js

console.log("Nuoc Mong JS Loaded!");

// --- Gallery Scrolling and Looping Logic ---

document.addEventListener('DOMContentLoaded', () => { // Ensure script runs after the DOM is fully loaded

    const galleryTrack = document.querySelector('.fluid-gallery-track');
    const galleryItems = document.querySelectorAll('.gallery-item'); // All images, including duplicates
    const leftButton = document.querySelector('.gallery-nav-button.left');
    const rightButton = document.querySelector('.gallery-nav-button.right');

    // If we don't have the necessary elements, stop here
    if (!galleryTrack || galleryItems.length === 0 || !leftButton || !rightButton) {
        console.warn("Gallery elements not found. Skipping gallery JS.");
        // Optional: Hide buttons if gallery isn't set up
        if (leftButton) leftButton.style.display = 'none';
        if (rightButton) rightButton.style.display = 'none';
        return;
    }

    // Configuration based on number of actual images and duplicates
    // Need at least 1 real image + enough duplicates for smooth looping
    const minRequiredItems = 1 + 2 + 2; // 1 real + 2 start duplicates + 2 end duplicates
    if (galleryItems.length < minRequiredItems) {
         console.warn(`Not enough gallery items (${galleryItems.length}). Need at least ${minRequiredItems}. Skipping gallery JS.`);
          if (leftButton) leftButton.style.display = 'none';
          if (rightButton) rightButton.style.display = 'none';
          return;
    }

    const numDuplicatesStart = 2; // Number of duplicates at the beginning
    const numDuplicatesEnd = 2;   // Number of duplicates at the end
    const numRealImages = galleryItems.length - numDuplicatesStart - numDuplicatesEnd;

     // Function to calculate the scroll position for a specific item index
     // We scroll to the *start* of the item, adjusted by half the track width
     // minus half the item width to try and center it due to scroll-snap: center
     // NOTE: This calculation might need fine-tuning based on exact element widths and padding/margin
     // The core issue is likely the scrollBy amount, but centering helps with snap alignment.
    function getScrollLeftForIndex(index) {
         if (!galleryItems[index]) return 0;
         const item = galleryItems[index];
         // item.offsetLeft is relative to its offsetParent (usually the track)
         const itemLeft = item.offsetLeft;
         const itemWidth = item.offsetWidth;
         const trackWidth = galleryTrack.offsetWidth;

         // Calculate position to center the item
         // ScrollLeft = (Start of item relative to track) - (Half track width) + (Half item width)
         const scrollLeft = itemLeft - (trackWidth / 2) + (itemWidth / 2);

         // Ensure we don't scroll past the natural limits if calculation is slightly off at ends
         // This might interfere with loop logic if not careful. Better to trust the snap.
         // For now, let's rely on snap and loop logic to handle boundaries.
         return scrollLeft;
    }


    // 1. Initial Scroll Position: Scroll to the start of the *real* images (after the duplicates)
    // Use a timeout to ensure layout is stable after page load
    window.addEventListener('load', () => { // Use load event for safer layout calculation
         // Scroll to the position that centers the first *real* image (index = numDuplicatesStart)
         const initialScrollLeft = getScrollLeftForIndex(numDuplicatesStart);
         galleryTrack.scrollTo({
              left: initialScrollLeft,
              behavior: 'instant' // Jump instantly on load
         });
          console.log(`Initial scroll set to center item index ${numDuplicatesStart} (${initialScrollLeft}px)`);
    });


    // 2. Handle Button Clicks
    leftButton.addEventListener('click', () => {
        // Find the index of the currently snapped/most visible item
        // This logic can be tricky. A simpler approach might be to scroll by a fixed step (item width + gap)
        // and let scroll-snap correct, then handle the loop. Let's try the fixed step first as it's simpler.

        const firstItem = galleryItems[0]; // Assuming all items are roughly the same width
        if (!firstItem) return;
        const itemWidth = firstItem.offsetWidth;
        const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
        const scrollStep = itemWidth + gap;

        console.log(`Left button clicked. Scrolling left by ${scrollStep}px`);
         galleryTrack.scrollBy({
             left: -scrollStep, // Scroll left by one item width + gap
             behavior: 'smooth'
         });

        // The loop logic in the scroll listener will handle the jump if needed
    });

    rightButton.addEventListener('click', () => {
         const firstItem = galleryItems[0]; // Assuming all items are roughly the same width
         if (!firstItem) return;
         const itemWidth = firstItem.offsetWidth;
         const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
         const scrollStep = itemWidth + gap;

         console.log(`Right button clicked. Scrolling right by ${scrollStep}px`);
         galleryTrack.scrollBy({
             left: scrollStep, // Scroll right by one item width + gap
             behavior: 'smooth'
         });

        // The loop logic in the scroll listener will handle the jump if needed
    });


    // 3. Implement Looping via Scroll Event Listener (Revised)
    let isHandlingLoop = false; // Flag to prevent infinite loops during the jump

    galleryTrack.addEventListener('scroll', () => {
        if (isHandlingLoop) return; // Don't trigger loop logic while already jumping

        const scrollLeft = galleryTrack.scrollLeft;
        const totalItems = galleryItems.length;
        const firstRealIndex = numDuplicatesStart;
        const lastRealIndex = totalItems - 1 - numDuplicatesEnd;

        // Calculate the scrollLeft positions corresponding to the *start* of the first/last real images
        // Use the getScrollLeftForIndex function for consistency with initial scroll
        const scrollPosAtFirstRealCentered = getScrollLeftForIndex(firstRealIndex);
        const scrollPosAtLastRealCentered = getScrollLeftForIndex(lastRealIndex);

        // Use a tolerance for floating point comparisons
        const tolerance = 5; // Pixels

        // Check if the user has scrolled "into" the duplicate sections
        // Compare current scrollLeft to the scrollLeft needed to be centered on the *real* boundary items
        // This needs careful calibration. A simpler trigger might be if scrollLeft is less than the offsetLeft
        // of the first real item, or greater than the offsetLeft of the last real item + its width.

        // Let's try a simpler trigger based on the offsetLeft boundaries of the real content:
        const firstRealItemOffsetLeft = galleryItems[firstRealIndex].offsetLeft;
        const lastRealItemOffsetLeft = galleryItems[lastRealIndex].offsetLeft;
        const lastRealItemWidth = galleryItems[lastRealIndex].offsetWidth;


        // Check if we have scrolled to the left of the first real item (into start duplicates)
        // or scrolled to the right of the last real item (into end duplicates)
        // Adding/subtracting scrollStep accounts for being one item away from the boundary after a scrollBy call
        // This trigger logic can be complex and depends on scroll-snap's exact behavior.

        // Let's try a trigger based on the *center* of the view entering the duplicate area.
        const trackCenterScroll = scrollLeft + (galleryTrack.offsetWidth / 2); // Center of the visible viewport
        const firstRealItemCenterScroll = galleryItems[firstRealIndex].offsetLeft + (galleryItems[firstRealIndex].offsetWidth / 2);
        const lastRealItemCenterScroll = galleryItems[lastRealIndex].offsetLeft + (galleryItems[lastRealIndex].offsetWidth / 2);

         // Check if the center of the view has passed the center of the first real item (scrolling left)
         // or passed the center of the last real item (scrolling right)
        if (trackCenterScroll < firstRealItemCenterScroll - tolerance) {
             // Scrolled left past the first real item (into duplicates)
             console.log("Boundary crossed Left (centered), jumping to end real images...");
             isHandlingLoop = true; // Set the flag BEFORE the scroll

             // Calculate the scroll position needed to center the last real item
             const jumpTargetScrollLeft = getScrollLeftForIndex(lastRealIndex);

              galleryTrack.scrollTo({
                   left: jumpTargetScrollLeft,
                   behavior: 'instant' // Instant jump for seamless loop
              });

              // Reset flag after the instant scroll completes. requestAnimationFrame is good for this.
               requestAnimationFrame(() => {
                    isHandlingLoop = false;
                    console.log("Loop handling finished.");
               });

        } else if (trackCenterScroll > lastRealItemCenterScroll + tolerance) {
             // Scrolled right past the last real item (into duplicates)
             console.log("Boundary crossed Right (centered), jumping to start real images...");
             isHandlingLoop = true; // Set the flag BEFORE the scroll

             // Calculate the scroll position needed to center the first real item
             const jumpTargetScrollLeft = getScrollLeftForIndex(firstRealIndex);

              galleryTrack.scrollTo({
                   left: jumpTargetScrollLeft,
                   behavior: 'instant' // Instant jump
              });

               requestAnimationFrame(() => {
                    isHandlingLoop = false;
                    console.log("Loop handling finished.");
               });
        }
         // If no jump was needed based on boundary, ensure flag is false
         // This is important if a smooth scroll *stops* just before the boundary.
         else {
             isHandlingLoop = false;
         }
    });

    // --- Optional: Keyboard Navigation (Left/Right Arrow Keys) ---
    document.addEventListener('keydown', (event) => {
        // Check if the gallery section is visible or scrolled into view
        const gallerySection = document.getElementById('gallery');
        if (gallerySection && gallerySection.getBoundingClientRect().top < window.innerHeight && gallerySection.getBoundingClientRect().bottom > 0) {
             if (event.key === 'ArrowLeft') {
                  event.preventDefault(); // Prevent default page scroll
                  leftButton.click(); // Trigger left button click
              } else if (event.key === 'ArrowRight') {
                  event.preventDefault(); // Prevent default page scroll
                  rightButton.click(); // Trigger right button click
             }
        }
    });


    // --- Examples of using other commented-out JS features ---

    // 1. Smooth Scrolling fallback (if scroll-behavior: smooth CSS doesn't work)
    // Uncomment the section in script.js if needed, but modern browsers support CSS smooth scrolling.

    // 2. Mobile Menu Toggle
    // You would need HTML button and CSS styles for this. The JS provided is a starting point.
    // const mobileMenuButton = document.querySelector('.mobile-menu-toggle');
    // const navLinks = document.querySelector('nav ul');
    // if (mobileMenuButton && navLinks) {
    //     mobileMenuButton.addEventListener('click', () => {
    //         navLinks.classList.toggle('active');
    //         mobileMenuButton.classList.toggle('active');
    //     });
    // }

    // 3. Active Navigation Link Highlighting on Scroll
    // Uncomment the section in script.js if you want this feature. It adds 'active' class to nav links.

    // 4. Simple Animations on Scroll (using Intersection Observer API)
    // Uncomment the section in script.js if you want elements to fade/slide in as you scroll down.
    // Requires adding a CSS class like '.visible' with transition styles.

}); // End DOMContentLoaded


// Wait for the HTML document to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

     // --- TÁCH CHỮ CÁI CHO GIÁ TIỀN ---
     const priceTextWrapper = document.querySelector('.hero-price span');
     if (priceTextWrapper) {
         const originalText = priceTextWrapper.textContent;
         priceTextWrapper.innerHTML = originalText.replace(/./g, "<span class='letter'>$&</span>");
         // Giải thích regex:
         // /./g : Chọn mọi ký tự (dấu .) trong chuỗi, g là global (tìm tất cả)
         // "$&" : Trong phần thay thế, "$&" đại diện cho chính ký tự đã khớp
         // => Bọc mỗi ký tự tìm thấy bằng <span class='letter'>...</span>
     }
     // --- KẾT THÚC TÁCH CHỮ ---


     // --- 1. Hero Section Animation on Load ---
     function animateHeroSection() {
         const tl = anime.timeline({
             easing: 'easeOutExpo',
             duration: 1000,
             complete: function(anim) {
                 // Giữ lại animation pulse cho CTA nếu có
                 animateCtaPulse(); // Call pulse animation when hero animation finishes
             }
         });

         // Logo Animation
         tl.add({
             targets: '.hero-content img',
             opacity: [0, 1],
             scale: [0.6, 1],
             duration: 900,
             easing: 'easeOutExpo',
         })
         // --- ANIMATION CHO CHỮ CÁI GIÁ TIỀN ---
         .add({
             targets: '.hero-price .letter', // Target the split letters
             translateY: ["1.1em", 0], // Jump up (1.1em = slightly higher than font height)
             opacity: [0, 1], // Fade in simultaneously
             easing: "easeOutExpo",
             duration: 800, // Duration for each letter's jump
             delay: anime.stagger(40) // IMPORTANT: Each letter starts with a 40ms delay
         }, '-=700') // Start this animation 700ms before the logo ends (runs almost simultaneously with H1/Price)
         // --- KẾT THÚC ANIMATION CHỮ CÁI ---

         // Text & Button Animations (adjust offset as needed)
         // Ensure the price text appears before/with the h1 if that's the desired order
         .add({
            targets: '.hero-price', // Animate the price block's container if needed
            opacity: [0, 1], // Price letters already animated, this might be redundant or for the container itself
            // translateY: [30, 0] // If price container needs initial slide
            duration: 1 // Use minimal duration as letters are already animated
         }, '-=1000') // Adjust offset to make it appear when letters are almost done

         .add({
             targets: '.hero-content h1', // Assuming there's an H1
             opacity: [0, 1],
             translateY: [30, 0],
         }, '-=900') // Adjust offset for H1 to appear after/with the price
         .add({
             targets: '.hero-content h2',
             opacity: [0, 1],
             translateY: [30, 0],
         }, '-=800')
         .add({
             targets: '.hero-content p',
             opacity: [0, 1],
             translateY: [30, 0],
         }, '-=800')
         .add({
             targets: '.hero .hero-cta',
             opacity: [0, 1],
             translateY: [30, 0],
             duration: 800
         }, '-=700'); // CTA button appears last
     }
     // Removed the duplicate animateHeroSection() call right here

     // --- NEW FUNCTION: CTA Pulse Animation ---
     function animateCtaPulse() {
         anime({
             targets: '.hero .hero-cta', // Only target the CTA button in the hero
             scale: [
                 { value: 1, duration: 500 },    // Normal state
                 { value: 1.05, duration: 600 }, // Slightly enlarge
                 { value: 1, duration: 500 }     // Return to normal
             ],
             easing: 'easeInOutSine', // Smooth easing for the whole process
             duration: 1600, // Total duration for one pulse cycle (500+600+500)
             loop: true // Repeat animation infinitely
         });
     }

     animateHeroSection(); // Run the initial hero animation


 }); // End DOMContentLoaded listener


 // Wait for the HTML document to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

     // --- Scroll-Triggered Animations using Intersection Observer ---
     const observerOptions = {
         root: null, // Use the viewport as the root
         rootMargin: '0px',
         threshold: 0.1 // Trigger when 10% of the element is visible
     };

     const observerCallback = (entries, observer) => {
         entries.forEach(entry => {
             // Check if the element is intersecting (entering the viewport)
             if (entry.isIntersecting) {
                 const element = entry.target;

                 // Apply animation based on the element's class
                 if (element.matches('.content-section h2') || element.matches('#intro p')) {
                     anime({
                         targets: element,
                         opacity: [0, 1],
                         translateY: [20, 0],
                         duration: 800,
                         easing: 'easeOutSine',
                         delay: element.matches('#intro p') ? 200 : 0 // Slight delay for intro paragraph
                     });
                 } else if (element.matches('.feature-item')) {
                     // Stagger animation for feature items
                     anime({
                         targets: element,
                         opacity: [0, 1],
                         translateY: [40, 0],
                         duration: 600,
                         easing: 'easeOutExpo',
                         // Find index among siblings for stagger delay (simple approach)
                         delay: Array.from(element.parentNode.children).indexOf(element) * 100
                     });
                 } else if (element.matches('.about-item')) {
                     // Slide in from alternating sides
                     // Check if the element is the 1st, 3rd, 5th child *among about-items*
                     // This might be better: element.classList.contains('about-item-1') etc.
                     const isOddItem = Array.from(element.parentNode.children).filter(child => child.classList.contains('about-item')).indexOf(element) % 2 === 0;

                     // If odd index (0, 2, 4...) --> image left, text right. Image comes from left. Text comes from right.
                     // If even index (1, 3, 5...) --> text left, image right. Text comes from left. Image comes from right.
                     // Since the *container* .about-item is the target, and we reversed flex-direction for even items,
                     // if the item itself is the target, we need to slide the *whole block*.
                     // Let's slide the odd blocks from left, even blocks from right.
                     const slideDirection = isOddItem ? -50 : 50; // Slide from left or right based on index


                     anime({
                         targets: element,
                         opacity: [0, 1],
                         translateX: [slideDirection, 0],
                         duration: 900,
                         easing: 'easeOutCubic'
                     });
                 } else if (element.matches('.requirements-list') || element.matches('.social-links')) {
                      anime({
                         targets: element,
                         opacity: [0, 1],
                         translateY: [30, 0],
                         duration: 700,
                         easing: 'easeOutSine'
                     });
                 }
                 // Add more specific animations for other sections if needed

                 // Stop observing the element after it has animated once
                 observer.unobserve(element);
             }
         });
     };

     // Create the Intersection Observer
     const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

     // Select all elements you want to animate on scroll
     const elementsToAnimate = document.querySelectorAll(
         '.content-section h2, #intro p, .feature-item, .about-item, .requirements-list, .social-links, #trailer .video-placeholder'
         // Added video-placeholder
         // Add other selectors here, e.g., '.trailer iframe', '.news-item'
     );

     // Start observing each element
     elementsToAnimate.forEach(el => {
         // Set initial state to invisible (optional, can also be done with CSS)
         // el.style.opacity = 0;
         scrollObserver.observe(el);
     });

     // --- Simple Hover Animations ---
     const interactiveElements = document.querySelectorAll('.cta-button, .gallery-nav-button, .social-links a, nav ul li a');

     interactiveElements.forEach(el => {
         el.addEventListener('mouseenter', () => {
             anime({
                 targets: el,
                 scale: 1.05, // Slightly enlarge
                 duration: 200,
                 easing: 'easeOutSine'
             });
         });

         el.addEventListener('mouseleave', () => {
             anime({
                 targets: el,
                 scale: 1, // Return to normal size
                 duration: 300,
                 easing: 'easeOutSine'
             });
         });
     });
     

     // --- REMOVED DUPLICATE GALLERY SCROLLING LOGIC HERE ---
     // The gallery scrolling and looping is handled by the block at the top.

}); // End DOMContentLoaded listener



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


