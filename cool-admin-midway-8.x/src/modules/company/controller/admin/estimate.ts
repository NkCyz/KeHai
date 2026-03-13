import { BaseController } from '@cool-midway/core';
import { Body, Controller, Post } from '@midwayjs/core';
import axios from 'axios';

/**
 * Dify 代理接口
 */
@Controller('/agent/dify')
export class AgentDifyController extends BaseController {
  /**
   * 物料查询 - 转发到 Dify
   * 前端请求: POST /agent/dify/material
   * 请求体: { "brand": "ABB", "material_name": "0型圈", "material_classification": "其他配件" }
   * 转发到: http://localhost/triggers/webhook-debug/KznW5Ktg9l-8vkArxH6qtWI0
   */
  @Post('/material')
  async materialQuery(@Body() body: any) {
    // Dify webhook 地址
    const difyUrl = 'http://localhost/v1/workflows/run';

    console.info('物料查询请求转发到 Dify:', difyUrl, body);

    try {
      // 使用 axios 发送 POST 请求到 Dify
      
      const payload = {
        inputs: body,
        user: '2782129289@qq.com',
        response_mode: 'blocking',
      };
      const response = await axios.post(difyUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + 'app-3a1MdWXqUKBoBW2SVpwYDGsJ',
        },
        // 设置超时时间（毫秒）
        timeout: 30000,
      });

      // 返回 Dify 的响应数据
      console.info('Dify 响应:', response.data);
      if (response.data.data['outputs']['output'] != '输入为空') {
        return response.data;
      }
    } catch (error: any) {
      console.error('物料查询请求失败:', error.message);

      // 如果有响应数据，返回错误信息
      if (error.response) {
        return error.response.data;
      }

      // 如果没有响应数据，返回通用错误
      return { error: error.message || '请求失败' };
    }
  }

  /**
   * 客户操作 - 转发到 Dify
   * 前端请求: POST /agent/dify/customer
   * 请求体: { "user_name": "嘉禾啤酒", "op": "visit" }
   * 转发到: http://localhost/triggers/webhook-debug/ayTgM1MYdDx0fk3QDsaLzjka
   */
  @Post('/customer')
  async customerOperation(@Body() body: any) {
    // Dify webhook 地址
    const difyUrl =
      'http://localhost/triggers/webhook-debug/ayTgM1MYdDx0fk3QDsaLzjka';

    console.info('客户操作请求转发到 Dify:', difyUrl, body);

    try {
      // 使用 axios 发送 POST 请求到 Dify
      const response = await axios.post(difyUrl, body, {
        headers: {
          'Content-Type': 'application/json',
        },
        // 设置超时时间（毫秒）
        timeout: 30000,
      });

      // 返回 Dify 的响应数据
      return response.data;
    } catch (error: any) {
      console.error('客户操作请求失败:', error.message);

      // 如果有响应数据，返回错误信息
      if (error.response) {
        return error.response.data;
      }

      // 如果没有响应数据，返回通用错误
      return { error: error.message || '请求失败' };
    }
  }
}
