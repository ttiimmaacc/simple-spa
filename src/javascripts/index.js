const PAGES_METADATA = {
  "/": {
    title: "SimpleSPA - Home",
    partial: "/src/javascripts/partials/home.html",
    class_names: "home-page",
    theme_color: "#000000",
    navigation_inverted: false,
    position: 2,
  },
  "/home": {
    title: "SimpleSPA - Home",
    partial: "/src/javascripts/partials/home.html",
    class_names: "home-page",
    theme_color: "#000000",
    navigation_inverted: false,
    position: 2,
  },
  "/menu": {
    title: "SimpleSPA - Menu",
    partial: "/src/javascripts/partials/products.html",
    class_names: "multi-menu menu-page",
    theme_color: "#000000",
    navigation_inverted: true,
    position: 1,
  },
};

// --- Global Variables ---
const pageContainerElement = document.querySelector("main .page");
const mainContentElement = document.querySelector("main");
const navElement = document.querySelector("nav.main-nav");
const navLinksForCurrentClass = navElement
  ? Array.from(navElement.querySelectorAll(".main-nav-list ul a"))
  : [];

const toggleButton = navElement ? navElement.querySelector(".toggle") : null;
const themeColorMetaTag = document.querySelector("meta[name=theme-color]");

// --- State Variables ---
let pageDataCache = {};
let previousRoutePathForStyles;
let segueTimeoutId;
let pendingNavigationArgs = [];
let isNavigating = false;
let currentPath = normalizePath(location.pathname);
let navigatingToPathCurrently = null;

// Ensure window.App exists
window.App = window.App || {};

