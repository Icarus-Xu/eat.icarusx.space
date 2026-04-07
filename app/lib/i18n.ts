// Copyright (C) 2026 Icarus. All rights reserved.

export type Lang = 'en' | 'zh';

const en = {
  // date
  dateLocale: 'en-US' as string,

  // nav
  navHome: 'Home',
  navRecommend: 'Recommend',
  navAdd: 'Add',
  navSettings: 'Settings',
  navMap: 'Map',
  navGettingLocation: 'Getting location...',

  // location input
  locationPlaceholder: 'Enter your location...',
  locationGo: 'Go',
  locationNetworkError: 'Network error. Please try again.',
  locationNotFound: 'Address not found.',
  locationUseCurrentTitle: 'Use current location',

  // recommend
  recommendSetLocation: 'Location not set.',
  recommendLocateButton: 'Tap to enable location',
  recommendFinding: 'Finding nearby restaurants...',
  recommendFailed: 'Failed to load recommendations.',
  recommendRefresh: 'Refresh',
  recommendNoResults: (km: number) => `No restaurants found within ${km} km.`,

  // restaurant card (recommend page)
  cardLastVisited: 'Last visited',
  cardNotVisitedYet: 'Not visited yet',

  // restaurant list (add page)
  listLoading: 'Loading...',
  listEmpty: 'No restaurants added yet.',
  badgeVisited: 'Visited',
  badgeNotYet: 'Not yet',

  // collect form
  formSearchTab: 'Search by name',
  formLinkTab: 'Paste link',
  formRestaurantName: 'Restaurant name',
  formSearchPlaceholder: "e.g. Haidilao, McDonald's...",
  formSearch: 'Search',
  formNoResults: 'No restaurants found. Try a different name.',
  formNetworkError: 'Network error. Please try again.',
  formSearchFailed: 'Search failed.',
  formLookingUp: (provider: string) => `Looking up on ${provider}...`,
  formPasteLink: 'Paste a share link',
  formLinkPlaceholder: 'Amap or Baidu Maps share link...',
  formParse: 'Parse',
  formParseFailed: 'Failed to parse link.',
  formHaveYouBeen: 'Have you been there?',
  formVisited: 'Visited',
  formNotYet: 'Not yet',
  formDateVisited: 'Date visited',
  formRating: 'Rating',
  formNotes: 'Notes',
  formOptional: 'optional',
  formNotesPlaceholder: 'Recommended dishes, impressions...',
  formDuplicate: 'This restaurant is already in your collection.',
  formSaveFailed: 'Failed to save.',
  formSave: 'Save',
  formSavedSuccess: 'Saved successfully!',
  formAddAnother: 'Add another',

  // cross search modal
  crossNoMatch: (label: string) => `No match found on ${label}`,
  crossNoMatchDesc: (label: string) =>
    `This restaurant will be added without ${label} support. You can link it later.`,
  crossContinueAnyway: 'Continue anyway',
  crossSelectOn: (label: string) => `Select on ${label}`,
  crossMultipleMatches: 'Multiple matches found. Pick the correct one.',
  crossSkip: (label: string) => `Skip — add without ${label}`,

  // map provider names
  mapProviderAmapLabel: 'Amap',
  mapProviderBaiduLabel: 'Baidu Maps',

  // map provider modal
  mapProviderChoose: 'Choose your map provider',
  mapProviderDesc:
    'Controls search, navigation links, and location services. You can change it later in Settings.',
  mapProviderAmapDesc: 'Better coverage in smaller cities',
  mapProviderBaiduDesc: 'Widely used across China',

  // settings
  settingsTitle: 'Settings',
  settingsMapProvider: 'Map Provider',
  settingsMapProviderDesc:
    'Affects restaurant search, navigation links, and reverse geocoding.',
  settingsLanguage: 'Language',
  settingsLanguageDesc: 'Switch the display language.',
  settingsTheme: 'Appearance',
  settingsThemeDesc: 'Switch between light and dark mode. Auto follows the system setting.',
  themeAuto: 'Auto',
  themeLight: 'Light',
  themeDark: 'Dark',
};

