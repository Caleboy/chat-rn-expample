/**
 * Created by zhangsong on 2018/3/7.
 */


/**
 * urlencode url 參數
 * @param obj
 * @returns {string}
 * @update 20171216 1251 zhangsong
 */
function urlEnCode(obj) {
  let param = '';
  for (let [key, value] of Object.entries(obj)) {
    if (param.length === 0) {
      param = key + '=' + value;
    } else {
      param += '&' + key + '=' + value;
    }
  }
  return encodeURI(param);
}

export default function (url, { method = 'GET', body = {} } = {
  method: 'GET',
  body: {}
}, header = {}) {
  const init = {
    'method': method,
    'mode': "cors",
  };
  const headers = Object.assign({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }, header);
  init.headers = headers;
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded' || method.toUpperCase() === 'GET' && typeof body === 'object') {
    let text = urlEnCode(body);
    if (url.includes('?')) {
      url += '&' + text;
    } else {
      url += '?' + text;
    }
  } else {
    init.body = JSON.stringify(body);
  }
  return fetch(url, init).then((response)=> {
    if (response.ok) {
      return response.json();
    }else{
      throw new Error({code:response.status, message: response.text });
    }
  });
};