// --- Section: Product Cards ---
window.App.createProductCards = function () {
  const MODEL_NAME_DATA = [
    "product 1",
    "product 2",
    "product 3",
    "product 4",
    "product 5",
  ];
  const MODEL_PATH_DATA = [
    "product-1",
    "product-2",
    "product-3",
    "product-4",
    "product-5",
  ];
  const MODEL_DISPLAY_NAMES = [
    "the product 1",
    "the product 2",
    "the product 3",
    "the product 4",
    "the <span class='alt'>product</span> 5",
  ];
  const MODEL_SUMMARY_DATA = [
    "4.2 inches. <span></span> 1st detail",
    "5.4 inches. <span></span> 1st detail <span></span> 2nd detail",
    "6.9 inches. <span></span> 1st detail <span></span> 2nd detail",
    "8.0 inches. <span></span> 1st detail <span></span> 2nd detail",
    "9.5 inches. <span></span> 1st detail <span></span> 2nd detail",
  ];
  const COLOR_NAME_DATA = [
    "bonewhite",
    "driftwood",
    "parchment",
    "evergreen",
    "dark-bronze",
  ];
  const MODEL_COST_DATA = [
    [1520, 1697],
    [1700, 1898],
    [1900, 2121],
    [2490, 2778],
    [2770, 3092],
  ];
  const LAYOUT_TRANSFORM_RANGES = {
    desktop: [
      [0, 0.2, -2.5, 15.75, 31],
      [0, 0.4, -30, -1, 27.5],
      [0.2, 0.6, -25, 1.25, 22.5],
      [0.4, 0.8, -27.75, 0.875, 29.5],
      [0.6, 1, -25.75, 2.125, 30],
    ],
    mobile: [
      [0, 0.2, -3, 11, 24],
      [0, 0.4, -24.5, -3, 19],
      [0.2, 0.6, -18.5, -3, 13],
      [0.4, 0.8, -20, 0, 21],
      [0.6, 1, -18, 0, 20],
    ],
  };
  const pagesContainerElement = document.querySelector(
    ".product-cards-layouts-pages-container"
  );
  const layoutSelectorButtons = Array.from(
    document.querySelectorAll(".product-cards-layouts-selector button")
  );
  const layoutPageElements = Array.from(
    document.querySelectorAll(".product-cards-layouts-pages-page")
  );
  const colorSelectorDivs = Array.from(
    document.querySelectorAll(".product-cards-colors > div")
  );
  const pageControlButtons = Array.from(
    document.querySelectorAll(".product-cards-layouts-pages-controls button")
  );

  let animationClassTimeoutId;
  let scrollAnimationFrameId;
  let scrollWidthCache = 0;
  let currentLayoutIndex = 0;
  let currentColorIndicesPerLayout = Array(layoutPageElements.length).fill(0);

  function interpolate(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  function setActiveLayout(layoutIndex, instantScroll = false) {
    currentLayoutIndex = Math.max(
      Math.min(layoutIndex, layoutPageElements.length - 1),
      0
    );
    if (pagesContainerElement) {
      pagesContainerElement.scrollTo({
        left: currentLayoutIndex * pagesContainerElement.clientWidth,
        behavior: instantScroll ? "instant" : "smooth",
      });
      pagesContainerElement.dispatchEvent(
        new CustomEvent("change", {
          detail: { index: currentLayoutIndex },
        })
      );
    }
    updateDisplayStates(instantScroll);
  }

  function formatCurrency(amount) {
    let numAmount = amount;
    if (Number.isFinite(numAmount) === false) {
      numAmount = 0;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  }

  function updateDisplayStates(isInstantUpdate = false) {
    if (isInstantUpdate) {
      clearTimeout(animationClassTimeoutId);
      if (pagesContainerElement)
        pagesContainerElement.classList.add("without-animation");
      animationClassTimeoutId = setTimeout(() => {
        if (pagesContainerElement)
          pagesContainerElement.classList.remove("without-animation");
      }, 100);
    } else {
      if (pagesContainerElement)
        pagesContainerElement.classList.remove("without-animation");
    }

    const roundedLayoutIndex = pagesContainerElement
      ? Math.max(
          Math.min(
            Math.round(
              (pagesContainerElement.scrollLeft /
                pagesContainerElement.scrollWidth) *
                layoutPageElements.length
            ),
            layoutPageElements.length - 1
          ),
          0
        )
      : 0;
    if (Number.isFinite(roundedLayoutIndex)) {
      currentLayoutIndex = roundedLayoutIndex;
      if (pagesContainerElement)
        pagesContainerElement.dispatchEvent(
          new CustomEvent("change", { detail: { index: currentLayoutIndex } })
        );
    }

    if (0 === scrollWidthCache && pagesContainerElement)
      scrollWidthCache = pagesContainerElement.scrollWidth;
    const scrollProgressRatio = pagesContainerElement
      ? pagesContainerElement.scrollLeft / scrollWidthCache
      : 0;
    const responsiveMode = window.innerWidth < 768 ? "mobile" : "desktop";

    layoutPageElements.forEach((pageEl, pageIndex) => {
      pageEl.classList.toggle("selected", pageIndex === currentLayoutIndex);
      pageEl.querySelectorAll("img").forEach((imgEl, imgIndex) => {
        imgEl.classList.toggle(
          "current",
          imgIndex === currentColorIndicesPerLayout[pageIndex]
        );
      });

      const [
        scrollStart,
        scrollEnd,
        transformStart,
        transformMid,
        transformEnd,
      ] = LAYOUT_TRANSFORM_RANGES[responsiveMode][pageIndex];
      const midPoint = scrollStart + 0.5 * (scrollEnd - scrollStart);
      const currentTransformVW =
        scrollProgressRatio < midPoint
          ? interpolate(
              scrollProgressRatio,
              scrollStart,
              midPoint,
              transformStart,
              transformMid
            )
          : interpolate(
              scrollProgressRatio,
              midPoint,
              scrollEnd,
              transformMid,
              transformEnd
            );
      const imageContainer = pageEl.querySelector(
        ".product-cards-layouts-pages-image"
      );
      if (imageContainer)
        imageContainer.style.transform = `translate3d(${currentTransformVW}vw, 0, 0)`;
    });

    layoutSelectorButtons.forEach((button, index) => {
      button.classList.toggle("selected", index === currentLayoutIndex);
    });
    colorSelectorDivs.forEach((div, index) => {
      div.classList.toggle(
        "selected",
        index === currentColorIndicesPerLayout[currentLayoutIndex]
      );
    });
    pageControlButtons.forEach((button, index) => {
      if (
        (index === 0 && currentLayoutIndex === 0) ||
        (index === 1 && currentLayoutIndex === layoutPageElements.length - 1)
      ) {
        button.disabled = true;
      } else {
        button.disabled = false;
      }
    });

    const totalCostElement = document.getElementById(
      "product-cards-footer-cost-total"
    );
    if (totalCostElement)
      totalCostElement.innerText = formatCurrency(
        MODEL_COST_DATA[currentLayoutIndex][0]
      );

    const monthlyCostElement = document.getElementById(
      "product-cards-footer-cost-monthly"
    );
    if (monthlyCostElement)
      monthlyCostElement.innerText = `${formatCurrency(
        MODEL_COST_DATA[currentLayoutIndex][1]
      )}/mo`;

    const configureLinkElement = document.getElementById(
      "product-cards-footer-configure-link"
    );
    if (configureLinkElement) {
      configureLinkElement.href = `/cta/#${
        COLOR_NAME_DATA[currentColorIndicesPerLayout[currentLayoutIndex]]
      }+${MODEL_NAME_DATA[currentLayoutIndex]}`;
    }

    const exploreLinkElement = document.getElementById(
      "product-cards-footer-explore-link"
    );
    if (exploreLinkElement) {
      exploreLinkElement.href = `/products/${MODEL_PATH_DATA[currentLayoutIndex]}`;
      const modelNameSpan = exploreLinkElement.querySelector(
        ".product-cards-footer-explore-link-model"
      );
      if (modelNameSpan)
        modelNameSpan.innerHTML = MODEL_DISPLAY_NAMES[currentLayoutIndex];
    }

    const summaryElement = document.getElementById(
      "product-cards-footer-summary"
    );
    if (summaryElement) {
      summaryElement.innerHTML = MODEL_SUMMARY_DATA[currentLayoutIndex];
    }
  }

  function handleScrollOrResizeEvent(event) {
    if (pagesContainerElement && event && "resize" === event.type) {
      scrollWidthCache = pagesContainerElement.scrollWidth;
    }
    cancelAnimationFrame(scrollAnimationFrameId);
    scrollAnimationFrameId = requestAnimationFrame(() => {
      updateDisplayStates(event && "resize" === event.type);
    });
  }

  layoutSelectorButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
      setActiveLayout(index);
    });
  });
  colorSelectorDivs.forEach((div, index) => {
    div.addEventListener("click", function () {
      currentColorIndicesPerLayout[currentLayoutIndex] = index;
      updateDisplayStates();
    });
  });
  pageControlButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
      switch (index) {
        case 0:
          setActiveLayout(currentLayoutIndex - 1);
          break;
        case 1:
          setActiveLayout(currentLayoutIndex + 1);
          break;
        default:
          return;
      }
      updateDisplayStates();
    });
  });

  if (pagesContainerElement) {
    pagesContainerElement.addEventListener("scroll", handleScrollOrResizeEvent);
    pagesContainerElement.addEventListener("click", function (event) {
      if (window.innerWidth < 768) return;
      if (event.clientX < 0.5 * pagesContainerElement.clientWidth) {
        if (currentLayoutIndex > 0) setActiveLayout(currentLayoutIndex - 1);
      } else if (event.clientX > 0.5 * pagesContainerElement.clientWidth) {
        if (currentLayoutIndex < layoutPageElements.length - 1)
          setActiveLayout(currentLayoutIndex + 1);
      }
    });
    pagesContainerElement.addEventListener("mousemove", function (event) {
      if (pageControlButtons[0])
        pageControlButtons[0].classList.toggle(
          "highlight",
          event.clientX < 0.5 * pagesContainerElement.clientWidth
        );
      if (pageControlButtons[1])
        pageControlButtons[1].classList.toggle(
          "highlight",
          event.clientX > 0.5 * pagesContainerElement.clientWidth
        );
      if (event.clientX < 0.5 * pagesContainerElement.clientWidth) {
        pagesContainerElement.style.cursor =
          currentLayoutIndex === 0 ? null : "pointer";
      } else if (event.clientX > 0.5 * pagesContainerElement.clientWidth) {
        pagesContainerElement.style.cursor =
          currentLayoutIndex === layoutPageElements.length - 1
            ? null
            : "pointer";
      }
    });
    pagesContainerElement.addEventListener("mouseleave", function () {
      pageControlButtons.forEach((button) => {
        button.classList.remove("highlight");
      });
    });
  }

  window.addEventListener("resize", handleScrollOrResizeEvent, {
    passive: true,
  });
  document.addEventListener("scroll", handleScrollOrResizeEvent, {
    passive: true,
  });

  setActiveLayout(1, true);

  return function cleanupThreeSizes() {
    window.removeEventListener("scroll", handleScrollOrResizeEvent);
    window.removeEventListener("resize", handleScrollOrResizeEvent);
    cancelAnimationFrame(scrollAnimationFrameId);
    clearTimeout(animationClassTimeoutId);
  };
};

