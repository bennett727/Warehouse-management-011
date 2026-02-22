/**
 * 触摸操作指令
 * 为移动端提供触摸手势支持
 */

// 触摸状态
const touchState = {
  startX: 0,
  startY: 0,
  startTime: 0,
  isMoving: false,
};

// 默认配置
const defaultOptions = {
  // 长按时间阈值（毫秒）
  longPressTime: 500,
  // 滑动距离阈值（像素）
  swipeThreshold: 50,
  // 双击时间间隔（毫秒）
  doubleTapInterval: 300,
};

/**
 * 触摸指令
 * 支持：tap, longpress, swipeleft, swiperight, swipeup, swipedown, doubletap, pinch
 */
export const vTouch = {
  mounted(el, binding) {
    const { value, modifiers } = binding;
    const options = { ...defaultOptions, ...value?.options };

    // 存储事件处理器以便卸载
    el._touchHandlers = {};

    // 触摸开始
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchState.startX = touch.clientX;
      touchState.startY = touch.clientY;
      touchState.startTime = Date.now();
      touchState.isMoving = false;

      // 长按检测
      if (modifiers.longpress || value?.onLongPress) {
        el._touchHandlers.longPressTimer = setTimeout(() => {
          if (!touchState.isMoving && value?.onLongPress) {
            value.onLongPress(e);
            el._touchHandlers.isLongPress = true;
          }
        }, options.longPressTime);
      }
    };

    // 触摸移动
    const handleTouchMove = (e) => {
      touchState.isMoving = true;

      // 取消长按
      if (el._touchHandlers.longPressTimer) {
        clearTimeout(el._touchHandlers.longPressTimer);
        el._touchHandlers.longPressTimer = null;
      }

      // 处理滑动
      if (modifiers.swipe || value?.onSwipe) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;

        if (value?.onSwipe) {
          value.onSwipe({
            deltaX,
            deltaY,
            direction: getSwipeDirection(deltaX, deltaY),
            event: e,
          });
        }
      }
    };

    // 触摸结束
    const handleTouchEnd = (e) => {
      const endTime = Date.now();
      const duration = endTime - touchState.startTime;

      // 取消长按定时器
      if (el._touchHandlers.longPressTimer) {
        clearTimeout(el._touchHandlers.longPressTimer);
        el._touchHandlers.longPressTimer = null;
      }

      // 如果是长按，不处理其他手势
      if (el._touchHandlers.isLongPress) {
        el._touchHandlers.isLongPress = false;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 点击/轻触
      if (distance < 10 && duration < options.longPressTime) {
        // 双击检测
        if (modifiers.doubletap || value?.onDoubleTap) {
          const now = Date.now();
          if (el._touchHandlers.lastTapTime && now - el._touchHandlers.lastTapTime < options.doubleTapInterval) {
            // 双击
            if (value?.onDoubleTap) {
              value.onDoubleTap(e);
            }
            el._touchHandlers.lastTapTime = null;
          } else {
            // 单击
            el._touchHandlers.lastTapTime = now;
            if (value?.onTap) {
              value.onTap(e);
            }
          }
        } else if (value?.onTap) {
          value.onTap(e);
        }
      }

      // 滑动检测
      if (distance >= options.swipeThreshold) {
        const direction = getSwipeDirection(deltaX, deltaY);

        // 通用滑动回调
        if (value?.onSwipeEnd) {
          value.onSwipeEnd({
            direction,
            deltaX,
            deltaY,
            distance,
            event: e,
          });
        }

        // 方向特定回调
        switch (direction) {
          case 'left':
            if (modifiers.swipeleft && value?.onSwipeLeft) {
              value.onSwipeLeft(e);
            }
            break;
          case 'right':
            if (modifiers.swiperight && value?.onSwipeRight) {
              value.onSwipeRight(e);
            }
            break;
          case 'up':
            if (modifiers.swipeup && value?.onSwipeUp) {
              value.onSwipeUp(e);
            }
            break;
          case 'down':
            if (modifiers.swipedown && value?.onSwipeDown) {
              value.onSwipeDown(e);
            }
            break;
        }
      }
    };

    // 阻止默认行为（如果需要）
    const handleTouchMovePrevent = (e) => {
      if (modifiers.prevent || value?.preventDefault) {
        e.preventDefault();
      }
    };

    // 绑定事件
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchmove', handleTouchMovePrevent, { passive: false });

    // 保存处理器引用
    el._touchHandlers = {
      start: handleTouchStart,
      move: handleTouchMove,
      end: handleTouchEnd,
      prevent: handleTouchMovePrevent,
    };
  },

  unmounted(el) {
    // 清理事件监听
    if (el._touchHandlers) {
      el.removeEventListener('touchstart', el._touchHandlers.start);
      el.removeEventListener('touchmove', el._touchHandlers.move);
      el.removeEventListener('touchend', el._touchHandlers.end);
      el.removeEventListener('touchmove', el._touchHandlers.prevent);

      // 清理定时器
      if (el._touchHandlers.longPressTimer) {
        clearTimeout(el._touchHandlers.longPressTimer);
      }

      el._touchHandlers = null;
    }
  },
};

