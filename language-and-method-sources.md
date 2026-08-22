# 地区语言与命书来源依据

## 地区语言默认

语言默认只读取边缘代理提供的**国家代码**，按 `cf-ipcountry`、`x-vercel-ip-country`、`x-geo-country` 的顺序处理；不解析、不返回、也不持久化 `X-Forwarded-For`、`CF-Connecting-IP` 或任何原始 IP。用户登录后的手动语言选择会优先于地区默认。

| 规则 | 说明 | 依据 |
| --- | --- | --- |
| 边缘国家代码 | Cloudflare 的 `CF-IPCountry` 为来源国家的两位代码；Vercel 提供 `X-Vercel-IP-Country`。 | [Cloudflare HTTP headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/)；[Vercel Geo-IP headers](https://vercel.com/kb/guide/geo-ip-headers-geolocation-vercel-functions) |
| 不使用 XFF | `X-Forwarded-For` 暴露隐私敏感 IP；除受信任代理链外，不能作为可信安全输入。 | [MDN：X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For) |
| 地区映射 | 台湾、香港、澳门默认繁体；中国大陆、新加坡默认简体；其余可判定国家默认英语；没有地区头时回退 `Accept-Language`，最终回退简体中文。 | 项目实现规则 |

## 命书当前计算来源

四柱与节气采用 `lunar-javascript`，出生经度按相对东经 120 度每度 4 分钟作地方时差修正，并采用晚子时（23:00 起）换日。月卷开放由服务端按 `Asia/Shanghai` 的当前时间取得下一节，再决定未来农历月范围。月卷正文为按农历月份组织的固定编辑提示；它引用日柱、校正后时刻和下一节作为阅读坐标，但**没有使用事件预测、医疗、财务或人生决策模型**。

参考：[lunar-javascript](https://github.com/6tail/lunar-javascript)
