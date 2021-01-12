//import Item from './item'

import { styles } from '../../shared/styles/devportal.css';

import NameValue from '../../components/name-value';

function List({ data, state, refetch }) {
    switch (state) {
      case 'loading': {
        return <p>Loading...</p>;
      }
      case 'error': {
        return <p>Error!</p>;
      }
      case 'loaded': {
        if (!data) {
              return <p>Ooops, something went wrong!</p>
        }
        console.log(JSON.stringify(data, null, 4))
        return (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.allDatasetGroups.map((item, index) => (
                <li style={styles.listItem}>
                    <NameValue name="Organization" value={(item.organization ? item.organization.title : "-") + " / " + (item.organizationUnit ? item.organizationUnit.title : "-")} width="300px"/>
                    <NameValue name="Family" value={item.name} width="300px"/>
                    <NameValue name="Auth Method" value={item.authMethod} width="250px"/>
                    <NameValue name="Service Routes" value={item.services.map(s => ( <div>{s.name} : <a href={s.host}>{s.host}</a></div> )) } width="400px"/>
                </li>
            ))}
          </ul>
        );
      }
    }
    return (<></>)
  }

  export default List