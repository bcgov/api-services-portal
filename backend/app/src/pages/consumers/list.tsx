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
            {data.allConsumers.map((item, index) => (
                <li style={styles.listItem}>
                    <NameValue name="Name" value={item.name} width="300px"/>
                </li>
            ))}
          </ul>
        );
      }
    }
    return (<></>)
  }

  export default List