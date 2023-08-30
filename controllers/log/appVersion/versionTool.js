import axios, { AxiosError } from "axios";

export class VersionTool {
  versionList = [];
  autoUpdater = null;

  constructor() {
    this.updateGitHubVersion();
    this.initAutoUpdater();
  }

  async updateGitHubVersion() {
    try {
      let releaseVersions = await axios.get("https://api.github.com/repos/czy0729/Bangumi/releases")
      this.versionList = [];
      for (let index in releaseVersions.data) {
        let version = releaseVersions.data[index];
        this.versionList.push(version.tag_name);

        // 只取最新的 5 个版本
        if (index >= 4) break;
      }
      console.log('✅ 已抓取 GitHub Release 版本。最新的 5 个版本是:', this.versionList);
      return this.versionList;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("抓取 GitHub Release 失败: ", error.code, error.message);
      } else {
        console.error("抓取 GitHub Release 发生非网络错误: ", error);
      }
      return null;
    }
  }

  initAutoUpdater() {
    this.autoUpdater = setInterval(async () => {
      let result = await this.updateGitHubVersion();

      if (result == null) {
        setTimeout(() => {
          this.updateGitHubVersion();
          console.log("由于刚刚的抓取失败正在重试...");
        }, 5000)
      }
    }, 1000 * 60 * 60)
  }

  clearAutoUpdater() {
    clearImmediate(this.autoUpdater);
    this.autoUpdater = null;
  }


  /**
   * 获取与最新版本距离几个版本
   * @param {String} version 
   * @returns {Number} 距离的版本数, -1 表示不可用
   */
  getLatestDistance(version) {
    if (this.versionList.length > 0 && version) {
      for (let i = 0; i < this.versionList.length; i++) {
        if (this.versionList[i] == version) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * 获取最新版本
   * @returns {String|null}
   */
  getLatestVersion() {
    if (this.versionList.length > 0) {
      return this.versionList[0];
    }
    return null;
  }

  getVersionList() {
    return this.versionList;
  }
}