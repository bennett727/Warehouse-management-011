import { INVENTORY_API } from '@/constants/apiConstants';
import request from '@/utils/request';

const BASE_URL = INVENTORY_API.ALERT_CONFIG;

export function getAlertConfigList(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params,
  });
}

export function getAlertConfigDetail(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'get',
  });
}

export function createAlertConfig(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data,
  });
}

export function updateAlertConfig(id, data) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'put',
    data,
  });
}

export function deleteAlertConfig(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete',
  });
}

export function getAlertNotificationConfig() {
  return request({
    url: `${BASE_URL}/notification`,
    method: 'get',
  });
}

export function updateAlertNotificationConfig(data) {
  return request({
    url: `${BASE_URL}/notification`,
    method: 'put',
    data,
  });
}

export function getAlertTemplates() {
  return request({
    url: `${BASE_URL}/templates`,
    method: 'get',
  });
}

export function createAlertTemplate(data) {
  return request({
    url: `${BASE_URL}/templates`,
    method: 'post',
    data,
  });
}

export function updateAlertTemplate(id, data) {
  return request({
    url: `${BASE_URL}/templates/${id}`,
    method: 'put',
    data,
  });
}

export function deleteAlertTemplate(id) {
  return request({
    url: `${BASE_URL}/templates/${id}`,
    method: 'delete',
  });
}

export function applyAlertTemplate(templateId, params) {
  return request({
    url: `${BASE_URL}/templates/${templateId}/apply`,
    method: 'post',
    data: params,
  });
}

export function getAlertHistory(params) {
  return request({
    url: `${BASE_URL}/history`,
    method: 'get',
    params,
  });
}

export function getAlertStatistics(params) {
  return request({
    url: `${BASE_URL}/statistics`,
    method: 'get',
    params,
  });
}

export function testAlertNotification(configId) {
  return request({
    url: `${BASE_URL}/test-notification/${configId}`,
    method: 'post',
  });
}

export function batchUpdateAlertConfig(data) {
  return request({
    url: `${BASE_URL}/batch`,
    method: 'put',
    data,
  });
}
