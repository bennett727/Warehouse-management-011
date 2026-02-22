import { ref, onMounted, onUnmounted } from 'vue';

export function useResponsive() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0);
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 0);

  const breakpoints = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1200,
    xxl: 1600,
  };

  const isXs = computed(() => windowWidth.value < breakpoints.xs);
  const isSm = computed(() => windowWidth.value >= breakpoints.xs && windowWidth.value < breakpoints.sm);
  const isMd = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md);
  const isLg = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg);
  const isXl = computed(() => windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl);
  const isXxl = computed(() => windowWidth.value >= breakpoints.xl);

  const isMobile = computed(() => windowWidth.value < breakpoints.md);
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg);
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg);

  const currentBreakpoint = computed(() => {
    if (windowWidth.value < breakpoints.xs) {
      return 'xs';
    }
    if (windowWidth.value < breakpoints.sm) {
      return 'sm';
    }
    if (windowWidth.value < breakpoints.md) {
      return 'md';
    }
    if (windowWidth.value < breakpoints.lg) {
      return 'lg';
    }
    if (windowWidth.value < breakpoints.xl) {
      return 'xl';
    }
    return 'xxl';
  });

  const handleResize = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    windowWidth,
    windowHeight,
    breakpoints,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
  };
}

export function useMediaQuery(query) {
  const matches = ref(false);
  let mediaQuery = null;

  const updateMatches = () => {
    if (mediaQuery) {
      matches.value = mediaQuery.matches;
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', updateMatches);
      updateMatches();
    }
  });

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', updateMatches);
    }
  });

  return {
    matches,
  };
}

export function useTouch() {
  const isTouch = ref(false);
  const isMobile = ref(false);

  const checkTouch = () => {
    isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  onMounted(() => {
    checkTouch();
  });

  return {
    isTouch,
    isMobile,
  };
}

export function useOrientation() {
  const orientation = ref('portrait');
  const angle = ref(0);

  const handleOrientationChange = () => {
    if (window.screen && window.screen.orientation) {
      orientation.value = window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
      angle.value = window.screen.orientation.angle;
    } else {
      orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', handleOrientationChange);
      handleOrientationChange();
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('orientationchange', handleOrientationChange);
    }
  });

  return {
    orientation,
    angle,
  };
}

export function useViewport() {
  const width = ref(0);
  const height = ref(0);
  const scale = ref(1);

  const updateViewport = () => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      width.value = window.visualViewport.width;
      height.value = window.visualViewport.height;
      scale.value = window.visualViewport.scale;
    } else if (typeof window !== 'undefined') {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
      scale.value = 1;
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateViewport);
      window.addEventListener('scroll', updateViewport);
      updateViewport();
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('scroll', updateViewport);
    }
  });

  return {
    width,
    height,
    scale,
  };
}

export function useSafeArea() {
  const safeArea = ref({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const updateSafeArea = () => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      safeArea.value = {
        top: window.visualViewport.offsetTop || 0,
        right: 0,
        bottom: window.visualViewport.offsetBottom || 0,
        left: 0,
      };
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSafeArea);
      updateSafeArea();
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateSafeArea);
    }
  });

  return {
    safeArea,
    paddingTop: computed(() => safeArea.value.top),
    paddingBottom: computed(() => safeArea.value.bottom),
  };
}

export function usePixelRatio() {
  const pixelRatio = ref(1);
  const dpr = computed(() => pixelRatio.value);

  const updatePixelRatio = () => {
    if (typeof window !== 'undefined' && window.devicePixelRatio) {
      pixelRatio.value = window.devicePixelRatio;
    }
  };

  onMounted(() => {
    updatePixelRatio();
  });

  return {
    pixelRatio,
    dpr,
  };
}

export function useAdaptiveFontSize(baseFontSize = 16) {
  const fontSize = ref(baseFontSize);
  const scale = ref(1);

  const calculateFontSize = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const designWidth = 1920;
    const currentWidth = window.innerWidth;
    const calculatedScale = Math.min(Math.max(currentWidth / designWidth, 0.5), 1.5);

    scale.value = calculatedScale;
    fontSize.value = baseFontSize * calculatedScale;

    document.documentElement.style.fontSize = `${fontSize.value}px`;
  };

  onMounted(() => {
    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', calculateFontSize);
    }
  });

  return {
    fontSize,
    scale,
    calculateFontSize,
  };
}

export function useImageOptimization() {
  const getOptimalImageSrc = (src, options = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;

    if (!src) {
      return '';
    }

    const url = new URL(src, window.location.origin);
    const params = new URLSearchParams(url.search);

    if (width) {
      params.set('w', width);
    }
    if (height) {
      params.set('h', height);
    }
    params.set('q', quality);
    params.set('f', format);

    return `${url.origin}${url.pathname}?${params.toString()}`;
  };

  const getResponsiveImageSrc = (src, breakpoints) => {
    const { windowWidth } = useResponsive();

    for (const breakpoint of breakpoints) {
      if (windowWidth.value <= breakpoint.width) {
        return getOptimalImageSrc(src, {
          width: breakpoint.maxWidth,
          quality: breakpoint.quality || 80,
        });
      }
    }

    return getOptimalImageSrc(src, breakpoints[breakpoints.length - 1].options);
  };

  const preloadImage = (src) => {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  return {
    getOptimalImageSrc,
    getResponsiveImageSrc,
    preloadImage,
  };
}
