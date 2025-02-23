'use strict';

class CalendarEvent {
  static toICS(json) {
    const data = JSON.parse(json);
    const handleBlock = (block, result = []) => {
      for (const [key, value] of Object.entries(block)) {
        if (typeof value === 'string') {
          const LINE_LENGTH = 80;
          if (value.length >= LINE_LENGTH) {
            result.push(`${key}:${value.substring(0, LINE_LENGTH).trim()}`);
            for (let i = LINE_LENGTH; i <= value.length; i += LINE_LENGTH - 1) {
              const nextLine = value.substring(i, i + LINE_LENGTH - 1).trim();
              if (!nextLine) continue;
              result.push(' ' + nextLine);
            }
            continue;
          }
          result.push(`${key}:${value}`);
          continue;
        }

        if (Array.isArray(value)) {
          for (const item of value) {
            result.push(`BEGIN:${key}`);
            const content = handleBlock(item);
            result.push(...content);
            result.push(`END:${key}`);
          }
          continue;
        }

        if (typeof value === 'object') {
          if (value.parameters && value.value) {
            const params = Object.entries(value.parameters)
              .map(([paramKey, paramValue]) => `${paramKey}=${paramValue}`)
              .join(';');
            result.push(`${key};${params}:${value.value}`);
            continue;
          }
          let line = key + ':';
          for (const [paramKey, paramValue] of Object.entries(value)) {
            line += `${paramKey}=${paramValue};`;
          }
          line = line.slice(0, -1);
          result.push(line);
          continue;
        }
      }
      return result;
    };

    const ics = handleBlock(data);
    return ics.join('\n');
  }
  static toJSON(ics) {
    const data = ics.split('\n');
    const handler = (acc, line) => {
      if (!line.trim()) return acc;
      if (!acc.tabulation) {
        acc.tabulation = line.length - line.trimStart().length;
      }
      let current = acc.result;
      for (const key of acc.path) {
        if (!current[key]) current[key] = [];
        current = current[key][current[key].length - 1];
      }
      const splitedLine = line.split(':');
      const spaces = line.length - line.trimStart().length;
      if (spaces !== acc.tabulation) {
        const lastKey = Object.keys(current).pop();
        current[lastKey] += ' ' + line.trim();
        return acc;
      }
      const key = splitedLine[0].trim();
      const value = splitedLine[1].trim();
      if (key.startsWith('BEGIN')) {
        if (!current[value]) current[value] = [];
        current[value].push({});
        acc.path.push(value);
        return acc;
      }
      if (key.startsWith('END')) {
        acc.path.pop();
        return acc;
      }
      if (key.includes(';')) {
        const [mainKey, ...params] = key.split(';');
        const parameters = Object.fromEntries(params.map((p) => p.split('=')));
        current[mainKey] = { parameters, value };
        return acc;
      }
      if (value.includes(';')) {
        for (const param of value.split(';')) {
          const [paramKey, paramValue] = param.split('=');
          if (!current[key]) current[key] = {};
          current[key][paramKey] = paramValue;
        }
        return acc;
      }
      current[key] = value;
      return acc;
    };

    const { result } = data.reduce(handler, {
      result: {},
      path: [],
      tabulation: null,
    });
    return JSON.stringify(result);
  }
}

module.exports = { CalendarEvent };
