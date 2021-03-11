//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import NameValue from '@/components/name-value';

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
            {data.allCredentialIssuers.map((item, index) => (
                <li key={item.name} style={styles.listItem}>
                    <NameValue name="Name" value={item.name} width="300px"/>
                    <NameValue name="Auth Method" value={item.authMethod} width="200px"/>
                    <NameValue name="Mode" value={item.mode} width="150px"/>
                    <NameValue name="Contact" value={item.contact.name} width="200px"/>
                    <NameValue name="API Families Using" value={item.environments.map(g => g.name)} width="400px"/>
                </li>
            ))}
          </ul>
        );
      }
    }
    return (<></>)
  }

  export default List