class MyProfilePage {
    path: string = '/poc/my-profile'
    userProfile: string = '[data-testid=my_profile_json]'

    checkScopeOfProfile(expScope : string): void {
        var obj: any
        let scope : string
        cy.get(this.userProfile).then(($ele) => {
          obj = JSON.parse($ele.get(0).innerText)
          expect(obj.scopes[0]).eq(expScope)
        })
      }
}

export default MyProfilePage