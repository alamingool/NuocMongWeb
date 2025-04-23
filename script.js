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

    // 3. Implement Looping via Scroll Event Listener (Revised)
    let isHandlingLoop = false; // Flag to prevent infinite loops during the jump

    galleryTrack.addEventListener('scroll', () => {
        if (isHandlingLoop) return; // Don't trigger loop logic while already jumping

        const scrollLeft = galleryTrack.scrollLeft;
        const trackWidth = galleryTrack.offsetWidth;
        const itemWidth = galleryItems[0].offsetWidth; // Assuming items have similar width, or get actual width
        const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
        const scrollPosCentered = scrollLeft + (trackWidth / 2); // Center of the visible area

        // Find the index of the item closest to the center of the view
        // This is a simple approximation, scroll-snap helps make this reliable
        let closestIndex = 0;
        let minDiff = Math.abs((galleryItems[0].offsetLeft + itemWidth / 2) - scrollPosCentered);

        for (let i = 1; i < galleryItems.length; i++) {
             const diff = Math.abs((galleryItems[i].offsetLeft + galleryItems[i].offsetWidth / 2) - scrollPosCentered);
             if (diff < minDiff) {
                  minDiff = diff;
                  closestIndex = i;
             }
        }

        // Determine if we are currently centered on a duplicate item
        // Check if the closest centered item is in the duplicate zones
        const totalItems = galleryItems.length;
        const firstRealIndex = numDuplicatesStart;
        const lastRealIndex = totalItems - 1 - numDuplicatesEnd;

        let targetIndex = -1; // -1 means no jump needed yet

        // Check if centered on a START duplicate (indices 0 to numDuplicatesStart-1)
        if (closestIndex < firstRealIndex) {
            targetIndex = firstRealIndex + (closestIndex); // Jump to the corresponding real item index
            console.log(`Centered on start duplicate (index ${closestIndex}), planning jump to real index ${targetIndex}`);
        }
        // Check if centered on an END duplicate (indices totalItems-numDuplicatesEnd to totalItems-1)
        else if (closestIndex > lastRealIndex) {
             targetIndex = firstRealIndex + (closestIndex - (lastRealIndex + 1)); // Jump to corresponding real index
             console.log(`Centered on end duplicate (index ${closestIndex}), planning jump to real index ${targetIndex}`);
        }


        // If a jump is needed
        if (targetIndex !== -1) {
             isHandlingLoop = true; // Set the flag
             const targetScrollLeft = getScrollLeftForIndex(targetIndex);

             // Wait for the smooth scroll started by button/manual scroll to potentially finish
             // or just trigger the instant jump immediately based on scroll position reaching the boundary
             // The original scrollLeft check logic might be better for *triggering* the jump instantly
             // Let's combine: use scrollLeft boundaries to trigger, but index to confirm/calculate target

            // --- Refined Loop Logic (combining scrollLeft bounds check with index for target) ---
             const scrollAtFirstReal = getScrollLeftForIndex(firstRealIndex);
             const scrollAtLastReal = getScrollLeftForIndex(lastRealIndex);
             const tolerance = 5; // Small pixel tolerance

             if (scrollLeft <= scrollAtFirstReal - tolerance) {
                  // Scrolled left past the start of the real images (into duplicates)
                  console.log("Boundary crossed Left, jumping to end real images...");
                  galleryTrack.scrollTo({
                       left: scrollAtLastReal,
                       behavior: 'instant'
                  });
                  // Reset flag after the instant scroll completes (or very shortly after)
                  // A small timeout might be needed if the instant scroll isn't truly instant in all cases
                   requestAnimationFrame(() => { // Or setTimeout(..., 0);
                        isHandlingLoop = false;
                        console.log("Loop handling finished.");
                   });

             } else if (scrollLeft >= scrollAtLastReal + tolerance) {
                  // Scrolled right past the end of the real images (into duplicates)
                  console.log("Boundary crossed Right, jumping to start real images...");
                   galleryTrack.scrollTo({
                       left: scrollAtFirstReal,
                       behavior: 'instant'
                  });
                   requestAnimationFrame(() => { // Or setTimeout(..., 0);
                        isHandlingLoop = false;
                         console.log("Loop handling finished.");
                   });
             } else {
                 // If no jump was needed based on boundary, reset flag if it was set
                 // (This handles cases where a scroll stops just before the boundary)
                 isHandlingLoop = false;
             }
        }
         // else { // If no jump was needed at all, ensure flag is false
         //      isHandlingLoop = false; // This might be redundant if logic is right, but safer
         // }
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