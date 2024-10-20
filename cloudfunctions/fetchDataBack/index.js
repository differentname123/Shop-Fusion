// cloudfunctions/fetchData/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

// 随机生成 User-Agent 的函数
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

exports.main = async (event, context) => {
  const { key_code } = event;

  // 构建初始请求 URL
  const baseUrl = `https://file-link.pinduoduo.com/${key_code}`;

  // 调用 httpbin 服务获取云函数的 IP 地址
  const response = await axios.get('https://httpbin.org/ip');

  // 打印返回的 IP 地址
  console.log('Cloud Function IP Address:', response.data.origin);
  
  // 默认的请求头信息
  const defaultHeaders = {
    'Connection': 'keep-alive',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'user-agent': 'Apifox/1.0.0 (https://apifox.com)',
    'cookie': 'api_uid=CkjpJmcCQXoqewBVtILWAg==; webp=1; PDDAccessToken=5EEZYVALTALZ2XFZE3KCELJWKT3ZHT3MXUD3NEVHXKVBGJUAMF2A120570b;pdd_user_id=4365968471; Path=/; Expires=Sun, 19 Jan 2025 11:08:19 GMT, pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; Path=/; Expires=Sun, 19 Jan 2025 11:08:19 GMT, pdd_vds=gaLxNbPtIlIxOyNNiGyEPGmlOInsNIayNtmbOGNyIsnxnoONNwLNoOmbibEb; Expires=Fri, 18-Oct-24 11:08:19 GMT; Path=/;',
  };
  

  console.log(`Starting fetchData with key_code: ${key_code}`);

  try {
    // 1. 发起初始请求，获取重定向后的 URL
    let response = await axios.get(baseUrl, {
      headers: defaultHeaders,
      maxRedirects: 0, // 禁止自动跟随重定向
      validateStatus: (status) => status >= 200 && status < 400, // 处理 3xx 状态码
    });

    console.log(`Initial request: Status Code ${response.status}`);

    // 获取重定向的目标 URL
    if ([301, 302, 307, 308].includes(response.status)) {
      const redirectedUrl = response.headers['location'];
      console.log(`Redirected to: ${redirectedUrl}`);
      if (!redirectedUrl) {
        console.error('Redirected URL not found in headers.');
        return { status: 'error', message: 'Redirected URL not found in headers.' };
      }

      // 2. 访问重定向后的 URL
      response = await axios.get(redirectedUrl, {
        headers: defaultHeaders,
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      console.log(`Redirected request: Status Code ${response.status}`);

      console.log("Request Information:");
      console.log(`Request URL: ${response.config.url}`);
      console.log("Request Headers:", response.config.headers);
      console.log("Response Information:");
      console.log(`Response Status: ${response.status}`);
      console.log("Response Headers:", response.headers);
      console.log("Response Data:", response.data);

      // 3. 解析网页，找到最终 URL
      if (response.status === 200) {
        const data = response.data;
        const finalMatch = data.match(/location\.replace\(['"](pincard_ask\.html[^'"]+)['"]/);
        if (finalMatch) {
          const finalUrl = `https://mobile.yangkeduo.com/${finalMatch[1]}`;
          console.log(`Found final URL: ${finalUrl}`);

          // 4. 访问最终的 `pincard_ask.html` 页面
          response = await axios.get(finalUrl, {
            headers: defaultHeaders,
          });

          console.log(`Final URL request: Status Code ${response.status}`);

          // 5. 提取 window.rawData 数据
          const rawDataMatch = response.data.match(/window\.rawData\s*=\s*({.*?});/);
          if (rawDataMatch) {
            const rawDataStr = rawDataMatch[1];
            try {
              const rawData = JSON.parse(rawDataStr);
              console.log('Successfully parsed rawData.');
              return { status: 'success', data: rawData };
            } catch (err) {
              console.error('JSON parsing failed:', err);
              return { status: 'error', message: 'JSON parsing failed.' };
            }
          } else {
            console.error('rawData not found in the final response.');
            return { status: 'error', message: 'rawData not found in the final response.' };
          }
        } else {
          console.error('Final URL not found in redirected response.');
          return { status: 'error', message: 'Final URL not found in redirected response.' };
        }
      } else {
        console.error(`Unexpected status code when accessing redirected URL: ${response.status}`);
        return { status: 'error', message: `Unexpected status code when accessing redirected URL: ${response.status}` };
      }
    } else {
      console.error(`Unexpected status code in initial request: ${response.status}`);
      return { status: 'error', message: `Unexpected status code in initial request: ${response.status}` };
    }
  } catch (error) {
    console.error('Request failed:', error);
    return { status: 'error', message: `Request failed: ${error.message}` };
  }
};