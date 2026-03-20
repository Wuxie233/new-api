/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/

import i18next from 'i18next';

// ErrorCode → 用户友好消息映射
// 与后端 types/error.go 的 ErrorCode 常量保持同步
export const ERROR_CODE_MAP = {
  // 通用
  invalid_request: () => i18next.t('请求参数无效'),
  sensitive_words_detected: () => i18next.t('检测到敏感词，请修改后重试'),

  // Token/额度
  insufficient_user_quota: () => i18next.t('用户余额不足'),
  pre_consume_token_quota_failed: () =>
    i18next.t('令牌额度预扣费失败，余额可能不足'),

  // 渠道
  'channel:no_available_key': () => i18next.t('当前渠道无可用密钥'),
  'channel:invalid_key': () => i18next.t('渠道密钥无效或已过期'),
  'channel:response_time_exceeded': () =>
    i18next.t('渠道响应超时，请稍后重试'),
  'channel:model_mapped_error': () => i18next.t('模型映射错误'),
  'channel:param_override_invalid': () => i18next.t('渠道参数覆盖配置无效'),
  'channel:header_override_invalid': () =>
    i18next.t('渠道请求头覆盖配置无效'),
  'channel:aws_client_error': () => i18next.t('AWS 客户端错误'),

  // 请求/响应
  count_token_failed: () => i18next.t('计算 Token 数量失败'),
  model_price_error: () => i18next.t('模型定价配置错误'),
  invalid_api_type: () => i18next.t('API 类型无效'),
  do_request_failed: () => i18next.t('请求上游服务失败'),
  get_channel_failed: () => i18next.t('获取可用渠道失败，请稍后重试'),
  read_request_body_failed: () => i18next.t('读取请求内容失败'),
  convert_request_failed: () => i18next.t('转换请求格式失败'),
  access_denied: () => i18next.t('访问被拒绝，权限不足'),
  bad_request_body: () => i18next.t('请求体格式错误'),
  read_response_body_failed: () => i18next.t('读取上游响应失败'),
  bad_response_status_code: () => i18next.t('上游服务返回异常状态码'),
  bad_response: () => i18next.t('上游服务返回异常响应'),
  bad_response_body: () => i18next.t('上游响应内容格式异常'),
  empty_response: () => i18next.t('上游服务返回空响应'),
  model_not_found: () => i18next.t('请求的模型不存在或不可用'),
  prompt_blocked: () => i18next.t('输入内容被安全策略拦截'),
  aws_invoke_error: () => i18next.t('AWS 调用失败'),

  // 数据
  query_data_error: () => i18next.t('查询数据失败'),
  update_data_error: () => i18next.t('更新数据失败'),
};

/**
 * 根据错误码获取用户友好消息
 * @param {string} code - 错误码
 * @returns {string|null} 用户友好消息，无匹配时返回 null
 */
export function getErrorMessage(code) {
  const msgFn = ERROR_CODE_MAP[code];
  return msgFn ? msgFn() : null;
}