// --- Section: Gallery ---

// App.createGallery function
window.App.createGallery = function () {
  const galleryContainer = document.querySelector(".gallery");
  if (null === galleryContainer) return () => {}; // Return a no-op cleanup if element not found

  // Prevent re-initialization if already processed (important for createDestroy pattern)
  if (galleryContainer.dataset.init === "true") return () => {};
  galleryContainer.dataset.init = "true"; // Mark as initialized

  const radioInputs = Array.from(document.querySelectorAll(".gallery input"));
  let resetTimeoutId;

  function resetToDefaultSelection() {
    galleryContainer.classList.remove("active");
    radioInputs.forEach((input, index) => (input.checked = index === 1));
  }

  function handleGalleryClick(event) {
    clearTimeout(resetTimeoutId);
    resetTimeoutId = setTimeout(resetToDefaultSelection, 10000);
    galleryContainer.classList.add("active");

    if ("INPUT" === event.target.nodeName || "UL" === event.target.nodeName)
      return;

    let currentIndex = radioInputs.findIndex((input) => input.checked === true);
    currentIndex = currentIndex < radioInputs.length - 1 ? currentIndex + 1 : 0;
    radioInputs.forEach(
      (input, index) => (input.checked = index === currentIndex)
    );
  }

  galleryContainer.addEventListener("click", handleGalleryClick);

  // Return a cleanup function
  return function cleanupGallery() {
    galleryContainer.removeEventListener("click", handleGalleryClick);
    clearTimeout(resetTimeoutId);
    delete galleryContainer.dataset.init; // Clean up the init flag
  };
};

