const { getMyCheckins } = require("../../services/cloud");
const { DISTRICT_LIST } = require("../../constants/districts");

Page({
  /**
   * 返回我的打卡页初始数据。
   * @returns {Object} 页面初始状态。
   */
  data: {
    loading: true,
    error: "",
    activeType: "all",
    districtOptions: ["全部行政区"].concat(DISTRICT_LIST.map((item) => item.name)),
    districtIndex: 0,
    allCheckins: [],
    displayedCheckins: [],
    typeTabs: [
      { key: "all", label: "全部" },
      { key: "scenic", label: "景点" },
      { key: "restaurant", label: "饭店" },
    ],
  },

  /**
   * 页面显示时加载打卡记录。
   */
  onShow() {
    this.loadCheckins();
  },

  /**
   * 拉取当前用户打卡记录。
   * @returns {Promise<void>} 加载结果。
   */
  async loadCheckins() {
    this.setData({
      loading: true,
      error: "",
    });

    try {
      const result = await getMyCheckins();
      this.setData({
        loading: false,
        allCheckins: result.checkins || [],
      });
      this.applyFilters();
    } catch (error) {
      this.setData({
        loading: false,
        error:
          error && error.message
            ? error.message
            : "打卡记录加载失败，请确认云函数已部署。",
      });
    }
  },

  /**
   * 切换类型筛选。
   * @param {Object} event 点击事件。
   */
  onChangeType(event) {
    this.setData({
      activeType: event.currentTarget.dataset.type,
    });
    this.applyFilters();
  },

  /**
   * 切换行政区筛选。
   * @param {Object} event picker 事件。
   */
  onDistrictChange(event) {
    this.setData({
      districtIndex: Number(event.detail.value),
    });
    this.applyFilters();
  },

  /**
   * 按当前条件筛选要展示的打卡记录。
   */
  applyFilters() {
    const selectedDistrict = this.data.districtOptions[this.data.districtIndex];
    const displayedCheckins = this.data.allCheckins.filter((item) => {
      const typeMatched =
        this.data.activeType === "all" || item.placeType === this.data.activeType;
      const districtMatched =
        selectedDistrict === "全部行政区" || item.district === selectedDistrict;
      return typeMatched && districtMatched;
    });

    this.setData({
      displayedCheckins,
    });
  },
});
