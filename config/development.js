module.exports = {
  env: 'development', //环境名称
  port: 3000,         //服务端口号
  security: {
    tokenLife: 3600   // s
  },
  mongodb: {
    uri: 'mongodb://backend:backend@localhost:27017/backend',    //数据库地址
  },
  redis_url:'',       //redis地址
  redis_port: ''      //redis端口号
}