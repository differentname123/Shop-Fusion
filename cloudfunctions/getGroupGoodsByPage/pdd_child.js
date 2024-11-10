const fs = require('fs');
const path = require('path');

// 读取并执行 pdd.js 文件
try {
  console.log = () => {};
  const jsFilePath = path.resolve(__dirname, 'pdd.js');
  const jsCode = fs.readFileSync(jsFilePath, 'utf-8');
  
  // 使用 Function 构造函数来执行
  const script = new Function(jsCode + '; return antigain();');
  
  // 执行并发送结果给父进程
  const result = script();
  process.send({ result });
} catch (err) {
  process.send({ error: err.message });
  process.exit(1); // 错误时以非 0 状态码退出
}