// --- Section: Slider Cards  ---

// App.createSliderCards function
window.App.createSliderCards = function () {
  const cards = document.querySelectorAll(".slider-carousel-cards-card");
  if (cards.length === 0) return () => {}; // Return no-op cleanup if no cards

  const cleanupFns = []; // Store individual card cleanup for later

  cards.forEach((cardElement, index, allCards) => {
    // Prevent re-initialization for each card
    if (cardElement.dataset.init === "true") return;
    cardElement.dataset.init = "true";

    function handleCardClick(event) {
      const isMobile = window.innerWidth < 768;
      const { left: cardLeft, width: cardWidth } =
        cardElement.getBoundingClientRect();
      const cardCenter = Math.round(cardLeft + 0.5 * cardWidth);
      const distanceToViewportCenter = 0.5 * window.innerWidth - cardCenter;

      if (
        !isMobile &&
        distanceToViewportCenter > 0 &&
        Math.abs(distanceToViewportCenter) > 0.5 * cardWidth
      ) {
        // Scroll left
        event.stopPropagation();
        cardElement.parentElement.classList.add("scrolling");
        cardElement.parentElement.scrollTo({
          left: cardElement.parentElement.scrollLeft - cardElement.clientWidth,
          behavior: "smooth",
        });
      } else if (
        !isMobile &&
        distanceToViewportCenter < 0 &&
        Math.abs(distanceToViewportCenter) > 0.5 * cardWidth
      ) {
        // Scroll right
        event.stopPropagation();
        cardElement.parentElement.classList.add("scrolling");
        cardElement.parentElement.scrollTo({
          left: cardElement.parentElement.scrollLeft + cardElement.clientWidth,
          behavior: "smooth",
        });
      } else if (
        event.target.classList.contains("slider-carousel-cards-card-images")
      ) {
        // Image navigation
        event.preventDefault();
        event.stopPropagation();
        const radioInputs = cardElement.querySelectorAll("input");
        const currentCheckedIndex = Array.from(radioInputs).findIndex(
          (input) => input.checked
        );
        const nextCheckedIndex =
          currentCheckedIndex + 1 > radioInputs.length - 1
            ? 0
            : currentCheckedIndex + 1;
        radioInputs.forEach((input, inputIndex) => {
          input.checked = inputIndex === nextCheckedIndex;
        });
      }

      setTimeout(function () {
        // Update 'current' class on all cards after scroll/click
        allCards.forEach((cElem) => {
          const { left: cLeft, width: cWidth } = cElem.getBoundingClientRect();
          const cCenter = Math.round(cLeft + 0.5 * cWidth);
          const distToCenter = 0.5 * window.innerWidth - cCenter;
          cElem.parentElement.classList.remove("scrolling");
          cElem.classList.toggle(
            "current",
            Math.abs(distToCenter) < 0.5 * cWidth
          );
        });
      }, 600);
    }

    cardElement.addEventListener("click", handleCardClick);
    cleanupFns.push(() => {
      cardElement.removeEventListener("click", handleCardClick);
      delete cardElement.dataset.init;
    });
  });

  return function cleanupInteriorPhotoCards() {
    cleanupFns.forEach((fn) => fn());
  };
};

