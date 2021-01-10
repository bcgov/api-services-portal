import Item from './item'

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
            {data.allAccessRequests.map((item, index) => (
              <Item accessRequest={item} refetch={refetch} key={index} />
            ))}
          </ul>
        );
      }
    }
  }

  export default List