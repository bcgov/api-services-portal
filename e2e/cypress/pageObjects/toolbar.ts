class ToolBar {
  optionList = '/html[1]/body[1]/div[1]/nav[1]/ul[1]'
  directory: string = this.optionList + '/li[1]'
  apiAccess: string = this.optionList + '/li[2]'
  applications: string = this.optionList + '/li[3]'
  namespaces: string = this.optionList + '/li[4]'
  documentation: string = this.optionList + '/li[5]'
}

export default ToolBar
