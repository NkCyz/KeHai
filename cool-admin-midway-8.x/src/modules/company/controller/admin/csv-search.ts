import { BaseController } from '@cool-midway/core';
import { Body, Controller, Post } from '@midwayjs/core';
import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';

/**
 * CSV 客户数据查询接口
 */
@Controller('/agent/csv')
export class CsvSearchController extends BaseController {
  @Post('/search')
  async searchCustomer(@Body() body: { keyword: string }) {
    const { keyword } = body;

    if (!keyword) {
      return '没有对应信息';
    }

    const csvFilePath = path.join(
      process.cwd(),
      '..',
      'db',
      '客户-20260302-导出数据-处理版.csv'
    );

    try {
      if (!fs.existsSync(csvFilePath)) {
        return '没有对应信息';
      }

      const fileBuffer = fs.readFileSync(csvFilePath);
      const fileContent = iconv.decode(fileBuffer, 'gbk');

      const keywordBuffer = iconv.encode(keyword, 'gbk');

      const records = this.parseRecords(fileContent);

      const matchedRecords: string[] = [];

      for (const record of records) {
        const recordBuffer = iconv.encode(record, 'gbk');
        if (recordBuffer.includes(keywordBuffer)) {
          matchedRecords.push(record);
        }
      }

      if (matchedRecords.length === 0) {
        return '没有对应信息';
      }

      const result = matchedRecords
        .map((record, index) => {
          return `【${index + 1}】\n${record}`;
        })
        .join('\n\n');

      return result;
    } catch (error: any) {
      return '没有对应信息';
    }
  }

  private parseRecords(content: string): string[] {
    const records: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < content.length) {
      const char = content[i];

      if (char === '"') {
        if (inQuotes && content[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        current += char;
      } else if (!inQuotes && (char === '\n' || char === '\r')) {
        if (current.trim()) {
          records.push(current.trim());
        }
        current = '';
        if (char === '\r' && content[i + 1] === '\n') {
          i++;
        }
      } else {
        current += char;
      }
      i++;
    }

    if (current.trim()) {
      records.push(current.trim());
    }

    return records;
  }
}