/**
 * 获取滑动方向
 */
function getSwipeDirection(deltaX, deltaY) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX > absY) {
    return deltaX > 0 ? 'right' : 'left';
  }
  return deltaY > 0 ? 'down' : 'up';
}

/**
 * 拖拽指令
 */
export const vDrag = {
  mounted(el, binding) {
    const { value } = binding;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      el.style.cursor = 'grabbing';

      if (value?.onDragStart) {
        value.onDragStart({ x: currentX, y: currentY, event: e });
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) {
        return;
      }

      e.preventDefault();
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;

      // 应用边界限制
      if (value?.boundaries) {
        const { minX, maxX, minY, maxY } = value.boundaries;
        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));
      }

      el.style.transform = `translate(${currentX}px, ${currentY}px)`;

      if (value?.onDrag) {
        value.onDrag({ x: currentX, y: currentY, event: e });
      }
    };

    const handleMouseUp = (e) => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      el.style.cursor = 'grab';

      if (value?.onDragEnd) {
        value.onDragEnd({ x: currentX, y: currentY, event: e });
      }
    };

    // 触摸支持
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault(),
      });
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault(),
      });
    };

    const handleTouchEnd = (e) => {
      handleMouseUp(e);
    };

    // 初始化样式
    el.style.cursor = 'grab';
    el.style.userSelect = 'none';

    // 绑定事件
    el.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    // 保存处理器
    el._dragHandlers = {
      mouseDown: handleMouseDown,
      mouseMove: handleMouseMove,
      mouseUp: handleMouseUp,
      touchStart: handleTouchStart,
      touchMove: handleTouchMove,
      touchEnd: handleTouchEnd,
    };
  },

  unmounted(el) {
    if (el._dragHandlers) {
      el.removeEventListener('mousedown', el._dragHandlers.mouseDown);
      document.removeEventListener('mousemove', el._dragHandlers.mouseMove);
      document.removeEventListener('mouseup', el._dragHandlers.mouseUp);

      el.removeEventListener('touchstart', el._dragHandlers.touchStart);
      el.removeEventListener('touchmove', el._dragHandlers.touchMove);
      el.removeEventListener('touchend', el._dragHandlers.touchEnd);

      el._dragHandlers = null;
    }
  },
};

/**
 * 下拉刷新指令
 */
export const vPullRefresh = {
  mounted(el, binding) {
    const { value } = binding;
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let isRefreshing = false;

    const threshold = value?.threshold || 80;
    const maxDistance = value?.maxDistance || 100;

    // 创建刷新指示器
    const indicator = document.createElement('div');
    indicator.className = 'pull-refresh-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: -${maxDistance}px;
      left: 0;
      right: 0;
      height: ${maxDistance}px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    `;
    indicator.innerHTML = `
      <div class="refresh-spinner">
        <span>下拉刷新</span>
      </div>
    `;

    el.style.position = 'relative';
    el.style.overflow = 'visible';
    el.insertBefore(indicator, el.firstChild);

    const handleTouchStart = (e) => {
      if (isRefreshing) {
        return;
      }
      if (el.scrollTop > 0) {
        return;
      }

      startY = e.touches[0].clientY;
      isPulling = true;
    };

    const handleTouchMove = (e) => {
      if (!isPulling || isRefreshing) {
        return;
      }

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        e.preventDefault();

        // 阻尼效果
        const distance = Math.min(deltaY * 0.5, maxDistance);
        indicator.style.transform = `translateY(${distance}px)`;

        // 更新提示文字
        const spinner = indicator.querySelector('.refresh-spinner span');
        if (spinner) {
          spinner.textContent = distance >= threshold ? '释放刷新' : '下拉刷新';
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling || isRefreshing) {
        return;
      }

      isPulling = false;
      const deltaY = currentY - startY;

      if (deltaY >= threshold) {
        // 触发刷新
        isRefreshing = true;
        indicator.style.transform = `translateY(${threshold}px)`;
        indicator.querySelector('.refresh-spinner span').textContent = '刷新中...';

        if (value?.onRefresh) {
          Promise.resolve(value.onRefresh()).finally(() => {
            isRefreshing = false;
            indicator.style.transform = 'translateY(0)';
          });
        }
      } else {
        // 回弹
        indicator.style.transform = 'translateY(0)';
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    el._pullRefreshHandlers = {
      start: handleTouchStart,
      move: handleTouchMove,
      end: handleTouchEnd,
      indicator,
    };
  },

  unmounted(el) {
    if (el._pullRefreshHandlers) {
      el.removeEventListener('touchstart', el._pullRefreshHandlers.start);
      el.removeEventListener('touchmove', el._pullRefreshHandlers.move);
      el.removeEventListener('touchend', el._pullRefreshHandlers.end);

      if (el._pullRefreshHandlers.indicator) {
        el._pullRefreshHandlers.indicator.remove();
      }

      el._pullRefreshHandlers = null;
    }
  },
};

// 导出所有指令
export default {
  touch: vTouch,
  drag: vDrag,
  pullRefresh: vPullRefresh,
};
