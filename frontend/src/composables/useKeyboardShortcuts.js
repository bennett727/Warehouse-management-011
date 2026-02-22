import { onMounted, onUnmounted } from 'vue';

const keyBindings = new Map();

const normalizeKey = (event) => {
  const key = event.key.toLowerCase();
  const modifiers = [];

  if (event.ctrlKey || event.metaKey) {
    modifiers.push('ctrl');
  }
  if (event.altKey) {
    modifiers.push('alt');
  }
  if (event.shiftKey) {
    modifiers.push('shift');
  }

  return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
};

const handleKeyDown = (event) => {
  const normalizedKey = normalizeKey(event);
  const handler = keyBindings.get(normalizedKey);

  if (handler) {
    event.preventDefault();
    handler(event);
  }
};

const registerShortcut = (key, handler) => {
  const normalizedKey = key.toLowerCase();
  keyBindings.set(normalizedKey, handler);

  if (keyBindings.size === 1) {
    window.addEventListener('keydown', handleKeyDown);
  }
};

const unregisterShortcut = (key) => {
  const normalizedKey = key.toLowerCase();
  keyBindings.delete(normalizedKey);

  if (keyBindings.size === 0) {
    window.removeEventListener('keydown', handleKeyDown);
  }
};

export function useKeyboardShortcuts(shortcuts) {
  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    for (const shortcut of shortcuts) {
      if (
        shortcut.key.toLowerCase() === key &&
        !!shortcut.ctrl === ctrl &&
        !!shortcut.shift === shift &&
        !!shortcut.alt === alt
      ) {
        event.preventDefault();
        shortcut.handler(event);
        return;
      }
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}

export const useShortcut = (shortcuts) => {
  const normalizedShortcuts = {};

  Object.entries(shortcuts).forEach(([key, handler]) => {
    const normalizedKey = key.toLowerCase();
    normalizedShortcuts[normalizedKey] = handler;
    registerShortcut(normalizedKey, handler);
  });

  onUnmounted(() => {
    Object.keys(normalizedShortcuts).forEach((key) => {
      unregisterShortcut(key);
    });
  });

  return {
    registerShortcut,
    unregisterShortcut,
  };
};

export const commonShortcuts = {
  save: {
    key: 's',
    ctrl: true,
    description: '保存',
    handler: () => {
      const saveButton = document.querySelector('[data-action="save"]');
      if (saveButton) {
        saveButton.click();
      }
    },
  },
  cancel: {
    key: 'Escape',
    ctrl: false,
    description: '取消/关闭',
    handler: () => {
      const cancelButton = document.querySelector('[data-action="cancel"]');
      const closeButton = document.querySelector('[data-action="close"]');
      if (cancelButton) {
        cancelButton.click();
      } else if (closeButton) {
        closeButton.click();
      }
    },
  },
  search: {
    key: 'f',
    ctrl: true,
    description: '搜索',
    handler: () => {
      const searchInput = document.querySelector(
        'input[type="search"], input[placeholder*="搜索"], input[placeholder*="查询"]'
      );
      if (searchInput) {
        searchInput.focus();
      }
    },
  },
  refresh: {
    key: 'r',
    ctrl: true,
    description: '刷新',
    handler: () => {
      const refreshButton = document.querySelector('[data-action="refresh"]');
      if (refreshButton) {
        refreshButton.click();
      }
    },
  },
  add: {
    key: 'n',
    ctrl: true,
    description: '新增',
    handler: () => {
      const addButton = document.querySelector('[data-action="add"]');
      if (addButton) {
        addButton.click();
      }
    },
  },
  edit: {
    key: 'e',
    ctrl: true,
    description: '编辑',
    handler: () => {
      const editButton = document.querySelector('[data-action="edit"]');
      if (editButton) {
        editButton.click();
      }
    },
  },
  delete: {
    key: 'Delete',
    ctrl: false,
    description: '删除',
    handler: () => {
      const deleteButton = document.querySelector('[data-action="delete"]');
      if (deleteButton) {
        deleteButton.click();
      }
    },
  },
  submit: {
    key: 'Enter',
    ctrl: false,
    description: '提交',
    handler: () => {
      const submitButton = document.querySelector('button[type="submit"], [data-action="submit"]');
      if (submitButton) {
        submitButton.click();
      }
    },
  },
  export: {
    key: 'e',
    ctrl: true,
    shift: true,
    description: '导出',
    handler: () => {
      const exportButton = document.querySelector('[data-action="export"]');
      if (exportButton) {
        exportButton.click();
      }
    },
  },
  import: {
    key: 'i',
    ctrl: true,
    shift: true,
    description: '导入',
    handler: () => {
      const importButton = document.querySelector('[data-action="import"]');
      if (importButton) {
        importButton.click();
      }
    },
  },
  selectAll: {
    key: 'a',
    ctrl: true,
    description: '全选',
    handler: () => {
      const selectAllCheckbox = document.querySelector('input[type="checkbox"][data-action="select-all"]');
      if (selectAllCheckbox) {
        selectAllCheckbox.click();
      }
    },
  },
};

export const shortcutDescriptions = {
  'ctrl+s': '保存',
  'ctrl+n': '新建',
  'ctrl+f': '搜索',
  'ctrl+r': '刷新',
  escape: '关闭/取消',
  'ctrl+shift+s': '批量保存',
  delete: '删除',
  'ctrl+a': '全选',
};

export function useCommonShortcuts() {
  useKeyboardShortcuts(Object.values(commonShortcuts));
}

export function getShortcutDescription(shortcut) {
  if (typeof shortcut === 'string') {
    return shortcutDescriptions[shortcut.toLowerCase()] || shortcut;
  }

  const parts = [];
  if (shortcut.ctrl) {
    parts.push('Ctrl');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}

export const getShortcutText = (key) => {
  return shortcutDescriptions[key.toLowerCase()] || key;
};

export default {
  useKeyboardShortcuts,
  useShortcut,
  useCommonShortcuts,
  commonShortcuts,
  shortcutDescriptions,
  getShortcutDescription,
  getShortcutText,
  registerShortcut,
  unregisterShortcut,
};
