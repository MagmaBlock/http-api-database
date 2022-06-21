export default {
  // 启用此模式后将能够支持由 Nginx 反向代理的客户端 IP 显示，若程序未被 Nginx 反代可能会被有心人士伪造访问 IP
  nginxMode: true,
  // MySQL
  mysql: {
    host: "localhost",
    port: 3306,
    user: "HTTPDB",
    password: "password",
    database: "httpdb"
  },
}