export const GET_LIST = `
    query GET($first: Int, $skip: Int) {
      getFilteredNamespaceActivity( first:$first, skip: $skip) {
          id
          message
          params
          activityAt
          blob {
            id
          }
        }
    }
`;

const empty = () => false;
export default empty;
