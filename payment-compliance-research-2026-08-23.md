# 年度命书支付与数字内容合规研究记录

本记录仅用于产品配置和条款起草前的事实核对，不构成法律或税务意见；启用跨境收款前应由所在地会计师和律师复核。

## 当前免费版本与未来自动收款的强制条件

当前版本的基础排盘、年度命书、主题阅读与报告导出均免费开放，网站内不设自动结账，也不展示可直接付款的链接。人工深度解读、合作或赞助仅通过私有联系申请由服务方后续确认。

如未来恢复自动收款，实施前必须同时取得服务商针对年度命书与人工深度解读业务的**书面准入**；确认可销售的国家或地区；完成商户主体、KYC、受益所有人和结算账户审核；确认税费承担与结算币种；并确认退款、争议和数字内容即时交付的适用权限。任何一项未确认时，均不得启用结账链接、webhook 或客户端付费权益。

| 议题 | 已核对事实 | 对观历的产品含义 | 来源 |
|---|---|---|---|
| 欧盟数字内容撤回权 | 欧盟消费者权利规则涵盖线上数字内容和数字服务；远程合同通常有 14 天撤回权，但在特定条件下，非有形载体数字内容于履行开始后可适用例外。交易前还应清晰说明身份、联系方式、产品主要特征、支付和履行条件。 | 结账页不应使用“概不退款”；应在开始即时交付前提供单独、未预勾选的明确同意和确认，并保留法定权利提示。 | [EUR-Lex：消费者信息与撤回权](https://eur-lex.europa.eu/EN/legal-content/summary/consumer-information-right-of-withdrawal-and-other-consumer-rights.html) |
| 中国线上数字商品退货 | 中国网络购买商品七日无理由退货规则对若干情形设有例外；官方解读列举了在线下载或消费者拆封的音像制品、计算机软件等数字化商品。 | 单次数字命书可设置“开始即时交付后通常不适用无理由退款”的透明条款，但不应排除内容无法交付、重复收费、重大技术故障或其他法定权利。 | [司法部：网络购买商品七日无理由退货暂行办法](https://www.moj.gov.cn/pub/sfbgw/flfggz/flfggzbmgz/201701/t20170124_145952.html) |
| Stripe Tax | Stripe Tax 使用产品税码计算税；仅在商家已在顾客所在地启用税务登记的辖区计算税。Stripe 的国家支持页说明其覆盖的税种、销售类型与地点各有差异。 | 不应在无经营主体所在地、税务登记和适用税码确认前自动承诺“全球含税价”；先以“税费在结账前显示”为准。 | [Stripe Tax codes](https://docs.stripe.com/tax/tax-codes)；[Stripe Tax supported countries](https://docs.stripe.com/tax/supported-countries) |
| 数字产品税 | Stripe 说明数字商品在 100 多个国家可能受税，非欧盟企业向欧盟销售数字商品或服务通常从首笔销售即需考虑税务征收责任。 | 若开放欧盟等跨境市场，建议在启用前评估商户自营 + Stripe Tax 与 Merchant of Record 的取舍。 | [Stripe Tax overview](https://stripe.com/tax) |
| 人民币和美元 | Stripe 文档列出 CNY 与 USD 为可支持的卡片呈现币种之一；支付币种、客户支付方式币种和商家结算币种可能不同且涉及转换。 | 人民币价格可设为 CNY 9.90；若美元“等值”，应设一个明确静态美元金额（例如按发布日换算后固定）或使用结账时本地化定价，不能把“9.9 元”等同写成“US$9.90”。 | [Stripe supported currencies](https://docs.stripe.com/currencies) |
| 多币种价格与退款 | Stripe 提供自适应、汇率报价与手动多币种价格；手动价格由商家承担汇率波动。被退款时，客户获退其实际支付币种和金额，商家结算余额可能受当时汇率影响。 | 若以 CNY 9.90 为基准，建议在 MVP 采用静态 USD 价格并在政策中说明；退款按客户实际支付的原币种、原金额处理。 | [Stripe localize prices](https://docs.stripe.com/payments/currencies/localize-prices)；[Stripe manual currency prices](https://docs.stripe.com/payments/checkout/localize-prices/manual-currency-prices) |
| 中国主体与海外 Stripe | Stripe 的全球可用性页面列出了香港、新加坡、美国和若干欧洲国家/地区，但未将中国大陆列为可直接开设支付账户的地区。Stripe 的异地开户说明要求：目标地区注册的法律实体、税号、可接收邮件的实体地址、电话号码、可用网站，以及目标地区的实体银行账户；其面向中国跨境页也说明支付服务由中国大陆以外的 Stripe 海外实体提供。 | 不应以中国大陆主体“直接注册海外 Stripe”作为默认路线。可行路线是：合规设立目标地区实体并满足其开户条件后使用 Stripe，或选择能合法接纳中国主体/其产品类别的 Merchant of Record；两者都应由跨境税务与公司顾问确认。 | [Stripe global availability](https://stripe.com/global)；[Stripe 异地开户要求](https://support.stripe.com/questions/requirements-to-open-a-stripe-account-in-another-country)；[Stripe 中国跨境页](https://stripe.com/lp/china-cross-border) |

## 建议的 MVP 条款结构

建议采用“购买前可预览、即时交付明确同意、有限但真实的支持性退款”而非“绝不退款”。应在结账前显示产品内容、价格与币种、税费、商户身份和联系渠道、服务时间与投诉入口；结账按钮旁用单独复选框确认即时交付与适用撤回规则，且不得预选。

可选的退款规则为：在未开启完整命书或未下载完整主题报告前，允许在 7 天内自助退款；一旦即时交付已开始，仍针对重复收费、未交付、无法修复的技术故障、内容与付款页重大不符，以及适用法律要求的情形提供退款或补救。人工深度解读服务应另设规则，例如预约前可退款、服务方取消则全额退款、已完成的人工服务按当地强制规则处理。

## 已确认的商业配置（待真实支付接入）

年度命书采用区域静态价格：**CNY ¥9.90、US$9.90、€9.90**。三者是独立定价档位，不宣称为实时汇率等值。退款采用“未开启完整内容时 7 天内可退款；开启即时交付后，对重复扣款、未交付、无法修复技术故障、重大描述不符和适用法律要求的情形退款或补救”。

## 全球 Merchant of Record 初步候选

Paddle 的官方中国页面明确表示服务对象包括“希望进入新市场的中国 SaaS 和应用公司”，并以 Merchant of Record 方式提供支付、订阅管理、开票、税务合规、反欺诈和争议/退款处理；其页面主张中国企业可在 200 余个市场进行端到端税务合规销售且无需为全球税务逐一注册。该表述支持将 Paddle 作为观历的首选待审核候选，但并不等于已获准入：年度命书是否被视为其可接受的数字产品、具体主体 KYC、结算、费率、退款权限和地区可用性，仍必须在申请/演示环节取得书面确认。

Paddle 与 FastSpring 均面向软件、SaaS、应用及数字商品的全球 MoR 市场。当前建议先由 Paddle 审核，因为其官方页面明确提及中国企业；若未获准入，再以 FastSpring 等服务商作为备选并逐一书面核实。来源：[Paddle China Payment Solutions](https://www.paddle.com/billing/china)；[Paddle：Merchant of Record](https://www.paddle.com/blog/what-is-merchant-of-record)。

## 命理核心的公开政策排除项

经官方政策核对，Paddle 禁止“clairvoyance, horoscopes, fortune-telling”等伪科学相关数字服务；2Checkout/Verifone 的禁止产品清单也明确列出“Fortune Tellers”与“Psychic or astrological readings/consults”。二者均不适合作为当前年度命书或人工深度解读的全球自动收款路径。

PayPro Global 公开说明其为软件、SaaS 和数字商品的国际转售方，但在可访问的公开页面中未找到对命理/占星/人工咨询服务的明确准入承诺，因此不能视为已获准候选；只有在其风控或商务团队就完整产品描述、目标市场、KYC 与结算方式作出书面批准后，才可评估接入。

来源：[Paddle 可接受使用政策](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle)；[2Checkout 禁止产品清单](https://www.2checkout.com/legal/acceptance/)；[PayPro Global 支持页](https://payprous.com/support/)。

Adyen 的官方受限/禁止业务政策也将“与伪科学相关的服务，例如 clairvoyance、horoscopes”列入需依据其准入规则评估的类别，并说明受限类别需要额外文件、且不同地区或支付方式可能有更严格限制。该公开政策没有构成对观历的准入批准，因而 Adyen 仅可作为“先提交产品说明并取得书面核保结论”的候选。

市场上存在面向灵性/命理业务的所谓“高风险商户账户”服务，但它们通常不是 Merchant of Record，且其商户实体、地区、结算、费率、保证金、拒付和卡组织规则差异很大。没有事先书面接受年度命书和人工解读这一完整业务描述时，不能把它们接入网站或向用户承诺可收款。

来源：[Adyen 受限与禁止产品/服务政策](https://www.adyen.com/legal/list-restricted-prohibited)。
