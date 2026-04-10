# 北京地图打卡小程序

这是一个基于微信云开发实现的地图打卡小程序首版，核心能力包括：

- 默认展示北京城六区内置景点，并按行政区统计打卡进度
- 支持搜索北京饭店并完成打卡
- 支持为景点或饭店保存备注
- 提供“我的打卡”页面查看已打卡记录

## 目录说明

- `miniprogram/`：小程序前端代码
- `cloudfunctions/`：云函数代码
- `tests/`：最小必要的 Node 级自动化测试
- `docs/deploy-and-init.md`：数据库初始化与上线说明
- `.plan/`：本次实施计划记录

## 主要云函数

- `seedScenicSpots`：初始化北京城六区景点数据
- `getHomeMapData`：返回首页地图、进度、已打卡饭店数据
- `searchPlaces`：搜索景点和饭店
- `upsertCheckin`：新增或更新打卡记录
- `getMyCheckins`：获取当前用户打卡列表

## 快速开始

1. 在微信开发者工具打开本项目
2. 确认云环境为 `cloud1-4gn7jrqa537ee147`
3. 上传并部署上述 5 个云函数
4. 执行一次 `seedScenicSpots`
5. 返回首页开始联调

详细步骤见 [docs/deploy-and-init.md](./docs/deploy-and-init.md)。
