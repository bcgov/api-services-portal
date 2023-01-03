class GatewayServicePage {

  path: string = '/manager/services'
  userNameInput: string = '[data-testid="nsa-gua-email-field"]'
  grantUserAccessBtn: string = '[data-testid="nsa-grant-access-btn"]'
  // serviceTable: string = '[data-testid="matrixDetailsTable"]'
  serviceTable: string = '[role="table"]'
  clearAllFilterBtn: string = '[data-testid="btn-filter-clear-all"]'
  filterType: string = '[data-testid="filter-type-select"]'
  filterValue: string = '[data-testid="consumer-filters-select"]'
  filterApplyBtn: string = '[data-testid="btn-filter-apply"]'

  getTestIdEnvName(env: string): string {
    switch (env) {
      case "Development":
        return "dev"
      case "Production":
        return "prod"
      default:
        return env.toLowerCase()
    }
  }

  expandServiceDetails(productName: string, envName: string) {
    let pname: string = productName.toLowerCase().replaceAll(' ', '-')
    let env = this.getTestIdEnvName(envName);
    cy.get(`[data-testid=${pname}-${env}-metrics-details]`).click()
  }

  verifyRequestCount(productName: string, envName: string, count: number) {
    let pname: string = productName.toLowerCase().replaceAll(' ', '-')
    let env = this.getTestIdEnvName(envName);
    cy.get(`[data-testid=${pname}-${env}-totalRequest]`).then(($value) => {
      let countValue = $value.text()
      assert.equal(countValue, count.toString())
    })
  }

  verifyHostName(hostName: string) {
    cy.contains('Host').next('dd').then(($value) => {
      let hostValue = $value.text()
      assert.equal(hostValue, hostName)
    })
  }

  verifyTagsName(tagsName: string) {
    cy.contains('Tags').next('dd').find('span').then(($value) => {
      let hostValue = $value.text()
      assert.equal(hostValue, tagsName)
    })
  }

  verifyRouteName(service: string, route: string) {
    cy.get(`[data-testid^=${service}-service-details`).then(($value) => {
      let routeValue = $value.text()
      assert.equal(routeValue, route)
    })
  }

  verifyFilterResultsForGatewayService(filterType: string, filterValue: string, expectedResult: string, labelValue?: any) {
    cy.wait(2000)
    this.filterGatewayServiceByTypeAndValue(filterType, filterValue)
    cy.wait(2000)
    cy.get(this.serviceTable).find("tbody").find("tr").then((row) => {
      expect(row.length.toString()).eq(expectedResult)
      if (filterType === 'Environment') {
        let environment = row.find('td:nth-child(2)').find('span').text()
        assert.equal(environment,filterValue)
      }
    })

  }

  filterGatewayServiceByTypeAndValue(type: string, value: string) {
    cy.get("body").then($body => {
      if ($body.find(this.clearAllFilterBtn).length > 0) {
        cy.get(this.clearAllFilterBtn, { timeout: 2000 }).click()
      }
    });
    cy.get(this.filterType).select(type).invoke('val')
    cy.get(this.filterValue).select(value).invoke('val')
    cy.get(this.filterApplyBtn).click()
  }
}
export default GatewayServicePage