// --- createDestroy function ---
// Place this function definition before it's used.
function createDestroy(
  routeRegex,
  asyncSetupFunction,
  destroyEventName = "router:will-change-url"
) {
  let cleanupFunction; // This will store the cleanup function returned by asyncSetupFunction

  // Function to initialize the component/feature
  async function initializeComponent(event) {
    // Only initialize if the route matches
    const currentUrl = event?.detail?.url || location.pathname;
    if (routeRegex.test(currentUrl)) {
      if (cleanupFunction) {
        // If there's an existing cleanup function, run it first
        cleanupFunction();
        cleanupFunction = undefined;
      }
      // Call the async setup function and store its cleanup result
      cleanupFunction = await asyncSetupFunction();
    }
  }

  // Function to handle route changes and potentially initialize the component
  function handleRouteChange(event) {
    const currentUrl = event?.detail?.url || location.pathname;
    if (routeRegex.test(currentUrl)) {
      // Use setTimeout to ensure DOM is ready and prevent blocking router
      setTimeout(() => initializeComponent(event), 0);
    }
  }

  // Event listener for initial page load
  document.addEventListener("DOMContentLoaded", handleRouteChange);

  // Event listener for content updates (after router injects new HTML)
  window.addEventListener("router:did-update-content", handleRouteChange);

  // Event listener to destroy the component before a URL change
  window.addEventListener(destroyEventName, function destroyComponent() {
    if (cleanupFunction) {
      cleanupFunction();
      cleanupFunction = undefined; // Clear the reference
    }
  });
}

// --- Helper Functions ---
function dispatchRouterEvent(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
}

function normalizePath(rawPath = null) {
  let path = rawPath || location.pathname;
  path = path.split("#")[0];
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, path.length - 1);
  }
  if (path === "") return "/";
  if (path === "/" && PAGES_METADATA["/home"] && !PAGES_METADATA["/"])
    return "/home";
  return path;
}

function applyCurrentPageStylesAndMeta() {
  const pathForMeta = normalizePath(location.pathname);
  let currentPageMeta = PAGES_METADATA[pathForMeta] || PAGES_METADATA["/"];

  if (currentPageMeta) {
    if (themeColorMetaTag && currentPageMeta.theme_color) {
      themeColorMetaTag.setAttribute("content", currentPageMeta.theme_color);
    }
    if (
      currentPageMeta.class_names &&
      typeof currentPageMeta.class_names === "string"
    ) {
      const classList = currentPageMeta.class_names.split(" ").filter(Boolean);
      if (classList.length > 0) document.body.classList.add(...classList);
    }
    if (
      navElement &&
      typeof currentPageMeta.navigation_inverted === "boolean"
    ) {
      navElement.classList.toggle(
        "inverted",
        currentPageMeta.navigation_inverted
      );
    }
  }
  previousRoutePathForStyles = pathForMeta;
}

function removePreviousPageStyles() {
  const pathToRemoveStylesFor = previousRoutePathForStyles;
  if (!pathToRemoveStylesFor) return;

  const prevPageMeta = PAGES_METADATA[pathToRemoveStylesFor];
  if (prevPageMeta) {
    if (
      prevPageMeta.class_names &&
      typeof prevPageMeta.class_names === "string"
    ) {
      const classList = prevPageMeta.class_names.split(" ").filter(Boolean);
      classList.forEach((cls) => {
        if (
          !["interactive", "complete", "segue", "no-javascript"].includes(cls)
        ) {
          document.body.classList.remove(cls);
        }
      });
    }
  }
}

