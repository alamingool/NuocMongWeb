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
    const numRealImages = galleryItems.length - 4; // Assuming 2 duplicates at start, 2 at end
    if (numRealImages <= 0) {
         console.warn("Less than 1 real image found. Skipping gallery JS.");
          if (leftButton) leftButton.style.display = 'none';
          if (rightButton) rightButton.style.display = 'none';
          return;
    }
    const numDuplicatesStart = 2; // Number of duplicates at the beginning
    const numDuplicatesEnd = 2;   // Number of duplicates at the end

    // Function to calculate the scroll position for a specific item index
    // We scroll to the *start* of the item, adjusted by half the track width
    // minus half the item width to try and center it due to scroll-snap: center
    function getScrollLeftForIndex(index) {
         if (!galleryItems[index]) return 0;
         const itemLeft = galleryItems[index].offsetLeft;
         const itemWidth = galleryItems[index].offsetWidth;
         const trackWidth = galleryTrack.offsetWidth;

         // Calculate position to center the item
         const scrollLeft = itemLeft - (trackWidth / 2) + (itemWidth / 2);

         return scrollLeft;
    }

    // 1. Initial Scroll Position: Scroll to the start of the *real* images (after the duplicates)
    // Use a timeout to ensure layout is stable after page load
    window.addEventListener('load', () => { // Use load event for safer layout calculation
         const initialScrollLeft = getScrollLeftForIndex(numDuplicatesStart);
         galleryTrack.scrollTo({
              left: initialScrollLeft,
              behavior: 'instant' // Jump instantly on load
         });
          console.log(`Initial scroll set to index ${numDuplicatesStart} (${initialScrollLeft}px)`);
    });


    // 2. Handle Button Clicks
    leftButton.addEventListener('click', () => {
        // Find the index of the currently snapped/most visible item
        let currentIndex = Array.from(galleryItems).findIndex(item => {
             const itemLeft = item.offsetLeft - galleryTrack.parentElement.offsetLeft; // Position relative to track parent
             const itemRight = itemLeft + item.offsetWidth;
             const trackCenter = galleryTrack.scrollLeft + (galleryTrack.offsetWidth / 2);
             // Check if the center of the item is close to the center of the visible track area
             return trackCenter >= itemLeft && trackCenter < itemRight;
        });

        // If no item is clearly centered, find the one whose start is closest to the current scrollLeft
         if (currentIndex === -1) {
             currentIndex = Array.from(galleryItems).reduce((closestIndex, item, index, arr) => {
                 const dist = Math.abs(item.offsetLeft - galleryTrack.scrollLeft);
                 const currentClosestDist = Math.abs(arr[closestIndex].offsetLeft - galleryTrack.scrollLeft);
                 return dist < currentClosestDist ? index : closestIndex;
             }, 0); // Start with the first item as the closest
         }

        const targetIndex = currentIndex - 1;
        console.log(`Left button clicked. Current index: ${currentIndex}, Target index: ${targetIndex}`);

         if (targetIndex < 0) {
              // We are moving into the left duplicates (which correspond to the end of real images)
              // We'll handle the loop jump AFTER the smooth scroll completes (via scroll listener)
               galleryTrack.scrollBy({
                    left: -galleryItems[currentIndex].offsetWidth - (parseFloat(getComputedStyle(galleryTrack).gap) || 0),
                    behavior: 'smooth'
               });
         } else {
             const targetScrollLeft = getScrollLeftForIndex(targetIndex);
             galleryTrack.scrollTo({
                  left: targetScrollLeft,
                  behavior: 'smooth'
             });
         }
    });

    rightButton.addEventListener('click', () => {
         // Find the index of the currently snapped/most visible item (Same logic as left button)
         let currentIndex = Array.from(galleryItems).findIndex(item => {
             const itemLeft = item.offsetLeft - galleryTrack.parentElement.offsetLeft;
             const itemRight = itemLeft + item.offsetWidth;
             const trackCenter = galleryTrack.scrollLeft + (galleryTrack.offsetWidth / 2);
              return trackCenter >= itemLeft && trackCenter < itemRight;
         });

         if (currentIndex === -1) {
             currentIndex = Array.from(galleryItems).reduce((closestIndex, item, index, arr) => {
                 const dist = Math.abs(item.offsetLeft - galleryTrack.scrollLeft);
                 const currentClosestDist = Math.abs(arr[closestIndex].offsetLeft - galleryTrack.scrollLeft);
                 return dist < currentClosestDist ? index : closestIndex;
             }, 0);
         }

        const targetIndex = currentIndex + 1;
         console.log(`Right button clicked. Current index: ${currentIndex}, Target index: ${targetIndex}`);


         if (targetIndex >= galleryItems.length) {
             // We are moving into the right duplicates (which correspond to the start of real images)
             // We'll handle the loop jump AFTER the smooth scroll completes (via scroll listener)
               galleryTrack.scrollBy({
                   left: galleryItems[currentIndex].offsetWidth + (parseFloat(getComputedStyle(galleryTrack).gap) || 0),
                   behavior: 'smooth'
               });
         } else {
             const targetScrollLeft = getScrollLeftForIndex(targetIndex);
              galleryTrack.scrollTo({
                 left: targetScrollLeft,
                 behavior: 'smooth'
              });
         }
    });

    // 3. Implement Looping via Scroll Event Listener
    galleryTrack.addEventListener('scroll', () => {
        const scrollLeft = galleryTrack.scrollLeft;
        const maxScrollLeft = galleryTrack.scrollWidth - galleryTrack.offsetWidth;

        // Get the scroll position of the first real image (after duplicates)
        const firstRealImageScrollLeft = getScrollLeftForIndex(numDuplicatesStart);
        // Get the scroll position of the last real image (before duplicates)
        const lastRealImageScrollLeft = getScrollLeftForIndex(galleryItems.length - 1 - numDuplicatesEnd);


        // Check if scrolled to the end duplicates (teleport to start real images)
        // We need a small tolerance because scroll positions might not be exact pixel values
        if (scrollLeft >= maxScrollLeft - galleryItems[0].offsetWidth * numDuplicatesEnd - 10) { // Adjust tolerance if needed
             console.log("Reached end duplicates, jumping to start real images...");
             galleryTrack.scrollTo({
                 left: firstRealImageScrollLeft,
                 behavior: 'instant' // Jump instantly
             });
        }
        // Check if scrolled to the start duplicates (teleport to end real images)
        else if (scrollLeft <= getScrollLeftForIndex(0) + galleryItems[0].offsetWidth * numDuplicatesStart + 10) { // Adjust tolerance
             console.log("Reached start duplicates, jumping to end real images...");
             galleryTrack.scrollTo({
                  left: lastRealImageScrollLeft,
                  behavior: 'instant' // Jump instantly
             });
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