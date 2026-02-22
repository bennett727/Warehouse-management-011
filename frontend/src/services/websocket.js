/**
 * WebSocket服务
 * @file: websocket.js
 * @description: 提供实时数据同步功能，支持业务记录自动更新
 * @author: Trae AI
 * @createTime: 2026-02-13
 * @version: 1.0
 */

import { ElMessage } from 'element-plus';

import { createLogger } from '@/utils/logger';

const logger = createLogger('WebSocketService');

/**
 * WebSocket连接状态
 */
export const WS_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

/**
 * WebSocket服务类
 */
export class WebSocketService {
  constructor() {
    this.ws = null;
    this.status = WS_STATUS.DISCONNECTED;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = 30000;
    this.messageQueue = [];
    this.isManualClose = false;
  }

  /**
   * 获取WebSocket服务单例
   */
  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * 连接WebSocket
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      logger.debug('WebSocket已连接');
      return;
    }

    this.isManualClose = false;
    this.status = WS_STATUS.CONNECTING;

    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
      logger.info('WebSocket连接初始化', { url: wsUrl });
    } catch (error) {
      logger.error('WebSocket连接失败', error);
      this.handleError(error);
    }
  }

  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    this.ws.onopen = () => {
      logger.info('WebSocket连接成功');
      this.status = WS_STATUS.CONNECTED;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.notifySubscribers('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        logger.debug('收到WebSocket消息', data);
        this.handleMessage(data);
      } catch (error) {
        logger.error('解析WebSocket消息失败', error);
      }
    };

    this.ws.onclose = (event) => {
      logger.info('WebSocket连接关闭', { code: event.code, reason: event.reason });
      this.status = WS_STATUS.DISCONNECTED;
      this.stopHeartbeat();

      if (!this.isManualClose) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      logger.error('WebSocket错误', error);
      this.status = WS_STATUS.ERROR;
      this.handleError(error);
    };
  }

  /**
   * 处理收到的消息
   */
  handleMessage(data) {
    const { type, payload, timestamp } = data;

    // 处理心跳响应
    if (type === 'pong') {
      return;
    }

    // 处理系统通知
    if (type === 'notification') {
      this.handleNotification(payload);
      return;
    }

    // 通知订阅者
    this.notifySubscribers(type, payload);
  }

  /**
   * 处理系统通知
   */
  handleNotification(payload) {
    const { level, message, title } = payload;

    switch (level) {
      case 'success':
        ElMessage.success(message);
        break;
      case 'warning':
        ElMessage.warning(message);
        break;
      case 'error':
        ElMessage.error(message);
        break;
      case 'info':
      default:
        ElMessage.info(message);
        break;
    }

    logger.info('收到系统通知', { title, message, level });
  }

  /**
   * 发送消息
   */
  send(type, payload) {
    const message = JSON.stringify({
      type,
      payload,
      timestamp: Date.now(),
    });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      logger.debug('发送WebSocket消息', { type, payload });
    } else {
      this.messageQueue.push(message);
      logger.debug('消息已加入队列', { type, payload });
    }
  }

  /**
   * 刷新消息队列
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(message);
    }
  }

  /**
   * 订阅消息
   */
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type).add(callback);

    logger.debug('订阅消息', { type });

    // 返回取消订阅函数
    return () => {
      this.unsubscribe(type, callback);
    };
  }

  /**
   * 取消订阅
   */
  unsubscribe(type, callback) {
    if (this.subscribers.has(type)) {
      this.subscribers.get(type).delete(callback);
      logger.debug('取消订阅', { type });
    }
  }

  /**
   * 通知订阅者
   */
  notifySubscribers(type, payload) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          logger.error('通知订阅者失败', error);
        }
      });
    }
  }

  /**
   * 开始心跳
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', { time: Date.now() });
    }, this.heartbeatTimeout);
  }

  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('WebSocket重连次数超过上限');
      this.status = WS_STATUS.ERROR;
      ElMessage.error('实时连接已断开，请刷新页面重试');
      return;
    }

    this.status = WS_STATUS.RECONNECTING;
    this.reconnectAttempts++;

    logger.info(`WebSocket尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * 处理错误
   */
  handleError(error) {
    logger.error('WebSocket错误', error);
    this.notifySubscribers('error', { error: error.message });
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.status = WS_STATUS.DISCONNECTED;
    logger.info('WebSocket手动断开连接');
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return this.status;
  }

  /**
   * 是否已连接
   */
  isConnected() {
    return this.status === WS_STATUS.CONNECTED;
  }
}

// 导出单例
export const wsService = WebSocketService.getInstance();

/**
 * 业务记录相关的WebSocket订阅钩子
 */
export function useBusinessRecordSubscription(recordType, options = {}) {
  const { onCreated, onUpdated, onDeleted, onError } = options;

  const subscribe = () => {
    const unsubscribes = [];

    if (onCreated) {
      unsubscribes.push(wsService.subscribe(`${recordType.toUpperCase()}_RECORD_CREATED`, onCreated));
    }

    if (onUpdated) {
      unsubscribes.push(wsService.subscribe(`${recordType.toUpperCase()}_RECORD_UPDATED`, onUpdated));
    }

    if (onDeleted) {
      unsubscribes.push(wsService.subscribe(`${recordType.toUpperCase()}_RECORD_DELETED`, onDeleted));
    }

    if (onError) {
      unsubscribes.push(wsService.subscribe('error', onError));
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  };

  return { subscribe };
}

export default wsService;