function updateNavigationLinkStates(targetPath) {
  if (!navElement) return;
  const normalizedPath = normalizePath(targetPath);
  navLinksForCurrentClass.forEach((link) => {
    const linkPath = normalizePath(link.getAttribute("href"));
    const isActive =
      linkPath === normalizedPath ||
      (linkPath === "/" && normalizedPath === "/home") ||
      (linkPath === "/home" && normalizedPath === "/");
    link.classList.toggle("current", isActive);
  });
  const isConfiguratorRoute = normalizedPath.startsWith(
    "/products/configure-placeholder"
  );
  navElement.classList.toggle("transition-configurator", isConfiguratorRoute);
}

function findLinkTargetFromEvent(clickedElement) {
  if (!clickedElement) return null;
  let anchorElement = clickedElement.closest("a");
  if (anchorElement) {
    const hrefValue = anchorElement.getAttribute("href");
    if (
      hrefValue &&
      hrefValue.startsWith("/") &&
      !anchorElement.getAttribute("download") &&
      anchorElement.getAttribute("target") !== "_blank"
    ) {
      return anchorElement;
    }
  }
  return null;
}

// --- Main Navigation Function ---
async function navigateTo(
  targetPath,
  shouldUpdateHistory = true,
  animateTransition = true
) {
  const normalizedTargetPath = normalizePath(targetPath);

  if (isNavigating) {
    if (normalizedTargetPath === navigatingToPathCurrently) {
      return;
    }

    pendingNavigationArgs = [
      targetPath,
      shouldUpdateHistory,
      animateTransition,
    ];
    return;
  }

  if (
    shouldUpdateHistory &&
    normalizedTargetPath === currentPath &&
    pageContainerElement.innerHTML.trim() !== ""
  ) {
    dispatchRouterEvent("router:scroll-top", { url: targetPath });
    if (window.scrollY !== 0) window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const targetPageMeta =
    PAGES_METADATA[normalizedTargetPath] || PAGES_METADATA["/"];
  if (!targetPageMeta) {
    console.error("No metadata for path:", normalizedTargetPath);
    if (pageContainerElement)
      pageContainerElement.innerHTML = "<h2>Page Not Found</h2>";
    return;
  }

  isNavigating = true;
  navigatingToPathCurrently = normalizedTargetPath;

  mainContentElement.classList.add("segue");
  document.body.classList.add("segue");

  const previousPageMetaForAnim = PAGES_METADATA[currentPath] || {
    position: 0,
  };

  const animationDirection =
    (previousPageMetaForAnim.position || 0) < (targetPageMeta.position || 0)
      ? -1
      : 1;
  const outAnimationClass = animationDirection < 0 ? "out-pop" : "out";
  const inAnimationClass = animationDirection < 0 ? "in-pop" : "in";

  dispatchRouterEvent("router:will-change-url", { url: targetPath });
  updateNavigationLinkStates(normalizedTargetPath);

  if (
    currentPath === "/products" &&
    navElement &&
    targetPageMeta.navigation_inverted !== undefined
  ) {
    setTimeout(() => {
      navElement.classList.toggle(
        "inverted",
        targetPageMeta.navigation_inverted
      );
    }, 200);
  }

  if (
    animateTransition &&
    pageContainerElement &&
    pageContainerElement.innerHTML.trim() !== ""
  ) {
    await new Promise((resolve) => {
      mainContentElement.classList.remove("in", "in-pop", "out", "out-pop");
      mainContentElement.addEventListener("animationend", resolve, {
        once: true,
      });
      mainContentElement.classList.add(outAnimationClass);
    });
  }

  let pageHtmlContent = "";
  const cachedContent = pageDataCache[normalizedTargetPath];

  if (cachedContent && cachedContent !== "pending") {
    pageHtmlContent = cachedContent;
  } else {
    try {
      if (!targetPageMeta.partial)
        throw new Error(`No partial defined for ${normalizedTargetPath}`);
      pageDataCache[normalizedTargetPath] = "pending";
      const response = await fetch(targetPageMeta.partial);
      if (!response.ok)
        throw new Error(
          `Fetch failed: ${response.statusText} for ${targetPageMeta.partial}`
        );
      pageHtmlContent = await response.text();
      pageDataCache[normalizedTargetPath] = pageHtmlContent;
    } catch (error) {
      console.error("Failed to load page content for", targetPath, error);
      pageHtmlContent = "<h2>Error Loading Page</h2>";
      delete pageDataCache[normalizedTargetPath];
    }
  }

  removePreviousPageStyles();

  if (pageContainerElement) pageContainerElement.innerHTML = pageHtmlContent;
  window.scrollTo({ top: 0 });

  if (shouldUpdateHistory && currentPath !== normalizedTargetPath) {
    history.pushState(
      { path: normalizedTargetPath, position: targetPageMeta.position },
      targetPageMeta.title,
      targetPath
    );
  }

  applyCurrentPageStylesAndMeta();

  currentPath = normalizedTargetPath;

  if (targetPageMeta) document.title = targetPageMeta.title;

  dispatchRouterEvent("router:did-update-content", { url: targetPath });

  if (animateTransition) {
    mainContentElement.classList.remove(outAnimationClass);
    mainContentElement.classList.remove("in", "in-pop");
    void mainContentElement.offsetWidth;
    mainContentElement.classList.add(inAnimationClass);
    await new Promise((resolve) => {
      mainContentElement.addEventListener(
        "animationend",
        () => {
          mainContentElement.classList.remove(inAnimationClass);
          resolve();
        },
        { once: true }
      );
    });
  } else {
    mainContentElement.classList.remove("in", "in-pop", "out", "out-pop");
  }

  dispatchRouterEvent("router:did-change-url", { url: targetPath });
  currentPath = normalizedTargetPath;

  isNavigating = false;
  navigatingToPathCurrently = null;

  clearTimeout(segueTimeoutId);

  segueTimeoutId = setTimeout(() => {
    mainContentElement.classList.remove("segue");
    document.body.classList.remove("segue");
    document.body.style.backgroundColor = "";
  }, 10);

  if (pendingNavigationArgs.length > 0) {
    const nextNavArgs = pendingNavigationArgs.shift();
    setTimeout(() => navigateTo(...nextNavArgs), 0);
  }

  if (pendingNavigationArgs.length > 0) {
    const argsForNextCall = pendingNavigationArgs;
    pendingNavigationArgs = [];

    setTimeout(() => navigateTo(...argsForNextCall), 0);
  }
}

function setupMainNavigationBehavior() {
  if (!navElement) return;
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      navElement.classList.toggle("collapsed");
      document.body.style.overflow = navElement.classList.contains("collapsed")
        ? ""
        : "hidden";
    });
  }
  window.addEventListener("router:will-change-url", () => {
    if (
      navElement &&
      !navElement.classList.contains("collapsed") &&
      window.innerWidth <= 768
    ) {
      navElement.classList.add("collapsed");
      document.body.style.overflow = "";
    }
  });
  const modelsMenuItemLink = navElement.querySelector(
    "a.backyard-menu-item-models"
  );
  if (modelsMenuItemLink) {
    const modelsMenuItemLi = modelsMenuItemLink.closest("li.main-nav-item");
    const hoverTarget = modelsMenuItemLi || modelsMenuItemLink;
    hoverTarget.addEventListener("mouseenter", () => {
      if (
        !window.matchMedia("(pointer: coarse)").matches &&
        window.innerWidth > 768
      ) {
        navElement.classList.add("main-nav-hover-models");
      }
    });
  }
  navElement.addEventListener("mouseleave", () => {
    if (!window.matchMedia("(pointer: coarse)").matches) {
      navElement.classList.remove("main-nav-hover-models");
    }
  });
  const otherTopLevelLinks = navElement.querySelectorAll(
    ".main-nav-list-container > ul > li > a:not(.backyard-menu-item-models)"
  );
  otherTopLevelLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      if (
        !window.matchMedia("(pointer: coarse)").matches &&
        window.innerWidth > 768
      ) {
        navElement.classList.remove("main-nav-hover-models");
      }
    });
  });
  navElement.addEventListener("touchmove", function (event) {
    event.preventDefault();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("no-javascript");
  document.body.classList.add("interactive");
  document.documentElement.classList.add("loaded");

  setupMainNavigationBehavior();

  const initialPath = normalizePath(location.pathname);
  currentPath = initialPath;
  previousRoutePathForStyles = initialPath;

  const initialPageMeta = PAGES_METADATA[initialPath] || PAGES_METADATA["/"];

  applyCurrentPageStylesAndMeta();
  updateNavigationLinkStates(initialPath);

  if (initialPageMeta) {
    history.replaceState(
      { path: initialPath, position: initialPageMeta.position },
      initialPageMeta.title,
      location.href
    );
  }

  if (pageContainerElement.innerHTML.trim() === "") {
    navigateTo(initialPath, false, false);
  } else {
    window.dispatchEvent(
      new CustomEvent("router:did-update-content", {
        detail: { url: initialPath },
      })
    );
    window.dispatchEvent(
      new CustomEvent("router:did-change-url", { detail: { url: initialPath } })
    );
    if (mainContentElement) {
      mainContentElement.classList.remove(
        "in",
        "in-pop",
        "out",
        "out-pop",
        "segue"
      );
    }
    document.body.classList.remove("segue");
  }

  // Page specific initializers

  // createDestroy(/^(\/|\/home|\/home\/)$/, function setupAppHomepage() {
  //   const cleanupFunctions = [
  //     App.createProductCards(),
  //     App.createSliderCards(),
  //     App.createALotCanHappenCards(),
  //     App.createBentoCardDetails(),
  //     App.createGallery(),
  //   ];
  //   return function () {
  //     cleanupFunctions.forEach((cleanup) => {
  //       if (typeof cleanup === "function") cleanup();
  //     });
  //   };
  // });

  // When URL matches /, /home, or /home/
  createDestroy(
    /^(\/|\/home|\/home\/)$/,
    function setupProductCardsComponents() {
      return App.createProductCards();
    }
  );

  createDestroy(/^(\/|\/home|\/home\/)$/, function setupGalleryComponents() {
    return App.createGallery();
  });

  createDestroy(
    /^(\/|\/home|\/home\/)$/,
    function setupSliderCardsComponents() {
      return App.createSliderCards();
    }
  );

  createDestroy(/.*/, function setupPagingIndicators() {
    document.body
      .querySelectorAll(".paging-indicator")
      .forEach((indicatorElement) => {
        if (undefined === indicatorElement.dataset.init) {
          (function initializePagingIndicator(element) {
            element.dataset.init = !0;
            const listItems = element.querySelectorAll("li");
            if (element.dataset.changeEmmiterSelector) {
              document
                .querySelector(element.dataset.changeEmmiterSelector)
                .addEventListener("change", function (event) {
                  listItems.forEach((li, index) => {
                    li.classList.toggle(
                      "paging-indicator-current",
                      index === event.detail.index
                    );
                  });
                });
            }
            if (element.dataset.scrollElementSelector) {
              let lastActiveIndex;
              document
                .querySelector(element.dataset.scrollElementSelector)
                .addEventListener("scroll", function (event) {
                  const currentIndex = Math.round(
                    (event.target.scrollLeft / event.target.scrollWidth) *
                      listItems.length
                  );
                  if (lastActiveIndex !== currentIndex) {
                    lastActiveIndex = currentIndex;
                    listItems.forEach((li, index) => {
                      li.classList.toggle(
                        "paging-indicator-current",
                        index === currentIndex
                      );
                    });
                  }
                });
            }
          })(indicatorElement);
        }
      });
    return function () {};
  });

  document.body.addEventListener("click", (event) => {
    const anchor = findLinkTargetFromEvent(event.target);
    if (anchor) {
      if (toggleButton && toggleButton.contains(event.target)) return;
      event.preventDefault();
      const targetPath = new URL(anchor.href, location.origin).pathname;
      navigateTo(targetPath, true, true);
    }
  });

  window.addEventListener("popstate", (event) => {
    const path = event.state
      ? event.state.path
      : normalizePath(location.pathname);
    navigateTo(path, false, false);
  });

  window.addEventListener("mousemove", (event) => {
    const linkElement = findLinkTargetFromEvent(event.target);
    if (linkElement) {
      (async function preloadPageData(path) {
        const normalizedPath = normalizePath(path);
        if (!pageDataCache[normalizedPath]) {
          pageDataCache[normalizedPath] = "pending";
          try {
            const pageMetaForPreload = PAGES_METADATA[normalizedPath];
            if (pageMetaForPreload && pageMetaForPreload.partial) {
              const response = await fetch(pageMetaForPreload.partial);
              if (response.ok) {
                pageDataCache[normalizedPath] = await response.text();
              } else {
                delete pageDataCache[normalizedPath];
              }
            } else {
              delete pageDataCache[normalizedPath];
            }
          } catch (error) {
            console.warn("failed to preload page", path, error);
            delete pageDataCache[normalizedPath];
          }
        }
      })(linkElement.getAttribute("href"));
    }
  });
});

window.addEventListener("load", () => {
  document.body.classList.add("complete");
});