const zh: typeof en = {
  dateLocale: 'zh-CN' as string,

  navHome: '首页',
  navRecommend: '推荐',
  navAdd: '添加',
  navSettings: '设置',
  navMap: '地图',
  navGettingLocation: '正在获取位置...',

  locationPlaceholder: '输入您的位置...',
  locationGo: '确认',
  locationNetworkError: '网络错误，请重试。',
  locationNotFound: '未找到该地址。',
  locationUseCurrentTitle: '使用当前位置',

  recommendSetLocation: '未获取到位置。',
  recommendLocateButton: '点击开启定位',
  recommendFinding: '正在查找附近餐厅...',
  recommendFailed: '加载推荐失败。',
  recommendRefresh: '刷新',
  recommendNoResults: (km: number) => `附近 ${km} 公里内没有餐厅。`,

  cardLastVisited: '上次到访',
  cardNotVisitedYet: '尚未到访',

  listLoading: '加载中...',
  listEmpty: '还没有添加任何餐厅。',
  badgeVisited: '已到访',
  badgeNotYet: '未到访',

  formSearchTab: '按名称搜索',
  formLinkTab: '粘贴链接',
  formRestaurantName: '餐厅名称',
  formSearchPlaceholder: '例如：海底捞、麦当劳...',
  formSearch: '搜索',
  formNoResults: '未找到餐厅，请换个关键词试试。',
  formNetworkError: '网络错误，请重试。',
  formSearchFailed: '搜索失败。',
  formLookingUp: (provider: string) => `正在 ${provider} 上查找...`,
  formPasteLink: '粘贴分享链接',
  formLinkPlaceholder: '高德或百度地图分享链接...',
  formParse: '解析',
  formParseFailed: '解析链接失败。',
  formHaveYouBeen: '是否已到访？',
  formVisited: '已到访',
  formNotYet: '尚未到访',
  formDateVisited: '到访日期',
  formRating: '评分',
  formNotes: '备注',
  formOptional: '可选',
  formNotesPlaceholder: '推荐菜品、印象...',
  formDuplicate: '该餐厅已在您的收藏中。',
  formSaveFailed: '保存失败。',
  formSave: '保存',
  formSavedSuccess: '保存成功！',
  formAddAnother: '继续添加',

  crossNoMatch: (label: string) => `在 ${label} 上未找到匹配`,
  crossNoMatchDesc: (label: string) =>
    `该餐厅将在没有 ${label} 支持的情况下添加，您可以稍后关联。`,
  crossContinueAnyway: '仍然继续',
  crossSelectOn: (label: string) => `在 ${label} 上选择`,
  crossMultipleMatches: '找到多个匹配项，请选择正确的一个。',
  crossSkip: (label: string) => `跳过 — 不关联 ${label}`,

  mapProviderAmapLabel: '高德地图',
  mapProviderBaiduLabel: '百度地图',

  mapProviderChoose: '选择地图提供商',
  mapProviderDesc: '影响搜索、导航链接和位置服务。您可以在设置中更改。',
  mapProviderAmapDesc: '小城市覆盖更好',
  mapProviderBaiduDesc: '在中国广泛使用',

  settingsTitle: '设置',
  settingsMapProvider: '地图提供商',
  settingsMapProviderDesc: '影响餐厅搜索、导航链接和逆地理编码。',
  settingsLanguage: '语言',
  settingsLanguageDesc: '切换界面显示语言。',
  settingsTheme: '外观',
  settingsThemeDesc: '切换亮色和暗色模式。自动跟随系统设置。',
  themeAuto: '自动',
  themeLight: '亮色',
  themeDark: '暗色',
};

export const translations = { en, zh } as const;
