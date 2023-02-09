import axios from 'axios';
axios.defaults.timeout = 5000;
axios.defaults.baseURL = '';
const token = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : '';

// 获取微信小程序http请求需要的access_token
function getToken() {
	let token = localStorage.getItem('access_token') || ''
	if(token == ''){
		// console.log('查询了')
		return new Promise((resolve, reject) => {
		    axios({
		        url:'/cgi-bin/token', 
		        method:'get',
		        params:{
					"grant_type":"client_credential",
					"appid":"wx2f26909d14cc3fdf",
					"secret":"38c58982e4da1b7b89ba2d4b5ca7b1b9"
				},
		    }).then(response => {
				// console.log(response.data)
				// 缓存到本地一份
				localStorage.setItem('access_token',JSON.stringify({value:response.data.access_token,time:new Date().getTime()}))
		        resolve(response.data.access_token);
		    }).catch(err => {
		        reject(err);
		    });
		});
	}else{
			let {value,time} = JSON.parse(token);
			if(new Date().getTime() - time > 7200*1000){
				// console.log('过期了')
				return new Promise((resolve, reject) => {
				    axios({
				        url:'/cgi-bin/token', 
				        method:'get',
				        params:{
							"grant_type":"client_credential",
							"appid":"wx2f26909d14cc3fdf",
							"secret":"38c58982e4da1b7b89ba2d4b5ca7b1b9"
						},
				    }).then(response => {
						// console.log(response.data)
						// 缓存到本地一份
						localStorage.setItem('access_token',{value:response.data.access_token,time:new Date().getSeconds()})
				        resolve(response.data.access_token);
				    }).catch(err => {
				        reject(err);
				    });
				});
			}else{
				// console.log('查到了')
				return value;
			}
	}
    
}


/**
 * 封装get方法
 * @param url
 * @param params
 */
function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios({
            url:url, 
            method:'get',
            baseURL:axios.defaults.baseURL,
            params,
            headers: { 'Authorization': token },//设置header信息
        }).then(response => {
            resolve(response.data);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
function post(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios({
            url, 
            method:'post',
            baseURL:axios.defaults.baseURL,
            data,
            headers: { 'Authorization': token },//设置header信息
        }).then(response => {
            resolve(response.data);
        }, err => {
            reject(err);
        });
    });
}


/**
 * 封装post 微信小程序云服务请求
 * @param url
 * @param data
 * @returns {Promise}
 */
function postYun(url, data = {}) {
	// console.log(data,url)
    return new Promise((resolve, reject) => {
        axios({
            url, 
            method:'post',
            data,
			headers:{'Content-Type':'application/json'}
        }).then(response => {
            resolve(response.data);
        }, err => {
            reject(err);
        });
    });
}
export { get, post,postYun,getToken}