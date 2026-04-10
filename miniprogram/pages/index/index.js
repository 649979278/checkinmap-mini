const {
  getHomeMapData,
  searchPlaces,
  upsertCheckin,
} = require("../../services/cloud");
const { createMapMarkers } = require("../../utils/marker");
const { DISTRICT_LIST } = require("../../constants/districts");

const BEIJING_CENTER = {
  latitude: 39.9042,
  longitude: 116.4074,
};

Page({
  /**
   * 返回首页初始数据。
   * @returns {Object} 首页初始状态。
   */
  data: {
    latitude: BEIJING_CENTER.latitude,
    longitude: BEIJING_CENTER.longitude,
    scale: 10,
    districtProgress: DISTRICT_LIST.map((item) => ({
      ...item,
      checkedCount: 0,
      totalCount: 0,
    })),
    markers: [],
    scenicSpots: [],
    checkedRestaurants: [],
    searchKeyword: "",
    searchResults: [],
    pageLoading: true,
    searchLoading: false,
    saving: false,
    loadError: "",
    searchError: "",
    showPlaceSheet: false,
    selectedPlace: null,
    noteDraft: "",
    legendItems: [
      { key: "park", label: "公园", className: "legend-dot park" },
      { key: "landmark", label: "名胜/区域", className: "legend-dot landmark" },
      { key: "checked", label: "已打卡", className: "legend-dot checked" },
    ],
  },

  /**
   * 页面展示时加载首页数据。
   */
  onShow() {
    this.loadHomeData();
  },

  /**
   * 拉取首页地图、进度和已打卡饭店。
   * @returns {Promise<void>} 加载结果。
   */
  async loadHomeData() {
    this.setData({
      pageLoading: true,
      loadError: "",
    });

    try {
      const result = await getHomeMapData();
      const scenicSpots = result.scenicSpots || [];
      const checkedRestaurants = result.checkedRestaurants || [];
      const { markers, markerMap } = createMapMarkers(
        scenicSpots,
        checkedRestaurants
      );

      this.markerMap = markerMap;
      this.setData({
        scenicSpots,
        checkedRestaurants,
        districtProgress: result.progress || this.data.districtProgress,
        markers,
        pageLoading: false,
      });
    } catch (error) {
      this.markerMap = {};
      this.setData({
        pageLoading: false,
        loadError:
          error && error.message
            ? error.message
            : "首页数据加载失败，请确认云函数已部署。",
      });
    }
  },

  /**
   * 更新搜索输入值。
   * @param {Object} event 输入事件。
   */
  onSearchInput(event) {
    this.setData({
      searchKeyword: event.detail.value,
    });
  },

  /**
   * 搜索景点和饭店。
   * @returns {Promise<void>} 搜索结果。
   */
  async onSearchConfirm() {
    const keyword = (this.data.searchKeyword || "").trim();
    if (!keyword) {
      this.setData({
        searchResults: [],
        searchError: "",
      });
      return;
    }

    this.setData({
      searchLoading: true,
      searchError: "",
    });

    try {
      const result = await searchPlaces(keyword);
      const scenicResults = (result.scenicResults || []).map((item) => ({
        ...item,
        subtitle: [item.placeType === "restaurant" ? "饭店" : "景点", item.district]
          .filter(Boolean)
          .join(" · "),
      }));
      const restaurantResults = (result.restaurantResults || []).map((item) => ({
        ...item,
        subtitle: [item.placeType === "restaurant" ? "饭店" : "景点", item.district]
          .filter(Boolean)
          .join(" · "),
      }));

      this.setData({
        searchLoading: false,
        searchResults: scenicResults.concat(restaurantResults),
        searchError: result.restaurantError || "",
      });
    } catch (error) {
      this.setData({
        searchLoading: false,
        searchError:
          error && error.message ? error.message : "搜索失败，请稍后重试。",
      });
    }
  },

  /**
   * 清空搜索内容与结果。
   */
  onClearSearch() {
    this.setData({
      searchKeyword: "",
      searchResults: [],
      searchError: "",
    });
  },

  /**
   * 点击搜索结果后打开详情弹层。
   * @param {Object} event 点击事件。
   */
  onTapSearchResult(event) {
    const place = this.data.searchResults[event.currentTarget.dataset.index];
    if (place) {
      this.openPlaceSheet(place);
    }
  },

  /**
   * 点击地图 marker 后打开详情弹层。
   * @param {Object} event 地图事件。
   */
  onTapMarker(event) {
    const place = this.markerMap && this.markerMap[event.detail.markerId];
    if (place) {
      this.openPlaceSheet(place);
    }
  },

  /**
   * 打开地点详情弹层。
   * @param {Object} place 地点对象。
   */
  openPlaceSheet(place) {
    this.setData({
      selectedPlace: place,
      noteDraft: place.note || "",
      showPlaceSheet: true,
    });
  },

  /**
   * 关闭地点详情弹层。
   */
  closePlaceSheet() {
    this.setData({
      showPlaceSheet: false,
      selectedPlace: null,
      noteDraft: "",
    });
  },

  /**
   * 更新备注输入值。
   * @param {Object} event 输入事件。
   */
  onNoteInput(event) {
    this.setData({
      noteDraft: event.detail.value,
    });
  },

  /**
   * 提交当前地点打卡。
   * @returns {Promise<void>} 保存结果。
   */
  async onSubmitCheckin() {
    const selectedPlace = this.data.selectedPlace;
    if (!selectedPlace) {
      return;
    }

    this.setData({
      saving: true,
    });

    try {
      await upsertCheckin({
        placeId: selectedPlace.placeId || selectedPlace._id,
        placeType: selectedPlace.placeType || "scenic",
        placeName: selectedPlace.placeName || selectedPlace.name,
        district: selectedPlace.district || "",
        location: selectedPlace.location,
        note: (this.data.noteDraft || "").trim(),
        source:
          selectedPlace.source ||
          (selectedPlace.placeType === "restaurant"
            ? "tencent_map"
            : "scenic_spots"),
      });

      wx.showToast({
        title: "打卡成功",
        icon: "success",
      });
      this.closePlaceSheet();
      this.setData({
        searchKeyword: "",
        searchResults: [],
      });
      await this.loadHomeData();
    } catch (error) {
      wx.showToast({
        title: "打卡失败",
        icon: "none",
      });
    } finally {
      this.setData({
        saving: false,
      });
    }
  },

  /**
   * 跳转到我的打卡页。
   */
  onNavigateToCheckins() {
    wx.navigateTo({
      url: "/pages/checkins/index",
    });
  },
});
